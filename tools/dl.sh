#!/bin/bash
u="$1"; f="raw/$(basename "${u%%\?*}")"
[ -s "$f" ] && exit 0
curl -sL --retry 3 -o "$f" "$u" || echo "FAIL $u" >> img_errors.log
