import * as http from "http"
import * as express from "express"
import { Server } from "socket.io";
import * as ejs from "ejs"
import { AudioDecodeSesion } from "./decoders/opus"
import { AzureSession } from "./speech_recognition/azure";
import { generarQr } from "./rooms/qrgenerator";
import { Room } from "./rooms/room";
import { CaptionDb } from "./db";
import { crearSesionAlmacenamiento, crearSesionTranscripcion, getTrascriptionFile, saveFile, saveTrascriptionFile } from "./storage/audioMannager";
import { appendMsgToFile } from "./storage/localStore";
import * as fs from "fs";
import * as multer from "multer"
import * as sharp from "sharp"
import wavefile = require("wavefile");
import { validateRoomKey } from "./rooms/utils";

var PORT = process.env.PORT || 5000;

const upload = multer().single("file")
const app = express()
const server = http.createServer(app)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.engine('.html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/../../views');
app.use(express.json());


app.use("/js", express.static(__dirname + '/../../public/js'))
app.use("/data", express.static(__dirname + '/../../public/data'))
app.get("/", (req, res) => {
    var room = new Room();
    generarQr(`http://localhost:5000/r/${room.roomId}`)
    .then(qr => {
        res.render("index.html", {qr, roomId: room.roomId, roomKey: room.roomKey})
    }).catch(err => {
        console.error(err)
        res.status(500).send("Error")
    })
})
app.get("/api/reservar", async (req, res) => {
    var room = new Room();
    try {
        console.log("insertando item en base de datos")
        await CaptionDb.rooms.insert(room)
        console.log("generando qr")
        generarQr(`http://localhost:5000/r/${room.roomId}`)
        .then(qr => {
            res.json({result: {room,qr}})
        }).catch(err => {
            console.error(err)
            res.status(500).send("Error")
        })       
    } catch(err) {
        console.error("/api/reservar, Error al salvar un nuevo Room en la base de datos")
        console.error(err)
        res.status(500).send("Error")
    }

})
app.get("/api/transcripcion/:key", async (req, res) => {
    /*
    Not secured:
    Users are allowed to edit or create any document the want as it is implemented
    If you want to use this repo consider adding your own controls instead
    */
    getTrascriptionFile(req.params.key).then((data) => {
        res.json({result: JSON.parse( data.toString('utf8'))})
   }).catch(err => {
       console.error(err)
       res.status(500).send("Error")
   })

})
app.post("/api/transcripcion/:key", async (req, res) => {
    /*
    Not secured:
    Users are allowed to edit or create any document the want as it is implemented
    If you want to use this repo consider adding your own controls instead
    */
   saveTrascriptionFile(req.params.key, JSON.stringify(req.body)).then(() => {
        res.json({result: "Ok"})
   }).catch(err => {
       console.error(err)
       res.status(500).send("Error")
   })
})
app.post("/api/images/:key", upload, async (req, res) => {
    /*
    Not secured:
    Users are allowed to edit or create any document the want as it is implemented
    If you want to use this repo consider adding your own controls instead
    */
    let imagen = sharp(req.file.buffer);
    var meta = await imagen.metadata();
    var width = 640;
    var height = (meta.height / (meta.width/width) ) | 0
    imagen.resize(width, height)
    .extract({left: 0, top: 0, width, height: 192})
    var buffer = await imagen.jpeg({quality: 80}).toBuffer()

    saveFile("images", "i"+(Date.now())+".jpeg", buffer ).then((url) => {
        res.json({result: url})
    }).catch(err => {
        console.error(err)
        res.status(500).send("Error")
    })
})

app.get("/transmision/:roomId", (req, res) => {
    res.render("emiter.html", {roomId: req.params.roomId})
})
app.get("/room/:roomId", (req, res) => {
    res.render("room.html", {roomId: req.params.roomId})
})
app.get("/r/:roomId", (req, res) => {
    res.render("room.html", {roomId: req.params.roomId})
})
app.get("/editor/:roomId", (req, res) => {
    let roomId = req.params.roomId;
    let roomKey = req.query.roomKey as string;

    validateRoomKey(roomId, roomKey).then((valid) => {
        if (valid) res.render("editor.html", {})
        else res.status(401).send("Room Key invalid")
    })

})

app.get("/wavesurfer", (req, res) => {
    res.render("editor.html", {})
})



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

/*
    TODO
    * crear un api de coneccion 
    * se debe anadir un header en las paginas
    * completar el wizard para crear una transmision
    * crear la pagina web para celulares
    * anadir la seleccion de room en c#
    * se necesita poder compartir los audios o transcripciones con otros servicios

*/

