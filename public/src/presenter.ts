import { createDiv, createElement } from "./components/utils"

export class Presenter {
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

        this.textContainner = createDiv({width: 350,  margin: "auto auto", color: "#ffffff", fontSize: 20, 
        display: "flex", flexDirection: "column", flexFlow: "column-reverse", overflow: "hidden", height: 120})
        div.append(this.textContainner)

        document.body.append(div)
    }
    append(data: {result: string, id: string}) {
        this.queue.push(data)   

        if (!this.lines[data.id]) {
            var div = createDiv("textRow",{ marginRight: "4pt"});
            //this.textContainner.append(div);
            this.textContainner.prepend(div);
            this.lines[data.id] = div;
            this.lines[data.id].innerHTML = data.result;
        } else {
            this.lines[data.id].innerHTML = data.result;
        }
      
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
