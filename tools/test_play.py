import asyncio, sys, json
from playwright.async_api import async_playwright
import os; S=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MENU=sys.argv[1] if len(sys.argv)>1 else 'cap'
MODE=sys.argv[2] if len(sys.argv)>2 else 'good'     # good | over | early
VW=int(sys.argv[3]) if len(sys.argv)>3 else 1280
VH=int(sys.argv[4]) if len(sys.argv)>4 else 720
TAG=sys.argv[5] if len(sys.argv)>5 else MENU
MOCK="""window.SpeechRecognition=class{start(){setTimeout(()=>{const t=document.querySelector('#ptext').cloneNode(true);t.querySelectorAll('small').forEach(s=>s.remove());this.onresult&&this.onresult({results:[[{transcript:t.textContent}]]});this.onend&&this.onend()},250)}};"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':VW,'height':VH}); pg=await ctx.new_page()
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append('console:'+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    await pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await pg.add_init_script(MOCK)
    await pg.goto('file://'+S+'/index.html#'+MENU)
    await pg.wait_for_timeout(500)
    n=[0]
    async def shot(name):
      n[0]+=1; await pg.screenshot(path=f'{S}/tools/shots/{TAG}_{n[0]:02d}_{name}.png')
    async def cl(x,y):
      return await pg.evaluate("([x,y])=>{const m=document.querySelector('#station').getScreenCTM();return [m.a*x+m.e,m.d*y+m.f]}",[x,y])
    async def G(expr): return await pg.evaluate('()=>{const g=window.__game;return '+expr+'}')
    async def drag(x0,y0,x1,y1,steps=14,hold=0):
      a=await cl(x0,y0); c=await cl(x1,y1); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(120)
      await pg.mouse.move(*c,steps=steps); await pg.wait_for_timeout(hold); 
    async def click(x,y):
      a=await cl(x,y); await pg.mouse.click(*a)
    await shot('title'); await pg.click('#go')
    log=[]; done=set(); brewN=0; t_end=asyncio.get_event_loop().time()+150
    while asyncio.get_event_loop().time()<t_end:
      await pg.wait_for_timeout(200)
      st=await pg.evaluate("()=>({h:document.querySelector('#ptext').innerText,off:document.querySelector('#panel').classList.contains('off'),btn:document.querySelector('#pbtn').className,bh:document.querySelector('#pbtn').hidden,stn:document.querySelector('#stage').classList.contains('st'),bub:document.querySelector('#btext').innerText,boff:document.querySelector('#bubble').classList.contains('off')})")
      h=st['h']
      if st['off']: continue
      if not st['bh'] and 'mic' in st['btn'] and 'listening' not in st['btn']:
        k='say:'+h
        if k not in done: done.add(k); await pg.wait_for_timeout(350); await shot('say')
        await pg.click('#pbtn'); await pg.wait_for_timeout(1900); log.append('say '+h[:14]); continue
      if not st['bh'] and 'next' in st['btn']:
        await pg.wait_for_timeout(700); await shot('rating'); log.append('END '+st['bub'].replace('\n',' ')); break
      if '잔을 골라서' in h and 'pick' not in done:
        done.add('pick'); await pg.wait_for_timeout(600); await shot('pickcup')
        if MODE=='over': 
          wrong='demi' if MENU=='cap' else 'mug'; x=await G(f"g.P.tops.{wrong}[0]"); await click(x,120); await pg.wait_for_timeout(700)
        kind='mug' if MENU=='cap' else 'demi'; x=await G(f"g.P.tops.{kind}[0]"); await click(x,120); log.append('pick'); await pg.wait_for_timeout(1300); continue
      if '그라인더로' in h and 'pf1' not in done:
        done.add('pf1'); await pg.wait_for_timeout(900); await shot('pf_guide')
        x,y=await G('[g.PF.x,g.PF.y]'); await drag(x,y+20,300,500); await shot('pf_dragging'); c=await cl(205,504); await pg.mouse.move(*c,steps=8); await pg.mouse.up(); log.append('pf>grinder'); await pg.wait_for_timeout(500); continue
      if '꾹 누르고' in h and 'grind' not in done:
        done.add('grind'); a=await cl(205,362); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(1300); await shot('grinding'); await pg.wait_for_timeout(1500); await pg.mouse.up(); log.append('grind'); await pg.wait_for_timeout(600); continue
      if '탬퍼' in h and 'tamp' not in done:
        done.add('tamp'); await pg.wait_for_timeout(1300); await shot('tamp_ready')
        x,y=await G('[g.TAMP.x,g.TAMP.y]'); a=await cl(x,y-40); await pg.mouse.move(*a); await pg.mouse.down(); c=await cl(x,y-40+34); await pg.mouse.move(*c,steps=6); await shot('tamp_mid'); c=await cl(x,y-40+130); await pg.mouse.move(*c,steps=8); await pg.mouse.up(); log.append('tamp'); await pg.wait_for_timeout(300); await shot('tamp_done'); await pg.wait_for_timeout(1200); continue
      if '머신에 끼워요' in h and 'lock' not in done:
        done.add('lock'); await pg.wait_for_timeout(500); x,y=await G('[g.PF.x,g.PF.y]'); await drag(x,y+20,780,374); await pg.mouse.up(); log.append('lock'); await pg.wait_for_timeout(700); await shot('locked'); continue
      if '추출 버튼을 눌러요' in h:
        brewN+=1; await pg.wait_for_timeout(500); await click(962,236); mode=MODE if brewN==1 else 'good'
        target={'good':24,'over':47,'early':9}[mode]
        while True:
          await pg.wait_for_timeout(120); t=await pg.evaluate("()=>parseInt(document.querySelector('#tDig').textContent)")
          if mode=='good' and t>=12 and ('b12',brewN) not in done: done.add(('b12',brewN)); await shot('brew12')
          if mode=='over' and t>=44 and 'ov' not in done: done.add('ov'); await shot('overflow')
          if t>=target: break
        await shot('brew_stop_'+mode); await click(962,236); log.append(f'brew {mode} {t}'); await pg.wait_for_timeout(400 if mode=='good' else 1700)
        if mode!='good': await shot('dump')
        await pg.wait_for_timeout(1200); continue
      if '받침' in h and 'sauc' not in done:
        done.add('sauc'); await pg.wait_for_timeout(400); x,y=await G('[g.cup.sp.x,g.cup.sp.y]'); await drag(x,y-30,1000,520); await shot('cup_drag'); c=await cl(1305,572); await pg.mouse.move(*c,steps=8); await pg.mouse.up(); log.append('cup>saucer'); await pg.wait_for_timeout(800); await shot('on_saucer'); continue
      if '스팀완드에 끼워요' in h and 'pw' not in done:
        done.add('pw'); await pg.wait_for_timeout(400); x,y=await G('[g.PIT.x,g.PIT.y]'); await drag(x,y-60,1132,490); await pg.mouse.up(); log.append('pit>wand'); await pg.wait_for_timeout(700); await shot('pit_wand'); continue
      if '공기를 넣어요' in h:
        vis=await pg.evaluate("()=>document.querySelector('#wandHit').style.display!=='none'")
        if not vis: continue
        await click(1060,264); await pg.wait_for_timeout(650); await shot('steam'); log.append('steam'); await pg.wait_for_timeout(900); continue
      if '행주' in h and 'wipe' not in done:
        done.add('wipe'); await pg.wait_for_timeout(1500); await shot('wipe_guide'); x,y=await G('[g.CL.x,g.CL.y]'); await drag(x,y,1122,440)
        for i in range(4):
          c=await cl(1114,350); await pg.mouse.move(*c,steps=5); 
          if i==1: await shot('wiping')
          c=await cl(1128,450); await pg.mouse.move(*c,steps=5)
        await pg.mouse.up(); log.append('wipe'); await pg.wait_for_timeout(900); continue
      if '머그컵으로' in h and 'pour' not in done:
        done.add('pour'); await pg.wait_for_timeout(400); x,y=await G('[g.PIT.x,g.PIT.y]'); await drag(x,y-60,x-100,y-90); await pg.mouse.up(); log.append('pour'); await pg.wait_for_timeout(1700); await shot('pouring'); await pg.wait_for_timeout(2600); continue
      if '완성!' in h and 'fin' not in done:
        done.add('fin'); await pg.wait_for_timeout(900); await shot('finished'); x,y=await G('[g.cup.sp.x,g.cup.sp.y]'); await click(x,y-30); log.append('serve'); await pg.wait_for_timeout(1900); await shot('served'); continue
    print(TAG,'|',' > '.join(log)); print('errors:',errs[:6]); print('speech:',await pg.evaluate('()=>JSON.stringify(window.__speechLog.map(x=>x.score))'))
    await b.close()
asyncio.run(main())
