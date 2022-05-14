"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrascriptionFile = exports.saveFile = exports.saveTrascriptionFile = exports.crearSesionTranscripcion = exports.crearSesionAlmacenamiento = void 0;
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
    blobServiceClient.getContainerClient("rawtranscripcion").exists().then(existe => {
        if (!existe)
            blobServiceClient.createContainer("rawtranscripcion");
    });
    blobServiceClient.getContainerClient("images").exists().then(existe => {
        if (!existe) {
            blobServiceClient.createContainer("images");
            blobServiceClient.getContainerClient("images").setAccessPolicy("blob");
        }
        else {
            blobServiceClient.getContainerClient("images").setAccessPolicy("blob");
        }
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
    const containerClient = blobServiceClient.getContainerClient("rawtranscripcion");
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
function saveTrascriptionFile(key, data) {
    const containerClient = blobServiceClient.getContainerClient("transcripcion");
    return containerClient.getBlockBlobClient(key).uploadData(Buffer.from(data));
}
exports.saveTrascriptionFile = saveTrascriptionFile;
function saveFile(collection, key, data) {
    const containerClient = blobServiceClient.getContainerClient(collection);
    return containerClient.getBlockBlobClient(key).uploadData(data).then(r => {
        return containerClient.url + "/" + key;
    });
}
exports.saveFile = saveFile;
function getTrascriptionFile(key) {
    const containerClient = blobServiceClient.getContainerClient("transcripcion");
    return containerClient.getBlockBlobClient(key).downloadToBuffer();
}
exports.getTrascriptionFile = getTrascriptionFile;
