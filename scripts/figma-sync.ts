/**
 * npm run figma:sync -- payload [out.json]     Build the Figma push payload from the repo
 * npm run figma:sync -- scripts [dir]          Write the use_figma scripts for a full push (run in order)
 * npm run figma:sync -- record <fileKey> <url> Record a completed push in figma/sync-manifest.json
 * npm run figma:sync -- check                  Exit 1 if tokens or metadata changed since the last push
 *
 * Tokens flow one way: tokens/ and components/*.meta.json → Figma (FR-2, BR-4). Nothing
 * is ever read back from Figma. The push itself runs through the Figma MCP (use_figma),
 * which CI cannot call, so the manifest records what was pushed and a test
 * (checks/figma/tests/drift.test.ts) fails when the repo moves on without a new push.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

interface RawToken {
  name: string;
  tier: string;
  value?: string;
  reference?: string;
  description?: string;
}

export type VarType = 'COLOR' | 'FLOAT' | 'STRING';

export interface PushVariable {
  name: string;
  css: string;
  type: VarType;
  scopes: string[];
  description: string;
  /** Per mode: a literal (hex, number or string) or { alias: primitive variable name }. */
  values: Record<string, string | number | { alias: string }>;
}

export interface PushCollection {
  name: string;
  modes: string[];
  variables: PushVariable[];
}

export interface PushTextStyle {
  name: string;
  family: string;
  weight: number;
  size: number;
  lineHeight: number;
  letterSpacingPercent: number;
  uppercase: boolean;
}

export interface PushEffectStyle {
  name: string;
  shadows: Array<{ x: number; y: number; blur: number; spread: number; r: number; g: number; b: number; a: number }>;
}

export interface PushComponent {
  id: string;
  name: string;
  purpose: string;
  variants: string[];
  states: string[];
  storyUrl: string;
}

export interface PushPayload {
  collections: PushCollection[];
  textStyles: PushTextStyle[];
  effectStyles: PushEffectStyle[];
  components: PushComponent[];
}

const here = dirname(fileURLToPath(import.meta.url));
const REPO = join(here, '..');
const REM = 16;

const read = (root: string, file: string): RawToken[] =>
  (JSON.parse(readFileSync(join(root, 'tokens', file), 'utf8')) as { tokens: RawToken[] }).tokens;

/** Token name → Figma variable path: color-text-primary → color/text/primary. */
export function figmaName(token: string): string {
  const parts = token.split('-');
  if (parts[0] === 'color' && parts.length > 2) return `color/${parts[1]}/${parts.slice(2).join('-')}`;
  return `${parts[0]}/${parts.slice(1).join('-')}`;
}

