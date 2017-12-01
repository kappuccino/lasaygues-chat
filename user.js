class User{

	constructor(userData){
		this.data = userData || {}
		if(!this.data.sockets) this.data.sockets = []
	}

	getId(){
		return this.data.id
	}

	get(v){
		return v === undefined ? this.data : this.data[v]
	}

	set(data={}){
		this.data = Object.assign({}, this.data, data)
		return this
	}

	setStatus(status){
		return this.set({status})
	}

	attachSocket(socketId){
		this.data.sockets = [...this.data.sockets, socketId]
		return this
	}

	detachSocket(socketId){
		this.data.sockets = this.data.sockets.filter(s => s !== socketId)
		return this
	}

}


module.exports = User