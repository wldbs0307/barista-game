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
  const purge=async()=>{Guide.tap({x:880,y:160});T.set('tap',{x:880,y:160},null,{svg:'prepSvg'});await tap(knobG);Guide.stop();T.clear();await knob(true);SFX.steam(.45);puffP(5);floatText(TIP.x-30,TIP.y-50,'칙!',fx);
    await anim(450,p=>CLs.set({sx:1+Math.sin(p*28)*.05,sy:1+Math.sin(p*28+1)*.06}));CLs.set({sx:1,sy:1});await knob(false)};
  const CL_HOME={x:560,y:470};window.__cls=CLs;
  /* 젖은행주로 노즐 끝을 가리기 */
  const coverTip=async hint=>{Panel.hint(hint);const zg=pmk('ellipse',{class:'ghost',cx:TIP.x,cy:TIP.y,rx:60,ry:42},$('#prepGhost'));Guide.drag({x:CLs.x,y:CLs.y},{x:TIP.x,y:TIP.y});T.set('drag',{x:CLs.x,y:CLs.y},{x:TIP.x,y:TIP.y},{svg:'prepSvg'});
    await drag(CLs,cloth,{svg:svgP,zones:[{x:TIP.x,y:TIP.y,r:80}],bounds:[480,90,980,580]});zg.remove();T.clear();await CLs.to({x:TIP.x,y:TIP.y+6,r:-14},160,E.out);SFX.pick()};
  const wipeTip=back=>new Promise(res=>{let g=null,acc=0,done=false;const home=CL_HOME;Guide.drag({x:CLs.x,y:CLs.y},{x:TIP.x+30,y:TIP.y});T.set('wipe',{x:CLs.x,y:CLs.y},{x:TIP.x,y:TIP.y},{svg:'prepSvg'});
    const dn=e=>{if(done)return;e.preventDefault();try{cloth.setPointerCapture(e.pointerId)}catch(_){}const p=spt(e,svgP);g={dx:p.x-CLs.x,dy:p.y-CLs.y,lx:p.x,ly:p.y};Guide.pause();SFX.pick()};
    const mv=e=>{if(!g||done)return;const p=spt(e,svgP),d=Math.hypot(p.x-g.lx,p.y-g.ly);g.lx=p.x;g.ly=p.y;CLs.set({x:p.x-g.dx,y:p.y-g.dy});
      if(Math.hypot(CLs.x-TIP.x,CLs.y-TIP.y)<70){acc+=d;resid.style.opacity=1-clamp(acc/220,0,1);if(acc>220){done=true;off();fin()}}};
    const up=()=>{if(!g||done)return;g=null;Guide.resume()};
    const off=()=>{cloth.removeEventListener('pointerdown',dn);cloth.removeEventListener('pointermove',mv);cloth.removeEventListener('pointerup',up);cloth.removeEventListener('pointercancel',up)};
    async function fin(){Guide.stop();T.clear();resid.style.display='none';resid.style.opacity=1;SFX.ok();floatText(TIP.x,TIP.y-60,'반짝!',fx);if(back)await CLs.to({...home,r:0},400,E.io);else await CLs.to({x:TIP.x,y:TIP.y+6,r:-14},200,E.out);res()}
    cloth.addEventListener('pointerdown',dn);cloth.addEventListener('pointermove',mv);cloth.addEventListener('pointerup',up);cloth.addEventListener('pointercancel',up)});
  const surfY=()=>PT.sp.y-PT.L*PH*.9,depth=()=>TIP.y-surfY();
  const pyFor=d=>TIP.y-d+PT.L*PH*.9;
  const syncTop=(mode)=>{tfoam.setAttribute('opacity',clamp(PT.foam,0,1)*.85);tbub.setAttribute('opacity',mode==='mix'?0:clamp(PT.foam*1.3,0,1));
    const d=depth();ttip.setAttribute('opacity',d<40?1:.35);trip.setAttribute('opacity',mode==='air'?.9:0)};
  /* 1) 노즐 '칙' 빼기, 닦기 */
  resid.style.display='';
  await coverTip('<em>젖은행주1</em>로 <em>노즐 끝</em>을 가려요');
  Panel.hint('행주로 가린 채 <em>스팀 밸브</em>를 눌러 노즐 물기를 <em>\'칙\'</em> 빼요');await purge();resid.style.display='none';await CLs.to({...CL_HOME,r:0},400,E.io);
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
  /* 행주를 노즐로 가져가 바로 문질러 닦는다 (멈추지 않고) */
  Panel.hint('<em>젖은행주1</em>을 노즐로 가져가 <em>바로 문질러</em> 닦아요<small>노즐 끝을 왔다 갔다 문질러요</small>');await wipeTip(false);
  Panel.hint('행주로 가린 채 <em>스팀 밸브</em>를 눌러 우유를 <em>\'칙\'</em> 빼요');await purge();await CLs.to({...CL_HOME,r:0},400,E.io);
  R.steamClean=true;Steam.L=PT.L;Steam.foam=PT.foam;await toast('스티밍 끝!');closePop()}
