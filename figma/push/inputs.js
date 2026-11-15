const page=figma.root.children.find(p=>p.name==='Inputs');await figma.setCurrentPageAsync(page);
//LIB
// A labelled field: label, a 40px box with optional start/end parts, and a helper or error message.
const field=async(v,s,o={})=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-padding-xs');c.resize(o.w||280,40);c.counterAxisSizingMode='FIXED';c.primaryAxisSizingMode='AUTO';
  c.appendChild(await txt(o.label||'Label','label','color/text/primary'));
  const box=row();fill(box,s==='disabled'?'color/interactive/disabled':s==='read-only'?'color/background/subtle':'color/background/surface');square(box);
  bind(box,'paddingLeft','space/component-padding-field');bind(box,'paddingRight',o.endPad||'space/component-padding-field');bind(box,'itemSpacing','space/component-gap-sm');
  const err=v==='error'||s==='error', ok=v==='success'||s==='success';
  stroke(box,s==='disabled'?'color/border/disabled':err?'color/border/danger':ok?'color/border/success':s==='focus'?'color/border/interactive':s==='hover'?'color/border/input-hover':'color/border/input');
  c.appendChild(box);fillW(box);
  if(o.tall){box.counterAxisAlignItems='MIN';bind(box,'paddingTop','space/component-padding-sm');box.resize(box.width,96);box.layoutSizingVertical='FIXED';}
  else{box.counterAxisSizingMode='FIXED';box.resize(box.width,40);bind(box,'height','size/control-md');}
  if(o.start)box.appendChild(icon(o.start,'md','color/text/secondary'));
  const filled=['filled','read-only','selected','success','error'].includes(s)||v!=='default';
  const value=await txt(filled?(o.value||'Value'):(o.placeholder||'Placeholder'),'body1',filled?'color/text/primary':'color/text/secondary');box.appendChild(value);fillW(value);
  if(o.end)for(const e of o.end)box.appendChild(typeof e==='string'?icon(e,'md','color/text/secondary'):e);
  if(err)c.appendChild(await txt('Explain how to fix it','caption','color/text/danger'));
  else c.appendChild(await txt(o.helper||'Helper text','caption','color/text/secondary'));
  if(s==='focus')ring(box);if(s==='disabled'){value.opacity=1;dim(value);}
  return c;};
await makeSet('field','Field','Label, helper text and error message around any control, linked for assistive tech.',['default','error'],['default','disabled','error'],(v,s)=>field(v,s,{label:'Project name',value:'Agentic DS',helper:'Shown on the dashboard'}));
await makeSet('input','Input','A single-line text field with a visible label, helper text and validation.',['default','error','success'],['default','hover','focus','filled','disabled','error','success','read-only'],(v,s)=>field(v,s,{label:'Email',placeholder:'name@example.com',value:'om@example.com'}),{width:1560});
await makeSet('textarea','Textarea','A multi-line text field for longer answers.',['default','error'],['default','hover','focus','filled','disabled','error','read-only'],(v,s)=>field(v,s,{label:'Description',placeholder:'What the project is for',value:'Tokens, components and rules.',tall:true}),{width:1560});
await makeSet('search-field','SearchField','A search box with a clear button; Enter submits and Escape clears.',['default'],['default','hover','focus','filled','disabled'],(v,s)=>field(v,s,{label:'Search',placeholder:'Search components',value:'button',start:'search',end:s==='filled'?['close']:[]}),{width:1560});
await makeSet('number-field','NumberField','A number input with step buttons that respects min, max and step.',['default','error'],['default','hover','focus','filled','disabled','error'],(v,s)=>field(v,s,{label:'Seats',placeholder:'0',value:'5',end:['remove','add'],endPad:'space/component-padding-xs'}),{width:1560});
await makeSet('select','Select','Choose one option from a short list in a popover.',['default','error','success'],['default','hover','focus','selected','disabled','error','success'],(v,s)=>field(v,s,{label:'Country',placeholder:'Choose a country',value:'India',end:['keyboard_arrow_down']}),{width:1560});
await makeSet('combobox','Combobox','A text field that filters a long list of options as you type.',['default','error'],['default','hover','focus','filled','disabled','error'],(v,s)=>field(v,s,{label:'Country',placeholder:'Type to search',value:'Ind',end:['keyboard_arrow_down']}),{width:1560});
await makeSet('date-picker','DatePicker','A date field with typed segments and a calendar.',['default','error'],['default','hover','focus','filled','disabled','error'],(v,s)=>field(v,s,{label:'Start date',placeholder:'mm / dd / yyyy',value:'11 / 16 / 2026',end:['calendar_today']}),{width:1560});
// Checkbox: a 20px square box, 2px border; checked and indeterminate fill blue with an inverse mark.
await makeSet('checkbox','Checkbox','A box to switch a single option on or off, or to pick several.',['default','indeterminate'],['unchecked','checked','indeterminate','hover','focus','disabled','error'],async(v,s)=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-padding-xs');
  const r=row();bind(r,'itemSpacing','space/component-gap-sm');c.appendChild(r);
  const box=figma.createFrame();box.name='Box';box.resize(20,20);square(box);bind(box,'width','size/control-indicator');bind(box,'height','size/control-indicator');box.layoutMode='HORIZONTAL';box.primaryAxisSizingMode='FIXED';box.counterAxisSizingMode='FIXED';box.resize(20,20);box.primaryAxisAlignItems='CENTER';box.counterAxisAlignItems='CENTER';
  const on=s==='checked'||s==='indeterminate'||(v==='indeterminate'&&s!=='unchecked');
  if(on){fill(box,'color/interactive/default');stroke(box,'color/interactive/default','border/width-control');box.appendChild(icon(s==='indeterminate'||v==='indeterminate'?'remove':'check_small','sm','color/text/inverse'));}
  else{fill(box,'color/background/surface');stroke(box,s==='error'?'color/border/danger':s==='hover'?'color/border/input-hover':'color/border/input','border/width-control');}
  r.appendChild(box);r.appendChild(await txt(v==='indeterminate'?'Select all':'Remember me','body2'));
  if(s==='error')c.appendChild(await txt('You must accept the terms','caption','color/text/danger'));
  if(s==='focus')ring(box);if(s==='disabled')dim(c);return c;},{width:1400});
