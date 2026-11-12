(()=>{'use strict';
/* ================= 기본 도구 ================= */
const $=(s,r=document)=>r.querySelector(s),NS='http://www.w3.org/2000/svg';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a);
const E={lin:t=>t,io:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,out:t=>1-Math.pow(1-t,3),
  back:t=>{const c=1.9;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)},
  spring:t=>1-Math.cos(t*Math.PI*3.2)*Math.exp(-t*5.5)};
function anim(ms,fn,e=E.io){return new Promise(res=>{const t0=performance.now();const f=now=>{const p=clamp((now-t0)/ms,0,1);fn(p<1?e(p):1,p);p<1?requestAnimationFrame(f):res()};requestAnimationFrame(f)})}
function mix(a,b,t){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16),c=s=>Math.round(lerp(pa>>s&255,pb>>s&255,t));return '#'+((1<<24)+(c(16)<<16)+(c(8)<<8)+c(0)).toString(16).slice(1)}
class Sp{
  constructor(els,x=0,y=0){this.els=[].concat(els);this.x=x;this.y=y;this.r=0;this.sx=1;this.sy=1;this.set()}
  set(o){if(o)Object.assign(this,o);const t=`translate(${this.x.toFixed(1)} ${this.y.toFixed(1)}) rotate(${this.r.toFixed(2)}) scale(${this.sx.toFixed(3)} ${this.sy.toFixed(3)})`;for(const e of this.els)e.setAttribute('transform',t);return this}
  to(o,ms=400,e=E.io){const s={};for(const k in o)s[k]=this[k];return anim(ms,t=>{for(const k in o)this[k]=lerp(s[k],o[k],t);this.set()},e)}
  async hop(x,y,ms=520,h=70,sq=.12){const x0=this.x,y0=this.y;await anim(ms,(t,p)=>{this.x=lerp(x0,x,t);this.y=lerp(y0,y,t)-Math.sin(Math.PI*p)*h;this.set()},E.io);if(sq)await this.squash(sq)}
  async squash(a=.12){await this.to({sx:1+a,sy:1-a},80,E.out);await this.to({sx:1,sy:1},300,E.spring)}
}

/* ================= 무대 크기 ================= */
const stage=$('#stage');
function fit(){const b=document.body,cs=getComputedStyle(b),tip=$('#tip');
  const W=b.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),H=b.clientHeight-(tip.offsetHeight?tip.offsetHeight+8:0);
  const w=Math.max(240,Math.min(W,H*16/9));stage.style.width=w+'px';stage.style.height=(w*9/16)+'px';stage.style.setProperty('--u',(w/100)+'px')}
addEventListener('resize',fit);fit();

/* ================= 아이콘 ================= */
const starP='M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z';
const IC={
  star:`<svg viewBox="0 0 24 24"><path d="${starP}" fill="#ffc94d" stroke="#4a2c22" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  starOff:`<svg viewBox="0 0 24 24"><path d="${starP}" fill="#eadfce" stroke="#4a2c22" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  mic:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="11.5" rx="3" fill="#fff"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg>',
  next:'<svg viewBox="0 0 24 24"><path d="M8 4.5l9 7.5-9 7.5z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
  sndOn:'<svg viewBox="0 0 24 24" fill="none" stroke="#4a2c22" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="#ff8a73"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  sndOff:'<svg viewBox="0 0 24 24" fill="none" stroke="#4a2c22" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="#eadfce"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>'};

/* ================= 소리 ================= */
const SFX=(()=>{let ctx=null,out=null,nb=null,muted=false;
  function ac(){if(muted)return null;try{if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C();out=ctx.createGain();out.gain.value=.5;out.connect(ctx.destination);
      const n=ctx.sampleRate*2;nb=ctx.createBuffer(1,n,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}
    if(ctx.state==='suspended')ctx.resume();return ctx}catch(e){return null}}
  function tone(f,dur,type,vol,delay=0,f2){const c=ac();if(!c)return;try{const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.03)}catch(e){}}
  function noise(o){const c=ac();if(!c)return{stop(){}};try{const s=c.createBufferSource();s.buffer=nb;s.loop=true;const f=c.createBiquadFilter();f.type=o.type||'bandpass';f.frequency.value=o.f||1000;f.Q.value=o.q||1;
    const g=c.createGain(),t=c.currentTime;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.vol||.12,t+.06);s.connect(f);f.connect(g);g.connect(out);s.start();
    let hum=null,hg=null;if(o.hum){hum=c.createOscillator();hg=c.createGain();hum.type='sawtooth';hum.frequency.value=o.hum;hg.gain.value=o.humVol||.03;hum.connect(hg);hg.connect(out);hum.start()}
    let dead=false;const stop=()=>{if(dead)return;dead=true;try{const t2=c.currentTime;g.gain.cancelScheduledValues(t2);g.gain.setValueAtTime(o.vol||.12,t2);g.gain.exponentialRampToValueAtTime(.0001,t2+.14);s.stop(t2+.18);
      if(hum){hg.gain.setValueAtTime(o.humVol||.03,t2);hg.gain.linearRampToValueAtTime(0,t2+.12);hum.stop(t2+.16)}}catch(e){}};
    if(o.dur)setTimeout(stop,o.dur*1000);return{stop}}catch(e){return{stop(){}}}}
  return{unlock:ac,get muted(){return muted},mute(v){muted=v;try{if(v&&window.speechSynthesis)speechSynthesis.cancel()}catch(e){}},
    pick(){tone(520,.07,'triangle',.12)},back(){tone(260,.12,'sine',.12,0,180)},
    snap(){tone(700,.06,'triangle',.14);tone(1050,.09,'triangle',.11,.05)},clink(){tone(1900,.12,'sine',.1);tone(2500,.16,'sine',.06,.02)},
    thud(){tone(130,.18,'sine',.32,0,55)},tick(){tone(1200,.08,'sine',.12)},
    ok(){[523,659,784].forEach((f,i)=>tone(f,.18,'triangle',.15,i*.09))},great(){[523,659,784,1047].forEach((f,i)=>tone(f,.22,'triangle',.15,i*.1))},
    no(){tone(300,.16,'sine',.14,0,240);tone(240,.22,'sine',.12,.14,190)},star(i){tone(880+i*130,.16,'triangle',.13)},
    bell(){tone(1320,.6,'sine',.12);tone(1760,.7,'sine',.09,.14)},pop(){tone(420,.09,'sine',.14,0,760)},
    grind(){return noise({f:1300,q:.8,vol:.13,hum:92,humVol:.035})},pump(){return noise({type:'lowpass',f:420,vol:.1,hum:56,humVol:.02})},
    steam(dur){return noise({type:'highpass',f:2600,vol:.11,dur})},pour(){return noise({f:2100,q:.7,vol:.045})}}})();

/* ================= 안내판 ================= */
const esc=s=>String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
const Panel={el:$('#panel'),tag:$('#ptag'),text:$('#ptext'),btn:$('#pbtn'),
  show(tag,html,btn,label){this.tag.textContent=tag||'';this.tag.hidden=!tag;this.text.innerHTML=html;this.btn.hidden=!btn;this.btn.className=btn||'';this.btn.onclick=null;
    this.btn.innerHTML=btn==='mic'?IC.mic:btn==='next'?'<span>'+(label||'다음')+'</span>'+IC.next:'';this.btn.setAttribute('aria-label',btn==='mic'?'말하기':(label||'다음'));this.el.classList.remove('off')},
  hint(html){this.show('만들기',html,null)},hide(){this.el.classList.add('off')},
  click(){return new Promise(res=>{this.btn.onclick=()=>{this.btn.onclick=null;SFX.pick();res()}})}};
const Bubble={el:$('#bubble'),show(name,html){$('#bname').textContent=name;$('#btext').innerHTML=html;this.el.classList.remove('off')},hide(){this.el.classList.add('off')}};
async function toast(msg,stars,ms=1250){const t=$('#toast');t.innerHTML=(stars!=null?'<div class="stars">'+[0,1,2].map(i=>i<stars?IC.star:IC.starOff).join('')+'</div>':'')+'<div>'+msg+'</div>';
  t.classList.add('on');if(stars)for(let i=0;i<stars;i++)setTimeout(()=>SFX.star(i),80+i*120);await sleep(ms);t.classList.remove('on');await sleep(200)}