server.listen(PORT, async () => {
    console.log(`listening to http://localhost:${PORT}`)
    console.log("_____________________")

    require("./speech_recognition/azure")
    require("./storage/audioMannager");
    await require("./db").init()
    const io = new Server(server);
    io.on("connection", (socket) => {
        var decoder : AudioDecodeSesion 
        var connectionTimer
        console.log("new connection stablished")
        
        socket.on("disconnect", () => {
            if( decoder) {
                decoder.stop()
                decoder = null  
                clearInterval(connectionTimer)
            }      
        })

        var room: Room;

        function simularEmision() {
            fs.promises.readFile(__dirname+"/../../public/data/IEP7XO.jsonl", {encoding: "utf-8"}).then(data => {
                var json = data.split("\n").filter(d => !!d).map(str => JSON.parse(str))
                connectionTimer = setInterval(() => {
                    let item = json.splice(0, 1)[0]
                    io.sockets.emit("mensaje", item)
                    if (json.length == 0) clearTimeout(connectionTimer)
                }, 200)
             
            })
        }
        socket.on("broadcast",  async ({roomKey, language}: {roomKey: string, language: string}) => {
            // buscar el room
            room = await CaptionDb.rooms.findOne({roomId: Room.getRoomId( roomKey) })
            if (!room) {
                return socket.emit("Error", "la sala no fue encontrada")
            }

            var initiated = false;

            socket.join(room.roomId);
            socket.emit("ready")
            console.log("broadcast ready")

            simularEmision()

            socket.emit("info", {
                eventTitle: room.eventTitle,
                photoUrl: room.photoUrl,
                language: room.language
            })
            return
            if (room) return;
            console.log(`Session de transcripcion iniciada en ${roomKey}`)            
            room = new Room(roomKey);   
                 
            var session = room.roomId + "." + room.sessions.length;
            var blob_stream = crearSesionAlmacenamiento(session);
            var transcripcion_stream = crearSesionTranscripcion(session);
            var localStream = appendMsgToFile(session)

    
            decoder = new AudioDecodeSesion()   
            decoder.start()
            
            var azureSession: AzureSession = new AzureSession(language || "es-DO", 30*60-room.length)    
            azureSession.onData = (data) => {
                var jsonl = {result: data.text, id: data.offset, speakerId: data.speakerId + ""};
                transcripcion_stream.push(JSON.stringify(jsonl)+"\n")  
                localStream.write(JSON.stringify(jsonl)+"\n")
                io.sockets.emit("mensaje", jsonl)             
            }   

            azureSession.onSessionLimitReached = () => {
                clear()
                socket.emit("sessionLimitReached")
            }
            function clear() {
                azureSession.close()
                blob_stream.emit("end");
                transcripcion_stream.emit("end");
                localStream.emit("end");
                room.length += azureSession.length;
                CaptionDb.rooms.update(room)
            }

      
            decoder.onData = (buffer) => {       
                azureSession.push(buffer)                          
            }
            socket.on("blob", (blob) => {
                if (!initiated) {
                    room.sessions.push(session)
                    CaptionDb.rooms.update(room).catch(console.error)
                    initiated = true;
                }
                decoder.next(blob);  
                blob_stream.push(blob);
            })  
          
            socket.emit("ready")
            socket.on("disconnect", clear)
            socket.join(room.roomId);
 
        })
        socket.on("join", ({roomId}: {roomId: string}) => {  
            console.log(`Nuevo escucha en la sala: ${roomId}`)   
            socket.join(roomId);   
            socket.emit("joined", roomId)  
            
            if (!room) return;

            socket.emit("info", {
                eventTitle: room.eventTitle,
                photoUrl: room.photoUrl,
                language: room.language
            })
        }) 
  
        socket.on("test", () => {
            console.log("test >>")
            fs.promises.readFile(__dirname+"/../../test.jsonl", {encoding: "utf-8"}).then(text => {
                var lines: {result, id, speakerId}[] = text.split("\n").filter(r => r.trim().length >= 6).map(r => JSON.parse(r))
                
                function next() {
                    setTimeout(() => {
                        var r = lines.splice(0, 1)
                        console.log("send", r[0].result)
                        socket.emit("mensaje", r[0])
                        if (lines.length) next()
                    }, 1000)
                }
              
                next()
            })
        })
   
        socket.emit("hello")
    })
    
})


