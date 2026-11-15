const page=figma.root.children.find(p=>p.name==='Overlays');await figma.setCurrentPageAsync(page);
//LIB
const trigger=async(label,iconName)=>{const b=row({primaryAxisAlignItems:'CENTER'});b.counterAxisSizingMode='FIXED';b.resize(40,40);bind(b,'height','size/control-md');stroke(b,'color/border/interactive');
  if(iconName){b.primaryAxisSizingMode='FIXED';b.resize(40,40);b.appendChild(icon(iconName,'md','color/text/link'));}else{pad(b,'space/component-padding-md');bind(b,'itemSpacing','space/component-gap-sm');b.appendChild(await txt(label,'button','color/text/link'));b.appendChild(icon('keyboard_arrow_down','sm','color/text/link'));b.primaryAxisSizingMode='AUTO';}b.name='Trigger';return b;};
const place=(c,v,a,b)=>{c.layoutMode=v==='top'||v==='bottom'?'VERTICAL':'HORIZONTAL';c.counterAxisAlignItems='CENTER';const first=v==='top'||v==='start'?b:a,second=first===a?b:a;c.appendChild(first);c.appendChild(second);};
await makeSet('tooltip','Tooltip','A short label that appears on hover and keyboard focus to name or explain a control.',['top','bottom','start','end'],['default'],async(v)=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-padding-xs');
  const tip=row();fill(tip,'color/tooltip/bg');square(tip);pad(tip,'space/component-padding-sm','space/component-padding-xs');tip.name='Tooltip';tip.appendChild(await txt('Copy link to clipboard','caption','color/tooltip/text'));
  place(c,v,await trigger(null,'content_copy'),tip);return c;},{width:1000});
await makeSet('popover','Popover','A non-modal dialog anchored to a trigger, for a little extra content or a few settings.',['top','bottom','start','end'],['default'],async(v)=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-padding-xs');
  const p=col();p.name='Popover';fill(p,'color/background/surface');stroke(p,'color/border/default');square(p);p.effectStyleId=ES.get('Elevation/2').id;pad(p,'space/component-padding-md','space/component-padding-md');bind(p,'itemSpacing','space/component-gap-sm');
  p.appendChild(await txt('Share project','h4','color/text/heading'));p.appendChild(await txt('Anyone with the link can view this project.','body2','color/text/secondary'));
  const sw=row();bind(sw,'itemSpacing','space/component-gap-sm');const t=figma.createFrame();t.resize(40,20);fill(t,'color/interactive/default');square(t);t.layoutMode='HORIZONTAL';t.primaryAxisSizingMode='FIXED';t.counterAxisSizingMode='FIXED';t.counterAxisAlignItems='CENTER';t.primaryAxisAlignItems='MAX';t.paddingRight=4;const th=figma.createRectangle();th.resize(12,12);fill(th,'color/text/inverse');t.appendChild(th);sw.appendChild(t);sw.appendChild(await txt('Allow comments','body2'));p.appendChild(sw);
  place(c,v,await trigger('Share'),p);return c;},{width:1400});
const menuItem=async(label,o={})=>{const r=row();r.name='Item';r.counterAxisSizingMode='FIXED';r.resize(240,40);bind(r,'height','size/control-md');pad(r,'space/component-padding-md');bind(r,'itemSpacing','space/component-gap-sm');
  if(o.check!==undefined){const s=figma.createFrame();s.name='Check slot';s.fills=[];s.resize(16,16);if(o.check)s.appendChild(icon('check_small','sm','color/text/link'));r.appendChild(s);}
  if(o.icon)r.appendChild(icon(o.icon,'md',o.danger?'color/text/danger-action':'color/text/secondary'));
  const t=await txt(label,'body1',o.danger?'color/text/danger-action':'color/text/primary');r.appendChild(t);fillW(t);
  if(o.kbd)r.appendChild(await txt(o.kbd,'caption','color/text/secondary'));if(o.sub)r.appendChild(icon('keyboard_arrow_right','sm','color/text/secondary'));
  if(o.focused){const l=figma.createRectangle();l.name='State layer';r.insertChild(0,l);l.layoutPositioning='ABSOLUTE';l.x=0;l.y=0;l.resize(240,40);l.constraints={horizontal:'STRETCH',vertical:'STRETCH'};fill(l,'color/state/layer');bind(l,'opacity','opacity/state-focus');}return r;};
