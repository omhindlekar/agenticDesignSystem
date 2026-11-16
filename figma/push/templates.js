const page=figma.root.children.find(p=>p.name==='Templates');await figma.setCurrentPageAsync(page);
//LIB
// Page templates: each variant shows its regions; dashed boxes are named slots. Bound to variables.
const slot=async(label,o={})=>{const b=row();b.name='Slot: '+label;fill(b,o.fill||'color/background/sunken');b.strokes=[paint('color/border/strong')];b.strokeAlign='INSIDE';b.dashPattern=[4,4];b.setBoundVariable('strokeWeight',V('border/width-default'));pad(b,'space/component-padding-md','space/component-padding-sm');b.appendChild(await txt(label,'body2','color/text/secondary'));return b;};
const btn=async(label,kind)=>{const b=row({primaryAxisAlignItems:'CENTER'});b.name='Button '+label;bind(b,'height','size/control-lg');b.counterAxisSizingMode='FIXED';pad(b,'space/component-padding-lg');
  if(kind==='contained')fill(b,'color/interactive/default');else if(kind==='outlined')stroke(b,'color/border/interactive');
  b.appendChild(await txt(label,'button',kind==='contained'?'color/text/inverse':'color/text/link'));return b;};
const title=async(t,d)=>{const h=col();bind(h,'itemSpacing','space/component-gap-sm');h.appendChild(await txt(t,'h1','color/text/heading'));if(d)h.appendChild(await txt(d,'body1','color/text/secondary'));return h;};
const frame=(w,bg)=>{const c=C('VERTICAL');fixW(c,w);fill(c,bg||'color/background/sunken');stroke(c,'color/border/default');return c;};
const add=(p,n,f)=>{p.appendChild(n);if(f)fillW(n);return n;};
await makeSet('auth-page','AuthPage','Sign-in, sign-up and account recovery screens: a titled form with one primary action, recovery links and an optional alternative such as single sign-on.',['centred','split'],['default'],async(v)=>{
  const c=C('HORIZONTAL');c.counterAxisAlignItems='MIN';fill(c,v==='centred'?'color/background/sunken':'color/background/page');stroke(c,'color/border/default');
  if(v==='split'){const a=col();a.name='Aside';fixW(a,400);fill(a,'color/container/primary');pad(a,'layout/margin-lg','space/layout-section');bind(a,'itemSpacing','space/component-gap-md');a.primaryAxisAlignItems='CENTER';
    a.appendChild(await txt('Your account, kept secure','h2','color/on/container-primary'));add(a,await slot('aside: reassurance',{fill:'color/container/primary'}),true);c.appendChild(a);a.layoutSizingVertical='FILL';}
  const m=col();m.name='Main';pad(m,'layout/margin-md','space/layout-section');bind(m,'itemSpacing','space/layout-section');m.counterAxisAlignItems='CENTER';c.appendChild(m);fixW(m,560);
  m.appendChild(await txt('Agentic DS','h4','color/text/heading'));
  const p=col();p.name='Form panel';fixW(p,432);bind(p,'itemSpacing','space/component-gap-md');if(v==='centred'){fill(p,'color/background/surface');stroke(p,'color/border/default');pad(p,'space/component-padding-lg','space/component-padding-lg');}m.appendChild(p);
  add(p,await title('Sign in','Use the email address registered to your account.'),true);
  add(p,await slot('form: Email address'),true);add(p,await slot('form: Password'),true);
  const s=row();s.name='Secondary actions';s.primaryAxisAlignItems='MAX';add(p,s,true);s.appendChild(await txt('Forgot your password?','label','color/text/link'));
  add(p,await btn('Sign in','contained'),true);
  const or=row();or.name='Or';or.primaryAxisAlignItems='CENTER';add(p,or,true);or.appendChild(await txt('or','caption','color/text/secondary'));
  add(p,await btn('Sign in with single sign-on','outlined'),true);
  add(m,await slot('footer: legal links'),true);return c;});
await makeSet('form-page','FormPage','A page whose job is one form, such as checkout or account details: titled sections of fields, then the actions, with an optional summary beside the form.',['single-column','with-summary'],['default'],async(v)=>{
  const c=frame(v==='with-summary'?1080:720);pad(c,'layout/margin-md','space/layout-section');bind(c,'itemSpacing','space/layout-section');
  add(c,await title('Checkout','Check your details, then place your order.'),true);
  const l=row();l.counterAxisAlignItems='MIN';bind(l,'itemSpacing','space/layout-section');add(c,l,true);
  const f=col();f.name='Form';bind(f,'itemSpacing','space/component-padding-lg');l.appendChild(f);f.layoutSizingHorizontal='FILL';
  add(f,await slot('sections: Shipping address',{fill:'color/background/surface'}),true);add(f,await slot('sections: Payment',{fill:'color/background/surface'}),true);
  const a=row();a.name='Actions';a.primaryAxisAlignItems='MAX';add(f,a,true);a.appendChild(await btn('Place order','contained'));
  if(v==='with-summary'){const s=await slot('summary: Order summary',{fill:'color/background/surface'});l.appendChild(s);fixW(s,320);}return c;});
