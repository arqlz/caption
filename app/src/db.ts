import {MongoClient} from "mongodb";
import { Room } from "./rooms/room";
import { loadCredentials } from "./storage/loadCredentials";

var client: MongoClient;
export async function init() {
    return new Promise<void>((resolve, reject) => {
        loadCredentials((credenciales) => {
            MongoClient.connect(credenciales.cosmosDbConnectionString, function (err, db) {
                if (err) {
                    console.error(err)
                } else {
                    client = db;
                    resolve()
                    console.log("cosmos conected")
                }       
              });
        })      
    })
}

export class CaptionDb {
    static rooms = {
        insert: async (room) => {
            return client.db("caption").collection("room").insertOne(room)
        },
        update: async (room) => {
            return client.db("caption").collection("room").updateOne({_id:room._id}, {$set: room}, {upsert: true})
        },
        find: async (query, limit = -1) => {
            return client.db("caption").collection("room").find(query).limit(limit || 1000).toArray()
        },
        findOne: async (query): Promise<Room> => {
            return client.db("caption").collection("room").findOne(query) as any
        }
    }
}
