import { Presenter } from "./presenter";
declare const io : typeof import("socket.io-client").default
var presenter = new Presenter()


var socket = io()

socket.on("ready", () => {
    console.log("Starting recorder")

    var presenter = new Presenter()

    socket.on("mensaje", data => {
        presenter.append(data)
    })
})
socket.on("disconnect", () => {
    console.log("disconected")
})
socket.on("connect", () => {
    console.log("connected")
})
socket.on("hello", () => {
    var roomId = location.pathname || ""
    if (roomId.length < 2) {
        throw new Error("sala invalida")
        return
    }
    roomId = roomId.split("/").slice(2)[0];
    socket.emit("join", {roomId: roomId});  

})
socket.on("joined",  (roomId) => {
    console.log("Joined to room")
});  

socket.connect()