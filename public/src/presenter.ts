import { createDiv, createElement } from "./components/utils"

export class Presenter {
    textContainner: HTMLDivElement;
    control: HTMLDivElement;
    lines: {[id: string]: HTMLDivElement} = {}
    queue: {result: string, id: string}[] = []
    constructor(rec?) {
        var div = createDiv({width: "100%", height: "100%"})

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

        var show = createDiv({width: 350, textAlign: "center", margin: "auto auto", color: "#ffffff", fontSize: 20})
        this.textContainner = show
        div.append(show)

        document.body.append(div)
        setInterval(() => {
            this.appendWord()
        }, 100)
    }
    appendWord() {    
        if (this.queue.length) {
            var w = this.queue.splice(0, 1)[0]
            if (!this.lines[w.id]) {
                var div = createDiv()
                this.textContainner.append(div)
                this.lines[w.id] = div;
            }
            this.lines[w.id].innerHTML = w.result
        }
    }
    append(data: {result: string, id: string}) {
        this.queue.push(data)
   
    }
}
