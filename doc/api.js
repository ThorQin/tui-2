module.exports = function (req, res, next) {
  if (req.url.match(/\/upload.*/)) {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    var msg = {
      "fileId": "fileId",
      "fileName": "File Name.png",
      "mimeType": "image/png"//,
      //"url": "/doc/icon114.png"
    };
    res.write(JSON.stringify(msg));
    res.end();
  } else
    next()
}