await makeSet('settings-page','SettingsPage','Account and app settings: titled sections of settings, optional settings navigation, and the danger zone last.',['with-nav','single'],['default'],async(v)=>{
  const c=frame(v==='with-nav'?1000:720);pad(c,'layout/margin-md','space/layout-section');bind(c,'itemSpacing','space/layout-section');
  add(c,await title('Settings','Manage your profile and notifications.'),true);
  const l=row();l.counterAxisAlignItems='MIN';bind(l,'itemSpacing','space/layout-section');add(c,l,true);
  if(v==='with-nav'){const n=await slot('nav: SideNav');l.appendChild(n);fixW(n,240);}
  const s=col();s.name='Sections';bind(s,'itemSpacing','space/component-padding-lg');l.appendChild(s);s.layoutSizingHorizontal='FILL';
  add(s,await slot('sections: Profile',{fill:'color/background/surface'}),true);add(s,await slot('sections: Notifications',{fill:'color/background/surface'}),true);
  const d=col();d.name='Danger zone';fill(d,'color/background/surface');stroke(d,'color/border/danger');pad(d,'space/component-padding-lg','space/component-padding-lg');bind(d,'itemSpacing','space/component-gap-sm');add(s,d,true);
  d.appendChild(await txt('Delete account','h3','color/text/heading'));d.appendChild(await txt('This permanently deletes your account and its data.','body2','color/text/secondary'));return c;});
await makeSet('dashboard-page','DashboardPage','An overview page: a header row with title, filters and actions, a row of KPI tiles, the main content and an optional aside.',['default'],['default'],async()=>{
  const c=frame(1280);pad(c,'layout/margin-md','space/layout-section');bind(c,'itemSpacing','space/layout-section');
  const h=row();h.counterAxisAlignItems='MAX';h.primaryAxisAlignItems='SPACE_BETWEEN';add(c,h,true);h.appendChild(await title('Overview','How your business is doing this month.'));
  const t=row();bind(t,'itemSpacing','space/component-gap-sm');h.appendChild(t);for(const s of ['filters: Search','filters: From','filters: To','filters: Filter'])t.appendChild(await slot(s));t.appendChild(await btn('Export','outlined'));
  const k=row();bind(k,'itemSpacing','layout/gutter-lg');add(c,k,true);for(const s of ['Balance','Money in','Money out','Pending']){const x=await slot('kpis: '+s,{fill:'color/background/surface'});k.appendChild(x);x.layoutGrow=1;}
  const b=row();b.counterAxisAlignItems='MIN';bind(b,'itemSpacing','layout/gutter-lg');add(c,b,true);const ct=await slot('content: Recent transactions',{fill:'color/background/surface'});b.appendChild(ct);ct.layoutGrow=2;const as=await slot('aside',{fill:'color/background/surface'});b.appendChild(as);as.layoutGrow=1;return c;},{width:1400});
await makeSet('empty-state','EmptyState','Nothing to show yet: an icon, a title saying what is empty, one sentence on why, and the action that fills it.',['page','inline'],['default'],async(v)=>{
  const c=frame(v==='page'?720:560,v==='page'?'color/background/sunken':'color/background/surface');c.counterAxisAlignItems='CENTER';pad(c,'space/component-padding-lg','space/layout-section');bind(c,'itemSpacing','space/component-gap-md');
  if(v==='inline'){c.strokes=[paint('color/border/strong')];c.dashPattern=[6,4];}
  const i=row();fill(i,'color/container/primary');pad(i,'space/component-padding-md','space/component-padding-md');i.appendChild(icon('mail','lg','color/on/container-primary'));c.appendChild(i);
  c.appendChild(await txt('No invoices yet',v==='page'?'h1':'h3','color/text/heading'));c.appendChild(await txt('Invoices you send appear here, with their status.','body1','color/text/secondary'));
  c.appendChild(await btn('Create invoice','contained'));return c;});
await makeSet('error-page','ErrorPage','A full-page error in plain words — page not found, a server error or offline — with the way back.',['404','500','offline'],['default'],async(v)=>{
  const k={'404':['Error 404','search','We can’t find that page','Go to the home page'],'500':['Error 500','warning','Something went wrong on our side','Try again'],offline:['No connection','info','You’re offline','Try again']}[v];
  const c=frame(560);c.counterAxisAlignItems='CENTER';pad(c,'space/component-padding-lg','space/layout-section');bind(c,'itemSpacing','space/component-gap-md');
  const i=row();fill(i,'color/container/primary');pad(i,'space/component-padding-md','space/component-padding-md');i.appendChild(icon(k[1],'lg','color/on/container-primary'));c.appendChild(i);
  c.appendChild(await txt(k[0],'overline','color/text/secondary'));c.appendChild(await txt(k[2],'h2','color/text/heading'));c.appendChild(await btn(k[3],'contained'));return c;},{width:1300});
return {sets};
