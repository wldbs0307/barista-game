"""실전 15분을 처음부터 끝까지 마우스로 플레이한다: 준비 → 에스프레소 → 카푸치노 → 정리.
python3 tools/test_exam.py [가로] [세로]"""
import asyncio, sys, os
VW=int(sys.argv[1]) if len(sys.argv)>1 else 1280
VH=int(sys.argv[2]) if len(sys.argv)>2 else 720
sys.argv=[sys.argv[0]]
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import test_pc, test_esp, test_cap
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await (await b.new_context(viewport={'width':VW,'height':VH})).new_page()
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await pg.add_init_script(test_esp.MOCK)
    await pg.goto('file://'+R+'/index.html'); await pg.wait_for_timeout(400)
    await pg.screenshot(path=R+'/tools/shots/x_00_title.png'); await pg.click('#goExam')
    for mod,tag,until in ((test_pc,'x1','에스프레소'),(test_esp,'x2','카푸치노'),(test_cap,'x3','정리'),(test_pc,'x4',None)):
      mod.TAG=tag
      if mod is test_pc: mod.MODE='prep' if until else 'clean'
      log=await mod.play(pg,errs,None,False,until)
      print('##',tag,'steps',len(log),'|',' > '.join(log[-4:])[:300])
      st=await pg.inner_text('#step'); print('   now:',st.replace('\n',' '),'| clock:',await pg.inner_text('#clock'))
    await pg.wait_for_timeout(800); await pg.screenshot(path=R+'/tools/shots/x_99_result.png')
    print('RESULT:',(await pg.inner_text('#rlist')).replace('\n',' | ')); print('ERRORS:',errs)
    await b.close()
asyncio.run(main())
