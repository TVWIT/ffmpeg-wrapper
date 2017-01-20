var childProcess = require('child_process');
var pump = require('pump');
var ProgressStream = require('./lib/progress-stream');

function ffmpeg (args) {
    var _process = childProcess.spawn('/usr/local/bin/ffmpeg', args);
    var progressStream = ProgressStream();
    pump(
        _process.stderr,
        progressStream
    );

    return {
        process: _process,
        progressStream: progressStream
    };
}

module.exports = ffmpeg;

