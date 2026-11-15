const page=figma.root.children.find(p=>p.name==='Data display');await figma.setCurrentPageAsync(page);
//LIB
const cell=async(s,w,o={})=>{const c=row();c.name=o.head?'Header cell':'Cell';c.resize(w,40);c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';bind(c,'height','size/control-md');pad(c,'space/component-padding-md');bind(c,'itemSpacing','space/component-padding-xs');if(o.end)c.primaryAxisAlignItems='MAX';
  if(o.node)c.appendChild(o.node);else c.appendChild(await txt(s,o.head?'overline':'body2',o.head?'color/text/secondary':'color/text/primary'));if(o.sort)c.appendChild(icon('keyboard_arrow_up','sm','color/text/link'));return c;};
const checkbox=(on,mixed)=>{const b=figma.createFrame();b.name='Checkbox';b.resize(20,20);b.layoutMode='HORIZONTAL';b.primaryAxisSizingMode='FIXED';b.counterAxisSizingMode='FIXED';b.primaryAxisAlignItems='CENTER';b.counterAxisAlignItems='CENTER';
  if(on||mixed){fill(b,'color/interactive/default');b.appendChild(icon(mixed?'remove':'check_small','sm','color/text/inverse'));}else{fill(b,'color/background/surface');stroke(b,'color/border/input','border/width-control');}return b;};
const badge=async(l,tone)=>{const b=row();square(b);bind(b,'paddingLeft','space/component-padding-xs');bind(b,'paddingRight','space/component-padding-xs');fill(b,'color/container/'+tone);b.appendChild(await txt(l,'caption','color/on/container-'+tone));b.name='Badge';return b;};
await makeSet('table','Table','Rows of records in columns, to compare, sort and choose them.',['none','single','multiple'],['default'],async(v)=>{
  const c=C('VERTICAL');stroke(c,'color/border/default');fill(c,'color/background/surface');
  const cols=[['Name',160],['Owner',120],['Status',120],['Updated',140]];
  const head=row();head.name='Header row';fill(head,'color/background/sunken');c.appendChild(head);head.strokes=[paint('color/border/input')];head.strokeBottomWeight=1;head.strokeTopWeight=0;head.strokeLeftWeight=0;head.strokeRightWeight=0;
  if(v==='multiple')head.appendChild(await cell('',52,{node:checkbox(false,true)}));
  for(const [i,[l,w]] of cols.entries())head.appendChild(await cell(l,w,{head:true,sort:i===0,end:i===3}));
  for(const [i,r] of [['Agents','Team','Live','2026-11-09'],['Rules','Om','Draft','2026-11-14'],['Tokens','Om','Live','2026-11-12']].entries()){
    const sel=v!=='none'&&i===1;const rw=row();rw.name=sel?'Row (selected)':'Row';if(sel)fill(rw,'color/container/primary');c.appendChild(rw);if(i<2){rw.strokes=[paint('color/border/default')];rw.strokeBottomWeight=1;rw.strokeTopWeight=0;rw.strokeLeftWeight=0;rw.strokeRightWeight=0;}
    if(v==='multiple')rw.appendChild(await cell('',52,{node:checkbox(sel)}));
    rw.appendChild(await cell(r[0],160));rw.appendChild(await cell(r[1],120));rw.appendChild(await cell('',120,{node:await badge(r[2],r[2]==='Live'?'success':'warning')}));rw.appendChild(await cell(r[3],140,{end:true}));}
  return c;},{width:1900});
await makeSet('list','List','A vertical list of similar items, with a title, description, icon and trailing detail.',['static','interactive'],['default'],async(v)=>{
  const c=C('VERTICAL');c.counterAxisSizingMode='FIXED';c.resize(360,100);c.primaryAxisSizingMode='AUTO';
  for(const [i,[t,d,m,ic]] of [['Tokens','Updated 2 days ago','161','settings'],['Rules','Updated today','24','filter_list'],['Components','Updated today','42','content_copy']].entries()){
    const r=row();r.name=v==='interactive'&&i===1?'Item (selected)':'Item';c.appendChild(r);fillW(r);r.counterAxisSizingMode='AUTO';pad(r,'space/component-padding-md','space/component-padding-sm');bind(r,'itemSpacing','space/component-gap-md');
    r.strokes=[paint('color/border/default')];r.strokeBottomWeight=1;r.strokeTopWeight=i===0?1:0;r.strokeLeftWeight=0;r.strokeRightWeight=0;
    const sel=v==='interactive'&&i===1;if(sel)fill(r,'color/container/primary');
    r.appendChild(icon(ic,'md',sel?'color/on/container-primary':'color/text/secondary'));const tx=col();r.appendChild(tx);fillW(tx);tx.appendChild(await txt(t,'label',sel?'color/on/container-primary':'color/text/primary'));tx.appendChild(await txt(d,'caption','color/text/secondary'));
    r.appendChild(await txt(m,'caption','color/text/secondary'));}
  return c;},{width:1000});
