const List = require('./list')
const User = require('./user')
const Rooms = require('./rooms')
const Room = require('./room')


// List
it('Empty list on start', function(){
	const L = new List()
	expect(L.getUserList().length).toBe(0)
})

it('Add a user should increase list size', function(){
	const L = new List()

	L.addUser({id: 123})

	expect(L.getUserList().length).toBe(1)
})

it('Remove a user', function(){
	const L = new List()

	const u = L.addUser({id: 123})
	L.removeUser(u)

	expect(L.getUserList().length).toBe(0)
})

it('Get a user form id', function(){
	const L = new List()

	L.addUser({id: 123})

	expect(L.getUser(123).get('id')).toBe(123)
})

it('Get a user form socket id', function(){
	const L = new List()

	L.addUser({id: 123, sockets: ['abcd']})

	expect(L.getUserBySocket('abcd').get('id')).toBe(123)
})

it('Get this user id using .get()', function(){
	const L = new List()

	const u = L.addUser({id: 123})

	expect(u.get('id')).toBe(123)
})

it('Check if a user exists', function(){
	const L = new List()

	L.addUser({id: 123})

	expect(L.userExists({id: 123})).toBeTruthy()
})

it('Update a user should update this user in the list', function(){
	const L = new List()

	const u = L.addUser({id: 123})

	u.set({name: 'Benjamin'})

	const list = L.getUserList()

	expect(list[0].data.name).toBe('Benjamin')
})






// User

it('Attach the socket to a user', function(){
	const u = new User({id: 123})

	u.attachSocket('abcdef')

	expect(u.data.sockets.length).toBe(1)
})

it('Detach the socket from a user', function(){
	const u = new User({id: 123, sockets: ['abcdef']})

	u.detachSocket('abcdef')

	expect(u.data.sockets.length).toBe(0)
})

it('Update a user', function(){
	const u = new User({id: 123})

	u.set({name: 'Benjamin'})

	expect(u.data.name).toBe('Benjamin')
})

it('Update the status of a user', function(){
	const u = new User({id: 123})

	u.setStatus('online')

	expect(u.data.status).toBe('online')
})




// Rooms

it('Should return a list of room', function(){
	const R = new Rooms()
	expect(R.getRooms().length).toBe(0)
})

it('Should add a room to the list of room', function(){
	const R = new Rooms()

	R.createRoom()

	expect(R.getRooms().length).toBe(1)
})

it('Should get the room id (from room object)', function(){
	const R = new Rooms()

	const room = R.createRoom()
	const id = room.data.id

	expect(R.getRooms()[0].getId()).toBe(id)
})



// Room

it('Should create an empty room', function(){
	const R = new Room()

	expect(R.data.users.length).toBe(0)
})

it('Create an empty room should create a random room.id', function(){
	const R = new Room({})
	expect(R.data.id).toBeTruthy()
})

it('Should append 1 user into a room', function(){
	const R = new Room()

	R.appendUser(1)

	expect(R.data.users.length).toBe(1)
})

it('Should append 2 users into a room', function(){
	const R = new Room()

	R.appendUsers([1,2])

	expect(R.data.users.length).toBe(2)
})

it('Should remove 1 user from a room', function(){
	const R = new Room()
	expect.assertions(2)

	R.appendUser(1)
	expect(R.data.users.length).toBe(1)

	R.removeUser(1)
	expect(R.data.users.length).toBe(0)
})

it('Should remove 2 users from a room', function(){
	const R = new Room()
	expect.assertions(2)

	R.appendUsers([1,2])
	expect(R.data.users.length).toBe(2)

	R.removeUsers([1,2])
	expect(R.data.users.length).toBe(0)
})

it('Should check if a room contain only a set of user', function(){
	const R = new Room()
	expect.assertions(6)

	R.appendUsers([1,2])

	expect(R.onlyUsers([1,2])).toBeTruthy()
	expect(R.onlyUsers([1,2,3])).toBeFalsy()
	expect(R.onlyUsers([1])).toBeFalsy()
	expect(R.onlyUsers()).toBeFalsy()
	expect(R.onlyUsers({})).toBeFalsy()
	expect(R.onlyUsers('')).toBeFalsy()
})