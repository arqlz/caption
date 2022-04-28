"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const socket_io_1 = require("socket.io");
const ejs = require("ejs");
const opus_1 = require("./decoders/opus");
const azure_1 = require("./speech_recognition/azure");
const room_1 = require("./rooms/room");
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.engine('.html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/../../views');
app.use(express.json());
app.use("/js", express.static(__dirname + '/../../public/js'));
app.get("/", (req, res) => {
    res.render("emiter.html", {});
});
app.get("/room/:roomId", (req, res) => {
    res.render("room.html", { roomId: req.params.roomId });
});
var PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    console.log(`listening to http://localhost:${PORT}`);
    console.log("_____________________");
    require("./speech_recognition/azure");
    require("./ia/speech");
    const io = new socket_io_1.Server(server);
    io.on("connection", (socket) => {
        var decoder;
        console.log("new connection stablished");
        socket.on("disconnect", () => {
            console.log("DISCONECTED");
            if (decoder) {
                decoder.stop();
                decoder = null;
            }
        });
        var room;
        socket.on("broadcast", ({ roomKey }) => {
            if (room)
                return;
            console.log(`Session de transcripcion iniciada en ${roomKey}`);
            var waiting_list = 0;
            var chunks = [];
            room = new room_1.Room(roomKey);
            decoder = new opus_1.AudioProcessorSession();
            decoder.start();
            var azureSession = new azure_1.AzureSession();
            azureSession.onData = (data) => {
                waiting_list--;
                io.sockets.emit("mensaje", { result: data.text, id: data.offset, speakerId: data.speakerId + "" });
            };
            decoder.onData = (buffer) => {
                let min_save_interval = 20;
                chunks.push(buffer);
                if ((chunks.length >= min_save_interval && waiting_list < 5) || chunks.length > min_save_interval + 5) {
                    waiting_list++;
                    console.log("paquete enviado a azure");
                    azureSession.push(Buffer.concat(chunks));
                    chunks = [];
                }
            };
            socket.on("blob", (blob) => {
                decoder.next(blob);
            });
            socket.emit("ready");
            socket.join(room.roomId);
        });
        socket.on("join", ({ roomId }) => {
            console.log(`Nuevo escucha en la sala: ${roomId}`);
            socket.join(roomId);
        });
        socket.emit("hello", "hello");
    });
});
