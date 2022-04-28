import * as ONNX from "onnxjs-node";
import * as fs from "fs"
var { Tensor, InferenceSession } = ONNX
import * as PATH from "path"
import bent from "bent"

var session: ONNX.InferenceSession
var labels: string[]
var blank_idx: number
var space_idx: number
export async function descargarONNXModel() {
    try {
        var url = "https://models.silero.ai/models/es/es_v1.onnx"
        var path = PATH.resolve(__dirname+"/../../../public/data/es_v1.onnx")
        var stat = await fs.promises.stat(path).then(r => !!r).catch(r => false)

        if (stat == false) {
            console.log("El archivo no fue encontrado, en su lugar se ha iniciado una descarga")
            var buffer = await bent("buffer")(url)
            await fs.promises.writeFile(path, buffer as any)
            console.log("el modelo se ha salvado localmente")
        }
    }catch(err) {
        throw new Error("Error descargarONNXModel: "+err)
    }
    session = new InferenceSession();
    var onnxModel = await session.loadModel(path);

    labels = fs.readFileSync(PATH.resolve(__dirname+"/../../../public/data/labels.txt"), {encoding: "utf-8"}).split(",")
    blank_idx = labels.indexOf('_')
    space_idx = labels.indexOf(' ')

    console.log("ONNX ready")
}

import * as wav from 'node-wav';
function argmax(arr: Float32Array, shape: number[]) {
    var r: number[] = [];
    var row_size = shape[0]
    var column_size = shape[1]

    for (var y = 0; y < row_size; y++) {
        let max = Number.MIN_VALUE
        let index = -1;
        for (var x = 0; x < column_size; x++) {        
            let Y = arr[x+column_size*y]
            if ( Y > max) {
                max = Y
                index = x
            }
        }
        r.push(index)
    }
    return r
}
function decode(args: number[]) {
    var for_string: string[] = []
    for (var i of args) {
        if (i == 997) {
            if (for_string.length) {
                console.log("encontre algo")
                var prev = for_string.splice(for_string.length-1, 1)
                for_string.push('$')
                for_string.push(prev[0])   
            } else {
                console.log("agregar espacio")
                for_string.push(' ')
            }                         
        } 
        if (i != blank_idx) {
            for_string.push(labels[i])            
        }
    }
    let frase = [for_string[0]]
    for (let i = 1; i < for_string.length; i++) {
        if (for_string[i] != for_string[i-1] ) frase.push(for_string[i])
    }
    return  frase.join("").replace(/\$/gi, "").trim()
}
function procesarAudioBuffer(buffer: Float64Array) {
    return new Promise<string>(async (resolve, reject) => {
        try {
            var data = buffer
            var f32 = Float32Array.from(data) 
            var t = new Tensor( new Float32Array(Float32Array.from(f32)), "float32", [1, data.length])
            session.run([t]).then( (result : Map<string, any>) => {
                var dims = result.get("output").dims
                var data = result.get("output").data as Float32Array  
                var args = argmax(data, dims.slice(1,3))  
        
                var response = decode(args).trim()
    
                resolve(response)
            }, reject)

        } catch(err) {
            console.error(err)
            reject(err)
        } 
    })
}


export async function audioATexto(wavBuffer: Buffer) {
    var decoded = wav.decode(wavBuffer)
    fs.promises.writeFile(__dirname+"/../../test.wav", wavBuffer)

    var result = await procesarAudioBuffer(decoded.channelData[0])
    return result
}

descargarONNXModel()