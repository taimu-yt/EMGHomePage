const express = require('express');
const app = express();
const PORT = 8000;

// CSSや画像ファイルを置くフォルダを指定するコード
app.use(express.static('public'));

// トップ画面を表示するルーティング
app.get('/',(req, res) => {
  res.render('index.ejs')
})

// 一覧画面を表示するルーティング
app.get('/about', (req, res) => {
  res.render('about.ejs');
});

// サーバーを起動するコード
app.listen(PORT);