await makeSet('menu','Menu','A list of actions or options that opens from a button.',['none','single','multiple'],['default'],async(v)=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-padding-xs');c.appendChild(await trigger(v==='none'?'Actions':v==='single'?'Sort by':'Columns'));
  const m=col();m.name='Menu';fill(m,'color/background/surface');stroke(m,'color/border/default');square(m);m.effectStyleId=ES.get('Elevation/2').id;bind(m,'paddingTop','space/component-padding-xs');bind(m,'paddingBottom','space/component-padding-xs');c.appendChild(m);
  if(v==='none'){m.appendChild(await menuItem('Edit',{icon:'edit',kbd:'⌘E',focused:true}));m.appendChild(await menuItem('Duplicate',{icon:'content_copy',kbd:'⌘D'}));m.appendChild(await menuItem('Move to',{icon:'arrow_forward',sub:true}));
    const sep=figma.createRectangle();sep.name='Separator';sep.resize(240,1);fill(sep,'color/border/default');m.appendChild(sep);
    const h=row();pad(h,'space/component-padding-md');h.appendChild(await txt('Danger zone','overline','color/text/secondary'));m.appendChild(h);m.appendChild(await menuItem('Delete',{icon:'delete',danger:true}));}
  else for(const [i,l] of ['Name','Last updated','Owner'].entries())m.appendChild(await menuItem(l,{check:v==='single'?i===1:i!==1,focused:i===0}));
  return c;},{width:1000});
const panelBody=async(p)=>{const head=row();head.name='Header';head.primaryAxisAlignItems='SPACE_BETWEEN';pad(head,'space/component-padding-lg','space/component-padding-md');p.appendChild(head);fillW(head);head.strokes=[paint('color/border/default')];head.strokeBottomWeight=1;head.strokeTopWeight=0;head.strokeLeftWeight=0;head.strokeRightWeight=0;
  head.appendChild(await txt('Filters','h3','color/text/heading'));head.appendChild(icon('close','md','color/text/secondary'));
  const body=col();body.name='Body';pad(body,'space/component-padding-lg','space/component-padding-md');bind(body,'itemSpacing','space/component-gap-md');p.appendChild(body);fillW(body);body.layoutSizingVertical='FILL';
  for(const [l,on] of [['Only my projects',true],['Include archived',false]]){const r=row();bind(r,'itemSpacing','space/component-gap-sm');const b=figma.createFrame();b.resize(20,20);square(b);if(on)fill(b,'color/interactive/default');else{fill(b,'color/background/surface');stroke(b,'color/border/input','border/width-control');}r.appendChild(b);r.appendChild(await txt(l,'body2'));body.appendChild(r);}
  const foot=row();foot.name='Footer';foot.primaryAxisAlignItems='MAX';pad(foot,'space/component-padding-lg','space/component-padding-md');bind(foot,'itemSpacing','space/component-gap-sm');p.appendChild(foot);fillW(foot);foot.strokes=[paint('color/border/default')];foot.strokeTopWeight=1;foot.strokeBottomWeight=0;foot.strokeLeftWeight=0;foot.strokeRightWeight=0;
  foot.appendChild(await txt('Reset','button','color/text/link'));const ap=row({primaryAxisAlignItems:'CENTER'});fill(ap,'color/interactive/default');pad(ap,'space/component-padding-md');ap.counterAxisSizingMode='FIXED';ap.resize(80,40);ap.appendChild(await txt('Apply','button','color/text/inverse'));foot.appendChild(ap);};
