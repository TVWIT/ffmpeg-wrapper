var childProcess = require('child_process');
var pump = require('pump');
var ProgressStream = require('./lib/progress-stream');

function ffmpeg (args) {
    var process = childProcess.spawn('/usr/local/bin/ffmpeg', args);
    var progressStream = ProgressStream();
    pump(
        process.stderr,
        progressStream
    );

    return {
        process: process,
        progressStream: progressStream
    };
}

module.exports = ffmpeg;

