"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRoomKey = void 0;
const room_1 = require("./room");
async function validateRoomKey(roomId, roomKey) {
    /*
        You should provide your own validation strategy, this is only for testing purposes
    */
    var room = new room_1.Room(roomKey);
    return (room.roomId == roomId);
}
exports.validateRoomKey = validateRoomKey;
