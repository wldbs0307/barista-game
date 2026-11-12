/* ================= 카푸치노 단계 (실기 시연 7~14) ================= */
const TRAY_BG=$('#prepBg').innerHTML;
function openPop(title,bg){$('#prepBg').innerHTML=bg;$('#prepGhost').innerHTML='';$('#prepItems').innerHTML='';$('#fxP').innerHTML='';
  $('#prep .ttl').textContent=title;$('#prep').classList.remove('off');Guide.use('#handP');Guide.delay=600}
function closePop(){Guide.stop();$('#prep').classList.add('off');Guide.use('#hand');Guide.delay=350;$('#prepBg').innerHTML=TRAY_BG;$('#prepGhost').innerHTML='';$('#prepItems').innerHTML='';$('#prep .ttl').textContent='서빙 준비'}
const pmk=(tag,at,parent)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);(parent||$('#prepItems')).appendChild(e);return e};
/* 누르고 있는 동안 onTick(dt초) — 뗄 때마다 onUp() 이 true면 끝 */
function holdLoop(el,onDown,onTick,onUp){return new Promise(res=>{let down=false,last=0,done=false;
  const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}down=true;last=performance.now();Guide.pause();onDown&&onDown()};
  const up=async()=>{if(!down)return;down=false;const r=await onUp();if(r){done=true;off();res(r)}else Guide.resume()};
  const ctx=e=>e.preventDefault();
  const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('lostpointercapture',up);el.removeEventListener('contextmenu',ctx)};
  el.addEventListener('pointerdown',dn);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);el.addEventListener('contextmenu',ctx);
  const f=now=>{if(done)return;if(down){const dt=(now-last)/1000;last=now;const r=onTick(dt);if(r==='stop'){down=false;Promise.resolve(onUp()).then(x=>{if(x){done=true;off();res(x)}else Guide.resume()})}}requestAnimationFrame(f)};requestAnimationFrame(f)})}

/* ---------- 그림: 옆에서 본 투명 스팀피쳐 ---------- */
const PH=230,NOSE=.45;
function pitcherSide(uid){const body=`M-70 -${PH}L-80 -12Q-80 0 -68 0H68Q80 0 80 -12L70 -${PH}Z`;
  return `<ellipse cx="0" cy="6" rx="86" ry="10" fill="#4a2c22" opacity=".14"/>
  <path d="M70 -196C122 -192 122 -66 76 -58" fill="none" stroke="#4a2c22" stroke-width="18" stroke-linecap="round"/><path d="M70 -196C122 -192 122 -66 76 -58" fill="none" stroke="#c7d2d8" stroke-width="8" stroke-linecap="round"/>
  <clipPath id="pc${uid}"><path d="${body}"/></clipPath>
  <g clip-path="url(#pc${uid})"><rect class="pm" x="-90" y="0" width="180" height="0" fill="#fffdf6"/><rect class="pf" x="-90" y="0" width="180" height="0" fill="#f3e4c6"/>
    <g class="pb" opacity="0" fill="none" stroke="#d9c7a3" stroke-width="2.5"><circle cx="-40" cy="0" r="6"/><circle cx="-10" cy="4" r="4"/><circle cx="22" cy="-2" r="5"/><circle cx="48" cy="5" r="3.5"/><circle cx="-58" cy="6" r="3"/></g></g>
  <path d="${body}" fill="#e3ecf0" fill-opacity=".3" class="o4"/>
  <path d="M-70 -${PH}L-104 -${PH+16}L-75 -${PH*NOSE}" fill="#e9f0f3" fill-opacity=".6" class="o4"/>
  <path d="M-56 -${PH-14}L-62 -24" stroke="#fff" stroke-width="9" opacity=".75" stroke-linecap="round"/>
  <path class="nose" d="M-75 -${(PH*NOSE).toFixed(1)}H66" stroke="#e2634d" stroke-width="3" stroke-dasharray="7 6"/>
  <text class="noset" x="-112" y="${(-PH*NOSE+8).toFixed(1)}" text-anchor="end" font-size="24" fill="#e2634d">코</text>`}
function makePitcher(uid,x,y,parent,flip){const g=document.createElementNS(NS,'g');g.setAttribute('class','hit');
  g.innerHTML=`<g class="pin" transform="scale(${flip?-1:1} 1)">${pitcherSide(uid)}</g>`;(parent||$('#prepItems')).appendChild(g);
  const p={g,sp:new Sp(g,x,y),L:0,foam:0,pm:$('.pm',g),pf:$('.pf',g),pb:$('.pb',g),nose:$('.nose',g),noset:$('.noset',g)};
  p.set=(L,foam)=>{p.L=L;if(foam!=null)p.foam=foam;const top=-L*PH,fh=Math.min(L*PH,p.foam*46);p.pm.setAttribute('y',top.toFixed(1));p.pm.setAttribute('height',(L*PH).toFixed(1));
    p.pf.setAttribute('y',top.toFixed(1));p.pf.setAttribute('height',fh.toFixed(1));p.pb.setAttribute('transform',`translate(0 ${(top+fh*.5).toFixed(1)})`);p.pb.setAttribute('opacity',clamp(p.foam*1.4,0,1))};
  p.marks=on=>{p.nose.style.display=on?'':'none';p.noset.style.display=on?'':'none'};p.set(0,0);return p}

