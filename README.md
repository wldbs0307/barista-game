# 꼬마 바리스타 카페

특수교육대상학생 바리스타 2급 수업 복습용 게임입니다.

- 학생용 주소: https://wldbs0307.github.io/barista-game/
- 가로 화면, 휴대폰 Chrome 권장 (카카오톡 안 브라우저나 파일 더블클릭으로는 마이크가 안 됩니다)

## 고치는 방법

1. `src/page.html`(그림·화면)과 `src/game.js`(동작)를 고칩니다. `index.html`은 직접 고치지 않습니다.
2. `tools/build.sh`로 `index.html`을 다시 만듭니다.
3. `python3 tools/test_play.py cap good` / `python3 tools/test_play.py esp over 844 390 pe` 로 전체 흐름을 돌리고 `tools/shots/` 캡처를 눈으로 확인합니다.
4. 올리면 1~2분 뒤 위 주소에 반영됩니다.

진행 상황과 다음 할 일은 `PROGRESS.md`에 있습니다.
