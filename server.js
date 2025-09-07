// httpモジュールをrequireする
const http = require('node:http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

// webサーバーを作る
const server = http.createServer((req, res)=>{
    //ブラウザからアクセスが来た時の処理
    if (req.url == '/' || req.url == 'index.html'){
        // index.htmlを返す
        const html = fs.readFileSync('public/index.html');
        res.writeHead(200, {"Content-Type":"text/html"});
        res.end(html);
    }else if (req.url == '/css/style.css'){
        // style.cssを返す
        const css = fs.readFileSync('public/css/style.css');
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(css);
    }else if (req.url == '/about'){
        // about.htmlを返す
        const html = fs.readFileSync('public/about.html');
        res.writeHead(200, {"Content-Type":"text/html"});
        res.end(html);
    }
    else if (req.url == '/app1'){
        // app1.htmlを返す
        const html = fs.readFileSync('public/app1.html');
        res.writeHead(200, {"Content-Type":"text/html"});
        res.end(html);
    }
    else if (req.url.startsWith('/img/')) {
        const imgPath = path.join(__dirname, 'public', req.url);
        fs.readFile(imgPath, (err, data) => {
            if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Image not found');
            }
        res.writeHead(200, { 'Content-Type': 'image/' + path.extname(imgPath).slice(1) });
        res.end(data);
        });
    }
    else{
        // それ以外は404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
    

    // if (req.method == "GET"){

    // }
    // if (req.methon == "POST"){
        
    // }
});

server.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});