import { createDiv } from "./utils";

interface IMsg {
    result: string,
    id: number, 
    speakerId: string
}

function span(msg: IMsg) {
    var div = createDiv("span");
    div.contentEditable = "true";
    div.innerHTML = msg.result
    return div
}

export function generarTextEditor(json: IMsg[]) {
    var mensajes: IMsg[] = [];

    for (let msg of json) {
        if (mensajes.length && mensajes[mensajes.length-1].id == msg.id) {
            mensajes[mensajes.length-1] = msg;
        } else {
            mensajes.push(msg)
        }
    }

    var div = createDiv("textEditor");
    div.contentEditable = "true";
    for (let msg of mensajes) {
        var title = span(msg)
        title.classList.add("title")
        div.append(title)
    }
    for (let msg of mensajes) {
        div.append(span(msg))
    }
    for (let msg of mensajes) {
        div.append(span(msg))
    }
    return div;
}