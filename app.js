const $=id=>document.getElementById(id);
const fmt=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DEF=[['food','Food','🍔','#F59E0B'],['transport','Travel','🚌','#3B82F6'],['shopping','Shopping','🛍️','#EC4899'],['bills','Bills','💡','#8B5CF6'],['health','Health','💊','#10B981'],['fun','Fun','🎬','#EF4444'],['groceries','Groceries','🥬','#84CC16'],['other','Other','✨','#64748B']].map(([id,n,e,c])=>({id,n,e,c}));
const SW=[['Royal purple','#4B2A8F'],['Sapphire','#1E40AF'],['Emerald','#0B6B4F'],['Crimson','#9B1C3F'],['Midnight','#1F2A44'],['Plum','#6B1F5E']];
const FONTS=['Playfair Display','Cormorant Garamond','Lora','Outfit'];
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WD=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
let S={exp:[],budget:0,cats:DEF.map(c=>({...c})),theme:{}};
try{const r=JSON.parse(localStorage.getItem('pocket-ledger')||'null');if(r)Object.assign(S,r)}catch(e){}
S.theme={color:'#4B2A8F',font:'Playfair Display',mode:'auto',...S.theme};
const save=()=>{try{localStorage.setItem('pocket-ledger',JSON.stringify(S))}catch(e){}};
function applyTheme(){const t=S.theme,r=document.documentElement;r.style.setProperty('--brand',t.color);r.style.setProperty('--f',"'"+t.font+"'");t.mode==='auto'?r.removeAttribute('data-theme'):r.setAttribute('data-theme',t.mode)}
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const sm=(k,n)=>{const [y,m]=k.split('-').map(Number);const d=new Date(y,m-1+n,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
const ML=k=>{const [y,m]=k.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('en-IN',{month:'long',year:'numeric'})};
const inP=p=>S.exp.filter(e=>e.date.startsWith(p));
const sumBy=l=>{const o={};l.forEach(e=>o[e.cat]=(o[e.cat]||0)+e.amt);return o};
const tot=l=>l.reduce((a,e)=>a+e.amt,0);
const cat=id=>S.cats.find(c=>c.id===id)||{id,n:'Other',e:'🏷️',c:'#64748B'};
const ranked=s=>Object.keys(s).sort((a,b)=>s[b]-s[a]).map(cat);
let vm=today().slice(0,7),vy=+today().slice(0,4),tab='home',rm='m',filter=null,pick=null,ai={},aiCtx='',aiKey='';

function banner(){
  const t=today(),d=+t.slice(8),mo=+t.slice(5,7),y=+t.slice(0,4),cm=t.slice(0,7),pk=sm(cm,-1);
  const mk=d>=26&&inP(cm).length?cm:(d<=5&&inP(pk).length?pk:null);
  const yk=(mo===12&&d>=20&&inP(String(y)).length)?y:(mo===1&&d<=10&&inP(String(y-1)).length?y-1:null);
  let h='';
  if(mk)h+=`<button class="ban" data-act="openm" data-v="${mk}">📜<span>Your ${ML(mk)} report is ready<small>See where your money went</small></span></button>`;
  if(yk)h+=`<button class="ban" data-act="openy" data-v="${yk}">👑<span>Your ${yk} year in review is ready<small>A full look at the year</small></span></button>`;
  return h}

function home(){
  const all=inP(vm),total=tot(all),b=S.budget,pct=b?Math.min(100,total/b*100):0,sums=sumBy(all),used=ranked(sums);
  let h=`<div class="nav"><button data-act="nav" data-v="-1" aria-label="Previous month">‹</button><h1>${ML(vm)}</h1><button data-act="nav" data-v="1" aria-label="Next month">›</button></div>
  <section class="hero"><small>Spent this month</small><div class="big">${fmt(total)}</div><div class="bar${b&&total>b?' over':''}"><i style="width:${pct}%"></i></div><div class="row"><span>${b?(total>b?fmt(total-b)+' over budget':fmt(b-total)+' left of '+fmt(b)):'No budget set'}</span><button data-act="budget">${b?'Edit budget':'Set budget'}</button></div></section>`+banner();
  if(used.length)h+=`<section class="card"><h2>Where it went</h2><div class="split">${used.map(c=>`<i style="width:${sums[c.id]/total*100}%;background:${c.c}"></i>`).join('')}</div><div class="chips">${used.map(c=>`<button class="chip${filter===c.id?' on':''}" data-act="filter" data-v="${c.id}">${c.e} ${esc(c.n)} <b>${fmt(sums[c.id])}</b></button>`).join('')}</div></section>`;
  const rows=all.filter(e=>!filter||e.cat===filter).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  if(!rows.length)return h+`<div class="empty"><big>🧾</big>No expenses yet. Tap “Add expense” to log your first one.</div>`;
  const dt={};rows.forEach(e=>dt[e.date]=(dt[e.date]||0)+e.amt);let last='';
  rows.forEach(e=>{
    if(e.date!==last){last=e.date;const d=new Date(e.date+'T00:00');h+=`<div class="day"><span>${e.date===today()?'Today':d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</span><span>${fmt(dt[e.date])}</span></div>`}
    const c=cat(e.cat);
    h+=`<div class="item"><div class="ic" style="background:${c.c}26">${c.e}</div><div class="t"><div>${esc(e.note||c.n)}</div><span>${esc(c.n)}</span></div><b>${fmt(e.amt)}</b><button class="x" data-act="del" data-v="${e.id}" aria-label="Delete expense">✕</button></div>`});
  return h}

function rep(){
  const isY=rm==='y',per=isY?'year':'month';
  const list=inP(isY?String(vy):vm),prev=inP(isY?String(vy-1):sm(vm,-1));
  const a=isY?'ynav':'nav';
  let h=`<div class="seg"><button class="${isY?'':'on'}" data-act="seg" data-v="m">Month</button><button class="${isY?'on':''}" data-act="seg" data-v="y">Year</button></div>
  <div class="nav"><button data-act="${a}" data-v="-1" aria-label="Previous">‹</button><h1>${isY?vy:ML(vm)}</h1><button data-act="${a}" data-v="1" aria-label="Next">›</button></div>`;
  if(!list.length)return h+`<div class="empty"><big>📜</big>No expenses in this ${per} yet. Add some and your report will appear here.</div>`;
  const total=tot(list),pt=tot(prev),sums=sumBy(list),ps=sumBy(prev),top=ranked(sums),now=today();
  const cur=now.startsWith(isY?String(vy):vm),n=isY?12:new Date(+vm.slice(0,4),+vm.slice(5,7),0).getDate();
  const el=cur?(isY?+now.slice(5,7):+now.slice(8)):n;
  const b=Array(n).fill(0);list.forEach(e=>b[isY?+e.date.slice(5,7)-1:+e.date.slice(8)-1]+=e.amt);
  const mx=Math.max(...b),mi=b.indexOf(mx),big=list.reduce((x,e)=>e.amt>x.amt?e:x);
  const avg=total/el,proj=avg*n,chg=pt?Math.round((total-pt)/pt*100):null,tc=top[0];
  const wd=Array(7).fill(0);list.forEach(e=>wd[new Date(e.date+'T00:00').getDay()]+=e.amt);const bw=wd.indexOf(Math.max(...wd));
  h+=`<section class="card"><h2>${isY?'Year':'Month'} in review</h2><div style="font-size:20px;font-weight:600;line-height:1.3">${tc.e} ${esc(tc.n)} took ${Math.round(sums[tc.id]/total*100)}% of your money</div><p class="note">You spent ${fmt(total)}${chg===null?'.':', which is '+Math.abs(chg)+'% '+(chg>=0?'more':'less')+' than last '+per+'.'}</p></section>
  <section class="card"><h2>At a glance</h2><div class="grid">
  <div class="stat"><small>${isY?'Monthly':'Daily'} average</small><b>${fmt(avg)}</b></div>
  <div class="stat"><small>${cur?'Likely '+per+' total':'Total'}</small><b>${fmt(proj)}</b></div>
  <div class="stat"><small>Costliest ${isY?'month':'day'}</small><b>${isY?MN[mi]:(mi+1)+' '+MN[+vm.slice(5,7)-1]}</b><div class="dl">${fmt(mx)}</div></div>
  <div class="stat"><small>${isY?'Entries logged':'Busiest weekday'}</small><b>${isY?list.length:WD[bw]}</b>${isY?'':`<div class="dl">${fmt(wd[bw])}</div>`}</div>
  <div class="stat" style="grid-column:1/-1"><small>Largest single expense</small><b>${fmt(big.amt)}</b><div class="dl">${esc(big.note||cat(big.cat).n)} · ${esc(cat(big.cat).n)}</div></div></div></section>
  <section class="card"><h2>${isY?'Month by month':'Day by day'}</h2><div class="days">${b.map((v,i)=>`<i class="${i===mi?'hi':''}" style="height:${mx?Math.max(2,v/mx*100):2}%"></i>`).join('')}</div>${isY?`<div class="axis y">${MN.map(m=>`<span>${m[0]}</span>`).join('')}</div>`:`<div class="axis"><span>1</span><span>${Math.ceil(n/2)}</span><span>${n}</span></div>`}</section>
  <section class="card"><h2>Category ranking</h2>${top.map(c=>{const p=ps[c.id],d=p?Math.round((sums[c.id]-p)/p*100):null;
    return `<div class="crow"><div class="h"><span>${c.e} ${esc(c.n)}</span><b>${fmt(sums[c.id])}</b></div><div class="p"><i style="width:${sums[c.id]/total*100}%;background:${c.c}"></i></div><div class="dl" style="margin-top:4px">${d===null?'new this '+per:`<span class="${d>0?'up':'dn'}">${d>0?'▲':'▼'} ${Math.abs(d)}%</span> vs last ${per}`}</div></div>`}).join('')}</section>`;
  aiKey=rm+(isY?vy:vm);
  h+=`<section class="card"><h2>Smart saving ideas</h2><button class="btn" id="aiBtn" data-act="ai">${ai[aiKey]?'Refresh ideas':'Get ideas from Claude'}</button><div id="aiOut"></div><p class="note">Claude only sees your category totals and largest expense for this ${per}.</p></section>`;
  aiCtx=`Period: ${per} ${isY?vy:ML(vm)}. Total spent ₹${Math.round(total)}. Budget per month: ${S.budget?'₹'+S.budget:'not set'}. ${isY?'Monthly':'Daily'} average ₹${Math.round(avg)}. Previous ${per} total: ${pt?'₹'+Math.round(pt):'no data'}.\nBy category (now vs previous ${per}): ${top.map(c=>`${c.n} ₹${Math.round(sums[c.id])} (before ${ps[c.id]?'₹'+Math.round(ps[c.id]):'none'})`).join('; ')}.\nCostliest ${isY?'month':'day'}: ${isY?MN[mi]:mi+1}. Largest single expense: ₹${Math.round(big.amt)} on ${big.cat&&cat(big.cat).n}.`;
  return h}

function showAI(){
  const out=$('aiOut');if(!out)return;out.textContent='';
  (ai[aiKey]||'').split('\n').map(s=>s.trim()).filter(Boolean).forEach(l=>{
    const d=document.createElement('div');d.className='tip';
    const ic=document.createElement('span'),tx=document.createElement('span');
    ic.textContent=/^win:/i.test(l)?'🎉':'💡';tx.textContent=l.replace(/^(-|•|\*|win:)\s*/i,'');d.append(ic,tx);out.append(d)})}
async function askAI(){
  const out=$('aiOut'),btn=$('aiBtn'),key=aiKey;
  let sample=null;try{sample=await claude.use('sample')}catch(e){}
  if(!sample){out.textContent='Smart ideas work when this page is opened inside claude.ai.';return}
  btn.disabled=true;out.textContent='Studying your spending…';
  const p='You are a warm, practical money coach for someone in India. Their spending data (rupees):\n'+aiCtx+'\n\nGive exactly 4 specific tips for spending smarter next '+(key[0]==='y'?'year':'month')+'. Each tip is one short sentence that names a real category and real amount from the data and says what to do. Start each with "- ". Then one last line starting with "Win:" praising something positive. No other text, no markdown.';
  try{const r=await sample(p,{modelTier:'quick',cache:false,onText:({text})=>{if(aiKey===key){ai[key]=text;showAI()}}});ai[key]=r.text;if(aiKey===key&&tab==='rep')showAI()}
  catch(e){const o=$('aiOut');if(o)o.textContent=e&&e.code==='not_granted'?'Permission was declined, so no ideas this time.':e&&e.code==='rate_limited'?'Too many requests. Wait a minute and try again.':'Could not get ideas right now. Try again in a moment.'}
  const b=$('aiBtn');if(b){b.disabled=false;b.textContent='Refresh ideas'}}

function set(){
  const t=S.theme;
  return `<section class="card"><h2>Theme colour</h2><div class="sw">${SW.map(([n,c])=>`<button class="${t.color.toLowerCase()===c.toLowerCase()?'on':''}" style="background:${c}" data-act="color" data-v="${c}" aria-label="${n}"></button>`).join('')}<label class="cp" title="Pick your own colour">+<input id="cc" type="color" value="${t.color}"></label></div></section>
  <section class="card"><h2>Font</h2><div class="chips">${FONTS.map(f=>`<button class="chip${t.font===f?' on':''}" style="font-family:'${f}'" data-act="font" data-v="${f}">${f}</button>`).join('')}</div></section>
  <section class="card"><h2>Appearance</h2><div class="seg">${[['auto','Auto'],['light','Light'],['dark','Dark']].map(([k,l])=>`<button class="${t.mode===k?'on':''}" data-act="mode" data-v="${k}">${l}</button>`).join('')}</div></section>
  <section class="card"><h2>Expense categories</h2>${S.cats.map(c=>`<div class="row2"><span class="ic" style="background:${c.c}26">${c.e}</span><span style="flex:1">${esc(c.n)}</span><button class="x" data-act="delcat" data-v="${c.id}" aria-label="Remove ${esc(c.n)}">✕</button></div>`).join('')}
  <div class="addc"><input id="ne" value="🏷️" aria-label="Emoji"><input id="nn" placeholder="New category" maxlength="18"><input id="nc" type="color" value="#7C3AED" aria-label="Colour"><button data-act="addcat">Add</button></div></section>
  <section class="card"><h2>Your data</h2><p class="note" style="margin:0">Everything is saved on this device only.</p><button class="ghost" data-act="reset">Erase all data</button></section>`}

const ACT={
  nav:v=>{vm=sm(vm,+v);filter=null;render()},ynav:v=>{vy+=+v;render()},
  tab:v=>{tab=v;scrollTo(0,0);render()},seg:v=>{rm=v;render()},filter:v=>{filter=filter===v?null:v;render()},
  budget:()=>{const v=prompt('Monthly budget in ₹ (0 to remove)',S.budget||'');if(v===null)return;const n=parseFloat(v);if(!isNaN(n)&&n>=0){S.budget=n;save();render()}},
  del:v=>{if(confirm('Delete this expense?')){S.exp=S.exp.filter(x=>String(x.id)!==v);save();render()}},
  openm:v=>{vm=v;rm='m';tab='rep';scrollTo(0,0);render()},openy:v=>{vy=+v;rm='y';tab='rep';scrollTo(0,0);render()},
  color:v=>{S.theme.color=v;save();applyTheme();render()},font:v=>{S.theme.font=v;save();applyTheme();render()},mode:v=>{S.theme.mode=v;save();applyTheme();render()},
  delcat:v=>{if(S.cats.length>1&&confirm('Remove this category? Past expenses keep their amounts.')){S.cats=S.cats.filter(c=>c.id!==v);save();render()}},
  addcat:()=>{const n=$('nn').value.trim();if(!n){$('nn').focus();return}
    S.cats.push({id:'c'+Date.now(),n,e:Array.from($('ne').value.trim()||'🏷️').slice(0,4).join(''),c:$('nc').value});save();render()},
  reset:()=>{if(confirm('Erase every expense, category and setting?')){S.exp=[];S.budget=0;S.cats=DEF.map(c=>({...c}));S.theme={color:'#4B2A8F',font:'Playfair Display',mode:'auto'};save();applyTheme();render()}},
  ai:()=>askAI()};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(t&&ACT[t.dataset.act])ACT[t.dataset.act](t.dataset.v,t)});
