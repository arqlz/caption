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
    var roomkey = location.pathname || ""
    if (roomkey.length < 2) {
        throw new Error("sala invalida")
        return
    }
    roomkey = roomkey.split("/").slice(2)[0];
    socket.emit("broadcast", {roomKey: roomkey});  
})
socket.on("joined",  (roomId) => {
    console.log("Joined to room")
});  
socket.connect()