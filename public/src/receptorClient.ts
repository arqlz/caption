import { Presenter } from "./presenter";
declare const io : typeof import("socket.io-client").default
var presenter = new Presenter()


var socket = io()


socket.on("disconnect", () => {
    console.log("disconected")
})
socket.on("connect", () => {
    var roomId = location.pathname || ""
    if (roomId.length < 2) {
        throw new Error("sala invalida")
    }

    socket.on("info", (info: {photoUrl: string, eventTitle: string}) => {
        presenter.title = info.eventTitle;
    })
    roomId = roomId.split("/").slice(2)[0];
    socket.emit("join", {roomId: roomId});  

})


socket.on("joined",  (roomId) => {
    socket.on("mensaje", data => {
        presenter.append(data)
    })
  
    console.log("Joined to room")
});  

socket.connect()