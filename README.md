# sample-cf-workers-static

方式検討（infra の枠①：標準・静的）のサンプル。Markdown で書いた記事を Astro でビルドし、Cloudflare Workers Static Assets で配信する。

- 公開先：https://sample-cf-workers-static.alphajinsei.com
- `wrangler.jsonc` に `main` はない（コードのない Worker）。リクエストはすべてエッジが `dist/` のファイルを返す
- 存在しないパスには `404.html` を返す（`not_found_handling: "404-page"`）

## 使い方

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Astro の開発サーバーで確かめる（記事の編集はこれで十分） |
| `npm run preview` | ビルドして、本番と同じ workerd で確かめる |
| `npm run deploy` | ビルドして本番にデプロイする（`astro build` → `wrangler deploy`） |

記事は `src/pages/posts/*.md` に置く。frontmatter の `date` は `"2026-11-03"` のように引用符で囲む（囲まないと YAML が日付型として読み、表示が ISO 形式になる）。

git は保管用で、push してもデプロイはされない。