/* ================= 말하기 채점 (자모 유사도) ================= */
const TH=[.85,.65,.45],MSG=['','좋은 시도예요!','좋아요! 거의 다 됐어요','와, 아주 또렷해요!'];
const JL='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ',JV='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ',JF=' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
function jamo(s){const o=[];for(const ch of String(s).replace(/[\s.,!?~]/g,'')){const n=ch.charCodeAt(0)-44032;if(n<0||n>11171){o.push(ch);continue}o.push(JL[n/588|0],JV[(n%588)/28|0]);if(n%28)o.push(JF[n%28])}return o}
function sim(a,b){a=jamo(a);b=jamo(b);if(!a.length)return 0;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return 1-d[a.length][b.length]/Math.max(a.length,b.length,1)}
const Speech={dict:null,dictBad:false,srBad:false,log:[]};window.__speechLog=Speech.log;
try{if(window.claude&&window.claude.use)window.claude.use('dictation').then(d=>{Speech.dict=d||null},()=>{})}catch(e){}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const inApp=/KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(navigator.userAgent);
function whyText(){const w=Speech.why||(SR?'':'nosr');
  if(w==='denied')return '마이크가 막혀 있어요. 주소창 왼쪽 아이콘 → 권한 → 마이크 허용 후 새로고침해요.';
  if(w==='nomic')return '마이크를 찾지 못했어요. 다른 앱이 마이크를 쓰고 있는지 확인해요.';
  if(w==='service')return '이 브라우저에서는 음성인식을 쓸 수 없어요. Chrome으로 열어요.';
  if(inApp)return '카카오톡 같은 앱 안에서 열렸어요. 메뉴(⋮)에서 다른 브라우저(Chrome)로 열어요.';
  if(w==='nosr')return '이 브라우저는 음성인식이 안 돼요. Chrome으로 열어요.';
  return '지금은 마이크를 쓸 수 없어요.'}
const canListen=()=>!!((Speech.dict&&!Speech.dictBad)||(SR&&!Speech.srBad));
function listenSR(){return new Promise(res=>{let done=false,to=0;const fin=v=>{if(!done){done=true;clearTimeout(to);res(v)}};let r;
  const bad=w=>{Speech.srBad=true;Speech.why=w;fin(null)};
  try{r=new SR()}catch(e){return bad('nosr')}
  r.lang='ko-KR';r.maxAlternatives=5;r.interimResults=false;
  r.onresult=e=>{const o=[];for(let i=0;i<e.results[0].length;i++)o.push(e.results[0][i].transcript);fin(o)};
  r.onerror=e=>{Speech.lastErr=e.error;if(e.error==='not-allowed')bad('denied');else if(e.error==='service-not-allowed')bad('service');else if(e.error==='audio-capture')bad('nomic');else fin([])};
  r.onend=()=>fin([]);to=setTimeout(()=>{try{r.stop()}catch(e){}fin([])},20000);
  try{r.start()}catch(e){Speech.srBad=true;fin(null)}})}
function listenDict(){const d=Speech.dict;return new Promise(res=>{let fin_='',part='',done=false,to=0,endT=0;const offs=[];
  const out=()=>[fin_.trim(),part.trim()].filter(Boolean);
  const fin=v=>{if(done)return;done=true;clearTimeout(to);clearTimeout(endT);offs.forEach(f=>{try{f()}catch(e){}});res(v)};
  const wrap=()=>{let p;try{p=d.stop()}catch(e){p=null}Promise.resolve(p).catch(()=>{}).then(()=>fin(out()))};
  try{offs.push(d.onFinal(e=>{fin_+=e.text;clearTimeout(endT);endT=setTimeout(wrap,450)}));
    offs.push(d.onPartial(e=>{if(e.text)part=e.text}));
    d.start({language:'ko'}).then(()=>{to=setTimeout(wrap,9000);offs.push(d.onState(e=>{if(e.state==='idle')fin(out())}))},
      err=>{const c=err&&err.code;if(c==='dismissed'||c==='stopped'||c==='rate_limited'||c==='upstream_error')fin([]);else{Speech.dictBad=true;fin(null)}})}
  catch(e){Speech.dictBad=true;fin(null)}})}
