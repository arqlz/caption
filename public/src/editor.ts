import { generarTextEditor } from "./components/texteditor";
import { createDiv } from "./components/utils";

function loadFiles(): Promise<[Blob, any]>{
    return fetch("/data/KF7NRC.webm").then(r => r.blob()).then(blob => {
        return fetch("/data/KF7NRC.jsonl").then(r => r.text()).then(text => {
            var json = text.split("\n").filter(f => f.trim().length).map(j => JSON.parse(j))
            return [blob, json] as any
        })
   
    }).catch(console.error)
}
function generarSamplesFromArray(raw: Float32Array, samples = 400) {
    const blockSize = Math.floor(raw.length/samples);
    const filtered = [];
    for (let i = 0; i < samples; i++) {
        let start = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(raw[start+j])
        }
        filtered.push(sum/blockSize)
    }
    const multiplier = Math.pow(Math.max(...filtered), -1);
    const normalized = filtered.map(n => {
        return n * multiplier
    })
    return normalized
}
function generarSamples(audioBuffer: AudioBuffer, samples = 400) {
    const raw = audioBuffer.getChannelData(0);
    return generarSamplesFromArray(raw, samples)
}
function decodeAudio(buffer) {
    var context = new AudioContext();
    return context.decodeAudioData(buffer)
    .then(audioBuffer => {
        return audioBuffer
    })
}
const drawLineSegment = (ctx, x, y, width, isEven: number) => {
    ctx.fillStyle = "#e7534b";
    if (y<3) y = 1;
    y = isEven ? y : -y;
    ctx.fillRect(x,0,width,y)
};


function drawHorizontal(canvas: HTMLCanvasElement, normalizedData: number[]) {
    const dpr = window.devicePixelRatio || 1;    
    const padding = 10;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (canvas.offsetHeight + padding * 2 ) * dpr;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.scale(dpr, dpr);
    ctx.translate( 0, canvas.offsetHeight / 2 + padding); 


    const width = canvas.offsetWidth / normalizedData.length;
    ctx.fillStyle = "#e7534b";
    for (let i = 0; i < normalizedData.length; i++) {
        let x = width * i;
        let h = normalizedData[i] * canvas.offsetHeight - padding
        if (h<3) h = 1;
        if (i%2 == 0 && h > 1) h = -h;

        ctx.fillRect(x,0,width,h)

    }
}
function drawVertical(canvas: HTMLCanvasElement, normalizedData: number[]) {
    const dpr = window.devicePixelRatio || 1;    
    const padding = 10;
    canvas.width = canvas.offsetWidth + padding * 2 * dpr;
    canvas.height = (canvas.offsetHeight ) * dpr;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.scale(dpr, dpr);
    ctx.translate( canvas.offsetWidth / 2 + padding, 0); 



    const width = canvas.offsetHeight / normalizedData.length;
    ctx.fillStyle = "#e7534b";
    for (let i = 0; i < normalizedData.length; i++) {
        let y = width * i;
        let w = normalizedData[i] * canvas.offsetWidth - padding;
        let x = 0;

        if (w<3) w = 1;
        if (i%2 == 0) {
            w = -w;
      
        }

        ctx.fillRect(x,y,w, width)

    }
}




async function build() {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100px";

    var div = createDiv({width: 500, margin: "0 auto"})
    div.append(canvas)
    document.body.append(div);

    /*
    const canvas2 = document.createElement("canvas");
    canvas2.style.width = "100px";
    canvas2.style.height = "100%";
    document.body.append(canvas2);
    */


    var [blob, json] = await loadFiles() ;
    if (!blob) return;
    
    const audioBuffer = await decodeAudio(await blob.arrayBuffer());
    const normalized = generarSamples(audioBuffer);
    drawHorizontal(canvas, normalized)  
    canvas.onmousemove = e => {
        drawHorizontal(canvas, normalized)  
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#e7534b";
        ctx.lineWidth = 3;
        ctx.moveTo(e.offsetX, -canvas.height/2)
        ctx.lineTo(e.offsetX, canvas.height/2)
        ctx.stroke()


        let progress = e.offsetX/canvas.width;
        console.log(progress*audioBuffer.length)
    }
    console.log(json)
    

    document.body.append(generarTextEditor(json))

    /*
    for (let i = 0; i < audioBuffer.length; i+=(8**3)*2) {
        var subset = audioBuffer.getChannelData(0).slice(0, i)
        var normalized = generarSamplesFromArray(subset);
        drawHorizontal(canvas, normalized)   
        drawVertical(canvas2, normalized)   
        await wait();
    }
    return
    var normalized = generarSamples(audioBuffer);
    normalized = normalized.concat(normalized)
    normalized = normalized.concat(normalized)

    function wait(time = 10) {
        return new Promise((resolve) => setTimeout(resolve, time))
    }
    for (var i = 0; i < normalized.length; i++) {
        var sub = normalized.slice(0, i)
        
        drawHorizontal(canvas, sub)   
        drawVertical(canvas2, sub)   
        await wait();
    }*/
 
}


build()