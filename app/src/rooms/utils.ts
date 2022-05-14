import { Room } from "./room"

export async function validateRoomKey(roomId: string, roomKey: string) {
    /*
        You should provide your own validation strategy, this is only for testing purposes
    */
    var room = new Room(roomKey)
    return (room.roomId == roomId)
}