await makeSet('tag-group','TagGroup','Short keywords that label content, as static labels, filters or removable choices.',['static','selectable','removable'],['default'],async(v)=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-padding-xs');if(v==='selectable')c.appendChild(await txt('Filter by topic','label'));
  const r=row();bind(r,'itemSpacing','space/component-gap-sm');c.appendChild(r);
  for(const [i,[l,tone]] of [['React','neutral'],['Tokens','info'],['Accessibility','success'],['Beta','warning']].entries()){
    const sel=v==='selectable'&&i===1;const t=row();t.name=sel?'Tag (selected)':'Tag';t.counterAxisSizingMode='FIXED';t.resize(60,32);t.primaryAxisSizingMode='AUTO';bind(t,'height','size/control-sm');pad(t,'space/component-padding-sm');bind(t,'itemSpacing','space/component-padding-xs');square(t);
    fill(t,sel?'color/container/primary':'color/container/'+tone);stroke(t,sel?'color/border/interactive':'color/border/default');
    if(sel)t.appendChild(icon('check_small','sm','color/on/container-primary'));t.appendChild(await txt(l,'label',sel?'color/on/container-primary':'color/on/container-'+tone));if(v==='removable')t.appendChild(icon('close','sm','color/on/container-'+tone));r.appendChild(t);}
  return c;},{width:1300});
const PX={sm:24,md:32,lg:40};
const avatar=async(name,sz,tone)=>{const a=row({primaryAxisAlignItems:'CENTER'});a.name='Avatar';a.resize(PX[sz],PX[sz]);a.primaryAxisSizingMode='FIXED';a.counterAxisSizingMode='FIXED';bind(a,'width','size/avatar-'+sz);bind(a,'height','size/avatar-'+sz);square(a);fill(a,'color/container/'+tone);
  a.appendChild(await txt(name.split(' ').map(w=>w[0]).join('').slice(0,2),sz==='lg'?'label':'caption','color/on/container-'+tone));return a;};
await makeSet('avatar','Avatar',"A person's photo, or their initials on a tonal square when there is no photo.",['sm','md','lg'],['default'],async(v)=>{const c=C('HORIZONTAL');c.appendChild(await avatar('Om Hindlekar',v,'primary'));return c;},{width:600});
await makeSet('avatar-group','AvatarGroup','Overlapping avatars for the people in a project, with +n for the rest.',['sm','md','lg'],['default'],async(v)=>{
  const c=C('HORIZONTAL');c.itemSpacing=-PX[v]/4;c.itemReverseZIndex=true;
  for(const [n,t] of [['Om Hindlekar','primary'],['Ada Lovelace','warning'],['Grace Hopper','info'],['Alan Turing','success']]){const a=await avatar(n,v,t);stroke(a,'color/background/surface','border/width-focus','OUTSIDE');c.appendChild(a);}
  const more=row({primaryAxisAlignItems:'CENTER'});more.name='More';more.resize(PX[v],PX[v]);more.primaryAxisSizingMode='FIXED';more.counterAxisSizingMode='FIXED';fill(more,'color/interactive/disabled');stroke(more,'color/background/surface','border/width-focus','OUTSIDE');more.appendChild(await txt('+2','caption'));c.appendChild(more);return c;},{width:900});
await makeSet('divider','Divider','A 1px line that separates groups of content.',['horizontal','vertical'],['default'],async(v)=>{
  const c=C(v==='horizontal'?'VERTICAL':'HORIZONTAL');bind(c,'itemSpacing','space/component-gap-md');if(v==='horizontal'){c.counterAxisSizingMode='FIXED';c.resize(320,40);c.primaryAxisSizingMode='AUTO';}
  c.appendChild(await txt('Account','body2'));const d=figma.createRectangle();d.name='Line';c.appendChild(d);if(v==='horizontal'){d.resize(320,1);d.layoutSizingHorizontal='FILL';}else{d.resize(1,40);}fill(d,'color/border/default');c.appendChild(await txt('Notifications','body2'));return c;},{width:900});
