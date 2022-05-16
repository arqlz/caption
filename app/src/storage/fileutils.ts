import { BlobServiceClient } from '@azure/storage-blob';
import { loadCredentials } from './loadCredentials';
import {Readable} from "stream"
import * as fs from 'fs';


var blobServiceClient: BlobServiceClient;
loadCredentials(credentials => {
    blobServiceClient = BlobServiceClient.fromConnectionString(
        credentials.storageConnectionString
    );
  
    blobServiceClient.getContainerClient("audio").exists().then(existe => {
      if (!existe) blobServiceClient.createContainer("audio");
    })

    blobServiceClient.getContainerClient("transcripcion").exists().then(existe => {
      if (!existe) blobServiceClient.createContainer("transcripcion");
    })

    blobServiceClient.getContainerClient("rawtranscripcion").exists().then(existe => {
      if (!existe) blobServiceClient.createContainer("rawtranscripcion");
    })

    blobServiceClient.getContainerClient("images").exists().then(existe => {
      if (!existe) {
        blobServiceClient.createContainer("images");
        blobServiceClient.getContainerClient("images").setAccessPolicy("blob")
      }
      else {
        blobServiceClient.getContainerClient("images").setAccessPolicy("blob")
      }
    })
    console.log("Storage ready.")      
    
})


export function crearSesionAlmacenamiento(uid: string)  {
   const containerClient = blobServiceClient.getContainerClient("audio");
   var stream = new Readable({read: () => null}); 

   if (process.env.PORT || true ) containerClient.getBlockBlobClient(uid).uploadStream(stream);
   else {
     var writeStream = fs.createWriteStream(__dirname+`/../../../public/data/${uid}.webm`)
     stream.pipe(writeStream);
   }

   return stream
}

export function crearSesionTranscripcion(uid: string)  {
  const containerClient = blobServiceClient.getContainerClient("rawtranscripcion");
  var stream = new Readable({read: () => null}); 
  if (process.env.PORT || true) {
    containerClient.getBlockBlobClient(uid).uploadStream(stream); 
  }
  else {
    var writeStream = fs.createWriteStream(__dirname+`/../../../public/data/${uid}.jsonl`, {encoding: "utf-8"})
    stream.pipe(writeStream);
  }
  return stream
}

export function saveTrascriptionFile(key: string, data: string) {
  const containerClient = blobServiceClient.getContainerClient("transcripcion"); 
  return containerClient.getBlockBlobClient(key).uploadData(Buffer.from(data))

}

export function saveFile(collection: string, key: string, data: Buffer) {
  const containerClient = blobServiceClient.getContainerClient(collection);

  return containerClient.getBlockBlobClient(key).uploadData(data).then(r => {
    return containerClient.url+"/"+key;
  })
}
export function getFile(collection: string, key: string) {
  const containerClient = blobServiceClient.getContainerClient(collection);

  return containerClient.getBlockBlobClient(key).downloadToBuffer()
}


export function getTrascriptionFile(key: string) {
  const containerClient = blobServiceClient.getContainerClient("transcripcion");
  return containerClient.getBlockBlobClient(key).downloadToBuffer()
}