/* ---------- 3) 우유 따르기: 코까지 ---------- */
async function milkPour(){
  openPop('우유 따르기',`<rect width="1000" height="600" fill="#eaf3ea"/><rect y="470" width="1000" height="130" fill="#f6f3ee"/><path d="M0 470H1000" class="o3 nf"/>`);
  const P1=makePitcher('mp',600,520);P1.marks(true);
  const carton=pmk('g',{class:'hit'});carton.innerHTML=`<g class="ct"><rect x="-60" y="-200" width="120" height="200" rx="8" fill="#fff" class="o4"/><path d="M-60 -200L-40 -240H40L60 -200Z" fill="#9fd0f0" class="o4"/>
    <rect x="-60" y="-150" width="120" height="70" fill="#7fb8e8"/><text x="0" y="-104" text-anchor="middle" font-size="34" fill="#fff">우유</text><circle cx="0" cy="-48" r="22" fill="#fff" stroke="#7fb8e8" stroke-width="5"/><rect x="20" y="-250" width="18" height="14" fill="#9fd0f0" class="o3"/></g>`;
  const CT=new Sp(carton,320,470);
  const st=pmk('path',{fill:'none',stroke:'#fffdf6','stroke-width':12,'stroke-linecap':'round',class:'np'});const st0=pmk('path',{fill:'none',stroke:'#cdbfae','stroke-width':17,'stroke-linecap':'round',class:'np'});st0.after(st);
  Panel.hint('우유를 <em>꾹 누르고</em> 있다가 <em>코</em>까지 차면 손을 떼요');Guide.hold({x:320,y:380});
  let snd=null,tries=0;
  const spout=()=>{const a=CT.r*Math.PI/180,lx=29,ly=-243;return{x:CT.x+lx*Math.cos(a)-ly*Math.sin(a),y:CT.y+lx*Math.sin(a)+ly*Math.cos(a)}};
  const draw=on=>{if(!on){st.setAttribute('d','');st0.setAttribute('d','');return}const s=spout(),ty=P1.sp.y-P1.L*PH;const d=`M${s.x.toFixed(1)} ${s.y.toFixed(1)}Q${(s.x+24).toFixed(1)} ${(s.y+30).toFixed(1)} ${(s.x+26).toFixed(1)} ${ty.toFixed(1)}`;st.setAttribute('d',d);st0.setAttribute('d',d)};
  const r=await holdLoop(carton,()=>{SFX.pick();CT.to({x:341,y:189,r:100},300,E.out);snd=SFX.pour()},
    dt=>{if(Math.abs(CT.r-100)<4){P1.set(Math.min(.8,P1.L+.2*dt));draw(true)}if(P1.L>=.8)return 'stop'},
    async()=>{snd&&snd.stop();draw(false);await CT.to({x:320,y:470,r:0},280,E.io);
      const L=P1.L;if(L>=.40&&L<=.50){SFX.ok();floatText(600,P1.sp.y-L*PH-40,'딱 코까지!',$('#fxP'));return 'ok'}
      if(L<.40){Panel.hint('조금 더 부어요 <em>(코까지)</em>');return false}
      tries++;SFX.no();Panel.hint('너무 많아요! 조금 덜어 냈어요. <em>다시 코까지</em> 맞춰요');await anim(600,t=>P1.set(lerp(L,.32,t)));return false});
  R.milkTries=tries;await sleep(700);closePop()}

