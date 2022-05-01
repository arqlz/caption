import * as http from "http"
import * as express from "express"
import { Server } from "socket.io";
import * as ejs from "ejs"
import { AudioProcessorSession } from "./decoders/opus"
import { AzureSession } from "./speech_recognition/azure";
import { generarQr } from "./rooms/qrgenerator";
import { Room } from "./rooms/room";
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

app.get("/", (req, res) => {
    res.render("emiter.html", {})
})
app.get("/room/:roomId", (req, res) => {
    res.render("room.html", {roomId: req.params.roomId})
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
    //require("./speech_recognition/speech")
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
            var chunks: Buffer[] = []
            room = new Room(roomKey);         
         
            decoder = new AudioProcessorSession()   
            decoder.start()
            
            var azureSession: AzureSession = new AzureSession()    
            azureSession.onData = (data) => {
                waiting_list--;                
                io.sockets.emit("mensaje", 
                    {result: data.text, id: data.offset, speakerId: data.speakerId + ""})
            }   
            
    
            decoder.onData = (buffer) => {
                let min_save_interval = 20

                chunks.push(buffer);
                if ( (chunks.length >= min_save_interval && waiting_list < 5) || chunks.length > min_save_interval+5) {
                   
                    waiting_list++;
                    console.log("paquete enviado a azure");
                    azureSession.push(Buffer.concat(chunks))          
                
                    chunks = [];
                }                
            }
            socket.on("blob", (blob) => {
                decoder.next(blob);  
            })  
          
            socket.emit("ready")
            socket.join(room.roomId);
 
        })
        socket.on("join", ({roomId}: {roomId: string}) => {  
            console.log(`Nuevo escucha en la sala: ${roomId}`)   
            socket.join(roomId);      
        })   
   
        socket.emit("hello", "hello")
    })
    
})

