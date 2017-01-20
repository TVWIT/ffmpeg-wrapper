var ecstatic = require('ecstatic')({ root: __dirname });
var http = require('http');

module.exports = function (cb) {
    return http.createServer(ecstatic).listen(8000, cb);
};