/* ---------- 5) 스티밍: 위에서 본 우유 + 옆에서 본 피쳐 ---------- */
async function steamMilk(){
  Panel.hint('<em>왼쪽 스팀노즐</em>을 눌러 스티밍을 시작해요');zone(458,420,46,110);Guide.tap({x:462,y:440});
  await tap($('#wandL'));zone();Guide.stop();SFX.pick();
  openPop('우유 스티밍 · 왼쪽 노즐',`<rect width="1000" height="600" fill="#fbeedd"/>
    <rect x="20" y="70" width="440" height="510" rx="18" fill="#f3e2cb"/><text x="240" y="560" text-anchor="middle" font-size="26" fill="#8a5a44">위에서 본 우유</text>
    <rect x="480" y="70" width="500" height="510" rx="18" fill="#e4efe6"/><text x="735" y="112" text-anchor="middle" font-size="26" fill="#5a7a62">옆에서 본 피쳐</text>
    <rect x="480" y="520" width="500" height="60" fill="#f6f3ee"/>`);
  const it=$('#prepItems');
  /* 왼쪽: 위에서 */
  const top=pmk('g',{class:'np'});top.innerHTML=`<circle cx="240" cy="345" r="170" fill="url(#gChromeH)" class="o"/><circle cx="240" cy="345" r="152" fill="#fffdf6" class="o3"/>
    <circle class="tfoam" cx="240" cy="345" r="152" fill="#f3e4c6" opacity="0"/>
    <g class="tbub" opacity="0" fill="none" stroke="#d9c7a3" stroke-width="3"><circle cx="190" cy="300" r="10"/><circle cx="250" cy="280" r="7"/><circle cx="300" cy="330" r="9"/><circle cx="210" cy="390" r="6"/><circle cx="270" cy="410" r="8"/><circle cx="170" cy="350" r="5"/><circle cx="320" cy="390" r="6"/></g>
    <g class="twhirl" opacity="0"><path d="M240 345m-110 0a110 110 0 1 1 40 85M240 345m-70 0a70 70 0 1 1 25 54M240 345m-32 0a32 32 0 1 1 12 25" fill="none" stroke="#e7d6b8" stroke-width="7" stroke-linecap="round"/></g>
    <path d="M410 190L296 318" stroke="#4a2c22" stroke-width="18" stroke-linecap="round"/><path d="M410 190L296 318" stroke="#c7d2d8" stroke-width="9" stroke-linecap="round"/>
    <circle class="ttip" cx="292" cy="322" r="11" fill="#5d6a73" class="o3"/><circle class="trip" cx="292" cy="322" r="20" fill="none" stroke="#c9b48a" stroke-width="4" opacity="0"/>`;
  const tfoam=$('.tfoam',top),tbub=$('.tbub',top),tw=$('.twhirl',top),ttip=$('.ttip',top),trip=$('.trip',top);
  /* 오른쪽: 옆에서 */
  const TIP={x:700,y:300};
  const wand=pmk('g',{class:'np'});wand.innerHTML=`<rect x="760" y="120" width="60" height="36" rx="10" fill="url(#gChrome)" class="o4"/>
    <path d="M780 156C770 200 720 240 ${TIP.x} ${TIP.y}" fill="none" stroke="#4a2c22" stroke-width="20" stroke-linecap="round"/><path d="M780 156C770 200 720 240 ${TIP.x} ${TIP.y}" fill="none" stroke="#c7d2d8" stroke-width="11" stroke-linecap="round"/>
    <circle cx="${TIP.x}" cy="${TIP.y}" r="8" fill="#8a949c" class="o3"/>`;
  const knobG=pmk('g',{class:'hit'});knobG.innerHTML=`<g class="kn"><circle cx="880" cy="160" r="40" fill="#ff8a73" class="o4"/><path d="M880 132V160" stroke="#fff" stroke-width="8" stroke-linecap="round"/></g><text x="880" y="232" text-anchor="middle" font-size="22" fill="#8a5a44">스팀 밸브</text>`;
  const kn=$('.kn',knobG);const knob=on=>anim(220,t=>kn.setAttribute('transform',`rotate(${(on?90*t:90*(1-t)).toFixed(1)} 880 160)`),E.out);
  const resid=pmk('g',{class:'np',style:'display:none'});resid.innerHTML=`<circle cx="${TIP.x-6}" cy="${TIP.y-14}" r="7" fill="#fff" class="o3"/><circle cx="${TIP.x+8}" cy="${TIP.y-2}" r="6" fill="#fff" class="o3"/>`;
  const PT=makePitcher('st',840,560);window.__pt=PT;PT.sp.set({sx:.9,sy:.9});PT.set(NOSE,0);
  const cloth=pmk('g',{class:'hit'});cloth.innerHTML=`<path d="M-50 -18Q0 -27 50 -18L52 16Q0 25 -52 16Z" fill="#9fd6e8" class="o4"/><path d="M-48 -6Q0 -15 48 -6M-50 5Q0 -4 50 5" stroke="#6fb4cc" stroke-width="5" fill="none"/><text x="0" y="48" text-anchor="middle" font-size="18" fill="#5a7a62">젖은 행주</text>`;
  const CLs=new Sp(cloth,560,470);
  const fx=$('#fxP');
  const puffP=(n=6)=>{for(let i=0;i<n;i++){const c=pmk('circle',{cx:TIP.x,cy:TIP.y,r:6,fill:'#fff',stroke:'#cdd7dc','stroke-width':2},fx),dx=rnd(-40,40),dy=rnd(-30,30);
    anim(700,t=>{c.setAttribute('cx',TIP.x+dx*t);c.setAttribute('cy',TIP.y+30+dy*t);c.setAttribute('r',6+14*t);c.setAttribute('opacity',1-t)},E.out).then(()=>c.remove())}};
  const purge=async()=>{Guide.tap({x:880,y:160});await tap(knobG);Guide.stop();await knob(true);SFX.steam(.45);puffP(8);floatText(TIP.x-30,TIP.y-50,'칙!',fx);await sleep(450);await knob(false)};
  const wipeTip=()=>new Promise(res=>{let g=null,acc=0,done=false;const home={x:CLs.x,y:CLs.y};Guide.drag({x:CLs.x,y:CLs.y},{x:TIP.x,y:TIP.y});
    const dn=e=>{if(done)return;e.preventDefault();try{cloth.setPointerCapture(e.pointerId)}catch(_){}const p=spt(e,svgP);g={dx:p.x-CLs.x,dy:p.y-CLs.y,lx:p.x,ly:p.y};Guide.pause();SFX.pick()};
    const mv=e=>{if(!g||done)return;const p=spt(e,svgP),d=Math.hypot(p.x-g.lx,p.y-g.ly);g.lx=p.x;g.ly=p.y;CLs.set({x:p.x-g.dx,y:p.y-g.dy});
      if(Math.hypot(CLs.x-TIP.x,CLs.y-TIP.y)<70){acc+=d;resid.style.opacity=1-clamp(acc/220,0,1);if(acc>220){done=true;off();fin()}}};
    const up=()=>{if(!g||done)return;g=null;CLs.to({...home,r:0},380,E.back).then(()=>{if(!done)Guide.resume()})};
    const off=()=>{cloth.removeEventListener('pointerdown',dn);cloth.removeEventListener('pointermove',mv);cloth.removeEventListener('pointerup',up);cloth.removeEventListener('pointercancel',up)};
    async function fin(){Guide.stop();resid.style.display='none';resid.style.opacity=1;SFX.ok();floatText(TIP.x,TIP.y-60,'반짝!',fx);await CLs.to({...home,r:0},400,E.io);res()}
    cloth.addEventListener('pointerdown',dn);cloth.addEventListener('pointermove',mv);cloth.addEventListener('pointerup',up);cloth.addEventListener('pointercancel',up)});
  const surfY=()=>PT.sp.y-PT.L*PH*.9,depth=()=>TIP.y-surfY();
  const pyFor=d=>TIP.y-d+PT.L*PH*.9;
  const syncTop=(mode)=>{tfoam.setAttribute('opacity',clamp(PT.foam,0,1)*.85);tbub.setAttribute('opacity',mode==='mix'?0:clamp(PT.foam*1.3,0,1));
    const d=depth();ttip.setAttribute('opacity',d<40?1:.35);trip.setAttribute('opacity',mode==='air'?.9:0)};
  /* 1) 노즐 '칙' 빼기, 닦기 */
  Panel.hint('스팀 밸브를 눌러 노즐 물기를 <em>\'칙\'</em> 빼요');resid.style.display='';await purge();
  Panel.hint('<em>젖은 행주</em>로 노즐을 닦아요');await wipeTip();
  /* 2) 피쳐를 노즐에 대기 */
  Panel.hint('<em>피쳐</em>를 노즐 아래로 가져가 노즐이 살짝 잠기게 해요');
  const z={x:TIP.x-10,y:pyFor(6)*1,r:110};const zg=pmk('ellipse',{class:'ghost',cx:TIP.x,cy:TIP.y+20,rx:90,ry:60},$('#prepGhost'));
  Guide.drag({x:PT.sp.x,y:PT.sp.y-120},{x:TIP.x,y:TIP.y+60});
  await drag(PT.sp,PT.g,{svg:svgP,zones:[{x:TIP.x,y:TIP.y,r:120}],bounds:[500,120,980,600],anchor:()=>({x:PT.sp.x,y:PT.sp.y-PT.L*PH*.9})});
  zg.remove();await PT.sp.to({x:TIP.x+10,y:pyFor(6),r:0,sx:.9,sy:.9},260,E.out);SFX.snap();syncTop('wait');
  /* 3) 스팀 켜기 → 공기 주입 3번 */
  Panel.hint('스팀 밸브를 눌러 <em>스팀</em>을 켜요');Guide.tap({x:880,y:160});await tap(knobG);Guide.stop();await knob(true);
  let snd=SFX.steam(60),lowers=0,running=true;R.air=0;
  const steamFx=setInterval(()=>{if(running&&Math.random()<.7){const c=pmk('circle',{cx:TIP.x+rnd(-20,20),cy:surfY()-4,r:4,fill:'#fff',opacity:.8},fx);anim(600,t=>{c.setAttribute('cy',surfY()-4-30*t);c.setAttribute('opacity',.8*(1-t))}).then(()=>c.remove())}},120);
  const stage=k=>Panel.hint('치익~ 거품이 올라와요 <em>('+k+'/3)</em>');
  for(let k=1;k<=3;k++){
    stage(k-1);const goal=NOSE+(.70-NOSE)*k/3;
    await new Promise(res=>{const f=now=>{const d=depth();if(d>0&&d<26&&PT.L<goal){PT.set(Math.min(goal,PT.L+.05/60),clamp((PT.L-NOSE)/(.70-NOSE),0,1));syncTop('air');requestAnimationFrame(f)}else res()};requestAnimationFrame(f)});
    syncTop('wait');
    {
      Panel.hint('거품이 올라왔어요! <em>피쳐를 살짝 내려요</em> ('+k+'/3)');SFX.tick();Guide.drag({x:PT.sp.x+60,y:PT.sp.y-60},{x:PT.sp.x+60,y:PT.sp.y-20});
      await new Promise(res=>{let g=null,done=false;const el=PT.g;
        const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}g={py:spt(e,svgP).y,y0:PT.sp.y};Guide.pause()};
        const mv=e=>{if(!g||done)return;const y=clamp(g.y0+(spt(e,svgP).y-g.py),g.y0-10,g.y0+60);PT.sp.set({y});if(depth()<=8){done=true;off();PT.sp.to({y:pyFor(6)},120,E.out);lowers++;SFX.pick();res()}};
        const up=()=>{if(!g||done)return;g=null;Guide.resume()};
        const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
        el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)});
      Guide.stop()}
  }
  R.air=lowers;SFX.ok();floatText(TIP.x,TIP.y-110,'공기 주입 끝!',fx);
  /* 4) 혼합: 피쳐를 올려 노즐을 깊이 잠그고 90%까지 */
  Panel.hint('이제 <em>피쳐를 위로 올려</em> 노즐을 깊이 잠가요');Guide.drag({x:PT.sp.x+60,y:PT.sp.y-40},{x:PT.sp.x+60,y:PT.sp.y-110});
  await new Promise(res=>{let g=null,done=false;const el=PT.g;
    const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}g={py:spt(e,svgP).y,y0:PT.sp.y};Guide.pause()};
    const mv=e=>{if(!g||done)return;const y=clamp(g.y0+(spt(e,svgP).y-g.py),g.y0-110,g.y0+10);PT.sp.set({y});if(depth()>=70){done=true;off();SFX.pick();res()}};
    const up=()=>{if(!g||done)return;g=null;Guide.resume()};
    const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
    el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)});
  Guide.stop();Panel.hint('우유가 빙글빙글 섞여요. <em>90%</em>가 되면 스팀을 꺼요');
  const mark90=pmk('g',{class:'np'},$('#prepGhost'));mark90.innerHTML=`<path d="M${PT.sp.x-80} ${PT.sp.y-.9*PH*.9}H${PT.sp.x+80}" stroke="#2f9e5b" stroke-width="4" stroke-dasharray="8 6"/><text x="${PT.sp.x+86}" y="${PT.sp.y-.9*PH*.9+8}" font-size="22" fill="#2f9e5b">90%</text>`;
  let off90=false,late=false,rot=0;
  const offP=tap(knobG).then(()=>{off90=true});
  await new Promise(res=>{let warned=false;const f=now=>{if(off90)return res();rot+=6;tw.setAttribute('opacity',.9);tw.setAttribute('transform',`rotate(${rot} 240 345)`);
    PT.set(Math.min(1,PT.L+.06/60),Math.max(.25,PT.foam-.006));syncTop('mix');
    if(PT.L>=.9&&!warned){warned=true;SFX.tick();Panel.hint('<em>90%</em>예요! 스팀 밸브를 눌러 <em>꺼요</em>');Guide.delay=0;Guide.tap({x:880,y:160});Guide.delay=600}
    if(PT.L>=.98&&!late){late=true;Panel.hint('넘치기 전에 <em>얼른 꺼요!</em>')}
    requestAnimationFrame(f)};requestAnimationFrame(f)});
  Guide.stop();running=false;clearInterval(steamFx);snd.stop();await knob(false);tw.setAttribute('opacity',0);mark90.remove();
  R.mixL=PT.L;R.mixLate=PT.L>.95;R.mixEarly=PT.L<.86;SFX.ok();
  /* 5) 정리: 피쳐 빼고, 노즐 닦고, '칙' */
  await PT.sp.to({x:880,y:560},420,E.io);resid.style.display='';
  Panel.hint('<em>젖은 행주</em>로 노즐을 깨끗이 닦아요');await wipeTip();
  Panel.hint('스팀 밸브를 눌러 우유를 <em>\'칙\'</em> 빼요');await purge();
  R.steamClean=true;Steam.L=PT.L;Steam.foam=PT.foam;await toast('스티밍 끝!');closePop()}
