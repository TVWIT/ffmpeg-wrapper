var assert = require('assert');
var Writable = require('flush-write-stream');
var once = require('once');
var childProcess = require('child_process');
var pump = require('pump');
var ProgressStream = require('./lib/progress-stream');
var noop = function () {};

function Ffmpeg (opts) {
    if (!(this instanceof Ffmpeg)) return new Ffmpeg(opts);
    assert(opts.args && opts.args.length, 'we need args for ffmpeg');

    var self = this;
    this._process = childProcess.spawn('/usr/local/bin/ffmpeg', opts.args);
    this.progressStream = ProgressStream();
    this.outputText = '';

    var sink = Writable(function onData (data, enc, cb) {
        self.outputText += data.toString();
        cb();
    });

    var onErr = once(function (err) {
        self.progressStream.emit('error', err);
        self.progressStream.end();
    });

    this._process.once('error', onErr);
    this._process.once('exit', function (code, signal) {
        console.log('exit', code, signal);
        if (code !== 0) {
            var _err = new Error ('ffmpeg exit with code ' + code);
            return onErr(_err);
        }
        self.progressStream.end();
    });

    // this._process.stderr.on('data', function (d) {
    //     self.progressStream.write(d);
    // });
    this._process.stderr.pipe(this.progressStream, {
        end: false
    });
    pump( this._process.stderr, sink );
}

Ffmpeg.prototype.cancel = function (cb) {
    cb = cb || noop;
    this._process.once('exit', function (code, signal) {
        cb(null);
    });
    this._process.kill();
};

module.exports = Ffmpeg;

