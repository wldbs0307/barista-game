/* ================= 준비 과정 (5분) · 정리 ================= */
/* 테스트용: 지금 해야 할 조작을 적어 둔다 (화면에는 영향 없음) */
const T=window.__pc={task:null,set(kind,a,b,o){this.task=Object.assign({kind,a,b,svg:'station'},o||{})},clear(){this.task=null}};
const mmss=s=>{s=Math.max(0,Math.floor(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const Clock={iv:0,t0:0,limit:0,
  start(limit){this.t0=performance.now();this.limit=limit;const el=$('#clock');el.hidden=false;clearInterval(this.iv);
    const f=()=>{if(el.hidden){clearInterval(this.iv);return}const s=this.sec();
      el.innerHTML=this.limit?(s<=this.limit?'남은 시간 <b>'+mmss(this.limit-s)+'</b>':'<span class="over">시간 넘음 +'+mmss(s-this.limit)+'</span>'):'걸린 시간 <b>'+mmss(s)+'</b>'};
    f();this.iv=setInterval(f,250)},
  sec(){return (performance.now()-this.t0)/1000},stop(){clearInterval(this.iv);return this.sec()}};

/* ---------- 그림: 행주 ---------- */
const CLOTH={W1:{wet:1,n:1,plate:1},W2:{wet:1,n:2},W3:{wet:1,n:3},D1:{wet:0,n:1,plate:1},D2:{wet:0,n:2},D3:{wet:0,n:3}};
/* 놓을 자리 (바닥 가운데) */
const SPOT={W1:{x:478,y:656},W2:{x:990,y:546},W3:{x:996,y:660},D1:{x:1452,y:652},D2:{x:1012,y:182},D3:{x:745,y:664}};
/* 트레이 위 자리: 뒷줄 젖은 행주, 앞줄 마른 행주 */
const TRAYSPOT={W1:{x:112,y:624},W2:{x:240,y:624},W3:{x:366,y:624},D1:{x:112,y:666},D2:{x:240,y:666},D3:{x:366,y:666}};
const CL={};
const clothName=k=>(CLOTH[k].wet?'젖은행주':'마른행주')+CLOTH[k].n;
function clothSVG(k,long,plate){const I=CLOTH[k],w=long?120:60,h=long?22:36,f=I.wet?'#97cff0':'#fffdf8',s=I.wet?'#5fa6d6':'#e0d0b8',lift=plate?-4:0;
  return `<rect x="${-w-8}" y="${-h-12+lift}" width="${2*w+16}" height="${h+22}" fill="#fff" fill-opacity="0"/>
  ${plate?PLATE:''}
  <g transform="translate(0 ${lift})"><ellipse cx="0" cy="2" rx="${w}" ry="5" fill="#4a2c22" opacity=".12"/>
  <path d="M${-w} 0L${-w+8} ${-h}H${w-8}L${w} 0Z" fill="${f}" stroke="#4a2c22" stroke-width="4" stroke-linejoin="round"/>
  <path d="M${-w+10} ${(-h*.62).toFixed(1)}H${w-10}" stroke="${s}" stroke-width="3" opacity=".8"/>
  ${I.wet?`<circle cx="${-w+18}" cy="5" r="3" fill="#5fa6d6"/><circle cx="${w-22}" cy="6" r="2.5" fill="#5fa6d6"/>`:''}
  <text x="0" y="${(-h/2+8).toFixed(1)}" text-anchor="middle" font-size="${long?22:21}" fill="${I.wet?'#1f5f8a':'#8a5a44'}">${(I.wet?'젖은':'마른')+I.n}</text></g>`}
const PLATE='<ellipse cx="0" cy="2" rx="70" ry="13" fill="#fff" class="o3"/><ellipse cx="0" cy="0" rx="46" ry="7" fill="#efe7dc"/>';
function makeCloth(k,pos,long){const g=document.createElementNS(NS,'g');g.setAttribute('class','hit');
  const c={k,g,sp:new Sp(g,pos.x,pos.y),long:!!long,onPlate:!!CLOTH[k].plate,plateEl:null,inner:null};
  g.innerHTML=`<g class="cin">${clothSVG(k,long,c.onPlate)}</g>`;$('#Lprep').appendChild(g);c.inner=$('.cin',g);
  const draw=()=>{c.inner.innerHTML=clothSVG(k,c.long,c.onPlate)};
  c.setLong=v=>{c.long=v;draw()};
  /* 접시는 그 자리에 두고 행주만 들기 */
  c.detach=()=>{if(!c.onPlate)return;c.onPlate=false;c.plateAt={x:c.sp.x,y:c.sp.y};
    const pe=document.createElementNS(NS,'g');pe.setAttribute('class','np');pe.setAttribute('transform',`translate(${c.sp.x} ${c.sp.y})`);pe.innerHTML=PLATE;$('#Lprep').prepend(pe);c.plateEl=pe;c.sp.set({y:c.sp.y-4});draw()};
  c.attach=()=>{if(!c.plateEl)return;c.plateEl.remove();c.plateEl=null;c.onPlate=true;c.sp.set({...c.plateAt,r:0});draw()};
  CL[k]=c;return c}
const toTop=el=>$('#fx').before(el);   /* 끌 때 다른 물건 위로 */

/* 행주를 정해진 자리로 끌기. 다른 행주를 끌면 되돌아간다. */
let wrongCloth=0;
function placeCloth(k,to,hint,cands){return new Promise(async res=>{let live=true;const alive=()=>live;
  Panel.hint(hint);zone(to.x,to.y-12,70,30);const c=CL[k];Guide.drag({x:c.sp.x,y:c.sp.y-14},{x:to.x,y:to.y-14});T.set('drag',{x:c.sp.x,y:c.sp.y-14},{x:to.x,y:to.y-14});
  const list=(cands||[k]).map(x=>CL[x]);
  list.forEach(o=>drag(o.sp,o.g,{zones:[{x:to.x,y:to.y,r:96}],alive,
    accept:()=>o===c,reject:()=>{wrongCloth++;SFX.no();Panel.hint(`그건 <em>${clothName(o.k)}</em>예요. <em>${clothName(k)}</em>을 찾아요`)}}).then(async()=>{
      live=false;zone();T.clear();await c.sp.to({x:to.x,y:to.y,r:0,sx:1,sy:1},200,E.out);SFX.pick();res()}))})}

/* 행주로 문지르기: 영역 안에서 움직인 거리(need)만큼, 또는 점(dots)을 다 지우면 끝.
   o.svg가 팝업이면 팝업 안에서. 접시에 있던 행주는 접시를 두고 행주만 움직이고, 접시 자리로 돌아오면 다시 얹는다. */
function rub(c,o){return new Promise(res=>{const el=c.g,sp=c.sp,SV=o.svg||svgS,pop=SV!==svgS;let g=null,done=false,phase='rub';
  /* 여러 곳을 이어서 닦기(o.targets) 또는 한 곳(o.x,o.y) */
  const TG=(o.targets||[{x:o.x,y:o.y,rx:o.rx,ry:o.ry,need:o.need}]).map(z=>({...z,got:0,done:false}));
  const cur=()=>TG.find(z=>!z.done);
  if(c.detach)c.detach();
  if(pop)$('#prepItems').appendChild(el);else toTop(el);
  const inside=z=>((sp.x-z.x)/z.rx)**2+((sp.y-z.y)/z.ry)**2<=1;
  const dots=()=>o.dots?[...o.dots.querySelectorAll('.dt')]:[];
  let gz=null;if(pop){gz=document.createElementNS(NS,'ellipse');gz.setAttribute('class','ghost');$('#prepGhost').appendChild(gz)}
  const showZone=z=>{if(!z){if(pop)gz.style.display='none';else zone();return}if(pop){gz.style.display='';for(const [k,v] of [['cx',z.x],['cy',z.y],['rx',z.rx],['ry',z.ry]])gz.setAttribute(k,v)}else zone(z.x,z.y,z.rx,z.ry)};
  showZone(cur());Panel.hint(typeof o.hint==='function'?o.hint(0):o.hint);
  const guide=()=>{if(phase==='carry'){const to=o.carry.to;Guide.drag({x:sp.x,y:sp.y-14},{x:to.x,y:to.y-14});T.set('drag',{x:sp.x,y:sp.y-14},{x:to.x,y:to.y-14});return}
    const z=cur();if(!z)return;Guide.drag({x:sp.x,y:sp.y-14},{x:z.x-z.rx*.5,y:z.y-14});T.set('rub',{x:sp.x,y:sp.y-14},{x:z.x,y:z.y-14},{rx:z.rx,ry:z.ry,svg:pop?'prepSvg':'station'})};guide();
  const B=pop?[30,30,970,580]:[40,110,1560,700],fxp=pop?$('#fxP'):undefined;
  const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}const p=spt(e,SV);g={dx:p.x-sp.x,dy:p.y-sp.y,lx:p.x,ly:p.y};Guide.pause();SFX.pick()};
  const nearTo=()=>phase==='carry'&&Math.hypot(sp.x-o.carry.to.x,sp.y-o.carry.to.y)<(o.carry.r||90);
  const mv=e=>{if(!g||done)return;const p=spt(e,SV),d=Math.hypot(p.x-g.lx,p.y-g.ly),vx=p.x-g.lx;g.lx=p.x;g.ly=p.y;
    sp.set({x:clamp(p.x-g.dx,B[0],B[2]),y:clamp(p.y-g.dy,B[1],B[3]),r:lerp(sp.r,clamp(vx*.8,-10,10),.3)});
    if(phase==='carry'){zoneEl.classList.toggle('near',nearTo());return}
    const z=cur();const isIn=z&&inside(z);if(!pop)zoneEl.classList.toggle('near',!!isIn);
    if(isIn){z.got+=d;if(Math.random()<.1)sparkle(sp.x+rnd(-30,30),sp.y-16,1,fxp)}
    for(const t of dots())if(Math.hypot(+t.getAttribute('cx')-sp.x,+t.getAttribute('cy')-(sp.y-10))<60){t.remove();if(Math.random()<.4)puff(sp.x,sp.y-10,{r:4,dy:-24,ms:400})}
    if(o.dots){if(!dots().length)cleaned();return}
    if(z&&z.got>=z.need){z.done=true;const k=TG.indexOf(z)+1;
      if(cur()){sparkle(z.x,z.y-20,5,fxp);SFX.ok();floatText(z.x,z.y-50,o.done||'깨끗!',fxp);if(typeof o.hint==='function')Panel.hint(o.hint(k));showZone(cur());guide();Guide.pause()}
      else cleaned()}};
  /* 다 닦았을 때: o.carry가 있으면 손을 떼지 않고 그대로 옮기게 한다 */
  function cleaned(){const z=TG[TG.length-1];showZone(null);sparkle(z.x,z.y-20,6,fxp);SFX.ok();floatText(z.x,z.y-50,o.done||'깨끗!',fxp);
    if(o.carry){phase='carry';const to=o.carry.to;Panel.hint(o.carry.hint);zone(to.x,to.y-10,o.carry.zr||60,o.carry.zry||26);guide();Guide.pause();return}
    finish()}
  const up=async()=>{if(!g||done)return;g=null;sp.to({r:0},150);
    if(phase==='carry'&&nearTo()){done=true;off();zone();Guide.stop();T.clear();await sp.to({...o.carry.to,r:0},200,E.out);SFX.pick();res();return}
    guide()};
  const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
  async function finish(){done=true;off();if(pop)gz.remove();else zone();Guide.stop();T.clear();
    if(o.end){const toPlate=c.plateAt&&Math.hypot(o.end.x-c.plateAt.x,o.end.y-c.plateAt.y)<8;
      await sp.hop(o.end.x,o.end.y-(toPlate?4:0),480,50,.06);sp.set({r:0});if(toPlate)c.attach()}
    res()}
  el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)})}