const Steam={L:.9,foam:.3};

/* ---------- 6) 우유 분배: 보조 피쳐에 반씩 ---------- */
async function divideMilk(){
  openPop('우유 나누기',`<rect width="1000" height="600" fill="#eaf3ea"/><rect y="500" width="1000" height="100" fill="#f6f3ee"/><path d="M0 500H1000" class="o3 nf"/>
    <text x="760" y="150" text-anchor="middle" font-size="24" fill="#5a7a62">보조 피쳐</text><text x="300" y="150" text-anchor="middle" font-size="24" fill="#5a7a62">스팀 피쳐</text>`);
  const A=makePitcher('dA',300,520,null,true),B=makePitcher('dB',740,520);A.marks(false);B.marks(false);A.set(Steam.L,Steam.foam);B.set(0,0);
  const meter=pmk('g',{class:'np'});const cnt=pmk('text',{x:500,y:110,'text-anchor':'middle','font-size':30,fill:'#4a2c22'});
  const st=pmk('path',{fill:'none',stroke:'#fffdf6','stroke-width':11,'stroke-linecap':'round',class:'np'});
  let pours=0,resets=0,poured=0;const show=()=>{cnt.textContent='따른 횟수 '+pours+'번';};show();
  Panel.hint('스팀 피쳐를 <em>꾹 누르고</em> 조금씩, <em>3~4번</em> 나눠서 반씩 맞춰요');Guide.hold({x:300,y:400});
  let snd=null;
  await holdLoop(A.g,()=>{SFX.pick();poured=0;A.sp.to({x:420,y:420,r:48},260,E.out);snd=SFX.pour()},
    dt=>{if(Math.abs(A.sp.r-48)<3){const m=Math.min(.12*dt,.16-poured,A.L-.02);if(m<=0){return 'stop'}poured+=m;A.set(A.L-m,A.foam);B.set(B.L+m,Math.min(.4,B.foam+m));
        const a=A.sp.r*Math.PI/180,lx=104,ly=-246,sx=A.sp.x+lx*Math.cos(a)-ly*Math.sin(a),sy=A.sp.y+lx*Math.sin(a)+ly*Math.cos(a);st.setAttribute('d',`M${sx.toFixed(1)} ${sy.toFixed(1)}Q${(sx+30).toFixed(1)} ${(sy+10).toFixed(1)} ${(sx+40).toFixed(1)} ${(520-B.L*PH).toFixed(1)}`)}},
    async()=>{snd&&snd.stop();st.setAttribute('d','');await A.sp.to({x:300,y:520,r:0},260,E.io);if(poured>.005){pours++;show()}
      if(poured>=.155)floatText(560,300,'조금씩!',$('#fxP'));
      const diff=A.L-B.L;
      if(Math.abs(diff)<=.05){SFX.ok();floatText(520,240,'반반 딱!',$('#fxP'));return 'ok'}
      if(diff<-.05){resets++;SFX.no();Panel.hint('보조 피쳐가 더 많아졌어요. <em>다시 나눠요</em>');await anim(700,t=>{const tot=Steam.L;A.set(lerp(A.L,tot,t),A.foam);B.set(lerp(B.L,0,t),B.foam)});pours=0;show();return false}
      Panel.hint('조금 더 따라요 <em>('+pours+'번)</em> · 두 피쳐가 같아지면 끝');return false});
  R.pours=pours;R.divReset=resets;Steam.A=A.L;Steam.B=B.L;await sleep(800);closePop()}

