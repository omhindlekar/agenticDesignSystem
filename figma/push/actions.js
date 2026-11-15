const page=figma.root.children.find(p=>p.name==='Actions');await figma.setCurrentPageAsync(page);
//LIB
const spinner=(color)=>{const f=figma.createFrame();f.name='Spinner';f.resize(16,16);bind(f,'width','size/icon-sm');bind(f,'height','size/icon-sm');fill(f,null);stroke(f,'color/spinner/track','border/width-focus');const top=figma.createRectangle();f.appendChild(top);top.resize(16,2);top.x=0;top.y=0;top.constraints={horizontal:'STRETCH',vertical:'MIN'};fill(top,color||'color/interactive/default');return f;};
await makeSet('button','Button','Triggers an action or submits a form.',['contained','outlined','text'],['default','hover','active','focus','disabled','loading'],async(v,s)=>{
  const c=C('HORIZONTAL',{primaryAxisAlignItems:'CENTER'});square(c);pad(c,'space/component-padding-md');bind(c,'itemSpacing','space/component-gap-sm');
  c.counterAxisSizingMode='FIXED';c.resize(120,40);bind(c,'height','size/control-md');
  const fg=v==='contained'?'color/text/inverse':'color/text/link';
  if(v==='contained')fill(c,s==='hover'?'color/interactive/hover':s==='active'?'color/interactive/active':'color/interactive/default');
  if(v==='outlined')stroke(c,'color/border/interactive');
  const label=await txt('Button','button',fg);c.appendChild(label);
  if(s==='loading'){label.opacity=0;const sp=spinner(v==='contained'?'color/text/inverse':null);c.appendChild(sp);sp.layoutPositioning='ABSOLUTE';sp.x=(c.width-16)/2;sp.y=12;sp.constraints={horizontal:'CENTER',vertical:'CENTER'};}
  if(v!=='contained')layer(c,s);else if(s==='focus')layer(c,s);
  if(s==='focus')ring(c);if(s==='disabled')dim(c);return c;});
await makeSet('icon-button','IconButton','A square button whose only content is an icon; its label names it for assistive tech.',['standard','outlined','contained'],['default','hover','active','focus','selected','disabled','loading'],async(v,s)=>{
  const c=C('HORIZONTAL',{primaryAxisAlignItems:'CENTER'});square(c);c.resize(40,40);c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';bind(c,'width','size/control-md');bind(c,'height','size/control-md');
  const fg=v==='contained'?'color/text/inverse':(s==='selected'?'color/text/link':'color/text/secondary');
  if(v==='contained')fill(c,s==='hover'?'color/interactive/hover':s==='active'?'color/interactive/active':'color/interactive/default');
  if(v==='outlined')stroke(c,'color/border/interactive');
  if(v==='standard'&&s==='selected')fill(c,'color/container/primary');
  const i=icon('settings','md',fg);c.appendChild(i);
  if(s==='loading'){i.opacity=0;const sp=spinner(v==='contained'?'color/text/inverse':null);c.appendChild(sp);sp.layoutPositioning='ABSOLUTE';sp.x=12;sp.y=12;}
  if(v!=='contained')layer(c,s);if(s==='focus')ring(c);if(s==='disabled')dim(c);return c;});
await makeSet('link','Link','Navigates to another page or resource; inline links are underlined.',['inline','standalone'],['default','hover','focus'],async(v,s)=>{
  const c=C('HORIZONTAL');bind(c,'itemSpacing','space/component-gap-sm');
  const t=await txt('Read the release notes',v==='inline'?'body1':'label',s==='hover'?'color/text/link-hover':'color/text/link',{underline:v==='inline'||s==='hover'});c.appendChild(t);
  if(s==='focus')ring(c);return c;});
return {sets};
