const Room = require('./room')

class Rooms {

	constructor() {
		this.rooms = []
	}

	createRoom(data){
		const room = new Room(data)
		/*console.log('-- Create a new room')
		console.log(room)
		console.log('--------------------')*/

		this.rooms = [...this.rooms, room]
		return room
	}

	getRoom(id){
		return this.rooms.find(u => u.data.id === id)
	}

	getRooms(){
		return this.rooms
	}

	removeRoom(id){
		this.rooms = this.rooms.filter(r => r.get('id') !== id)
		return this
	}

}


module.exports = Rooms