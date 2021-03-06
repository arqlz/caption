(function() {
  var f = window.__fuse = window.__fuse || {};
  var modules = f.modules = f.modules || {}; f.dt = function (x) { return x && x.__esModule ? x : { "default": x }; };

f.modules = modules;
  f.bundle = function(collection, fn) {
    for (var num in collection) {
      modules[num] = collection[num];
    }
    fn ? fn() : void 0;
  };
  f.c = {};
  f.r = function(id) {
    var cached = f.c[id];
    if (cached) return cached.m.exports;
    var module = modules[id];
    if (!module) {
      
      throw new Error('Module ' + id + ' was not found');
    }
    cached = f.c[id] = {};
    cached.exports = {};
    cached.m = { exports: cached.exports };
    module(f.r, cached.exports, cached.m);
    return cached.m.exports;
  }; 
})();
__fuse.bundle({

// public/src/components/utils.ts @3
3: function(__fusereq, exports, module){
exports.__esModule = true;
const pixelFields = ["margin", "marginLeft", "marginRight", "marginTop", "marginBottom", "padding", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "left", "top", "right", "bottom", "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight", "borderWidth"];
function applyStyle(div, style) {
  Object.keys(style || ({})).forEach(k => {
    let is_number = pixelFields.indexOf(k) >= 0;
    if (is_number && typeof style[k] == "number") div.style[k] = style[k] + "px"; else div.style[k] = style[k];
  });
}
exports.applyStyle = applyStyle;
exports.createElement = (type, styleOrClass, style) => {
  var __style = typeof styleOrClass == "object" ? styleOrClass : style || ({});
  var __className = typeof styleOrClass == "string" ? styleOrClass : "";
  var div = document.createElement(type);
  div.className = __className;
  applyStyle(div, __style);
  return div;
};
function createDiv(styleOrClass, style) {
  var __style = typeof styleOrClass == "object" ? styleOrClass : style || ({});
  var __className = typeof styleOrClass == "string" ? styleOrClass : "";
  var div = document.createElement("div");
  div.className = __className;
  applyStyle(div, __style);
  return div;
}
exports.createDiv = createDiv;

},

// public/src/presenter.ts @2
2: function(__fusereq, exports, module){
exports.__esModule = true;
var utils_1 = __fusereq(3);
class Presenter {
  constructor(roomId, rec, roomKey) {
    this.mensajes = {};
    this.queue = [];
    this.raw = "";
    this.stoped = false;
    this.listennerMode = true;
    this.elements = {};
    this.__title = "";
    var div = utils_1.createDiv({
      width: "100%",
      height: "100%"
    });
    div.className = "msgContainner";
    div.id = "core";
    var header = utils_1.createDiv("header");
    div.append(header);
    let title = utils_1.createElement("h2", {
      margin: "15px 0"
    });
    title.innerHTML = ``;
    header.append(title);
    this.elements.title = title;
    let roomData = utils_1.createDiv({
      margin: "15px 0"
    });
    roomData.innerHTML = `Id de la sala: ${roomId}`;
    let svg = utils_1.createElement("img", {
      paddingLeft: 10
    });
    svg.classList.add("fullscreen");
    svg.src = "/images/fullscreen.svg";
    svg.onclick = () => {
      document.documentElement.requestFullscreen();
    };
    roomData.append(svg);
    header.append(roomData);
    this.elements.roomData = roomData;
    let timeCounter = utils_1.createDiv({
      margin: "15px 0",
      fontSize: 30,
      fontWeight: 600
    });
    timeCounter.innerHTML = ``;
    header.append(timeCounter);
    this.elements.timeCounter = timeCounter;
    if (rec) this.listennerMode = false;
    this.control = utils_1.createDiv("navigation");
    var stopButton = utils_1.createElement("button");
    stopButton.innerHTML = "STOP";
    stopButton.onclick = () => {
      if (this.stoped && this.listennerMode) {
        stopButton.classList.remove("disabled");
        stopButton.innerHTML = "STOP";
        this.stoped = false;
      } else {
        stopButton.classList.add("disabled");
        stopButton.innerHTML = "RESTART";
        this.stoped = true;
      }
      if (rec) {
        console.log("STOP RECORDER", rec);
        rec.stop();
        var irAlEditor = utils_1.createElement("button");
        irAlEditor.innerHTML = "Ir al editor";
        irAlEditor.onclick = () => {
          location.href = `/editor/${roomKey}`;
        };
        this.control.append(irAlEditor);
      }
    };
    this.control.append(stopButton);
    div.append(this.control);
    this.transmissionContainner = utils_1.createDiv("transcripciones", {
      width: 400,
      maxHeight: 200,
      margin: "auto auto",
      color: "#ffffff",
      fontSize: 20,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    });
    this.transmissionContainner.style.scrollBehavior = "smooth";
    div.append(this.transmissionContainner);
    document.body.append(div);
  }
  set title(value) {
    this.__title = value;
    this.elements.title.innerHTML = value;
  }
  set timeElapsed(value) {
    this.elements.timeCounter.innerHTML = (value / 1000 | 0).toString();
  }
  render() {
    if (this.listennerMode == true && this.stoped) return;
    while (this.queue.length) {
      var mensaje = this.queue.splice(0, 1)[0];
      console.log(mensaje, this.queue);
      if (!this.mensajes[mensaje.id]) {
        var div = utils_1.createDiv("textRow", {
          marginRight: "4pt"
        });
        this.transmissionContainner.append(div);
        this.mensajes[mensaje.id] = div;
        this.mensajes[mensaje.id].innerHTML = mensaje.result;
        this.transmissionContainner.scrollTo({
          top: this.transmissionContainner.scrollHeight
        });
      } else {
        this.mensajes[mensaje.id].innerHTML = mensaje.result;
        this.transmissionContainner.scrollTo({
          top: this.transmissionContainner.scrollHeight
        });
      }
    }
  }
  append(data) {
    if (data) {
      this.queue.push(data);
      this.render();
    } else {
      console.error("Append null");
    }
  }
  stop() {
    this.stoped = true;
  }
  resume() {
    this.stoped = false;
    this.render();
  }
}
exports.Presenter = Presenter;

},

// public/src/receptorClient.ts @1
1: function(__fusereq, exports, module){
exports.__esModule = true;
var presenter_1 = __fusereq(2);
var path = location.pathname || "";
var presenter = new presenter_1.Presenter(path.split("/").slice(2)[0]);
var socket = io();
socket.on("disconnect", () => {
  console.log("disconected");
});
socket.on("connect", () => {
  var roomId = location.pathname || "";
  if (roomId.length < 2) {
    throw new Error("sala invalida");
  }
  socket.on("info", info => {
    presenter.title = info.eventTitle;
  });
  roomId = roomId.split("/").slice(2)[0];
  socket.emit("join", {
    roomId: roomId
  });
});
socket.on("joined", roomId => {
  socket.on("mensaje", data => {
    presenter.append(data);
  });
  console.log("Joined to room");
});
socket.connect();

}
}, function(){
__fuse.r(1)
})
//# sourceMappingURL=receptor.js.map