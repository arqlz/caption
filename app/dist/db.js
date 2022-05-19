"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionDb = exports.init = void 0;
const mongodb_1 = require("mongodb");
const loadCredentials_1 = require("./storage/loadCredentials");
var client;
async function init() {
    return new Promise((resolve, reject) => {
        (0, loadCredentials_1.loadCredentials)((credenciales) => {
            mongodb_1.MongoClient.connect(credenciales.cosmosDbConnectionString, function (err, db) {
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
        return client.db("caption").collection("room").updateOne({ _id: room._id }, { $set: room }, { upsert: true });
    },
    find: async (query, limit = -1) => {
        return client.db("caption").collection("room").find(query).limit(limit || 1000).toArray();
    },
    findOne: async (query) => {
        return client.db("caption").collection("room").findOne(query);
    }
};
