"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearSesionTranscripcion = exports.crearSesionAlmacenamiento = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const loadCredentials_1 = require("./loadCredentials");
const stream_1 = require("stream");
const fs = require("fs");
var blobServiceClient;
(0, loadCredentials_1.loadCredentials)(credentials => {
    blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(credentials.storageConnectionString);
    blobServiceClient.getContainerClient("audio").exists().then(existe => {
        if (!existe)
            blobServiceClient.createContainer("audio");
    });
    blobServiceClient.getContainerClient("transcripcion").exists().then(existe => {
        if (!existe)
            blobServiceClient.createContainer("transcripcion");
    });
    console.log("Storage ready.");
});
function crearSesionAlmacenamiento(uid) {
    const containerClient = blobServiceClient.getContainerClient("audio");
    var stream = new stream_1.Readable({ read: () => null });
    if (process.env.PORT)
        containerClient.getBlockBlobClient(uid).uploadStream(stream);
    else {
        var writeStream = fs.createWriteStream(__dirname + `/../../../public/data/${uid}.webm`);
        stream.pipe(writeStream);
    }
    return stream;
}
exports.crearSesionAlmacenamiento = crearSesionAlmacenamiento;
function crearSesionTranscripcion(uid) {
    const containerClient = blobServiceClient.getContainerClient("transcripcion");
    var stream = new stream_1.Readable({ read: () => null });
    if (process.env.PORT)
        containerClient.getBlockBlobClient(uid).uploadStream(stream);
    else {
        var writeStream = fs.createWriteStream(__dirname + `/../../../public/data/${uid}.jsonl`, { encoding: "utf-8" });
        stream.pipe(writeStream);
    }
    return stream;
}
exports.crearSesionTranscripcion = crearSesionTranscripcion;
