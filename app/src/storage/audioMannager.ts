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
    console.log("Storage ready.")      
    
})





export function crearSesionAlmacenamiento(uid: string)  {
   const containerClient = blobServiceClient.getContainerClient("audio");
   var stream = new Readable({read: () => null}); 

   if (process.env.PORT) containerClient.getBlockBlobClient(uid).uploadStream(stream);
   else {
     var writeStream = fs.createWriteStream(__dirname+`/../../../public/data/${uid}.webm`)
     stream.pipe(writeStream);
   }

   return stream
}

export function crearSesionTranscripcion(uid: string)  {
  const containerClient = blobServiceClient.getContainerClient("transcripcion");
  var stream = new Readable({read: () => null}); 
  if (process.env.PORT) containerClient.getBlockBlobClient(uid).uploadStream(stream); 
  else {
    var writeStream = fs.createWriteStream(__dirname+`/../../../public/data/${uid}.jsonl`, {encoding: "utf-8"})
    stream.pipe(writeStream);
  }
  return stream
}