await makeSet('drawer','Drawer','A panel that slides in from the start or end edge for a side task, such as filters.',['start','end'],['default'],async(v)=>{
  const c=C('HORIZONTAL',{counterAxisAlignItems:'MIN'});c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.resize(720,480);c.primaryAxisAlignItems=v==='end'?'MAX':'MIN';
  const scrim=figma.createRectangle();scrim.name='Scrim';c.appendChild(scrim);scrim.layoutPositioning='ABSOLUTE';scrim.x=0;scrim.y=0;scrim.resize(720,480);scrim.constraints={horizontal:'STRETCH',vertical:'STRETCH'};fill(scrim,'color/background/overlay');bind(scrim,'opacity','opacity/overlay');
  const p=col();p.name='Panel';fill(p,'color/background/surface');p.effectStyleId=ES.get('Elevation/4').id;c.appendChild(p);p.resize(320,480);p.layoutSizingVertical='FILL';p.layoutSizingHorizontal='FIXED';bind(p,'width','size/drawer-sm');
  p.strokes=[paint('color/border/default')];if(v==='end'){p.strokeLeftWeight=1;p.strokeRightWeight=0;}else{p.strokeRightWeight=1;p.strokeLeftWeight=0;}p.strokeTopWeight=0;p.strokeBottomWeight=0;
  await panelBody(p);return c;},{width:1600});
await makeSet('modal','Modal','A dialog that blocks the page until the user responds or dismisses it.',['default','danger','fullscreen'],['open','closed','loading'],async(v,s)=>{
  const c=C('VERTICAL',{counterAxisAlignItems:'CENTER',primaryAxisAlignItems:'CENTER'});c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.resize(560,360);fill(c,'color/background/page');
  if(s==='closed'){const b=row({primaryAxisAlignItems:'CENTER'});stroke(b,'color/border/interactive');pad(b,'space/component-padding-md');b.counterAxisSizingMode='FIXED';b.resize(120,40);b.appendChild(await txt(v==='danger'?'Delete project':'Open dialog','button',v==='danger'?'color/text/danger-action':'color/text/link'));c.appendChild(b);return c;}
  const scrim=figma.createRectangle();scrim.name='Scrim';c.appendChild(scrim);scrim.layoutPositioning='ABSOLUTE';scrim.x=0;scrim.y=0;scrim.resize(560,360);scrim.constraints={horizontal:'STRETCH',vertical:'STRETCH'};fill(scrim,'color/background/overlay');bind(scrim,'opacity','opacity/overlay');
  const p=col();p.name='Panel';fill(p,'color/background/surface');square(p);c.appendChild(p);
  if(v==='fullscreen'){p.layoutSizingHorizontal='FILL';p.layoutSizingVertical='FILL';}else{stroke(p,'color/border/default');p.effectStyleId=ES.get('Elevation/4').id;p.resize(400,200);p.layoutSizingHorizontal='FIXED';p.layoutSizingVertical='HUG';}
  pad(p,'space/component-padding-lg','space/component-padding-lg');bind(p,'itemSpacing','space/component-gap-md');
  const h=row();h.primaryAxisAlignItems='SPACE_BETWEEN';p.appendChild(h);fillW(h);h.appendChild(await txt(v==='danger'?'Delete project?':'Rename project','h3','color/text/heading'));h.appendChild(icon('close','md','color/text/secondary'));
  const body=await txt(v==='danger'?'This removes the project and its history.':'Choose a name people will recognise.','body1');p.appendChild(body);
  const f=row();f.primaryAxisAlignItems='MAX';bind(f,'itemSpacing','space/component-gap-sm');p.appendChild(f);fillW(f);f.appendChild(await txt('Cancel','button','color/text/link'));
  const ok=row({primaryAxisAlignItems:'CENTER'});fill(ok,v==='danger'?'color/text/danger':'color/interactive/default');pad(ok,'space/component-padding-md');ok.counterAxisSizingMode='FIXED';ok.resize(96,40);f.appendChild(ok);
  if(s==='loading'){const sp=figma.createFrame();sp.name='Spinner';sp.resize(16,16);sp.fills=[];stroke(sp,'color/text/inverse','border/width-focus');ok.appendChild(sp);}else ok.appendChild(await txt(v==='danger'?'Delete':'Save','button','color/text/inverse'));
  return c;},{width:1800});
return {sets};