const Steam={L:.9,foam:.3};

/* ---------- 6) 우유 분배: 보조 피쳐에 반씩 ---------- */
async function divideMilk(){
  openPop('우유 나누기',`<rect width="1000" height="600" fill="#eaf3ea"/><rect y="500" width="1000" height="100" fill="#f6f3ee"/><path d="M0 500H1000" class="o3 nf"/>
    <text x="760" y="150" text-anchor="middle" font-size="24" fill="#5a7a62">보조 피쳐</text><text x="300" y="150" text-anchor="middle" font-size="24" fill="#5a7a62">스팀 피쳐</text>`);
  const A=makePitcher('dA',300,520,null,true),B=makePitcher('dB',740,520);A.marks(false);B.marks(false);A.set(Steam.L,Steam.foam);B.set(0,0);window.__dv={A,B};
  const meter=pmk('g',{class:'np'});
  const st=pmk('path',{fill:'none',stroke:'#fffdf6','stroke-width':11,'stroke-linecap':'round',class:'np'});
  let pours=0,resets=0,poured=0;const show=()=>{};
  /* 1·2) 모두 옮겨 섞기: 왼쪽 → 오른쪽 전부, 오른쪽 → 왼쪽 전부 */
  const pourAll=(F,G,pose,home,hint,spoutX)=>{Panel.hint(hint);Guide.hold({x:F.sp.x,y:F.sp.y-120});T.set('hold',{x:F.sp.x,y:F.sp.y-120},null,{svg:'prepSvg',ms:4200});let s2=null;
    return holdLoop(F.g,()=>{SFX.pick();F.sp.to(pose,260,E.out);s2=SFX.pour()},
      dt=>{if(Math.abs(F.sp.r-pose.r)>3)return;const m=Math.min(.32*dt,F.L);F.set(F.L-m,F.foam);G.set(G.L+m,Math.min(.45,G.foam+m));
        const a=F.sp.r*Math.PI/180,lx=spoutX,ly=-246,sx=F.sp.x+lx*Math.cos(a)-ly*Math.sin(a),sy=F.sp.y+lx*Math.sin(a)+ly*Math.cos(a),tx=G.sp.x;
        st.setAttribute('d',`M${sx.toFixed(1)} ${sy.toFixed(1)}Q${((sx+tx)/2).toFixed(1)} ${(sy+10).toFixed(1)} ${tx.toFixed(1)} ${(520-G.L*PH).toFixed(1)}`);if(F.L<=.005)return 'stop'},
      async()=>{s2&&s2.stop();st.setAttribute('d','');await F.sp.to({...home,r:0},260,E.io);
        if(F.L>.01){Panel.hint(hint+'<small>아직 남았어요. 다 옮겨요</small>');return false}F.set(0,0);SFX.ok();floatText(520,240,'다 옮겼어요!',$('#fxP'));return 'ok'})};
  await pourAll(A,B,{x:440,y:290,r:52},{x:300,y:520},'① 스팀 피쳐(왼쪽)의 우유를 <em>보조 피쳐(오른쪽)</em>로 <em>모두</em> 옮겨요<small>피쳐를 꾹 누르고 있어요</small>',104);T.clear();
  await pourAll(B,A,{x:600,y:290,r:-52},{x:740,y:520},'② 보조 피쳐(오른쪽)의 우유를 <em>스팀 피쳐(왼쪽)</em>로 <em>모두</em> 다시 옮겨요<small>피쳐를 꾹 누르고 있어요</small>',-104);T.clear();
  /* 3) 반반 맞추기 */
  Panel.hint('③ 이제 스팀 피쳐를 <em>꾹 누르고</em> 조금씩 따라 <em>반반</em> 맞춰요<small>3~4번 나눠서</small>');Guide.hold({x:300,y:400});
  let snd=null;
  await holdLoop(A.g,()=>{SFX.pick();poured=0;A.sp.to({x:440,y:290,r:52},260,E.out);snd=SFX.pour()},
    dt=>{if(Math.abs(A.sp.r-52)<3){const m=Math.min(.12*dt,.16-poured,A.L-.02);if(m<=0){return 'stop'}poured+=m;A.set(A.L-m,A.foam);B.set(B.L+m,Math.min(.4,B.foam+m));
        const a=A.sp.r*Math.PI/180,lx=104,ly=-246,sx=A.sp.x+lx*Math.cos(a)-ly*Math.sin(a),sy=A.sp.y+lx*Math.sin(a)+ly*Math.cos(a);st.setAttribute('d',`M${sx.toFixed(1)} ${sy.toFixed(1)}Q${(sx+30).toFixed(1)} ${(sy+10).toFixed(1)} ${(sx+40).toFixed(1)} ${(520-B.L*PH).toFixed(1)}`)}},
    async()=>{snd&&snd.stop();st.setAttribute('d','');await A.sp.to({x:300,y:520,r:0},260,E.io);if(poured>.005){pours++;show()}
      if(poured>=.155)floatText(560,300,'조금씩!',$('#fxP'));
      const diff=A.L-B.L;
      if(Math.abs(diff)<=.05){SFX.ok();floatText(520,240,'반반 딱!',$('#fxP'));return 'ok'}
      if(diff<-.05){resets++;SFX.no();Panel.hint('보조 피쳐가 더 많아졌어요. <em>다시 나눠요</em>');await anim(700,t=>{const tot=Steam.L;A.set(lerp(A.L,tot,t),A.foam);B.set(lerp(B.L,0,t),B.foam)});pours=0;show();return false}
      Panel.hint('조금 더 따라요<small>두 피쳐가 같아지면 끝</small>');return false});
  R.pours=pours;R.divReset=resets;Steam.A=A.L;Steam.B=B.L;await sleep(800);closePop()}

