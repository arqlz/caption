import * as fs from "fs"
import * as path from "path"
import prism = require('prism-media');
import {Writable, Readable} from "stream"
const WaveFile = require('wavefile').WaveFile;
import * as wavConverter from 'wav-converter'



var index = 0
export class AudioDecodeSesion {
    stream: Readable 
    pushes = 0
    onData = (buffer: Buffer, index: number) => null
    onEnd = (b?: Buffer) => { }
    start() {      
        var index = 0
        var writeable = new Writable({
            write: (chunk, encoding, next) => {       
                this.onData(chunk, index)              
                index++;      
                next()
            }
        }) as any
        writeable.end = async () => {
            console.log("end of stream")
            return this.onEnd()
        }
        this.stream = new Readable({ read: (size) => {
         }})
        var stream = this.stream;

        var demuxer = new prism.opus.WebmDemuxer()
        var decoder = new prism.opus.Decoder({rate: 48000, channels: 1, frameSize: 960})
        stream
        .pipe(demuxer)
        .pipe(decoder) 
        .pipe(writeable)
    }
    toWav(buffer: Buffer): Buffer {
        var wavData = wavConverter.encodeWav(buffer, {
            numChannels: 1,
            sampleRate: 48000,
            byteRate: 16
        })
        var data = new WaveFile(wavData)
        data.toSampleRate(16000)
        return data.toBuffer()
    }

    next(buffer: Buffer) {

        this.stream.push(buffer)
        this.pushes++
        console.log("PUSH NEXT", this.pushes)        
    }
    decode(buffer: Buffer) {
        var chunks = []
        var writeable = new Writable({
            write: (chunk, encoding, next) => {
                chunks.push(chunk)
                this.onData(chunk, index)              
                index++;      
                next()
            }
        }) as any
        writeable.end = async () => {   
            var b = Buffer.concat(chunks)
            return this.onEnd(b)
        }
        this.stream = Readable.from(buffer)
        let stream = this.stream

        stream
        .pipe(new prism.opus.WebmDemuxer())
        .pipe( new prism.opus.Decoder({rate: 48000, channels: 1, frameSize: 960})) 
        .pipe(writeable)
    }
    stop() {
        this.stream.emit('end')
    }
}
/*
export async function guardarRealtime(filename: string, buffer: Buffer) {
    var file_path = path.resolve(__dirname+"/../../../public/data/", filename)
    var existe = await fs.promises.stat(file_path).catch( e => false)
    if (existe) {
        console.log("el archivo existe, apendeando")
        await fs.promises.appendFile(file_path, buffer)
    } else {
        console.log("el archivo no existe, creandolo")
        await fs.promises.writeFile(file_path, buffer)
    }

}




var chunks = []
var session: AudioDecodeSesion


export function easyDecode(buffer: Buffer) {
    return new Promise<Buffer>((resolve) => {
        if (!session) {
            session = new AudioDecodeSesion()
            chunks = []        
            session.start()
        }
        session.onData = (buffer: Buffer) => {
            chunks.push(buffer)
            
            if (chunks.length >= 100) {
                var b = session.toWav(Buffer.concat(chunks))
                chunks = [buffer]
                resolve(b) 
            }          
        }
        session.onEnd = () => {        
            var buffer = session.toWav(Buffer.concat(chunks))
            resolve(buffer)
        }

        session.next(buffer)
    })
}


*/