/* ---------- 7) 붓기: 위에서 보며 (잔마다) ---------- */
async function latteArt(k){
  openPop('카푸치노 붓기 '+(k+1)+'/2',`<rect width="1000" height="600" fill="#f3e2cb"/>
    <rect x="700" y="100" width="20" height="380" rx="10" fill="#fff" class="o3"/><text x="760" y="140" font-size="22" fill="#8a5a44">높이</text><text x="760" y="166" font-size="20" fill="#8a5a44">(15cm)</text>
    <text x="760" y="472" font-size="22" fill="#8a5a44">가까이</text>`);
  const cupG=pmk('g',{class:'hit'});cupG.innerHTML=`<g class="tilt"><circle cx="0" cy="8" r="160" fill="#4a2c22" opacity=".14"/><path d="M-150 -26H-226Q-248 -26 -248 0Q-248 26 -226 26H-150Z" fill="#fff" class="o"/>
    <circle r="158" fill="#fff" class="o"/><circle r="134" fill="#7a4a28" class="o3"/><circle class="crem" r="126" fill="#b47a43"/><circle class="crem2" r="126" fill="none" stroke="#9a6233" stroke-width="5" stroke-dasharray="10 9" opacity=".7"/>
    <circle class="ring" r="96" fill="none" stroke="#2f9e5b" stroke-width="4" stroke-dasharray="10 8" opacity="0"/><circle class="ring" r="70" fill="none" stroke="#2f9e5b" stroke-width="4" stroke-dasharray="10 8" opacity="0"/>
    <circle class="art" r="0" fill="#fffaf0"/><circle class="art2" r="0" fill="#fff"/></g><text class="deg" x="0" y="-180" text-anchor="middle" font-size="30" fill="#e2634d" opacity="0">45°</text>`;
  const C=new Sp(cupG,340,320),tilt=$('.tilt',cupG),art=$('.art',cupG),art2=$('.art2',cupG),crem=$('.crem',cupG),deg=$('.deg',cupG),rings=[...cupG.querySelectorAll('.ring')];
  const pit=pmk('g',{class:'hit'});pit.innerHTML=`<g transform="scale(.42) rotate(-30)">${pitcherSide('la'+k)}</g>`;const PI=new Sp(pit,710,160);
  const pm=pit.querySelector('.pm'),pf=pit.querySelector('.pf');const L0=k?Steam.B:Steam.A;let PL=L0;
  const setPL=L=>{PL=L;pm.setAttribute('y',-L*PH);pm.setAttribute('height',L*PH);pf.setAttribute('y',-L*PH);pf.setAttribute('height',Math.min(L*PH,30))};setPL(PL);pit.querySelector('.nose').style.display='none';pit.querySelector('.noset').style.display='none';
  const st=pmk('path',{fill:'none',stroke:'#fffdf6','stroke-linecap':'round',class:'np'});
  const fx=$('#fxP');
  /* 1) 잔 기울이기 */
  Panel.hint('<em>잔을 톡</em> 눌러서 45° 기울여요');Guide.tap({x:340,y:320});await tap(cupG);Guide.stop();SFX.pick();
  let tiltK=0;const setTilt=k2=>{tiltK=k2;tilt.setAttribute('transform',`scale(1 ${(1-.32*k2).toFixed(3)})`);deg.setAttribute('opacity',k2>.5?1:0)};
  await anim(400,t=>setTilt(t),E.out);
  /* 2) 높이서 부어 크레마 안정 */
  Panel.hint('<em>높이(15cm)</em>에서 피쳐를 <em>꾹 누르고</em> 부어요');Guide.hold({x:PI.x,y:PI.y});
  let prog=0;const ringP=pmk('circle',{cx:PI.x,cy:PI.y,r:56,fill:'none',stroke:'#ff8a73','stroke-width':8,'stroke-dasharray':351.9,'stroke-dashoffset':351.9,transform:`rotate(-90 ${PI.x} ${PI.y})`,class:'np'});
  let snd=null;
  await holdLoop(pit,()=>{snd=SFX.pour();PI.to({r:-25},200)},
    dt=>{prog=Math.min(1,prog+dt/1.8);ringP.setAttribute('stroke-dashoffset',(351.9*(1-prog)).toFixed(1));setPL(PL-.03*dt);
      st.setAttribute('stroke-width',4);st.setAttribute('d',`M${PI.x-50} ${PI.y+30}Q${PI.x-150} ${PI.y+60} 340 ${320+(1-.32*tiltK)*0}`);crem.setAttribute('fill',mix('#b47a43','#c99566',prog));if(prog>=1)return 'stop'},
    async()=>{snd&&snd.stop();st.setAttribute('d','');await PI.to({r:0},200);if(prog>=1){ringP.remove();SFX.ok();floatText(340,140,'크레마 안정!',fx);return 'ok'}Panel.hint('조금 더 <em>꾹 누르고</em> 부어요');return false});
  /* 3) 가까이 */
  Panel.hint('피쳐를 <em>아래로 내려</em> 잔 가까이 대요');const zg=pmk('ellipse',{class:'ghost',cx:710,cy:440,rx:70,ry:50},$('#prepGhost'));Guide.drag({x:PI.x,y:PI.y},{x:710,y:440});
  await drag(PI,pit,{svg:svgP,zones:[{x:710,y:440,r:80}],bounds:[560,120,980,560]});zg.remove();await PI.to({x:640,y:390,r:-20,sx:1.15,sy:1.15},260,E.out);
  /* 4) 하얀 원 */
  rings.forEach(r=>r.setAttribute('opacity',.9));
  Panel.hint('<em>꾹 누르고</em> 부어서 초록 점선 사이까지 <em>하얀 원</em>을 키워요');Guide.hold({x:PI.x,y:PI.y});
  let r=0,res='small';
  await holdLoop(pit,()=>{snd=SFX.pour()},
    dt=>{r=Math.min(118,r+38*dt);art.setAttribute('r',r.toFixed(1));art2.setAttribute('r',(r*.55).toFixed(1));setPL(PL-.05*dt);setTilt(clamp(1-r/100,0,1));
      st.setAttribute('stroke-width',9);st.setAttribute('d',`M${PI.x-40} ${PI.y+20}Q${PI.x-120} ${PI.y+30} 345 322`);if(r>=118)return 'stop'},
    async()=>{snd&&snd.stop();st.setAttribute('d','');
      if(r<70){Panel.hint('원이 아직 작아요. <em>조금 더</em> 부어요');return false}
      res=r<=96?'good':'big';rings.forEach(x=>x.setAttribute('opacity',0));setTilt(0);
      if(res==='good'){SFX.great();sparkle(340,320,8,fx);floatText(340,120,'예쁜 원!',fx)}else{SFX.no();floatText(340,120,'원이 조금 커요',fx)}return 'ok'});
  (R.art=R.art||[])[k]=res;Cup.at[k].addMilk(112);await sleep(1100);closePop()}

