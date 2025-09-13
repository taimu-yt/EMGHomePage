const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001; // Reactが使う3000番ポートとは別のポートを指定

// ミドルウェアの設定
app.use(cors()); // CORSを許可する
app.use(express.json()); // POSTリクエストのbodyをJSONとして解析する

// データベースへの接続 (ファイルがなければ自動的に作成される)
const db = new sqlite3.Database('./bookmarks.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the bookmarks.db SQlite database.');
});

// 起動時にテーブルがなければ作成する
db.run('CREATE TABLE IF NOT EXISTS bookmarks(id TEXT PRIMARY KEY, name TEXT, url TEXT)');

// --- APIエンドポイントの作成 ---

// すべてのブックマークを取得
app.get('/api/bookmarks', (req, res) => {
  db.all('SELECT * FROM bookmarks', [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

// 新しいブックマークを追加
app.post('/api/bookmarks', (req, res) => {
  const { id, name, url } = req.body;
  db.run(`INSERT INTO bookmarks(id, name, url) VALUES(?, ?, ?)`, [id, name, url], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.json({ id, name, url });
  });
});

// [DELETE] ブックマークを削除
app.delete('/api/bookmarks/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM bookmarks WHERE id = ?`, id, function(err) {
    if (err) {
      // 失敗した場合、エラーメッセージとステータス500を返す
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    }
    // 成功した場合、成功メッセージとステータス200を返す
    console.log(`Row(s) deleted: ${this.changes}`);
    res.status(200).json({ message: 'Deleted successfully', id });
  });
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});