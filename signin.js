$(document).ready(function() {
	$("#login").click(function() {
		var username = $("#username").val();
		var password = $("#password").val();
		// Checking for blank fields.
		if (username == '' || password == '') {
			$('input[type="text"],input[type="password"]').css("border", "2px solid red");
			$('input[type="text"],input[type="password"]').css("box-shadow", "0 0 3px red");
			alert("Please fill all fields...!!!!!!");
		} else {
			$.post("/authenticate", {
					username: username,
					password: password
				},
				function(data) {
					if (data.message != null) {
						var json = eval("(" + data.message + ")");
						$('input[type="text"],input[type="password"]').css({
							"border": "2px solid red",
							"box-shadow": "0 0 3px red"
						});
						alert(json.message);
					} else {
						$("form")[0].reset();
						$('input[type="text"],input[type="password"]').css({
							"border": "2px solid #00F5FF",
							"box-shadow": "0 0 5px #00F5FF"
						});
						// logged in
						window.location.href = '/index.html';
					}
				});
		}
	});
});