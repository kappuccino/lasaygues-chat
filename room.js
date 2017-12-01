const uuidv4 = require('uuid/v4')

class Room {

	constructor(roomData){
		this.data = roomData || {}
		this.data.id = uuidv4()
		if(!this.data.users) this.data.users = []
	}

	get(v){
		return v === undefined ? this.data : this.data[v]
	}

	getId(){
		return this.data.id
	}

	getUsers(){
		return this.data.users
	}

	appendUser(id){
		this.data.users = [...this.data.users, id]
		return this
	}

	appendUsers(ids){
		this.data.users = [...this.data.users, ...ids]
		return this
	}

	removeUser(id){
		this.data.users = this.data.users.filter(u => u !== id)
		return this
	}

	removeUsers(ids){
		this.data.users = this.data.users.filter(u => ids.indexOf(u) === -1)
		return this
	}

	// Dirty ?
	onlyUsers(users){
		if(!Array.isArray(users)) return false
		return [...this.data.users].sort().toString() === [...users].sort().toString()
	}

}


module.exports = Room