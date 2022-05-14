function button(text, callback: (event: MouseEvent & {target: HTMLButtonElement}) => void) {
    var div = document.createElement("button")
    div.innerHTML = text;

    if (callback) {           
        div.onclick = callback;
    }
    return div
}
function createElement(type, styleOrClass = {}, styleOrNull = null) {
    var div = document.createElement(type)
    var clase = typeof styleOrClass == "string"? styleOrClass : "";
    var style = typeof styleOrClass == "object"? styleOrClass : styleOrNull && typeof styleOrNull == "object"? styleOrNull : {};

    if (clase.length) div.classList.add(clase);
    if (typeof style=="object") {
        for (var k of Object.keys(style)) {
            div.style[k] = style[k]
        }
    }
    return div;
}
function createDiv( styleOrClass = {}, styleOrNull = null) {
    return createElement("div", styleOrClass, styleOrNull) as HTMLDivElement
}
function h1( text = "", styleOrClass = {}, styleOrNull = null) {
    var div = createElement("h1", styleOrClass, styleOrNull)
    div.innerHTML = text;
    return div
}
function h2( text = "", styleOrClass = {}, styleOrNull = null) {
    var div = createElement("h2", styleOrClass, styleOrNull)
    div.innerHTML = text;
    return div
}
function label( text = "", styleOrClass = {}, styleOrNull = null) {
    var div = createElement("div", styleOrClass, styleOrNull)
    div.style.color ="#ffffffcc"
    div.innerHTML = text;
    return div
}


var index = 0;
function addState() {
    const stateBar = document.getElementById("stateBar");
    
    function bubble() {
        var b = createDiv("bubble")
        if (stateBar.children.length) b.style.marginLeft = "20px";
        b.innerHTML = (index++).toString();
        return b
    }
    stateBar.appendChild(bubble())
}

