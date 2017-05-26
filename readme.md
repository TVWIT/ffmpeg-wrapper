# ffmpeg wrapper

Wrapper around ffmpeg so that it's easier to deal with.


## install

    npm install git://github.com/TVWIT/ffmpeg-wrapper.git#v0.1.0


## example

```js
var Ffmpeg = require('ffmpeg-wrapper')
var ffmpeg = Ffmpeg({
    // this array is passed to child process
    args: ['args']
})

ffmpeg.progressStream.on('data', function (d) {
    /*
    { progress: 1, duration: 200 }
    */
})
ffmpeg.progressStream.on('error', function (err) {
    console.log(ffmpeg.outputText)  // all text output from ffmpeg cli
    console.log(err)  // error object
})
ffmpeg.progressStream.on('end', function () {
    // ffmpeg fnished successfully
})

ffmpeg.cancel(function () {
    // process has exited and stream has closed
    // cancelling the process will cause an error event in the stream
})
```

