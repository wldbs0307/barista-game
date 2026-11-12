#!/bin/bash
# src/page.html + src/lib.js + src/espresso.js 를 합쳐 두 파일을 만든다.
#   index.html     : GitHub Pages용 (학생들이 여는 주소)
#   artifact.html  : claude.ai 게시 화면용 (머리말 없이 본문만)
R="$(cd "$(dirname "$0")/.." && pwd)"
{ echo "(()=>{'use strict';"; cat "$R/src/lib.js"; echo; cat "$R/src/espresso.js"; echo "})();"; } > "$R/tools/.game.js"
node --check "$R/tools/.game.js" || exit 1
{ cat "$R/src/page.html"; echo '<script>'; cat "$R/tools/.game.js"; echo '</script>'; } > "$R/artifact.html"
{ printf '%s' '<!doctype html><html lang="ko"><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'; cat "$R/artifact.html"; printf '%s' '</body></html>'; } > "$R/index.html"
wc -c "$R/index.html"
