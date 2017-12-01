const Room = require('./room')

class Rooms {

	constructor() {
		this.rooms = []
	}

	createRoom(data){
		const room = new Room(data)
		this.rooms = [...this.rooms, room]
		return room
	}

	getRoom(id){
		const res = this.rooms.find(u => u.data.id === id)
		return res ? res : null
	}

	getRooms(){
		return this.rooms
	}

}


module.exports = Rooms