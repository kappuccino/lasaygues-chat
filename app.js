const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const List = require('./list')
const Rooms = require('./rooms')

const users = new List()
const rooms = new Rooms()

// We use this timer to delay a broadcasting of all statuses for everybody
let statusTimer

server.listen(8080);

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket){

	socket.on('selfRegister', function(userData){

		// If the user already exist, we simply attach the socket to it
		let user = users.getUser(userData.id)
		if(!user) user = users.addUser(userData)

		console.log(`User "${userData.name}" is connected via socket ${socket.id}`)

		// Activate the user, and attache the current socket to it
		user.setStatus('online')
		user.attachSocket(socket.id)

		usersStatus()
		roomsStatus()
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
			room = rooms.createRoom()
			room.appendUsers(usersID)
		}else{
			room = already[0]
			console.log('Recycle roomt', room.getId())
		}

		// Prevenir tout le monde
		/*io.emit('enterRoom', {
			users: data.users,
			room: room.getId()
		})*/

		roomsStatus()

		usersID.forEach(userID => {

			const user = users.getUser(userID)
			console.log(user)

			console.log(`🔥 On doit prevenir user #${user.get('name')} qu'il est dans la room #${room.getId()}`)

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

	socket.on('disconnect', function() {
		const user = users.getUserBySocket(socket.id)
		if(!user) return
		console.log(`${user.get('name')} is disconnected (previous socket ${socket.id})`)

		// Revoke the user, detach the socket
		user.setStatus('offline')
		user.detachSocket(socket.id)

		usersStatus()
	})

	socket.on('message', function(data){

		const user = users.getUserBySocket(socket.id).getId()
		if(!user) return

		const newMessage = Object.assign({}, data, {
			author: user,
			time: new Date()
		})

		io.in(data.room).emit('newMessage', newMessage)

		console.log('💬 [New message]', newMessage)

	})

})

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

		//console.log(`🔥 On doit prevenir user #${user.get('name')} qu'il est dans la room #${room.getId()}`)

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