/* 버튼을 누른 그 순간에 바로 불러야 한다 */
function listenNow(){if(Speech.dict&&!Speech.dictBad)return listenDict();if(SR&&!Speech.srBad)return listenSR();return Promise.resolve(null)}
function tts(text,pitch=1){return new Promise(res=>{let done=false;const fin=()=>{if(!done){done=true;res()}};const wait=900+text.length*110;
  try{const ss=window.speechSynthesis;if(!ss||SFX.muted)return setTimeout(fin,wait);ss.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';u.rate=.9;u.pitch=pitch;u.onend=fin;u.onerror=fin;ss.speak(u);setTimeout(fin,wait+1800)}
  catch(e){setTimeout(fin,wait)}})}
async function sayLine(target){
  let tries=0;Panel.show('따라 말해요',esc(target),'mic');
  for(;;){
    if(!canListen()){Panel.show('소리 내어 말해요',esc(target)+'<small>'+whyText()+'</small>','next','말했어요');await Panel.click();return 1}
    const heard=await new Promise(res=>{Panel.btn.onclick=()=>{Panel.btn.onclick=null;Panel.btn.classList.add('listening');Panel.tag.textContent='듣고 있어요';SFX.pick();res(listenNow())}});
    Panel.btn.classList.remove('listening');
    if(heard===null){Panel.show('따라 말해요',esc(target),'mic');continue}
    tries++;const s=Math.max(0,...heard.map(t=>sim(t,target)));Speech.log.push({target,heard,score:+s.toFixed(2)});
    const st=s>=TH[0]?3:s>=TH[1]?2:s>=TH[2]?1:0;
    if(st){await toast(MSG[st],st);return st}
    if(tries>=3){Panel.show('먼저 들어 봐요',esc(target),null);await tts(target);await toast('잘했어요. 다음으로 가요',1);return 1}
    SFX.no();Panel.show('다시 한 번',esc(target)+'<small>조금 더 크게, 또박또박 말해요</small>','mic')}
}

/* ================= 그림: 잔 ================= */
const CUPG={demi:{H:56,RX:42,RY:11,max:.84},mug:{H:104,RX:55,RY:13,max:.44}};
function cupSVG(kind,uid){const {H,RX,RY}=CUPG[kind],d=kind==='demi';
  const body=d?'M-42 -56C-42 -18 -24 0 -12 0L12 0C24 0 42 -18 42 -56A42 11 0 0 1 -42 -56Z':'M-55 -104L-47 -14Q-46 0 -32 0L32 0Q46 0 47 -14L55 -104A55 13 0 0 1 -55 -104Z';
  const handle=d?'M38 -47C66 -52 68 -18 28 -15':'M50 -88C98 -94 100 -26 44 -24';
  const shade=d?'M18 -3C30 -12 39 -30 40 -46L29 -43C28 -30 23 -14 12 -3Z':'M33 -3Q44 -4 45 -16L52 -92L38 -89L31 -3Z';
  const deco=d?'<path d="M-38 -34Q0 -24 38 -34" stroke="#ff8a73" stroke-width="5" fill="none" stroke-linecap="round"/>':'<path d="M0 -40c-5-11-22-5-17 8c4 8 13 13 17 17c4-4 13-9 17-17c5-13-12-19-17-8z" fill="#ff8a73"/>';
  return `<g class="cin">
  <ellipse cx="0" cy="4" rx="${RX*.82}" ry="7" fill="#4a2c22" opacity=".15"/>
  <path d="${handle}" fill="none" stroke="#4a2c22" stroke-width="${d?16:20}" stroke-linecap="round"/>
  <path d="${handle}" fill="none" stroke="#fffaf2" stroke-width="${d?7:10}" stroke-linecap="round"/>
  <ellipse cx="0" cy="${-H}" rx="${RX}" ry="${RY}" fill="#d9c9b6"/>
  <clipPath id="cl${uid}"><ellipse cx="0" cy="${-H}" rx="${RX-3}" ry="${RY-2.2}"/></clipPath>
  <g clip-path="url(#cl${uid})"><ellipse class="surf" cx="0" cy="${-H}" rx="1" ry="1" opacity="0"/><ellipse class="core" cx="0" cy="${-H}" rx="1" ry="1" opacity="0"/></g>
  <path d="${body}" fill="#fffaf2" class="o"/>
  <path d="${shade}" fill="#ecdfd0"/>
  <path d="M${-RX+11} ${-H+22}Q${-RX+10} ${-H*.55} ${-RX+17} ${-H*.3}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
  ${deco}
  <ellipse cx="0" cy="${-H}" rx="${RX}" ry="${RY}" class="o nf"/>
  <g class="dome" style="display:none"><path d="M${-RX+7} ${-H}C${-RX+12} ${-H-36} ${RX-12} ${-H-36} ${RX-7} ${-H}A${RX-7} ${RY-3} 0 0 1 ${-RX+7} ${-H}Z" fill="#fffdf8" class="o4"/>
    <path d="M${-RX*.5} ${-H-11}Q${-RX*.25} ${-H-21} ${RX*.08} ${-H-21}" stroke="#eadfd0" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="${RX*.36}" cy="${-H-9}" r="3" fill="#eadfd0"/><circle cx="${RX*.14}" cy="${-H-3}" r="2.2" fill="#eadfd0"/></g>
  <g class="spill" style="display:none"><path d="M${-RX+8} ${-H+6}Q0 ${-H+RY+8} ${RX-8} ${-H+6}" stroke="#5a3220" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path class="drip" d="M${-RX*.5} ${-H+10}V-6" stroke="#5a3220" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path class="drip" d="M${RX*.15} ${-H+12}V-4" stroke="#5a3220" stroke-width="6" fill="none" stroke-linecap="round" style="animation-delay:-.3s"/>
    <path class="drip" d="M${RX*.6} ${-H+9}V-10" stroke="#5a3220" stroke-width="6" fill="none" stroke-linecap="round" style="animation-delay:-.5s"/></g>
  </g>`}
function makeCup(kind,uid,layer){const g=document.createElementNS(NS,'g');g.setAttribute('class','hit');g.innerHTML=cupSVG(kind,uid);layer.appendChild(g);
  const c={kind,g,sp:new Sp(g),inner:$('.cin',g),surf:$('.surf',g),core:$('.core',g),dome:$('.dome',g),spill:$('.spill',g),s:{L:0,ring:'#4a2814',core:'#24120b',coreK:.66,foam:0,spill:false}};setCup(c,{});return c}
function setCup(c,s){Object.assign(c.s,s);const G=CUPG[c.kind],k=clamp(c.s.L,0,1),cy=-G.H+(1-k)*G.RY*.75,rx=(G.RX-3)*(.5+.5*k),ry=(G.RY-2.2)*(.42+.58*k),on=c.s.L>.01?1:0;
  const a=(e,o)=>{for(const n in o)e.setAttribute(n,o[n])};
  a(c.surf,{cy:cy.toFixed(1),rx:rx.toFixed(1),ry:ry.toFixed(1),fill:c.s.ring,opacity:on});
  a(c.core,{cy:(cy+ry*.08).toFixed(1),rx:(rx*c.s.coreK).toFixed(1),ry:(ry*c.s.coreK).toFixed(1),fill:c.s.core,opacity:on});
  c.dome.style.display=c.s.foam>.02?'':'none';c.dome.setAttribute('transform',`translate(0 ${-G.H}) scale(1 ${clamp(c.s.foam,.02,1).toFixed(3)}) translate(0 ${G.H})`);
  c.spill.style.display=c.s.spill?'':'none'}
const surfY=c=>{const G=CUPG[c.kind];return c.sp.y-G.H+(1-clamp(c.s.L,0,1))*G.RY*.75};

/* ================= 그림: 도구 ================= */
$('#pf').innerHTML=`
  <path d="M-46 0C-46 30 -34 46 -22 46L22 46C34 46 46 30 46 0Z" fill="url(#gChromeH)" class="o"/>
  <path d="M18 44C30 38 40 24 42 6L31 6C29 22 23 36 12 44Z" fill="#8c9ba6" opacity=".7"/>
  <rect x="-32" y="42" width="14" height="14" rx="4" fill="#a9b6bf" class="o3"/><rect x="18" y="42" width="14" height="14" rx="4" fill="#a9b6bf" class="o3"/>
  <ellipse cx="0" cy="0" rx="50" ry="13" fill="#dfe6ea" class="o"/>
  <ellipse cx="0" cy="0" rx="40" ry="9" fill="#5b4840" class="o3"/>
  <ellipse id="pfFlat" cx="0" cy="1.5" rx="36.5" ry="7" fill="#3f2314" style="display:none"/>
  <path id="pfMound" d="" fill="#6b3f26" class="o3" style="display:none"/>
  <rect x="-10" y="40" width="20" height="22" rx="4" fill="#b7c3cb" class="o3"/>
  <path d="M-16 58H16L14 96Q14 108 0 108Q-14 108 -14 96Z" fill="#3b2a26" class="o4"/>
  <path d="M-7 66V96" stroke="#7a5d52" stroke-width="5" stroke-linecap="round"/>`;
$('#tamp').innerHTML=`
  <rect x="-35" y="-15" width="70" height="15" rx="4" fill="url(#gChromeH)" class="o4"/>
  <path d="M-13 -15L-9 -36H9L13 -15Z" fill="#b7c3cb" class="o4"/>
  <path d="M-9 -36C-32 -42 -32 -80 0 -82C32 -80 32 -42 9 -36Z" fill="#e0764f" class="o4"/>
  <path d="M-16 -64Q-10 -75 2 -75" stroke="#fff" stroke-width="5" opacity=".65" fill="none" stroke-linecap="round"/>`;
$('#pitB').innerHTML=`
  <path d="M46 -108C94 -112 96 -36 50 -32" fill="none" stroke="#4a2c22" stroke-width="18" stroke-linecap="round"/>
  <path d="M46 -108C94 -112 96 -36 50 -32" fill="none" stroke="#c3ced5" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="0" cy="-126" rx="50" ry="12" fill="#7b8a95" class="o"/>
  <g clip-path="url(#clPit)"><ellipse id="milkS" cx="0" cy="-120" rx="40" ry="8" fill="#fffdf6"/>
    <g id="milkBub" opacity="0" fill="none" stroke="#d6cfc2" stroke-width="2"><circle cx="-18" cy="0" r="5"/><circle cx="8" cy="3" r="4"/><circle cx="24" cy="-2" r="3.5"/><circle cx="-4" cy="-4" r="3"/><circle cx="-30" cy="-3" r="3"/></g></g>`;
$('#pitF').innerHTML=`
  <path d="M-50 -126L-56 -12Q-56 0 -44 0L44 0Q56 0 56 -12L50 -126A50 12 0 0 1 -50 -126Z" fill="url(#gChromeH)" class="o"/>
  <path d="M-50 -126L-74 -138L-48 -106Z" fill="#cfd9df" class="o4"/>
  <path d="M-36 -98L-40 -18" stroke="#fff" stroke-width="10" opacity=".7" stroke-linecap="round"/>
  <path d="M34 -106L38 -12" stroke="#8697a3" stroke-width="12" opacity=".45" stroke-linecap="round"/>`;
$('#cloth').innerHTML=`
  <ellipse cx="0" cy="22" rx="50" ry="6" fill="#4a2c22" opacity=".14"/>
  <path d="M-48 -18Q0 -27 48 -18L50 16Q0 25 -50 16Z" fill="#fff" class="o4"/>
  <path d="M-47 -6Q0 -15 47 -6M-48 5Q0 -4 48 5" stroke="#7fb8d8" stroke-width="5" fill="none"/>
  <path d="M22 -22Q36 -4 49 14" class="o3 nf" opacity=".35"/>`;
const PF=new Sp($('#pf')),TAMP=new Sp($('#tamp')),PIT=new Sp([$('#pitB'),$('#pitF')]),CL=new Sp($('#cloth')),RIMF=new Sp($('#rimFront'));
const P={grind:{x:205,y:484},tamp:{x:374,y:546},lock:{x:780,y:334},tampRest:{x:468,y:600},tampReady:{x:374,y:490},
  tray:{x:780,y:588},saucer:{x:1305,y:602},pitHome:{x:1470,y:608},pitWand:{x:1132,y:550},pitPour:{x:1474,y:482},
  clothHome:{x:1140,y:636},gBtn:{x:205,y:362},bBtn:{x:962,y:236},knob:{x:1060,y:264},tops:{demi:[566,676],mug:[806,952]},topY:148};
function setGrounds(g,tamped){const m=$('#pfMound'),f=$('#pfFlat');if(tamped){m.style.display='none';f.style.display='';return}
  f.style.display='none';if(g<=.02){m.style.display='none';return}m.style.display='';const h=(15*g*1.4).toFixed(1);m.setAttribute('d',`M-38 0C-30 ${-h} 30 ${-h} 38 0A38 8 0 0 1 -38 0Z`)}
function setMilk(L,foam){const cy=-126+(1-L)*10;const s=$('#milkS');s.setAttribute('cy',cy);s.setAttribute('rx',47*(.6+.4*L));s.setAttribute('ry',10*(.5+.5*L));
  const b=$('#milkBub');b.setAttribute('transform',`translate(0 ${cy})`);b.setAttribute('opacity',foam);PIT.milk=L;PIT.foam=foam}
function setTimer(t){const d=$('#tDig');d.textContent=Math.floor(t)+'초';d.setAttribute('fill',t>30?'#ff9484':t>=20?'#63ffa0':'#b8ffd2');$('#tMark').setAttribute('x',700.5+clamp(t,0,40)/40*190)}
function setBrewBtn(on){$('#bPlay').style.display=on?'none':'';$('#bStop').style.display=on?'':'none';$('#bFace').setAttribute('fill',on?'#ff7a6b':'#7fd08a')}
const needle=p=>$('#needle').setAttribute('transform',`rotate(${-120+clamp(p,0,1)*240} 622 386)`);
function puddle(k){const e=$('#puddle');e.style.display=k>.01?'':'none';e.setAttribute('rx',40+150*k);e.setAttribute('ry',3+6*k);e._k=k;
  const r=clamp((k-.3)/.7,0,1);$('#runoff').style.display=r>0?'':'none';$('#floorPud').setAttribute('rx',20+120*r);$('#floorPud').setAttribute('ry',2+7*r)}
function stream(o){const a=$('#st1'),b=$('#st2');if(!o){a.setAttribute('d','');b.setAttribute('d','');return}
  [[a,755,1],[b,805,-1]].forEach(([e,x,s])=>{const k=o.wob*s;e.setAttribute('d',`M${x} ${o.y0.toFixed(1)}C${(x+k).toFixed(1)} ${lerp(o.y0,o.y1,.33).toFixed(1)} ${(x-k).toFixed(1)} ${lerp(o.y0,o.y1,.66).toFixed(1)} ${x} ${o.y1.toFixed(1)}`);
    e.setAttribute('stroke',o.col);e.setAttribute('stroke-width',o.w);if(o.dash){e.setAttribute('stroke-dasharray',o.dash);e.setAttribute('stroke-dashoffset',o.off)}else e.removeAttribute('stroke-dasharray')})}

/* ================= 효과 ================= */
const fx=$('#fx'),fxF=$('#fxF');
function mk(tag,at,parent){const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);(parent||fx).appendChild(e);return e}
function puff(x,y,o={}){const r0=o.r||7,dx=rnd(-20,20),dy=o.dy||-80,c=mk('circle',{cx:x,cy:y,r:r0,fill:'#fff',stroke:'#cdd7dc','stroke-width':2});
  anim(o.ms||950,t=>{c.setAttribute('cx',x+dx*t);c.setAttribute('cy',y+dy*t);c.setAttribute('r',r0+15*t);c.setAttribute('opacity',.9*(1-t))},E.out).then(()=>c.remove())}
