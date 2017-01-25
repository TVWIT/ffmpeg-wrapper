# ffmpeg wrapper

Wrapper around ffmpeg so that it's easier to deal with.


## install

    npm install git://github.com/TVWIT/ffmpeg-wrapper.git#v0.1.0


## example

```js
var Ffmpeg = require('ffmpeg-wrapper')
var ffmpeg = Ffmpeg({
    args: 'args'
})

ffmpeg.progressStream.on('data', function (d) {
    /*
    { progress: 1, duration: 200 }
    */
})
ffmpeg.progressStream.on('error', function () {
    // all text output from ffmpeg cli
    console.log(ffmpeg.outputText)
})
ffmpeg.progressStream.on('end', function () {
    // ffmpeg fnished successfully
})

ffmpeg.cancel(function () {
    // process has exited and stream has closed
})
```

