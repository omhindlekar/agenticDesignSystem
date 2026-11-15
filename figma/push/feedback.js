const page=figma.root.children.find(p=>p.name==='Feedback');await figma.setCurrentPageAsync(page);
//LIB
const TONE={info:['color/container/info','color/on/container-info','color/text/info','info'],success:['color/container/success','color/on/container-success','color/border/success','check_circle'],warning:['color/container/warning','color/on/container-warning','color/text/warning','warning'],danger:['color/container/danger','color/on/container-danger','color/border/danger','report']};
const bar=(c,color)=>{const b=figma.createRectangle();b.name='Tone bar';c.appendChild(b);b.layoutPositioning='ABSOLUTE';b.x=0;b.y=0;b.resize(4,c.height);b.constraints={horizontal:'MIN',vertical:'STRETCH'};fill(b,color);};
await makeSet('banner','Banner','An inline message about the page or a task, in an info, success, warning or danger tone.',['info','success','warning','danger'],['default'],async(v)=>{
  const [bg,fg,edge,ic]=TONE[v];const c=C('HORIZONTAL',{counterAxisAlignItems:'MIN'});c.resize(520,60);c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='AUTO';fill(c,bg);square(c);
  pad(c,'space/component-padding-md','space/component-padding-sm');bind(c,'itemSpacing','space/component-gap-sm');
  c.appendChild(icon(ic,'md',fg));const body=col();bind(body,'itemSpacing','space/component-padding-xs');c.appendChild(body);fillW(body);
  body.appendChild(await txt({info:'Scheduled maintenance',success:'Published',warning:'Storage almost full',danger:'Sync failed'}[v],'label',fg));
  body.appendChild(await txt({info:'The editor is read-only on Sunday from 02:00 to 03:00 UTC.',success:'Your changes are live.',warning:'You have used 92% of your plan.',danger:'We could not reach the server.'}[v],'body2',fg));
  c.appendChild(icon('close','md',fg));bar(c,edge);return c;},{gap:24});
await makeSet('toast-region','ToastRegion','Brief, non-blocking notifications that stack in a corner and dismiss themselves.',['bottom-end','top-end'],['default'],async(v)=>{
  const c=C('VERTICAL',{counterAxisAlignItems:'MAX'});c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.resize(480,280);fill(c,'color/background/sunken');square(c);pad(c,'space/component-padding-md','space/component-padding-md');bind(c,'itemSpacing','space/component-gap-sm');c.primaryAxisAlignItems=v==='top-end'?'MIN':'MAX';
  for(const [tone,title,desc,action] of [['success','Link copied'],['danger','Upload failed','The file is larger than 10 MB.'],['info','Item deleted',null,'Undo']]){
    const t=row({counterAxisAlignItems:'MIN'});t.resize(320,48);t.primaryAxisSizingMode='FIXED';t.counterAxisSizingMode='AUTO';fill(t,'color/background/surface');stroke(t,'color/border/default');t.effectStyleId=ES.get('Elevation/3').id;pad(t,'space/component-padding-md','space/component-padding-sm');bind(t,'itemSpacing','space/component-gap-sm');
    t.appendChild(icon(TONE[tone][3],'md',TONE[tone][2]));const b=col();t.appendChild(b);fillW(b);b.appendChild(await txt(title,'label'));if(desc)b.appendChild(await txt(desc,'body2','color/text/secondary'));
    if(action)t.appendChild(await txt(action,'button','color/text/link'));t.appendChild(icon('close','sm','color/text/secondary'));c.appendChild(t);bar(t,TONE[tone][2]);}
  return c;},{width:1100});
await makeSet('badge','Badge','A short status, a count or a dot that labels something else.',['status','count','dot'],['default'],async(v)=>{
  const c=C('HORIZONTAL',{primaryAxisAlignItems:'CENTER'});square(c);
  if(v==='dot'){c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.resize(8,8);fill(c,'color/border/success');return c;}
  bind(c,'paddingLeft','space/component-padding-xs');bind(c,'paddingRight','space/component-padding-xs');
  if(v==='count'){fill(c,'color/text/danger');c.appendChild(await txt('99+','caption','color/text/inverse'));}else{fill(c,'color/container/warning');c.appendChild(await txt('Draft','caption','color/on/container-warning'));}
  return c;},{width:600});
await makeSet('progress-bar','ProgressBar','Shows how far a task has got, or that work is ongoing.',['determinate','indeterminate'],['default'],async(v)=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-padding-xs');c.counterAxisSizingMode='FIXED';c.resize(320,40);c.primaryAxisSizingMode='AUTO';
  const h=row();h.primaryAxisAlignItems='SPACE_BETWEEN';c.appendChild(h);fillW(h);h.appendChild(await txt(v==='determinate'?'Uploading files':'Preparing export','label'));if(v==='determinate')h.appendChild(await txt('64%','label','color/text/secondary'));
  const tr=figma.createFrame();tr.name='Track';tr.resize(320,4);fill(tr,'color/border/default');c.appendChild(tr);fillW(tr);
  const f=figma.createRectangle();f.name='Fill';tr.appendChild(f);f.resize(v==='determinate'?205:106,4);f.x=v==='determinate'?0:80;fill(f,'color/interactive/default');return c;},{width:900});
await makeSet('spinner','Spinner','A small square that turns while something loads; "Loading" text replaces it under reduced motion.',['sm','md','lg'],['default'],async(v)=>{
  const px={sm:16,md:20,lg:24}[v];const c=C('HORIZONTAL');c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.resize(px,px);c.layoutMode='NONE';
  stroke(c,'color/spinner/track','border/width-focus');bind(c,'width',{sm:'size/icon-sm',md:'size/control-indicator',lg:'size/icon-lg'}[v]);bind(c,'height',{sm:'size/icon-sm',md:'size/control-indicator',lg:'size/icon-lg'}[v]);
  const t=figma.createRectangle();t.name='Indicator';c.appendChild(t);t.resize(px,2);t.x=0;t.y=0;t.constraints={horizontal:'STRETCH',vertical:'MIN'};fill(t,'color/interactive/default');return c;},{width:600});
return {sets};
