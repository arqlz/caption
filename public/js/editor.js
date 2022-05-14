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

// public/src/components/texteditor.ts @2
2: function(__fusereq, exports, module){
exports.__esModule = true;
var utils_1 = __fusereq(3);
function span(msg, clases = null) {
  var div = utils_1.createDiv("span");
  if (clases) div.classList.add(clases);
  div.contentEditable = "true";
  div.innerHTML = msg.result;
  return div;
}
class TextEditor {
  constructor(doc, div) {
    this.itemes = new Map();
    this.changed = false;
    this.onChange = e => {
      this.doc.get(e.target.id).result = e.target.innerText;
      this.changed = true;
    };
    this.onSave = e => {
      if (this.changed) {
        this.doc.save().then(console.log, console.error);
        this.changed = false;
      }
    };
    this.containner = div;
    this.doc = doc;
  }
  append(msg) {
    let spanMsg;
    if (this.itemes.size == 0) spanMsg = span(msg, "title"); else spanMsg = span(msg);
    spanMsg.addEventListener("input", this.onChange);
    spanMsg.addEventListener("blur", this.onSave);
    let id = msg.id.toString();
    spanMsg.id = id;
    this.itemes.set(id, {
      div: spanMsg,
      msg
    });
    this.containner.append(spanMsg);
  }
  clearMark() {
    for (let el of this.containner.children) el.classList.remove("selected");
    return this;
  }
  mark(id) {
    this.itemes.get(id).div.classList.add("selected");
    return this;
  }
}
function generarTextEditor(doc, containner) {
  var mensajes = [];
  for (let msg of doc.itemes) {
    if (mensajes.length && mensajes[mensajes.length - 1].id == msg.id) {
      mensajes[mensajes.length - 1] = msg;
    } else {
      mensajes.push(msg);
    }
  }
  var div = utils_1.createDiv("textEditor");
  var editor = new TextEditor(doc, div);
  for (let i = 0; i < mensajes.length; i++) {
    let msg = mensajes[i];
    editor.append(msg);
  }
  containner.append(div);
  return editor;
}
exports.generarTextEditor = generarTextEditor;

},

