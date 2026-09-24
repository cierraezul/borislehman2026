#!/usr/bin/env bash
# Rebuild the self-hosted Japanese font subsets after changing the page text.
# Needs: python3, fonttools, brotli  (pip install fonttools brotli)
# Run from the site folder:  bash tools/build-fonts.sh
set -e
cd "$(dirname "$0")/.."
work=$(mktemp -d)

curl -sL -o "$work/sans.ttf"  "https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf"
curl -sL -o "$work/serif.ttf" "https://github.com/google/fonts/raw/main/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf"

# every character on the page (tags removed) + ASCII + common Japanese punctuation
python3 - "$work/chars.txt" <<'PY'
import re, html, sys
src = open('index.html', encoding='utf-8').read()
alts = ' '.join(re.findall(r'alt="([^"]*)"', src))
src = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', src, flags=re.S)
text = html.unescape(re.sub(r'<[^>]+>', ' ', src))
extra = ''.join(chr(c) for c in range(0x20, 0x7f)) + '、。，．・：；？！ー―‐～〜…「」『』（）［］【】＋－×＝％＃＆＊＠￥○●◎◇◆□■△▲▽▼※→←↑↓　０１２３４５６７８９'
open(sys.argv[1], 'w', encoding='utf-8').write(''.join(sorted(set(text + alts + extra) - set('\n\r\t'))))
PY
printf '%s' "ボリス・レーマン監督レトロスペクティブ 0123456789" > "$work/serif-chars.txt"

python3 -m fontTools.varLib.instancer "$work/sans.ttf"  "wght=300:700" -q -o "$work/sans-range.ttf"
python3 -m fontTools.varLib.instancer "$work/serif.ttf" "wght=600"     -q -o "$work/serif-600.ttf"
python3 -m fontTools.subset "$work/sans-range.ttf" --text-file="$work/chars.txt" --flavor=woff2 --layout-features='*' --output-file=fonts/NotoSansJP-subset.woff2
python3 -m fontTools.subset "$work/serif-600.ttf"  --text-file="$work/serif-chars.txt" --flavor=woff2 --layout-features='*' --output-file=fonts/NotoSerifJP-600-subset.woff2

rm -rf "$work"
ls -la fonts
echo "Done. Bump ?v= on css/style.css in index.html so browsers reload."
