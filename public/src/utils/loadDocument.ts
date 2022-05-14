import { TranscriptionDocument } from "./document"

export function loadData(room_id: string): Promise<[Blob, TranscriptionDocument]>{
    return new Promise<[Blob, TranscriptionDocument]>(async (resolve, reject) => {
        try {
            const blob = await fetch(`/data/${room_id}.webm`).then(r => r.blob()).catch(err => {
                throw new Error("Error al descargar el archivo de audio: "+err)
            })
            fetch(`/api/transcripcion/${room_id}`).then(r => r.json()).then( (jdoc: {result: TranscriptionDocument}) => {
                var doc = new TranscriptionDocument(jdoc.result)
                resolve( [blob, doc] )
            }).catch(err => {
                return fetch(`/data/${room_id}.jsonl`).then(r => r.text()).then(text => {
                    var json = text.split("\n").filter(f => f.trim().length).map(j => JSON.parse(j))
                    var doc = new TranscriptionDocument(room_id, json)
                    doc.clean()
                    resolve( [blob, doc] )
                }).catch(err => {
                    throw new Error("El archivo jsonl no fue encontrado: "+err)
                })
            })            

        } catch(err) {
            reject(err)
        }
    })
}