/* ---------- 7) 붓기: 위에서 보며 (잔마다) ---------- */
/* 잔 안쪽 모양 (바닥 가운데가 원점, 위가 -) */
const CUPIN=(()=>{const P=[];for(let i=0;i<=16;i++){const s=i/16;P.push([62+52*Math.pow(s,.7),-8-s*172])}
  return [...P.map(([w,y])=>[-w,y]).reverse(),...P.map(([w,y])=>[w,y])]})();
const polyArea=P=>{let a=0;for(let i=0;i<P.length;i++){const [x1,y1]=P[i],[x2,y2]=P[(i+1)%P.length];a+=x1*y2-x2*y1}return Math.abs(a)/2};
const clipBelow=(P,s)=>{const o=[];for(let i=0;i<P.length;i++){const A=P[i],B=P[(i+1)%P.length],ia=A[1]>=s,ib=B[1]>=s;
  if(ia)o.push(A);if(ia!==ib){const t=(s-A[1])/(B[1]-A[1]);o.push([A[0]+(B[0]-A[0])*t,s])}}return o};
const rotP=(P,deg,ox,oy)=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return P.map(([x,y])=>[ox+x*c-y*s,oy+x*s+y*c])};
/* 부피 V가 되는 수면 높이 */
function levelFor(W,V){let lo=Math.min(...W.map(p=>p[1])),hi=Math.max(...W.map(p=>p[1]));for(let i=0;i<32;i++){const m=(lo+hi)/2;if(polyArea(clipBelow(W,m))>V)lo=m;else hi=m}return (lo+hi)/2}
const ptsD=P=>'M'+P.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')+'Z';