function parseValue(name: string, v: string): { type: VarType; value: string | number } {
  if (v.startsWith('#')) return { type: 'COLOR', value: v.toLowerCase() };
  if (/^-?[\d.]+px$/.test(v)) return { type: 'FLOAT', value: parseFloat(v) };
  if (/^-?[\d.]+rem$/.test(v)) return { type: 'FLOAT', value: parseFloat(v) * REM };
  if (/^-?[\d.]+em$/.test(v)) return { type: 'FLOAT', value: Math.round(parseFloat(v) * 1000) / 10 };
  if (/^-?[\d.]+ms$/.test(v)) return { type: 'FLOAT', value: parseFloat(v) };
  if (/^-?[\d.]+%$/.test(v)) return { type: 'FLOAT', value: parseFloat(v) };
  if (/^-?[\d.]+$/.test(v)) return { type: 'FLOAT', value: parseFloat(v) };
  if (name.startsWith('font-family'))
    return { type: 'STRING', value: (v.split(',')[0] ?? v).replace(/['"]/g, '').trim() };
  return { type: 'STRING', value: v };
}

/** Where the variable can be applied in Figma; code-only tokens are hidden ([]). */
export function scopesFor(name: string, type: VarType, tier: string): string[] {
  if (tier === 'primitive') return [];
  if (type === 'COLOR') {
    if (/^color-(text|on-)|^color-tooltip-text|-text$/.test(name)) return ['TEXT_FILL'];
    if (/^color-border|focus-ring/.test(name)) return ['STROKE_COLOR'];
    return ['FRAME_FILL', 'SHAPE_FILL'];
  }
  if (/^space-/.test(name)) return ['GAP'];
  if (/^size-|^layout-(gutter|margin)/.test(name)) return ['WIDTH_HEIGHT'];
  if (/^radius-/.test(name)) return ['CORNER_RADIUS'];
  if (/^border-width/.test(name)) return ['STROKE_FLOAT'];
  if (/^opacity-/.test(name)) return ['OPACITY'];
  if (/^(font-size|type-.*-size)/.test(name)) return ['FONT_SIZE'];
  if (/^(font-weight|type-.*-weight)/.test(name)) return ['FONT_WEIGHT'];
  if (/^(font-family|type-.*-family)/.test(name)) return ['FONT_FAMILY'];
  return [];
}

function shadowList(v: string): PushEffectStyle['shadows'] {
  if (v === 'none') return [];
  return v.split(/,(?![^(]*\))/).map((part) => {
    const m =
      /(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?\s+rgba?\(([^)]+)\)/.exec(
        part.trim(),
      );
    if (!m) throw new Error(`cannot parse shadow "${part}"`);
    const [r, g, b, a] = (m[5] ?? '').split(',').map((x) => parseFloat(x));
    return {
      x: parseFloat(m[1] ?? '0'),
      y: parseFloat(m[2] ?? '0'),
      blur: parseFloat(m[3] ?? '0'),
      spread: parseFloat(m[4] ?? '0'),
      r: (r ?? 0) / 255,
      g: (g ?? 0) / 255,
      b: (b ?? 0) / 255,
      a: a ?? 1,
    };
  });
}

const pascal = (id: string) =>
  id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

export function buildPayload(root = REPO, storybookBase = 'https://storybook.local'): PushPayload {
  const primitives = read(root, 'primitives.json');
  const semantic = read(root, 'semantic.json');
  const theme = (f: string) => read(root, join('themes', f));
  const primByName = new Map(primitives.map((t) => [t.name, t]));
  const isShadow = (n: string) => /^(shadow|elevation)-/.test(n);

  const primitiveVars: PushVariable[] = primitives
    .filter((t) => !isShadow(t.name))
    .map((t) => {
      const p = parseValue(t.name, t.value ?? '');
      // Figma reads opacity variables as percentages (0–100); CSS uses 0–1.
      if (t.name.startsWith('opacity-') && typeof p.value === 'number') p.value = Math.round(p.value * 10000) / 100;
      return {
        name: figmaName(t.name),
        css: `var(--${t.name})`,
        type: p.type,
        scopes: [],
        description: t.description ?? '',
        values: { Value: p.value },
      };
    });

  const refType = (ref: string): VarType => parseValue(ref, primByName.get(ref)?.value ?? '').type;
  const alias = (ref: string) => ({ alias: figmaName(ref) });
  const overrides = (f: string) => new Map(theme(f).map((t) => [t.name, t.reference ?? '']));
  const dark = overrides('dark.json');
  const hc = overrides('high-contrast.json');
  const compact = overrides('compact.json');

  const semanticVars = semantic.filter((t) => !isShadow(t.name) && t.reference && primByName.has(t.reference));
  const colourVars: PushVariable[] = [];
  const otherVars: PushVariable[] = [];
  for (const t of semanticVars) {
    const ref = t.reference ?? '';
    const type = refType(ref);
    const base = {
      name: figmaName(t.name),
      css: `var(--${t.name})`,
      type,
      scopes: scopesFor(t.name, type, 'semantic'),
      description: t.description ?? '',
    };
    if (type === 'COLOR') {
      colourVars.push({
        ...base,
        values: {
          Light: alias(ref),
          Dark: alias(dark.get(t.name) ?? ref),
          'High contrast': alias(hc.get(t.name) ?? ref),
        },
      });
    } else {
      otherVars.push({ ...base, values: { Comfortable: alias(ref), Compact: alias(compact.get(t.name) ?? ref) } });
    }
  }

  const tokenValue = (name: string): string => {
    const t = semantic.find((x) => x.name === name) ?? primByName.get(name);
    if (!t) throw new Error(`unknown token ${name}`);
    if (t.value !== undefined) return t.value;
    return tokenValue(t.reference ?? '');
  };

  const roles = [
    'display',
    'h1',
    'h2',
    'h3',
    'h4',
    'subtitle',
    'body1',
    'body2',
    'button',
    'label',
    'caption',
    'overline',
  ];
  const textStyles: PushTextStyle[] = roles.map((role) => {
    const size = parseValue('x', tokenValue(`type-${role}-size`)).value as number;
    const lh = parseValue('x', tokenValue(`type-${role}-line-height`)).value as number;
    const ls = semantic.some((t) => t.name === `type-${role}-letter-spacing`)
      ? (parseValue('x', tokenValue(`type-${role}-letter-spacing`)).value as number)
      : 0;
    return {
      name: `Type/${role}`,
      family: (parseValue('font-family', tokenValue(`type-${role}-family`)).value as string).trim(),
      weight: parseValue('x', tokenValue(`type-${role}-weight`)).value as number,
      size,
      lineHeight: lh < 4 ? Math.round(lh * size * 100) / 100 : lh,
      letterSpacingPercent: ls,
      uppercase: role === 'overline',
    };
  });

  const effectStyles: PushEffectStyle[] = [0, 1, 2, 3, 4].map((level) => ({
    name: `Elevation/${level}`,
    shadows: shadowList(tokenValue(`elevation-${level}`)),
  }));

  const components: PushComponent[] = readdirSync(join(root, 'components'))
    .filter((id) => existsSync(join(root, 'components', id, `${id}.meta.json`)))
    .sort()
    .map((id) => {
      const meta = JSON.parse(readFileSync(join(root, 'components', id, `${id}.meta.json`), 'utf8')) as {
        purpose: string;
        variants: string[];
        states: string[];
      };
      return {
        id,
        name: pascal(id),
        purpose: meta.purpose,
        variants: meta.variants,
        states: meta.states,
        storyUrl: `${storybookBase}/?path=/story/usage-${id}--guidelines`,
      };
    });

  return {
    collections: [
      { name: 'Primitives', modes: ['Value'], variables: primitiveVars },
      { name: 'Color', modes: ['Light', 'Dark', 'High contrast'], variables: colourVars },
      { name: 'Semantic', modes: ['Comfortable', 'Compact'], variables: otherVars },
    ],
    textStyles,
    effectStyles,
    components,
  };
}

/** The use_figma scripts for a full push: foundations from the payload, components from figma/push/. */
export function buildPushScripts(payload: PushPayload, root = REPO): Record<string, string> {
  const [P, C, S] = payload.collections as [PushCollection, PushCollection, PushCollection];
  const alias = (v: PushVariable, m: string) => (v.values[m] as { alias: string }).alias;
  const figmaFamily = (f: string) => f.replace('Saira Semi Condensed', 'Saira SemiCondensed');
  const prim = P.variables.map((v) => [
    v.name,
    v.type[0],
    v.type === 'STRING' ? figmaFamily(String(v.values['Value'])) : v.values['Value'],
  ]);
  const col = C.variables.map((v) => [v.name, v.scopes, C.modes.map((m) => alias(v, m)), v.description]);
  const sem = S.variables.map((v) => [
    v.name,
    v.type[0],
    v.scopes,
    alias(v, 'Comfortable'),
    alias(v, 'Compact') === alias(v, 'Comfortable') ? 0 : alias(v, 'Compact'),
    v.description.slice(0, 90),
  ]);
  const ts = payload.textStyles.map((t) => [
    t.name,
    figmaFamily(t.family),
    t.weight,
    t.size,
    t.lineHeight,
    t.letterSpacingPercent,
    t.uppercase,
  ]);
  const es = payload.effectStyles.map((e) => [
    e.name,
    e.shadows.map((x) => [x.x, x.y, x.blur, x.spread, +x.r.toFixed(4), +x.g.toFixed(4), +x.b.toFixed(4), x.a]),
  ]);
  const j = (x: unknown) => JSON.stringify(x);
  const css = `const css=n=>'var(--'+n.replace(/\\//g,'-')+')';const T={C:'COLOR',F:'FLOAT',S:'STRING'};`;
  const scripts: Record<string, string> = {};
  // Incremental: every collection, mode, variable and style is looked up by name first, so a
  // push to the live library adds what is missing and updates values, never duplicating.
  const up = `const COLS=await figma.variables.getLocalVariableCollectionsAsync();const ALLV=await figma.variables.getLocalVariablesAsync();
const coll=(name,modes)=>{let c=COLS.find(x=>x.name===name);if(!c){c=figma.variables.createVariableCollection(name);c.renameMode(c.modes[0].modeId,modes[0]);for(const m of modes.slice(1))c.addMode(m);}return [c,modes.map(n=>c.modes.find(m=>m.name===n).modeId)];};
let ADDED=0;const upsert=(c,n,type)=>{let v=ALLV.find(x=>x.variableCollectionId===c.id&&x.name===n);if(!v){v=figma.variables.createVariable(n,c,type);ADDED++;}return v;};`;
  scripts['01-primitives-color.js'] = `const PRIM=${j(prim)};const COL=${j(col)};${css}${up}
const hex=h=>{h=h.replace('#','');return {r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255};};
const [prim,[pm]]=coll('Primitives',['Value']);const by={};
for(const [n,t,v] of PRIM){const x=upsert(prim,n,T[t]);x.scopes=[];x.setVariableCodeSyntax('WEB',css(n));x.setValueForMode(pm,t==='C'?hex(v):v);by[n]=x;}
const [col,modes]=coll('Color',['Light','Dark','High contrast']);
for(const [n,scopes,al,d] of COL){const x=upsert(col,n,'COLOR');x.scopes=scopes;x.description=d;x.setVariableCodeSyntax('WEB',css(n));al.forEach((a,i)=>x.setValueForMode(modes[i],{type:'VARIABLE_ALIAS',id:by[a].id}));}
return {primitives:PRIM.length,colors:COL.length,added:ADDED};`;
  scripts['02-semantic-styles.js'] = `const SEM=${j(sem)};const TS=${j(ts)};const ES=${j(es)};${css}${up}
const prim=COLS.find(c=>c.name==='Primitives');const by={};
for(const v of ALLV)if(v.variableCollectionId===prim.id)by[v.name]=v;
const [sem,[m1,m2]]=coll('Semantic',['Comfortable','Compact']);
for(const [n,t,sc,a1,a2,d] of SEM){const x=upsert(sem,n,T[t]);x.scopes=sc;x.description=d;x.setVariableCodeSyntax('WEB',css(n));x.setValueForMode(m1,{type:'VARIABLE_ALIAS',id:by[a1].id});x.setValueForMode(m2,{type:'VARIABLE_ALIAS',id:by[a2||a1].id});}
const W={400:'Regular',500:'Medium',600:'SemiBold',700:'Bold'};const HAVE_TS=await figma.getLocalTextStylesAsync();const HAVE_ES=await figma.getLocalEffectStylesAsync();
for(const [name,fam,w,size,lh,ls,up] of TS){const f={family:fam,style:W[w]};await figma.loadFontAsync(f);const s=HAVE_TS.find(x=>x.name===name)||figma.createTextStyle();s.name=name;s.fontName=f;s.fontSize=size;s.lineHeight={unit:'PIXELS',value:lh};s.letterSpacing={unit:'PERCENT',value:ls};s.textCase=up?'UPPER':'ORIGINAL';}
for(const [name,sh] of ES){const s=HAVE_ES.find(x=>x.name===name)||figma.createEffectStyle();s.name=name;s.effects=sh.map(([x,y,blur,spread,r,g,b,a])=>({type:'DROP_SHADOW',color:{r,g,b,a},offset:{x,y},radius:blur,spread,visible:true,blendMode:'NORMAL'}));}
return {semantic:SEM.length,textStyles:TS.length,effectStyles:ES.length,added:ADDED};`;
  const iconSrc = readFileSync(join(root, 'components', 'icon', 'icons.generated.ts'), 'utf8');
  const paths = Object.fromEntries([...iconSrc.matchAll(/^ {2}(\w+): '([^']+)',$/gm)].map((m) => [m[1], m[2]]));
  scripts['03-pages-icons.js'] =
    `const P=${j(paths)};const PAGES=['Cover','Foundations','Icons','Layout','Actions','Inputs','Feedback','Overlays','Navigation','Data display'];
if(figma.root.children[0].name==='Page 1')figma.root.children[0].name='Cover';for(const n of PAGES)if(!figma.root.children.find(p=>p.name===n)){const p=figma.createPage();p.name=n;}
PAGES.forEach((n,i)=>{const p=figma.root.children.find(x=>x.name===n);if(p&&figma.root.children.indexOf(p)!==i)figma.root.insertChild(i,p);});
const icons=figma.root.children.find(p=>p.name==='Icons');await figma.setCurrentPageAsync(icons);const tp=(await figma.variables.getLocalVariablesAsync()).find(v=>v.name==='color/text/primary');
const GLY_HAVE=new Set(icons.findAllWithCriteria({types:['COMPONENT']}).map(c=>c.name));
let grid=icons.findChild(n=>n.name==='Icon glyphs');if(!grid){grid=figma.createAutoLayout('HORIZONTAL',{name:'Icon glyphs',itemSpacing:16,counterAxisSpacing:16,paddingLeft:32,paddingRight:32,paddingTop:32,paddingBottom:32});grid.layoutWrap='WRAP';grid.primaryAxisSizingMode='FIXED';grid.resize(800,100);grid.counterAxisSizingMode='AUTO';}
for(const [name,d] of Object.entries(P)){if(GLY_HAVE.has('Glyph/'+name))continue;const svg=figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960"><path d="'+d+'"/></svg>');const c=figma.createComponent();c.name='Glyph/'+name;c.resize(24,24);c.fills=[];
for(const ch of [...svg.children]){c.appendChild(ch);ch.constraints={horizontal:'SCALE',vertical:'SCALE'};if('fills' in ch)ch.fills=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',tp)];}svg.remove();grid.appendChild(c);}
return {glyphs:Object.keys(P).length};`;
  const lib = readFileSync(join(root, 'figma', 'push', 'lib.js'), 'utf8');
  ['actions', 'inputs', 'feedback', 'overlays', 'navigation', 'data', 'layout'].forEach((area, i) => {
    scripts[`${String(i + 4).padStart(2, '0')}-${area}.js`] = readFileSync(
      join(root, 'figma', 'push', `${area}.js`),
      'utf8',
    ).replace('//LIB', lib);
  });
  return scripts;
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 16);

/** Hashes of everything that is pushed: the token files, and each component's metadata. */
export function sourceHashes(root = REPO): { tokens: string; components: Record<string, string> } {
  const tokenFiles = [
    'primitives.json',
    'semantic.json',
    ...readdirSync(join(root, 'tokens', 'themes'))
      .sort()
      .map((f) => `themes/${f}`),
  ];
  const tokens = sha(tokenFiles.map((f) => readFileSync(join(root, 'tokens', f), 'utf8')).join('\n'));
  const components: Record<string, string> = {};
  for (const id of readdirSync(join(root, 'components')).sort()) {
    const file = join(root, 'components', id, `${id}.meta.json`);
    if (!existsSync(file)) continue;
    const m = JSON.parse(readFileSync(file, 'utf8')) as { purpose: string; variants: string[]; states: string[] };
    components[id] = sha(JSON.stringify({ purpose: m.purpose, variants: m.variants, states: m.states }));
  }
  return { tokens, components };
}

export interface SyncManifest {
  fileKey: string;
  fileUrl: string;
  pushedAt: string;
  counts: { variables: number; textStyles: number; effectStyles: number; components: number };
  hashes: { tokens: string; components: Record<string, string> };
}

export const MANIFEST = join('figma', 'sync-manifest.json');

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(thisFile).ino) {
  const [cmd, a, b] = process.argv.slice(2);
  const payload = buildPayload();
  if (cmd === 'payload') {
    const out = a ?? join(REPO, 'generated', 'figma-payload.json');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(payload));
    const vars = payload.collections.reduce((n, c) => n + c.variables.length, 0);
    console.log(
      `figma:sync payload → ${out}: ${vars} variables, ${payload.textStyles.length} text styles, ${payload.effectStyles.length} effect styles, ${payload.components.length} components`,
    );
  } else if (cmd === 'scripts') {
    const out = a ?? join(REPO, 'generated', 'figma-push');
    mkdirSync(out, { recursive: true });
    const scripts = buildPushScripts(payload);
    for (const [name, code] of Object.entries(scripts)) writeFileSync(join(out, name), code);
    console.log(`figma:sync scripts → ${out}: ${Object.keys(scripts).join(', ')} (run each with use_figma, in order)`);
  } else if (cmd === 'record' && a && b) {
    const manifest: SyncManifest = {
      fileKey: a,
      fileUrl: b,
      pushedAt: new Date().toISOString().slice(0, 10),
      counts: {
        variables: payload.collections.reduce((n, c) => n + c.variables.length, 0),
        textStyles: payload.textStyles.length,
        effectStyles: payload.effectStyles.length,
        components: payload.components.length,
      },
      hashes: sourceHashes(),
    };
    mkdirSync(join(REPO, 'figma'), { recursive: true });
    writeFileSync(join(REPO, MANIFEST), JSON.stringify(manifest, null, 2) + '\n');
    console.log(`figma:sync recorded the push to ${b}`);
  } else if (cmd === 'check') {
    const manifest = JSON.parse(readFileSync(join(REPO, MANIFEST), 'utf8')) as SyncManifest;
    const now = sourceHashes();
    const drift = [
      ...(manifest.hashes.tokens !== now.tokens ? ['tokens'] : []),
      ...Object.keys({ ...now.components, ...manifest.hashes.components }).filter(
        (id) => manifest.hashes.components[id] !== now.components[id],
      ),
    ];
    if (drift.length) {
      console.error(`Figma is behind the repo for: ${drift.join(', ')}. Push again and run figma:sync -- record.`);
      process.exit(1);
    }
    console.log('figma:sync: Figma is in step with the repo');
  } else {
    console.error('Usage: figma:sync -- payload [out] | record <fileKey> <url> | check');
    process.exit(2);
  }
}
