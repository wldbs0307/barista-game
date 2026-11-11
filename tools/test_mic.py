import asyncio, sys
from playwright.async_api import async_playwright
import os; S=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODE=sys.argv[1]
MOCK_OK="""window.__d={starts:0,active:[],opts:[]};
window.claude={use:(n)=>Promise.resolve(n==='dictation'?(()=>{let F=[],Pt=[],St=[];return {
 start(o){window.__d.starts++;window.__d.opts.push(JSON.stringify(o));window.__d.active.push(navigator.userActivation?navigator.userActivation.isActive:null);
   return new Promise(res=>setTimeout(()=>{res();St.forEach(f=>f({state:'listening'}));const t=document.querySelector('#ptext').cloneNode(true);t.querySelectorAll('small').forEach(s=>s.remove());const txt=t.textContent;
     setTimeout(()=>Pt.forEach(f=>f({text:txt.slice(0,3)})),150);setTimeout(()=>{Pt.forEach(f=>f({text:''}));F.forEach(f=>f({text:' '+txt}))},400)},100))},
 stop(){return new Promise(r=>setTimeout(()=>{St.forEach(f=>f({state:'idle',reason:'stopped'}));r()},50))},active(){return false},
 onFinal(f){F.push(f);return()=>{F=F.filter(x=>x!==f)}},onPartial(f){Pt.push(f);return()=>{Pt=Pt.filter(x=>x!==f)}},onState(f){St.push(f);return()=>{St=St.filter(x=>x!==f)}}}})():null)};"""
MOCK_NO="""window.__d={starts:0};window.claude={use:(n)=>Promise.resolve({start(){window.__d.starts++;return Promise.reject({code:'not_granted',message:'no'})},stop(){return Promise.resolve()},active(){return false},onFinal(){return()=>{}},onPartial(){return()=>{}},onState(){return()=>{}}})};"""
MOCK_NONE=""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1280,'height':720})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await pg.add_init_script({'ok':MOCK_OK,'no':MOCK_NO,'none':"delete window.SpeechRecognition;delete window.webkitSpeechRecognition;Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined});"}[MODE])
    await pg.goto('file://'+S+'/index.html#esp'); await pg.wait_for_timeout(400); await pg.click('#go')
    out=[]
    for i in range(60):
      await pg.wait_for_timeout(250)
      st=await pg.evaluate("()=>({h:document.querySelector('#ptext').innerText.replace(/\\n/g,' / '),tag:document.querySelector('#ptag').textContent,off:document.querySelector('#panel').classList.contains('off'),btn:document.querySelector('#pbtn').className,bh:document.querySelector('#pbtn').hidden,stn:document.querySelector('#stage').classList.contains('st')})")
      if st['stn']: out.append('REACHED STATION'); break
      if st['off'] or st['bh']: continue
      key=st['tag']+'|'+st['h']+'|'+st['btn']
      if not out or out[-1]!=key: out.append(key)
      if 'listening' in st['btn']: continue
      await pg.click('#pbtn'); await pg.wait_for_timeout(300)
    for o in out: print('  ',o)
    print('dict:',await pg.evaluate('()=>JSON.stringify(window.__d||null)'),'| log:',await pg.evaluate('()=>JSON.stringify(window.__speechLog)'),'| errors:',errs)
    await b.close()
asyncio.run(main())
