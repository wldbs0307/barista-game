"""준비 과정 / 정리를 처음부터 끝까지 마우스로 플레이하고 캡처한다.
python3 tools/test_pc.py prep|clean [가로] [세로] [이름표]"""
import asyncio, sys, os
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODE=sys.argv[1] if len(sys.argv)>1 else 'prep'
VW=int(sys.argv[2]) if len(sys.argv)>2 else 1280
VH=int(sys.argv[3]) if len(sys.argv)>3 else 720
TAG=sys.argv[4] if len(sys.argv)>4 else MODE[0]
SH=R+'/tools/shots'; os.makedirs(SH,exist_ok=True)
MOCK="""window.SpeechRecognition=class{start(){setTimeout(()=>{const t=document.querySelector('#ptext').cloneNode(true);t.querySelectorAll('small').forEach(s=>s.remove());const R=[{transcript:t.textContent}];R.isFinal=true;this.onresult&&this.onresult({resultIndex:0,results:[R]});this.onend&&this.onend()},200)}};"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await (await b.new_context(viewport={'width':VW,'height':VH})).new_page()
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await pg.add_init_script(MOCK)
    await pg.goto('file://'+R+'/index.html'); await pg.wait_for_timeout(400)
    n=[0]
    async def shot(name):
      n[0]+=1; await pg.screenshot(path=f'{SH}/{TAG}_{n[0]:02d}_{name}.png')
    async def cl(x,y,svg='station'):
      return await pg.evaluate("([x,y,s])=>{const m=document.querySelector('#'+s).getScreenCTM();return [m.a*x+m.e,m.d*y+m.f]}",[x,y,svg])
    async def drag(x0,y0,x1,y1,svg='station',steps=12):
      a=await cl(x0,y0,svg); c=await cl(x1,y1,svg); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(80)
      await pg.mouse.move(*c,steps=steps); await pg.mouse.up()
    async def click(x,y,svg='station'):
      a=await cl(x,y,svg); await pg.mouse.click(*a)
    async def hold(x,y,ms,svg='station'):
      a=await cl(x,y,svg); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(ms); await pg.mouse.up()
    await shot('title'); await pg.click('#goPrep' if MODE=='prep' else '#goClean')
    log=[]; t_end=asyncio.get_event_loop().time()+300; last_step=''; same=0; last_task=None
    while asyncio.get_event_loop().time()<t_end:
      await pg.wait_for_timeout(250)
      if await pg.evaluate("()=>!document.querySelector('#result').classList.contains('off')"):
        await pg.wait_for_timeout(700); await shot('result'); log.append('RESULT: '+(await pg.inner_text('#rlist')).replace('\n',' | ')); break
      st=await pg.evaluate("()=>({h:document.querySelector('#ptext').innerText,off:document.querySelector('#panel').classList.contains('off'),btn:document.querySelector('#pbtn').className,bh:document.querySelector('#pbtn').hidden,step:document.querySelector('#step').innerText,task:window.__pc.task})")
      if st['step']!=last_step:
        last_step=st['step']; await pg.wait_for_timeout(500); await shot('step'); log.append('== '+last_step.replace('\n',' '))
      if st['off']: continue
      h=st['h']
      if not st['bh'] and 'mic' in st['btn'] and 'listening' not in st['btn']:
        await pg.wait_for_timeout(250); await shot('say'); await pg.click('#pbtn'); await pg.wait_for_timeout(1600); log.append('say:'+h.split('\n')[0][:14]); continue
      if '왼쪽으로 돌려서' in h:
        x,y=await pg.evaluate('()=>[__game.PF.x,__game.PF.y]'); await drag(x+150,y+28,x-130,y+28); log.append('twist out'); await pg.wait_for_timeout(900); continue
      if '오른쪽으로 돌려서' in h:
        await pg.wait_for_timeout(300); x,y=await pg.evaluate('()=>[__game.PF.x,__game.PF.y]'); await drag(x-120,y+28,x+180,y+28); log.append('twist in'); await pg.wait_for_timeout(900); continue
      t=st['task']
      if not t: continue
      key=str(t);
      if key==last_task: same+=1
      else: same=0; last_task=key
      if same>12: log.append('STUCK '+key+' | '+h); await shot('stuck'); break
      k=t['kind']; sv=t.get('svg','station'); a=t.get('a'); bb=t.get('b')
      if k=='drag':
        await pg.wait_for_timeout(250); await drag(a['x'],a['y'],bb['x'],bb['y'],sv); log.append(f"drag {int(a['x'])},{int(a['y'])}>{int(bb['x'])},{int(bb['y'])}"); await pg.wait_for_timeout(450)
      elif k=='tap':
        await pg.wait_for_timeout(250); await click(a['x'],a['y'],sv); log.append(f"tap {int(a['x'])},{int(a['y'])}"); await pg.wait_for_timeout(500)
      elif k=='hold':
        await hold(a['x'],a['y'],t.get('ms',2000),sv); log.append('hold'); await pg.wait_for_timeout(600)
      elif k=='fill':
        await hold(a['x'],a['y'],1650,sv); log.append('fill'); await pg.wait_for_timeout(500)
      elif k=='choose':
        await pg.wait_for_timeout(600); await shot('milk'); c=t[t['answer']]; await click(c['x'],c['y'],sv); log.append('choose '+t['answer']); await pg.wait_for_timeout(800)
      elif k=='rub':
        rx,ry=t['rx'],t['ry']; s=await cl(a['x'],a['y']); await pg.mouse.move(*s); await pg.mouse.down(); await pg.wait_for_timeout(60)
        c=await cl(bb['x'],bb['y']); await pg.mouse.move(*c,steps=8)
        for i in range(6):
          for f in (-.85,.85):
            c=await cl(bb['x']+rx*f,bb['y']+ry*(.35 if i%2 else -.35)); await pg.mouse.move(*c,steps=10)
          if i==1: await shot('rub')
          if not await pg.evaluate('()=>!!window.__pc.task'): break
        await pg.mouse.up(); log.append('rub'); await pg.wait_for_timeout(700)
      elif k=='brush':
        a2=await cl(1206,652); await pg.mouse.move(*a2); await pg.mouse.down()
        for kk in range(3):
          for x in (1180,1220,1260,1300,1340,1390,1420):
            c=await cl(x-44,606+(kk*10)); await pg.mouse.move(*c,steps=3)
          for x in (1420,1370,1320,1270,1230,1190):
            c=await cl(x-44,620+(kk*6)); await pg.mouse.move(*c,steps=3)
        await pg.mouse.up(); log.append('brush'); await pg.wait_for_timeout(900)
    print('\n'.join(log)); print('ERRORS:',errs)
    print('speech:',await pg.evaluate('()=>window.__speechLog.length'))
    await b.close()
asyncio.run(main())
