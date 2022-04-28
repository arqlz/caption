import { createDiv, createElement } from "./components/utils"

declare const io : typeof import("socket.io-client").default
class Recorder {
    onData = (blob: Blob) => null
    recorder: MediaRecorder
    start(time = 3000) {
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            var recorder = new MediaRecorder(stream, {mimeType: 'audio/webm;codecs=opus'})
            recorder.ondataavailable = (e) => {                
                this.onData(e.data)
            }
            this.recorder = recorder
            recorder.start(time)
        })
    }
    stop() {
        this.recorder.stop()
    }
}
/*
function Ui(recorder: Recorder) {
    var div = document.createElement("div")
    var button = document.createElement("button")
    button.innerHTML = "Stop"
    button.onclick = () => recorder.stop()
    div.append(button)
    var textarea = document.createElement("div")
    div.append(textarea)
    document.body.appendChild(div)
    function append(text: string) {
        textarea.innerHTML += " "+text
    }
    return {append}
}
*/
function sendBlob(blob: Blob): Promise<string> {
    var form = new FormData()
    form.append("blob", blob)
    return new Promise(() => {
        socket.emit("blob", blob)
    })
}


class Presenter {
    textContainner: HTMLDivElement;
    control: HTMLDivElement;
    lines: {[id: string]: HTMLDivElement} = {}
    queue: {result: string, id: string}[] = []
    constructor() {
        var div = createDiv({width: "100%", height: "100%", background: "#111111"})

        this.control = createDiv()
        var stopButton = createElement("button")
        stopButton.innerHTML = "STOP"
        stopButton.onclick = () => {
            stopButton.disabled = true
            rec.stop()
        }
        this.control.append(stopButton)
        div.append(this.control)


        var show = createDiv({width: 350, textAlign: "center", margin: "auto auto", color: "#ffffff", fontSize: 20})
        this.textContainner = show
        div.append(show)

        document.body.append(div)
        setInterval(() => {
            this.appendWord()
        }, 100)
    }
    appendWord() {    
        if (this.queue.length) {
            var w = this.queue.splice(0, 1)[0]
            if (!this.lines[w.id]) {
                var div = createDiv()
                this.textContainner.append(div)
                this.lines[w.id] = div;
            }
            this.lines[w.id].innerHTML = w.result

        }
    }

    append(data: {result: string, id: string}) {
        this.queue.push(data)
   
    }
}



var socket = io()

var rec: Recorder 
socket.on("ready", () => {
    console.log("Starting recorder")
    if (rec) {
        rec.stop()
        rec = new Recorder()
    } else {
        rec = new Recorder()
    }

    var presenter = new Presenter()
    rec.onData = blob => {
        sendBlob(blob).then(text => {
            //ui.append(text)
        })    
    }
    rec.start()

    socket.on("mensaje", data => {
        //ui.append(data.result)
        presenter.append(data)
    })
    //var ui = Ui(rec)
})
socket.on("disconnect", () => {
    console.log("disconected")
    if (rec) {
        rec.stop()
        rec = null
    }
})
socket.on("connect", () => {
    console.log("connected")
})
socket.on("hello", () => {
    socket.emit("broadcast", {roomKey: "1JY76G7"})
  
})
socket.connect()