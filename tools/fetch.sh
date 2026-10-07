#!/bin/bash
u="$1"; slug=$(echo "$u" | sed -E 's#.*/productos/([^/]+)/?#\1#')
f="pages/$slug.html.gz"
[ -s "$f" ] && exit 0
for i in 1 2 3; do
  code=$(curl -sL -A "Mozilla/5.0 (X11; Linux x86_64)" --compressed -o "pages/$slug.tmp" -w "%{http_code}" "$u")
  if [ "$code" = "200" ]; then gzip -c "pages/$slug.tmp" > "$f"; rm -f "pages/$slug.tmp"; exit 0; fi
  echo "$code $u" >> errors.log; sleep 2
done
rm -f "pages/$slug.tmp"
