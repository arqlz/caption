import * as fs from "fs"

interface ICredentials {
    subscription: string, 
    region: string,
    db_url: string,
    storageConnectionString: string
}
export function loadCredentials(cb: (credentials: ICredentials) => void) {
    function build(data) {
        try {        
            let sub = JSON.parse(data);
            cb(sub)
           
        } catch(err) {    
            throw new Error(`El archivo json de la subscripcion es invalido, se esperaba un objeto {\"subscripcion\": \"SUBSCRIPCION_ID\", \"region\": \"REGION\", "language": "LANGUAGE"}`)
        }
    }
    function getSubscripcionJSONFile() {
        fs.readFile("./subscription.json", {encoding: "utf-8"}, (err, data) => { 
            if (err) {
                throw new Error("No se han encontrado el archivo de configuracion subscription.json con una subscripcion valida")
            } else {
                build(data);
            }
        })
    }
    if (process.env.AzureSpeechSubscription) build(process.env.AzureSpeechSubscription)
    else getSubscripcionJSONFile()    
}