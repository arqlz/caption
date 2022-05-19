import * as fs from "fs"

interface ICredentials {
    subscription: string, 
    region: string,
    cosmosDbConnectionString: string,
    storageConnectionString: string
}
var credenciales: ICredentials
export function loadCredentials(cb: (credentials: ICredentials) => void) {
    if (credenciales) return cb(credenciales);

    function build(data) {
        try {        
            let sub = JSON.parse(data);
            credenciales = sub;
            cb(sub)           
        } catch(err) {    
            throw new Error(`El archivo json de la subscripcion es invalido, se esperaba un objeto 
                {
                    "subscripcion": "subscription id for speech to text services", 
                    "region": "speech to text services resource region", 
                    "language": "speech to text default language",
                    "cosmosDbConnectionString": "a cosmos or mongodb connection string",
                    "storageConnectionString": "an azure blob storage connection string"
                }
                `)
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