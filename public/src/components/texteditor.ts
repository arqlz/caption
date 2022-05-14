import { IMsg, TranscriptionDocument } from "../utils/document";
import { createDiv } from "./utils";


function span(msg: IMsg, clases = null) {
    var div = createDiv("span");
    if (clases) div.classList.add(clases)
    div.contentEditable = "true";
    div.innerHTML = msg.result
    return div
}

class TextEditor {
    containner: HTMLElement;
    itemes: Map<string, {div: HTMLElement, msg: IMsg}> = new Map();
    doc: TranscriptionDocument;
    changed = false;


    constructor(doc: TranscriptionDocument, div: HTMLElement) {
        this.containner = div;   
        this.doc = doc;  
    }
    append(msg: IMsg) {
        let spanMsg: HTMLElement;
        if (this.itemes.size == 0) spanMsg = span(msg, "title")
        else spanMsg = span(msg)
        spanMsg.addEventListener("input", this.onChange)
        spanMsg.addEventListener("blur", this.onSave)
        let id = msg.id.toString();
        spanMsg.id = id;  
        this.itemes.set(id, {div: spanMsg, msg})
        this.containner.append(spanMsg)  
    }
    clearMark() {
        for (let el of this.containner.children) el.classList.remove("selected")
        return this
    }
    mark(id: string) {
        this.itemes.get(id).div.classList.add("selected")
        return this
    }
    onChange = (e) => {
        this.doc.get(e.target.id).result = e.target.innerText;
        this.changed = true;
    }
    onSave = (e) => {
        if (this.changed) {
            this.doc.save().then(console.log, console.error)
            this.changed = false
        }
    }
}

export function generarTextEditor(doc: TranscriptionDocument, containner: HTMLElement) {
    var mensajes: IMsg[] = [];

    for (let msg of doc.itemes) {
        if (mensajes.length && mensajes[mensajes.length-1].id == msg.id) {
            mensajes[mensajes.length-1] = msg;
        } else {
            mensajes.push(msg)
        }
    }

    var div = createDiv("textEditor");
    //div.contentEditable = "true";
    var editor = new TextEditor(doc, div)

    for (let i = 0; i < mensajes.length; i++) {
        let msg = mensajes[i]
        editor.append(msg)
    }

    containner.append(div)
    return editor;
}