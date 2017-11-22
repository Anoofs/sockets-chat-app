var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server);
usernames = [];

server.listen(process.env.PORT || 3000);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
})

var bot = new Bot();
function Bot(){
	var that = this;
	this.timeout = setTimeout(function(){
		that.join();
	}, 5000);
}
Bot.prototype.cancel = function(){
	clearTimeout(this.timeout);
};
Bot.prototype.join = function(){
	io.sockets.emit('new user', 'networkSupportBot');

	// socket.on('user joined', this.user_joined_listener);
	// socket.on('user left', this.user_left_listener);
	// socket.on('new message', this.new_message_listener);
	// socket.on('client left', this.client_left_listener);
};
Bot.prototype.leave = function(){
	// io.sockets.disconnect();
};
Bot.prototype.userJoined = function(username){
	io.sockets.emit('new message', {msg: "Hi there " + username + ", I provide support with networking", user: 'networkSupportBot'});
};
Bot.prototype.userLeft = function(username){
	io.sockets.emit('new message', {msg: "Goodbye " + username + ", glad to be of help", user: 'networkSupportBot'});
};

io.sockets.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if(usernames.indexOf(data) != -1){
			callback(false);
		} else {
			callback(true);
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
			bot.userJoined(socket.username);
		}
	});

	//Update usernames
	function updateUsernames(){
		io.sockets.emit('usernames', usernames);
	}

	//Send Message
	socket.on('send message', function(data){
		io.sockets.emit('new message', {msg: data, user: socket.username});
	});

	//Disconnect
	socket.on('disconnect', function(data){
		if(!socket.username) return;
		usernames.splice(usernames.indexOf(socket.username), 1);
		updateUsernames()
		bot.userLeft(socket.username);
	})


		// Bot.prototype.new_message_listener = function(data){
		//   var socket = this.socket;
		//   if(data.message=='Hello, HAL. Do you read me, HAL?')
		//     socket.emit('message', 'Affirmative, '+data.username+'. I read you.');
		// };
		// Bot.prototype.client_left_listener = function(data){
		//   this.leave();
		// };
	   /********************** CREATING BOT, AFTER 5 SECONDS HE WILL JOIN - SEE CONSTRUCTOR OF Bot *********/
	});
