import { Presenter } from "./presenter"
declare const io : typeof import("socket.io-client").default
class Recorder {
    private isAvailable = false
    onData = (blob: Blob) => null
    recorder: MediaRecorder
    start(time = 4000) {
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            var recorder = new MediaRecorder(stream, {mimeType: 'audio/webm;codecs=opus'})
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
        }  
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
socket.once("ready", () => {
    console.log("Starting recorder")
    if (rec) {
        rec.stop()
        rec = new Recorder()
    } else {
        rec = new Recorder()
    }

    var presenter = new Presenter(rec)
    rec.onData = blob => {
        sendBlob(blob)   
    }

    rec.start()

    socket.on("mensaje", data => {
        presenter.append(data)
    })
    socket.on("info", (info: {photoUrl: string, eventTitle: string}) => {
        presenter.title = info.eventTitle;
        console.log("on info", info)
    })
})

socket.on("disconnect", () => {
    if (rec) {
        rec.stop()
        rec = null
    }
})
socket.on("connect", () => {    
    var roomkey = location.pathname || ""
    if (roomkey.length < 2) throw new Error("sala invalida")
    roomkey = roomkey.split("/").slice(2)[0];
    socket.emit("broadcast", {roomKey: roomkey, language: "es-DO"});  
})
socket.connect()