async function crearSala(e) {
    let target = e.target as HTMLElement;
    target.classList.add("selected")

    var div = createDiv("page")
    var cuandoInicia = createDiv({margin: 10});
    cuandoInicia.innerHTML = "Cuando planeas iniciar a transmitir?"
    div.append(cuandoInicia)

    let b1 = button("Justo ahora", function () {
        fetch("/api/reservar").then(r => r.json()).then(json => {
            let room = json.result.room;
            location.href = `${location.href}transmision/${room.roomKey}`
        })
    })
    b1.style.marginRight = "5px"
    div.append(b1)
    div.append(button("Quiero reservar una sala", function (e) {
        var room = {room: {roomId: "HOLA", roomKey: "KEY"}, qr: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATfSURBVO3BQY4bSRAEwfAC//9l3znmqYBGJyXNIszwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIn6RmAjKpeQPIE2qeAHKjZgLyJ6l546Rq0UnVopOqRZ8sU7MJyBtAbtTcqLkBMqm5UfOGmk1ANp1ULTqpWnRSteiTLwPyhJon1ExAJjUTkBs1fxKQSc0TQJ5Q800nVYtOqhadVC365JcDMqm5UTMBmdRMQG7UTECeUPN/clK16KRq0UnVok9+OTUTkBs1k5on1ExAbtRMQCYgk5rf7KRq0UnVopOqRZ98mZq/Sc0E5Ak1E5AbNU+oeUPNv+SkatFJ1aKTqkWfLAPyJwGZ1ExAJjUTkEnNBGRSMwG5ATKpmYBMam6A/MtOqhadVC06qVqEP/KLAdmk5gbIE2pugExqfrOTqkUnVYtOqhZ98hKQSc0E5EbNBOQJNW8AmYBMam7UTEBugDwBZFJzA2RSMwG5UfPGSdWik6pFJ1WLPvnLgNyouQHyhJpJzQRkAvJNaiYgN0Bu1NyomYBsOqladFK16KRq0Sd/mZoJyARkUjOpeQLIE2pugExqJiCTmgnIpGYCcqPmBsiNmk0nVYtOqhadVC365CU1E5AbNU+ouQEyqZmATGomIJOaN4DcAJnUvAHkRs0NkEnNGydVi06qFp1ULcIfeQHIpOYGyKTmBsiNmgnIpGYCMqm5AXKjZgJyo2YCMql5A8iNmm86qVp0UrXopGoR/sgiIG+ouQEyqZmAvKFmAjKpmYDcqJmA3KiZgExq3gByo+aNk6pFJ1WLTqoW4Y98EZDfTM0E5EbNBORGzQRkUjMBmdRMQN5Q88ZJ1aKTqkUnVYs+WQZkUjMBmdRsAjKpuQEyqZmATGomIE+ouVEzAZnUTEAmNTdAJjWbTqoWnVQtOqla9MkyNTdqboDcqJmATGpugLwB5AbIG0AmNROQf9lJ1aKTqkUnVYs++TIgN2pu1ExAJjU3QG7UPKFmAnKj5pvU3AD5k06qFp1ULTqpWvTJS0AmNZOaCcgTQN5QcwPkCSCbgGwCcqPmm06qFp1ULTqpWoQ/8hcBuVFzA+RGzRNAbtQ8AWRScwPkCTU3QCY133RSteikatFJ1aJPlgG5UfMEkH8ZkEnNpGYCsgnIv+SkatFJ1aKTqkX4I78YkEnNDZAbNTdAbtRMQJ5Q8wSQTWreOKladFK16KRq0ScvAfmT1LyhZgJyA+RGzY2aCcgTQCY1T6iZgExqNp1ULTqpWnRSteiTZWo2AfkmNROQN4BMat5Q84Sav+mkatFJ1aKTqkWffBmQJ9Q8oWYCcqPmRs0baiYgk5oJyARkE5BJzTedVC06qVp0UrXok18OyKRmAjIBuVGzSc2NmgnIpGYCcgNkUjMBmdRsOqladFK16KRq0Sf/c2qeADKpuQEyqbkBsknNBORGzQRkUvPGSdWik6pFJ1WLPvkyNd+kZgIyqZmATGomNTdAJjWb1HwTkEnNppOqRSdVi06qFn2yDMifBGRSc6NmAnKjZlIzAZnU3KiZgDyhZgIyqfmbTqoWnVQtOqlahD9SteSkatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqla9B96GU8mOv+ufgAAAABJRU5ErkJggg==`};
        e.target.classList.add("selected")
        return reservarSala(room)
        fetch("/api/reservar").then(r => r.json()).then(json => {

            reservarSala(json.result)
        })
    }))

    let core = document.getElementById("core")
    core.append(div)
}
globalThis.crearSala = crearSala;


async function reservarSala(result) {
    var room = result.room;
    var div = document.createElement("div")
    div.className = "page"



    var dataCard = createDiv();
    function input(placeholder, style = {}) {
        var imp = createElement("input", style)
        imp.placeholder = placeholder;
        return imp
    }
    dataCard.append(label("Nombre del evento"))
    var nombreEvento = input("Nombre del evento", {fontSize: '1.5em', marginBottom: 30})
    dataCard.append(nombreEvento)
   
    var fechaRow = createDiv( { marginBottom: 30})
    fechaRow.append(label("Fecha de inicio"))
    var fechaInput = input("Fecha de inicio", {fontSize: '1em', padding: 0, marginLeft: 10, marginTop: 10})
    fechaInput.type = "date";
    fechaRow.append(fechaInput)


    dataCard.append(fechaRow)


    dataCard.append(label("Palabras clave/nombres/siglas"))
    dataCard.append( input("clic para editar", {fontSize: '1.2em', marginBottom: 30}))
    dataCard.append(label("Email del organizador"))
    dataCard.append( input("clic para editar", {fontSize: '1.2em', marginBottom: 10}))
    div.append(dataCard);


    var mainCard = createDiv({marginTop: 20});
    mainCard.style.display = "flex";
    mainCard.style.flexDirection = "row";
    
    var imgdiv = document.createElement("div")
    var img = document.createElement("img")
    img.classList.add("margin")
    img.src = result.qr;
    imgdiv.append(img)        
    mainCard.append(imgdiv)
    div.append(mainCard);

    var titleContainner = createDiv({marginLeft: 10});
    titleContainner.append(h2(room.roomId, {margin: "10px 0 0 0"}))
    titleContainner.append(label("sala reservada"))
    mainCard.append(titleContainner);
    var linkCard = createDiv({marginTop: 10});

    function createLinkItem(etiqueta, link) {
        var div = createDiv();
        div.append(label(etiqueta, {width: 150}))
        var linkItem = createElement("a", {margin: "0 0 5px 0px", display: "block", fontSize: "0.9em"})
        linkItem.href = link;
        linkItem.innerHTML = link;
        div.append(linkItem)
        return div
    }
    linkCard.append(createLinkItem(`sala del evento:      `, `${location.href}r/${room.roomId}`))
    linkCard.append(createLinkItem(`sala de transmision:`, `${location.href}transmision/${room.roomKey}`))
    titleContainner.append(linkCard);

    let core = document.getElementById("core")
    core.innerHTML = "";
    core.append(div)
}
function entrarASala() {
    var div = createDiv()
    var mainCard = createDiv("column");
    mainCard.style.display = "flex";
    div.append(mainCard)

    var input = createElement("input", {margin: "10px 0",   textTransform: "uppercase"}) as HTMLInputElement
    input.placeholder = "Room ID"
    
    mainCard.append(input)

    var ok = createElement("button", {width: "fit-content"})
    ok.innerText = "Enter"
    mainCard.append(ok)
    ok.onclick = () => {
        location.href = location.href+`r/${input.value}`
    }

    let core = document.getElementById("core")
    core.innerHTML = ""
    core.append(div)
    input.focus();
}
function start() {
    document.getElementById("root_crear_sala").onclick = crearSala;
    document.getElementById("root_acceder").onclick = entrarASala;
}

start();
