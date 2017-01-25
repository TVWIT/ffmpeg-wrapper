var through = require('through2');

function ProgressStream () {
    var textBuffer = '';
    var duration;

    var progressStream = through.obj(function (data, enc, cb) {
        var text = data.toString();
        // find the duration
        if (!duration) {
            textBuffer += text;
            duration = findDuration(textBuffer);
        }
        // get progress
        if (duration) {
            var progress = findProgress(duration, text);
            if (!progress) return cb();
            return cb(null, {
                duration: duration,
                progress: progress
            });
        }
        cb();
    });
    return progressStream;
}

function findDuration (stderrText) {
    var durationRegex = /Duration:\s+(\d{2}):(\d{2}):(\d{2}).(\d{1,2})/;
    var text = stderrText.replace("\n", '');
    var m = text.match(durationRegex);
    if (m) {
        var hours = parseInt(m[1], 10);
        var minutes = parseInt(m[2], 10);
        var seconds = parseInt(m[3], 10);
        var duration = hours * 3600 + minutes * 60 + seconds;
        return duration;
    }
}

function findProgress (duration, text) {
    var progRegex2 = /time=(\d+).(\d{2})/;
    var progRegex1 = /time=(\d{2}):(\d{2}):(\d{2})/;
    // 00:00:00 (hours, minutes, seconds)
    var m = text.match(progRegex1);
    if (m) {
        var hours = parseInt(m[1], 10);
        var minutes = parseInt(m[2], 10);
        var seconds = parseInt(m[3], 10);
        var current = hours * 3600 + minutes * 60 + seconds;
        var progress = Math.round((current / duration) * 100);
        return progress;
    }
    // 00.00 (seconds, hundreds)
    var m2 = text.match(progRegex2);
    if (m2) {
        var current = parseInt(m[1], 10);
        var progress = Math.round((current / duration) * 100);
        return progress;
    }
}

module.exports = ProgressStream;