function sparkle(x,y,n=7,parent){for(let i=0;i<n;i++){const a=rnd(0,6.28),d=rnd(34,86),s=mk('path',{d:'M0 -11L3 -3L11 0L3 3L0 11L-3 3L-11 0L-3 -3Z',fill:'#ffd95e',stroke:'#4a2c22','stroke-width':2},parent);
  anim(rnd(480,780),t=>{s.setAttribute('transform',`translate(${(x+Math.cos(a)*d*t).toFixed(1)} ${(y+Math.sin(a)*d*t).toFixed(1)}) scale(${(.4+Math.sin(Math.PI*t)).toFixed(2)}) rotate(${(t*140).toFixed(0)})`);s.setAttribute('opacity',t<.7?1:(1-t)/.3)},E.out).then(()=>s.remove())}}
function floatText(x,y,txt,parent){const t=mk('text',{x,y,'text-anchor':'middle','font-size':40,fill:'#4a2c22',stroke:'#fff7ea','stroke-width':9,'paint-order':'stroke','stroke-linejoin':'round'},parent);t.textContent=txt;
  anim(950,p=>{t.setAttribute('y',y-56*p);t.setAttribute('opacity',p<.7?1:(1-p)/.3)},E.out).then(()=>t.remove())}
function drop(x,y0,y1,col='#5a3220',r=5){const c=mk('circle',{cx:x,cy:y0,r,fill:col});anim(230,t=>c.setAttribute('cy',lerp(y0,y1,t)),t=>t*t).then(()=>c.remove())}
function heart(x,y){const h=mk('path',{d:'M0 6c-6-13-26-7-20 9c5 10 15 16 20 21c5-5 15-11 20-21c6-16-14-22-20-9z',fill:'#ff8a73',stroke:'#4a2c22','stroke-width':3,'stroke-linejoin':'round'},fxF);const dx=rnd(-40,40);
  anim(1300,t=>{h.setAttribute('transform',`translate(${x+dx*t} ${y-130*t}) scale(${.5+.7*Math.sin(Math.PI*Math.min(t*1.4,1)/1.4+.3)})`);h.setAttribute('opacity',t<.7?1:(1-t)/.3)},E.out).then(()=>h.remove())}
const zoneEl=$('#zone');
function zone(x,y,rx,ry){if(x==null){zoneEl.style.display='none';return}zoneEl.setAttribute('cx',x);zoneEl.setAttribute('cy',y);zoneEl.setAttribute('rx',rx);zoneEl.setAttribute('ry',ry||rx);zoneEl.classList.remove('near');zoneEl.style.display=''}
function shake(){const s=$('#station');s.classList.remove('shake');void s.getBoundingClientRect();s.classList.add('shake');setTimeout(()=>s.classList.remove('shake'),260)}

/* ================= 손가락 안내 ================= */
const handEl=$('#hand'),hand=new Sp(handEl);
const Guide={tok:0,last:null,delay:350,
  run(kind,a,b){this.last=[kind,a,b];const my=++this.tok,alive=()=>my===this.tok;
    const gt=(o,ms,e)=>{const s={};for(const k in o)s[k]=hand[k];return anim(ms,t=>{if(!alive())return;for(const k in o)hand[k]=lerp(s[k],o[k],t);hand.set()},e||E.io)};
    const op=v=>{if(alive())handEl.style.opacity=v};
    (async()=>{await sleep(this.delay);if(!alive())return;handEl.style.display='';
      while(alive()){hand.set({x:a.x,y:a.y,sx:1,sy:1,r:0});
        if(kind==='drag'){op(0);await anim(180,t=>op(t));await gt({sx:.86,sy:.86},150);await gt({x:b.x,y:b.y},900);await gt({sx:1,sy:1},150);await anim(220,t=>op(1-t));await sleep(280)}
        else if(kind==='tap'){op(1);await gt({sx:.84,sy:.84},170);await gt({sx:1,sy:1},210);await sleep(440)}
        else{op(1);await gt({sx:.84,sy:.84},180);await sleep(950);await gt({sx:1,sy:1},180);await sleep(320)}}})()},
  drag(a,b){this.run('drag',a,b)},tap(a){this.run('tap',a)},hold(a){this.run('hold',a)},
  stop(){this.tok++;this.last=null;handEl.style.display='none'},
  pause(){this.tok++;handEl.style.display='none'},
  resume(){if(this.last)this.run(...this.last)}};