/* 물줄기 (온수, 그룹 헤드) */
async function water(lines,ms,parent){const ps=lines.map(([x0,y0,x1,y1])=>mk('path',{d:`M${x0} ${y0}C${x0} ${lerp(y0,y1,.5)} ${x1} ${lerp(y0,y1,.6)} ${x1} ${y1}`,stroke:'#8fd0f2','stroke-width':6,'stroke-linecap':'round',fill:'none',opacity:.9},parent));
  const s=SFX.pour();await sleep(ms);s.stop();ps.forEach(p=>p.remove())}
function grillDrops(){const g=document.createElementNS(NS,'g');g.id='gdrops';
  g.innerHTML=[470,530,600,660,720,800,870,930,1000,1030].map((x,i)=>`<circle class="dt" cx="${x}" cy="${550+(i%3)*4}" r="${5+(i%2)*2}" fill="#8fd0f2" stroke="#4a2c22" stroke-width="2"/>`).join('');$('#Lprep').prepend(g);return g}
function counterDirt(){$('#dirt2').innerHTML=[[1092,640],[1118,656],[1146,634],[1172,652],[1204,640],[1230,658],[1108,626]].map(([x,y],i)=>`<circle class="dt" cx="${x}" cy="${y}" r="${4+i%3}" fill="#6b3f26"/>`).join('')}
function grinderDirt(){const D=[[1262,604],[1290,618],[1318,600],[1352,624],[1384,606],[1412,620],[1300,632],[1372,636],[1212,612],[1226,628],[1196,600]];
  $('#dirt').innerHTML=D.map(([x,y],i)=>`<circle class="dt" cx="${x}" cy="${y}" r="${4+i%3}" fill="#6b3f26"/>`).join('')}
/* 결과표 */
function showRows(title,rows){$('#rtitle').textContent=title;$('#rlist').classList.toggle('two',rows.length>6);
  $('#rlist').innerHTML=rows.map(([n,v,c])=>`<div><span>${n}</span><b style="background:${COL[c]}">${v}</b></div>`).join('');$('#result').classList.remove('off');SFX.great()}
function machineDrops(){const g=document.createElementNS(NS,'g');g.id='mdrops';
  g.innerHTML=[[560,612],[620,640],[690,606],[760,632],[830,610],[900,642],[650,662],[860,664],[720,654],[940,616]].map(([x,y],i)=>`<ellipse class="dt" cx="${x}" cy="${y}" rx="${9+(i%3)*3}" ry="4" fill="#8fd0f2" opacity=".8"/>`).join('');$('#Lprep').prepend(g);return g}
/* 끌어서 놓기 한 번 (안내 손가락·테스트 표시 포함) */
async function dragTo(sp,el,from,to,r,hint,o={}){if(hint)Panel.hint(hint);if(!o.noZone)zone(to.x,to.y,o.zr||Math.min(r,70),o.zry||Math.min(r,70)*.45);
  Guide.drag(from,to);T.set('drag',from,to);const i=await drag(sp,el,{zone:{x:to.x,y:to.y,r},anchor:o.anchor});T.clear();zone();return i}
