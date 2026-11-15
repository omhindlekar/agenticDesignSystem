const page=figma.root.children.find(p=>p.name==='Navigation');await figma.setCurrentPageAsync(page);
//LIB
const indicator=(n,side)=>{const r=figma.createRectangle();r.name='Indicator';n.appendChild(r);r.layoutPositioning='ABSOLUTE';const w=n.width,h=n.height;
  if(side==='bottom'){r.resize(w,2);r.x=0;r.y=h-2;r.constraints={horizontal:'STRETCH',vertical:'MAX'};}else{r.resize(2,h);r.x=side==='end'?w-2:0;r.y=0;r.constraints={horizontal:side==='end'?'MAX':'MIN',vertical:'STRETCH'};}
  fill(r,'color/interactive/default');};
await makeSet('tabs','Tabs','Switches between views of the same thing, one panel at a time.',['horizontal','vertical'],['default','hover','focus'],async(v,s)=>{
  const c=C(v==='horizontal'?'VERTICAL':'HORIZONTAL',{counterAxisAlignItems:'MIN'});bind(c,'itemSpacing','space/component-gap-md');
  const list=v==='horizontal'?row():col();list.name='Tab list';c.appendChild(list);
  list.strokes=[paint('color/border/default')];list.strokeTopWeight=0;list.strokeLeftWeight=0;list.strokeRightWeight=v==='vertical'?1:0;list.strokeBottomWeight=v==='horizontal'?1:0;
  for(const [i,[l,ic]] of [['Overview','info'],['Activity','calendar_today'],['Settings','settings'],['Billing',null]].entries()){
    const t=row();t.name='Tab';t.resize(100,40);t.primaryAxisSizingMode='AUTO';t.counterAxisSizingMode='FIXED';bind(t,'height','size/control-md');pad(t,'space/component-padding-md');bind(t,'itemSpacing','space/component-gap-sm');
    const sel=i===0,dis=i===3;if(ic)t.appendChild(icon(ic,'sm',sel?'color/text/link':'color/text/secondary'));t.appendChild(await txt(l,'label',sel?'color/text/link':'color/text/secondary'));
    list.appendChild(t);if(v==='vertical')fillW(t);if(dis)bind(t,'opacity','opacity/disabled');
    if(sel)indicator(t,v==='horizontal'?'bottom':'end');if(i===1)layer(t,s);if(s==='focus'&&i===1)ring(t,true);}
  const panel=await txt('Tokens, components and rules for the POC.','body2');c.appendChild(panel);return c;},{width:1400});
const crumb=async(l,link)=>txt(l,'body2',link?'color/text/link':'color/text/primary',{underline:false});
await makeSet('breadcrumbs','Breadcrumbs','Shows where the current page sits in the hierarchy, with links back up.',['full','collapsed'],['default'],async(v)=>{
  const c=C('HORIZONTAL');bind(c,'itemSpacing','space/component-padding-xs');
  const items=v==='full'?[['Home',1],['Projects',1],['Design system',1],['Components',1],['Button',0]]:[['Home',1],['…',2],['Components',1],['Button',0]];
  for(const [i,[l,link]] of items.entries()){if(i)c.appendChild(icon('keyboard_arrow_right','sm','color/text/secondary'));
    if(link===2){const b=row({primaryAxisAlignItems:'CENTER'});pad(b,'space/component-padding-xs');b.name='Show full path';b.appendChild(await txt('…','body2','color/text/link'));c.appendChild(b);}else c.appendChild(await crumb(l,link));}
  return c;},{width:900});
await makeSet('side-nav','SideNav','The main navigation for an app: links in groups, with the current page marked.',['expanded','rail'],['default'],async(v)=>{
  const c=C('VERTICAL');c.counterAxisSizingMode='FIXED';c.resize(v==='rail'?56:240,300);c.primaryAxisSizingMode='AUTO';fill(c,'color/background/surface');
  c.strokes=[paint('color/border/default')];c.strokeRightWeight=1;c.strokeLeftWeight=0;c.strokeTopWeight=0;c.strokeBottomWeight=0;bind(c,'paddingTop','space/component-padding-sm');bind(c,'paddingBottom','space/component-padding-sm');
  const items=[['Home','menu',0],['Projects','filter_list',0],['Library','content_copy','group'],['Components',null,'current'],['Tokens',null,0],['People','person',0],['Settings','settings',0]];
  for(const [l,ic,kind] of items){if(v==='rail'&&!ic)continue;const r=row();r.name=kind==='current'?'Link (current)':'Link';r.counterAxisSizingMode='FIXED';r.resize(240,40);bind(r,'height','size/control-md');c.appendChild(r);fillW(r);
    bind(r,'paddingLeft',ic?'space/component-padding-md':'space/component-padding-lg');bind(r,'paddingRight','space/component-padding-md');bind(r,'itemSpacing','space/component-gap-sm');
    const cur=kind==='current'||(v==='rail'&&l==='Settings');if(cur)fill(r,'color/container/primary');
    if(ic)r.appendChild(icon(ic,'md',cur?'color/on/container-primary':'color/text/secondary'));
    if(v!=='rail'){if(!ic){const sp=figma.createFrame();sp.fills=[];sp.resize(20,1);r.appendChild(sp);}const t=await txt(l,'label',cur?'color/on/container-primary':'color/text/primary');r.appendChild(t);fillW(t);if(kind==='group')r.appendChild(icon('keyboard_arrow_up','sm','color/text/secondary'));}
    if(cur)indicator(r,'start');}
  return c;},{width:700});
await makeSet('app-header','AppHeader','The bar at the top of an app: product name, main navigation, search and actions.',['wide','compact'],['default'],async(v)=>{
  const c=C('HORIZONTAL');c.resize(v==='wide'?1000:480,56);c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';fill(c,'color/background/surface');pad(c,'space/component-padding-lg');bind(c,'itemSpacing','space/component-gap-md');
  c.strokes=[paint('color/border/default')];c.strokeBottomWeight=1;c.strokeTopWeight=0;c.strokeLeftWeight=0;c.strokeRightWeight=0;
  if(v==='compact')c.appendChild(icon('menu','md','color/text/secondary'));
  c.appendChild(await txt('Agentic DS','h4','color/text/heading'));
  if(v==='wide')for(const [i,l] of ['Projects','Components','Docs'].entries()){const n=row();n.name='Nav link';n.resize(80,56);n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode='FIXED';pad(n,'space/component-padding-sm');n.appendChild(await txt(l,'label',i===0?'color/text/link':'color/text/secondary'));c.appendChild(n);if(i===0)indicator(n,'bottom');}
  const sp=figma.createFrame();sp.name='Spacer';sp.fills=[];sp.resize(10,10);c.appendChild(sp);sp.layoutGrow=1;
  const s=row();s.name='Search';s.counterAxisSizingMode='FIXED';s.resize(v==='wide'?240:140,40);s.primaryAxisSizingMode='FIXED';stroke(s,'color/border/input');fill(s,'color/background/surface');bind(s,'paddingLeft','space/component-padding-field');bind(s,'itemSpacing','space/component-gap-sm');s.appendChild(icon('search','md','color/text/secondary'));s.appendChild(await txt('Search','body1','color/text/secondary'));c.appendChild(s);
  for(const ic of v==='wide'?['help','settings','person']:['person'])c.appendChild(icon(ic,'md','color/text/secondary'));
  return c;},{width:1200});
return {sets};
