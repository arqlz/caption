"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioATextoAzure = exports.AzureSession = exports.run = exports.decode = void 0;
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const opus_1 = require("../decoders/opus");
const fs = require("fs");
const path = require("path");
const uid_1 = require("../uid");
const speechConfig = sdk.SpeechConfig.fromSubscription("9bc07ce1fb964a599722878291fdf13a", "eastus");
speechConfig.speechRecognitionLanguage = "es-DO";
function decode() {
    let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("YourAudioFile.wav"));
    let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
}
exports.decode = decode;
const DATADIR = path.resolve(__dirname + "/../../../public/data");
async function run() {
    return;
    var ogg = await fs.promises.readFile("C:/Users/arqle/Desktop/BackupdaWork/Work/iota/caption/public/data/test.webm");
    var session = new opus_1.AudioProcessorSession();
    session.onEnd = (b) => {
        var wav = session.toWav(b);
        let audioConfig = sdk.AudioConfig.fromWavFileInput(wav);
        let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        speechRecognizer.recognizeOnceAsync(result => {
            console.log(result);
        });
        //var speechRecognizer  = new sdk.SpeechRecognizer(speechConfig, audioConfig)
        //console.log("END", wav)
        //fs.promises.writeFile(DATADIR+"/test10.wav", wav)
    };
    session.decode(ogg);
}
exports.run = run;
class AzureSession {
    constructor() {
        this._id = (0, uid_1.uid)();
        this.onData = (data) => null;
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
