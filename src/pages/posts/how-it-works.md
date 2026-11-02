---
layout: ../../layouts/PostLayout.astro
title: このサイトの仕組み
date: "2026-11-03"
---

`wrangler.jsonc` には `main`（Worker のコード）を書いていません。`assets` だけを書いた「コードのない Worker」なので、リクエストはすべて Cloudflare のエッジが `dist/` のファイルをそのまま返します。

- 存在しないパスには `404.html` を返す（`not_found_handling: "404-page"`）
- 静的ファイルの配信は無料で、リクエスト数の上限もない
