# sample-cf-workers-static

方式①（標準・静的）のサンプル。Markdown で書いた記事を Astro でビルドし、Cloudflare Workers Static Assets（コードのない Worker）で配信する。

- 公開先：https://sample-cf-workers-static.alphajinsei.com
- 全体の方針と、どの方式でも共通の決まりごと：[サービス開発ガイド](https://github.com/alphajinsei/cf-infra-playbook/blob/main/docs/service-guide.md)（手元では `~/claude-sandbox/infra/docs/service-guide.md`）

## 1. この方式の用途

向いているもの：記事やページを表示するだけのサイト（Markdown のブログ、ドキュメント、ポートフォリオ）、ビルド済みの SPA。

向いていないもの：データを保存するもの、ログインした人ごとに中身が変わるもの。これらは方式②。あとから API（問い合わせフォームなど）が欲しくなったら、`wrangler.jsonc` に `main` を足せば同じ Worker のまま②になる。

## 2. 構成と主なファイル

```
 Dev PC:  src/**/*.md, *.astro --astro build--> dist/*.html --wrangler deploy--> edge

 Browser --> edge --+-- file in dist/?  --> return it
                    +-- otherwise       --> dist/404.html (status 404)
          (no Worker code runs at all)
```

| ファイル | 役割 |
| --- | --- |
| `wrangler.jsonc` | Worker の定義。`main` はなく、`assets`（`./dist`）、`not_found_handling: "404-page"`、カスタムドメイン、`workers_dev: false` だけ |
| `astro.config.mjs` | `build.format: 'file'`（`posts/hello.html` の形で出力し、`/posts/hello` にリダイレクトなしで応答する） |
| `src/pages/index.astro` | トップ。`src/pages/posts/*.md` を日付の新しい順に並べる |
| `src/pages/posts/*.md` | 記事。ファイル名が URL になる（`hello.md` → `/posts/hello`） |
| `src/pages/404.astro` | 存在しないパスに返すページ |
| `src/layouts/` | 全ページ共通のレイアウト（`BaseLayout`）と、記事のレイアウト（`PostLayout`） |
| `public/` | そのまま `dist/` にコピーされるファイル（favicon など） |
| `dist/` | ビルドの出力。git 管理外 |

## 3. 手元での開発

```bash
npm install
npm run dev        # http://localhost:4321 。記事を保存するとすぐ反映される
npm run preview    # ビルドして、本番と同じ workerd で確かめる（http://localhost:8787）
```

記事の書き方：

```markdown
---
layout: ../../layouts/PostLayout.astro
title: 記事のタイトル
date: "2026-11-03"
---

本文（Markdown）
```

## 4. ビルドとデプロイ

```bash
npm run deploy
```

中身は `astro build && wrangler deploy`。

1. Astro が `src/` から `dist/` に HTML を書き出す
2. wrangler が `dist/` のファイルを、前回から変わったものだけアップロードする。カスタムドメイン（DNS レコードと証明書）も、このとき作られる・更新される

DB もマイグレーションもないので、手順はこれだけ。認証は `wrangler login`。

## 5. このサンプルから新しいサービスを始める

GitHub の Template repository にしてあるので、履歴なしでコピーできる。`<name>` は新しいサイトの名前（＝フォルダ名 ＝ リポジトリ名 ＝ Worker の名前 ＝ サブドメイン）。

```bash
cd ~/claude-sandbox
gh repo create <name> --template alphajinsei/sample-cf-workers-static --public --clone
cd <name>
npm install
```

書き換える場所：

| ファイル | 書き換えるところ |
| --- | --- |
| `package.json` | `name` |
| `wrangler.jsonc` | `name`、`routes[0].pattern`（`<name>.alphajinsei.com`）。`compatibility_date` は今日の日付にする |
| `src/layouts/BaseLayout.astro` | `<title>` のサイト名、見た目 |
| `src/pages/index.astro` | トップの説明文 |
| `src/pages/posts/` | サンプルの記事を消して、自分の記事を置く |
| `src/pages/404.astro` | 文言 |
| `README.md` | このファイルを新しいサイトの説明に書き直す（見出しはそのまま） |

書き換えたあと：

```bash
npm run dev        # 確かめる
npm run deploy     # https://<name>.alphajinsei.com で公開
```

- infra で Claude Code を開いて作業するなら、`~/claude-sandbox/infra/.claude/settings.json` の `additionalDirectories` に `~/claude-sandbox/<name>` を足す。
- コミットの作者のメールアドレスを隠すなら、最初のコミットの前に `git config user.email <ID>+alphajinsei@users.noreply.github.com`。
- 既存の Pages のサイトを移すときは、Pages のカスタムドメインを外してから `npm run deploy` する（同じホスト名を2か所に付けられない）。

## 6. この方式の注意点

- **frontmatter の日付は引用符で囲む。**`date: 2026-11-03` だと YAML が日付型として読み、表示が `2026-11-03T00:00:00.000Z` になる。
- **Astro の Cloudflare アダプターは入れない。**完全な静的サイトなら不要。入れると `main` のある Worker（SSR）になり、構成が変わる。
- **`build.format: 'file'` を外さない。**外すと `/posts/hello` が `/posts/hello/` に 307 でリダイレクトされる。
- **公開はこの PC からだけ。**スマホや GitHub の画面で記事を書いても公開されない。必要になったら GitHub Actions を足す（[方式検討サマリ](https://github.com/alphajinsei/cf-infra-playbook/blob/main/docs/infra-design-summary.md) の CI/CD の章）。
- **npm がインストールスクリプトを止めたという警告**（esbuild、workerd）が出るが、dev・preview・deploy は動く。