/* ================= 조작 ================= */
const svgS=$('#station');
const spt=e=>new DOMPoint(e.clientX,e.clientY).matrixTransform(svgS.getScreenCTM().inverse());
function tap(el){return new Promise(res=>{const h=()=>{el.removeEventListener('click',h);res()};el.addEventListener('click',h)})}
function drag(spr,el,o){return new Promise(res=>{const home={x:spr.x,y:spr.y};let g=null,ended=false;
  const anc=()=>o.anchor?o.anchor():spr,near=()=>{const a=anc();return Math.hypot(a.x-o.zone.x,a.y-o.zone.y)<o.zone.r};
  const dn=e=>{if(ended)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}const p=spt(e);g={dx:p.x-spr.x,dy:p.y-spr.y,lx:p.x};Guide.pause();SFX.pick();spr.to({sx:1.07,sy:1.07},130,E.out)};
  const mv=e=>{if(!g)return;const p=spt(e),vx=p.x-g.lx;g.lx=p.x;spr.x=clamp(p.x-g.dx,30,1570);spr.y=clamp(p.y-g.dy,40,870);spr.r=lerp(spr.r,clamp(vx*1.4,-13,13),.25);spr.set();zoneEl.classList.toggle('near',near())};
  const up=()=>{if(!g)return;g=null;if(near()){ended=true;off();zone();Guide.stop();res()}else{SFX.back();zoneEl.classList.remove('near');spr.to({x:home.x,y:home.y,r:0,sx:1,sy:1},420,E.back).then(()=>{if(!ended)Guide.resume()})}};
  const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
  el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)})}
function hold(el,ms,onP,onState){return new Promise(res=>{let p=0,down=false,last=0,done=false;
  const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}down=true;onState(true);Guide.pause()};
  const up=()=>{if(!down)return;down=false;onState(false);if(!done)Guide.resume()};
  const ctx=e=>e.preventDefault();
  const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('lostpointercapture',up);el.removeEventListener('contextmenu',ctx)};
  el.addEventListener('pointerdown',dn);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);el.addEventListener('contextmenu',ctx);
  const f=now=>{if(last&&down)p=Math.min(1,p+(now-last)/ms);last=now;onP(p,down);if(p>=1){done=true;if(down){down=false;onState(false)}off();Guide.stop();res();return}requestAnimationFrame(f)};requestAnimationFrame(f)})}

/* ================= 만들기 ================= */
const SCALE=3;               /* 화면의 1초가 실제로는 1/3초 */
let cups=[],cup=null,served=0,total=0;
const forced=location.hash==='#cap'?'카푸치노':location.hash==='#esp'?'에스프레소':null;
function resetStation(){
  $('#Lcups').innerHTML='';cups=[];let n=0;
  for(const k of ['demi','mug'])for(const x of P.tops[k]){const c=makeCup(k,'c'+(n++),$('#Lcups'));c.sp.set({x,y:P.topY});c.inner.style.animationDelay=(-n*.22)+'s';cups.push(c)}
  cup=null;PF.set({...P.tamp,r:0,sx:1,sy:1});setGrounds(0,false);TAMP.set({...P.tampRest,r:0,sx:1,sy:1});
  PIT.set({...P.pitHome,r:0,sx:1,sy:1});setMilk(.55,0);CL.set({...P.clothHome,r:0,sx:1,sy:1});
  setTimer(0);setBrewBtn(false);needle(0);puddle(0);stream(null);zone();Guide.stop();
  $('#resid').style.display='none';$('#resid').style.opacity=1;$('#rimFront').style.display='none';$('#wandHit').style.display='none';
  $('#gRing').setAttribute('stroke-dashoffset',295.3);$('#knob').removeAttribute('transform');fx.innerHTML=''}
function pickCup(){return new Promise(res=>{cups.forEach(c=>{c.inner.classList.add('pickme');c.g.onclick=()=>{cups.forEach(k=>{k.g.onclick=null;k.inner.classList.remove('pickme')});res(c)}})})}

async function grindTamp(){
  /* 포터필터 → 그라인더 */
  Panel.hint('<em>포터필터</em>를 그라인더로 옮겨요');zone(P.grind.x,P.grind.y+22,70,58);Guide.drag({x:PF.x,y:PF.y+30},{x:P.grind.x,y:P.grind.y+30});
  await drag(PF,$('#pf'),{zone:{x:P.grind.x,y:P.grind.y,r:100}});
  await PF.to({...P.grind,r:0,sx:1,sy:1},240,E.back);SFX.snap();
  /* 갈기 */
  Panel.hint('초록 버튼을 <em>꾹 누르고</em> 있어요');Guide.hold(P.gBtn);
  const ring=$('#gRing'),gEl=$('#grinder'),beans=$('#beans'),btn=$('#gBtn');let snd=null;ring.classList.add('ringp');
  await hold(btn,2500,(p,down)=>{ring.setAttribute('stroke-dashoffset',(295.3*(1-p)).toFixed(1));setGrounds(p,false);
    if(down){const now=performance.now();gEl.setAttribute('transform',`translate(${(205+Math.sin(now/21)*1.5).toFixed(2)} 0)`);beans.setAttribute('transform',`translate(${rnd(-1.6,1.6).toFixed(1)} ${rnd(-1,1.6).toFixed(1)})`);
      if(Math.random()<.6)drop(P.grind.x+rnd(-10,10),460,P.grind.y-4-13*p,'#6b3f26',3)}},
    on=>{ring.classList.toggle('ringp',!on);btn.setAttribute('transform',on?'translate(0 3)':'');if(on)snd=SFX.grind();else{snd&&snd.stop();snd=null;gEl.setAttribute('transform','translate(205 0)');beans.removeAttribute('transform')}});
  SFX.ok();sparkle(P.grind.x,P.grind.y-10,6);floatText(P.grind.x+130,P.grind.y-30,'가득!');await sleep(450);ring.classList.remove('ringp');ring.setAttribute('stroke-dashoffset',295.3);
  /* 매트로 옮기고 탬퍼 준비 */
  await PF.hop(P.tamp.x,P.tamp.y,520,60,0);SFX.pick();
  RIMF.set({...P.tamp});
  await TAMP.hop(P.tampReady.x,P.tampReady.y,460,40,0);$('#rimFront').style.display='';
  Panel.hint('<em>탬퍼</em>를 아래로 <em>꾹</em> 눌러요');Guide.drag({x:P.tampReady.x,y:P.tampReady.y-50},{x:P.tampReady.x,y:P.tamp.y-6});
  await new Promise(res=>{const el=$('#tamp'),cY=P.tamp.y-15,endY=P.tamp.y+3;let g=null,done=false,best=0;
    const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}g={py:spt(e).y,y0:TAMP.y};Guide.pause();SFX.pick()};
    const mv=e=>{if(!g||done)return;let y=g.y0+(spt(e).y-g.py);const top=cY+18*best;if(y>top)y=top+(y-top)*.45;y=clamp(y,P.tampReady.y-30,endY);TAMP.set({y});
      best=Math.max(best,clamp((y-cY)/18,0,1));setGrounds(1-best,false);if(best>=1){done=true;fin()}};
    const up=()=>{if(!g||done)return;g=null;TAMP.to({y:P.tampReady.y},320,E.back).then(()=>{if(!done)Guide.resume()})};
    const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
    async function fin(){off();Guide.stop();SFX.thud();shake();setGrounds(0,true);floatText(P.tamp.x,P.tamp.y-96,'꾹!');await sleep(380);
      await TAMP.to({y:P.tampReady.y-10},220,E.out);$('#rimFront').style.display='none';await TAMP.hop(P.tampRest.x,P.tampRest.y,420,30,.08);sparkle(P.tamp.x,P.tamp.y-6,5);SFX.ok();res()}
    el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)});
}
async function lockPF(){
  Panel.hint('<em>포터필터</em>를 머신에 끼워요');zone(P.lock.x,P.lock.y+34,74,62);Guide.drag({x:PF.x,y:PF.y+30},{x:P.lock.x,y:P.lock.y+40});
  await drag(PF,$('#pf'),{zone:{x:P.lock.x,y:P.lock.y+20,r:105}});
  await PF.to({x:P.lock.x,y:P.lock.y+22,r:0,sx:1,sy:1},180,E.out);await PF.to({y:P.lock.y},160,E.back);SFX.snap();
}
async function dump(){const s=cup.sp,L0=cup.s.L,k0=$('#puddle')._k||0,H=CUPG[cup.kind].H;
  await s.to({x:P.tray.x-80,y:P.tray.y-34},260,E.out);await s.to({r:-105},260,E.io);
  for(let i=0;i<8;i++)setTimeout(()=>drop(s.x-.97*H+rnd(-7,7),s.y+.26*H,P.tray.y-2),i*45);
  await anim(430,t=>{setCup(cup,{L:L0*(1-t),spill:false});puddle(k0*(1-t))},E.lin);
  await s.to({r:0},240,E.io);await s.to({x:P.tray.x,y:P.tray.y},240,E.io);await s.squash(.08)}
