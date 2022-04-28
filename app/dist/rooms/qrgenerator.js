"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarQr = void 0;
const qrcode = require("qrcode");
function generarQr(content) {
    return new Promise((resolve, reject) => {
        qrcode.toDataURL(content, (err, url) => {
            if (err)
                reject(err);
            else
                resolve(url);
        });
    });
}
exports.generarQr = generarQr;