document.addEventListener('input',e=>{if(e.target.id==='cc'){S.theme.color=e.target.value;save();applyTheme()}});

function render(){
  document.querySelectorAll('.tabbar button').forEach(b=>b.classList.toggle('on',b.dataset.v===tab));
  $('add').style.display=tab==='set'?'none':'block';
  $('v').innerHTML='<div class="brand">♛ Royal Ledger</div>'+(tab==='home'?home():tab==='rep'?rep():set());
  if(tab==='rep')showAI()}

function drawCats(){$('cats').innerHTML=S.cats.map(c=>`<button class="cat${pick===c.id?' on':''}" data-c="${c.id}"><span>${c.e}</span>${esc(c.n)}</button>`).join('');
  $('cats').querySelectorAll('.cat').forEach(el=>el.onclick=()=>{pick=el.dataset.c;drawCats()})}
function open(o){$('sheet').classList.toggle('show',o);$('scrim').classList.toggle('show',o);
  if(o){pick=S.cats[0].id;$('amount').value='';$('note').value='';$('date').value=today();$('save').disabled=true;drawCats();setTimeout(()=>$('amount').focus(),250)}}
$('add').onclick=()=>open(true);$('scrim').onclick=()=>open(false);
$('amount').oninput=()=>{$('save').disabled=!(parseFloat($('amount').value)>0)};
$('save').onclick=()=>{const a=parseFloat($('amount').value);if(!(a>0))return;const d=$('date').value||today();
  S.exp.push({id:Date.now(),amt:a,cat:pick,note:$('note').value.trim(),date:d});save();vm=d.slice(0,7);filter=null;tab='home';open(false);render()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')open(false);if(e.key==='Enter'&&$('sheet').classList.contains('show'))$('save').click()});
applyTheme();render();
