var requestHandlers = require("./request_handlers");

var routes = {};
routes["/"] = requestHandlers.start;
routes["/getBranches"] = requestHandlers.getBranches;
routes["/authenticate"] = requestHandlers.authenticate;
routes["/merge"] = requestHandlers.merge;
routes["/createPull"] = requestHandlers.createPull;

function route(pathname, postData, request, response) {
	console.log("About to route a request for " + pathname);

	if (typeof routes[pathname] === 'function') {
		routes[pathname](postData, request, response);
	} else {
		console.log("No request handler found for " + pathname);
		response.writeHead(404, {
			"Content-Type": "text/plain"
		});
		response.write("404 Not Found");
		response.end();
	}
}

exports.route = route;