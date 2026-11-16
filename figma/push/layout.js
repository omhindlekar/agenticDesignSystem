const page=figma.root.children.find(p=>p.name==='Layout');await figma.setCurrentPageAsync(page);
//LIB
// Layout primitives: Container, Stack, Grid, Section, PageShell. Widths, gaps and padding are bound to variables.
const ph=async(label,w)=>{const b=row();b.name='Content';fill(b,'color/background/sunken');stroke(b,'color/border/default');pad(b,'space/component-padding-md','space/component-padding-sm');b.appendChild(await txt(label,'body2','color/text/secondary'));if(w)bind(fixW(b,w),'width',w===240?'size/grid-item-sm':'size/grid-item-md');return b;};
await makeSet('container','Container','Caps the width of page content, centres it and keeps the page side margin.',['sm','md','lg','full'],['default'],async(v)=>{
  const c=C('VERTICAL');stroke(c,'color/border/default');pad(c,'layout/margin-md');
  const w={sm:'size/container-sm',md:'size/container-md',lg:'size/container-lg',full:'size/content-max'}[v];
  const inner=await ph('Content up to '+w.replace('size/',''));c.appendChild(inner);inner.resize(384,inner.height);bind(inner,'width',w);inner.layoutSizingHorizontal='FIXED';return c;},{width:1500});
await makeSet('stack','Stack','Lays out children in one direction with a consistent gap from the spacing scale.',['vertical','horizontal'],['default'],async(v)=>{
  const c=C(v==='vertical'?'VERTICAL':'HORIZONTAL');bind(c,'itemSpacing','space/component-gap-md');
  for(const i of [1,2,3])c.appendChild(await ph('Item '+i));return c;});
await makeSet('grid','Grid','Arranges items in equal columns that drop as space runs out, so it is responsive without breakpoints.',['default'],['default'],async()=>{
  const c=C('HORIZONTAL');c.layoutWrap='WRAP';bind(c,'itemSpacing','layout/gutter-lg');bind(c,'counterAxisSpacing','layout/gutter-lg');
  for(const i of [1,2,3,4,5,6])c.appendChild(await ph('Item '+i,320));
  c.primaryAxisSizingMode='FIXED';c.resize(1008,c.height);c.counterAxisSizingMode='AUTO';return c;},{width:1200});
await makeSet('section','Section','A titled region of a page: heading, optional description and actions, then its content. The danger variant is the danger zone.',['plain','surface','danger'],['default'],async(v)=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-gap-md');fixW(c,480);
  if(v!=='plain'){pad(c,'space/component-padding-lg','space/component-padding-lg');fill(c,'color/background/surface');stroke(c,v==='danger'?'color/border/danger':'color/border/default');}
  const head=col();bind(head,'itemSpacing','space/component-padding-xs');c.appendChild(head);fillW(head);
  head.appendChild(await txt(v==='danger'?'Delete account':'Profile','h3','color/text/heading'));
  head.appendChild(await txt(v==='danger'?'This permanently deletes your account. It cannot be undone.':'This is how other people in your business see you.','body2','color/text/secondary'));
  const body=await ph('Section content');c.appendChild(body);fillW(body);return c;});
await makeSet('page-shell','PageShell','The frame of a page: optional header, side navigation and footer around the one main landmark, with a skip link.',['page','sunken'],['default'],async(v)=>{
  const c=C('VERTICAL');fill(c,v==='page'?'color/background/page':'color/background/sunken');stroke(c,'color/border/default');fixW(c,720);
  const header=await ph('Header (AppHeader)');c.appendChild(header);fillW(header);
  const main=col();main.name='Main';pad(main,'space/layout-page','space/layout-section');bind(main,'itemSpacing','space/component-gap-md');c.appendChild(main);fillW(main);
  main.appendChild(await txt('Page title','h1','color/text/heading'));const m=await ph('Main content');main.appendChild(m);fillW(m);
  const foot=row();foot.name='Footer';pad(foot,'space/layout-page','space/component-padding-md');stroke(foot,'color/border/default');c.appendChild(foot);fillW(foot);
  foot.appendChild(await txt('Privacy notice','label','color/text/link',{underline:true}));return c;});
return {sets};
