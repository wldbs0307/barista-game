"""에스프레소 단계를 처음부터 끝까지 마우스로 플레이하고 캡처한다.
python3 tools/test_esp.py [모드 good|early|over] [가로] [세로] [이름표]"""
import asyncio, sys, os
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODE=sys.argv[1] if len(sys.argv)>1 else 'good'
VW=int(sys.argv[2]) if len(sys.argv)>2 else 1280
VH=int(sys.argv[3]) if len(sys.argv)>3 else 720
TAG=sys.argv[4] if len(sys.argv)>4 else 'e_'+MODE
SH=R+'/tools/shots'; os.makedirs(SH,exist_ok=True)
MOCK="""window.SpeechRecognition=class{start(){setTimeout(()=>{const t=document.querySelector('#ptext').cloneNode(true);t.querySelectorAll('small').forEach(s=>s.remove());const R=[{transcript:t.textContent.replace('100%','백 퍼센트').replace('30ml','30 ml')}];R.isFinal=true;this.onresult&&this.onresult({resultIndex:0,results:[R]});this.onend&&this.onend()},200)}};"""
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
    async def G(e): return await pg.evaluate('()=>{const g=window.__game;return '+e+'}')
    async def drag(x0,y0,x1,y1,svg='station',up=True):
      a=await cl(x0,y0,svg); c=await cl(x1,y1,svg); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(80)
      await pg.mouse.move(*c,steps=12)
      if up: await pg.mouse.up()
    async def click(x,y,svg='station'):
      a=await cl(x,y,svg); await pg.mouse.click(*a)
    await pg.fill('#inName','김민수'); await pg.fill('#inNo','3'); await shot('title'); await pg.click('#goEsp')
    log=[]; done=set(); t_end=asyncio.get_event_loop().time()+260; brewN=0
    while asyncio.get_event_loop().time()<t_end:
      await pg.wait_for_timeout(180)
      if await pg.evaluate("()=>!document.querySelector('#result').classList.contains('off')"):
        await pg.wait_for_timeout(600); await shot('result'); log.append('RESULT: '+(await pg.inner_text('#rlist')).replace('\n',' | ')); break
      st=await pg.evaluate("()=>({h:document.querySelector('#ptext').innerText,off:document.querySelector('#panel').classList.contains('off'),btn:document.querySelector('#pbtn').className,bh:document.querySelector('#pbtn').hidden,tag:document.querySelector('#ptag').textContent})")
      h=st['h']
      if st['off']: continue
      if not st['bh'] and 'mic' in st['btn'] and 'listening' not in st['btn']:
        if h[:6] not in done: done.add(h[:6]); await pg.wait_for_timeout(250); await shot('say')
        await pg.click('#pbtn'); await pg.wait_for_timeout(1600); log.append('say:'+h.split('\n')[0][:12]); continue

      if '잔 받침 2개' in h and 'prep' not in done:
        done.add('prep'); await pg.wait_for_timeout(900); await shot('prep')
        sp=await pg.evaluate("()=>[...document.querySelectorAll('#prepItems>g')].map(g=>g.getAttribute('transform'))")
        # 받침 2개
        await drag(845,160,240,350,'prepSvg'); await pg.wait_for_timeout(350)
        await drag(845,175,440,350,'prepSvg'); await pg.wait_for_timeout(350)
        # 스푼: 방향이 틀린 것은 먼저 눌러서 돌린다
        for y,gx in ((330,240),(450,440)):
          rot=await pg.evaluate(f"()=>{{const g=[...document.querySelectorAll('#prepItems>g')].find(g=>/translate\\(845\\.0 {y}\\.0\\)/.test(g.getAttribute('transform')));return g?g.getAttribute('transform'):null}}")
          if rot and 'rotate(180' in rot:
            if 'wrongtry' not in done:
              done.add('wrongtry'); await drag(845,y,gx,282,'prepSvg'); await pg.wait_for_timeout(700); await shot('prep_wrong')
            await click(845,y,'prepSvg'); await pg.wait_for_timeout(450)
          await drag(845,y,gx,282,'prepSvg'); await pg.wait_for_timeout(450)
        await pg.wait_for_timeout(250); await shot('prep_done'); log.append('prep'); await pg.wait_for_timeout(1800); continue
      if '왼쪽으로 돌려서' in h and 'tw1' not in done:
        done.add('tw1'); await pg.wait_for_timeout(700); await shot('bar_start'); x,y=await G('[g.PF.x,g.PF.y]')
        await drag(x+150,y+28,x+20,y+28,up=False); await shot('twisting_out'); c=await cl(x-130,y+28); await pg.mouse.move(*c,steps=6); await pg.mouse.up(); log.append('twist out'); await pg.wait_for_timeout(700); await shot('unlocked'); continue
      if '오른쪽으로 돌려서' in h and 'tw2' not in done:
        done.add('tw2'); await pg.wait_for_timeout(500); x,y=await G('[g.PF.x,g.PF.y]'); await shot('insert')
        await drag(x-120,y+28,x+180,y+28); log.append('twist in'); await pg.wait_for_timeout(700); await shot('locked'); continue
      if '그라인더에 걸어요' in h and 'g1' not in done:
        done.add('g1'); await pg.wait_for_timeout(300); x,y=await G('[g.PF.x,g.PF.y]'); await drag(x,y+20,1330,520); log.append('pf>grinder'); await pg.wait_for_timeout(500); continue
      if '꾹 누르고' in h and 'grind' not in done:
        done.add('grind'); a=await cl(1330,398); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(1300); await shot('grinding'); await pg.wait_for_timeout(1300); await pg.mouse.up(); log.append('grind'); await pg.wait_for_timeout(600); continue
      if '탬퍼' in h and 'tamp' not in done:
        done.add('tamp'); await pg.wait_for_timeout(1200); await shot('tamp'); x,y=await G('[g.TAMP.x,g.TAMP.y]'); a=await cl(x,y-40); await pg.mouse.move(*a); await pg.mouse.down(); c=await cl(x,y+100); await pg.mouse.move(*c,steps=10); await pg.mouse.up(); log.append('tamp'); await pg.wait_for_timeout(1500); continue
      if '오른쪽 그룹 아래로' in h and 'lock' not in done:
        done.add('lock'); await pg.wait_for_timeout(400); x,y=await G('[g.PF.x,g.PF.y]'); await drag(x,y+20,910,400); log.append('lock'); await pg.wait_for_timeout(800); continue
      if '추출 버튼</em>을 눌러요' in await pg.inner_html('#ptext'):
        brewN+=1; await pg.wait_for_timeout(400); await click(980,252); mode=MODE if brewN==1 else 'good'
        target={'good':27,'over':46,'early':12}[mode]; t0=asyncio.get_event_loop().time()
        await pg.wait_for_timeout(500)
        # 잔 2개 내리기
        for i,(wx,sx) in enumerate(((520,864),(600,956))):
          await drag(wx,160,sx,520); await pg.wait_for_timeout(300)
        await shot('cups_down')
        # 붓 청소
        if await pg.evaluate("()=>document.querySelectorAll('#dirt .dt').length")>0:
          a=await cl(1206,652); await pg.mouse.move(*a); await pg.mouse.down()
          for k in range(3):
            for x in (1240,1290,1340,1390,1420):
              c=await cl(x-44,612+(k*10)); await pg.mouse.move(*c,steps=3)
            if k==1: await shot('brushing')
            for x in (1420,1370,1320,1270,1230):
              c=await cl(x-44,622+(k*6)); await pg.mouse.move(*c,steps=3)
          await pg.mouse.up(); log.append('brush')
        while True:
          await pg.wait_for_timeout(100); t=await pg.evaluate("()=>parseInt(document.querySelector('#gsec').textContent)")
          if mode=='good' and t>=20 and ('g20',brewN) not in done: done.add(('g20',brewN)); await shot('brew20')
          if mode=='over' and t>=45 and 'ov' not in done: done.add('ov'); await shot('overflow')
          if t>=target: break
        await shot('brew_stop_'+mode); await click(980,252); log.append(f'brew {mode} {t}s'); await pg.wait_for_timeout(500); await shot('brew_result'); await pg.wait_for_timeout(2600); continue
      if '잔 받침 위</em>에 올려요' in await pg.inner_html('#ptext') and 'tray' not in done:
        done.add('tray'); await pg.wait_for_timeout(900); await shot('cup_saucer')
        await drag(845,230,240,330,'prepSvg'); await pg.wait_for_timeout(400)
        await drag(845,420,440,330,'prepSvg'); await pg.wait_for_timeout(300)
        await shot('on_saucer'); log.append('tray'); await pg.wait_for_timeout(1900); await shot('bar_tray'); continue
      if '심사위원 앞' in h and 'serve' not in done:
        done.add('serve'); await pg.wait_for_timeout(500); await shot('judge_tray')
        for sx,jx in ((700,470),(900,1130)):
          await drag(sx,560,jx,560,'judge'); await pg.wait_for_timeout(450)
        log.append('serve'); await shot('served'); continue
      if '트레이</em>를 눌러' in await pg.inner_html('#ptext') and 'trayoff' not in done:
        done.add('trayoff'); await pg.wait_for_timeout(400); await click(800,600,'judge'); log.append('tray off'); await pg.wait_for_timeout(900); continue
    print(TAG,'|',' > '.join(log)); print('errors:',errs[:5]); print('speech:',await pg.evaluate('()=>JSON.stringify(window.__speechLog.map(x=>x.score))'))
    await b.close()
asyncio.run(main())
