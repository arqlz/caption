import * as XXH from "xxhashjs";
function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}


export class Room {
    _id: string;
    roomId: string;
    roomKey: string;
    timestamp: number;
    ownerId: string;
    ownerEmail: string;
    eventTitle: string;
    eventDate: number;
    photoUrl: string;
    palabrasClave: string;
    language: string;
    length: number;
    sessions: string[];
    constructor(roomKey?: string) {
        this._id = generateUUID();
        this.roomKey = roomKey || XXH.h32(this._id, 0xBEBE).toString(36).toUpperCase();
        this.roomId = Room.getRoomId(this.roomKey);
        this.timestamp = Date.now();
        this.ownerId = "";
        this.ownerEmail = "";
        this.eventTitle = "";
        this.eventDate = 0;
        this.photoUrl = "";
        this.palabrasClave = "";
        this.language = "es-DO";
        this.length = 0;
        this.sessions = []
    }

    static getRoomId(roomKey: string): string {
        return XXH.h32(roomKey, 0xCDDE).toString(36).toUpperCase();
    }
}

var room = new Room();
