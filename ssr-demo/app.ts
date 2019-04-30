import express = require('express');

const path = require('path');

const app = express();

// ejs 相关
app.engine('.html', require('ejs').__express);

app.set('view engine', 'html');

// 静态文件
app.set('views', './');
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/indiv-doc', async(req, res) => {
  const render = require('./render');
  const content = await render.render(req.url, req.query, '/indiv-doc');
  // console.log(2221111, content);
  res.render('dev.html', {
    content,
  });
});

app.listen(2234);
console.log(`listening on http://localhost:2234/indiv-doc`);

module.exports = app;