await makeSet('tree','Tree','Hierarchical items such as folders and files that expand and collapse.',['none','single'],['default'],async(v)=>{
  const c=C('VERTICAL');c.counterAxisSizingMode='FIXED';c.resize(280,100);c.primaryAxisSizingMode='AUTO';
  for(const [lvl,l,kind,ic] of [[0,'components','open','filter_list'],[1,'button','open',null],[2,'button.tsx','leaf',null],[2,'button.css','leaf',null],[1,'card','leaf',null],[0,'tokens','closed','settings'],[0,'README.md','leaf','info']]){
    const sel=v==='single'&&l==='button.tsx';const r=row();r.name=sel?'Item (selected)':'Item';c.appendChild(r);fillW(r);r.counterAxisSizingMode='FIXED';r.resize(280,40);bind(r,'height','size/control-md');bind(r,'itemSpacing','space/component-padding-xs');r.paddingLeft=8+lvl*20;if(sel)fill(r,'color/container/primary');
    if(kind==='leaf'){const s=figma.createFrame();s.fills=[];s.resize(20,20);s.name='Chevron space';r.appendChild(s);}else r.appendChild(icon(kind==='open'?'keyboard_arrow_down':'keyboard_arrow_right','md','color/text/secondary'));
    if(ic)r.appendChild(icon(ic,'md','color/text/secondary'));r.appendChild(await txt(l,'body2',sel?'color/on/container-primary':'color/text/primary'));}
  return c;},{width:900});
await makeSet('image','Image','An image in a fixed aspect ratio, with a fallback tile if it fails to load.',['1:1','4:3','16:9','auto'],['default','error'],async(v,s)=>{
  const w=240,h={'1:1':240,'4:3':180,'16:9':135,auto:160}[v];const c=C('VERTICAL',{primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER'});c.resize(w,h);c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.clipsContent=true;fill(c,'color/background/sunken');
  if(s==='error'){c.appendChild(icon('report','lg','color/text/secondary'));return c;}
  c.layoutMode='NONE';const blocks=[['color/blue/700',0,0,1,1],['color/blue/900',0,0.6,1,0.4],['color/lime/300',0.65,0.15,0.14,0.25],['color/light/blue-300',0.12,0.38,0.28,0.22]];
  for(const [col,x,y,bw,bh] of blocks){const r=figma.createRectangle();c.appendChild(r);r.x=x*w;r.y=y*h;r.resize(bw*w,bh*h);fill(r,col);r.constraints={horizontal:'SCALE',vertical:'SCALE'};}return c;},{width:1200});
const ROLES=['display','h1','h2','h3','h4','subtitle','body1','body2','label','caption','overline'];
await makeSet('text','Text','Text in any role of the type scale, without writing CSS.',ROLES,['default'],async(v)=>{const c=C('HORIZONTAL');c.appendChild(await txt(v==='display'?'Tokens':'Tokens, components and rules',v,['display','h1','h2','h3','h4'].includes(v)?'color/text/heading':'color/text/primary'));return c;},{width:1600});
await makeSet('heading','Heading','A section heading at a semantic level, styled with the type scale.',['display','h1','h2','h3','h4'],['default'],async(v)=>{const c=C('HORIZONTAL');c.appendChild(await txt('Project settings',v,'color/text/heading'));return c;},{width:1400});
await makeSet('card','Card','Groups related content, optionally as one interactive target.',['default','interactive','flat'],['default','hover','focus','selected','disabled'],async(v,s)=>{
  const c=C('VERTICAL');c.counterAxisSizingMode='FIXED';c.resize(260,120);c.primaryAxisSizingMode='AUTO';square(c);pad(c,'space/component-padding-md','space/component-padding-md');bind(c,'itemSpacing','space/component-gap-sm');
  fill(c,v==='flat'?'color/background/sunken':'color/background/raised');stroke(c,s==='selected'?'color/border/interactive':'color/border/default',s==='selected'?'border/width-focus':'border/width-default');
  if(v!=='flat')c.effectStyleId=ES.get(v==='interactive'&&s==='hover'?'Elevation/2':'Elevation/1').id;
  c.appendChild(await txt('Pro plan','h4','color/text/heading'));c.appendChild(await txt('Billed yearly','caption','color/text/secondary'));c.appendChild(await txt('Unlimited projects and priority support.','body2'));
  if(v==='interactive')layer(c,s);if(s==='focus')ring(c);if(s==='disabled')dim(c);return c;},{width:1500});
return {sets};
