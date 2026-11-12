/* ================= 에스프레소 단계 (실기 시연 1~6) ================= */
const SCALE=2;                 /* 화면의 1초가 실제로는 0.5초 */
const FLOW=9;                  /* 버튼을 누르고 화면 9초(실제 4.5초)부터 커피가 나온다: 잔 내릴 시간 */
const RATE=30/(30-FLOW);       /* 화면 30초에 30ml */
const CAP=Math.round((41-FLOW)*RATE);  /* 잔이 넘치는 양: 40초를 넘기면 넘친다 */
const svgJ=$('#judge'),svgP=$('#prepSvg');
const scene=w=>stage.classList.toggle('st',w==='bar');
const store={get(k,d){try{const v=localStorage.getItem('kb_'+k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('kb_'+k,v)}catch(e){}}};
function judgeOf(s){if(s<20)return{k:'fail',t:'실격',c:'var(--red)',why:'20초보다 짧아요'};if(s<=24)return{k:'good',t:'좋아요',c:'var(--g1)'};
  if(s<=30)return{k:'best',t:'아주 좋아요',c:'var(--g2)'};if(s<=40)return{k:'try',t:'노력해요',c:'var(--yel)'};return{k:'fail',t:'실격',c:'var(--red)',why:'40초를 넘었어요'}}
const COL={g2:'var(--g2)',g1:'var(--g1)',yel:'var(--yel)',red:'var(--red)'};
/* 메뉴마다 쓰는 그룹·버튼·잔 */
const MODES={
  esp:{key:'esp',name:'에스프레소',side:'오른쪽',grp:{x:910,y:366},btn:{x:980,y:252},bs:'',cup:'demi',cupName:'데미타세 잔',
    slots:[{x:864,y:548},{x:956,y:548}],other:{x:590,y:366}},
  cap:{key:'cap',name:'카푸치노',side:'왼쪽',grp:{x:590,y:366},btn:{x:520,y:252},bs:'L',cup:'capp',cupName:'카푸치노 잔',
    slots:[{x:528,y:548},{x:654,y:548}],other:{x:910,y:366}}};
let M=MODES.esp;

/* ---------- 그림: 투명 데미타세 ---------- */
const CS=1;                    /* 데미타세 크기 (카푸치노 잔보다 작게) */
const SHOW_LINE=true;          /* 30ml 표시선: 연습 때만. 실전 15분에서는 false */
const KIND={demi:{GH:58,GR:30,cap:CAP,warm:[{x:520,y:186},{x:600,y:186}]},capp:{GH:72,GR:47,cap:150,warm:[{x:722,y:186},{x:838,y:186}]}};
function glassCup(uid,scale=1,kind='demi'){const g=document.createElementNS(NS,'g');g.setAttribute('class','hit');
  const {GH,GR,cap}=KIND[kind],mlY=ml=>-clamp(ml,0,cap)/cap*GH*.92,GLINE=mlY(30);
  const body=`M-${GR} -${GH}C-${GR} -16 -18 0 -8 0L8 0C18 0 ${GR} -16 ${GR} -${GH}Z`;
  g.innerHTML=`<g class="cin"><g transform="scale(${scale})">
  <ellipse cx="0" cy="3" rx="${GR*.8}" ry="5" fill="#4a2c22" opacity=".14"/>
  <path d="M-${GR-3} -${GH*.8}C-${GR+22} -${GH*.86} -${GR+22} -${GH*.34} -${GR-10} -${GH*.27}" fill="none" stroke="#4a2c22" stroke-width="12" stroke-linecap="round"/>
  <path d="M-${GR-3} -${GH*.8}C-${GR+22} -${GH*.86} -${GR+22} -${GH*.34} -${GR-10} -${GH*.27}" fill="none" stroke="#f3fafb" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="0" cy="-${GH}" rx="${GR}" ry="7" fill="#e9f3f5"/>
  <clipPath id="gc${uid}"><path d="${body}"/></clipPath>
  <g clip-path="url(#gc${uid})"><rect class="liq" x="-60" y="0" width="120" height="0" fill="#3a1d10"/><rect class="milk" x="-60" y="0" width="120" height="0" fill="#d9a877"/><rect class="crema" x="-60" y="0" width="120" height="0" fill="#c98a4b"/></g>
  <path d="${body}" fill="#dff1f5" fill-opacity=".32" class="o4"/>
  <path d="M-${GR-8} -${GH-10}Q-${GR-7} -26 -${GR-14} -12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
  <path class="mline" d="M-${GR-3} ${GLINE.toFixed(1)}H${GR-3}" stroke="#e2634d" stroke-width="2.5" stroke-dasharray="5 4"/>
  <text class="mlt" x="${GR+6}" y="${(GLINE+5).toFixed(1)}" font-size="13" fill="#e2634d" style="display:none">30ml</text>
  <ellipse cx="0" cy="-${GH}" rx="${GR}" ry="7" class="o3 nf"/>
  <g class="spill" style="display:none"><path class="drip" d="M-${GR-2} -${GH-4}V-4" stroke="#5a3220" stroke-width="5" fill="none" stroke-linecap="round"/><path class="drip" d="M${GR-4} -${GH-4}V-8" stroke="#5a3220" stroke-width="5" fill="none" stroke-linecap="round" style="animation-delay:-.3s"/></g>
  </g></g>`;
  const c={g,kind,sp:new Sp(g),ml:0,milk:0,mlY,mline:$('.mline',g),liq:$('.liq',g),milkR:$('.milk',g),crema:$('.crema',g),spill:$('.spill',g),mlt:$('.mlt',g),inner:$('.cin',g)};
  c.set=ml=>{c.ml=ml;const y=mlY(ml);c.liq.setAttribute('y',y.toFixed(1));c.liq.setAttribute('height',(-y).toFixed(1));
    const top=mlY(ml+c.milk),cr=c.milk>0?clamp(c.milk*.12,4,16):ml>2?clamp(2+ml*.18,2,7):0;c.milkR.setAttribute('y',top.toFixed(1));c.milkR.setAttribute('height',(y-top).toFixed(1));
    c.crema.setAttribute('y',top.toFixed(1));c.crema.setAttribute('height',cr.toFixed(1));c.crema.setAttribute('fill',c.milk>0?'#fffaf0':'#c98a4b');c.spill.style.display=kind==='demi'&&ml>cap?'':'none'};
  c.addMilk=m=>{c.milk=m;c.set(c.ml)};
  c.line=on=>{c.mline.style.display=on?'':'none'};c.set(0);return c}
const saucerSide=(rx=46)=>`<ellipse cx="0" cy="2" rx="${rx}" ry="${rx*.22}" fill="#fff" class="o3"/><ellipse cx="0" cy="0" rx="${rx*.55}" ry="${rx*.11}" fill="#eee6dc"/>`;
const spoonSide=`<path d="M-40 -2H18" stroke="#4a2c22" stroke-width="7" stroke-linecap="round"/><path d="M-40 -2H18" stroke="#cdd6dc" stroke-width="3" stroke-linecap="round"/><ellipse cx="26" cy="-2" rx="10" ry="4.5" fill="#cdd6dc" class="o3"/>`;

/* ---------- 그림: 포터필터(투 스파우트), 탬퍼, 붓 ---------- */
$('#pf').innerHTML=`
  <path d="M-46 0C-46 30 -34 46 -22 46L22 46C34 46 46 30 46 0Z" fill="url(#gChromeH)" class="o"/>
  <path d="M18 44C30 38 40 24 42 6L31 6C29 22 23 36 12 44Z" fill="#8c9ba6" opacity=".7"/>
  <path d="M-12 44H12L10 62H-10Z" fill="#b7c3cb" class="o3"/>
  <path d="M-8 60L-17 88M8 60L17 88" stroke="#4a2c22" stroke-width="11" stroke-linecap="round"/><path d="M-8 60L-17 88M8 60L17 88" stroke="#c9d3d9" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="0" cy="0" rx="50" ry="13" fill="#dfe6ea" class="o"/>
  <ellipse cx="0" cy="0" rx="40" ry="9" fill="#5b4840" class="o3"/>
  <ellipse id="pfFlat" cx="0" cy="1.5" rx="36.5" ry="7" fill="#3f2314" style="display:none"/>
  <path id="pfMound" d="" fill="#6b3f26" class="o3" style="display:none"/>
  <g id="pfH"><path d="M46 2L120 12" stroke="#4a2c22" stroke-width="14" stroke-linecap="round"/><path d="M46 2L120 12" stroke="#b7c3cb" stroke-width="7" stroke-linecap="round"/>
  <path d="M112 10L178 20Q190 22 188 32Q186 42 174 40L110 30Z" fill="#3b2a26" class="o4"/></g>`;
$('#tamp').innerHTML=`
  <rect x="-38" y="-18" width="76" height="18" rx="5" fill="url(#gChromeH)" class="o4"/>
  <rect x="-15" y="-30" width="30" height="13" rx="3" fill="url(#gChromeH)" class="o3"/>
  <path d="M-13 -30C-15 -46 -27 -58 -27 -74Q-27 -94 0 -94Q27 -94 27 -74C27 -58 15 -46 13 -30Z" fill="#6b4434" class="o4"/>
  <path d="M-16 -76Q-14 -86 -2 -88" stroke="#fff" stroke-width="5" opacity=".45" fill="none" stroke-linecap="round"/>`;
$('#brush').innerHTML=`
  <ellipse cx="0" cy="14" rx="70" ry="6" fill="#4a2c22" opacity=".14"/>
  <path d="M-70 4Q-74 -4 -66 -8L8 -10L8 8L-66 8Q-72 8 -70 4Z" fill="#c98f5c" class="o4"/>
  <rect x="6" y="-12" width="18" height="22" rx="3" fill="url(#gChromeH)" class="o3"/>
  <path d="M24 -12L66 -18L66 16L24 10Z" fill="#e9c98f" class="o4"/>
  <path d="M30 -8L62 -12M30 0L62 0M30 6L62 10" stroke="#b8925a" stroke-width="3"/>`;
$('#pf2').innerHTML=$('#pf').innerHTML.replace(/ id="[^"]+"/g,'');
const PF=new Sp($('#pf')),TAMP=new Sp($('#tamp')),RIMF=new Sp($('#rimFront')),BR=new Sp($('#brush'));
const P={grind:{x:1330,y:494},gBtn:{x:1330,y:398},tamp:{x:1450,y:594},tampReady:{x:1450,y:536},tampRest:{x:1556,y:640},
  tray:[{x:160,y:624},{x:300,y:624}],brush:{x:1206,y:652}};
function setGrounds(g,tamped){const m=$('#pfMound'),f=$('#pfFlat');if(tamped){m.style.display='none';f.style.display='';return}
  f.style.display='none';if(g<=.02){m.style.display='none';return}m.style.display='';const h=(15*g*1.4).toFixed(1);m.setAttribute('d',`M-38 0C-30 ${-h} 30 ${-h} 38 0A38 8 0 0 1 -38 0Z`)}
let handleS=1;
function setHandle(s){handleS=s;$('#pfH').setAttribute('transform',`scale(${s.toFixed(3)} 1)`)}
/* 손잡이를 옆으로 끌어서 돌린다. out: 오른쪽 → 왼쪽(빼기), in: 왼쪽 → 오른쪽(끼우기) */
function twistPF(dir){return new Promise(res=>{const el=$('#pf'),from=dir==='out'?1:-.7,to=dir==='out'?-.7:1,y0=M.grp.y,y1=M.grp.y+30;let g=null,done=false;
  setHandle(from);$('#collar').style.display='';PF.set({x:M.grp.x,y:dir==='out'?y0:y1});
  Panel.hint(dir==='out'?'포터필터 손잡이를 <em>왼쪽으로 돌려서</em> 빼요':'손잡이를 <em>오른쪽으로 돌려서</em> 끼워요');
  const hx=dir==='out'?PF.x+150:PF.x-110;Guide.drag({x:hx,y:PF.y+30},{x:dir==='out'?PF.x-110:PF.x+150,y:PF.y+30});
  const prog=s=>(s-from)/(to-from);
  const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}g={x0:spt(e).x,s0:handleS};Guide.pause();SFX.pick()};
  const mv=e=>{if(!g||done)return;const dx=spt(e).x-g.x0;let s=clamp(g.s0+dx/150,-.7,1);setHandle(s);const k=clamp(prog(s),0,1);PF.set({y:dir==='out'?y0+6*k:y1-(y1-y0)*k});
    if(k>=.97){done=true;off();fin()}};
  const up=()=>{if(!g||done)return;g=null;anim(250,t=>{setHandle(lerp(handleS,from,t));PF.set({y:dir==='out'?y0:y1})}).then(()=>{if(!done)Guide.resume()})};
  const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
  async function fin(){Guide.stop();SFX.snap();setHandle(to);
    if(dir==='out'){await PF.to({y:y1+4},220,E.out);$('#collar').style.display='none';floatText(PF.x,PF.y-40,'빠졌어요!')}
    else{await PF.to({y:y0},160,E.back);floatText(PF.x,PF.y-60,'딱!')}
    res()}
  el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)})}