/* ---------- 피쳐 2개 나란히 정리 ---------- */
async function tidyPitchers(){
  openPop('피쳐 정리',`<rect width="1000" height="600" fill="#eaf3ea"/><rect y="470" width="1000" height="130" fill="#f6f3ee"/><path d="M0 470H1000" class="o3 nf"/>`);
  const spots=[{x:430,y:520},{x:600,y:520}];
  $('#prepGhost').innerHTML=spots.map((s,i)=>`<ellipse id="tg${i}" class="ghost" cx="${s.x}" cy="${s.y-60}" rx="80" ry="90"/>`).join('');
  const ps=[makePitcher('tA',170,560),makePitcher('tB',830,540)];ps.forEach(p=>{p.marks(false);p.set(.08,.1);p.sp.set({sx:.75,sy:.75,r:p===ps[0]?-12:10})});
  Panel.hint('다 쓴 <em>피쳐 2개</em>를 나란히 정리해요');Guide.drag({x:170,y:480},{x:430,y:460});
  const zones=spots.map(s=>({x:s.x,y:s.y,r:100,used:false}));
  await Promise.all(ps.map(async p=>{const i=await drag(p.sp,p.g,{svg:svgP,zones,bounds:[60,120,960,580]});zones[i].used=true;$('#tg'+i).classList.add('done');
    await p.sp.to({x:spots[i].x,y:spots[i].y,r:0,sx:.75,sy:.75},200,E.out);SFX.clink();const o=ps.find(x=>x!==p);if(zones.some(z=>!z.used))Guide.drag({x:o.sp.x,y:o.sp.y-60},{x:spots[1-i].x,y:spots[1-i].y-60})}));
  SFX.ok();await toast('정리 끝!');closePop()}

