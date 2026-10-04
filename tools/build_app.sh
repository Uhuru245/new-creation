#!/bin/sh
# Prepares the web app folder: copies a SANITISED server file for the in-browser demo.
set -e
cd "$(dirname "$0")/.."; [ -f server/Code.private.gs ] || { echo "Put your live Code.gs at server/Code.private.gs"; exit 1; }
mkdir -p server
sed -E "s#^const GROUP_LINK = .*#const GROUP_LINK = 'https://chat.whatsapp.com/SAMPLE-DEMO-LINK';#; s#^const STUDY_SHEET_ID +=.*#const STUDY_SHEET_ID = 'demo-studies';#; s#^const BOOK_SHEET_ID +=.*#const BOOK_SHEET_ID = 'demo-books';#; s#https://chat.whatsapp.com/[A-Za-z0-9]+#https://chat.whatsapp.com/SAMPLE-DEMO-LINK#g" server/Code.private.gs > server/Code.gs
grep -q "SAMPLE-DEMO-LINK" server/Code.gs && echo "demo server sanitised"
