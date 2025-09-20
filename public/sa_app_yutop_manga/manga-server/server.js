const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// DB初期化
const db = new sqlite3.Database("manga.db", (err) => {
  if (err) console.error(err);
  else console.log("Connected to SQLite DB");
});

// テーブル作成
db.run(
  `CREATE TABLE IF NOT EXISTS manga (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    volume INTEGER NOT NULL,
    comment TEXT,
    url TEXT,
    order_index INTEGER DEFAULT 0
  )`
);

// 全取得
app.get("/manga", (req, res) => {
  db.all(
    "SELECT * FROM manga ORDER BY order_index ASC, id ASC",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// 追加
app.post("/manga", (req, res) => {
  const { title, volume, comment, url } = req.body;
  db.run(
    "INSERT INTO manga (title, volume, comment, url, order_index) VALUES (?, ?, ?, ?, (SELECT IFNULL(MAX(order_index), -1)+1 FROM manga))",
    [title, volume, comment, url],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, volume, comment, url });
    }
  );
});

// 削除
app.delete("/manga/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM manga WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });
});

// 編集
app.put("/manga/:id", (req, res) => {
  const { id } = req.params;
  const { title, volume, comment, url } = req.body;
  db.run(
    "UPDATE manga SET title = ?, volume = ?, comment = ?, url = ? WHERE id = ?",
    [title, volume, comment, url, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    }
  );
});

// 並び替え保存
app.put("/manga/order", (req, res) => {
  const { orderList } = req.body; // [{id, order_index}, ...]
  if (!orderList || orderList.length === 0) return res.json({ success: true });

  const stmt = db.prepare("UPDATE manga SET order_index = ? WHERE id = ?");
  let completed = 0;

  orderList.forEach((m) => {
    stmt.run(m.order_index, m.id, function(err) {
      if (err) console.error("Order update error:", err);
      completed++;
      if (completed === orderList.length) {
        stmt.finalize();
        res.json({ success: true });
      }
    });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
