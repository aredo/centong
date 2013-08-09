var socket = io.connect('http://localhost:3000');
// on message recived we print the new data inside the #container div

console.log(socket);
	// console.log('socket client connect '+ new Date() )
	// on message recived we print the new data inside the #container div
socket.on('startup', function (data) {
		var usersList = "";
		$.each(data.users,function(index,user){
			usersList += "<li><strong>" + user.user_name + "</strong> - " + user.user_description ;
			usersList += "</li>"
		});
		usersList += "";
		$('#userLIst').html(usersList);
});