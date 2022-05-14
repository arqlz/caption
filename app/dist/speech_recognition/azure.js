"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioATextoAzure = exports.AzureSession = void 0;
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");
const uid_1 = require("../uid");
var speechConfig;
var subscription;
function buildConfig(language) {
    var speechConfig = sdk.SpeechConfig.fromSubscription(subscription.subscription, subscription.region);
    speechConfig.speechRecognitionLanguage = language;
    return speechConfig;
}
function createSpeechConfigObject() {
    function build(data) {
        try {
            let sub = JSON.parse(data);
            subscription = sub;
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
    constructor(language = "es-ES", sessionTimeLimitSeconds = 60 * 30) {
        this._id = (0, uid_1.uid)();
        this.onData = (data) => null;
        this.onSessionLimitReached = () => null;
        this.length = 0;
        if (!speechConfig)
            throw new Error("SpeechConfig no fue encontrado, por favor verifique si se ha creado correctamente el archivo subscription.json");
        const format = sdk.AudioStreamFormat.getWaveFormatPCM(48000, 16, 1);
        let p = sdk.AudioInputStream.createPushStream(format);
        this.writableStream = p;
        const audioConfig = sdk.AudioConfig.fromStreamInput(p);
        const recognizer = new sdk.SpeechRecognizer(buildConfig(language), audioConfig);
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
                this.length = e.result.offset / 10000000;
                if (this.length > sessionTimeLimitSeconds) {
                    // ha superado el limite de tiempo por session          
                    this.onSessionLimitReached();
                }
            }
            catch (error) {
                console.log("recognizing error", error);
            }
        };
        recognizer.recognized = (o, e) => {
            try {
                this.onData(e.result);
                this.length = e.result.offset / 10000000;
                if (this.length > sessionTimeLimitSeconds) {
                    // ha superado el limite de tiempo por session
                    this.onSessionLimitReached();
                }
            }
            catch (error) {
                console.log("recognized error", error);
            }
        };
        recognizer.startContinuousRecognitionAsync();
    }
    close() {
        console.log("Cerrando streaming");
        this.writableStream.close();
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