async function brew(){
  let first=null;const G=CUPG[cup.kind];
  for(;;){
    setTimer(0);Panel.hint('<em>추출 버튼</em>을 눌러요');Guide.tap(P.bBtn);
    await tap($('#bBtn'));Guide.stop();SFX.pick();setBrewBtn(true);const pump=SFX.pump();
    Panel.hint('<em>초록색(20~30초)</em>일 때 버튼을 다시 눌러 멈춰요');
    const t0=performance.now();let t=0,stopped=false,cue=false,warn=false,spilled=false;
    $('#bBtn').addEventListener('click',()=>{stopped=true},{once:true});
    await new Promise(res=>{const f=now=>{if(stopped)return res();t=(now-t0)/1000*SCALE;setTimer(t);
      const L=t<=30?G.max*t/30:Math.min(1.03,G.max+(1.03-G.max)*(t-30)/6),cr=clamp((t-3)/22,0,1);
      if(t>36)spilled=true;
      setCup(cup,{L:t<1.2?0:L,ring:mix('#4a2814','#c58a4e',cr),core:mix('#24120b','#7a4a28',cr),coreK:.66,spill:t>36});
      if(t>36)puddle(clamp((t-36)/14,0,1));
      needle(clamp(t/2.5,0,1)*.72+Math.sin(now/130)*.015);
      if(t<1.2)stream(null);else stream({y0:390,y1:surfY(cup),w:t<3.5?5:lerp(5,7,clamp((t-3.5)/6,0,1)),col:mix('#2a140c','#b9773f',clamp((t-3)/24,0,1)),dash:t<3.5?'9 15':null,off:(-(now/9)%24).toFixed(1),wob:Math.sin(now/110)*1.6});
      if(!cue&&t>=20){cue=true;SFX.tick();if(!served)Guide.tap(P.bBtn)}
      if(!warn&&t>30){warn=true;SFX.no();Guide.delay=0;Guide.tap(P.bBtn);Panel.hint('30초가 넘었어요! <em>버튼을 눌러 멈춰요</em>')}
      requestAnimationFrame(f)};requestAnimationFrame(f)});
    Guide.stop();Guide.delay=served?2600:350;pump.stop();SFX.pick();setBrewBtn(false);
    const y1=surfY(cup),col=$('#st1').getAttribute('stroke')||'#2a140c';
    if(t>=1.2)await anim(240,p=>stream({y0:lerp(390,y1,p),y1,w:6,col,wob:0}),E.lin);stream(null);anim(500,p=>needle(.72*(1-p)));
    const r=t<20?'early':t<=30?'good':'late';if(first===null)first=r;
    if(r==='good'){SFX.great();sparkle(cup.sp.x,cup.sp.y-CUPG[cup.kind].H-10,8);await toast('딱 좋아요! '+Math.floor(t)+'초');return first==='good'}
    SFX.no();await toast(r==='early'?'조금 일찍 멈췄어요':spilled?'넘쳐서 흘렀어요':'30초가 넘었어요',null,1400);
    Panel.hint('잔을 비우고 <em>다시</em> 해 봐요');await dump();
  }
}
async function steamMilk(){
  Panel.hint('<em>우유 피쳐</em>를 스팀완드에 끼워요');zone(P.pitWand.x,510,74,84);Guide.drag({x:PIT.x,y:PIT.y-60},{x:P.pitWand.x,y:P.pitWand.y-60});
  await drag(PIT,$('#pitF'),{zone:{x:P.pitWand.x,y:P.pitWand.y,r:120}});
  await PIT.to({...P.pitWand,r:0,sx:1,sy:1},280,E.back);SFX.snap();
  const hit=$('#wandHit'),knob=$('#knob');hit.style.display='';
  for(let i=1;i<=3;i++){
    Panel.hint('<em>스팀완드</em>를 눌러 공기를 넣어요 <em>('+(i-1)+'/3)</em>');Guide.tap(P.knob);
    await tap(hit);Guide.stop();hit.style.display='none';SFX.pick();
    anim(200,t=>knob.setAttribute('transform',`rotate(${90*t} 1060 264)`),E.out);SFX.steam(1.15);floatText(1250,400,'치이익~');
    const f0=PIT.foam,l0=PIT.milk,iv=setInterval(()=>puff(PIT.x+rnd(-26,26),PIT.y-128,{r:6,dy:-90}),90);
    await Promise.all([PIT.to({y:PIT.y+12},620,E.io),anim(1150,t=>setMilk(lerp(l0,l0+.12,t),lerp(f0,i/3,t)),E.lin)]);
    clearInterval(iv);anim(200,t=>knob.setAttribute('transform',`rotate(${90*(1-t)} 1060 264)`),E.out);SFX.star(i-1);
    Panel.hint('<em>스팀완드</em>를 눌러 공기를 넣어요 <em>('+i+'/3)</em>');await sleep(280);hit.style.display='';
  }
  hit.style.display='none';await toast('거품이 풍부해요!',null,1000);
  $('#resid').style.display='';$('#resid').style.opacity=1;
  await PIT.to({y:PIT.y+26},260,E.io);await PIT.hop(P.pitHome.x,P.pitHome.y,560,50,.06);
}
function wipe(){return new Promise(res=>{const el=$('#cloth'),home={...P.clothHome},NEED=300;let g=null,acc=0,done=false;
  Panel.hint('<em>행주</em>로 스팀완드를 문질러 닦아요');zone(1122,404,50,88);Guide.drag({x:CL.x,y:CL.y},{x:1122,y:400});
  const on=()=>{const ax=1110,ay=320,bx=1132,by=474,t=clamp(((CL.x-ax)*(bx-ax)+(CL.y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2),0,1);return Math.hypot(CL.x-(ax+t*(bx-ax)),CL.y-(ay+t*(by-ay)))<64};
  const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}const p=spt(e);g={dx:p.x-CL.x,dy:p.y-CL.y,lx:p.x,ly:p.y};Guide.pause();SFX.pick()};
  const mv=e=>{if(!g||done)return;const p=spt(e),d=Math.hypot(p.x-g.lx,p.y-g.ly);g.lx=p.x;g.ly=p.y;CL.set({x:p.x-g.dx,y:p.y-g.dy});const o=on();zoneEl.classList.toggle('near',o);
    if(o){acc+=d;const k=clamp(acc/NEED,0,1);$('#resid').style.opacity=1-k;if(Math.random()<.12)sparkle(CL.x,CL.y,1);if(k>=1){done=true;fin()}}};
  const up=()=>{if(!g||done)return;g=null;zoneEl.classList.remove('near');CL.to({...home,r:0},380,E.back).then(()=>{if(!done)Guide.resume()})};
  const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
  async function fin(){off();zone();Guide.stop();$('#resid').style.display='none';sparkle(1124,420,8);SFX.ok();floatText(1250,400,'반짝!');await CL.to({...home,r:0},420,E.io);res()}
  el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)})}
