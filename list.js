const User = require('./user')

class List {

	constructor(){
		this.list = []
	}

	addUser(userData){
		const user = new User(userData)
		this.list = [...this.list, user]
		return user
	}

	removeUser(user){
		this.list = this.list.filter(u => u.id !== user.id)
	}

	userExists(user){
		return this.getUser(user.id)
	}

	getUser(id){
		const res = this.list.find(u => parseInt(u.data.id) === parseInt(id))
		return res ? res : null
	}

	getUserBySocket(socketId){
		const res = this.list.find(u => u.data.sockets.indexOf(socketId) > -1)
		return res ? res : null
	}

	getUserList(){
		return this.list.map(u => u)
	}

}


module.exports = List