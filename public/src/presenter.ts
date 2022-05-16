import { createDiv, createElement } from "./components/utils"
declare const roomId: string;

export class Presenter {
    transmissionContainner: HTMLDivElement;
    control: HTMLDivElement;
    mensajes: {[id: string]: HTMLDivElement} = {}
    queue: {result: string, id: string}[] = []
    raw: string = ""
    stoped: boolean = false;
    listennerMode: boolean = true;

    elements: {title?: HTMLElement, roomData?: HTMLElement, timeCounter?: HTMLElement} = {}

    private __title = "";
    constructor( rec?, roomKey?: string) {
        var div = createDiv({width: "100%", height: "100%"})
        div.className="msgContainner";
        div.id = "core"

        var header = createDiv("header")
        div.append(header)

        let title = createElement("h2", {margin: "15px 0"})
        title.innerHTML = ``;       
        header.append(title)
        this.elements.title = title;

        let roomData = createDiv({margin: "15px 0"})
        roomData.innerHTML = `Id de la sala: ${roomId}`;  
        let svg = createElement("img",  {paddingLeft: 10}) as HTMLImageElement;
        svg.classList.add("fullscreen")
        svg.src = "/images/fullscreen.svg";
        svg.onclick = () => {
            document.documentElement.requestFullscreen()
        }
        roomData.append(svg)     
        header.append(roomData)
        this.elements.roomData = roomData;

        let timeCounter = createDiv({margin: "15px 0", fontSize: 30, fontWeight: 600})
        timeCounter.innerHTML = ``;       
        header.append(timeCounter)
        this.elements.timeCounter = timeCounter;


        if (rec) this.listennerMode = false;

        this.control = createDiv("navigation")
        var stopButton = createElement("button")
        stopButton.innerHTML = "STOP"
        stopButton.onclick = () => {
            if (this.stoped && this.listennerMode) {
                stopButton.classList.remove("disabled")
                stopButton.innerHTML = "STOP"
                this.stoped = false;
            } else {
                stopButton.classList.add("disabled")
                stopButton.innerHTML = "RESTART"
                this.stoped = true;
            }
           
            if(rec) {
                console.log("STOP RECORDER", rec);
                rec.stop();

                var irAlEditor = createElement("button");
                irAlEditor.innerHTML = "Ir al editor";
                irAlEditor.onclick = () => {
                    location.href = `/editor/${roomKey}`;
                }
                this.control.append(irAlEditor);
            }
        }
        this.control.append(stopButton)

        


        div.append(this.control)

        this.transmissionContainner = createDiv("transcripciones", {width: 400, maxHeight: 200,  margin: "auto auto", color: "#ffffff", fontSize: 20, 
        display: "flex", flexDirection: "column", overflow: "hidden"})
        this.transmissionContainner.style.scrollBehavior = "smooth";
        div.append(this.transmissionContainner)

        document.body.append(div)
    }

    set title(value: string) {
        this.__title = value;
        this.elements.title.innerHTML = value;
    }
    set timeElapsed(value: number) {
        this.elements.timeCounter.innerHTML = (value / 3000 | 0).toString();
    }

    private render() {
        if (this.listennerMode == true && this.stoped) return;
        while(this.queue.length) {
        
            var mensaje = this.queue.splice(0, 1)[0];
            console.log(mensaje, this.queue)
            if (!this.mensajes[mensaje.id]) {
                var div = createDiv("textRow",{ marginRight: "4pt"});
                this.transmissionContainner.append(div);
                this.mensajes[mensaje.id] = div;
                this.mensajes[mensaje.id].innerHTML = mensaje.result;
                this.transmissionContainner.scrollTo({top: this.transmissionContainner.scrollHeight})
            } else {
                this.mensajes[mensaje.id].innerHTML = mensaje.result;
                this.transmissionContainner.scrollTo({top: this.transmissionContainner.scrollHeight})
            }
        }
     
    }
    append(data: {result: string, id: string}) {
        if (data) {
            this.queue.push(data)   
            this.render();  
        } else {
            console.error("Append null")
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