async function pourMilk(){
  const top={x:P.saucer.x,y:P.saucer.y-104};
  Panel.hint('<em>우유 피쳐</em>를 머그컵으로 가져가요');zone(top.x,top.y-6,74,54);Guide.drag({x:PIT.x,y:PIT.y-60},{x:top.x+40,y:top.y-10});
  await drag(PIT,$('#pitF'),{zone:{x:top.x,y:top.y,r:88},anchor:()=>({x:PIT.x-74,y:PIT.y-138})});
  Panel.hint('우유를 <em>천천히</em> 부어요');await PIT.to({...P.pitPour,r:0,sx:1,sy:1},300,E.io);await PIT.to({r:-50},420,E.io);
  const st0=mk('path',{fill:'none',stroke:'#cdbfae','stroke-width':15,'stroke-linecap':'round'}),st=mk('path',{fill:'none',stroke:'#fffdf6','stroke-width':10,'stroke-linecap':'round'}),sx=P.saucer.x+16,sy=P.saucer.y-104-48,snd=SFX.pour();
  const L0=cup.s.L,m0=PIT.milk,f0=PIT.foam;
  await anim(2100,(t,p)=>{const L=lerp(L0,.95,clamp(t/.8,0,1)),fo=clamp((t-.45)/.55,0,1);
    setCup(cup,{L,ring:mix(cup.s.ring,'#b8804c',.08),core:mix('#7a4a28','#fffdf8',clamp(t*1.6,0,1)),coreK:lerp(.3,.8,clamp(t*1.3,0,1)),foam:fo});
    setMilk(lerp(m0,.35,t),lerp(f0,.3,t));
    const y1=surfY(cup),w=p>.93?10*(1-p)/.07:10;const dd=`M${sx} ${sy}Q${sx-8+Math.sin(p*40)*1.5} ${lerp(sy,y1,.5)} ${P.saucer.x+4} ${y1}`;st.setAttribute('stroke-width',Math.max(w,.1));st.setAttribute('d',dd);st0.setAttribute('stroke-width',Math.max(w+5,.1));st0.setAttribute('d',dd)},E.lin);
  st.remove();st0.remove();snd.stop();
  await PIT.to({r:0},340,E.io);await PIT.hop(P.pitHome.x,P.pitHome.y,480,30,.06);
  SFX.great();sparkle(P.saucer.x,P.saucer.y-130,9);await toast('카푸치노 완성!',null,1100);
}
async function make(menu){
  const want=menu==='카푸치노'?'mug':'demi';let cupOK=true;
  Panel.hint('<em>'+menu+'</em>에 맞는 잔을 골라서 눌러요');
  for(;;){const c=await pickCup();if(c.kind===want){cup=c;break}
    cupOK=false;SFX.no();await c.sp.to({r:-7},70);await c.sp.to({r:7},110);await c.sp.to({r:0},90);
    Panel.hint(menu+'는 <em>'+(want==='mug'?'머그컵':'데미타세 잔')+'</em>에 담아요. 다시 골라요')}
  SFX.pick();await cup.sp.to({y:cup.sp.y-30},160,E.out);await cup.sp.hop(P.tray.x,P.tray.y,620,90);SFX.clink();
  await grindTamp();await lockPF();
  const timeOK=await brew();
  Panel.hint('잔을 <em>받침</em>으로 옮겨요');zone(P.saucer.x,P.saucer.y-20,84,60);Guide.drag({x:cup.sp.x,y:cup.sp.y-30},{x:P.saucer.x,y:P.saucer.y-30});
  await drag(cup.sp,cup.g,{zone:{x:P.saucer.x,y:P.saucer.y,r:100}});
  await cup.sp.to({...P.saucer,r:0,sx:1,sy:1},220,E.back);SFX.clink();await cup.sp.squash(.06);
  if(want==='mug'){await steamMilk();await wipe();await pourMilk()}
  Panel.hint('완성! <em>잔을 눌러</em> 손님께 가져가요');Guide.tap({x:cup.sp.x,y:cup.sp.y-40});cup.inner.classList.add('pickme');
  await tap(cup.g);Guide.stop();cup.inner.classList.remove('pickme');SFX.pick();await cup.sp.to({y:cup.sp.y-36,sx:1.08,sy:1.08},220,E.out);
  return{cupOK,timeOK};
}

/* ================= 손님 ================= */
const CUSTS=[
  {kind:'bear',name:'모카',fur:'#c9905f',fur2:'#f6dcbb',ear:'#8f5c38',top:'#ff8a73',top2:'#ffb3a3',acc:'#fff7ea',pitch:.8},
  {kind:'rabbit',name:'보리',fur:'#fbf3ea',fur2:'#ffffff',ear:'#ffc2c7',top:'#7fb8d8',top2:'#aad3ea',acc:'#ff8a73',pitch:1.4},
  {kind:'cat',name:'라떼',fur:'#f3b56d',fur2:'#fde6c4',ear:'#ffc2c7',ear2:'#d98f45',top:'#7fbf9a',top2:'#a8d9bd',acc:'#4a2c22',pitch:1.2},
  {kind:'dog',name:'콩이',fur:'#f1dcb6',fur2:'#fff6e6',ear:'#9b6a45',top:'#f6c667',top2:'#fbdf9f',acc:'#d9534f',pitch:1}];
function customerSVG(c){
  const bodyD='M-160 30C-164 -66 -130 -150 -62 -170C-22 -180 22 -180 62 -170C130 -150 164 -66 160 30Z';
  let earsB='',earsF='',extra='',accH='',accB='';
  if(c.kind==='bear'){earsB=`<circle cx="-94" cy="-86" r="40" fill="${c.fur}" class="o"/><circle cx="-94" cy="-86" r="20" fill="${c.ear}"/><circle cx="94" cy="-86" r="40" fill="${c.fur}" class="o"/><circle cx="94" cy="-86" r="20" fill="${c.ear}"/>`;
    accB=`<path d="M-76 -188C-40 -160 40 -160 76 -188L86 -150C40 -118 -40 -118 -86 -150Z" fill="${c.acc}" class="o"/><path d="M34 -132L46 -56L82 -62L68 -138Z" fill="${c.acc}" class="o"/><path d="M42 -100L74 -106M46 -80L78 -86" stroke="${c.top}" stroke-width="6" stroke-linecap="round"/>`}
  if(c.kind==='rabbit'){earsB=`<g transform="rotate(-9 -54 -90)"><ellipse cx="-54" cy="-176" rx="33" ry="94" fill="${c.fur}" class="o"/><ellipse cx="-54" cy="-168" rx="14" ry="66" fill="${c.ear}"/></g><g transform="rotate(13 54 -90)"><ellipse cx="54" cy="-176" rx="33" ry="94" fill="${c.fur}" class="o"/><ellipse cx="54" cy="-168" rx="14" ry="66" fill="${c.ear}"/></g>`;
    accH=`<g transform="translate(70 -98) rotate(14)"><path d="M0 0L-36 -22V22Z" fill="${c.acc}" class="o4"/><path d="M0 0L36 -22V22Z" fill="${c.acc}" class="o4"/><circle r="11" fill="${c.acc}" class="o4"/></g>`}
  if(c.kind==='cat'){earsB=`<path d="M-120 -44L-106 -152L-34 -100Z" fill="${c.fur}" class="o"/><path d="M-102 -72L-97 -124L-60 -98Z" fill="${c.ear}"/><path d="M120 -44L106 -152L34 -100Z" fill="${c.fur}" class="o"/><path d="M102 -72L97 -124L60 -98Z" fill="${c.ear}"/>`;
    extra=`<path d="M-18 -106V-84M0 -110V-84M18 -106V-84" stroke="${c.ear2}" stroke-width="9" stroke-linecap="round"/><path d="M-74 40L-128 30M-74 54L-126 62M74 40L128 30M74 54L126 62" class="o3 nf"/>`;
    accH=`<circle cx="-50" cy="-10" r="28" fill="#fff" fill-opacity=".3" class="o4"/><circle cx="50" cy="-10" r="28" fill="#fff" fill-opacity=".3" class="o4"/><path d="M-22 -14Q0 -24 22 -14" class="o4 nf"/>`}
  if(c.kind==='dog'){earsF=`<path d="M-100 -80C-160 -86 -184 0 -158 58C-142 88 -108 68 -102 22Z" fill="${c.ear}" class="o"/><path d="M100 -80C160 -86 184 0 158 58C142 88 108 68 102 22Z" fill="${c.ear}" class="o"/>`;
    accH=`<g transform="rotate(-8)"><path d="M-6 -138V-154" class="o nf"/><ellipse cx="-6" cy="-104" rx="94" ry="34" fill="${c.acc}" class="o"/><path d="M-70 -110Q-40 -128 0 -128" stroke="#fff" stroke-width="6" opacity=".35" fill="none" stroke-linecap="round"/></g>`}
  const body=`
  <clipPath id="clB"><path d="${bodyD}"/></clipPath>
  <path d="${bodyD}" fill="${c.top}" class="o"/>
  <g clip-path="url(#clB)"><path d="M-170 -70H170M-170 -22H170" stroke="${c.top2}" stroke-width="18"/><path d="M-170 -138Q-150 -60 -150 30" stroke="#fff" stroke-width="12" opacity=".25" fill="none"/></g>
  <path d="${bodyD}" class="o nf"/>
  ${accB||`<path d="M-56 -172Q0 -140 56 -172" stroke="#fff7ea" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M-62 -178Q0 -134 62 -178" class="o4 nf" opacity=".0"/>`}
  <g transform="translate(0 -292)"><g class="bob">${earsB}
    <ellipse cx="0" cy="0" rx="130" ry="114" fill="${c.fur}" class="o"/>${extra}
    <ellipse cx="0" cy="38" rx="62" ry="46" fill="${c.fur2}"/>
    <ellipse cx="-86" cy="30" rx="22" ry="13" fill="#ff9aa2" opacity=".6"/><ellipse cx="86" cy="30" rx="22" ry="13" fill="#ff9aa2" opacity=".6"/>
    <g class="eOpen"><g class="blink"><circle cx="-50" cy="-10" r="13" fill="#4a2c22"/><circle cx="-54" cy="-15" r="4.5" fill="#fff"/><circle cx="50" cy="-10" r="13" fill="#4a2c22"/><circle cx="46" cy="-15" r="4.5" fill="#fff"/></g></g>
    <path class="eHappy o nf" d="M-66 -6Q-50 -26 -34 -6M34 -6Q50 -26 66 -6" style="display:none"/>
    <path d="M-12 14Q0 7 12 14Q9 28 0 30Q-9 28 -12 14Z" fill="#4a2c22"/>
    <path class="mSmile o4 nf" d="M0 30V40M-21 40Q-10 55 0 40Q10 55 21 40"/>
    <g class="mOpen" style="display:none"><path d="M0 30V38" class="o4 nf"/><ellipse cx="0" cy="50" rx="14" ry="13" fill="#7a2f2a" class="o4"/><ellipse cx="0" cy="56" rx="8" ry="5" fill="#ff8f8f"/></g>
    <g class="mHappy" style="display:none"><path d="M0 30V36" class="o4 nf"/><path d="M-24 38Q0 74 24 38Z" fill="#7a2f2a" class="o4"/><path d="M-10 54Q0 48 10 54Q6 62 0 62Q-6 62 -10 54Z" fill="#ff8f8f"/></g>
    ${earsF}${accH}</g></g>`;
  const arm=s=>`<g transform="scale(${s} 1)"><path d="M-150 -14C-156 10 -144 26 -128 28L-86 28C-72 26 -66 10 -72 -14Z" fill="${c.top}" class="o"/><path d="M-146 12Q-108 22 -74 12" stroke="${c.top2}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <ellipse cx="-107" cy="40" rx="31" ry="19" fill="${c.fur}" class="o"/><path d="M-118 34v9M-107 32v11M-96 34v9" class="o3 nf" opacity=".5"/></g>`;
  const paws=arm(1)+arm(-1);
  return{body,paws}}
