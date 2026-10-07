#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

version=$(node -p "require('./manifest.json').version")
mkdir -p dist
extension="dist/yt-local-db-$version.zip"
assets="dist/yt-local-db-store-assets-$version.zip"
rm -f "$extension" "$assets"

zip -q -X "$extension" \
  manifest.json content.js popup.html popup.js popup.css LICENSE \
  icons/icon16.png icons/icon32.png icons/icon48.png icons/icon128.png
zip -q -X "$assets" \
  store/LISTING.md store/promo-440x280.png \
  store/screenshot-light-1280x800.png store/screenshot-dark-1280x800.png \
  icons/icon128.png

printf 'Extension upload: %s\nListing assets: %s\n' "$extension" "$assets"
