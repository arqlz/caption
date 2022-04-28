"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioATextoAzure = exports.AzureSession = void 0;
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");
const uid_1 = require("../uid");
var speechConfig;
function createSpeechConfigObject() {
    function build(data) {
        try {
            let sub = JSON.parse(data);
            speechConfig = sdk.SpeechConfig.fromSubscription(sub.subscription, sub.region);
            speechConfig.speechRecognitionLanguage = sub.language;
        }
        catch (err) {
            throw new Error(`El archivo json de la subscripcion es invalido, se esperaba un objeto {\"subscripcion\": \"SUBSCRIPCION_ID\", \"region\": \"REGION\", "language": "LANGUAGE"}`);
        }
    }
    function getSubscripcionJSONFile() {
        fs.readFile("./subscription.json", { encoding: "utf-8" }, (err, data) => {
            if (err) {
                throw new Error("No se han encontrado el archivo de configuracion subscription.json con una subscripcion valida");
            }
            else {
                build(data);
            }
        });
    }
    if (process.env.AzureSpeechSubscription)
        build(process.env.AzureSpeechSubscription);
    else
        getSubscripcionJSONFile();
}
createSpeechConfigObject();
class AzureSession {
    constructor() {
        this._id = (0, uid_1.uid)();
        this.onData = (data) => null;
        if (!speechConfig)
            throw new Error("SpeechConfig no fue encontrado, por favor verifique si se ha creado correctamente el archivo subscription.json");
        const format = sdk.AudioStreamFormat.getWaveFormatPCM(48000, 16, 1);
        let p = sdk.AudioInputStream.createPushStream(format);
        this.writableStream = p;
        const audioConfig = sdk.AudioConfig.fromStreamInput(p);
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        recognizer.canceled = (o, e) => {
            try {
                var str = "(cancel) Reason: " + sdk.CancellationReason[e.reason];
                if (e.reason === sdk.CancellationReason.Error) {
                    str += ": " + e.errorDetails;
                }
                console.log(str);
            }
            catch (error) {
                console.log("canceled error", error);
            }
        };
        recognizer.recognizing = (o, e) => {
            try {
                this.onData(e.result);
            }
            catch (error) {
                console.log("canceled error", error);
            }
        };
        recognizer.startContinuousRecognitionAsync();
    }
    push(buffer) {
        this.writableStream.write(buffer);
    }
}
exports.AzureSession = AzureSession;
async function audioATextoAzure(wav) {
    return new Promise((resolve) => {
        let audioConfig = sdk.AudioConfig.fromWavFileInput(wav);
        let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        speechRecognizer.recognizeOnceAsync(result => {
            console.log(result);
            resolve(result.text);
        });
    });
}
exports.audioATextoAzure = audioATextoAzure;
