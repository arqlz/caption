import sdk = require("microsoft-cognitiveservices-speech-sdk");
import * as fs from "fs"
import { uid } from "../uid";


var speechConfig: sdk.SpeechConfig; 

function createSpeechConfigObject() {
    function build(data) {
        try {        
            let sub = JSON.parse(data);
            speechConfig = sdk.SpeechConfig.fromSubscription(sub.subscription, sub.region);
            speechConfig.speechRecognitionLanguage = sub.language;
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
createSpeechConfigObject()





export class AzureSession {
    _id: string = uid()
    speechRecognizer: sdk.SpeechRecognizer
    writableStream: sdk.PushAudioInputStream
    onData = (data: sdk.SpeechRecognitionResult) => null
    constructor() {
        if (!speechConfig) throw new Error("SpeechConfig no fue encontrado, por favor verifique si se ha creado correctamente el archivo subscription.json")
        const format = sdk.AudioStreamFormat.getWaveFormatPCM(48000, 16, 1);      
        let p = sdk.AudioInputStream.createPushStream(format)
        this.writableStream = p

        
        const audioConfig = sdk.AudioConfig.fromStreamInput(p);
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        recognizer.canceled = (o, e) => {
            try {
              var str = "(cancel) Reason: " + sdk.CancellationReason[e.reason];
              if (e.reason === sdk.CancellationReason.Error) {
                str += ": " + e.errorDetails;
              }
              console.log(str);
      
            } catch (error) {
              console.log("canceled error", error)
      
            }
        };
   
        recognizer.recognizing = (o, e) => {
            try {
                this.onData(e.result)
            } catch (error) {
                console.log("canceled error", error)        
            }
        };
        recognizer.startContinuousRecognitionAsync()   

    }
    push(buffer) {        
        this.writableStream.write(buffer)  
    }
}
export async function audioATextoAzure(wav: Buffer) {
    return new Promise((resolve) => {    
        let audioConfig = sdk.AudioConfig.fromWavFileInput(wav);
        let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        speechRecognizer.recognizeOnceAsync(result => { 
            console.log(result)
            resolve(result.text)
        })  
    })
}