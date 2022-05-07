import * as http from "http"
import * as express from "express"
import { Server } from "socket.io";
import * as ejs from "ejs"
import { AudioProcessorSession } from "./decoders/opus"
import { AzureSession } from "./speech_recognition/azure";
import { generarQr } from "./rooms/qrgenerator";
import { Room } from "./rooms/room";
import { CaptionDb } from "./db";
import { crearSesionAlmacenamiento, crearSesionTranscripcion } from "./storage/audioMannager";
import { appendMsgToFile } from "./storage/localStore";
import * as fs from "fs";
var PORT = process.env.PORT || 5000


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
app.get("/transmision/:roomId", (req, res) => {
    res.render("emiter.html", {})
})
app.get("/room/:roomId", (req, res) => {
    res.render("room.html", {roomId: req.params.roomId})
})
app.get("/r/:roomId", (req, res) => {
    res.render("room.html", {roomId: req.params.roomId})
})
app.get("/wavesurfer", (req, res) => {
    res.render("wavesurfer.html", {})
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



server.listen(PORT, async () => {
    console.log(`listening to http://localhost:${PORT}`)
    console.log("_____________________")

    require("./speech_recognition/azure")
    require("./storage/audioMannager");
    await require("./db").init()
    const io = new Server(server);
    io.on("connection", (socket) => {
        var decoder : AudioProcessorSession 
        console.log("new connection stablished")
        socket.on("disconnect", () => {
            console.log("DISCONECTED")
            if( decoder) {
                decoder.stop()
                decoder = null  
            }      
        })

        var room: Room;
        socket.on("broadcast",  ({roomKey}: {roomKey: string}) => {
            if (room) return;
            console.log(`Session de transcripcion iniciada en ${roomKey}`)            
            var waiting_list = 0;
            room = new Room(roomKey);    
            var last_query = false;     
            var blob_stream = crearSesionAlmacenamiento(room.roomId);
            var transcripcion_stream = crearSesionTranscripcion(room.roomId);
            var filte_stream = appendMsgToFile(room.roomId)

    
            decoder = new AudioProcessorSession()   
            decoder.start()
            
            var azureSession: AzureSession = new AzureSession()    
            azureSession.onData = (data) => {
                waiting_list--;   
                last_query = false;      

                var jsonl = {result: data.text, id: data.offset, speakerId: data.speakerId + ""};
                transcripcion_stream.push(JSON.stringify(jsonl)+"\n")  
                filte_stream.write(JSON.stringify(jsonl)+"\n")

                io.sockets.emit("mensaje", jsonl)
            }   

            /*
    
            var timer = setInterval(() => {
                 if (chunks.length) {
                     console.log("SEND")
                    azureSession.push(Buffer.concat(chunks))   
                    chunks = [];     
                 }
            }, time_interval)
            */


            function clear() {
                //clearInterval(timer)
                blob_stream.emit("end");
                transcripcion_stream.emit("end");
            }

            decoder.onData = (buffer) => {           
                let min_save_interval = 20
             
                //chunks.push(buffer);
                azureSession.push(buffer)   
              
           
                /*
                if ( (Date.now() - last_flush) > time_interval  ) {
                    console.log("Time", (Date.now() - last_flush), ">", time_interval, last_query)
                    waiting_list++;
                    console.log("paquete enviado a azure");
                    
                    last_query = true;
                    let to_concat = chunks;
                    chunks = [];

                    azureSession.push(Buffer.concat(to_concat))          
                
               
                    last_flush = Date.now()
                }   
                */          
  
                /*if ( (chunks.length >= min_save_interval && waiting_list < 5) || chunks.length > min_save_interval+5 || (Date.now() - last_flush) > 3000  ) {
                    waiting_list++;
                    console.log("paquete enviado a azure");
                    azureSession.push(Buffer.concat(chunks))          
                
                    chunks = [];
                    last_flush = Date.now()
                }     */           
            }
            socket.on("blob", (blob) => {
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
   
        socket.emit("hello", "hello")
    })
    
})