function setBrewBtn(on){const s=M.bs;$('#bPlay'+s).style.display=on?'none':'';$('#bStop'+s).style.display=on?'':'none';$('#bFace'+s).setAttribute('fill',on?'#ff7a6b':'#7fd08a')}
const needle=p=>$('#needle').setAttribute('transform',`rotate(${-120+clamp(p,0,1)*240} 750 430)`);
function puddle(k){const e=$('#puddle');e.style.display=k>.01?'':'none';e.setAttribute('rx',30+120*k);e.setAttribute('ry',3+5*k);
  const r=clamp((k-.35)/.65,0,1);$('#runoff').style.display=r>0?'':'none';$('#floorPud').setAttribute('rx',20+110*r);$('#floorPud').setAttribute('ry',2+7*r)}
function stream(on,t,now){[['#st1',0],['#st2',1]].forEach(([id,i])=>{const e=$(id);if(!on){e.setAttribute('d','');return}
  const sx=PF.x+(i?17:-17),sy=PF.y+90,c=Cup.at[i],tx=M.slots[i].x,ty=c?M.slots[i].y+c.mlY(c.ml)*(c.kind==='demi'?CS:1):M.slots[i].y-4,w=Math.sin(now/110+i)*1.4;
  e.setAttribute('d',`M${sx} ${sy}C${sx+w} ${lerp(sy,ty,.4)} ${tx-w} ${lerp(sy,ty,.7)} ${tx} ${ty}`);
  e.setAttribute('stroke',mix('#2a140c','#b9773f',clamp((t-FLOW)/26,0,1)));e.setAttribute('stroke-width',t<FLOW+2?3:4.5);
  if(t<FLOW+2){e.setAttribute('stroke-dasharray','7 12');e.setAttribute('stroke-dashoffset',(-(now/9)%19).toFixed(1))}else e.removeAttribute('stroke-dasharray')})}

