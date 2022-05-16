import {FalseReact} from "./utils/falseReact";
const React = FalseReact;
const ReactDOM = FalseReact;


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
        //return reservarSala(room)
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

function Page({ children}) {
    return <div style={{width: 640, flexShrink: 0}}>
        {children}
    </div>
}




function CrearNuevaSalaView({onPageChange}) {
    var entrarASala: HTMLButtonElement
    var crearSala: HTMLButtonElement;
    var acceder: HTMLButtonElement;

    var registro = [];

    function registerElement(ref) {
        registro.push(ref)
    }

    function makeVisible(index: number) {
        for (var i = 0; i < registro.length; i++) {
            if (i != index) {
                registro[i].style.opacity = "0";
                registro[i].style.height = "0px";
                registro[i].style.overflow = "hidden";
            }
            else {
                registro[i].style.opacity = "1";
                registro[i].style.height = "auto";
            }
        }
    }
    function validateRoomField(text: string) {
        return text.match(/[a-zA-Z0-9]/gi).slice(0, 6).join("").toUpperCase()
    }

    var masButton;
    var masContenido;

    return <div>
            <h2>1,2,3 click, empieza a transcribir</h2>
            <div style={{marginBottom: 40, width: 500}}>
                <div style={{marginBottom: 10}}>
                Intentamos reducir la inercia al momento de decidir si se anaden transcripciones a eventos presenciales como charlas y conferencias.
                </div>         

                <div ref={e => masButton=e} onClick={e => {
                    masButton.remove()
                    masContenido.style.height = 160;
                }}>mas...</div>
                <div ref={e => masContenido=e} style={{overflow: "hidden", height: 0, transition: "height 0.25s"}}>
                    Para lograrlo nos enfocamos en dos puntos:
                    <ul>
                        <li>Exponer el valor de las transcripciones incluso para quienes disfrutan de buena audicion, con la finalidad de que mas eventos sean accesibles por default. </li>
                        <li>Ampliar los escenarios en los que se pueden consumir las transcripciones, permitiendo a los organizadores hacer salas virtuales para las peronas a distancia o subtitulos en un proyector o pantalla. </li>
                    </ul>
                </div>
                <div>

                </div>
            </div>


            <div className="row">
                <button ref={e => crearSala = e} onClick={e => {
                    let target = e.target as HTMLDivElement;
                    acceder.classList.remove("selected") 
                    if (target.classList.contains("selected")) {
                        makeVisible(-1)   
                        target.classList.remove("selected")  
                        
                    } else {         
                        makeVisible(0)          
                        target.classList.add("selected")  
                    }                                               
                }}>Crear una sala</button>
                <button style={{marginLeft: 10}} ref={e => acceder = e} onClick={e => {
                       crearSala.classList.remove("selected") 

                       let target = e.target as HTMLDivElement;
                       if (target.classList.contains("selected")) {
                            makeVisible(-1)   
                           target.classList.remove("selected")  
                           
                       } else {
                           makeVisible(1)   
                           target.classList.add("selected")  
                       }  
                       
                }}>Acceder</button>
            </div>   
            <div style={{ opacity: 0, transition: "opacity 0.25s, height 0.25s, visibility 0.25s" }} ref={registerElement}>
                <div style={{margin: "20px 10px"}}>Cuando inicia la transmision?</div>
                <div className="row">
                    <button onClick={e => {
                        fetch("/api/reservar", {method: "POST"}).then(r => r.json()).then(json => {

                            let room = json.result.room;
                            location.href = `${location.href}transmision/${room.roomKey}`
                        })                 
                    }}>Justo ahora</button>
                    <button style={{marginLeft: 10}} onClick={e => onPageChange(1)}>Hacer una reservacion</button>
                </div>   
            </div>
            <div style={{ opacity: 0, transition: "opacity 0.25s, height 0.25s, visibility 0.25s" }} ref={registerElement}>
                <div style={{margin: "30px 10px 20px 10px"}}>Ingrese el codigo de la sala</div>
                <div className="row">
                    <input style={{fontSize: 20}} placeholder="Room Id" onInput={e => { let roomId = validateRoomField(e.target.value); e.target.value = roomId; 
                        if (roomId.length == 6) {entrarASala.disabled = false; entrarASala.onclick = () => window.open(`/r/${roomId}`, "_self")} else entrarASala.disabled = true   }}></input>
                    <button disabled={true} ref={ref => entrarASala = ref}>Acceder</button>
                </div>   
            </div>
            <div style={{marginTop: 20, opacity: 0, transition: "opacity 0.25s" }} ref={registerElement}>
                <div style={{margin: "0 10px"}}>Cuando inicia la transmision?</div>
                <div className="row">
                    Soy la serenidad
                </div>   
            </div>
    </div>
}