// public/src/utils/document.ts @5
5: function(__fusereq, exports, module){
class TranscriptionDocument {
  constructor(roomIdOrDocument, itemes = []) {
    this.roomId = "";
    this.itemes = [];
    this.photoUrl = "";
    if (typeof roomIdOrDocument == "string") {
      this.roomId = roomIdOrDocument;
      this.itemes = itemes;
    } else {
      this.roomId = roomIdOrDocument.roomId;
      this.itemes = roomIdOrDocument.itemes || itemes;
      this.photoUrl = roomIdOrDocument.photoUrl;
    }
  }
  near(second) {
    let candidates = this.itemes.filter(f => {
      return f.id > second * 10000000;
    });
    if (candidates.length) return candidates; else if (this.itemes.length) return [this.itemes[this.itemes.length - 1]];
    return [];
  }
  clean() {
    var times = {};
    for (let m of this.itemes) {
      times[m.id] = m;
    }
    this.itemes = Object.values(times);
  }
  get(id) {
    return this.itemes.find(f => f.id.toString() == id);
  }
  save() {
    return fetch(`/api/transcripcion/${this.roomId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this)
    }).then(r => r.json());
  }
}
exports.TranscriptionDocument = TranscriptionDocument;

},

// public/src/utils/loadDocument.ts @4
4: function(__fusereq, exports, module){
exports.__esModule = true;
var document_1 = __fusereq(5);
function loadData(room_id) {
  return new Promise(async (resolve, reject) => {
    try {
      const blob = await fetch(`/data/${room_id}.webm`).then(r => r.blob()).catch(err => {
        throw new Error("Error al descargar el archivo de audio: " + err);
      });
      fetch(`/api/transcripcion/${room_id}`).then(r => r.json()).then(jdoc => {
        var doc = new document_1.TranscriptionDocument(jdoc.result);
        resolve([blob, doc]);
      }).catch(err => {
        return fetch(`/data/${room_id}.jsonl`).then(r => r.text()).then(text => {
          var json = text.split("\n").filter(f => f.trim().length).map(j => JSON.parse(j));
          var doc = new document_1.TranscriptionDocument(room_id, json);
          doc.clean();
          resolve([blob, doc]);
        }).catch(err => {
          throw new Error("El archivo jsonl no fue encontrado: " + err);
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
exports.loadData = loadData;

},

// public/src/editor.ts @1
1: function(__fusereq, exports, module){
exports.__esModule = true;
var texteditor_1 = __fusereq(2);
var utils_1 = __fusereq(3);
var loadDocument_1 = __fusereq(4);
function generarSamplesFromArray(raw, samples = 400) {
  const blockSize = Math.floor(raw.length / samples);
  const filtered = [];
  for (let i = 0; i < samples; i++) {
    let start = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(raw[start + j]);
    }
    filtered.push(sum / blockSize);
  }
  const multiplier = Math.pow(Math.max(...filtered), -1);
  const normalized = filtered.map(n => {
    return n * multiplier;
  });
  return normalized;
}
function generarSamples(audioBuffer, samples = 400) {
  const raw = audioBuffer.getChannelData(0);
  return generarSamplesFromArray(raw, samples);
}
function decodeAudio(buffer) {
  var context = new AudioContext();
  return context.decodeAudioData(buffer).then(audioBuffer => {
    return audioBuffer;
  });
}
function drawHorizontal(canvas, normalizedData) {
  const dpr = window.devicePixelRatio || 1;
  const padding = 10;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(dpr, dpr);
  ctx.translate(0, canvas.offsetHeight / 2 + padding);
  const width = canvas.offsetWidth / normalizedData.length;
  ctx.fillStyle = "#e7534b";
  for (let i = 0; i < normalizedData.length; i++) {
    let x = width * i;
    let h = normalizedData[i] * canvas.offsetHeight - padding;
    if (h < 3) h = 1;
    if (i % 2 == 0 && h > 1) h = -h;
    ctx.fillRect(x, 0, width, h);
  }
}
async function build() {
  var [blob, doc] = await loadDocument_1.loadData("IEP7XO");
  console.log(doc);
  if (!blob) return;
  var div = utils_1.createDiv({
    width: 500,
    margin: "0 auto"
  });
  const visualization = utils_1.createDiv("row");
  const canvas = document.createElement("canvas");
  canvas.classList.add("flex");
  canvas.style.width = "100%";
  canvas.style.height = "100px";
  visualization.append(canvas);
  div.append(visualization);
  const photo = utils_1.createDiv({
    height: 150,
    width: "100%",
    background: "#00000022",
    margin: "30px auto"
  });
  let img = utils_1.createElement("img", {
    width: "100%"
  });
  console.log(doc.photoUrl);
  if (doc.photoUrl) img.src = doc.photoUrl;
  photo.append(img);
  photo.onclick = () => {
    let input = utils_1.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg";
    input.onchange = e => {
      let image_file = e.target.files[0];
      var form = new FormData();
      form.append("file", image_file);
      fetch(`/api/images/${doc.roomId}`, {
        method: "POST",
        body: form
      }).then(r => r.json()).then(res => {
        doc.photoUrl = res.result;
        img.src = doc.photoUrl;
        doc.save().then(console.log, console.error);
      }, console.error);
    };
    input.click();
  };
  div.append(photo);
  const audioControls = utils_1.createDiv("row center", {
    marginTop: 10
  });
  const playPauseButton = utils_1.createElement("button", {
    width: 100,
    height: 50
  });
  playPauseButton.innerText = "Play";
  audioControls.append(playPauseButton);
  const downloadAudioButton = utils_1.createElement("button", {
    width: 140,
    height: 50,
    marginLeft: 10
  });
  downloadAudioButton.innerText = "Download";
  audioControls.append(downloadAudioButton);
  div.append(audioControls);
  document.body.append(div);
  const audioBuffer = await decodeAudio(await blob.arrayBuffer());
  const normalized = generarSamples(audioBuffer);
  drawHorizontal(canvas, normalized);
  let editor = texteditor_1.generarTextEditor(doc, document.body);
  var context = new AudioContext();
  var source;
  canvas.onmousemove = e => {
    drawHorizontal(canvas, normalized);
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#e7534b";
    ctx.lineWidth = 3;
    ctx.moveTo(e.offsetX, -canvas.height / 2);
    ctx.lineTo(e.offsetX, canvas.height / 2);
    ctx.stroke();
    let progress = e.offsetX / canvas.width;
    let segundos = audioBuffer.duration * progress;
    var after_this = doc.near(segundos);
    if (after_this.length) {
      editor.clearMark().mark(after_this[0].id.toString());
    }
  };
  function playAudio(offset) {
    if (source) source.stop();
    playPauseButton.innerText = "Stop";
    source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start(0, offset);
  }
  canvas.onclick = e => {
    let progress = e.offsetX / canvas.width;
    let segundos = audioBuffer.duration * progress;
    var target = doc.near(segundos);
    if (target.length) playAudio(target[0].id / 10000000);
  };
  playPauseButton.onclick = () => {
    if (source) {
      source.stop();
      source = null;
      playPauseButton.innerText = "Play";
    } else playAudio(0);
  };
  downloadAudioButton.onclick = () => {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = doc.roomId + ".webm";
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
}
build();

}
}, function(){
__fuse.r(1)
})
//# sourceMappingURL=editor.js.map