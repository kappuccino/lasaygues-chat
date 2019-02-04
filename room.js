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
		if(this.data.users.indexOf(id) === -1) this.data.users = [...this.data.users, id]
		return this
	}

	appendUsers(ids){
		ids.forEach(id => this.appendUser(id))
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

	onlyUser(id){
		if(!id) return false
		return this.data.users.length === 1 && this.data.users[0] === id
	}

	onlyUsers(users){
		if(!Array.isArray(users)) return false
		return [...this.data.users].sort().toString() === [...users].sort().toString()
	}

	isWriting(id, is){

		if(!this.data.isWriting) this.data.isWriting = []

		if(is){
			this.data.isWriting = Array.from(new Set([...this.data.isWriting, id]))
		}else{
			this.data.isWriting = this.data.isWriting.filter(id => id !== id)
		}

		return this
	}

}


module.exports = Room