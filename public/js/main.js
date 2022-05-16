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

// public/src/utils/falseReact.ts @2
2: function(__fusereq, exports, module){
const pixelFields = ["margin", "marginLeft", "marginRight", "marginTop", "marginBottom", "padding", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "left", "top", "right", "bottom", "width", "height"];
function applyStyle(div, style) {
  Object.keys(style || ({})).forEach(k => {
    let is_number = pixelFields.indexOf(k) >= 0;
    if (is_number && typeof style[k] == "number") div.style[k] = style[k] + "px"; else div.style[k] = style[k];
  });
}
const renameDic = {
  onClick: "onclick",
  onInput: "oninput",
  onChange: "onchange"
};
function apply(div, style) {
  Object.keys(style || ({})).forEach(k => {
    div[renameDic[k] || k] = style[k];
  });
}
class FalseReact {
  static createElement(functionOrString, props, ...childrens) {
    if (typeof functionOrString == "string") {
      var element = document.createElement(functionOrString);
      var props = props || ({});
      apply(element, props);
      if (props && props.style) applyStyle(element, props.style);
      for (var child of childrens) {
        if (Array.isArray(child)) {
          for (var ch of child) {
            element.append(ch);
          }
        } else {
          element.append(child);
        }
      }
      if (props && props.ref) props.ref(element);
      return element;
    } else {
      let ops = Object.assign({}, props);
      if (childrens && ops) ops.children = childrens;
      return functionOrString(ops, childrens);
    }
  }
  static render(functionOrString, target) {
    target.appendChild(functionOrString);
  }
}
exports.FalseReact = FalseReact;

},

