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

// public/src/editor.ts @1
1: function(__fusereq, exports, module){
exports.__esModule = true;
var texteditor_1 = __fusereq(2);
var utils_1 = __fusereq(3);
function loadFiles() {
  return fetch("/data/KF7NRC.webm").then(r => r.blob()).then(blob => {
    return fetch("/data/KF7NRC.jsonl").then(r => r.text()).then(text => {
      var json = text.split("\n").filter(f => f.trim().length).map(j => JSON.parse(j));
      return [blob, json];
    });
  }).catch(console.error);
}
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
const drawLineSegment = (ctx, x, y, width, isEven) => {
  ctx.fillStyle = "#e7534b";
  if (y < 3) y = 1;
  y = isEven ? y : -y;
  ctx.fillRect(x, 0, width, y);
};
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
function drawVertical(canvas, normalizedData) {
  const dpr = window.devicePixelRatio || 1;
  const padding = 10;
  canvas.width = canvas.offsetWidth + padding * 2 * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(dpr, dpr);
  ctx.translate(canvas.offsetWidth / 2 + padding, 0);
  const width = canvas.offsetHeight / normalizedData.length;
  ctx.fillStyle = "#e7534b";
  for (let i = 0; i < normalizedData.length; i++) {
    let y = width * i;
    let w = normalizedData[i] * canvas.offsetWidth - padding;
    let x = 0;
    if (w < 3) w = 1;
    if (i % 2 == 0) {
      w = -w;
    }
    ctx.fillRect(x, y, w, width);
  }
}
async function build() {
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100px";
  var div = utils_1.createDiv({
    width: 500,
    margin: "0 auto"
  });
  div.append(canvas);
  document.body.append(div);
  var [blob, json] = await loadFiles();
  if (!blob) return;
  const audioBuffer = await decodeAudio(await blob.arrayBuffer());
  const normalized = generarSamples(audioBuffer);
  drawHorizontal(canvas, normalized);
  canvas.onmousemove = e => {
    drawHorizontal(canvas, normalized);
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#e7534b";
    ctx.lineWidth = 3;
    ctx.moveTo(e.offsetX, -canvas.height / 2);
    ctx.lineTo(e.offsetX, canvas.height / 2);
    ctx.stroke();
    let progress = e.offsetX / canvas.width;
    console.log(progress * audioBuffer.length);
  };
  console.log(json);
  document.body.append(texteditor_1.generarTextEditor(json));
}
build();

},

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
function span(msg) {
  var div = utils_1.createDiv("span");
  div.contentEditable = "true";
  div.innerHTML = msg.result;
  return div;
}
function generarTextEditor(json) {
  var mensajes = [];
  for (let msg of json) {
    if (mensajes.length && mensajes[mensajes.length - 1].id == msg.id) {
      mensajes[mensajes.length - 1] = msg;
    } else {
      mensajes.push(msg);
    }
  }
  var div = utils_1.createDiv("textEditor");
  div.contentEditable = "true";
  for (let msg of mensajes) {
    var title = span(msg);
    title.classList.add("title");
    div.append(title);
  }
  for (let msg of mensajes) {
    div.append(span(msg));
  }
  for (let msg of mensajes) {
    div.append(span(msg));
  }
  return div;
}
exports.generarTextEditor = generarTextEditor;

}
}, function(){
__fuse.r(1)
})
//# sourceMappingURL=editor.js.map