const path = require('path');
const express = require('express');
const app = express();
const PORT = 8000;

/* ====== ビュー設定（EJS） ====== */
// すでに res.render('index.ejs') を使っているので明示しておくと安全
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // 既定が 'views' だが明示

/* ====== 静的ファイル（/public 配信） ====== */
// /css と /img へのアクセスは禁止
// app.use(['/css', '/img'], (req, res, next) => {
//   res.status(403).send('Forbidden');
// });

// そのほか public は公開
app.use(express.static(path.join(__dirname, 'public')));

// /* ====== React のビルド成果物を /reactapp で配信 ====== */
// // ここに CRA の build の中身をコピーしておく: public/reactapp
// // 例）public/reactapp/index.html, public/reactapp/static/...
// app.use(
//   '/app_todo_taimu',
//   express.static(path.join(__dirname, 'public', 'app_todo_taimu'), {
//     // 本番っぽく軽くキャッシュ（ハッシュ付き静的アセットに効く）
//     maxAge: '7d',
//     setHeaders: (res, filePath) => {
//       // index.html は都度取得（ルーティングの起点なのでno-cacheが無難）
//       if (path.basename(filePath) === 'index.html') {
//         res.setHeader('Cache-Control', 'no-cache');
//       }
//     },
//   })
// );

// /* ====== SPA ルーティング対策 ====== */
// // 正規表現で /reactapp とその配下を全部マッチ
// // クライアントサイドルータに処理を渡す
// app.get(/^\/app_todo_taimu(\/.*)?$/, (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'reactapp', 'index.html'));
// });

/* ====== 既存ページ（EJS） ====== */
// トップ画面
app.get('/', (req, res) => {
  res.render('index.ejs');
});

// 一覧（例: about）
app.get('/about', (req, res) => {
  res.render('about.ejs');
});

/* ====== 起動 ====== */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