// Radio group: square frame with a square mark (radius 0).
await makeSet('radio-group','RadioGroup','Choose exactly one of a few options, all visible at once.',['default','error'],['default','hover','focus','disabled','error'],async(v,s)=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-gap-sm');c.appendChild(await txt('Plan','label'));
  for(const [i,name] of ['Starter','Team','Enterprise'].entries()){const r=row();bind(r,'itemSpacing','space/component-gap-sm');
    const box=figma.createFrame();box.name='Radio';box.resize(20,20);square(box);bind(box,'width','size/control-indicator');bind(box,'height','size/control-indicator');box.layoutMode='HORIZONTAL';box.primaryAxisSizingMode='FIXED';box.counterAxisSizingMode='FIXED';box.resize(20,20);box.primaryAxisAlignItems='CENTER';box.counterAxisAlignItems='CENTER';fill(box,'color/background/surface');
    const sel=i===1&&v!=='error'&&s!=='error';stroke(box,sel?'color/interactive/default':(v==='error'||s==='error')?'color/border/danger':s==='hover'&&i===0?'color/border/input-hover':'color/border/input','border/width-control');
    if(sel){const m=figma.createRectangle();m.name='Mark';m.resize(10,10);fill(m,'color/interactive/default');box.appendChild(m);}
    r.appendChild(box);r.appendChild(await txt(name,'body2'));c.appendChild(r);if(s==='focus'&&i===1)ring(box);}
  if(v==='error'||s==='error')c.appendChild(await txt('Choose a plan','caption','color/text/danger'));
  if(s==='disabled')dim(c);return c;},{width:1400});
// Switch: 40x20 track, square 12px thumb.
await makeSet('switch','Switch','Turns a setting on or off immediately.',['default'],['unchecked','checked','hover','focus','disabled'],async(v,s)=>{
  const c=C('HORIZONTAL');bind(c,'itemSpacing','space/component-gap-sm');
  const on=s==='checked'||s==='focus';const t=figma.createFrame();t.name='Track';t.resize(40,20);square(t);t.layoutMode='HORIZONTAL';t.primaryAxisSizingMode='FIXED';t.counterAxisSizingMode='FIXED';t.resize(40,20);t.counterAxisAlignItems='CENTER';t.primaryAxisAlignItems=on?'MAX':'MIN';t.paddingLeft=t.paddingRight=4;
  fill(t,on?'color/interactive/default':'color/background/surface');stroke(t,on?'color/interactive/default':s==='hover'?'color/border/input-hover':'color/border/input','border/width-control');
  const th=figma.createRectangle();th.name='Thumb';th.resize(12,12);fill(th,on?'color/text/inverse':'color/border/input-hover');t.appendChild(th);
  c.appendChild(t);c.appendChild(await txt('Email alerts','body2'));if(s==='focus')ring(t);if(s==='disabled')dim(c);return c;},{single:true});
