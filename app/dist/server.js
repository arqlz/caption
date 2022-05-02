"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const socket_io_1 = require("socket.io");
const ejs = require("ejs");
const opus_1 = require("./decoders/opus");
const azure_1 = require("./speech_recognition/azure");
const qrgenerator_1 = require("./rooms/qrgenerator");
const room_1 = require("./rooms/room");
const db_1 = require("./db");
var PORT = process.env.PORT || 5000;
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
    var room = new room_1.Room();
    (0, qrgenerator_1.generarQr)(`http://localhost:5000/r/${room.roomId}`)
        .then(qr => {
        res.render("index.html", { qr, roomId: room.roomId, roomKey: room.roomKey });
    }).catch(err => {
        console.error(err);
        res.status(500).send("Error");
    });
});
app.get("/api/reservar", async (req, res) => {
    var room = new room_1.Room();
    try {
        await db_1.CaptionDb.rooms.insert(room);
        console.log("Room salvado");
        (0, qrgenerator_1.generarQr)(`http://localhost:5000/r/${room.roomId}`)
            .then(qr => {
            res.json({ result: { room, qr } });
        }).catch(err => {
            console.error(err);
            res.status(500).send("Error");
        });
    }
    catch (err) {
        console.error("/api/reservar, Error al salvar un nuevo Room en la base de datos");
        console.error(err);
        res.status(500).send("Error");
    }
});
app.get("/transmision/:roomId", (req, res) => {
    res.render("emiter.html", {});
});
app.get("/room/:roomId", (req, res) => {
    res.render("room.html", { roomId: req.params.roomId });
});
app.get("/r/:roomId", (req, res) => {
    res.render("room.html", { roomId: req.params.roomId });
});
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof PORT === 'string'
        ? 'Pipe ' + PORT
        : 'Port ' + PORT;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
server.on('error', onError);
if (process.env.PORT) {
    var debug = require('debug')('myexpressapp:server');
    server.on('listening', onListening);
    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
}
server.listen(PORT, async () => {
    console.log(`listening to http://localhost:${PORT}`);
    console.log("_____________________");
    require("./speech_recognition/azure");
    require("./db").init();
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
            var last_query = false;
            var last_flush = Date.now();
            decoder = new opus_1.AudioProcessorSession();
            decoder.start();
            var azureSession = new azure_1.AzureSession();
            azureSession.onData = (data) => {
                waiting_list--;
                last_query = false;
                io.sockets.emit("mensaje", { result: data.text, id: data.offset, speakerId: data.speakerId + "" });
            };
            decoder.onData = (buffer) => {
                let min_save_interval = 20;
                let time_interval = 5000;
                chunks.push(buffer);
                if ((Date.now() - last_flush) > time_interval && !last_query) {
                    console.log("Time", (Date.now() - last_flush), ">", time_interval, last_query);
                    waiting_list++;
                    console.log("paquete enviado a azure");
                    last_query = true;
                    azureSession.push(Buffer.concat(chunks));
                    chunks = [];
                    last_flush = Date.now();
                }
                /*if ( (chunks.length >= min_save_interval && waiting_list < 5) || chunks.length > min_save_interval+5 || (Date.now() - last_flush) > 3000  ) {
                    waiting_list++;
                    console.log("paquete enviado a azure");
                    azureSession.push(Buffer.concat(chunks))
                
                    chunks = [];
                    last_flush = Date.now()
                }     */
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
            socket.emit("joined", roomId);
        });
        socket.emit("hello", "hello");
    });
});
