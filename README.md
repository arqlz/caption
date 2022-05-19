# API
Las applicaciones se comunican a travez de web sockets, usando socketio, por el momento;

Cada sesion tiene un identificador unico, o ROOMID, que debe enviarse luego del evento **connection** a travez del canal **join**.
```
socket.emit({roomID: "ROOMID"})
```

En el momento de registrarse a un **room** se recibe la informacion general de la sala
`
socket.on("info", function (room_info) {

})
`

Una vez subscrito a un **room**, se reciben los mensajes mientras son generados:
`
socket.on("mensaje", function (mensajeData) {
    var text = mensajeData.result; 
    var timeOffset = mensajeData.id;
})

`

Para solicitar un resumen de todos los mensajes

Una vez subscrito a un **room**, se reciben los mensajes mientras son generados:
`
socket.on("replay", function (mensajeDataList) {
    // a list of messages
})
socket.emit("replay")

Cada sesion tiene su propio identificador, para adquirir una lista de sesiones:
`
socket.on("list_sessions", function (session_list) {

})
socket.emit("list_sessions")
`

Una vez la sesion ha terminado el servidor responde con el evento **end**.
`
socket.on("end", function () {
    // end event handling
})
`
