const express = require('express');
const path = require('path');

const app = express();

// ejs 相关
app.engine('.html', require('ejs').__express);

app.set('view engine', 'html');

// 静态文件
app.set('views', './demo');
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/demo', (req, res, next) => {
  res.render('index-app.html');
});

app.use('/demo_js', (req, res, next) => {
  res.render('index.html');
});

app.use('/di', (req, res, next) => {
  res.render('di.html');
});


app.get('/success', (req, res, next) => {
  setTimeout(() => {
    res.send({
      message: 1,
    });
  }, 2000);
});

app.get('/error', (req, res, next) => {
  res.send({
    message: 1,
  });
});

app.listen(1234);
console.log(`listening port http://localhost:1234/demo`);

module.exports = app;
