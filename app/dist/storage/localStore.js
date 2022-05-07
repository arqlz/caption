"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendMsgToFile = void 0;
const fs = require("fs");
function appendMsgToFile(uid) {
    return fs.createWriteStream(__dirname + `${uid}.jsonl`);
}
exports.appendMsgToFile = appendMsgToFile;
