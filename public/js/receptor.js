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
  constructor(rec) {
    this.mensajes = {};
    this.queue = [];
    this.raw = "";
    this.stoped = false;
    this.listennerMode = true;
    var div = utils_1.createDiv({
      width: "100%",
      height: "100%"
    });
    div.className = "msgContainner";
    div.id = "core";
    let title = utils_1.createDiv({
      margin: "15px 0"
    });
    title.innerHTML = `Id de la sala: ${roomId}`;
    div.append(title);
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
      }
    };
    this.control.append(stopButton);
    div.append(this.control);
    this.transmissionContainner = utils_1.createDiv({
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
  render() {
    if (this.listennerMode == true && this.stoped) return;
    while (this.queue.length) {
      var mensaje = this.queue.splice(0, 1)[0];
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
    this.queue.push(data);
    this.render();
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
class Presenter2 {
  constructor(rec) {
    this.lines = {};
    this.queue = [];
    this.raw = "";
    var div = utils_1.createDiv({
      width: "100%",
      height: "100%"
    });
    div.className = "msgContainner";
    this.control = utils_1.createDiv();
    var stopButton = utils_1.createElement("button");
    stopButton.innerHTML = "STOP";
    stopButton.onclick = () => {
      stopButton.disabled = true;
      if (rec) {
        console.log("STOP RECORDER", rec);
        rec.stop();
      }
    };
    this.control.append(stopButton);
    div.append(this.control);
    this.textContainner = utils_1.createDiv({
      width: 350,
      textAlign: "center",
      margin: "auto auto",
      color: "#ffffff",
      fontSize: 20,
      display: "block"
    });
    div.append(this.textContainner);
    document.body.append(div);
  }
  append(data) {
    this.queue.push(data);
    if (!this.lines[data.id]) {
      var div = utils_1.createDiv({
        display: "inline",
        marginRight: "4pt"
      });
      this.textContainner.append(div);
      this.lines[data.id] = div;
      this.lines[data.id].innerHTML = data.result;
    } else {
      this.lines[data.id].innerHTML = data.result;
    }
  }
}
exports.Presenter2 = Presenter2;

},

// public/src/receptorClient.ts @1
1: function(__fusereq, exports, module){
exports.__esModule = true;
var presenter_1 = __fusereq(2);
var presenter = new presenter_1.Presenter();
var socket = io();
socket.on("disconnect", () => {
  console.log("disconected");
});
socket.on("connect", () => {
  var roomId = location.pathname || "";
  if (roomId.length < 2) {
    throw new Error("sala invalida");
  }
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