/* ---------- 7) 붓기: 정면에서 (잔마다) ---------- */
async function latteArt(k){
  openPop('카푸치노 붓기 '+(k+1)+'/2',`<rect width="1000" height="600" fill="#f3e2cb"/><rect y="500" width="1000" height="100" fill="#f6f3ee"/><path d="M0 500H1000" class="o3 nf"/>
    <circle cx="110" cy="206" r="84" fill="#fff" class="o3"/><text x="110" y="314" text-anchor="middle" font-size="20" fill="#8a5a44">위에서 본 잔</text>`);
  const fx=$('#fxP');
  const O={x:330,y:500};   /* 잔 바닥 가운데 (기울이는 중심) */
  const A=polyArea(CUPIN),V0=.18*A,VFULL=polyArea(clipBelow(CUPIN,-8-.88*172)),VOVER=polyArea(clipBelow(CUPIN,-8-.985*172));
  const TILT=35;let ang=0,V=V0,foam=0;
  const VT=polyArea(clipBelow(rotP(CUPIN,TILT,O.x,O.y),rotP([[114,-180]],TILT,O.x,O.y)[0][1]));  /* 오른쪽 끝에 닿는 양 */
  /* 위에서 본 잔 */
  const top=pmk('g',{class:'np'});top.innerHTML=`<circle cx="110" cy="206" r="70" fill="#7a4a28" class="o3"/><circle class="tcrem" cx="110" cy="206" r="62" fill="#b47a43"/><circle class="tart" cx="110" cy="206" r="0" fill="#fffaf0"/><circle class="tart2" cx="110" cy="206" r="0" fill="#fff"/>`;
  const tcrem=$('.tcrem',top),tart=$('.tart',top),tart2=$('.tart2',top);
  /* 정면 잔: 뒤(몸통) - 액체 - 앞(선) */
  const back=pmk('g',{class:'np'}),liq=pmk('path',{class:'np',fill:'#7a4a28'}),fm=pmk('path',{class:'np',fill:'#fffaf0'}),
    front=pmk('g',{class:'hit'}),mark=pmk('circle',{class:'np',r:16,fill:'none',stroke:'#2f9e5b','stroke-width':4,'stroke-dasharray':'7 5',opacity:0});
  const BODY='M-124 -186C-122 -70 -100 4 -62 6H62C100 4 122 -70 124 -186';
  back.innerHTML=`<ellipse cx="0" cy="8" rx="96" ry="10" fill="#4a2c22" opacity=".14"/><path d="${BODY}Z" fill="#e8f3f6" fill-opacity=".55"/>`;
  front.innerHTML=`<path d="M-122 -150C-176 -150 -178 -60 -112 -58" fill="none" stroke="#4a2c22" stroke-width="18" stroke-linecap="round"/><path d="M-122 -150C-176 -150 -178 -60 -112 -58" fill="none" stroke="#f4fbfd" stroke-width="8" stroke-linecap="round"/>
    <path d="${BODY}" fill="none" class="o4"/><ellipse cx="0" cy="-186" rx="124" ry="15" fill="none" class="o3"/><path d="M-96 -160C-96 -90 -84 -40 -60 -16" stroke="#fff" stroke-width="9" opacity=".7" fill="none" stroke-linecap="round"/>
    <path d="M-124 -186C-122 -70 -100 4 -62 6H62C100 4 122 -70 124 -186Z" fill="#fff" fill-opacity="0"/>`;
  let surf={x:O.x,y:O.y};
  const clipAbove=(P,s)=>clipBelow(P.map(([x,y])=>[x,-y]),-s).map(([x,y])=>[x,-y]);
  const draw=()=>{const tf=`translate(${O.x} ${O.y}) rotate(${ang.toFixed(2)})`;back.setAttribute('transform',tf);front.setAttribute('transform',tf);
    const W=rotP(CUPIN,ang,O.x,O.y),s=levelFor(W,V),L=clipBelow(W,s);liq.setAttribute('d',L.length>2?ptsD(L):'');
    const mixK=clamp((V-V0)/(VFULL-V0),0,1);liq.setAttribute('fill',mix('#6e3f20','#c99566',mixK));
    const F=foam>0?clipAbove(L,s+foam):[];fm.setAttribute('d',F.length>2?ptsD(F):'');
    const ys=L.filter(p=>Math.abs(p[1]-s)<.01).map(p=>p[0]);surf={x:ys.length?(Math.min(...ys)+Math.max(...ys))/2:O.x,y:s};
    const lip=rotP([[114,-180]],ang,O.x,O.y)[0];mark.setAttribute('cx',lip[0].toFixed(1));mark.setAttribute('cy',lip[1].toFixed(1));
    tcrem.setAttribute('fill',mix('#b47a43','#c99566',mixK))};
  draw();
  /* 피쳐 */
  const pit=pmk('g',{class:'hit'});pit.innerHTML=`<g transform="scale(.5)">${pitcherSide('la'+k)}</g>`;const PI=new Sp(pit,760,500);
  const pm=pit.querySelector('.pm'),pf=pit.querySelector('.pf');let PL=k?Steam.B:Steam.A;
  const setPL=L=>{PL=Math.max(.04,L);pm.setAttribute('y',-PL*PH);pm.setAttribute('height',PL*PH);pf.setAttribute('y',-PL*PH);pf.setAttribute('height',Math.min(PL*PH,30))};setPL(PL);
  pit.querySelector('.nose').style.display='none';pit.querySelector('.noset').style.display='none';
  const spout=()=>{const a=PI.r*Math.PI/180,lx=-104*.5,ly=-246*.5;return{x:PI.x+lx*Math.cos(a)-ly*Math.sin(a),y:PI.y+lx*Math.sin(a)+ly*Math.cos(a)}};
  const st=pmk('path',{fill:'none',stroke:'#fffdf6','stroke-linecap':'round',class:'np'});
  /* 잔 가운데: 잔의 중심선이 수면과 만나는 곳 */
  const land=()=>({x:surf.x,y:surf.y});   /* 보이는 수면의 가운데 */
  const rimY=x=>{const [l,r]=rotP([[-124,-186],[124,-186]],ang,O.x,O.y);return lerp(l[1],r[1],clamp((x-l[0])/(r[0]-l[0]),0,1))};
  const SPL={x:-104*.5,y:-246*.5};
  const putSpout=(p,r)=>{const a=r*Math.PI/180;PI.set({r,x:p.x-(SPL.x*Math.cos(a)-SPL.y*Math.sin(a)),y:p.y-(SPL.x*Math.sin(a)+SPL.y*Math.cos(a))})};
  const PL0=PL;const pourR=()=>-(28+52*clamp(1-PL/PL0,0,1));   /* 우유가 줄수록 더 기울인다 */
  const stream=(w,to)=>{if(!w)return st.setAttribute('d','');const s=spout(),e=to?to():land();st.setAttribute('stroke-width',w);st.setAttribute('d',`M${s.x.toFixed(1)} ${s.y.toFixed(1)}Q${(s.x-4).toFixed(1)} ${((s.y+e.y)/2).toFixed(1)} ${e.x.toFixed(1)} ${e.y.toFixed(1)}`)};
  /* 꾹 누르면 줄기 자리를 그대로 두고 피쳐를 기울이기 시작 */
  let pouring=false;
  const tiltIn=async at=>{pouring=false;const r0=PI.r,r1=pourR();await anim(220,t2=>putSpout(at(),lerp(r0,r1,t2)),E.out);pouring=true};
  const tiltOut=async at=>{pouring=false;const r0=PI.r;await anim(220,t2=>putSpout(at(),lerp(r0,0,t2)),E.out)};
  const spill=n=>{const lip=rotP([[120,-184]],ang,O.x,O.y)[0];for(let i=0;i<n;i++)setTimeout(()=>drop(lip[0]+6,lip[1],498,'#e9d3ad',5),i*60)};
  const LA=window.__la={phase:'',ok:()=>false};
  const whirl=document.createElementNS(NS,'g');whirl.innerHTML=`<g transform="scale(.5)"><ellipse class="wh" cx="0" cy="${(-PL*PH+6).toFixed(1)}" rx="56" ry="9" fill="none" stroke="#d9c7a3" stroke-width="5" stroke-dasharray="16 12" opacity="0"/></g>`;pit.appendChild(whirl);const wh=whirl.querySelector('.wh');
  /* 1) 스월링: 피쳐를 동그랗게 3바퀴 */
  const ringG=pmk('g',{class:'np'},$('#prepGhost'));ringG.innerHTML=`<circle cx="${PI.x}" cy="${PI.y-60}" r="96" fill="none" stroke="#e2634d" stroke-width="5" stroke-dasharray="12 9"/><path d="M${PI.x+96} ${PI.y-74}l-12 22l24 0z" fill="#e2634d"/>`;
  const cnt=pmk('text',{x:PI.x,y:PI.y-190,'text-anchor':'middle','font-size':26,fill:'#4a2c22',class:'np'});cnt.textContent='0 / 3바퀴';
  Panel.hint('피쳐를 잡고 <em>동그랗게 3바퀴</em> 돌려요<small>스월링: 우유와 거품을 골고루 섞어요</small>');LA.phase='swirl';
  T.set('swirl',{x:PI.x,y:PI.y-60},null,{svg:'prepSvg',r:70});Guide.drag({x:PI.x+60,y:PI.y-60},{x:PI.x,y:PI.y-120});
  await new Promise(res=>{let g=null,acc=0,done=false;const C={x:PI.x,y:PI.y-60};const an=p=>Math.atan2(p.y-C.y,p.x-C.x);
    const dn=e=>{if(done)return;e.preventDefault();try{pit.setPointerCapture(e.pointerId)}catch(_){}g={a:an(spt(e,svgP))};Guide.pause();SFX.pick()};
    const mv=e=>{if(!g||done)return;const a=an(spt(e,svgP));let d=a-g.a;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;g.a=a;acc+=Math.abs(d);
      const turns=acc/(2*Math.PI);PI.set({x:C.x+Math.cos(a)*18,y:C.y+60+Math.sin(a)*6,r:Math.cos(a)*4});wh.setAttribute('opacity',.9);wh.setAttribute('stroke-dashoffset',(-acc*40).toFixed(1));pf.setAttribute('fill',mix('#f3e4c6','#fffaf0',clamp(turns/3,0,1)));cnt.textContent=Math.min(3,Math.floor(turns))+' / 3바퀴';
      if(turns>=3){done=true;off();res()}};
    const up=()=>{if(!g||done)return;g=null;Guide.resume()};
    const off=()=>{pit.removeEventListener('pointerdown',dn);pit.removeEventListener('pointermove',mv);pit.removeEventListener('pointerup',up);pit.removeEventListener('pointercancel',up)};
    pit.addEventListener('pointerdown',dn);pit.addEventListener('pointermove',mv);pit.addEventListener('pointerup',up);pit.addEventListener('pointercancel',up)});
  Guide.stop();T.clear();ringG.remove();cnt.remove();wh.setAttribute('opacity',0);await PI.to({x:760,y:500,r:0},200,E.out);SFX.ok();floatText(PI.x,PI.y-220,'스월링 끝!',fx);
  /* 2) 잔 기울이기 */
  Panel.hint('<em>잔을 톡</em> 눌러서 기울여요');Guide.tap({x:O.x,y:O.y-100});T.set('tap',{x:O.x,y:O.y-100},null,{svg:'prepSvg'});await tap(front);Guide.stop();T.clear();SFX.pick();
  await anim(500,t=>{ang=TILT*t;draw()},E.out);
  /* 3) 높이(10cm 이상)에서 잔 가운데에: 오른쪽 끝에 닿을 때까지 */
  const HIGH=()=>({x:land().x,y:150});
  {const s0={x:PI.x,y:PI.y};await anim(450,t2=>{const h=HIGH(),a=putSpout(h,0),px=PI.x,py=PI.y;PI.set({x:lerp(s0.x,px,t2),y:lerp(s0.y,py,t2)})},E.io);putSpout(HIGH(),0)}
  const ruler=pmk('g',{class:'np'});const rulerUpd=()=>{const s=spout(),x=s.x+46;ruler.innerHTML=`<path d="M${x.toFixed(0)} ${s.y.toFixed(0)}V${surf.y.toFixed(0)}" stroke="#8a5a44" stroke-width="3" stroke-dasharray="8 6"/><text x="${(x+10).toFixed(0)}" y="${((s.y+surf.y)/2).toFixed(0)}" font-size="22" fill="#8a5a44">10cm 이상</text>`};rulerUpd();
  mark.setAttribute('opacity',1);
  Panel.hint('<em>높은 곳</em>에서 피쳐를 <em>꾹 누르고</em> 잔 가운데에 부어요<small>우유가 <em>초록 동그라미(오른쪽 끝)</em>에 닿으면 손을 떼요</small>');Guide.hold({x:PI.x,y:PI.y-60});
  LA.phase='high';LA.ok=()=>V>=VT-.025*A;T.set('pour',{x:PI.x,y:PI.y-60},null,{svg:'prepSvg'});
  let snd=null;
  await holdLoop(pit,()=>{snd=SFX.pour();tiltIn(HIGH)},
    dt=>{if(!pouring)return;V=Math.min(VT+.04*A,V+.12*A*dt);setPL(PL-.045*dt);draw();putSpout(HIGH(),pourR());stream(5);rulerUpd();if(V>=VT+.04*A)return 'stop'},
    async()=>{snd&&snd.stop();stream(0);await tiltOut(HIGH);rulerUpd();
      if(V<VT-.06*A){Panel.hint('조금 더 부어요<small>우유가 <em>오른쪽 끝(초록 동그라미)</em>에 닿을 때까지</small>');return false}
      if(V>VT+.03*A){R.spill=(R.spill||0)+1;SFX.no();spill(5);floatText(560,330,'조금 흘렀어요',fx);V=VT;draw()}else{SFX.ok();floatText(560,330,'좋아요!',fx)}
      return 'ok'});
  T.clear();mark.setAttribute('opacity',0);ruler.remove();
  /* 4) 잔 가까이 피쳐 코 내리기 */
  /* 선생님 그림 3번: 피쳐 코를 초록 동그라미가 있던 잔 오른쪽 끝에 댄다 */
  const LIP=()=>{const p=rotP([[124,-186]],ang,O.x,O.y)[0];return{x:p[0],y:p[1]}};
  const prog=()=>clamp((V-VT)/(VFULL-VT),0,1);
  const NEAR=()=>{const l=LIP(),c=land(),cy=Math.min(surf.y-14,rimY(c.x)-6),p=prog();return{x:lerp(l.x+6,c.x,p),y:lerp(l.y-8,cy,p)}};
  const NEARIN=()=>{const l=LIP(),c=land(),p=prog();return{x:lerp(Math.max(O.x,l.x-30),c.x,p),y:surf.y}};
  /* 내리기 전에 피쳐를 미리 기울여 둔다 (선생님 그림 3번) */
  await anim(260,t2=>putSpout(spout(),lerp(0,pourR(),t2)),E.out);
  const nearP=(()=>{const a=pourR()*Math.PI/180,n=NEAR();return{x:n.x-(SPL.x*Math.cos(a)-SPL.y*Math.sin(a)),y:n.y-(SPL.x*Math.sin(a)+SPL.y*Math.cos(a))}})();
  Panel.hint('피쳐를 <em>아래로 내려</em> 피쳐 코를 <em>잔 가까이</em> 대요');const zg=pmk('ellipse',{class:'ghost',cx:NEAR().x+10,cy:NEAR().y,rx:60,ry:30},$('#prepGhost'));
  const gOff=(()=>{const a=PI.r*Math.PI/180;return{x:60*Math.sin(a),y:-60*Math.cos(a)}})();
  Guide.drag({x:PI.x+gOff.x,y:PI.y+gOff.y},{x:nearP.x+gOff.x,y:nearP.y+gOff.y});T.set('drag',{x:PI.x+gOff.x,y:PI.y+gOff.y},{x:nearP.x+gOff.x,y:nearP.y+gOff.y},{svg:'prepSvg'});
  await drag(PI,pit,{svg:svgP,zones:[{x:nearP.x,y:nearP.y,r:90}],bounds:[180,120,980,560]});zg.remove();T.clear();
  {const s0={x:PI.x,y:PI.y,r:PI.r};await anim(260,t2=>{putSpout(NEAR(),pourR());const px=PI.x,py=PI.y;PI.set({x:lerp(s0.x,px,t2),y:lerp(s0.y,py,t2)})},E.out);putSpout(NEAR(),pourR())}
  /* 5) 붓으면서 잔을 서서히 세우기 */
  Panel.hint('<em>꾹 누르고</em> 부어요. 잔이 <em>서서히</em> 서요<small>잔이 똑바로 서고 가득 차면 손을 떼요</small>');Guide.hold({x:PI.x,y:PI.y-60});
  LA.phase='close';LA.ok=()=>V>=VFULL*.97;{const a=PI.r*Math.PI/180;T.set('pour',{x:PI.x+60*Math.sin(a),y:PI.y-60*Math.cos(a)},null,{svg:'prepSvg'})}
  let res='good';
  await holdLoop(pit,()=>{snd=SFX.pour();pouring=true},
    dt=>{if(!pouring)return;V=Math.min(VOVER,V+.14*A*dt);const p=clamp((V-VT)/(VFULL-VT),0,1);ang=TILT*(1-p);foam=Math.min(14,4+12*p);setPL(PL-.06*dt);
      draw();putSpout(NEAR(),Math.max(-105,pourR()-42*prog()));stream(8,NEARIN);   /* 가운데로 갈수록 피쳐를 더 기울여 잔과 겹치지 않게 */
      const r=56*p;tart.setAttribute('r',r.toFixed(1));tart2.setAttribute('r',(r*.55).toFixed(1));
      if(V>=VOVER){spill(6);return 'stop'}},
    async()=>{snd&&snd.stop();stream(0);pouring=false;
      if(V>=VOVER){res='big';R.spill=(R.spill||0)+1;SFX.no();floatText(330,250,'넘쳤어요! 가득 차면 손을 떼요',fx);tart.setAttribute('r',62);return 'ok'}
      if(V<VFULL*.97){Panel.hint('조금 더 부어요<small>잔이 <em>똑바로 설 때까지</em></small>');return false}
      ang=0;draw();SFX.great();sparkle(110,206,8,fx);floatText(110,110,'예쁜 원!',fx);sparkle(330,320,6,fx);return 'ok'});
  T.clear();LA.phase='';
  (R.art=R.art||[])[k]=res;Cup.at[k].addMilk(112);await sleep(1200);closePop()}

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
  M=MODES.cap;STEPS=['메뉴 설명','서빙 준비','우유 따르기','추출','스티밍','나누기·붓기','서빙'];LINES_TOTAL=3;$('#rtitle').textContent='카푸치노 결과';
  R={lines:[],prep:0,tries:0,first:null,sec:null,judge:null,cupT:null,brushT:null,brushLate:false,t:0,art:[]};lineNo=0;
  resetBar();scene('judge');Guide.use('#handJ');JUDGES.forEach((j,i)=>{jface(i,'idle');$('#J'+i+' .check').style.opacity=0});
  step(1);await sleep(500);
  R.lines.push(await sayLine('두 번째로 추출해 드릴 커피는 우유 거품이 많은 카푸치노 두 잔을 준비해 드리겠습니다. 잠시만 기다려주십시오.',lineTag()));nod(0);
  step(2);Panel.hide();await trayPrep();
  step(3);scene('bar');Guide.use('#hand');await sleep(900);await milkPour();
  step(4);await grindTamp();await brew();await cupsToCounter();
  step(5);await steamMilk();
  step(6);await divideMilk();await latteArt(0);await latteArt(1);await tidyPitchers();
  step(7);await toTray();Panel.hide();await serveJudges();
  showResult();if(EXAM)EXAM.grab('카푸치노');
}
function showCapResult(){
  const avg=R.lines.reduce((a,b)=>a+b,0)/R.lines.length;
  const row=(name,val,c)=>`<div><span>${name}</span><b style="background:${COL[c]}">${val}</b></div>`;
  const late=R.cupT!=null&&R.cupT>FLOW,good=R.art.filter(x=>x==='good').length;
  $('#rlist').classList.add('two');
  $('#rlist').innerHTML=
    row('대사 발음',`별 평균 ${avg.toFixed(1)}`,avg>=2.5?'g2':avg>=1.8?'g1':'yel')+
    row('서빙 준비',R.prep?`${R.prep}번 다시`:'잘했어요',R.prep?'yel':'g2')+
    row('우유 양',R.milkTries?`코까지 (${R.milkTries}번 덜어냄)`:'코까지 딱',R.milkTries?'yel':'g2')+
    row('추출 시간',`${R.sec}초 · ${R.judge.t}`+(R.tries>1?' (다시)':''),R.tries>1?'yel':R.judge.k==='best'?'g2':R.judge.k==='good'?'g1':'yel')+
    row('잔 내리기',late?'조금 늦었어요':'제때 받쳤어요',late?'yel':'g2')+
    row('붓 청소',R.brushLate?'추출 뒤에 했어요':'추출 중에 했어요',R.brushLate?'yel':'g2')+
    row('공기 주입',`${R.air}번 내렸어요`,R.air===3?'g2':'yel')+
    row('혼합',R.mixLate?'늦게 껐어요':R.mixEarly?'일찍 껐어요':'90%에서 껐어요',R.mixLate||R.mixEarly?'yel':'g2')+
    row('우유 나누기','반반 맞췄어요'+(R.divReset?' (다시 했어요)':''),R.divReset?'yel':'g2')+
    row('붓기',good===2?'원 2개 모두 예뻐요':`예쁜 원 ${good}개`,good===2?'g2':'yel')+
    row('노즐 청소','했어요','g2')+row('서빙','잘했어요','g2');
  $('#result').classList.remove('off');SFX.great();
}
window.__game.cap=()=>({Steam})

