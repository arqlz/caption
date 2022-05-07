import * as fs from "fs"
export function appendMsgToFile(uid: string) {
    return fs.createWriteStream(__dirname+`${uid}.jsonl`)
}