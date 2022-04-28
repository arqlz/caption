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

// public/src/components/utils.ts @2
2: function(__fusereq, exports, module){
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

// public/src/emiterClient.ts @1
1: function(__fusereq, exports, module){
exports.__esModule = true;
var utils_1 = __fusereq(2);
class Recorder {
  constructor() {
    this.onData = blob => null;
  }
  start(time = 3000) {
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(stream => {
      var recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      recorder.ondataavailable = e => {
        this.onData(e.data);
      };
      this.recorder = recorder;
      recorder.start(time);
    });
  }
  stop() {
    this.recorder.stop();
  }
}
function sendBlob(blob) {
  var form = new FormData();
  form.append("blob", blob);
  return new Promise(() => {
    socket.emit("blob", blob);
  });
}
class Presenter {
  constructor() {
    this.lines = {};
    this.queue = [];
    var div = utils_1.createDiv({
      width: "100%",
      height: "100%",
      background: "#111111"
    });
    this.control = utils_1.createDiv();
    var stopButton = utils_1.createElement("button");
    stopButton.innerHTML = "STOP";
    stopButton.onclick = () => {
      stopButton.disabled = true;
      rec.stop();
    };
    this.control.append(stopButton);
    div.append(this.control);
    var show = utils_1.createDiv({
      width: 350,
      textAlign: "center",
      margin: "auto auto",
      color: "#ffffff",
      fontSize: 20
    });
    this.textContainner = show;
    div.append(show);
    document.body.append(div);
    setInterval(() => {
      this.appendWord();
    }, 100);
  }
  appendWord() {
    if (this.queue.length) {
      var w = this.queue.splice(0, 1)[0];
      if (!this.lines[w.id]) {
        var div = utils_1.createDiv();
        this.textContainner.append(div);
        this.lines[w.id] = div;
      }
      this.lines[w.id].innerHTML = w.result;
    }
  }
  append(data) {
    this.queue.push(data);
  }
}
var socket = io();
var rec;
socket.on("ready", () => {
  console.log("Starting recorder");
  if (rec) {
    rec.stop();
    rec = new Recorder();
  } else {
    rec = new Recorder();
  }
  var presenter = new Presenter();
  rec.onData = blob => {
    sendBlob(blob).then(text => {});
  };
  rec.start();
  socket.on("mensaje", data => {
    presenter.append(data);
  });
});
socket.on("disconnect", () => {
  console.log("disconected");
  if (rec) {
    rec.stop();
    rec = null;
  }
});
socket.on("connect", () => {
  console.log("connected");
});
socket.on("hello", () => {
  socket.emit("broadcast", {
    roomKey: "1JY76G7"
  });
});
socket.connect();

}
}, function(){
__fuse.r(1)
})
//# sourceMappingURL=audio.js.map