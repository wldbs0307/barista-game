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
  hint(html){this.text.classList.remove('long');this.show('만들기',html,null)},hide(){this.el.classList.add('off')},
  click(){return new Promise(res=>{this.btn.onclick=()=>{this.btn.onclick=null;SFX.pick();res()}})}};
const Bubble={el:$('#bubble'),show(name,html){$('#bname').textContent=name;$('#btext').innerHTML=html;this.el.classList.remove('off')},hide(){this.el.classList.add('off')}};
async function toast(msg,stars,ms=1250){const t=$('#toast');t.innerHTML=(stars!=null?'<div class="stars">'+[0,1,2].map(i=>i<stars?IC.star:IC.starOff).join('')+'</div>':'')+'<div>'+msg+'</div>';
  t.classList.add('on');if(stars)for(let i=0;i<stars;i++)setTimeout(()=>SFX.star(i),80+i*120);await sleep(ms);t.classList.remove('on');await sleep(200)}

/* ================= 말하기 채점 (자모 유사도) ================= */
const TH=[.85,.65,.45],MSG=['','좋은 시도예요!','좋아요! 거의 다 됐어요','와, 아주 또렷해요!'];
const JL='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ',JV='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ',JF=' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
const KD='영일이삼사오육칠팔구',NAT={1:'한',2:'두',3:'세',4:'네'};
function kr(n){n=+n;if(!n)return '영';let s='';[[1000,'천'],[100,'백'],[10,'십']].forEach(([u,w])=>{const d=Math.floor(n/u);n%=u;if(d)s+=(d>1?KD[d]:'')+w});return s+(n?KD[n]:'')}
function norm(s){return String(s).replace(/(\d+)\s*(%|퍼센트|프로)/g,(m,n)=>kr(n)+'퍼센트').replace(/(\d+)\s*(ml|mL|ML|㎖|밀리리터|밀리|미리)/g,(m,n)=>kr(n)+'밀리리터')
  .replace(/(\d+)\s*잔/g,(m,n)=>(NAT[n]||kr(n))+'잔').replace(/\d+/g,n=>kr(n)).replace(/배전/g,'배전').toLowerCase()}
function jamo(s){const o=[];for(const ch of norm(s).replace(/[\s.,!?~]/g,'')){const n=ch.charCodeAt(0)-44032;if(n<0||n>11171){o.push(ch);continue}o.push(JL[n/588|0],JV[(n%588)/28|0]);if(n%28)o.push(JF[n%28])}return o}
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
/* 긴 문장: 말이 잠깐 끊겨도 이어서 듣고, 1.8초 동안 새 말이 없으면 끝낸다 */
function listenSR(){return new Promise(res=>{let done=false,to=0,quiet=0,fin_='',alts=[],part='';let r;
  const out=()=>{const a=[(fin_+' '+part).trim()];alts.forEach(x=>a.push((fin_.slice(0,fin_.length-x.base.length)+x.t+' '+part).trim()));return a.filter(Boolean)};
  const fin=v=>{if(!done){done=true;clearTimeout(to);clearTimeout(quiet);try{r&&r.stop()}catch(e){}res(v)}};
  const bad=w=>{Speech.srBad=true;Speech.why=w;fin(null)};
  try{r=new SR()}catch(e){return bad('nosr')}
  r.lang='ko-KR';r.maxAlternatives=3;r.interimResults=true;r.continuous=true;
  r.onresult=e=>{part='';for(let i=e.resultIndex;i<e.results.length;i++){const R=e.results[i];
      if(R.isFinal){const base=R[0].transcript;fin_+=' '+base;alts=[];for(let k=1;k<R.length;k++)alts.push({base,t:R[k].transcript})}else part+=R[0].transcript}
    clearTimeout(quiet);quiet=setTimeout(()=>fin(out()),1800)};
  r.onerror=e=>{Speech.lastErr=e.error;if(e.error==='not-allowed')bad('denied');else if(e.error==='service-not-allowed')bad('service');else if(e.error==='audio-capture')bad('nomic');else fin(out())};
  r.onend=()=>fin(out());to=setTimeout(()=>fin(out()),25000);
  try{r.start()}catch(e){Speech.srBad=true;fin(null)}})}