/* ---------- 진행 ---------- */
async function cappuccino(){
  M=MODES.cap;STEPS=['메뉴 설명','서빙 준비','우유 따르기','추출','스티밍','나누기·붓기','서빙'];LINES_TOTAL=4;$('#rtitle').textContent='카푸치노 결과';
  R={lines:[],prep:0,tries:0,first:null,sec:null,judge:null,cupT:null,brushT:null,brushLate:false,t:0,art:[]};lineNo=0;
  resetBar();scene('judge');Guide.use('#handJ');JUDGES.forEach((j,i)=>{jface(i,'idle');$('#J'+i+' .check').style.opacity=0});
  step(1);await sleep(500);await judgeSay(1,'두 번째 메뉴를 시작해 주세요.');Bubble.hide();
  R.lines.push(await sayLine('두 번째로 추출해 드릴 커피는 우유 거품이 많은 카푸치노 두 잔을 준비해 드리겠습니다. 잠시만 기다려주십시오.',lineTag()));nod(0);
  step(2);Panel.hide();await trayPrep();
  step(3);scene('bar');Guide.use('#hand');await sleep(900);await milkPour();
  step(4);await grindTamp();await brew();
  step(5);await steamMilk();
  step(6);await divideMilk();await latteArt(0);await latteArt(1);await tidyPitchers();
  step(7);await toTray();Panel.hide();await serveJudges();
  showResult();
}
function showCapResult(){
  const avg=R.lines.reduce((a,b)=>a+b,0)/R.lines.length;
  const row=(name,val,c)=>`<div><span>${name}</span><b style="background:${COL[c]}">${val}</b></div>`;
  const late=R.cupT!=null&&R.cupT>FLOW,good=R.art.filter(x=>x==='good').length;
  $('#rlist').classList.add('two');
  $('#rlist').innerHTML=
    row('대사 발음',`별 평균 ${avg.toFixed(1)}`,avg>=2.5?'g2':avg>=1.8?'g1':'yel')+
    row('서빙 준비',R.prep?`스푼 ${R.prep}번 다시`:'잘했어요',R.prep?'yel':'g2')+
    row('우유 양',R.milkTries?`코까지 (${R.milkTries}번 덜어냄)`:'코까지 딱',R.milkTries?'yel':'g2')+
    row('추출 시간',`${R.sec}초 · ${R.judge.t}`+(R.tries>1?' (다시)':''),R.tries>1?'yel':R.judge.k==='best'?'g2':R.judge.k==='good'?'g1':'yel')+
    row('잔 내리기',late?'조금 늦었어요':'제때 받쳤어요',late?'yel':'g2')+
    row('붓 청소',R.brushLate?'추출 뒤에 했어요':'추출 중에 했어요',R.brushLate?'yel':'g2')+
    row('공기 주입',`${R.air}번 내렸어요`,R.air===3?'g2':'yel')+
    row('혼합',R.mixLate?'늦게 껐어요':R.mixEarly?'일찍 껐어요':'90%에서 껐어요',R.mixLate||R.mixEarly?'yel':'g2')+
    row('우유 나누기',`${R.pours}번`+(R.divReset?' (다시)':''),R.pours>=3&&R.pours<=4&&!R.divReset?'g2':'yel')+
    row('붓기',good===2?'원 2개 모두 예뻐요':`예쁜 원 ${good}개`,good===2?'g2':'yel')+
    row('노즐 청소','했어요','g2')+row('서빙','잘했어요','g2');
  $('#result').classList.remove('off');SFX.great();
}
window.__game.cap=()=>({Steam})
