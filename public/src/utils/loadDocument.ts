import { TranscriptionDocument } from "./document"

export function loadData(room_id: string): Promise<[Blob, TranscriptionDocument]>{
    return new Promise<[Blob, TranscriptionDocument]>(async (resolve, reject) => {
        try {
            const blob = await fetch(`/audio/${room_id}`).then(r => r.blob()).catch(err => null)
            if (blob) console.log(blob.size, room_id)
            if (!blob || blob.size < 1000) return;

            fetch(`/api/transcripcion/${room_id}`).then(r => r.json()).then( (jdoc: {result: TranscriptionDocument}) => {
                var doc = new TranscriptionDocument(jdoc.result)
                resolve( [blob, doc] )
            }).catch(err => {

                return fetch(`/transcripcion/${room_id}`).then(r => r.text()).then(text => {
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