/* ---------- 그림: 심사위원 ---------- */
const JUDGES=[{name:'곰 심사위원',x:470,fur:'#c9905f',fur2:'#f6dcbb',ear:'#8f5c38',top:'#5d7fb0',tie:'#ff8a73',kind:'bear',pitch:.8},
  {name:'고양이 심사위원',x:1130,fur:'#f3b56d',fur2:'#fde6c4',ear:'#ffc2c7',top:'#7a6aa8',tie:'#f6c667',kind:'cat',pitch:1.25}];
function judgeSVG(j,i){
  const ears=j.kind==='bear'?`<circle cx="-92" cy="-84" r="38" fill="${j.fur}" class="o"/><circle cx="-92" cy="-84" r="19" fill="${j.ear}"/><circle cx="92" cy="-84" r="38" fill="${j.fur}" class="o"/><circle cx="92" cy="-84" r="19" fill="${j.ear}"/>`
    :`<path d="M-118 -40L-104 -150L-32 -98Z" fill="${j.fur}" class="o"/><path d="M-100 -70L-95 -122L-58 -96Z" fill="${j.ear}"/><path d="M118 -40L104 -150L32 -98Z" fill="${j.fur}" class="o"/><path d="M100 -70L95 -122L58 -96Z" fill="${j.ear}"/>`;
  const extra=j.kind==='bear'?`<circle cx="-48" cy="-10" r="27" fill="#fff" fill-opacity=".35" class="o4"/><circle cx="48" cy="-10" r="27" fill="#fff" fill-opacity=".35" class="o4"/><path d="M-21 -12Q0 -22 21 -12" class="o4 nf"/>`
    :`<path d="M-18 -104V-84M0 -108V-84M18 -104V-84" stroke="#d98f45" stroke-width="8" stroke-linecap="round"/><path d="M-72 40L-124 30M-72 54L-122 62M72 40L124 30M72 54L122 62" class="o3 nf"/>`;
  return `<g id="J${i}" transform="translate(${j.x} 600)">
   <path d="M-170 0C-172 -100 -138 -176 -66 -194C-24 -204 24 -204 66 -194C138 -176 172 -100 170 0Z" fill="${j.top}" class="o"/>
   <path d="M-60 -196L0 -120L60 -196" fill="#fff" class="o4"/>
   <path d="M-14 -150L0 -164L14 -150L8 -60L0 -48L-8 -60Z" fill="${j.tie}" class="o4"/>
   <g class="jhead"><g transform="translate(0 -312)"><g class="bob">${ears}
    <ellipse cx="0" cy="0" rx="126" ry="112" fill="${j.fur}" class="o"/>
    <ellipse cx="0" cy="38" rx="60" ry="44" fill="${j.fur2}"/>
    <ellipse cx="-84" cy="30" rx="21" ry="12" fill="#ff9aa2" opacity=".55"/><ellipse cx="84" cy="30" rx="21" ry="12" fill="#ff9aa2" opacity=".55"/>
    <g class="eOpen"><g class="blink"><circle cx="-48" cy="-10" r="12" fill="#4a2c22"/><circle cx="-52" cy="-15" r="4" fill="#fff"/><circle cx="48" cy="-10" r="12" fill="#4a2c22"/><circle cx="44" cy="-15" r="4" fill="#fff"/></g></g>
    <path class="eHappy o nf" d="M-64 -6Q-48 -24 -32 -6M32 -6Q48 -24 64 -6" style="display:none"/>
    <path d="M-12 14Q0 7 12 14Q9 27 0 29Q-9 27 -12 14Z" fill="#4a2c22"/>
    <path class="mIdle o4 nf" d="M0 29V38M-19 38Q-9 50 0 38Q9 50 19 38"/>
    <g class="mTalk" style="display:none"><path d="M0 29V36" class="o4 nf"/><ellipse cx="0" cy="47" rx="13" ry="12" fill="#7a2f2a" class="o4"/></g>
    ${extra}</g></g></g>
   <g transform="translate(${i?-96:96} -40) rotate(${i?8:-8})"><rect x="-44" y="-62" width="88" height="112" rx="8" fill="#c98f5c" class="o4"/><rect x="-34" y="-48" width="68" height="88" rx="4" fill="#fff" class="o3"/>
     <rect x="-14" y="-70" width="28" height="14" rx="4" fill="#9aa6ad" class="o3"/><path d="M-24 -30H24M-24 -14H24M-24 2H10" stroke="#cfc3b2" stroke-width="5" stroke-linecap="round"/>
     <g class="check" style="opacity:0"><path d="M-22 22l10 10 22-22" stroke="#2f9e5b" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>
   <ellipse cx="${i?-96:96}" cy="0" rx="34" ry="22" fill="${j.fur}" class="o"/><ellipse cx="${i?96:-96}" cy="-6" rx="34" ry="22" fill="${j.fur}" class="o"/>
  </g>`}
