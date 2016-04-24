/**
This runs a https server, which will serve the files in this scripts directory,
and also attaches socket.io to it, which allows the YoutubeStreamerServer and YoutubeDownloadServer to work.
*/
var https = require('https'),
	url = require("url"),
	path = require("path"),
	fs = require("fs"),
	mime = require("mime");

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

//set your desired server port here
var port = 8443;

//set the https server ssl certificates here
var httpsOptions = {
	key: fs.readFileSync('ssl/ssl_certificate.key'),
	cert: fs.readFileSync('ssl/ssl_certificate.crt'),
	ca: fs.readFileSync('ssl/ssl_certificate_ca.pem')
};

//create https server
//it will serve files in the current directory,
//or print a list for 'index.html' request
var server = https.createServer(httpsOptions, function(request, response) {
	var uri = url.parse(request.url).pathname;
	var filename = path.join(process.cwd(), uri);

	fs.stat(filename, function(error, data) {
		if (error) {
			response.writeHead(404, { "Content-Type": "text/plain" });
			response.end("Error: " + uri + " not found!");
			return;
		}

		if (data.isDirectory()) {
			if (!filename.endsWith("/")) {
				response.writeHead(302, { "Location": (uri + "/") });
				response.end();
				return;
			}

			fs.readFile(filename + "index.html", "binary", function(error, data) {
				if (error) {
					switch (error.code) {
						//index.html doesn't exist, so print file list..
						case 'ENOENT':
							fs.readdir(filename, function(error, data) {
								var file, fileList = "", dirList = "";

								for (item in data) {
									file = fs.statSync(filename + data[item]);

									if (file.isFile()) {
										fileList += "<li><a href='" + data[item] + "'>" + data[item] + "</a></li>";
									} else if (file.isDirectory()) {
										dirList += "<li><a href='" + data[item] + "/'>" + data[item] + "/</a></li>";
									}
								}

								response.writeHead(200, { "Content-Type": "text/html" });
								response.end("<ul>" + dirList + fileList + "</ul>");
							});
							break;

							//unknown error
						default:
							response.writeHead(500, { "Content-Type": "text/plain" });
							response.end("Unknown error occured: " + error.type + " -> " + error.message);
							break;
					}

					return;
				}

				//index.html exists, so serve it
				response.writeHead(200, { "Content-Type": "text/html" });
				response.write(data, "binary");
				response.end();
			});

			return;
		}

		if (data.isFile()) {
			fs.readFile(filename, "binary", function(error, data) {
				if (error) {
					console.log("Error: " + error);

					switch (error.code) {
						//file doesn't exist, so 404
						case 'ENOENT':
							response.writeHead(404, { "Content-Type": "text/plain" });
							response.end("Error: " + filename + " doesn't exist!");
							break;

							//unknown error
						default:
							response.writeHead(500, { "Content-Type": "text/plain" });
							response.end("Unknown error occured: " + error.type + " -> " + error.message);
							break;
					}

					return;
				}

				//file exists, so serve it
				response.writeHead(200, { "Content-Type": mime.lookup(filename) });
				//response.writeHead(200, {"Content-Type": "text/plain"});
				response.write(data, "binary");
				response.end();
			});

			return;
		}
	});
});

server.on('listening', function() {
	//attach the socket.io to https server
	var io = require('socket.io')();
	io.serveClient(true);

	//start the /stream and /download endpoints
	var youtubeStreamerServer = new (require('./YoutubeStreamerServer.js').YoutubeStreamerServer)(io);
	var youtubeDownloaderServer = new (require('./YoutubeDownloaderServer.js').YoutubeDownloaderServer)(io);
	//var youtubeSearchServer = new (require('./YoutubeSearchServer.js').YoutubeSearchServer)(io);

	io.attach(server);
});

server.listen(port);