function hidePitchers(){const d=$('#decoP');if(d)d.style.display='none'}

/* ---------- 준비 1) 행주 4장 ---------- */
async function prepCloths(){
  const ORDER=[['W1','<em>젖은행주1</em>을 접시째 <em>왼쪽 스팀노즐 앞</em>에 놓아요<small>우유 스티밍할 노즐을 닦는 행주</small>'],
    ['W2','<em>젖은행주2</em>를 <em>그릴 위 오른쪽</em>에 놓아요<small>머신을 닦는 행주</small>'],
    ['W3','<em>젖은행주3</em>을 <em>머신 앞</em>, 젖은행주2 아래에 놓아요<small>바닥을 닦는 행주</small>'],
    ['D1','<em>마른행주1</em>을 접시째 <em>탬퍼 옆</em>에 놓아요<small>탬퍼·포터필터를 닦는 행주</small>']];
  for(const [k,h] of ORDER)await placeCloth(k,SPOT[k],h,Object.keys(CL).filter(x=>!R.placed.includes(x))).then(()=>R.placed.push(k));
  SFX.ok();await toast('행주 4장 놓기 끝!')}
/* ---------- 준비 2) 기기 점검 ---------- */
/* 지금 다룰 포터필터(PF)를 mode 쪽 그룹에, 다른 하나(pf2)를 반대쪽에. cur/other: 커피 찌꺼기가 있는지 */
function setPFs(mode,cur,other){M={...mode,name:M.name,key:M.key};
  PF.set({...M.grp,r:0,sx:1,sy:1});setHandle(1);$('#collar').style.display='';$('#collar').setAttribute('transform',`translate(${M.grp.x-910} 0)`);
  $('#pf2').setAttribute('transform',`translate(${M.other.x} ${M.other.y})`);$('#collar2').setAttribute('transform',`translate(${M.other.x-910} 0)`);
  setGrounds(0,other);$('#pf2').innerHTML=$('#pf').innerHTML.replace(/ id="[^"]+"/g,'');setGrounds(0,cur)}
async function steamCheck(){
  const W1=CL.W1;W1.detach();
  for(const [id,x,tx,side] of [['#knobL',469,450,'왼쪽'],['#knobR',1031,1050,'오른쪽']]){
    await dragTo(W1.sp,W1.g,{x:W1.sp.x,y:W1.sp.y-14},{x:tx,y:500},90,`<em>젖은행주1</em>로 <em>${side} 스팀노즐</em> 끝을 감싸요<small>스팀이 튀지 않게 행주로 막고 뿜어요</small>`,{zr:50,zry:30});
    await W1.sp.to({x:tx,y:512,r:0,sx:.8,sy:1},180,E.out);SFX.pick();
    Panel.hint(`<em>${side} 스팀 손잡이</em>를 눌러 <em>칙</em> 뿜어요<small>스팀 압력 확인</small>`);Guide.tap({x,y:282});T.set('tap',{x,y:282});
    await tap($(id));Guide.stop();T.clear();SFX.steam(.8);floatText(x,240,'칙!');
    for(let i=0;i<8;i++)setTimeout(()=>puff(tx+rnd(-30,30),500,{r:6,dy:-rnd(30,60),ms:700}),i*80);
    await anim(800,p=>W1.sp.set({sx:.8+Math.sin(p*30)*.04,sy:1+Math.sin(p*30+1)*.05}));W1.sp.set({sx:.8,sy:1})}
  W1.sp.set({sx:1,sy:1});
  await dragTo(W1.sp,W1.g,{x:W1.sp.x,y:W1.sp.y-14},{x:W1.plateAt.x,y:W1.plateAt.y-14},90,'<em>젖은행주1</em>을 다시 <em>접시</em> 위에 놓아요');
  await W1.sp.to({x:W1.plateAt.x,y:W1.plateAt.y-4,r:0,sx:1,sy:1},180,E.out);W1.attach();SFX.pick()}
async function groupFlush(mode){
  setPFs(mode,false,false);
  await twistPF('out');await PF.to({x:M.grp.x-150,y:M.grp.y+40},350,E.out);floatText(PF.x,PF.y-50,'옆으로 비켜요');
  Panel.hint(`${M.side} <em>추출 버튼</em>을 눌러 그룹 헤드에서 <em>물만</em> 나오는지 봐요<small>추출 압력 확인</small>`);Guide.tap(M.btn);T.set('tap',M.btn);
  await tap($('#bBtn'+M.bs));Guide.stop();T.clear();setBrewBtn(true);needle(.7);
  await water([[M.grp.x-16,364,M.grp.x-16,548],[M.grp.x,364,M.grp.x,548],[M.grp.x+16,364,M.grp.x+16,548]],1400,$('#Lstream'));setBrewBtn(false);needle(0);floatText(M.grp.x,330,'물줄기 OK');
  await PF.to({x:M.grp.x,y:M.grp.y+30},300,E.out);await twistPF('in');SFX.ok()}
async function machineCheck(){
  await steamCheck();
  Panel.hint('<em>온수 버튼</em>을 눌러 뜨거운 물이 나오는지 봐요');Guide.tap({x:750,y:322});T.set('tap',{x:750,y:322});
  await tap($('#hwBtn'));Guide.stop();T.clear();await water([[812,472,812,548]],1100);floatText(812,470,'물 OK');
  await groupFlush(MODES.esp);await groupFlush(MODES.cap);
  setPFs(MODES.esp,false,false);
  SFX.ok();await toast('기기 점검 끝!')}
/* ---------- 준비 3) 잔 예열 ---------- */
const CUPSPOT=[{x:584,y:648},{x:672,y:648},{x:782,y:648},{x:902,y:648}];
let PP=null;  /* 바 장면의 작은 스팀피쳐 */
const WARM_P={x:466,y:186};
const GRILLZ=()=>[500,560,620,680,740,800,860,920,980].map(x=>({x,y:528,r:46}));
/* 그릴에 물 버리기: 물건을 기울여 물을 쏟는다 */
async function dumpTo(sp,at,r,empty,spout){await sp.to({x:at.x,y:at.y,r},260,E.out);const s=SFX.pour();
  const p=mk('path',{stroke:'#8fd0f2','stroke-width':6,'stroke-linecap':'round',fill:'none'});
  await anim(700,()=>{const o=spout?spout():{x:sp.x-40,y:sp.y-30};p.setAttribute('d',`M${o.x.toFixed(1)} ${o.y.toFixed(1)}Q${(o.x-6).toFixed(1)} ${(o.y+10).toFixed(1)} ${(o.x-4).toFixed(1)} 552`)});
  empty();p.remove();s.stop();for(let i=0;i<4;i++)drop(sp.x-30+rnd(-10,10),548,556,'#8fd0f2',4);await sp.to({r:0},220,E.back)}
const PS_=.3;
function pitcherSpout(){const a=PP.sp.r*Math.PI/180,lx=-104*PS_,ly=-246*PS_;return{x:PP.sp.x+lx*Math.cos(a)-ly*Math.sin(a),y:PP.sp.y+lx*Math.sin(a)+ly*Math.cos(a)}}
async function preheat(){
  PP=makePitcher('pp',1104,654,$('#Lprep'));PP.marks(false);PP.sp.set({sx:PS_,sy:PS_});
  Panel.hint('<em>스팀피쳐</em>를 <em>온수 노즐 아래</em>에 놓아요');zone(812,540,46,24);Guide.drag({x:1104,y:620},{x:812,y:520});T.set('drag',{x:1104,y:630},{x:812,y:530});
  await drag(PP.sp,PP.g,{zone:{x:812,y:548,r:70}});T.clear();await PP.sp.to({x:812,y:548,r:0,sx:PS_,sy:PS_},200,E.out);SFX.clink();
  Panel.hint('<em>온수 버튼</em>을 <em>꾹 누르고</em> 있어요');Guide.hold({x:750,y:322});T.set('hold',{x:750,y:322},null,{ms:2200});
  const st=mk('path',{stroke:'#8fd0f2','stroke-width':6,'stroke-linecap':'round',fill:'none'});let snd=null;
  await hold($('#hwBtn'),1800,(p,down)=>{PP.set(.75*p,0);st.setAttribute('d',down?`M812 472L812 ${(548-PS_*PH*.75*p).toFixed(1)}`:'')},on=>{if(on)snd=SFX.pour();else{snd&&snd.stop();snd=null}});
  st.remove();T.clear();SFX.ok();floatText(812,460,'온수 가득!');
  /* 잔 4개 내리기 */
  Cup.every.forEach(c=>{c.g.setAttribute('class','hit');c.line(false)});
  $('#Lprep').insertAdjacentHTML('afterbegin',CUPSPOT.map((s,i)=>`<ellipse id="cs${i}" class="ghost" cx="${s.x}" cy="${s.y-4}" rx="44" ry="12"/>`).join(''));
  Panel.hint('컵 워머의 <em>잔 4개</em>를 조리대에 내려요 <em>(0/4)</em><small>에스프레소 잔 2개, 카푸치노 잔 2개</small>');
  const zones=CUPSPOT.map(s=>({x:s.x,y:s.y-24,r:58,used:false}));let n=0;
  const next=()=>{const c=Cup.every.find(c=>c.spot==null),i=zones.findIndex(z=>!z.used);if(c&&i>=0){Guide.drag({x:c.sp.x,y:c.sp.y-30},{x:CUPSPOT[i].x,y:CUPSPOT[i].y-30});T.set('drag',{x:c.sp.x,y:c.sp.y-24},{x:CUPSPOT[i].x,y:CUPSPOT[i].y-24})}};next();
  await Promise.all(Cup.every.map(async c=>{c.spot=null;const i=await drag(c.sp,c.g,{zones,anchor:()=>({x:c.sp.x,y:c.sp.y-20})});zones[i].used=true;c.spot=i;$('#cs'+i).remove();
    await c.sp.to({...CUPSPOT[i],r:0,sx:1,sy:1},160,E.out);SFX.clink();n++;if(n<4){Panel.hint('컵 워머의 <em>잔 4개</em>를 조리대에 내려요 <em>('+n+'/4)</em>');next()}}));
  T.clear();
  /* 온수 70% */
  Cup.every.forEach(c=>{const {GR}=KIND[c.kind];c.mline.setAttribute('d',`M${-(GR-3)} ${c.mlY(.7*c.cap).toFixed(1)}H${GR-3}`);c.line(true);c.setWater(true)});
  Panel.hint('잔을 <em>꾹 누르고</em> 있으면 온수가 들어가요<small>빨간 선(70%)까지 채우고 손을 떼요</small>');
  await PP.sp.hop(CUPSPOT[0].x+70,560,500,60,0);
  let left=4;const order=()=>Cup.every.filter(c=>!c.full).sort((a,b)=>a.spot-b.spot);
  const point=()=>{const c=order()[0];if(!c)return;Guide.hold({x:c.sp.x,y:c.sp.y-30});T.set('fill',{x:c.sp.x,y:c.sp.y-30},null,{cap:c.cap})};point();
  const pst=mk('path',{stroke:'#8fd0f2','stroke-width':5,'stroke-linecap':'round',fill:'none'});
  await Promise.all(Cup.every.map(c=>holdLoop(c.g,()=>{const {GH}=KIND[c.kind];PP.sp.set({x:c.sp.x+52,y:c.sp.y-GH-6,r:-58});c.snd=SFX.pour()},
    dt=>{c.set(c.ml+c.cap*.42*dt);const s=pitcherSpout();pst.setAttribute('d',`M${s.x.toFixed(1)} ${s.y.toFixed(1)}Q${c.sp.x} ${s.y-4} ${c.sp.x} ${(c.sp.y+c.mlY(c.ml)).toFixed(1)}`);if(c.ml>=c.cap*.98)return 'stop'},
    async()=>{c.snd&&c.snd.stop();pst.setAttribute('d','');PP.sp.to({r:0,y:c.sp.y-80},200);const f=c.ml/c.cap;
      if(f<.55){Panel.hint('조금 더 부어요<small>빨간 선(70%)까지</small>');return false}
      if(f>.85){R.water++;SFX.no();Panel.hint('너무 많아요! 물을 버리고 <em>다시</em> 부어요');await anim(400,t=>c.set(c.ml*(1-t)));return false}
      c.full=true;PP.set(Math.max(.25,PP.L-.12));SFX.ok();floatText(c.sp.x,c.sp.y-90,'70%!');left--;
      if(left)Panel.hint('잘했어요! 나머지 잔도 채워요 <em>('+(4-left)+'/4)</em>');point();return true})));
  pst.remove();Guide.stop();T.clear();Cup.every.forEach(c=>c.line(false));
  PP.sp.set({r:0});
  Panel.hint('피쳐에 <em>남은 물</em>을 <em>그릴(물 버리는 곳)</em>에 버려요');zone(750,540,300,26);Guide.drag({x:PP.sp.x,y:PP.sp.y-20},{x:700,y:520});T.set('drag',{x:PP.sp.x,y:PP.sp.y-20},{x:700,y:528});
  await drag(PP.sp,PP.g,{zones:GRILLZ(),anchor:()=>({x:PP.sp.x,y:PP.sp.y-20})});zone();T.clear();
  await dumpTo(PP.sp,{x:clamp(PP.sp.x,520,980),y:530},-65,()=>PP.set(0,0),pitcherSpout);
  await dragTo(PP.sp,PP.g,{x:PP.sp.x,y:PP.sp.y-20},{x:WARM_P.x,y:WARM_P.y-20},70,'스팀피쳐를 <em>컵 워머 왼쪽</em>에 올려요<small>보조 피쳐로 써요</small>',{zr:36,zry:20});
  await PP.sp.to({...WARM_P,r:0,sx:PS_,sy:PS_},200,E.out);SFX.clink();
  SFX.ok();await toast('잔 예열 끝!')}
/* ---------- 준비 6) 잔 물은 그릴에 버리고, 하나씩 닦아 컵 워머로 ---------- */
async function cupsBack(){
  let n=0;const hint=()=>Panel.hint('잔을 <em>그릴(물 버리는 곳)</em>으로 가져가 물을 버려요 <em>('+n+'/4)</em>');hint();zone(750,540,300,26);
  const point=()=>{const c=Cup.every.find(c=>c.ml>0&&!c.busy);if(c){Guide.drag({x:c.sp.x,y:c.sp.y-30},{x:c.sp.x,y:520});T.set('drag',{x:c.sp.x,y:c.sp.y-24},{x:c.sp.x,y:540})}};point();
  const gz=GRILLZ();
  await Promise.all(Cup.every.map(async c=>{const home={x:c.sp.x,y:c.sp.y};
    await drag(c.sp,c.g,{zones:gz,anchor:()=>({x:c.sp.x,y:c.sp.y-20})});c.busy=true;T.clear();
    const {GH,GR}=KIND[c.kind];
    await dumpTo(c.sp,{x:clamp(c.sp.x,500,1000),y:540},-75,()=>{c.set(0);c.setWater(false)},()=>{const a=c.sp.r*Math.PI/180,lx=-GR,ly=-GH;return{x:c.sp.x+lx*Math.cos(a)-ly*Math.sin(a),y:c.sp.y+lx*Math.sin(a)+ly*Math.cos(a)}});
    c.set(0);c.setWater(false);await c.sp.hop(home.x,home.y,420,40,.06);SFX.clink();n++;c.busy=false;if(n<4){hint();point()}}));zone();T.clear();
  /* 마른행주2로 한 잔씩 */
  const D2=CL.D2,cs=Cup.every.slice().sort((a,b)=>a.sp.x-b.sp.x);
  await rub(D2,{targets:cs.map(c=>({x:c.sp.x,y:c.sp.y-KIND[c.kind].GH*.3,rx:c.kind==='demi'?60:76,ry:46,need:240})),
    hint:k=>`<em>마른행주2</em>로 잔을 하나씩 닦아요 <em>(${k}/4)</em><small>다 닦으면 손을 떼지 말고 다음 잔으로 옮겨요</small>`,done:'뽀득!',
    carry:{to:TRAYSPOT.D2,r:100,zr:70,hint:'손을 떼지 말고 그대로 <em>트레이</em>에 놓아요'}});

  /* 컵 워머로 */
  const W=[...KIND.demi.warm.map(w=>({...w,kind:'demi'})),...KIND.capp.warm.map(w=>({...w,kind:'capp'}))];
  $('#Lprep').insertAdjacentHTML('afterbegin',W.map((w,i)=>`<ellipse id="ws${i}" class="ghost" cx="${w.x}" cy="${w.y-4}" rx="${w.kind==='demi'?34:50}" ry="10"/>`).join(''));
  Panel.hint('잔을 다시 <em>컵 워머</em>에 올려요<small>작은 잔은 왼쪽, 큰 잔은 오른쪽</small>');
  const zones=W.map(w=>({x:w.x,y:w.y-24,r:46,used:false}));
  const next=()=>{const c=Cup.every.find(c=>!c.back);if(!c)return;const i=zones.findIndex((z,i)=>!z.used&&W[i].kind===c.kind);Guide.drag({x:c.sp.x,y:c.sp.y-30},{x:W[i].x,y:W[i].y-30});T.set('drag',{x:c.sp.x,y:c.sp.y-24},{x:W[i].x,y:W[i].y-24})};next();
  await Promise.all(Cup.every.map(async c=>{const i=await drag(c.sp,c.g,{zones,anchor:()=>({x:c.sp.x,y:c.sp.y-20}),accept:i=>W[i].kind===c.kind,
      reject:()=>{R.cupWrong++;SFX.no();Panel.hint(c.kind==='demi'?'에스프레소 잔(작은 잔)은 <em>왼쪽</em>이에요':'카푸치노 잔(큰 잔)은 <em>오른쪽</em>이에요')}});
    zones[i].used=true;c.back=true;$('#ws'+i).remove();await c.sp.to({x:W[i].x,y:W[i].y,r:0,sx:1,sy:1},160,E.out);SFX.clink();next()}));T.clear();SFX.ok()}
/* ---------- 준비 8) 기물: 위에서 본 조리대. 겹친 받침·스푼을 마른행주3으로 닦아 앞쪽에 놓기 ---------- */
const clothTop=`<rect x="-80" y="-56" width="160" height="112" rx="16" fill="#4a2c22" opacity=".14" transform="translate(5 7)"/><rect x="-80" y="-56" width="160" height="112" rx="16" fill="#fffdf8" class="o4"/>
  <path d="M-62 -24H62M-62 24H62" stroke="#e0d0b8" stroke-width="5"/><text y="10" text-anchor="middle" font-size="30" fill="#8a5a44">마른3</text>`;
async function wares(){
  openPop('기물 준비',`<rect width="1000" height="600" fill="#f4f1ec"/><g fill="#e3ddd4"><circle cx="90" cy="300" r="4"/><circle cx="380" cy="560" r="3"/><circle cx="720" cy="90" r="4"/><circle cx="930" cy="330" r="3"/></g>
    <path d="M40 300H960" stroke="#d8cfc2" stroke-width="3" stroke-dasharray="14 12"/><text x="40" y="290" font-size="22" fill="#a08870">닦기 전 ↑</text><text x="40" y="326" font-size="22" fill="#a08870">닦은 뒤 ↓</text>`);
  const it=$('#prepItems');
  const mkItem=(html,x,y)=>{const g=document.createElementNS(NS,'g');g.setAttribute('class','hit');g.innerHTML=html;it.appendChild(g);return{g,sp:new Sp(g,x,y)}};
  const G=[{x:130,y:430,r:50,k:'e'},{x:270,y:430,r:50,k:'e'},{x:440,y:430,r:66,k:'c'},{x:610,y:430,r:66,k:'c'}];
  $('#prepGhost').innerHTML=G.map((g,i)=>`<circle id="wg${i}" class="ghost" cx="${g.x}" cy="${g.y}" r="${g.r}"/>`).join('')
    +`<text x="200" y="530" text-anchor="middle" font-size="24" fill="#8a5a44">에스프레소용</text><text x="525" y="530" text-anchor="middle" font-size="24" fill="#8a5a44">카푸치노용</text>`;
  /* 겹친 받침: 아래 것부터 만들어 위 것이 위에 그려지게 */
  const ST={e:{x:180,y:160},c:{x:420,y:160}};
  const S=[];for(const k of ['e','c'])for(let j=0;j<2;j++){const o=mkItem(saucerTopR(k==='e'?50:66),ST[k].x,ST[k].y-j*8);o.k=k;o.g.setAttribute('class','np');S.push(o)}
  const order=[S[1],S[0],S[3],S[2]];  /* 맨 위 받침부터 */
  /* 스푼이 꽂힌 유리컵 */
  const glass=pmk('g',{class:'hit',transform:'translate(660 150)'});glass.innerHTML=`<circle r="48" fill="#4a2c22" opacity=".12" cx="5" cy="7"/><circle r="48" fill="#e8f3f6" fill-opacity=".7" class="o4"/><circle r="36" fill="none" stroke="#fff" stroke-width="5" opacity=".8"/>`;
  const SP=[[-40,-26],[40,-30],[-36,30],[44,24]].map(([dx,dy],i)=>{const o=mkItem(`<g transform="scale(.62)">${spoonTop}</g>`,660+dx*.5,150+dy*.5);o.g.setAttribute('class','np');o.sp.set({r:Math.atan2(dy,dx)*180/Math.PI+180});return o});
  const cloth=mkItem(clothTop,860,470);const home={x:860,y:470};
  const C={g:cloth.g,sp:cloth.sp};
  const zones=G.map(g=>({x:g.x,y:g.y,r:80,used:false}));
  for(let j=0;j<4;j++){const o=order[j],name=o.k==='e'?'에스프레소':'카푸치노';
    o.g.parentNode.appendChild(o.g);C.g.parentNode.appendChild(C.g);
    await rub(C,{svg:svgP,x:o.sp.x,y:o.sp.y+14,rx:o.k==='e'?70:86,ry:60,need:260,hint:`<em>마른행주3</em>으로 ${name} 받침을 닦아요 <em>(${j}/4)</em>`,done:'뽀득!',end:home});
    o.g.setAttribute('class','hit');
    const i0=zones.findIndex((z,i)=>!z.used&&G[i].k===o.k);Panel.hint(`닦은 받침을 <em>아래쪽 ${name}용</em> 자리에 놓아요`);Guide.drag({x:o.sp.x,y:o.sp.y},{x:G[i0].x,y:G[i0].y});T.set('drag',{x:o.sp.x,y:o.sp.y},{x:G[i0].x,y:G[i0].y},{svg:'prepSvg'});
    const i=await drag(o.sp,o.g,{svg:svgP,zones,bounds:[60,60,960,560],accept:i=>G[i].k===o.k,
      reject:()=>{R.ware++;SFX.no();Panel.hint(o.k==='e'?'이건 <em>작은 받침</em>이에요. <em>에스프레소용</em> 자리에 놓아요':'이건 <em>큰 받침</em>이에요. <em>카푸치노용</em> 자리에 놓아요')}});
    T.clear();zones[i].used=true;$('#wg'+i).classList.add('done');await o.sp.to({x:G[i].x,y:G[i].y,r:0,sx:1,sy:1},180,E.back);SFX.clink()}
  /* 스푼 4개: 하나씩 꺼내 닦고 받침 위쪽에 (손잡이 왼쪽) */
  const SG=G.map(g=>({x:g.x,y:g.y-g.r+16}));
  $('#prepGhost').insertAdjacentHTML('beforeend',SG.map((g,i)=>`<g id="sg${i}" class="ghost" transform="translate(${g.x} ${g.y}) scale(.62)"><path d="M-62 -7H14V7H-62Z M14 0A24 15 0 1 0 58 0A24 15 0 1 0 14 0"/></g>`).join(''));
  const sz=SG.map(g=>({x:g.x,y:g.y,r:70,used:false}));
  for(let j=0;j<4;j++){const o=SP[j];
    Panel.hint(`유리컵에서 <em>스푼</em>을 하나 꺼내요 <em>(${j}/4)</em>`);Guide.tap({x:660,y:150});T.set('tap',{x:660,y:150},null,{svg:'prepSvg'});
    o.g.setAttribute('class','hit');await new Promise(r=>{const h=()=>{glass.removeEventListener('click',h);o.g.removeEventListener('click',h);r()};glass.addEventListener('click',h);o.g.addEventListener('click',h)});
    Guide.stop();T.clear();SFX.pick();it.appendChild(o.g);o.left=Math.random()<.5;await o.sp.to({x:800,y:250,r:o.left?0:180},300,E.out);
    C.g.parentNode.appendChild(C.g);
    await rub(C,{svg:svgP,x:800,y:264,rx:90,ry:50,need:200,hint:`<em>마른행주3</em>으로 스푼을 닦아요 <em>(${j}/4)</em>`,done:'반짝!',end:home});
    Panel.hint('닦은 스푼을 받침 위쪽에 놓아요<small>손잡이는 왼쪽. 스푼을 톡 누르면 방향이 바뀌어요</small>');
    const point=()=>{const i=sz.findIndex(z=>!z.used);if(!o.left){Guide.tap({x:o.sp.x,y:o.sp.y});T.set('tap',{x:o.sp.x,y:o.sp.y},null,{svg:'prepSvg'})}else{Guide.drag({x:o.sp.x,y:o.sp.y},{x:SG[i].x,y:SG[i].y});T.set('drag',{x:o.sp.x,y:o.sp.y},{x:SG[i].x,y:SG[i].y},{svg:'prepSvg'})}};point();
    const i=await drag(o.sp,o.g,{svg:svgP,zones:sz,bounds:[60,60,960,560],
      tap:()=>{o.left=!o.left;SFX.pick();o.sp.to({r:o.left?0:180},280,E.back).then(point)},accept:()=>o.left,
      reject:()=>{R.ware++;SFX.no();Panel.hint('손잡이가 <em>왼쪽</em>으로 가게 해요<small>스푼을 톡 눌러서 돌려요</small>')}});
    T.clear();sz[i].used=true;$('#sg'+i).classList.add('done');await o.sp.to({x:SG[i].x,y:SG[i].y,r:0,sx:1,sy:1},180,E.back);SFX.clink()}
  T.clear();SFX.ok();await toast('기물 준비 끝!');closePop()}
/* ---------- 준비 8~9) 스팀피쳐를 우유 앞에, 우유 양 확인 ---------- */
async function milkCheck(){
  openPop('우유 확인',`<rect width="1000" height="600" fill="#eaf3ea"/><rect y="470" width="1000" height="130" fill="#f6f3ee"/><path d="M0 470H1000" class="o3 nf"/>`);
  const lv=Math.random()<.3?rnd(.28,.4):rnd(.62,.85);R.milkLow=lv<.5;
  const ct=pmk('g',{class:'np',transform:'translate(270 490)'});
  ct.innerHTML=`<rect x="-100" y="-330" width="200" height="330" rx="12" fill="#fff" fill-opacity=".55" class="o4"/>
    <clipPath id="ctc"><rect x="-96" y="-326" width="192" height="322" rx="10"/></clipPath>
    <g clip-path="url(#ctc)"><rect id="ctMilk" x="-100" y="${(-330*lv).toFixed(1)}" width="200" height="${(330*lv).toFixed(1)}" fill="#fffdf6"/><path id="ctTop" d="M-100 ${(-330*lv).toFixed(1)}H100" stroke="#e8dcc4" stroke-width="5"/></g>
    <path d="M-100 -330L-70 -380H70L100 -330Z" fill="#9fd0f0" class="o4"/><rect x="40" y="-396" width="24" height="18" fill="#9fd0f0" class="o3"/>
    <rect x="-100" y="-250" width="200" height="56" fill="#7fb8e8" opacity=".9"/><text x="0" y="-210" text-anchor="middle" font-size="36" fill="#fff">우유</text>
    <path d="M-100 -165H100" stroke="#e2634d" stroke-width="4" stroke-dasharray="10 7"/><text x="-112" y="-158" text-anchor="end" font-size="26" fill="#e2634d">50%</text>
    <path d="M-80 -312L-86 -40" stroke="#fff" stroke-width="10" opacity=".7" stroke-linecap="round"/>`;
  const P2=makePitcher('mc',820,520);P2.marks(false);P2.sp.set({sx:.62,sy:.62});
  $('#prepGhost').innerHTML=`<ellipse id="mg" class="ghost" cx="500" cy="500" rx="62" ry="20"/><text x="500" y="560" text-anchor="middle" font-size="24" fill="#8a5a44">우유 앞</text>`;
  Panel.hint('물기를 닦은 <em>스팀피쳐</em>를 <em>우유 앞</em>에 놓아요');Guide.drag({x:820,y:440},{x:500,y:440});T.set('drag',{x:820,y:440},{x:500,y:440},{svg:'prepSvg'});
  await drag(P2.sp,P2.g,{svg:svgP,zones:[{x:500,y:520,r:110}],bounds:[60,120,960,580]});$('#prepGhost').innerHTML='';await P2.sp.to({x:500,y:520,r:0,sx:.62,sy:.62},180,E.out);SFX.clink();T.clear();
  /* 충분한가? */
  const btn=(x,y,txt,col)=>{const g=pmk('g',{class:'hit',transform:`translate(${x} ${y})`});g.innerHTML=`<rect x="-120" y="-40" width="240" height="80" rx="40" fill="${col}" class="o4"/><text y="12" text-anchor="middle" font-size="34" fill="#fff">${txt}</text>`;return g};
  const bOk=btn(830,180,'충분해요','#4fae6b'),bLow=btn(830,300,'부족해요','#e2634d');
  Panel.hint('우유가 <em>50%</em>보다 많아요?<small>빨간 선을 봐요</small>');
  for(;;){T.set('choose',null,null,{svg:'prepSvg',ok:{x:830,y:180},low:{x:830,y:300},answer:R.milkLow?'low':'ok'});
    const a=await Promise.race([tap(bOk).then(()=>'ok'),tap(bLow).then(()=>'low')]);T.clear();
    if((a==='low')===R.milkLow)break;R.milk++;SFX.no();Panel.hint(R.milkLow?'다시 봐요. 우유가 <em>빨간 선(50%)보다 아래</em>예요':'다시 봐요. 우유가 <em>빨간 선(50%)보다 위</em>예요')}
  bOk.remove();bLow.remove();SFX.ok();
  if(R.milkLow){R.lines.push(await sayLine('우유가 부족합니다.','심사위원에게 꼭 말해요'));
    const m=$('#ctMilk'),tp=$('#ctTop');await anim(900,t=>{const h=330*lerp(lv,.9,t);m.setAttribute('y',-h);m.setAttribute('height',h);tp.setAttribute('d',`M-100 ${-h}H100`)});floatText(270,120,'새 우유를 받았어요',$('#fxP'))}
  else floatText(270,120,'충분해요!',$('#fxP'));
  await sleep(900);closePop()}

/* ---------- 준비 과정 진행 ---------- */
async function prep(){
  M={...MODES.esp,name:'준비',key:'prep'};STEPS=['행주 놓기','기기 점검','잔 예열','그라인더','탬퍼·바닥','잔 정리','머신 청소','기물·우유','머신 아래·마무리'];LINES_TOTAL=2;
  R={lines:[],t:0,placed:[],water:0,cupWrong:0,ware:0,milk:0,milkLow:false};lineNo=0;wrongCloth=0;
  resetBar();hidePitchers();Cup.every.forEach(c=>c.line(false));scene('judge');Guide.use('#handJ');JUDGES.forEach((j,i)=>{jface(i,'idle');$('#J'+i+' .check').style.opacity=0});
  for(const k in CL)delete CL[k];
  Object.keys(CLOTH).forEach(k=>makeCloth(k,TRAYSPOT[k]));grinderDirt();counterDirt();
  step(1);await sleep(500);await judgeSay(0,'준비 시작해 주세요.');Bubble.hide();
  R.lines.push(await sayLine('준비 시작하겠습니다.',lineTag()));nod(0);Panel.hide();
  scene('bar');Guide.use('#hand');await sleep(900);Clock.start(300);
  await prepCloths();
  step(2);await machineCheck();const drops=grillDrops();
  step(3);await preheat();
  step(4);T.set('brush');await brushDirt(()=>true,'<em>붓</em>으로 그라인더와 <em>넉박스 주변</em>을 쓸어요<small>도저 안과 주변 가루를 확인해요</small>');T.clear();
  step(5);await rub(CL.D1,{x:1556,y:606,rx:70,ry:52,need:360,hint:'<em>마른행주1</em>로 <em>탬퍼</em>를 닦아요',end:SPOT.D1});
  await rub(CL.W3,{x:1160,y:646,rx:110,ry:30,dots:$('#dirt2'),hint:'<em>젖은행주3</em>으로 <em>조리대 바닥</em>의 가루를 닦아요',end:SPOT.W3});
  step(6);await cupsBack();
  step(7);await rub(CL.W2,{x:750,y:556,rx:300,ry:34,dots:drops,hint:'<em>젖은행주2</em>로 <em>그릴</em>의 물기를 닦아요',end:SPOT.W2});
  await rub(CL.D2,{x:750,y:556,rx:300,ry:34,need:700,hint:'<em>마른행주2</em>로 그릴을 한 번 더 닦아요',done:'반짝!',
    carry:{to:SPOT.D2,r:90,hint:'손을 떼지 말고 그대로 <em>컵 워머 오른쪽 앞</em>으로 옮겨요'}});drops.remove();
  step(8);Panel.hide();await wares();await milkCheck();
  step(9);const md=machineDrops();
  await rub(CL.W3,{x:750,y:634,rx:300,ry:42,dots:md,hint:'<em>젖은행주3</em>으로 <em>머신 아래</em>를 다 닦아요',end:SPOT.W3});
  await rub(CL.D3,{x:750,y:634,rx:300,ry:42,need:800,hint:'<em>마른행주3</em>으로 머신 아래를 한 번 더 닦아요',done:'반짝!'});md.remove();
  await placeCloth('D3',SPOT.D3,'<em>마른행주3</em>을 <em>머신 앞</em>에 길게 펴 놓아요');CL.D3.setLong(true);sparkle(SPOT.D3.x,SPOT.D3.y-20,6);SFX.ok();
  const sec=Clock.stop();
  R.lines.push(await sayLine('준비 마치겠습니다.',lineTag()));Panel.hide();
  const avg=R.lines.reduce((a,b)=>a+b,0)/R.lines.length;
  showRows('준비 과정 결과',[
    ['걸린 시간',mmss(sec)+(sec<=300?' · 5분 안에':' · 5분 넘음'),sec<=300?'g2':'yel'],
    ['대사 발음',`별 평균 ${avg.toFixed(1)}`,avg>=2.5?'g2':avg>=1.8?'g1':'yel'],
    ['행주 자리',wrongCloth?`${wrongCloth}번 다른 행주를 집었어요`:'모두 맞게 놓았어요',wrongCloth?'yel':'g2'],
    ['잔 예열 물',R.water?`${R.water}번 너무 많이 부었어요`:'70%로 잘 채웠어요',R.water?'yel':'g2'],
    ['잔 자리',R.cupWrong?`${R.cupWrong}번 다른 자리`:'잘했어요',R.cupWrong?'yel':'g2'],
    ['기물 준비',R.ware?`${R.ware}번 다시`:'잘했어요',R.ware?'yel':'g2'],
    ['우유 확인',(R.milkLow?'부족 → 말했어요':'충분')+(R.milk?` (${R.milk}번 다시 봄)`:''),R.milk?'yel':'g2']])}

/* ---------- 정리 ---------- */
async function cleanGroup(mode,first){
  setPFs(mode,true,first);
  await twistPF('out');
  Panel.hint('<em>포터필터</em>를 <em>넉박스</em>로 가져가요');zone(1150,540,62,30);Guide.drag({x:PF.x,y:PF.y+20},{x:1150,y:500});T.set('drag',{x:PF.x,y:PF.y+20},{x:1150,y:500});
  await drag(PF,$('#pf'),{zone:{x:1150,y:500,r:110}});T.clear();
  await Promise.all([PF.to({x:1150,y:470,r:0,sx:1,sy:1},220,E.out),anim(220,t=>setHandle(lerp(-.7,.45,t)))]);
  Panel.hint('포터필터를 <em>톡톡</em> 눌러 커피 찌꺼기를 버려요 <em>(0/2)</em>');
  for(let i=0;i<2;i++){Guide.tap({x:1150,y:500});T.set('tap',{x:1150,y:500});await tap($('#pf'));Guide.stop();T.clear();
    SFX.thud();shake();await PF.to({y:492},70,E.out);await PF.to({y:470},160,E.out);if(i===0)Panel.hint('한 번 더 <em>톡</em>! <em>(1/2)</em>')}
  setGrounds(0,false);const pk=mk('ellipse',{cx:1150,cy:478,rx:36,ry:8,fill:'#3f2314',stroke:'#4a2c22','stroke-width':3});
  await anim(300,t=>pk.setAttribute('cy',lerp(478,556,t)),t=>t*t);pk.setAttribute('rx',30);floatText(1150,430,'쿵!');
  Panel.hint(`${M.side} <em>추출 버튼</em>을 눌러 그룹 헤드에 물을 흘려요`);Guide.tap(M.btn);T.set('tap',M.btn);
  await tap($('#bBtn'+M.bs));Guide.stop();T.clear();setBrewBtn(true);await water([[M.grp.x-14,366,M.grp.x-14,548],[M.grp.x+14,366,M.grp.x+14,548]],1300);setBrewBtn(false);floatText(M.grp.x,330,'물로 헹궜어요');
  await rub(CL.D1,{x:1150,y:496,rx:80,ry:56,need:380,hint:'<em>마른행주1</em>로 <em>포터필터</em>를 닦아요',end:SPOT.D1,done:'반짝!'});
  Panel.hint('<em>포터필터</em>를 '+M.side+' 그룹 아래로 가져가요');zone(M.grp.x,M.grp.y+40,80,64);Guide.drag({x:PF.x,y:PF.y+20},{x:M.grp.x,y:M.grp.y+40});T.set('drag',{x:PF.x,y:PF.y+20},{x:M.grp.x,y:M.grp.y+40});
  await drag(PF,$('#pf'),{zone:{x:M.grp.x,y:M.grp.y+20,r:110}});T.clear();
  await Promise.all([PF.to({x:M.grp.x,y:M.grp.y+30,r:0,sx:1,sy:1},220,E.out),anim(220,t=>setHandle(lerp(.45,-.7,t)))]);$('#collar').style.display='';
  await twistPF('in');SFX.ok()}
async function cleanup(){
  M={...MODES.esp,name:'정리',key:'clean'};STEPS=['피쳐 정리','왼쪽 포터필터','오른쪽 포터필터','그라인더','바닥·탬퍼','행주 정리','마무리'];LINES_TOTAL=1;
  R={lines:[],t:0};lineNo=0;
  resetBar();hidePitchers();Cup.every.forEach(c=>c.line(false));scene('bar');Guide.use('#hand');for(const k in CL)delete CL[k];
  Object.keys(CLOTH).forEach(k=>makeCloth(k,SPOT[k],k==='D3'));grinderDirt();counterDirt();
  const pits=[575,614].map((x,i)=>{const p=makePitcher('cp'+i,x,652,$('#Lprep'));$('#Lprep').prepend(p.g);p.marks(false);p.set(.06,.1);p.sp.set({sx:PS_,sy:PS_});return p});
  step(1);await sleep(600);await toast('시연 끝! 이제 정리해요');Clock.start(0);
  /* 1) 피쳐 2개를 트레이로 */
  Panel.hint('다 쓴 <em>스팀피쳐 2개</em>를 <em>트레이</em>에 올려요');const TS=[{x:196,y:600},{x:284,y:600}];zone(240,600,100,24);
  const tz=TS.map(s=>({x:s.x,y:s.y,r:80,used:false}));
  const nextP=()=>{const p=pits.find(p=>!p.done),i=tz.findIndex(z=>!z.used);if(p&&i>=0){Guide.drag({x:p.sp.x,y:p.sp.y-20},{x:TS[i].x,y:TS[i].y-20});T.set('drag',{x:p.sp.x,y:p.sp.y-20},{x:TS[i].x,y:TS[i].y-20})}};nextP();
  await Promise.all(pits.map(async p=>{const i=await drag(p.sp,p.g,{zones:tz});tz[i].used=true;p.done=true;await p.sp.to({x:TS[i].x,y:TS[i].y,r:0,sx:PS_,sy:PS_},180,E.out);SFX.clink();nextP()}));zone();T.clear();
  /* 2) 포터필터 두 개 */
  step(2);await cleanGroup(MODES.esp,true);
  step(3);await cleanGroup(MODES.cap,false);
  /* 3) 그라인더 */
  step(4);T.set('brush');await brushDirt(()=>true,'<em>붓</em>으로 그라인더 주변을 쓸어요');T.clear();
  /* 4) 바닥, 탬퍼 */
  step(5);await rub(CL.W3,{x:1160,y:646,rx:110,ry:30,dots:$('#dirt2'),hint:'<em>젖은행주3</em>으로 <em>조리대 바닥</em>을 닦아요',end:SPOT.W3});
  await rub(CL.D1,{x:1556,y:606,rx:70,ry:52,need:360,hint:'<em>마른행주1</em>로 <em>탬퍼</em>를 닦아요',end:SPOT.D1});
  /* 5) 행주 6장 트레이로 */
  step(6);
  Panel.hint('<em>행주 6장</em>을 접시째 모두 <em>트레이</em>에 올려요 <em>(0/6)</em>');zone(230,630,170,52);
  const tray=[{x:230,y:640,r:200,used:false}];let n=0;
  const next=()=>{const k=Object.keys(CL).find(k=>!CL[k].home);if(k){const c=CL[k];Guide.drag({x:c.sp.x,y:c.sp.y-14},{x:TRAYSPOT[k].x,y:TRAYSPOT[k].y-14});T.set('drag',{x:c.sp.x,y:c.sp.y-14},{x:230,y:626})}};next();
  await Promise.all(Object.values(CL).map(async c=>{await drag(c.sp,c.g,{zones:tray,bounds:[30,110,1570,700]});c.home=true;if(c.long)c.setLong(false);await c.sp.to({...TRAYSPOT[c.k],r:0,sx:1,sy:1},200,E.out);SFX.pick();n++;
    if(n<6){Panel.hint('<em>행주 6장</em>을 접시째 모두 <em>트레이</em>에 올려요 <em>('+n+'/6)</em>');next()}}));zone();T.clear();
  step(7);const sec=Clock.stop();
  R.lines.push(await sayLine('시연 및 정리 마치겠습니다!',lineTag()));Panel.hide();
  const avg=R.lines.reduce((a,b)=>a+b,0)/R.lines.length;
  showRows('정리 결과',[['걸린 시간',mmss(sec),'g2'],['대사 발음',`별 평균 ${avg.toFixed(1)}`,avg>=2.5?'g2':avg>=1.8?'g1':'yel'],
    ['피쳐 정리','트레이에 올렸어요','g2'],['포터필터 2개','버리고·헹구고·닦았어요','g2'],['그라인더·바닥·탬퍼','깨끗해요','g2'],['행주 6장','트레이에 올렸어요','g2']])}

$('#goPrep').onclick=startWith(()=>prep());$('#goClean').onclick=startWith(()=>cleanup());