function listenDict(){const d=Speech.dict;return new Promise(res=>{let fin_='',part='',done=false,to=0,endT=0;const offs=[];
  const out=()=>[(fin_+' '+part).trim(),fin_.trim()].filter(Boolean);
  const fin=v=>{if(done)return;done=true;clearTimeout(to);clearTimeout(endT);offs.forEach(f=>{try{f()}catch(e){}});res(v)};
  const wrap=()=>{let p;try{p=d.stop()}catch(e){p=null}Promise.resolve(p).catch(()=>{}).then(()=>fin(out()))};
  try{offs.push(d.onFinal(e=>{fin_+=' '+e.text;part='';clearTimeout(endT);endT=setTimeout(wrap,1800)}));
    offs.push(d.onPartial(e=>{if(e.text)part=e.text}));
    d.start({language:'ko'}).then(()=>{to=setTimeout(wrap,25000);offs.push(d.onState(e=>{if(e.state==='idle')fin(out())}))},
      err=>{const c=err&&err.code;if(c==='dismissed'||c==='stopped'||c==='rate_limited'||c==='upstream_error')fin([]);else{Speech.dictBad=true;fin(null)}})}
  catch(e){Speech.dictBad=true;fin(null)}})}
/* 버튼을 누른 그 순간에 바로 불러야 한다 */
function listenNow(){if(Speech.dict&&!Speech.dictBad)return listenDict();if(SR&&!Speech.srBad)return listenSR();return Promise.resolve(null)}
function tts(text,pitch=1){return new Promise(res=>{let done=false;const fin=()=>{if(!done){done=true;res()}};const wait=900+text.length*110;
  try{const ss=window.speechSynthesis;if(!ss||SFX.muted)return setTimeout(fin,wait);ss.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';u.rate=.9;u.pitch=pitch;u.onend=fin;u.onerror=fin;ss.speak(u);setTimeout(fin,wait+1800)}
  catch(e){setTimeout(fin,wait)}})}
async function sayLine(target,tag='따라 말해요'){
  let tries=0;Panel.text.classList.toggle('long',target.length>34);Panel.show(tag,esc(target),'mic');
  for(;;){
    if(!canListen()){Panel.show('소리 내어 말해요',esc(target)+'<small>'+whyText()+'</small>','next','말했어요');await Panel.click();return 1}
    const heard=await new Promise(res=>{Panel.btn.onclick=()=>{Panel.btn.onclick=null;Panel.btn.classList.add('listening');Panel.tag.textContent='듣고 있어요';SFX.pick();res(listenNow())}});
    Panel.btn.classList.remove('listening');
    if(heard===null){Panel.show(tag,esc(target),'mic');continue}
    tries++;const s=Math.max(0,...heard.map(t=>sim(t,target)));Speech.log.push({target,heard,score:+s.toFixed(2)});
    const st=s>=TH[0]?3:s>=TH[1]?2:s>=TH[2]?1:0;
    if(st){await toast(MSG[st],st);return st}
    if(tries>=3){Panel.show('먼저 들어 봐요',esc(target),null);await tts(target);await toast('잘했어요. 다음으로 가요',1);return 1}
    SFX.no();Panel.show('다시 한 번',esc(target)+'<small>조금 더 크게, 또박또박 말해요</small>','mic')}
}

/* ================= 효과 ================= */
let fx=$('#fx');const fxF=$('#fxJ');
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
function shake(id='#station'){const s=$(id);s.classList.remove('shake');void s.getBoundingClientRect();s.classList.add('shake');setTimeout(()=>s.classList.remove('shake'),260)}

/* ================= 손가락 안내 ================= */
let handEl=$('#hand'),hand=new Sp(handEl);
const Guide={tok:0,last:null,delay:350,
  use(id){this.stop();handEl=$(id);hand=new Sp(handEl)},
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
const spt=(e,s=svgS)=>new DOMPoint(e.clientX,e.clientY).matrixTransform(s.getScreenCTM().inverse());
function tap(el){return new Promise(res=>{const h=()=>{el.removeEventListener('click',h);res()};el.addEventListener('click',h)})}
/* o.zones:[{x,y,r}] 중 하나에 놓으면 그 번호를 돌려준다. o.accept(i)가 거짓이면 o.reject(i) 후 되돌아감. o.tap(): 거의 안 움직이고 뗐을 때 */
function drag(spr,el,o){return new Promise(res=>{const zones=o.zones||[o.zone],sv=o.svg||svgS,B=o.bounds||[30,40,1570,870];let home={x:spr.x,y:spr.y,r:spr.r},base=[spr.sx,spr.sy];let g=null,ended=false;
  const anc=()=>o.anchor?o.anchor():spr,hit=()=>{const a=anc();for(let i=0;i<zones.length;i++){const z=zones[i];if(z&&!z.used&&Math.hypot(a.x-z.x,a.y-z.y)<z.r)return i}return -1};
  const dn=e=>{if(ended||(o.alive&&!o.alive()))return;e.preventDefault();e.stopPropagation();try{el.setPointerCapture(e.pointerId)}catch(_){}const p=spt(e,sv);home={x:spr.x,y:spr.y,r:spr.r};base=[spr.sx,spr.sy];g={dx:p.x-spr.x,dy:p.y-spr.y,lx:p.x,sx:p.x,sy:p.y,moved:false};Guide.pause();SFX.pick();spr.to({sx:base[0]*1.07,sy:base[1]*1.07},130,E.out)};
  const mv=e=>{if(!g)return;const p=spt(e,sv),vx=p.x-g.lx;g.lx=p.x;if(Math.hypot(p.x-g.sx,p.y-g.sy)>10)g.moved=true;if(!g.moved)return;spr.x=clamp(p.x-g.dx,B[0],B[2]);spr.y=clamp(p.y-g.dy,B[1],B[3]);spr.r=lerp(spr.r,home.r+clamp(vx*1.4,-13,13),.25);spr.set();if(zoneEl)zoneEl.classList.toggle('near',hit()>=0)};
  const back=()=>{SFX.back();if(zoneEl)zoneEl.classList.remove('near');spr.to({x:home.x,y:home.y,r:home.r,sx:base[0],sy:base[1]},420,E.back).then(()=>{if(!ended)Guide.resume()})};
  const up=()=>{if(!g)return;const moved=g.moved;g=null;
    if(!moved&&o.tap){spr.to({sx:base[0],sy:base[1]},150);o.tap();return}
    const i=hit();if(i<0)return back();
    if(o.accept&&!o.accept(i)){o.reject&&o.reject(i);return back()}
    ended=true;off();if(o.zones===undefined)zone();Guide.stop();res(i)};
  const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
  el.addEventListener('pointerdown',dn);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)})}
function hold(el,ms,onP,onState){return new Promise(res=>{let p=0,down=false,last=0,done=false;
  const dn=e=>{if(done)return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}down=true;onState(true);Guide.pause()};
  const up=()=>{if(!down)return;down=false;onState(false);if(!done)Guide.resume()};
  const ctx=e=>e.preventDefault();
  const off=()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('lostpointercapture',up);el.removeEventListener('contextmenu',ctx)};
  el.addEventListener('pointerdown',dn);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);el.addEventListener('contextmenu',ctx);
  const f=now=>{if(last&&down)p=Math.min(1,p+(now-last)/ms);last=now;onP(p,down);if(p>=1){done=true;if(down){down=false;onState(false)}off();Guide.stop();res();return}requestAnimationFrame(f)};requestAnimationFrame(f)})}