import { Presenter } from "./presenter"
declare const io : typeof import("socket.io-client").default
class Recorder {
    private isAvailable = false
    onData = (blob: Blob) => null
    recorder: MediaRecorder
    startTime = 0;
    start(time = 4000) {
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            var recorder = new MediaRecorder(stream, {mimeType: 'audio/webm;codecs=opus'})
            this.startTime = Date.now();
            recorder.ondataavailable = (e) => {                
                this.onData(e.data)
            }
            this.recorder = recorder
            recorder.start(time)
            this.isAvailable = true;     
        })
    }
    stop() {
        if (this.isAvailable) {
            this.isAvailable = false;
            this.recorder.stop()
            for (let cb of this.listenners) cb()
        }  
    }
    private listenners = [];
    onStop(cb) {
        this.listenners.push(cb)
    }
}

function sendBlob(blob: Blob): Promise<string> {
    var form = new FormData()
    form.append("blob", blob)
    return new Promise(() => {
        socket.emit("blob", blob)
    })
}


var socket = io()

var rec: Recorder 
var presenter : Presenter
socket.once("ready", () => {
    console.log("Starting recorder")

    rec.onData = blob => {
        sendBlob(blob)   
    }
    rec.start()

    socket.on("mensaje", data => {
        presenter.append(data)
    })
    var interval = setInterval(() => {
        presenter.timeElapsed =  Date.now() - rec.startTime  
    }, 200)

    rec.onStop(() => {
        clearInterval(interval);
    })

})

socket.on("disconnect", () => {
    if (rec) {
        rec.stop()
        rec = null
    }
})
socket.on("error", (data) => {
    console.error(data)
})
socket.on("connect", () => {    
    var roomkey = location.pathname || ""
    if (roomkey.length < 2) throw new Error("sala invalida")
    roomkey = roomkey.split("/").slice(2)[0];

    if (rec) {
        rec.stop()
    } 
    rec = new Recorder()
    presenter = new Presenter(rec, roomkey)
    socket.on("info", (info: {photoUrl: string, eventTitle: string}) => {
        presenter.title = info.eventTitle;
        console.log("on info", info)
    })

    socket.emit("broadcast", {roomKey: roomkey, language: "es-DO"}); 
    
    
})
socket.connect()