$('#judges').innerHTML=JUDGES.map(judgeSVG).join('');
$('#plates').innerHTML=JUDGES.map((j,i)=>`<g transform="translate(${j.x} 700)"><rect x="-100" y="-34" width="200" height="68" rx="10" fill="#fff" class="o4"/><text y="12" text-anchor="middle" font-size="32" fill="#4a2c22">심사위원 ${i+1}</text></g>`).join('');
function jface(i,m){const g=$('#J'+i),q=(s,v)=>{const e=$(s,g);if(e)e.style.display=v?'':'none'};q('.mIdle',m!=='talk');q('.mTalk',m==='talk');q('.eOpen',m!=='happy');q('.eHappy',m==='happy')}
function nod(i){const h=$('#J'+i+' .jhead');h.classList.remove('nod');void h.getBoundingClientRect();h.classList.add('nod')}
function check(i){const c=$('#J'+i+' .check');anim(300,t=>c.style.opacity=t)}
async function judgeSay(i,text){Bubble.show(JUDGES[i].name,esc(text));SFX.pop();let on=true,f=0;const iv=setInterval(()=>{if(on)jface(i,(f++)%2?'idle':'talk')},150);
  await tts(text,JUDGES[i].pitch);on=false;clearInterval(iv);jface(i,'idle')}

/* ---------- 상태 ---------- */
const Cup={all:[],at:[null,null]};
let R=null;   /* 이번 판 기록 */
let STEPS=['인사·자기소개','원두 설명','메뉴 설명','서빙 준비','추출','서빙'];
const step=n=>{$('#step').innerHTML=M.name+' <b>'+n+'/'+STEPS.length+'</b> '+STEPS[n-1]};
function resetBar(){
  $('#Lcups').innerHTML='';Cup.all=[];
  for(const kind of ['demi','capp'])KIND[kind].warm.forEach((w,i)=>{const c=glassCup('w'+kind+i,kind==='demi'?CS:1,kind);c.line(SHOW_LINE&&kind===M.cup);$('#Lcups').appendChild(c.g);c.sp.set({...w,r:0,sx:1,sy:1});
    if(kind===M.cup)Cup.all.push(c);else c.g.setAttribute('class','np')});Cup.at=[null,null];
  const deco=document.createElementNS(NS,'g');deco.setAttribute('class','np');
  deco.innerHTML=[930,1004].map(x=>`<g transform="translate(${x} 186)"><path d="M-26 -62L-30 -6Q-30 0 -24 0H24Q30 0 30 -6L26 -62Z" fill="url(#gChromeH)" class="o4"/><path d="M-26 -62L-38 -70L-24 -50Z" fill="#cfd9df" class="o3"/><path d="M26 -54Q46 -50 42 -28Q40 -16 28 -16" fill="none" stroke="#4a2c22" stroke-width="5"/></g>`).join('');
  $('#Lcups').prepend(deco);
  PF.set({...M.grp,r:0,sx:1,sy:1});setHandle(1);$('#collar').style.display='';$('#collar').setAttribute('transform',`translate(${M.grp.x-910} 0)`);
  $('#pf2').setAttribute('transform',`translate(${M.other.x} ${M.other.y})`);$('#collar2').setAttribute('transform',`translate(${M.other.x-910} 0)`);setBrewBtn(false);setGrounds(0,false);TAMP.set({...P.tampRest,r:0,sx:1,sy:1});BR.set({...P.brush,r:0,sx:1,sy:1});
  $('#tDig').textContent='0초';needle(0);puddle(0);stream(false);zone();$('#zone2').style.display='none';Guide.stop();
  $('#rimFront').style.display='none';$('#gRing').setAttribute('stroke-dashoffset',251.3);$('#dirt').innerHTML='';$('#trayItems').innerHTML='';fx.innerHTML='';
  $('#gauge').classList.add('off')}
function zone2(x,y,rx,ry){const e=$('#zone2');if(x==null){e.style.display='none';return}e.setAttribute('cx',x);e.setAttribute('cy',y);e.setAttribute('rx',rx);e.setAttribute('ry',ry||rx);e.style.display=''}

/* ---------- 4) 서빙 준비: 위에서 본 트레이 ---------- */
const saucerTopR=r=>`<circle r="${r}" fill="#4a2c22" opacity=".14" cx="4" cy="6"/><circle r="${r}" fill="#fff" class="o4"/><circle r="${r*.61}" fill="#f3ece3" class="o3"/><circle r="${r*.42}" fill="#fff" opacity=".7"/>`;
const SR_=()=>M.cup==='capp'?78:62,SXS=()=>M.cup==='capp'?[225,455]:[240,440];
const spoonTop=`<path d="M-62 0H14" stroke="#4a2c22" stroke-width="14" stroke-linecap="round"/><path d="M-62 0H14" stroke="#d6dee3" stroke-width="7" stroke-linecap="round"/><ellipse cx="34" cy="0" rx="24" ry="15" fill="#d6dee3" class="o4"/><ellipse cx="30" cy="-4" rx="9" ry="5" fill="#fff" opacity=".8"/>`;
async function trayPrep(){
  const [xa,xb]=SXS(),sr=SR_(),G=[{x:xa,y:330,k:'s'},{x:xb,y:330,k:'s'},{x:xa,y:330-sr+14,k:'p'},{x:xb,y:330-sr+14,k:'p'}];
  $('#prepGhost').innerHTML=G.map((g,i)=>g.k==='s'?`<circle id="pg${i}" class="ghost" cx="${g.x}" cy="${g.y}" r="${sr}"/>`
    :`<g id="pg${i}" class="ghost" transform="translate(${g.x} ${g.y}) scale(.72)"><path d="M-62 -7H14V7H-62Z M14 0A24 15 0 1 0 58 0A24 15 0 1 0 14 0" /></g>`).join('')
    +`<text x="340" y="180" text-anchor="middle" font-size="26" fill="#fbeedd">스푼은 받침 위에, 손잡이는 왼쪽</text>`;
  const it=$('#prepItems');it.innerHTML='';
  const flipFirst=Math.random()<.5;
  const items=[{k:'s',x:845,y:175},{k:'s',x:845,y:160},{k:'p',x:845,y:330,left:!flipFirst},{k:'p',x:845,y:450,left:flipFirst}].map(o=>{
    const g=document.createElementNS(NS,'g');g.setAttribute('class','hit');g.innerHTML=o.k==='s'?saucerTopR(SR_()):`<g class="sp"><g transform="scale(.72)">${spoonTop}</g></g>`;it.appendChild(g);
    o.g=g;o.sp=new Sp(g,o.x,o.y);if(o.k==='p')o.sp.set({r:o.left?0:180});return o});
  $('#prep').classList.remove('off');Guide.use('#handP');Guide.delay=600;
  Panel.hint('먼저 <em>잔 받침 2개</em>, 그다음 <em>스푼 2개</em>를 놓아요<small>스푼을 톡 누르면 방향이 바뀌어요</small>');
  let mistakes=0,left=4;
  const pointNext=()=>{const o=items.find(o=>!o.done);if(!o)return Guide.stop();const z=G.findIndex(g=>!g.used&&g.k===o.k);Guide.drag({x:o.sp.x,y:o.sp.y},{x:G[z].x,y:G[z].y})};
  pointNext();
  await Promise.all(items.map(async o=>{
    const zones=G.map(g=>g.k===o.k?{x:g.x,y:g.y,r:80,get used(){return g.used}}:null);
    const i=await drag(o.sp,o.g,{svg:svgP,zones,bounds:[60,60,960,560],
      tap:o.k==='p'?()=>{o.left=!o.left;SFX.pick();o.sp.to({r:o.left?0:180},280,E.back)}:null,
      accept:i=>o.k==='s'||(G[i-2].used&&o.left),
      reject:i=>{SFX.no();if(!G[i-2].used){Panel.hint('<em>잔 받침</em>을 먼저 놓아요');return}mistakes++;Panel.hint('손잡이가 <em>왼쪽</em>으로 가게 해요<small>스푼을 톡 눌러서 돌려요</small>')}});
    G[i].used=true;o.done=true;$('#pg'+i).classList.add('done');SFX.clink();await o.sp.to({x:G[i].x,y:G[i].y,r:o.k==='p'?0:0,sx:1,sy:1},200,E.back);
    left--;if(!left)Panel.hint('다 놓았어요!');else Panel.hint('잘했어요! 나머지도 놓아요 <em>('+(4-left)+'/4)</em><small>스푼을 톡 누르면 방향이 바뀌어요</small>');pointNext()}));
  Guide.stop();SFX.great();await toast('서빙 준비 끝!');$('#prep').classList.add('off');Guide.use('#hand');Guide.delay=350;
  $('#trayItems').innerHTML=P.tray.map(p=>`<g transform="translate(${p.x} ${p.y})">${saucerSide(M.cup==='capp'?58:46)}<g transform="translate(-6 -22) scale(.9)">${spoonSide}</g></g>`).join('');
  R.prep=mistakes}

