"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionDb = exports.init = void 0;
const mongodb_1 = require("mongodb");
var client;
async function init() {
    return new Promise((resolve, reject) => {
        mongodb_1.MongoClient.connect("mongodb://caption:3O0XmeMkNG2OjUjVGbGcoEfyyoLmPvda8zN42YsaYUr2pznt4E3lTSBYl515kckTmGttEAMpP7DexFdLsOnw1Q==@caption.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@caption@", function (err, db) {
            if (err) {
                console.error(err);
            }
            else {
                client = db;
                resolve();
                console.log("cosmos conected");
            }
        });
    });
}
exports.init = init;
class CaptionDb {
}
exports.CaptionDb = CaptionDb;
_a = CaptionDb;
CaptionDb.rooms = {
    insert: async (room) => {
        return client.db("caption").collection("room").insertOne(room);
    },
    update: async (room) => {
        return client.db("caption").collection("room").updateOne({ _id: room._id }, room, { upsert: true });
    },
    find: async (query, limit = -1) => {
        return client.db("caption").collection("room").find(query).limit(limit || 1000).toArray();
    }
};
