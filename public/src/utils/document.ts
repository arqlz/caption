export interface IMsg {
    result: string,
    id: number, 
    speakerId: string
}


export class TranscriptionDocument {
    roomId: string = "";
    itemes: IMsg[] = [];
    photoUrl: string = "";
    constructor(roomIdOrDocument: string | TranscriptionDocument, itemes: IMsg[] = []) {
        if (typeof roomIdOrDocument == "string") {
            this.roomId = roomIdOrDocument;
            this.itemes = itemes;
        } else {
            this.roomId = roomIdOrDocument.roomId;
            this.itemes = roomIdOrDocument.itemes || itemes;
            this.photoUrl = roomIdOrDocument.photoUrl;
        }

    }
    near(second: number) {
        let candidates = this.itemes.filter(f => {
            return f.id > second*10000000;
        })
        if (candidates.length) return candidates;
        else if (this.itemes.length) return [this.itemes[this.itemes.length-1]]
        return []
    }
    clean() {
        var times = {}
        for (let m of this.itemes) {
            times[m.id] = m
        }
        this.itemes = Object.values(times)
    }
    get(id: string) {
        return this.itemes.find(f => f.id.toString() == id)
    }
    save() {
        return fetch(`/api/transcripcion/${this.roomId}`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(this)}).then(r => r.json())
    }
}