// public/src/main.tsx @1
1: function(__fusereq, exports, module){
exports.__esModule = true;
var falseReact_1 = __fusereq(2);
const React = falseReact_1.FalseReact;
const ReactDOM = falseReact_1.FalseReact;
function button(text, callback) {
  var div = document.createElement("button");
  div.innerHTML = text;
  if (callback) {
    div.onclick = callback;
  }
  return div;
}
function createElement(type, styleOrClass = {}, styleOrNull = null) {
  var div = document.createElement(type);
  var clase = typeof styleOrClass == "string" ? styleOrClass : "";
  var style = typeof styleOrClass == "object" ? styleOrClass : styleOrNull && typeof styleOrNull == "object" ? styleOrNull : {};
  if (clase.length) div.classList.add(clase);
  if (typeof style == "object") {
    for (var k of Object.keys(style)) {
      div.style[k] = style[k];
    }
  }
  return div;
}
function createDiv(styleOrClass = {}, styleOrNull = null) {
  return createElement("div", styleOrClass, styleOrNull);
}
function h1(text = "", styleOrClass = {}, styleOrNull = null) {
  var div = createElement("h1", styleOrClass, styleOrNull);
  div.innerHTML = text;
  return div;
}
function h2(text = "", styleOrClass = {}, styleOrNull = null) {
  var div = createElement("h2", styleOrClass, styleOrNull);
  div.innerHTML = text;
  return div;
}
function label(text = "", styleOrClass = {}, styleOrNull = null) {
  var div = createElement("div", styleOrClass, styleOrNull);
  div.style.color = "#ffffffcc";
  div.innerHTML = text;
  return div;
}
var index = 0;
function addState() {
  const stateBar = document.getElementById("stateBar");
  function bubble() {
    var b = createDiv("bubble");
    if (stateBar.children.length) b.style.marginLeft = "20px";
    b.innerHTML = (index++).toString();
    return b;
  }
  stateBar.appendChild(bubble());
}
async function crearSala(e) {
  let target = e.target;
  target.classList.add("selected");
  var div = createDiv("page");
  var cuandoInicia = createDiv({
    margin: 10
  });
  cuandoInicia.innerHTML = "Cuando planeas iniciar a transmitir?";
  div.append(cuandoInicia);
  let b1 = button("Justo ahora", function () {
    fetch("/api/reservar").then(r => r.json()).then(json => {
      let room = json.result.room;
      location.href = `${location.href}transmision/${room.roomKey}`;
    });
  });
  b1.style.marginRight = "5px";
  div.append(b1);
  div.append(button("Quiero reservar una sala", function (e) {
    var room = {
      room: {
        roomId: "HOLA",
        roomKey: "KEY"
      },
      qr: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATfSURBVO3BQY4bSRAEwfAC//9l3znmqYBGJyXNIszwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIn6RmAjKpeQPIE2qeAHKjZgLyJ6l546Rq0UnVopOqRZ8sU7MJyBtAbtTcqLkBMqm5UfOGmk1ANp1ULTqpWnRSteiTLwPyhJon1ExAJjUTkBs1fxKQSc0TQJ5Q800nVYtOqhadVC365JcDMqm5UTMBmdRMQG7UTECeUPN/clK16KRq0UnVok9+OTUTkBs1k5on1ExAbtRMQCYgk5rf7KRq0UnVopOqRZ98mZq/Sc0E5Ak1E5AbNU+oeUPNv+SkatFJ1aKTqkWfLAPyJwGZ1ExAJjUTkEnNBGRSMwG5ATKpmYBMam6A/MtOqhadVC06qVqEP/KLAdmk5gbIE2pugExqfrOTqkUnVYtOqhZ98hKQSc0E5EbNBOQJNW8AmYBMam7UTEBugDwBZFJzA2RSMwG5UfPGSdWik6pFJ1WLPvnLgNyouQHyhJpJzQRkAvJNaiYgN0Bu1NyomYBsOqladFK16KRq0Sd/mZoJyARkUjOpeQLIE2pugExqJiCTmgnIpGYCcqPmBsiNmk0nVYtOqhadVC365CU1E5AbNU+ouQEyqZmATGomIJOaN4DcAJnUvAHkRs0NkEnNGydVi06qFp1ULcIfeQHIpOYGyKTmBsiNmgnIpGYCMqm5AXKjZgJyo2YCMql5A8iNmm86qVp0UrXopGoR/sgiIG+ouQEyqZmAvKFmAjKpmYDcqJmA3KiZgExq3gByo+aNk6pFJ1WLTqoW4Y98EZDfTM0E5EbNBORGzQRkUjMBmdRMQN5Q88ZJ1aKTqkUnVYs+WQZkUjMBmdRsAjKpuQEyqZmATGomIE+ouVEzAZnUTEAmNTdAJjWbTqoWnVQtOqla9MkyNTdqboDcqJmATGpugLwB5AbIG0AmNROQf9lJ1aKTqkUnVYs++TIgN2pu1ExAJjU3QG7UPKFmAnKj5pvU3AD5k06qFp1ULTqpWvTJS0AmNZOaCcgTQN5QcwPkCSCbgGwCcqPmm06qFp1ULTqpWoQ/8hcBuVFzA+RGzRNAbtQ8AWRScwPkCTU3QCY133RSteikatFJ1aJPlgG5UfMEkH8ZkEnNpGYCsgnIv+SkatFJ1aKTqkX4I78YkEnNDZAbNTdAbtRMQJ5Q8wSQTWreOKladFK16KRq0ScvAfmT1LyhZgJyA+RGzY2aCcgTQCY1T6iZgExqNp1ULTqpWnRSteiTZWo2AfkmNROQN4BMat5Q84Sav+mkatFJ1aKTqkWffBmQJ9Q8oWYCcqPmRs0baiYgk5oJyARkE5BJzTedVC06qVp0UrXok18OyKRmAjIBuVGzSc2NmgnIpGYCcgNkUjMBmdRsOqladFK16KRq0Sf/c2qeADKpuQEyqbkBsknNBORGzQRkUvPGSdWik6pFJ1WLPvkyNd+kZgIyqZmATGomNTdAJjWb1HwTkEnNppOqRSdVi06qFn2yDMifBGRSc6NmAnKjZlIzAZnU3KiZgDyhZgIyqfmbTqoWnVQtOqlahD9SteSkatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqla9B96GU8mOv+ufgAAAABJRU5ErkJggg==`
    };
    e.target.classList.add("selected");
    fetch("/api/reservar").then(r => r.json()).then(json => {
      reservarSala(json.result);
    });
  }));
  let core = document.getElementById("core");
  core.append(div);
}
globalThis.crearSala = crearSala;
async function reservarSala(result) {
  var room = result.room;
  var div = document.createElement("div");
  div.className = "page";
  var dataCard = createDiv();
  function input(placeholder, style = {}) {
    var imp = createElement("input", style);
    imp.placeholder = placeholder;
    return imp;
  }
  dataCard.append(label("Nombre del evento"));
  var nombreEvento = input("Nombre del evento", {
    fontSize: '1.5em',
    marginBottom: 30
  });
  dataCard.append(nombreEvento);
  var fechaRow = createDiv({
    marginBottom: 30
  });
  fechaRow.append(label("Fecha de inicio"));
  var fechaInput = input("Fecha de inicio", {
    fontSize: '1em',
    padding: 0,
    marginLeft: 10,
    marginTop: 10
  });
  fechaInput.type = "date";
  fechaRow.append(fechaInput);
  dataCard.append(fechaRow);
  dataCard.append(label("Palabras clave/nombres/siglas"));
  dataCard.append(input("clic para editar", {
    fontSize: '1.2em',
    marginBottom: 30
  }));
  dataCard.append(label("Email del organizador"));
  dataCard.append(input("clic para editar", {
    fontSize: '1.2em',
    marginBottom: 10
  }));
  div.append(dataCard);
  var mainCard = createDiv({
    marginTop: 20
  });
  mainCard.style.display = "flex";
  mainCard.style.flexDirection = "row";
  var imgdiv = document.createElement("div");
  var img = document.createElement("img");
  img.classList.add("margin");
  img.src = result.qr;
  imgdiv.append(img);
  mainCard.append(imgdiv);
  div.append(mainCard);
  var titleContainner = createDiv({
    marginLeft: 10
  });
  titleContainner.append(h2(room.roomId, {
    margin: "10px 0 0 0"
  }));
  titleContainner.append(label("sala reservada"));
  mainCard.append(titleContainner);
  var linkCard = createDiv({
    marginTop: 10
  });
  function createLinkItem(etiqueta, link) {
    var div = createDiv();
    div.append(label(etiqueta, {
      width: 150
    }));
    var linkItem = createElement("a", {
      margin: "0 0 5px 0px",
      display: "block",
      fontSize: "0.9em"
    });
    linkItem.href = link;
    linkItem.innerHTML = link;
    div.append(linkItem);
    return div;
  }
  linkCard.append(createLinkItem(`sala del evento:      `, `${location.href}r/${room.roomId}`));
  linkCard.append(createLinkItem(`sala de transmision:`, `${location.href}transmision/${room.roomKey}`));
  titleContainner.append(linkCard);
  let core = document.getElementById("core");
  core.innerHTML = "";
  core.append(div);
}
function entrarASala() {
  var div = createDiv();
  var mainCard = createDiv("column");
  mainCard.style.display = "flex";
  div.append(mainCard);
  var input = createElement("input", {
    margin: "10px 0",
    textTransform: "uppercase"
  });
  input.placeholder = "Room ID";
  mainCard.append(input);
  var ok = createElement("button", {
    width: "fit-content"
  });
  ok.innerText = "Enter";
  mainCard.append(ok);
  ok.onclick = () => {
    location.href = location.href + `r/${input.value}`;
  };
  let core = document.getElementById("core");
  core.innerHTML = "";
  core.append(div);
  input.focus();
}
function Page({children}) {
  return React.createElement("div", {
    style: {
      width: 640,
      flexShrink: 0
    }
  }, children);
}
function CrearNuevaSalaView({onPageChange}) {
  var entrarASala;
  var crearSala;
  var acceder;
  var registro = [];
  function registerElement(ref) {
    registro.push(ref);
  }
  function makeVisible(index) {
    for (var i = 0; i < registro.length; i++) {
      if (i != index) {
        registro[i].style.opacity = "0";
        registro[i].style.height = "0px";
        registro[i].style.overflow = "hidden";
      } else {
        registro[i].style.opacity = "1";
        registro[i].style.height = "auto";
      }
    }
  }
  function validateRoomField(text) {
    return text.match(/[a-zA-Z0-9]/gi).slice(0, 6).join("").toUpperCase();
  }
  var masButton;
  var masContenido;
  return React.createElement("div", null, React.createElement("h2", null, "1,2,3 click, empieza a transcribir"), React.createElement("div", {
    style: {
      marginBottom: 40,
      width: 500
    }
  }, React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, "\r\n                Intentamos reducir la inercia al momento de decidir si se anaden transcripciones a eventos presenciales como charlas y conferencias.\r\n                "), React.createElement("div", {
    ref: e => masButton = e,
    onClick: e => {
      masButton.remove();
      masContenido.style.height = 160;
    }
  }, "mas..."), React.createElement("div", {
    ref: e => masContenido = e,
    style: {
      overflow: "hidden",
      height: 0,
      transition: "height 0.25s"
    }
  }, "\r\n                    Para lograrlo nos enfocamos en dos puntos:\r\n                    ", React.createElement("ul", null, React.createElement("li", null, "Exponer el valor de las transcripciones incluso para quienes disfrutan de buena audicion, con la finalidad de que mas eventos sean accesibles por default. "), React.createElement("li", null, "Ampliar los escenarios en los que se pueden consumir las transcripciones, permitiendo a los organizadores hacer salas virtuales para las peronas a distancia o subtitulos en un proyector o pantalla. "))), React.createElement("div", null)), React.createElement("div", {
    className: "row"
  }, React.createElement("button", {
    ref: e => crearSala = e,
    onClick: e => {
      let target = e.target;
      acceder.classList.remove("selected");
      if (target.classList.contains("selected")) {
        makeVisible(-1);
        target.classList.remove("selected");
      } else {
        makeVisible(0);
        target.classList.add("selected");
      }
    }
  }, "Crear una sala"), React.createElement("button", {
    style: {
      marginLeft: 10
    },
    ref: e => acceder = e,
    onClick: e => {
      crearSala.classList.remove("selected");
      let target = e.target;
      if (target.classList.contains("selected")) {
        makeVisible(-1);
        target.classList.remove("selected");
      } else {
        makeVisible(1);
        target.classList.add("selected");
      }
    }
  }, "Acceder")), React.createElement("div", {
    style: {
      opacity: 0,
      transition: "opacity 0.25s, height 0.25s, visibility 0.25s"
    },
    ref: registerElement
  }, React.createElement("div", {
    style: {
      margin: "20px 10px"
    }
  }, "Cuando inicia la transmision?"), React.createElement("div", {
    className: "row"
  }, React.createElement("button", {
    onClick: e => {
      fetch("/api/reservar", {
        method: "POST"
      }).then(r => r.json()).then(json => {
        let room = json.result.room;
        location.href = `${location.href}transmision/${room.roomKey}`;
      });
    }
  }, "Justo ahora"), React.createElement("button", {
    style: {
      marginLeft: 10
    },
    onClick: e => onPageChange(1)
  }, "Hacer una reservacion"))), React.createElement("div", {
    style: {
      opacity: 0,
      transition: "opacity 0.25s, height 0.25s, visibility 0.25s"
    },
    ref: registerElement
  }, React.createElement("div", {
    style: {
      margin: "30px 10px 20px 10px"
    }
  }, "Ingrese el codigo de la sala"), React.createElement("div", {
    className: "row"
  }, React.createElement("input", {
    style: {
      fontSize: 20
    },
    placeholder: "Room Id",
    onInput: e => {
      let roomId = validateRoomField(e.target.value);
      e.target.value = roomId;
      if (roomId.length == 6) {
        entrarASala.disabled = false;
        entrarASala.onclick = () => window.open(`/r/${roomId}`, "_self");
      } else entrarASala.disabled = true;
    }
  }), React.createElement("button", {
    disabled: true,
    ref: ref => entrarASala = ref
  }, "Acceder"))), React.createElement("div", {
    style: {
      marginTop: 20,
      opacity: 0,
      transition: "opacity 0.25s"
    },
    ref: registerElement
  }, React.createElement("div", {
    style: {
      margin: "0 10px"
    }
  }, "Cuando inicia la transmision?"), React.createElement("div", {
    className: "row"
  }, "\r\n                    Soy la serenidad\r\n                ")));
}
function DetallesDeSala({onPageChange}) {
  var room = {
    eventTitle: "",
    palabrasClave: "",
    eventDate: 0,
    ownerEmail: "",
    language: "es-DO"
  };
  return React.createElement("div", null, React.createElement("div", {
    style: {
      margin: "20px 0"
    }
  }, React.createElement("div", {
    style: {
      "opacity": 0.9
    }
  }, "Nombre del evento"), React.createElement("input", {
    placeholder: "Nombre del evento",
    style: {
      fontSize: 22
    },
    onChange: e => room["eventTitle"] = e.target.value
  })), React.createElement("div", {
    style: {
      margin: "30px 0 0 0"
    }
  }, React.createElement("div", {
    style: {
      "opacity": 0.9
    }
  }, "Fecha de inicio"), React.createElement("input", {
    placeholder: "fecha programada",
    type: "date",
    onChange: e => room["eventDate"] = e.target.valueAsNumber
  })), React.createElement("div", {
    style: {
      margin: "10px 0 0 0"
    }
  }, React.createElement("div", {
    style: {
      "opacity": 0.9
    }
  }, "Palabras clave/nombres/siglas"), React.createElement("input", {
    placeholder: "clic para editar",
    onChange: e => room["palabrasClave"] = e.target.value
  })), React.createElement("div", {
    style: {
      margin: "10px 0 0 0"
    }
  }, React.createElement("div", {
    style: {
      "opacity": 0.9
    }
  }, "Email del organizador"), React.createElement("input", {
    placeholder: "opcional",
    type: "email",
    onChange: e => room["ownerEmail"] = e.target.value
  })), React.createElement("div", {
    style: {
      margin: "10px 10 0 0"
    }
  }, React.createElement("div", {
    style: {
      "opacity": 0.8
    }
  }, "Idioma"), React.createElement("select", {
    onChange: e => room["language"] = e.target.value
  }, React.createElement("option", {
    value: "es-DO"
  }, "Espanol"), React.createElement("option", {
    value: "en-US"
  }, "English"))), React.createElement("div", {
    style: {
      margin: "20px 0 0 0"
    }
  }, React.createElement("button", {
    onClick: e => onPageChange(2, room)
  }, "Continuar")));
}
function RoomDetail({ref}) {
  var containner;
  function copyLink(element, url) {
    navigator.clipboard.writeText(url);
    var {top, left} = element.getBoundingClientRect();
    top = top + window.scrollY;
    left = left + window.scrollX;
    var div = createDiv({
      zIndex: 10,
      top,
      left,
      width: 60,
      height: 22,
      position: "absolute",
      background: "#ffd400",
      color: "#111",
      padding: 10,
      shadowBox: "#000 0 0 15px"
    });
    div.innerHTML = "copiado";
    document.body.append(div);
    setTimeout(() => {
      div.remove();
    }, 1200);
  }
  function render(room, qr) {
    ReactDOM.render(React.createElement("div", {
      className: "column"
    }, React.createElement("div", {
      className: "row",
      style: {
        marginBottom: 25,
        minWidth: 0
      }
    }, React.createElement("button", {
      title: "descargar la app de pc",
      onClick: e => location.href = `${location.href}/files/beamclient.zip`
    }, "Descarga la app"), React.createElement("button", {
      title: "empezar la transcripcion",
      style: {
        marginLeft: 10
      },
      onClick: e => location.href = `${location.href}transmision/${room.roomKey}`
    }, "Empezar")), React.createElement("div", {
      className: "column"
    }, React.createElement("div", {
      style: {
        padding: "20px 0",
        width: 350
      }
    }, "\r\n                    Primero, este es el link que te permitira iniciar la transmision, no lo compartas\r\n                "), React.createElement("div", {
      title: "link para iniciar a la transcripcion",
      className: "linkTransmission",
      onClick: e => copyLink(e.target, `${location.href}transmision/${room.roomKey}`)
    }, React.createElement("h2", null, `${location.href}transmision/${room.roomKey}`))), React.createElement("div", {
      className: "column",
      style: {
        marginTop: 55
      }
    }, React.createElement("div", {
      style: {
        padding: "30px 0",
        width: 350,
        borderTop: "solid 1px"
      }
    }, "\r\n                    Imprime el codigo QR y pide a tus invitados que lo escaneen en el telefono\r\n                "), React.createElement("div", {
      className: "linkTransmission",
      onClick: e => copyLink(e.target, `${location.href}r/${room.roomId}`)
    }, React.createElement("img", {
      alt: "qr de la sala",
      src: qr,
      style: {
        width: 120
      }
    }))), React.createElement("div", {
      className: "column",
      style: {
        marginTop: 25
      }
    }, React.createElement("div", {
      style: {
        padding: "10px 0"
      }
    }, "\r\n                    O comparte la siguiente direccion\r\n                "), React.createElement("div", {
      title: "link para acceder a la transcripcion",
      className: "linkTransmission",
      onClick: e => copyLink(e.target, `${location.href}r/${room.roomId}`)
    }, React.createElement("h2", null, `${location.href}r/${room.roomId}`))), React.createElement("div", {
      className: "column",
      style: {
        marginTop: 25
      }
    }, React.createElement("div", {
      style: {
        padding: "10px 0"
      }
    }, "\r\n                    O comparte el id de la sala simplemente\r\n                "), React.createElement("div", {
      className: "linkTransmission",
      onClick: e => copyLink(e.target, `${room.roomId}`)
    }, React.createElement("h3", null, room.roomId)))), containner);
  }
  ref.call(this, {
    set: (room, qr) => {
      render(room, qr);
    }
  });
  return React.createElement("div", {
    ref: e => containner = e
  });
}
function start() {
  function MainCore() {
    var pagesWidth = 640;
    var div;
    var roomDetail;
    function onPageChange(pageNumber, data) {
      if (pageNumber == 2) {
        fetch("/api/reservar", {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json"
          }
        }).then(r => r.json()).then(json => {
          console.log(json.result.qr);
          roomDetail.set(json.result.room, json.result.qr);
          if (div) div.style.transform = `translateX(-${pageNumber * pagesWidth}px)`;
        });
      } else {
        if (div) div.style.transform = `translateX(-${pageNumber * pagesWidth}px)`;
      }
    }
    return React.createElement("div", {
      style: {
        width: pagesWidth,
        overflow: "hidden",
        margin: "0 auto"
      }
    }, React.createElement("div", {
      className: "row",
      ref: ref => div = ref,
      style: {
        transition: "transform 0.25s"
      }
    }, React.createElement(Page, null, React.createElement(CrearNuevaSalaView, {
      onPageChange: onPageChange
    })), React.createElement(Page, null, React.createElement(DetallesDeSala, {
      onPageChange: onPageChange
    })), React.createElement(Page, null, React.createElement(RoomDetail, {
      ref: d => {
        roomDetail = d;
      }
    }))));
  }
  var containner = document.createElement("div");
  document.body.append(containner);
  ReactDOM.render(React.createElement(MainCore, null), containner);
}
start();

}
}, function(){
__fuse.r(1)
})
//# sourceMappingURL=main.js.map