/* ---------- 5) 추출 ---------- */
async function grindTamp(){
  await twistPF('out');
  Panel.hint('<em>포터필터</em>를 그라인더에 걸어요');zone(P.grind.x,P.grind.y+30,74,64);Guide.drag({x:PF.x,y:PF.y+20},{x:P.grind.x,y:P.grind.y+20});
  await drag(PF,$('#pf'),{zone:{x:P.grind.x,y:P.grind.y,r:110}});
  await PF.to({...P.grind,r:0,sx:1,sy:1},240,E.back);SFX.snap();anim(300,t=>setHandle(lerp(-.7,1,t)));
  Panel.hint('초록 버튼을 <em>꾹 누르고</em> 있어요');Guide.hold(P.gBtn);
  const ring=$('#gRing'),gEl=$('#grinder'),beans=$('#beans'),btn=$('#gBtn');let snd=null;ring.classList.add('ringp');
  await hold(btn,2400,(p,down)=>{ring.setAttribute('stroke-dashoffset',(251.3*(1-p)).toFixed(1));setGrounds(p,false);
    if(down){const now=performance.now();gEl.setAttribute('transform',`translate(${(1330+Math.sin(now/21)*1.5).toFixed(2)} 0)`);beans.setAttribute('transform',`translate(${rnd(-1.5,1.5).toFixed(1)} ${rnd(-1,1.5).toFixed(1)})`);
      if(Math.random()<.6)drop(P.grind.x+rnd(-8,8),458,P.grind.y-3-12*p,'#6b3f26',3)}},
    on=>{ring.classList.toggle('ringp',!on);btn.setAttribute('transform',on?'translate(0 3)':'');if(on)snd=SFX.grind();else{snd&&snd.stop();snd=null;gEl.setAttribute('transform','translate(1330 0)');beans.removeAttribute('transform')}});
  ring.classList.remove('ringp');SFX.ok();floatText(P.grind.x-150,P.grind.y-40,'가득!');
  /* 바닥에 떨어진 가루 */
  const D=[[1262,604],[1290,618],[1318,600],[1352,624],[1384,606],[1412,620],[1300,632],[1372,636],[1338,612],[1246,626]];
  $('#dirt').innerHTML=D.map(([x,y],i)=>`<circle class="dt" cx="${x}" cy="${y}" r="${4+i%3}" fill="#6b3f26"/>`).join('');
  await sleep(350);ring.setAttribute('stroke-dashoffset',251.3);
  await Promise.all([PF.hop(P.tamp.x,P.tamp.y,520,60,0),anim(500,t=>setHandle(lerp(1,.45,t)))]);SFX.pick();RIMF.set({...P.tamp});
  await TAMP.hop(P.tampReady.x,P.tampReady.y,460,40,0);$('#rimFront').style.display='';
  Panel.hint('<em>탬퍼</em>를 아래로 <em>꾹</em> 눌러요');Guide.drag({x:P.tampReady.x,y:P.tampReady.y-50},{x:P.tampReady.x,y:P.tamp.y-6});
  await new Promise(res=>{const el=$('#tamp'),cY=P.tamp.y-15,endY=P.tamp.y+3;let g=null,done=false,best=0;
    const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}g={py:spt(e).y,y0:TAMP.y};Guide.pause();SFX.pick()};
    const mv=e=>{if(!g||done)return;let y=g.y0+(spt(e).y-g.py);const top=cY+18*best;if(y>top)y=top+(y-top)*.45;y=clamp(y,P.tampReady.y-30,endY);TAMP.set({y});
      best=Math.max(best,clamp((y-cY)/18,0,1));setGrounds(1-best,false);if(best>=1){done=true;fin()}};
    const up=()=>{if(!g||done)return;g=null;TAMP.to({y:P.tampReady.y},320,E.back).then(()=>{if(!done)Guide.resume()})};
    const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
    async function fin(){off();Guide.stop();SFX.thud();shake();setGrounds(0,true);floatText(P.tamp.x,P.tamp.y-96,'꾹!');await sleep(380);
      await TAMP.to({y:P.tampReady.y-10},220,E.out);$('#rimFront').style.display='none';await TAMP.hop(P.tampRest.x,P.tampRest.y,420,30,.08);SFX.ok();res()}
    el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)});
  Panel.hint('<em>포터필터</em>를 '+M.side+' 그룹 아래로 가져가요');zone(M.grp.x,M.grp.y+40,80,64);Guide.drag({x:PF.x,y:PF.y+20},{x:M.grp.x,y:M.grp.y+40});
  await drag(PF,$('#pf'),{zone:{x:M.grp.x,y:M.grp.y+20,r:110}});
  await Promise.all([PF.to({x:M.grp.x,y:M.grp.y+30,r:0,sx:1,sy:1},220,E.out),anim(220,t=>setHandle(lerp(.45,-.7,t)))]);$('#collar').style.display='';
  await twistPF('in');
}
function gaugeSet(t){const s=Math.floor(t),j=s<20?{t:'기다려요',c:'var(--muted)'}:judgeOf(s);
  $('#gsec').textContent=s+'초';$('#glabel').textContent=j.t;$('#glabel').style.background=j.c;$('#gmark').style.left=(clamp(t,0,45)/45*100)+'%';
  const d=$('#tDig');d.textContent=s+'초';d.setAttribute('fill',s<20?'#b8ffd2':s<=30?'#63ffa0':s<=40?'#ffe07a':'#ff9484')}
