"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyDecode = exports.AudioProcessorSession = exports.guardarRealtime = void 0;
const fs = require("fs");
const path = require("path");
const prism = require("prism-media");
const stream_1 = require("stream");
const WaveFile = require('wavefile').WaveFile;
const wavConverter = require("wav-converter");
async function guardarRealtime(filename, buffer) {
    var file_path = path.resolve(__dirname + "/../../../public/data/", filename);
    var existe = await fs.promises.stat(file_path).catch(e => false);
    if (existe) {
        console.log("el archivo existe, apendeando");
        await fs.promises.appendFile(file_path, buffer);
    }
    else {
        console.log("el archivo no existe, creandolo");
        await fs.promises.writeFile(file_path, buffer);
    }
}
exports.guardarRealtime = guardarRealtime;
var index = 0;
class AudioProcessorSession {
    constructor() {
        this.onData = (buffer, index) => null;
        this.onEnd = (b) => { };
        this.pushes = 0;
    }
    start() {
        var index = 0;
        var writeable = new stream_1.Writable({
            write: (chunk, encoding, next) => {
                index++;
                this.onData(chunk, index);
                index++;
                next();
            }
        });
        writeable.end = async () => {
            console.log("end of stream");
            return this.onEnd();
        };
        this.stream = new stream_1.Readable({ read: (size) => {
            } });
        var stream = this.stream;
        var demuxer = new prism.opus.WebmDemuxer();
        var decoder = new prism.opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 });
        stream
            .pipe(demuxer)
            .pipe(decoder)
            .pipe(writeable);
    }
    toWav(buffer) {
        var wavData = wavConverter.encodeWav(buffer, {
            numChannels: 1,
            sampleRate: 48000,
            byteRate: 16
        });
        var data = new WaveFile(wavData);
        data.toSampleRate(16000);
        return data.toBuffer();
    }
    next(buffer) {
        this.stream.push(buffer);
        this.pushes++;
        console.log("PUSH NEXT", this.pushes);
    }
    decode(buffer) {
        var chunks = [];
        var writeable = new stream_1.Writable({
            write: (chunk, encoding, next) => {
                chunks.push(chunk);
                this.onData(chunk, index);
                index++;
                next();
            }
        });
        writeable.end = async () => {
            var b = Buffer.concat(chunks);
            return this.onEnd(b);
        };
        this.stream = stream_1.Readable.from(buffer);
        let stream = this.stream;
        stream
            .pipe(new prism.opus.WebmDemuxer())
            .pipe(new prism.opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 }))
            .pipe(writeable);
    }
    stop() {
        this.stream.emit('end');
    }
}
exports.AudioProcessorSession = AudioProcessorSession;
class AudioProcessorCustom extends AudioProcessorSession {
    constructor() {
        super(...arguments);
        this.data = [];
        this.dataSize = 0;
        this.onData = (chunk, index) => {
            if (this.dataSize < 1024 * 312) {
                this.data.push(chunk);
                this.dataSize += chunk.length;
            }
            else {
                var buffer = Buffer.concat(this.data);
                this.data = [];
                this.dataSize = 0;
                this.salvarBuffer(buffer, "a" + index);
            }
        };
        this.onEnd = () => {
            if (this.data.length) {
                var buffer = Buffer.concat(this.data);
                this.data = [];
                this.dataSize = 0;
                this.salvarBuffer(buffer, "aend");
                console.log("salvando el residuo");
            }
        };
    }
    async salvarBuffer(buffer, name) {
        var wavData = wavConverter.encodeWav(buffer, {
            numChannels: 1,
            sampleRate: 48000,
            byteRate: 16
        });
        var data = new WaveFile(wavData);
        data.toSampleRate(16000);
        await fs.writeFileSync(__dirname + `/../../../public/data/${name}.wav`, data.toBuffer());
    }
}
async function emular() {
    var file_path = path.resolve(__dirname + "/../../../public/data/test.webm");
    var buffer = fs.readFileSync(file_path);
    var size = 1024 * 16;
    var index = 0;
    function queue() {
        let end = index + size > buffer.length ? buffer.length : index + size;
        p.next(buffer.slice(index, end));
        index = end;
        setTimeout(function () {
            if (index < buffer.length)
                queue();
            else {
                p.stop();
            }
        }, 1000);
    }
    var p = new AudioProcessorCustom();
    p.start();
    queue();
}
var chunks = [];
var session;
function easyDecode(buffer) {
    return new Promise((resolve) => {
        var size = buffer.length;
        if (chunks && chunks.length) {
            //size += chunks[0].length
        }
        if (!session) {
            session = new AudioProcessorSession();
            chunks = [];
            session.start();
        }
        session.onData = (buffer) => {
            chunks.push(buffer);
            if (chunks.length >= 100) {
                var b = session.toWav(Buffer.concat(chunks));
                chunks = [buffer];
                resolve(b);
            }
        };
        session.onEnd = () => {
            var buffer = session.toWav(Buffer.concat(chunks));
            resolve(buffer);
        };
        session.next(buffer);
    });
}
exports.easyDecode = easyDecode;