// Slider: 4px rail, blue fill, 20px square thumb.
await makeSet('slider','Slider','Pick a value, or a range, by dragging along a track.',['single','range'],['default','hover','active','focus','disabled'],async(v,s)=>{
  const c=C('VERTICAL');bind(c,'itemSpacing','space/component-padding-xs');c.resize(280,40);c.counterAxisSizingMode='FIXED';c.primaryAxisSizingMode='AUTO';
  const h=row();h.primaryAxisAlignItems='SPACE_BETWEEN';c.appendChild(h);fillW(h);h.appendChild(await txt(v==='range'?'Price':'Volume','label'));h.appendChild(await txt(v==='range'?'£20 – £80':'40','label','color/text/secondary'));
  const tr=figma.createFrame();tr.name='Track';tr.fills=[];tr.resize(280,20);c.appendChild(tr);fillW(tr);tr.clipsContent=false;
  const rail=figma.createRectangle();rail.name='Rail';tr.appendChild(rail);rail.resize(280,4);rail.y=8;rail.constraints={horizontal:'STRETCH',vertical:'CENTER'};fill(rail,'color/border/default');
  const a=v==='range'?0.2:0,b=v==='range'?0.8:0.4;const f=figma.createRectangle();f.name='Fill';tr.appendChild(f);f.x=280*a;f.y=8;f.resize(280*(b-a),4);fill(f,s==='disabled'?'color/border/disabled':'color/interactive/default');
  for(const p of(v==='range'?[a,b]:[b])){const th=figma.createRectangle();th.name='Thumb';tr.appendChild(th);th.resize(20,20);th.x=280*p-10;th.y=0;fill(th,s==='disabled'?'color/border/disabled':'color/interactive/default');stroke(th,'color/background/surface','border/width-control','OUTSIDE');
    if(s==='hover'||s==='active'){const l=figma.createRectangle();l.name='State layer';tr.insertChild(0,l);l.resize(40,40);l.x=280*p-20;l.y=-10;fill(l,'color/state/layer');bind(l,'opacity',s==='hover'?'opacity/state-hover':'opacity/state-pressed');}
    if(s==='focus'){const r=figma.createFrame();r.name='Focus ring';r.fills=[];tr.appendChild(r);r.resize(28,28);r.x=280*p-14;r.y=-4;stroke(r,'color/interactive/focus-ring','border/width-focus');}}
  if(s==='disabled')dim(c);return c;},{width:1560});
// Segmented control: joined square segments, the selected one on the primary container.
await makeSet('segmented-control','SegmentedControl','A row of joined segments to pick one view or a few options.',['single','multiple'],['default','hover','active','focus','disabled'],async(v,s)=>{
  const c=C('HORIZONTAL');stroke(c,'color/border/input');square(c);
  const items=v==='single'?['Day','Week','Month']:['Email','In app','Digest'];
  for(const [i,name] of items.entries()){const seg=row({primaryAxisAlignItems:'CENTER'});seg.counterAxisSizingMode='FIXED';seg.resize(80,40);bind(seg,'height','size/control-md');bind(seg,'paddingLeft','space/component-padding-md');bind(seg,'paddingRight','space/component-padding-md');
    const sel=v==='single'?i===1:i!==1;if(sel)fill(seg,'color/container/primary');if(i>0){seg.strokes=[paint('color/border/input')];seg.strokeLeftWeight=1;seg.strokeTopWeight=0;seg.strokeRightWeight=0;seg.strokeBottomWeight=0;}
    if(sel&&v==='multiple')seg.appendChild(icon('check_small','sm','color/on/container-primary'));
    seg.appendChild(await txt(name,'label',sel?'color/on/container-primary':'color/text/primary'));c.appendChild(seg);
    if(i===0)layer(seg,s);if(s==='focus'&&i===0)ring(seg,true);}
  if(s==='disabled')dim(c);return c;},{width:1400});
return {sets};
