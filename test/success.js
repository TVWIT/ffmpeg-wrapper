var test = require('tape');
var fs = require('fs');
var rimraf = require('rimraf');
var Server = require('./mock/s3');
var Ffmpeg = require('../');

/*
    "source_file": "http://localhost:8001/big_buck_bunny_720p_10mb.mp4",
    "destination_file": "/transcode/29fbb855fc9a252a7acca04eb535124387527578.mp4",
    "encoder_options": "-c:a aac -strict -2 -async 1 -c:v libx264 -b:v 2035k -maxrate 2035k -bufsize 2035k -r 24000/1001 -s 1280x720 -pix_fmt yuv420p -movflags faststart-rtphint -c:d copy -profile:v main -weightp 1 -partitions partb8x8+partp4x4+partp8x8+parti8x8 -b-pyramid 1 -weightb 1 -8x8dct 0 -fast-pskip 1 -rc-lookahead 40 -x264-params deadzone-inter=0:deadzone-intra=0 -coder ac -trellis 1 -me_method hex -sws_flags fast_bilinear -sc_threshold 40 -qmin 3 -qmax 51 -qdiff 4 -threads 8 -sn",
    "destBucket": "invintus-mediaworkflow",
    "destKey": "1000000000/29fbb855fc9a252a7acca04eb535124387527578.mp4",
    "srcBucket": "invintus-transcode",
    "srcKey": "1000000000/29fbb855fc9a252a7acca04eb535124387527578.wmv",
    "clientID": "1000000000",
    "eventID": "2016081004",
    "assetID": "29fbb855fc9a252a7acca04eb535124387527578",
    "jobType": "transcode"
*/

var server;
var tempPath = __dirname + '/temp';

// we are using a server b/c that's how it works in the transcoder
test('setup', function (t) {
    server = Server(t.end.bind(t));
});

test('successfully transcode something', function (t) {
    t.plan(4);
    var destFile = tempPath + '/tempfile.mp4';
    var args = '-i http://localhost:8000/big_buck_bunny_720p_10mb.mp4 -nostdin -c:a aac -strict -2 -async 1 -c:v libx264 -b:v 2035k -maxrate 2035k -bufsize 2035k -r 24000/1001 -s 1280x720 -pix_fmt yuv420p -movflags faststart-rtphint -c:d copy -profile:v main -weightp 1 -partitions partb8x8+partp4x4+partp8x8+parti8x8 -b-pyramid 1 -weightb 1 -8x8dct 0 -fast-pskip 1 -rc-lookahead 40 -x264-params deadzone-inter=0:deadzone-intra=0 -coder ac -trellis 1 -me_method hex -sws_flags fast_bilinear -sc_threshold 40 -qmin 3 -qmax 51 -qdiff 4 -threads 8 -sn ' + destFile;
    var argsArray = args.replace(/\s+/g, ' ').split(' ');
    var ffmpeg = Ffmpeg({ args: argsArray });

    /*
        emit data like
        {
             progress: 10,
             duration: 100
        }
    */
    ffmpeg.progressStream.once('data', function (data) {
        t.equal(typeof data.progress, 'number',
            'should emit progress data');
        t.equal(typeof data.duration, 'number',
            'should emit progress data');
    });

    ffmpeg.progressStream.on('data', function (data) {
        console.log('progress', data);
    });

    ffmpeg.progressStream.on('end', function () {
        t.pass('stream should end');
        fs.stat(destFile, function (err) {
            t.notOk(err, 'file should exist');
            rimraf(tempPath + '/*', function (err) {
                if (err) throw err;
            });
        });
    });
    ffmpeg.progressStream.on('error', function (err) {
        t.fail('should not error');
    });
});

test('clean', function (t) {
    rimraf(tempPath + '/*', function (err) {
        if (err) throw err;
        server.close(t.end.bind(t));
    });
});

