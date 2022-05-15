import { generarTextEditor } from "./components/texteditor";
import { createDiv, createElement } from "./components/utils";
import { loadData } from "./utils/loadDocument";
declare const sessions;

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

async function build() { 

    console.log(sessions)
    var [blob, doc] = await loadData(sessions);
    if (!blob) return;


    var div = createDiv({width: 500, margin: "0 auto"})  
    const visualization = createDiv("row")
    const canvas = document.createElement("canvas");
    canvas.classList.add("flex")
    canvas.style.width = "100%";
    canvas.style.height = "100px";
    visualization.append(canvas);
    div.append(visualization)

    const photo = createDiv({height: 150, width: "100%", background: "#00000022", margin: "30px auto"})
    
    let img = createElement("img", {width: "100%"}) as HTMLImageElement;
    console.log(doc.photoUrl)
    if (doc.photoUrl) img.src = doc.photoUrl;
    photo.append(img)
    
    photo.onclick = () => {
        let input = createElement("input") as HTMLInputElement;
        input.type = "file";
        input.accept = "image/jpeg"
        input.onchange = (e: any) => {
            let image_file = e.target.files[0];
            var form = new FormData();
            form.append("file", image_file);
            fetch(`/api/images/${doc.roomId}`, {method: "POST", body: form})
            .then(r => r.json()).then(res => {
                doc.photoUrl = res.result;
                img.src = doc.photoUrl;
                doc.save().then(console.log, console.error)
               
                
            }, console.error)
        }
        input.click()
    }
    div.append(photo)

    const audioControls = createDiv("row center", {marginTop: 10}); 
    const playPauseButton = createElement("button", {width: 100, height: 50});
    playPauseButton.innerText = "Play";
    audioControls.append(playPauseButton);
    const downloadAudioButton = createElement("button", {width: 140, height: 50, marginLeft: 10});
    downloadAudioButton.innerText = "Download";
    audioControls.append(downloadAudioButton);


    div.append(audioControls)
    document.body.append(div);

    
    const audioBuffer = await decodeAudio(await blob.arrayBuffer());
    const normalized = generarSamples(audioBuffer);
    drawHorizontal(canvas, normalized)  


    let editor = generarTextEditor(doc, document.body);
    var context = new AudioContext();
    var source: AudioBufferSourceNode

    canvas.onmousemove = e => {
        drawHorizontal(canvas, normalized)  
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#e7534b";
        ctx.lineWidth = 3;
        ctx.moveTo(e.offsetX, -canvas.height/2)
        ctx.lineTo(e.offsetX, canvas.height/2)
        ctx.stroke()


        let progress = e.offsetX/canvas.width;
        let segundos = audioBuffer.duration * progress ;


        var after_this = doc.near(segundos)
        if (after_this.length) {
            editor.clearMark().mark(after_this[0].id.toString())
        } 
    }   

    function playAudio(offset: number) {
        if (source) source.stop()
        playPauseButton.innerText = "Stop"
        source = context.createBufferSource()
        source.buffer = audioBuffer;
        source.connect(context.destination)
        source.start(0, offset)
    }
    canvas.onclick = (e) => {
        let progress = e.offsetX/canvas.width;
        let segundos = audioBuffer.duration * progress ;
        
        var target = doc.near(segundos)
        if (target.length) playAudio( target[0].id / 10000000)
    }
    playPauseButton.onclick = () => {
        if (source) {
            source.stop()
            source = null;
            playPauseButton.innerText = "Play"
        } else playAudio(0)
    }
    downloadAudioButton.onclick = () => {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        let url = window.URL.createObjectURL(blob)
        a.href = url;
        a.download = doc.roomId+".webm";
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
    }

}

build()