const CU=new Sp([$('#custBody'),$('#custPaws')],2000,606);let cur=null,srv=null,srvCup=null;
function buildCustomer(c){cur=c;const s=customerSVG(c);$('#custBody').innerHTML=s.body;$('#custPaws').innerHTML=s.paws;face('idle')}
function face(m){const b=$('#custBody'),q=(s,v)=>{const e=$(s,b);if(e)e.style.display=v?'':'none'};
  q('.mSmile',m==='idle');q('.mOpen',m==='talk');q('.mHappy',m==='happy');q('.eOpen',m!=='happy');q('.eHappy',m==='happy')}
async function talk(text){let on=true,f=0;const iv=setInterval(()=>{if(on)face((f++)%2?'idle':'talk')},150);await tts(text,cur.pitch);on=false;clearInterval(iv);face('idle')}
async function enter(){CU.set({x:2000,y:606,r:0,sx:1,sy:1});SFX.bell();
  await anim(1500,(t,p)=>{CU.x=lerp(2000,760,t);CU.y=606-Math.abs(Math.sin(p*Math.PI*5))*14*(1-p*.4);CU.r=Math.sin(p*Math.PI*5)*2.2*(1-p);CU.set()},E.out);CU.set({y:606,r:0});await CU.squash(.05)}
async function happy(){face('happy');SFX.great();for(let i=0;i<3;i++)setTimeout(()=>heart(760+rnd(-90,90),300),i*160);
  for(let i=0;i<2;i++){await CU.to({y:580},150,E.out);await CU.to({y:606},170,t=>t*t);await CU.squash(.05)}}
async function leave(){face('happy');if(srv)await srv.hop(900,640,360,50,0);
  await anim(1400,(t,p)=>{CU.x=lerp(760,-320,t);CU.y=606-Math.abs(Math.sin(p*Math.PI*5))*14;CU.r=-Math.sin(p*Math.PI*5)*2.2;CU.set();if(srv)srv.set({x:CU.x+140,y:640+(CU.y-606)})},t=>t*t);
  $('#servedL').innerHTML='';srv=null}
async function serveFront(){
  const L=$('#servedL');L.innerHTML='<g id="srvG"><ellipse cx="0" cy="8" rx="92" ry="10" fill="#4a2c22" opacity=".14"/><ellipse cx="0" cy="2" rx="80" ry="15" fill="#fffaf2" class="o4"/><ellipse cx="0" cy="0" rx="46" ry="8" fill="#efe4d6"/><g id="srvC"></g></g>';
  srvCup=makeCup(cup.kind,'s',$('#srvC'));srvCup.sp.set({x:0,y:-2});setCup(srvCup,{...cup.s});
  srv=new Sp($('#srvG'),1760,640);stage.classList.remove('st');await sleep(700);await srv.hop(1070,640,560,70,.07);SFX.clink()}

/* ================= 진행 ================= */
const END=['','오늘 연습 고마워요. 또 만나요','조금 아쉬워요. 다음엔 더 잘할 거예요','괜찮아요. 잘 마셨어요','맛있어요. 고마워요','정말 맛있어요! 또 올게요'];
const setScore=()=>{$('#score').innerHTML=IC.star+'<span>'+total+'</span>'};
async function round(){
  const c=CUSTS[served%CUSTS.length],menu=forced||(Math.random()<.5?'에스프레소':'카푸치노');
  Guide.delay=served?2600:350;resetStation();buildCustomer(c);$('#order').hidden=true;Bubble.hide();Panel.hide();
  await enter();
  let s=await sayLine('어서 오세요.');
  Bubble.show(c.name+' 손님',menu+' 한 잔 주세요.');SFX.pop();await talk(menu+' 한 잔 주세요.');
  s+=await sayLine(menu+' 한 잔 주문하셨습니다.');
  $('#order').innerHTML='주문 <b>'+menu+'</b>';$('#order').hidden=false;
  Bubble.hide();Panel.hide();stage.classList.add('st');await sleep(900);
  const m=await make(menu);
  Panel.hide();await serveFront();
  s+=await sayLine('주문하신 '+menu+' 나왔습니다. 맛있게 드세요.');
  Bubble.show(c.name+' 손님','잘 마실게요!');SFX.pop();happy();await talk('잘 마실게요!');face('happy');
  s+=await sayLine('감사합니다. 안녕히 가세요.');
  const n=clamp(Math.round(s/6)+(m.cupOK?1:0)+(m.timeOK?1:0)+1,1,5);total+=n;served++;
  Bubble.show(c.name+' 손님','<div class="stars">'+[0,1,2,3,4].map(i=>i<n?IC.star:IC.starOff).join('')+'</div><div class="sm">'+END[n]+'</div>');
  for(let i=0;i<n;i++)setTimeout(()=>SFX.star(i),i*130);setScore();$('#order').hidden=true;
  Panel.show('',n>=4?'잘했어요! 다음 손님을 맞이해요':'다음 손님에게 다시 도전해요','next','다음 손님');await Panel.click();
  Bubble.hide();Panel.hide();await leave();
}
setScore();
const snd=$('#snd');snd.innerHTML=IC.sndOn;snd.onclick=()=>{SFX.mute(!SFX.muted);snd.innerHTML=SFX.muted?IC.sndOff:IC.sndOn;if(!SFX.muted)SFX.pick()};
resetStation();buildCustomer(CUSTS[0]);CU.set({x:760,y:606});
window.__game={P,PF,TAMP,PIT,CL,CU,get cup(){return cup},get cups(){return cups}};
$('#go').onclick=async()=>{SFX.unlock();SFX.ok();$('#title').classList.add('off');CU.set({x:2000});await sleep(350);for(;;)await round()};
})();
