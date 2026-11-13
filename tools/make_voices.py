"""audio/ 폴더의 mp3를 src/voices.js에 넣는다. 새 목소리를 추가하면 아래 표에 한 줄 넣고 다시 실행."""
import base64,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINES=[('준비되면 시작해 주세요.','judge_ready.mp3'),('준비 시작해 주세요.','judge_prep_start.mp3')]
d=lambda f:'data:audio/mpeg;base64,'+base64.b64encode(open(f'{R}/audio/{f}','rb').read()).decode()
with open(f'{R}/src/voices.js','w',encoding='utf-8') as o:
  o.write("/* 심사위원 목소리 (ElevenLabs, Gia). 원본: audio/ 폴더. tools/make_voices.py로 다시 만든다 */\nconst VOICE={\n"+",\n".join(f"  '{k}':'{d(f)}'" for k,f in LINES)+"};\n")