function cupsDown(alive){
  Panel.hint('<em>'+M.cupName+'</em>을 내려서 받쳐요 <em>(0/2)</em>');
  const zones=M.slots.map((s,i)=>({x:s.x,y:s.y-24,r:M.cup==='capp'?62:56,get used(){return !!Cup.at[i]}}));
  const free=()=>Cup.all.filter(c=>!Cup.at.includes(c));
  const point=()=>{const c=free()[0],i=Cup.at.findIndex(x=>!x);if(c&&i>=0)Guide.drag({x:c.sp.x,y:c.sp.y-30},{x:M.slots[i].x,y:M.slots[i].y-30})};
  const zw=M.cup==='capp'?56:44;zone(M.slots[0].x,M.slots[0].y-18,zw,34);zone2(M.slots[1].x,M.slots[1].y-18,zw,34);point();
  return Promise.all(Cup.all.map(async c=>{c.inner.classList.add('pickme');
    const i=await drag(c.sp,c.g,{zones,alive,anchor:()=>({x:c.sp.x,y:c.sp.y-20})});c.inner.classList.remove('pickme');
    Cup.at[i]=c;if(R.cupT==null||R.cupT<R.t)R.cupT=R.t;(i?zone2:zone)();await c.sp.to({...M.slots[i],r:0,sx:1,sy:1},160,E.out);SFX.clink();
    const n=Cup.at.filter(Boolean).length;if(n<2){Panel.hint('<em>'+M.cupName+'</em>을 내려서 받쳐요 <em>('+n+'/2)</em>');point()}}))}
function brushDirt(alive){return new Promise(res=>{const el=$('#brush'),home={...P.brush};let g=null,done=false;
  const dots=()=>[...$('#dirt').querySelectorAll('.dt')];if(!dots().length)return res();
  Panel.hint('추출하는 동안 <em>붓</em>으로 그라인더 주변을 쓸어요');zone(1330,618,110,32);Guide.drag({x:BR.x,y:BR.y},{x:1300,y:612});
  const tip=()=>{const a=BR.r*Math.PI/180;return{x:BR.x+Math.cos(a)*44,y:BR.y+Math.sin(a)*44}};
  const dn=e=>{if(done||!alive())return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}const p=spt(e);g={dx:p.x-BR.x,dy:p.y-BR.y,lx:p.x};Guide.pause();SFX.pick()};
  const mv=e=>{if(!g||done)return;const p=spt(e),vx=p.x-g.lx;g.lx=p.x;BR.set({x:clamp(p.x-g.dx,60,1560),y:clamp(p.y-g.dy,200,700),r:lerp(BR.r,clamp(vx*1.2,-18,18),.3)});
    const tp=tip();for(const d of dots()){if(Math.hypot(+d.getAttribute('cx')-tp.x,+d.getAttribute('cy')-tp.y)<46){d.remove();if(Math.random()<.5)puff(tp.x,tp.y,{r:4,dy:-30,ms:500})}}
    if(!dots().length){done=true;fin()}};
  const up=()=>{if(!g||done)return;g=null;BR.to({...home,r:0},380,E.back).then(()=>{if(!done)Guide.resume()})};
  const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
  async function fin(){off();zone();Guide.stop();sparkle(1330,612,6);SFX.ok();floatText(1330,560,'깨끗!');R.brushT=R.t;await BR.to({...home,r:0},420,E.io);res()}
  el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)})}
async function brew(){
  for(;;){
    R.t=0;R.cupT=null;gaugeSet(0);Panel.hint('<em>추출 버튼</em>을 눌러요');Guide.tap(M.btn);
    await tap($('#bBtn'+M.bs));Guide.stop();SFX.pick();setBrewBtn(true);const pump=SFX.pump();$('#gauge').classList.remove('off');
    let stopped=false,cue=false,warn=false,last=performance.now(),run=true;const alive=()=>run;
    $('#bBtn'+M.bs).addEventListener('click',()=>{stopped=true},{once:true});
    const t0=performance.now();
    const loop=new Promise(res=>{const f=now=>{if(stopped)return res();const dt=(now-last)/1000*SCALE;last=now;const t=(now-t0)/1000*SCALE;R.t=t;gaugeSet(t);
      needle(clamp(t/2,0,1)*.72+Math.sin(now/130)*.015);
      if(t>=FLOW){stream(true,t,now);for(let i=0;i<2;i++){const c=Cup.at[i];if(c){c.set(c.ml+RATE*dt);if(c.kind==='demi'&&c.ml>CAP)puddle(clamp((c.ml-CAP)/12,0,1))}else if(Math.random()<.2)drop(M.slots[i].x,M.grp.y+92,M.slots[i].y-6,'#5a3220',3)}}
      if(!cue&&t>=25){cue=true;SFX.tick();if(R.tries===0)Panel.hint('<em>진한 초록</em>이 됐어요! 멈출 때를 잘 봐요')}
      if(!warn&&t>40){warn=true;SFX.no();Guide.delay=0;Guide.tap(M.btn);Panel.hint('40초가 넘었어요! <em>버튼을 눌러 멈춰요</em>');Guide.delay=350}
      requestAnimationFrame(f)};requestAnimationFrame(f)});
    /* 추출하는 동안 할 일 */
    (async()=>{await cupsDown(alive);if(!run)return;zone();zone2();await brushDirt(alive);if(!run)return;
      if(!stopped&&!cue&&!warn){Panel.hint('<em>진한 초록(25~30초)</em>일 때 추출 버튼을 다시 눌러 멈춰요');Guide.stop()}})();
    await loop;run=false;Guide.stop();zone();zone2();pump.stop();SFX.pick();setBrewBtn(false);stream(false);anim(500,p=>needle(.72*(1-p)));
    const s=Math.floor(R.t),j=judgeOf(s),missing=Cup.at.filter(Boolean).length<2;
    if(R.first==null)R.first=s;R.tries++;
    if(j.k!=='fail'&&!missing){R.sec=s;R.judge=j;SFX.great();Cup.at.forEach(c=>c.mlt.style.display='');
      await toast(`<span class="big" style="background:${j.c}">${j.t}</span><span>${s}초 · 약 ${Math.round(Cup.at[0].ml)}ml</span>`,null,1700);
      Cup.at.forEach(c=>c.mlt.style.display='none');$('#gauge').classList.add('off');
      if($('#dirt').querySelector('.dt')){R.brushLate=true;await brushDirt(()=>true)}
      return}
    SFX.no();await toast(`<span class="big" style="background:var(--red)">${missing?'다시 해요':'실격'}</span><span>${missing?'잔을 2개 다 받쳐야 해요':j.why}</span>`,null,1900);
    $('#gauge').classList.add('off');
    /* 다시: 잔을 비우고 컵 워머로 */
    Panel.hint('잔을 비우고 <em>다시</em> 추출해요');puddle(0);
    for(let i=0;i<2;i++){const c=Cup.all[i],w=KIND[c.kind].warm[i];c.set(0);Cup.at[i]=null;c.sp.hop(w.x,w.y,520,80,.06)}
    await sleep(700);floatText(PF.x,PF.y-40,'커피를 새로 담았어요');await sleep(600);
  }
}
const cupTopDemi=`<circle r="44" cx="4" cy="6" fill="#4a2c22" opacity=".15"/><path d="M-36 -10H-66Q-76 -10 -76 0Q-76 10 -66 10H-36Z" fill="#fff" class="o4"/>
  <circle r="42" fill="#fff" class="o4"/><circle r="33" fill="#7a4a28" class="o3"/><circle r="27" fill="#c98a4b"/><circle r="27" fill="none" stroke="#a96a35" stroke-width="3" stroke-dasharray="6 7" opacity=".7"/>
  <path d="M-14 -18Q-4 -24 8 -20" stroke="#e7b77d" stroke-width="5" fill="none" stroke-linecap="round"/>`;
