# 꼬마 바리스타 카페

특수교육대상학생 바리스타 2급 수업 복습용 게임입니다.

- 학생용 주소: https://wldbs0307.github.io/barista-game/
- 가로 화면, 휴대폰 Chrome 권장 (카카오톡 안 브라우저나 파일 더블클릭으로는 마이크가 안 됩니다)

## 고치는 방법

1. `src/page.html`(그림·화면), `src/lib.js`(소리·말하기 채점·끌기 같은 공통 기능), `src/espresso.js`(에스프레소 단계)를 고칩니다. `index.html`은 직접 고치지 않습니다.
2. `tools/build.sh`로 `index.html`을 다시 만듭니다.
3. `python3 tools/test_esp.py good` / `python3 tools/test_esp.py over 844 390 po` 로 전체 흐름을 돌리고 `tools/shots/` 캡처를 눈으로 확인합니다.
   (예전 카페 손님 버전은 `old/cafe-game.js`에 남겨 두었습니다.)
4. 올리면 1~2분 뒤 위 주소에 반영됩니다.

진행 상황과 다음 할 일은 `PROGRESS.md`에 있습니다.
