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
const fileutils_1 = require("./storage/fileutils");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
var PORT = process.env.PORT || 5000;
const upload = multer().single("file");
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.engine('.html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/../../views');
app.use(express.json());
app.use("/js", express.static(__dirname + '/../../public/js'));
app.use("/data", express.static(__dirname + '/../../public/data'));
app.use("/files", express.static(__dirname + '/../../public/files'));
app.use("/images", express.static(__dirname + '/../../public/images'));
app.get("/", (req, res) => {
    var room = new room_1.Room();
    (0, qrgenerator_1.generarQr)(`${process.env.PORT ? "https://caption.azurewebsites.net" : "http://localhost:5000"}/r/${room.roomId}`)
        .then(qr => {
        res.render("index.html", { qr, roomId: room.roomId, roomKey: room.roomKey });
    }).catch(err => {
        console.error(err);
        res.status(500).send("Error");
    });
});
app.post("/api/reservar", async (req, res) => {
    if (!req.body) {
        return res.status(400).send("Error");
    }
    var room = new room_1.Room();
    var { eventTitle, palabrasClave, eventDate, ownerEmail, language } = req.body;
    room.eventTitle = eventTitle || "";
    room.palabrasClave = palabrasClave || "";
    room.eventDate = eventDate;
    room.ownerEmail = ownerEmail;
    room.language = language;
    try {
        console.log("insertando item en base de datos");
        await db_1.CaptionDb.rooms.insert(room);
        console.log("generando qr");
        (0, qrgenerator_1.generarQr)(`${process.env.PORT ? "https://caption.azurewebsites.net" : "http://localhost:5000"}/r/${room.roomId}`)
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
app.get("/api/transcripcion/:key", async (req, res) => {
    /*
    Not secured:
    Users are allowed to edit or create any document the want as it is implemented
    If you want to use this repo consider adding your own controls instead
    */
    (0, fileutils_1.getTrascriptionFile)(req.params.key).then((data) => {
        res.json({ result: JSON.parse(data.toString('utf8')) });
    }).catch(err => {
        console.error("No se encontro la transcripcion para ", req.params.key);
        res.status(err.status || 500).send("Error");
    });
});
app.post("/api/transcripcion/:key", async (req, res) => {
    /*
    Not secured:
    Users are allowed to edit or create any document the want as it is implemented
    If you want to use this repo consider adding your own controls instead
    */
    (0, fileutils_1.saveTrascriptionFile)(req.params.key, JSON.stringify(req.body)).then(() => {
        res.json({ result: "Ok" });
    }).catch(err => {
        console.error(err);
        res.status(500).send("Error");
    });
});
app.post("/api/images/:key", upload, async (req, res) => {
    /*
    Not secured:
    Users are allowed to edit or create any document the want as it is implemented
    If you want to use this repo consider adding your own controls instead
    */
    let imagen = sharp(req.file.buffer);
    var meta = await imagen.metadata();
    var width = 640;
    var height = (meta.height / (meta.width / width)) | 0;
    imagen.resize(width, height)
        .extract({ left: 0, top: 0, width, height: 192 });
    var buffer = await imagen.jpeg({ quality: 80 }).toBuffer();
    (0, fileutils_1.saveFile)("images", "i" + (Date.now()) + ".jpeg", buffer).then((url) => {
        res.json({ result: url });
    }).catch(err => {
        console.error(err);
        res.status(500).send("Error");
    });
});
app.get("/audio/:sessionId", (req, res) => {
    (0, fileutils_1.getFile)("audio", req.params.sessionId).then(buffer => {
        res.send(buffer);
    }).catch(err => {
        console.log("not found");
        res.status(404).send("Error");
    });
});
app.get("/transcripcion/:sessionId", (req, res) => {
    (0, fileutils_1.getFile)("rawtranscripcion", req.params.sessionId).then(buffer => {
        res.send(buffer);
    }).catch(err => {
        console.error("Raw transcriptions not found");
        console.error(err);
    });
});
app.get("/transmision/:roomId", (req, res) => {
    res.render("emiter.html", { roomId: req.params.roomId });
});
app.get("/room/:roomId", (req, res) => {
    res.render("room.html", { roomId: req.params.roomId });
});
app.get("/r/:roomId", (req, res) => {
    res.render("room.html", { roomId: req.params.roomId });
});
app.get("/editor/:roomKey", async (req, res) => {
    let roomKey = req.params.roomKey;
    let room = await db_1.CaptionDb.rooms.findOne({ roomKey });
    if (!room) {
        res.status(400).send("Error, no se encontro ninguna sala con los datos indicados");
    }
    else {
        res.render("editor.html", { roomId: room.roomId, sessions: room.sessions });
    }
});
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof PORT === 'string'
        ? 'Pipe ' + PORT
        : 'Port ' + PORT;
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
    require("./storage/fileutils");
    await require("./db").init();
    const io = new socket_io_1.Server(server);
    io.on("connection", (socket) => {
        var decoder;
        var connectionTimer;
        console.log("new connection stablished");
        socket.on("disconnect", () => {
            if (decoder) {
                decoder.stop();
                decoder = null;
            }
            clearInterval(connectionTimer);
            // notify the session has ended
            socket.emit("end");
        });
        var room;
        function simularEmision() {
            fs.promises.readFile(__dirname + "/../../public/IEP7XO.jsonl", { encoding: "utf-8" }).then(data => {
                var json = data.split("\n").filter(d => !!d).map(str => JSON.parse(str));
                connectionTimer = setInterval(() => {
                    let item = json.splice(0, 1)[0];
                    io.sockets.emit("mensaje", item);
                    if (json.length == 0)
                        clearTimeout(connectionTimer);
                }, 500);
            });
        }
        socket.on("broadcast", async ({ roomKey, language }) => {
            room = await db_1.CaptionDb.rooms.findOne({ roomId: room_1.Room.getRoomId(roomKey) });
            if (!room) {
                return socket.emit("error", "la sala no fue encontrada");
            }
            var last_message = Date.now();
            var initiated = false;
            console.log(`Session de transcripcion iniciada en ${room.roomId}, idioma ${room.language}`);
            var session = room.roomId + "." + room.sessions.length;
            var blob_stream = (0, fileutils_1.crearSesionAlmacenamiento)(session);
            var transcripcion_stream = (0, fileutils_1.crearSesionTranscripcion)(session);
            decoder = new opus_1.AudioDecodeSesion();
            decoder.start();
            var azureSession = new azure_1.AzureSession(room.language || "es-DO", 30 * 60 - room.length);
            azureSession.onData = (data) => {
                var jsonl = { result: data.text, id: data.offset, speakerId: data.speakerId + "" };
                if (transcripcion_stream)
                    transcripcion_stream.push(JSON.stringify(jsonl) + "\n");
                if (jsonl.result)
                    last_message = Date.now();
                io.to(room.roomId).emit("mensaje", jsonl);
            };
            azureSession.onSessionLimitReached = () => {
                clear();
                console.log("la session ha superado la cuota establecida");
                socket.emit("sessionLimitReached");
            };
            function clear() {
                console.log("Clearing all");
                if (!azureSession)
                    return;
                azureSession.close();
                if (blob_stream) {
                    blob_stream.emit("end");
                    blob_stream = null;
                }
                if (transcripcion_stream) {
                    transcripcion_stream.emit("end");
                    transcripcion_stream = null;
                }
                room.length += azureSession.length;
                db_1.CaptionDb.rooms.update(room);
                azureSession = null;
            }
            decoder.onData = (buffer) => {
                azureSession.push(buffer);
            };
            socket.on("blob", (blob) => {
                if (!azureSession)
                    return;
                if (!initiated) {
                    room.sessions.push(session);
                    db_1.CaptionDb.rooms.update(room).catch(console.error);
                    initiated = true;
                }
                decoder.next(blob);
                blob_stream.push(blob);
            });
            socket.on("clear", () => {
                io.to(room.roomId).emit("clear");
            });
            function checkForIdleTime() {
                setTimeout(() => {
                    if (Date.now() - last_message > 60 * 1000) {
                        console.log("se llamara a clear debido a que se ha exedido el tiempo de espera");
                        clear();
                    }
                    else
                        checkForIdleTime();
                }, 5000);
            }
            socket.emit("info", {
                eventTitle: room.eventTitle,
                photoUrl: room.photoUrl,
                language: room.language,
                roomId: room.roomId
            });
            socket.emit("ready");
            socket.on("disconnect", clear);
            socket.join(room.roomId);
            checkForIdleTime();
        });
        socket.on("join", async (data) => {
            var { roomId } = data;
            room = await db_1.CaptionDb.rooms.findOne({ roomId });
            if (!room) {
                return socket.emit("Error", "la sala no fue encontrada");
            }
            socket.on("list_sessions", async () => {
                var __room = await db_1.CaptionDb.rooms.findOne({ roomId });
                if (!__room)
                    return socket.emit("room not found");
                socket.emit("list_sessions", __room.sessions);
            });
            console.log(`Nuevo escucha en la sala: ${roomId}`);
            socket.join(roomId);
            socket.emit("info", {
                eventTitle: room.eventTitle,
                photoUrl: room.photoUrl,
                language: room.language,
                sessions: room.sessions
            });
            socket.emit("joined", roomId);
        });
        socket.on("test", () => {
            console.log("ALGUIEN SOLICITO TEST");
            socket.join(room.roomId);
            socket.emit("ready");
            console.log("broadcast ready");
            simularEmision();
        });
        socket.emit("hello");
    });
});