const cupTopCapp=`<circle r="60" cx="4" cy="6" fill="#4a2c22" opacity=".15"/><path d="M-52 -12H-86Q-98 -12 -98 0Q-98 12 -86 12H-52Z" fill="#fff" class="o4"/>
  <circle r="58" fill="#fff" class="o4"/><circle r="48" fill="#b98352" class="o3"/><circle r="42" fill="#fffaf0"/><circle r="30" fill="#fff"/>
  <path d="M-20 -26Q-6 -34 10 -28" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>`;
const cupTop=()=>M.cup==='capp'?cupTopCapp:cupTopDemi;
async function toTray(){
  /* 추출한 잔을 위에서 본 트레이로 가져가 받침 위에 올린다 */
  const X=SXS(),sr=SR_(),cr=M.cup==='capp'?62:46;
  $('#prepGhost').innerHTML=X.map((x,i)=>`<circle id="cg${i}" class="ghost" cx="${x}" cy="330" r="${cr}"/>`).join('')+`<text x="340" y="180" text-anchor="middle" font-size="26" fill="#fbeedd">잔은 받침 한가운데에</text>`;
  const it=$('#prepItems');
  it.innerHTML=X.map(x=>`<g transform="translate(${x} 330)">${saucerTopR(sr)}</g><g transform="translate(${x} ${330-sr+14}) scale(.72)">${spoonTop}</g>`).join('');
  const cups=[230,420].map(y=>{const g=document.createElementNS(NS,'g');g.setAttribute('class','hit');g.innerHTML=cupTop();it.appendChild(g);return{g,sp:new Sp(g,845,y)}});
  $('#prep .ttl').textContent='잔 올리기';$('#prep').classList.remove('off');Guide.use('#handP');Guide.delay=600;
  Panel.hint(M.name+' 잔을 <em>잔 받침 위</em>에 올려요');
  const zones=X.map(x=>({x,y:330,r:76,used:false}));
  Guide.drag({x:845,y:230},{x:X[0],y:330});
  await Promise.all(cups.map(async (c,k)=>{const i=await drag(c.sp,c.g,{svg:svgP,zones,bounds:[60,60,960,560]});zones[i].used=true;$('#cg'+i).classList.add('done');
    await c.sp.to({x:zones[i].x,y:330,r:0,sx:1,sy:1},180,E.out);SFX.clink();Cup.at[k].tray=i;
    const o=cups.find(x=>x!==c);if(zones.some(z=>!z.used))Guide.drag({x:o.sp.x,y:o.sp.y},{x:zones[1-i].x,y:330})}));
  Guide.stop();SFX.ok();await toast('잔을 올렸어요!');$('#prep').classList.add('off');Guide.use('#hand');Guide.delay=350;$('#prep .ttl').textContent='서빙 준비';
  /* 바 장면의 트레이에도 잔을 올려 둔다 */
  Cup.at.forEach(c=>{c.line(false);c.sp.set({x:P.tray[c.tray].x,y:P.tray[c.tray].y-4,r:0,sx:1,sy:1})});SFX.clink();await sleep(500)}

