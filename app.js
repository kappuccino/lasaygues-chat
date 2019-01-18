require('dotenv').config()

const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const uuidv4 = require('uuid/v4')

const List = require('./list')
const Rooms = require('./rooms')

const users = new List()
const rooms = new Rooms()

// We use this timer to delay a broadcasting of all statuses for everybody
let statusTimer

server.listen(process.env.PORT)

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
})

io.on('connection', function (socket){

	socket.on('selfRegister', function(userData){

		// If the user already exist (we need to get the ID from the data and not from the socket),
		// we simply attach the socket to it
		let user = users.getUser(userData.id)
		if(!user) user = users.addUser(userData)

		console.log(`User "${userData.name}" is connected via socket ${socket.id}`)

		// Activate the user, and attache the current socket to it
		user.setStatus(userData.status !== undefined ? userData.status : 'online')
		user.attachSocket(socket.id)

		// Est-ce que cet utilisateur fati déjà partie de ROOM
		rooms.getRooms()
			.map(r => r.get())
			.filter(r => r.users.indexOf(userData.id) > -1)
			.forEach(r => {
				socket.join(r.id)
				console.log(`Je fait partire de la room ${r.id}`, r)

			})


		// Broadcast
		usersStatus()
		roomsStatus()

		// Rehydrate UI
		rehydrate(socket)
	})

	socket.on('exitRoom', function(id){

		console.log('-- exitRoom event --')

		const user = users.getUserBySocket(socket.id)
		const room = rooms.getRoom(id)
		if(!user || !room) return

		room.removeUser(user.getId())

		console.log('Room after removing user')
		console.log(room.get())


		roomsStatus()

	})

	socket.on('createRoom', function(data){

		console.log('-- createRoom event --')

		let room

		// Liste des ID users concerné par la room
		const usersID = [data.creator, data.guest]

		// Est-ce qu'il existe déjà une room avec QUE ces 2 users
		const already = rooms.getRooms().filter(room => room.onlyUsers(usersID))

		if(!already.length){
			console.log('createRoom', usersID)
			room = rooms.createRoom({creator: data.creator})
			room.appendUsers(usersID)
		}else{
			room = already[0]
			console.log('Recycle room', room.getId())
		}

		// Prevenir tout le monde
		/*io.emit('enterRoom', {
			users: data.users,
			room: room.getId()
		})*/

		roomsStatus()

		usersID.forEach(userID => {

			const user = users.getUser(userID)
			if(!user) return
			console.log(user)

			console.log(`🔥 On doit prevenir user #${user.get('id')} qu'il est dans la room #${room.getId()}`)

			user.get('sockets').forEach(socket => {
				const uSocket = io.sockets.connected[socket]
				if(!uSocket) return

				console.log('- Ahoy user', socket, 'please enter Room', room.getId())

				// Tell thoses users, they are in the room now
				uSocket.emit('enterRoom', {
					users: data.users,
					room: room.getId()
				})

				// And make them to enter the room
				uSocket.join(room.getId())
			})

		})

		console.log(`-- 🦊 Rooms (${rooms.getRooms().length})`)
		//console.log(JSON.stringify(rooms.getRooms(), null, 2))
	})

	socket.on('disconnect', function(){
		const user = users.getUserBySocket(socket.id)
		if(!user) return
		console.log(`${user.get('id')} is disconnected (previous socket ${socket.id})`)

		// Revoke the user, detach the socket
		user.setStatus('offline')
		user.detachSocket(socket.id)

		usersStatus()
	})

	socket.on('message', function(data){

		const user = users.getUserBySocket(socket.id).getId()
		if(!user) return

		const newMessage = {
			...data,
			id: uuidv4(),
			author: user,
			time: new Date()
		}

		io.in(data.room).emit('newMessage', newMessage)

		console.log('💬 [New message]', newMessage)
		console.log('Send message to room', data.room)
		console.log(rooms.getRoom(data.room))
	})

	socket.on('rehydrate', function(){
		console.log(`socket.on('rehydrate')...`)
		rehydrate(socket)
	})

	socket.on('updateUser', function(userData){
		let user = users.getUserBySocket(socket.id)
		if(!user) return

		console.log(`Mise à jour d'un user avec ces params`, userData)
		user.set(userData)

		usersStatus()
	})

	socket.on('toggleOnline', function(isOnline){
		const user = users.getUserBySocket(socket.id)
		if(!user) return

		console.log(`Mise à jour du status "online" pour`, user.id, `${isOnline ? 'online' : 'offline'}`)
		user.set({
			online: isOnline
		})

		usersStatus()
	})

})

function rehydrate(pipe){
	const who = pipe ? users.getUserBySocket(pipe.id).get('id') : 'all'
	console.log('-- rehydrating '+who+' ----------------------------------------------------')

	const allUsers = users.getUserList().map(u => u.get())
	const allRooms = rooms.getRooms().map(r => r.get())

	console.log('--users')
	console.log(allUsers.map(u => u.name))

	console.log('--rooms')
	console.log(allRooms)

	// Si on a un pipe, il faut renvoyer l'infos qu'a celui-ci, si non à tous
	;(pipe || io).emit('rehydrated', {
		users: allUsers,
		rooms: allRooms
	})
}

function usersStatus(){
	if(statusTimer) clearTimeout(statusTimer)
	const allUsers = users.getUserList().map(u => u.get())
	io.emit('userList', allUsers)
}

function roomsStatus(){

	const allRooms = rooms.getRooms().map(r => r.get())
	io.emit('roomsList', allRooms)

	/*users.getUserList().forEach(user => {
		if(data.users.indexOf(user.getId()) === -1) return

		//console.log(`🔥 On doit prevenir user #${user.get('id')} qu'il est dans la room #${room.getId()}`)

		user.get('sockets').forEach(socket => {
			const uSocket = io.sockets.connected[socket]
			if(!uSocket) return

			console.log('- Ahoy user', socket, 'please enter Room', room.getId())

			uSocket.emit('enterRoom', {
				users: data.users,
				room: room.getId()
			})

			// And make them to enter the room
			uSocket.join(room.getId())
		})

	})*/

}