function DetallesDeSala({onPageChange}) {
    var room = {eventTitle: "", palabrasClave: "", eventDate: 0, ownerEmail: "", language: "es-DO"};
    return <div>
        <div  style={{margin: "20px 0"}} >
            <div style={{"opacity": 0.9}}>Nombre del evento</div>
            <input placeholder="Nombre del evento" style={{fontSize: 22}} onChange={e => room["eventTitle"] = e.target.value}></input>                   
        </div>
        <div style={{margin: "30px 0 0 0"}}>
            <div style={{"opacity": 0.9}}>Fecha de inicio</div>            
            <input placeholder="fecha programada" type="date"  onChange={e => room["eventDate"] = e.target.valueAsNumber}></input>                                 
        </div>
        <div style={{margin: "10px 0 0 0"}}>
            <div style={{"opacity": 0.9}}>Palabras clave/nombres/siglas</div>            
            <input placeholder="clic para editar" onChange={e => room["palabrasClave"] = e.target.value}></input>                                 
        </div>
        <div style={{margin: "10px 0 0 0"}}>
            <div style={{"opacity": 0.9}}>Email del organizador</div>            
            <input placeholder="opcional" type="email"  onChange={e => room["ownerEmail"] = e.target.value}></input>                                 
        </div>
        <div style={{margin: "10px 10 0 0"}}>
            <div style={{"opacity": 0.8}}>Idioma</div>  
            <select onChange={e => room["language"] = e.target.value}>
                <option value="es-DO">Espanol</option>
                <option value="en-US">English</option>
            </select>
        </div>
        <div style={{margin: "20px 0 0 0"}}>
            <button onClick={e => onPageChange(2, room) }>Continuar</button>                             
        </div>
  
    </div>
}
function RoomDetail({ref}) {
    var containner;
    function copyLink(element: HTMLElement, url) {
        navigator.clipboard.writeText(url)
        var {top, left} =  element.getBoundingClientRect();
        top = top + window.scrollY;
        left = left + window.scrollX;
        var div = createDiv({zIndex: 10, top, left, width: 60, height: 22, position: "absolute", 
        background: "#ffd400", color: "#111", padding: 10, shadowBox: "#000 0 0 15px"})
        div.innerHTML = "copiado"
        document.body.append(div)
        setTimeout(() => {
            div.remove()
        }, 1200)
    }
    function render(room, qr) {
        //fetch("/api/reservar", {method: "POST", body: JSON.stringify(room), headers: {"Content-Type" : "application/json"}}).then(r => r.json()).then(json => {
            
            ReactDOM.render(<div className="column">
               <div className="row"  style={{marginBottom: 25, minWidth: 0}}>
               <button title="descargar la app de pc" onClick={e => location.href = `${location.href}/files/beamclient.zip`}>Descarga la app</button>

                <button title="empezar la transcripcion" style={{marginLeft: 10}} onClick={e => location.href = `${location.href}transmision/${room.roomKey}`}>Empezar</button>
              </div>


              <div className="column">
                <div style={{padding: "20px 0", width: 350}}>
                    Primero, este es el link que te permitira iniciar la transmision, no lo compartas
                </div>
                <div title="link para iniciar a la transcripcion" className="linkTransmission" onClick={e => copyLink(e.target,`${location.href}transmision/${room.roomKey}`)}><h2>{`${location.href}transmision/${room.roomKey}`}</h2></div>
              </div>

              <div className="column" style={{marginTop: 55}}>
                <div style={{padding: "30px 0", width: 350, borderTop: "solid 1px"}}>
                    Imprime el codigo QR y pide a tus invitados que lo escaneen en el telefono
                </div>
                <div className="linkTransmission" onClick={e => copyLink(e.target,`${location.href}r/${room.roomId}`)}>
                    <img alt="qr de la sala" src={ qr } style={{width: 120}}></img>
                </div>
              </div>
            
              <div className="column" style={{marginTop: 25}}>
                <div style={{padding: "10px 0"}}>
                    O comparte la siguiente direccion
                </div>
                <div title="link para acceder a la transcripcion" className="linkTransmission" onClick={e => copyLink(e.target,`${location.href}r/${room.roomId}`)}><h2>{`${location.href}r/${room.roomId}`}</h2></div>
           
              </div>
              <div className="column"  style={{marginTop: 25}}>
                <div style={{padding: "10px 0"}}>
                    O comparte el id de la sala simplemente
                </div>
                <div className="linkTransmission" onClick={e => copyLink(e.target,`${room.roomId}`)}>
                    <h3 >{room.roomId}</h3>
                </div>
              </div>
         
            </div>, containner)
        //})
  
    }

    ref.call(this, {set: (room, qr) => {
        render(room, qr)
    }})
    return <div ref={e => containner = e}>
    </div>
}

function start() {

    function MainCore() {
        var pagesWidth = 640;
        var div: HTMLDivElement;
        var roomDetail: {set};
        function onPageChange(pageNumber: number, data) {        
            if (pageNumber == 2) {
                fetch("/api/reservar", {method: "POST", body: JSON.stringify(data), headers: {"Content-Type" : "application/json"}}).then(r => r.json()).then(json => { 
                    console.log(json.result.qr)
                    roomDetail.set(json.result.room, json.result.qr)
                    if (div) div.style.transform = `translateX(-${pageNumber*pagesWidth}px)`
                })
            } else {
                if (div) div.style.transform = `translateX(-${pageNumber*pagesWidth}px)`
             
            }
        }
        return <div
            style={{ width: pagesWidth, overflow: "hidden", margin: "0 auto"}}>
            <div className="row" ref={ref => div = ref} style={{transition: "transform 0.25s"}}  >
                <Page>
                    <CrearNuevaSalaView onPageChange={onPageChange}/>                         
                </Page>
                <Page>
                    <DetallesDeSala onPageChange={onPageChange}/>
                </Page>
                <Page>
                    <RoomDetail ref={d => {roomDetail = d;}} />
                </Page>
            </div>
          
        </div>
    }
    var containner = document.createElement("div");
    document.body.append(containner);
    ReactDOM.render(<MainCore />, containner)
}

start();