/* 에스프레소를 다 받은 카푸치노 잔 2개를 왼쪽 작업대로 옮긴다 */
async function cupsToCounter(){
  const S=[{x:566,y:652},{x:676,y:652}],TS=window.__pc;
  const gh=S.map(s=>mk('ellipse',{class:'ghost',cx:s.x,cy:s.y-4,rx:50,ry:12},$('#Lprep')));
  const zones=S.map(s=>({x:s.x,y:s.y-24,r:62,used:false}));let n=0;
  const hint=()=>Panel.hint(`에스프레소를 받은 <em>카푸치노 잔</em>을 <em>왼쪽 작업대</em>로 옮겨요 <em>(${n}/2)</em>`);hint();
  const point=()=>{const c=Cup.at.find(c=>c&&!c.moved),i=zones.findIndex(z=>!z.used);if(!c||i<0)return Guide.stop();
    Guide.drag({x:c.sp.x,y:c.sp.y-30},{x:S[i].x,y:S[i].y-30});TS.set('drag',{x:c.sp.x,y:c.sp.y-24},{x:S[i].x,y:S[i].y-24})};point();
  await Promise.all(Cup.at.map(async c=>{c.g.setAttribute('class','hit');
    const i=await drag(c.sp,c.g,{zones,anchor:()=>({x:c.sp.x,y:c.sp.y-20})});zones[i].used=true;c.moved=true;gh[i].remove();
    await c.sp.to({...S[i],r:0,sx:1,sy:1},160,E.out);SFX.clink();n++;if(n<2)hint();point()}));
  TS.clear();Guide.stop();SFX.ok()}
