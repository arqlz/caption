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

    private __title = "";
    constructor( rec?) {
        var div = createDiv({width: "100%", height: "100%"})
        div.className="msgContainner";
        div.id = "core"

        let title = createDiv({margin: "15px 0"})
        title.innerHTML = `Id de la sala: ${roomId}`;
        div.append(title)

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
                console.log("STOP RECORDER", rec)
                rec.stop()
            }
        }
        this.control.append(stopButton)
        div.append(this.control)

        this.transmissionContainner = createDiv({width: 400, maxHeight: 200,  margin: "auto auto", color: "#ffffff", fontSize: 20, 
        display: "flex", flexDirection: "column", overflow: "hidden"})
        this.transmissionContainner.style.scrollBehavior = "smooth";
        div.append(this.transmissionContainner)

        document.body.append(div)
    }

    set title(value: string) {
        this.__title = value;
        
    }
    private render() {
        if (this.listennerMode == true && this.stoped) return;
        while(this.queue.length) {
            var mensaje = this.queue.splice(0, 1)[0];
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
        this.queue.push(data)   
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
export class Presenter2 {
    textContainner: HTMLDivElement;
    control: HTMLDivElement;
    lines: {[id: string]: HTMLDivElement} = {}
    queue: {result: string, id: string}[] = []
    raw: string = ""
    constructor(rec?) {
        var div = createDiv({width: "100%", height: "100%"})
        div.className="msgContainner";

        this.control = createDiv()
        var stopButton = createElement("button")
        stopButton.innerHTML = "STOP"
        stopButton.onclick = () => {
            stopButton.disabled = true
            if(rec) {
                console.log("STOP RECORDER", rec)
                rec.stop()
            }
        }
        this.control.append(stopButton)
        div.append(this.control)

        this.textContainner = createDiv({width: 350, textAlign: "center", margin: "auto auto", color: "#ffffff", fontSize: 20, display: "block"})
        div.append(this.textContainner)

        document.body.append(div)
    }
    append(data: {result: string, id: string}) {
        this.queue.push(data)   

        if (!this.lines[data.id]) {
            var div = createDiv({display: "inline", marginRight: "4pt"});
            this.textContainner.append(div);
            this.lines[data.id] = div;
            this.lines[data.id].innerHTML = data.result;
        } else {
            this.lines[data.id].innerHTML = data.result;
        }
      
    }
}