/* ---------- 6) 서빙: 심사위원 앞으로 ---------- */
async function serveJudges(){
  scene('judge');Guide.use('#handJ');await sleep(700);
  const T=$('#jTray');T.innerHTML=`<g class="tin"><ellipse cx="0" cy="12" rx="222" ry="40" fill="#4a2c22" opacity=".15"/><ellipse cx="0" cy="0" rx="214" ry="42" fill="#6b4434" class="o"/><ellipse cx="0" cy="-4" rx="190" ry="31" fill="#7d5040"/></g>`;
  const tray=new Sp(T,-320,600);
  const spots=JUDGES.map(j=>({x:j.x,y:592,r:120}));
  $('#jSpots').innerHTML=spots.map((s,i)=>`<ellipse id="js${i}" class="ghost" cx="${s.x}" cy="${s.y}" rx="80" ry="20" style="display:none"/>`).join('');
  const sets=Cup.at.slice().sort((a,b)=>a.tray-b.tray).map((c,i)=>{const g=document.createElementNS(NS,'g');g.setAttribute('class','hit');
    g.innerHTML=`<g transform="scale(1.45)">${saucerSide(M.cup==='capp'?58:46)}<g transform="translate(-4 -20) scale(.9)">${spoonSide}</g></g>`;
    const cc=glassCup('j'+i,c.kind==='demi'?1.3:1,c.kind);cc.milk=c.milk;cc.set(c.ml);cc.line(false);cc.g.setAttribute('class','np');cc.sp.set({x:0,y:-6});g.appendChild(cc.g);$('#fxJ').before(g);return{g,sp:new Sp(g,-320+(i?100:-100),596),off:i?100:-100}});
  await anim(1100,t=>{tray.set({x:lerp(-320,800,t)});sets.forEach(s=>s.sp.set({x:lerp(-320,800,t)+s.off}))},E.out);SFX.clink();
  R.lines.push(await sayLine('실례하겠습니다.',lineTag()));
  Panel.hint('잔을 <em>심사위원 앞</em>에 하나씩 놓아요');spots.forEach((s,i)=>$('#js'+i).style.display='');
  Guide.drag({x:sets[0].sp.x,y:sets[0].sp.y-40},{x:spots[0].x,y:spots[0].y-40});
  await Promise.all(sets.map(async s=>{const i=await drag(s.sp,s.g,{svg:svgJ,zones:spots,bounds:[60,200,1540,880]});spots[i].used=true;$('#js'+i).style.display='none';
    await s.sp.to({x:spots[i].x,y:spots[i].y,r:0,sx:1,sy:1},200,E.out);SFX.clink();nod(i);jface(i,'happy');
    const o=sets.find(x=>x!==s);if(spots.some(z=>!z.used))Guide.drag({x:o.sp.x,y:o.sp.y-40},{x:spots[1-i].x,y:spots[1-i].y-40})}));
  Guide.stop();
  R.lines.push(await sayLine('주문하신 '+M.name+' 두 잔 나왔습니다.',lineTag()));
  Panel.hint('<em>트레이</em>를 눌러 옆에 끼고 한 발 물러나요');$('.tin',T).classList.add('pickme');Guide.tap({x:800,y:600});
  await tap(T);Guide.stop();$('.tin',T).classList.remove('pickme');SFX.pick();await tray.to({x:-340},700,E.io);
  R.lines.push(await sayLine('맛있게 드십시오.',lineTag().replace('따라 말해요','말하면서 목례해요')));
  svgJ.classList.add('bow');SFX.bell();setTimeout(()=>svgJ.classList.remove('bow'),1150);await sleep(500);
  JUDGES.forEach((j,i)=>{nod(i);jface(i,'happy');check(i);heart(j.x,300)});SFX.great();await sleep(1300);
  sets.forEach(s=>s.g.remove());$('#jSpots').innerHTML='';Panel.hide();
}

/* ---------- 진행 ---------- */
let lineNo=0,LINES_TOTAL=7;const lineTag=()=>'따라 말해요 '+(++lineNo)+'/'+LINES_TOTAL;
function who(){const no=($('#inNo').value||'1').replace(/\D/g,'')||'1',name=$('#inName').value.trim();return{no,name}}
async function espresso(){
  M=MODES.esp;STEPS=['인사·자기소개','원두 설명','메뉴 설명','서빙 준비','추출','서빙'];LINES_TOTAL=7;$('#rtitle').textContent='에스프레소 결과';
  R={lines:[],prep:0,tries:0,first:null,sec:null,judge:null,cupT:null,brushT:null,brushLate:false,t:0};lineNo=0;
  resetBar();scene('judge');Guide.use('#handJ');JUDGES.forEach((j,i)=>jface(i,'idle'));JUDGES.forEach((j,i)=>{const c=$('#J'+i+' .check');c.style.opacity=0});
  const {no,name}=who();
  step(1);await sleep(500);await judgeSay(0,'준비되면 시작해 주세요.');Bubble.hide();
  const me=`수험번호 ${no}번`+(name?` ${name}입니다.`:'입니다.');
  const L=[[1,'시연 시작하겠습니다.'],[1,`안녕하세요. ${me} 바리스타 직업 수업을 통해 커피를 알게 되었고 자격증 시험에 도전하게 되었습니다.`],
    [2,'오늘 준비한 원두는 아라비카 100%로 중강 배전된 원두입니다.'],
    [3,'첫 번째로 추출해 드릴 커피는 크레마가 풍부한 30ml 에스프레소 두 잔을 준비해 드리겠습니다. 잠시만 기다려주십시오.']];
  for(const [s,l] of L){step(s);R.lines.push(await sayLine(l,lineTag()));nod(R.lines.length%2)}
  step(4);Panel.hide();await trayPrep();
  step(5);scene('bar');Guide.use('#hand');await sleep(900);
  await grindTamp();await brew();await toTray();
  step(6);Panel.hide();await serveJudges();
  showResult();
}
function showResult(){if(M.key==='cap')return showCapResult();$('#rlist').classList.remove('two');
  const avg=R.lines.reduce((a,b)=>a+b,0)/R.lines.length;
  const row=(name,val,c)=>`<div><span>${name}</span><b style="background:${COL[c]}">${val}</b></div>`;
  const late=R.cupT!=null&&R.cupT>FLOW;
  $('#rlist').innerHTML=
    row('대사 발음',`별 평균 ${avg.toFixed(1)}`,avg>=2.5?'g2':avg>=1.8?'g1':'yel')+
    row('서빙 준비',R.prep?`스푼 방향 ${R.prep}번 다시`:'잘했어요',R.prep?'yel':'g2')+
    row('추출 시간',`${R.sec}초 · ${R.judge.t}`+(R.tries>1?` (실격 뒤 ${R.tries}번째)`:''),R.tries>1?'yel':R.judge.k==='best'?'g2':R.judge.k==='good'?'g1':'yel')+
    row('잔 내리기',late?'커피가 나온 뒤에 받쳤어요':'제때 받쳤어요',late?'yel':'g2')+
    row('붓 청소',R.brushLate?'추출이 끝난 뒤에 했어요':'추출하는 동안 했어요',R.brushLate?'yel':'g2')+
    row('서빙','잘했어요','g2');
  $('#result').classList.remove('off');SFX.great();
}

/* ---------- 첫 화면 ---------- */
const snd=$('#snd');snd.innerHTML=IC.sndOn;snd.onclick=()=>{SFX.mute(!SFX.muted);snd.innerHTML=SFX.muted?IC.sndOff:IC.sndOn;if(!SFX.muted)SFX.pick()};
$('#home').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#4a2c22" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" fill="#ff8a73"/><path d="M10 19v-5h4v5"/></svg>';
const goHome=()=>{try{speechSynthesis.cancel()}catch(e){}location.reload()};
$('#home').onclick=goHome;$('#tohome').onclick=goHome;
$('#again').onclick=()=>{$('#result').classList.add('off');Bubble.hide();(M.key==='cap'?cappuccino:espresso)()};
$('#inNo').value=store.get('no','1');$('#inName').value=store.get('name','');
const startWith=fn=>()=>{SFX.unlock();SFX.ok();store.set('no',$('#inNo').value);store.set('name',$('#inName').value.trim());$('#title').classList.add('off');fn()};
$('#goEsp').onclick=startWith(()=>espresso());$('#goCap').onclick=startWith(()=>cappuccino());
step(1);resetBar();
window.__game={P,PF,TAMP,BR,Cup,get R(){return R},JUDGES,get M(){return M}};
