import * as sharp from "sharp"
import ft = require('fourier-transform');
var db = require('decibels')
const outputFile = __dirname+"/../../../test.png"




var chunks = []
export async function drawSpect(buffer: Uint8Array) {
    chunks.push(buffer)
    if (chunks.length>3) chunks = chunks.slice(chunks.length- 4)

    var data = Buffer.concat(chunks)
   
    var byteRate =  16;
    var sampleRate = 16000;
    var frequency = 440;
 

    var data16 = new Uint16Array(data.buffer);

    var size =  1 << 31 - Math.clz32(data16.length);   
    console.log({size})  
    var spectrum: Float32Array = ft(data16.slice(0, size));

    let height = 128
    let width = spectrum.length/height;
  

    var decibels = spectrum.map((value) => {
        let dc = db.fromGain(value);
        if (dc < 0) return 0;
        return dc**2
 
    } )
    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;
    for (var d of decibels) {
        if (d>max) max = d;
        if (d<min) min = d;
    }

    decibels = decibels.map((value) => {
        return (value-min ) * (255 / (max-min))
    } )

    min = Number.MAX_VALUE;
    max = Number.MIN_VALUE;
    for (var d of decibels) {
        if (d>max) max = d;
        if (d<min) min = d;
    }
    console.log({min, max})
    let outBuffer = Buffer.from( decibels)


    try {
        let img = sharp( outBuffer, {raw: {
            width: width, 
            height: height,
            channels: 1
        }})

        img.resize({width: width*2, height: height*2})
        await img.png().toFile(outputFile).catch(err => {
            console.error("Error, no se pudo construir el BMP")
        })
    } catch(err) {
        console.log("Error en sharp", (err+"").slice(0, 1023))
    }
}