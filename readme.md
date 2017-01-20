# ffmpeg wrapper

## example

```js
var test = require('tape');
var rimraf = require('rimraf');
var Server = require('./mock/s3');
var Ffmpeg = require('../');

var server;
var destFile = __dirname + '/temp/tempfile.mp4';

// we are using a server b/c that's how it works in the transcoder
test('setup', function (t) {
    server = Server(t.end.bind(t));
});

test('ffmpeg', function (t) {
    t.plan(3);
    var args = '-i http://localhost:8000/big_buck_bunny_720p_50mb.mp4 -nostdin -c:a aac -strict -2 -async 1 -c:v libx264 -b:v 2035k -maxrate 2035k -bufsize 2035k -r 24000/1001 -s 1280x720 -pix_fmt yuv420p -movflags faststart-rtphint -c:d copy -profile:v main -weightp 1 -partitions partb8x8+partp4x4+partp8x8+parti8x8 -b-pyramid 1 -weightb 1 -8x8dct 0 -fast-pskip 1 -rc-lookahead 40 -x264-params deadzone-inter=0:deadzone-intra=0 -coder ac -trellis 1 -me_method hex -sws_flags fast_bilinear -sc_threshold 40 -qmin 3 -qmax 51 -qdiff 4 -threads 8 -sn ' + destFile;
    var argsArray = args.replace(/\s+/g, ' ').split(' ');
    var ffmpeg = Ffmpeg(argsArray);

    ffmpeg.process.on('error', console.log.bind(console, 'error'));
    ffmpeg.process.on('exit', console.log.bind(console, 'exit'));

    /*
        emit data like
        {
             progress: 10,
             duration: 100
        }
    */
    ffmpeg.progressStream.once('data', function (data) {
        console.log('progress', data);
        t.equal(typeof data.progress, 'number',
            'should emit progress data');
        t.equal(typeof data.duration, 'number',
            'should emit progress data');
        ffmpeg.process.kill();
    });
    ffmpeg.progressStream.on('data', function (data) {
        // console.log(data);
    });
    ffmpeg.progressStream.on('end', function () {
        t.pass('stream should end');
    });
    ffmpeg.progressStream.on('error', function () {
        t.fail('should not error');
    });
});

test('clean', function (t) {
    rimraf(destFile, function (err) {
        if (err) throw err;
        server.close(t.end.bind(t));
    });
});
```
