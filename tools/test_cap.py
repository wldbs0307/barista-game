"""카푸치노 단계를 처음부터 끝까지 마우스로 플레이하고 캡처한다.
python3 tools/test_cap.py [가로] [세로] [이름표]"""
import asyncio, sys, os
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VW=int(sys.argv[1]) if len(sys.argv)>1 else 1280
VH=int(sys.argv[2]) if len(sys.argv)>2 else 720
TAG=sys.argv[3] if len(sys.argv)>3 else 'c'
SH=R+'/tools/shots'; os.makedirs(SH,exist_ok=True)
MOCK="""window.SpeechRecognition=class{start(){setTimeout(()=>{const t=document.querySelector('#ptext').cloneNode(true);t.querySelectorAll('small').forEach(s=>s.remove());const R=[{transcript:t.textContent}];R.isFinal=true;this.onresult&&this.onresult({resultIndex:0,results:[R]});this.onend&&this.onend()},200)}};"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await (await b.new_context(viewport={'width':VW,'height':VH})).new_page()
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await pg.add_init_script(MOCK)
    await pg.goto('file://'+R+'/index.html'); await pg.wait_for_timeout(400)
    return await play(pg,errs,b)
async def play(pg,errs,b=None,start=True,until=None):
  if True:
    n=[0]
    async def shot(name):
      n[0]+=1; await pg.screenshot(path=f'{SH}/{TAG}_{n[0]:02d}_{name}.png')
    async def cl(x,y,svg='station'):
      return await pg.evaluate("([x,y,s])=>{const m=document.querySelector('#'+s).getScreenCTM();return [m.a*x+m.e,m.d*y+m.f]}",[x,y,svg])
    async def G(e): return await pg.evaluate('()=>{const g=window.__game;return '+e+'}')
    async def drag(x0,y0,x1,y1,svg='station',up=True,steps=12):
      a=await cl(x0,y0,svg); c=await cl(x1,y1,svg); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(80)
      await pg.mouse.move(*c,steps=steps)
      if up: await pg.mouse.up()
    async def click(x,y,svg='station'):
      a=await cl(x,y,svg); await pg.mouse.click(*a)
    async def hold(x,y,ms,svg='station'):
      a=await cl(x,y,svg); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(ms); await pg.mouse.up()
    PS='prepSvg'
    if start: await shot('title'); await pg.click('#goCap')
    log=[]; done={}; t_end=asyncio.get_event_loop().time()+330
    def once(k):
      if done.get(k): return False
      done[k]=1; return True
    while asyncio.get_event_loop().time()<t_end:
      await pg.wait_for_timeout(200)
      if until and (await pg.inner_text('#step')).startswith(until): break
      if await pg.evaluate("()=>!document.querySelector('#result').classList.contains('off')"):
        await pg.wait_for_timeout(700); await shot('result'); log.append('RESULT: '+(await pg.inner_text('#rlist')).replace('\n',' | ')); break
      st=await pg.evaluate("()=>({h:document.querySelector('#ptext').innerText,html:document.querySelector('#ptext').innerHTML,off:document.querySelector('#panel').classList.contains('off'),btn:document.querySelector('#pbtn').className,bh:document.querySelector('#pbtn').hidden,ttl:document.querySelector('#prep .ttl').textContent,pop:!document.querySelector('#prep').classList.contains('off')})")
      h=st['h']; H=st['html']
      if st['off']: continue
      if not st['bh'] and 'mic' in st['btn'] and 'listening' not in st['btn']:
        if once('say'+h[:8]): await pg.wait_for_timeout(250); await shot('say')
        await pg.click('#pbtn'); await pg.wait_for_timeout(1600); log.append('say:'+h.split('\n')[0][:10]); continue
      # 서빙 준비 (T 작업)
      if st['pop'] and st['ttl']=='서빙 준비':
        tk=await pg.evaluate('()=>window.__pc&&window.__pc.task')
        if tk and tk['kind']=='drag':
          await pg.wait_for_timeout(400); await shot('prep'); await drag(tk['a']['x'],tk['a']['y'],tk['b']['x'],tk['b']['y'],PS); log.append('prep-drag'); await pg.wait_for_timeout(500); continue
      # 서빙 준비
      if '잔 받침 2개' in h and once('prep'):
        await pg.wait_for_timeout(900); await shot('prep')
        await drag(845,160,225,330,PS); await pg.wait_for_timeout(350); await drag(845,175,455,330,PS); await pg.wait_for_timeout(350)
        for y,gx in ((330,225),(450,455)):
          rot=await pg.evaluate(f"()=>{{const g=[...document.querySelectorAll('#prepItems>g')].find(g=>/translate\\(845\\.0 {y}\\.0\\)/.test(g.getAttribute('transform')));return g?g.getAttribute('transform'):null}}")
          if rot and 'rotate(180' in rot: await click(845,y,PS); await pg.wait_for_timeout(450)
          await drag(845,y,gx,266,PS); await pg.wait_for_timeout(450)
        await shot('prep_done'); log.append('prep'); await pg.wait_for_timeout(1800); continue
      # 우유 따르기
      if st['pop'] and st['ttl']=='우유 따르기' and ('코' in h) :
        if once('milk0'): await pg.wait_for_timeout(800); await shot('milk')
        ms=2600 if not done.get('milk1') else 400; done['milk1']=1
        a=await cl(320,380,PS); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(ms-600); await shot('milk_pouring'); await pg.wait_for_timeout(600); await pg.mouse.up(); log.append(f'milk {ms}'); await pg.wait_for_timeout(1200); continue
      # 포터필터
      if '왼쪽으로 돌려서' in h and once('tw1'):
        await pg.wait_for_timeout(700); await shot('bar'); x,y=await G('[g.PF.x,g.PF.y]'); await drag(x+150,y+28,x-130,y+28); log.append('twist out'); await pg.wait_for_timeout(800); continue
      if '그라인더에 걸어요' in h and once('g1'):
        x,y=await G('[g.PF.x,g.PF.y]'); await drag(x,y+20,1330,520); log.append('pf>grinder'); await pg.wait_for_timeout(500); continue
      if '꾹 누르고</em> 있어요' in H and once('grind'):
        await hold(1330,398,2700); log.append('grind'); await pg.wait_for_timeout(600); continue
      if '탬퍼' in h and once('tamp'):
        await pg.wait_for_timeout(1200); x,y=await G('[g.TAMP.x,g.TAMP.y]'); a=await cl(x,y-40); await pg.mouse.move(*a); await pg.mouse.down(); c=await cl(x,y+100); await pg.mouse.move(*c,steps=10); await pg.mouse.up(); log.append('tamp'); await pg.wait_for_timeout(1500); continue
      if '오른쪽 그룹 아래로' in h and once('lock'):
        x,y=await G('[g.PF.x,g.PF.y]'); await drag(x,y+20,910,400); log.append('lock'); await pg.wait_for_timeout(800); continue
      if '오른쪽으로 돌려서' in h and once('tw2'):
        await pg.wait_for_timeout(400); x,y=await G('[g.PF.x,g.PF.y]'); await drag(x-120,y+28,x+180,y+28); log.append('twist in'); await pg.wait_for_timeout(800); continue
      if '추출 버튼</em>을 눌러요' in H and once('brew'):
        await pg.wait_for_timeout(400); await click(980,252); await pg.wait_for_timeout(500)
        for wx,sx in ((722,846),(838,974)):
          await drag(wx,140,sx,500); await pg.wait_for_timeout(300)
        await shot('cups_down')
        a=await cl(1206,652); await pg.mouse.move(*a); await pg.mouse.down()
        for k in range(3):
          for x in (1240,1290,1340,1390,1420):
            c=await cl(x-44,612+(k*10)); await pg.mouse.move(*c,steps=3)
          for x in (1420,1370,1320,1270,1230):
            c=await cl(x-44,622+(k*6)); await pg.mouse.move(*c,steps=3)
        await pg.mouse.up(); log.append('brush')
        while True:
          await pg.wait_for_timeout(100); t=await pg.evaluate("()=>parseInt(document.querySelector('#gsec').textContent)")
          if t>=27: break
        await shot('brew_stop'); await click(980,252); log.append(f'brew {t}s'); await pg.wait_for_timeout(2600); continue
      # 스티밍
      if '왼쪽 스팀노즐' in H and once('wandL'):
        await pg.wait_for_timeout(500); await shot('wand_left'); await click(462,420); log.append('left wand'); await pg.wait_for_timeout(800); continue
      if st['ttl'].startswith('우유 스티밍') and st['pop']:
        tk=await pg.evaluate('()=>window.__pc&&window.__pc.task')
        if tk:
          kk=tk['kind']; a0=tk.get('a'); b0=tk.get('b')
          if kk=='drag':
            await pg.wait_for_timeout(300); await drag(a0['x'],a0['y'],b0['x'],b0['y'],PS); log.append('t-drag'); await pg.wait_for_timeout(500); continue
          if kk=='tap':
            await pg.wait_for_timeout(300); await shot('ttap'); await click(a0['x'],a0['y'],PS); log.append('t-tap'); await pg.wait_for_timeout(900); continue
          if kk=='wipe':
            c=await cl(a0['x'],a0['y'],PS); await pg.mouse.move(*c); await pg.mouse.down()
            for i in range(6):
              c=await cl(b0['x']+25,b0['y']-8,PS); await pg.mouse.move(*c,steps=4); c=await cl(b0['x']-20,b0['y']+12,PS); await pg.mouse.move(*c,steps=4)
            await pg.mouse.up(); log.append('t-wipe'); await pg.wait_for_timeout(800); continue
          if kk=='swirl':
            await pg.wait_for_timeout(400); await shot('swirl'+st['ttl'][-3]); import math
            c=await cl(a0['x'],a0['y'],PS); await pg.mouse.move(*c); await pg.mouse.down()
            c=await cl(a0['x']+50,a0['y'],PS); await pg.mouse.move(*c,steps=3)
            for i in range(1,4*24+1):
              if i==30: await shot('swirling')
              an=i/24*2*math.pi; c=await cl(a0['x']+50*math.cos(an),a0['y']+50*math.sin(an),PS); await pg.mouse.move(*c)
            await pg.mouse.up(); log.append('swirl'); await pg.wait_for_timeout(700); continue
          if kk=='pour':
            ph=await pg.evaluate('()=>__la.phase'); c=await cl(a0['x'],a0['y'],PS); await pg.mouse.move(*c); await pg.mouse.down()
            for i in range(80):
              await pg.wait_for_timeout(100)
              if i==8: await shot('pour_'+ph+st['ttl'][-3])
              if i in (16,24) and ph=='close': await shot(f'pour_close_mid{i}_'+st['ttl'][-3])
              if await pg.evaluate('()=>__la.ok()'): break
            await pg.mouse.up(); log.append('pour '+ph); await pg.wait_for_timeout(900); await shot('poured_'+ph+st['ttl'][-3]); continue
        if '노즐 아래로' in h and once('dock'):
          x,y,L=await pg.evaluate('()=>[__pt.sp.x,__pt.sp.y,__pt.L]'); await drag(x,y-40,700+(x-x),300+40+L*230*.9-0, PS); await pg.wait_for_timeout(600); await shot('docked'); log.append('dock'); continue
        if '켜요' in h and once('on'):
          await click(880,160,PS); log.append('steam on'); await pg.wait_for_timeout(1200); await shot('aerating'); continue
        if '살짝 내려요' in H:
          x,y=await pg.evaluate('()=>[__pt.sp.x,__pt.sp.y]'); a=await cl(x+40,y-60,PS); await pg.mouse.move(*a); await pg.mouse.down()
          for d in range(1,8): c=await cl(x+40,y-60+d*5,PS); await pg.mouse.move(*c)
          await pg.mouse.up(); log.append('lower'); await pg.wait_for_timeout(500); continue
        if '위로 올려' in H and once('raise'):
          x,y=await pg.evaluate('()=>[__pt.sp.x,__pt.sp.y]'); a=await cl(x+40,y-60,PS); await pg.mouse.move(*a); await pg.mouse.down()
          for d in range(1,14): c=await cl(x+40,y-60-d*8,PS); await pg.mouse.move(*c)
          await pg.mouse.up(); log.append('raise'); await pg.wait_for_timeout(1500); await shot('mixing'); continue
        if '90%</em>예요' in H and once('off'):
          await shot('at90'); await click(880,160,PS); log.append('steam off'); await pg.wait_for_timeout(900); continue
        continue
      if st['ttl']=='우유 나누기' and st['pop']:
        if once('div0'): await pg.wait_for_timeout(700); await shot('divide')
        tk=await pg.evaluate('()=>window.__pc&&window.__pc.task')
        if tk and tk['kind']=='hold':
          c=await cl(tk['a']['x'],tk['a']['y'],PS); await pg.mouse.move(*c); await pg.mouse.down(); await pg.wait_for_timeout(1500)
          if once('all'+str(tk['a']['x'])): await shot('div_all')
          await pg.wait_for_timeout(2500); await pg.mouse.up(); log.append('pour-all'); await pg.wait_for_timeout(900); continue
        dA,dB=await pg.evaluate('()=>[__dv.A.L,__dv.B.L]'); m=min(.15,(dA-dB)/2); ms=int(300+m/.12*1000)
        a=await cl(300,400,PS); await pg.mouse.move(*a); await pg.mouse.down(); await pg.wait_for_timeout(min(ms,1000))
        if once('div1'): await shot('dividing')
        await pg.wait_for_timeout(max(0,ms-1000)); await pg.mouse.up(); log.append('pour'); await pg.wait_for_timeout(900); continue
      if st['ttl'].startswith('카푸치노 붓기') and st['pop']:
        tk=await pg.evaluate('()=>window.__pc&&window.__pc.task')
        if tk:
          kk=tk['kind']; a0=tk.get('a'); b0=tk.get('b')
          if kk=='drag':
            await pg.wait_for_timeout(300); await drag(a0['x'],a0['y'],b0['x'],b0['y'],PS); log.append('t-drag'); await pg.wait_for_timeout(500); continue
          if kk=='tap':
            await pg.wait_for_timeout(300); await shot('ttap'); await click(a0['x'],a0['y'],PS); log.append('t-tap'); await pg.wait_for_timeout(900); continue
          if kk=='wipe':
            c=await cl(a0['x'],a0['y'],PS); await pg.mouse.move(*c); await pg.mouse.down()
            for i in range(6):
              c=await cl(b0['x']+25,b0['y']-8,PS); await pg.mouse.move(*c,steps=4); c=await cl(b0['x']-20,b0['y']+12,PS); await pg.mouse.move(*c,steps=4)
            await pg.mouse.up(); log.append('t-wipe'); await pg.wait_for_timeout(800); continue
          if kk=='swirl':
            await pg.wait_for_timeout(400); await shot('swirl'+st['ttl'][-3]); import math
            c=await cl(a0['x'],a0['y'],PS); await pg.mouse.move(*c); await pg.mouse.down()
            c=await cl(a0['x']+50,a0['y'],PS); await pg.mouse.move(*c,steps=3)
            for i in range(1,4*24+1):
              if i==30: await shot('swirling')
              an=i/24*2*math.pi; c=await cl(a0['x']+50*math.cos(an),a0['y']+50*math.sin(an),PS); await pg.mouse.move(*c)
            await pg.mouse.up(); log.append('swirl'); await pg.wait_for_timeout(700); continue
          if kk=='pour':
            ph=await pg.evaluate('()=>__la.phase'); c=await cl(a0['x'],a0['y'],PS); await pg.mouse.move(*c); await pg.mouse.down()
            for i in range(80):
              await pg.wait_for_timeout(100)
              if i==8: await shot('pour_'+ph+st['ttl'][-3])
              if i in (16,24) and ph=='close': await shot(f'pour_close_mid{i}_'+st['ttl'][-3])
              if await pg.evaluate('()=>__la.ok()'): break
            await pg.mouse.up(); log.append('pour '+ph); await pg.wait_for_timeout(900); await shot('poured_'+ph+st['ttl'][-3]); continue
        continue
      if st['ttl']=='피쳐 정리' and st['pop'] and once('tidy'):
        await pg.wait_for_timeout(700); await drag(170,470,430,450,PS); await pg.wait_for_timeout(400); await drag(830,450,600,450,PS); log.append('tidy'); await pg.wait_for_timeout(1500); continue
      if '잔 받침 위</em>에 올려요' in H and once('tray'):
        await pg.wait_for_timeout(900); await shot('cup_saucer')
        await drag(845,230,225,330,PS); await pg.wait_for_timeout(400); await drag(845,420,455,330,PS); await pg.wait_for_timeout(300)
        await shot('on_saucer'); log.append('tray'); await pg.wait_for_timeout(1900); continue
      if '심사위원 앞' in h and once('serve'):
        await pg.wait_for_timeout(500); await shot('judge_tray')
        for sx,jx in ((700,470),(900,1130)):
          await drag(sx,560,jx,560,'judge'); await pg.wait_for_timeout(450)
        log.append('serve'); await shot('served'); continue
      if '트레이</em>를 눌러' in H and once('trayoff'):
        await pg.wait_for_timeout(400); await click(800,600,'judge'); log.append('tray off'); await pg.wait_for_timeout(900); continue
    print(TAG,'|',' > '.join(log)); print('errors:',errs[:5])
    print('last hint:',await pg.inner_text('#ptext'),'| pop:',await pg.evaluate("()=>document.querySelector('#prep .ttl').textContent"))
    if b: await b.close()
    return log
if __name__=='__main__': asyncio.run(main())
