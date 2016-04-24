var url = require('url');
var request = require('request');
var NetworkStreamer = require('./NetworkStreamer.js').NetworkStreamer;
var YoutubeVideoExtractor = require('./YoutubeVideoExtractor.js').YoutubeVideoExtractor;

/**
YoutubeStreamerServer takes socket.io server as parameter and creates /stream websocket endpoint.
It listens for client requests and when streaming request is received, it creates YoutubeVideoExtractor promise.
When the extractor fulfils, the streamer creates a NetworkStreamer instance and starts a network request, which is piped to the NetworkStreamer.
NetworkStreamer then sends all the output to the client using socket.io.
*/
function YoutubeStreamerServer(io)
{
	var self = this;
	this.io = io;

	//to keep track of connected sockets
	var connections = {};

	//remove socket from the connections structure if it exists,
	//removing running requests if any.
	function dropConnection(socket) {
		if (socket.id in connections) {
			var req = connections[socket.id].request;
			if (req != null) {
				req.abort();
				req = null;
			}
			delete connections[socket.id];
		}
	}

	this.io.of('/stream').on('connection', function(socket){
		//add socket to the connections structure
		connections[socket.id] = {request : null};

		//remove socket from connections structure when its disconnected
		socket.on('disconnect', function(){
			dropConnection(socket);
		});

		//listen for streamYoutubeVideoRequest messages
		socket.on('streamYoutubeVideoRequest', function(data, callback)
		{
			//extract video id from the url passed by the client
			var videoId = url.parse(data.url, true).query.v;

			//if we have found the videoId
			if (videoId != undefined) {
				//create YoutubeVideoExtractor promise
				new YoutubeVideoExtractor(videoId)
					.then(function(extractor){
						//youtube formats were succesfully extracted
						var formats = extractor.getFormats();

						//check if audio only (itag=140) format is included
						if (!formats.hasFormat(140)){
							throw new Error("Video does not include AAC audio only format!");
						}

						//start the network streamer
						//on completion let the client know how many total bytes were downloaded in this request,
						//then remove client from the connections structure
						var streamer = new NetworkStreamer(socket, {highWaterMark:65536});
						streamer.on('finish', function(){
							socket.emit('streamYoutubeVideoComplete', {sizeOnServer: (this.getTotalSize())});
							dropConnection(socket);
						});

						//extract the audio only, aac format
						var aac = formats.getFormat(140);

						//compute the url for the format
						var url = aac.getUrl();

						//send the information to the client
						callback({
							status : "success",
							fileName : encodeURIComponent(extractor.getInfo().getKey("title")),
							fileSize : aac.getParams().getKey("clen"),
							fileExt : ".m4a",
							fileUrl : url
						});

						//download the video and pipe it to the network streamer
						connections[socket.id].request = request(url);
						connections[socket.id].request.pipe(streamer);
					})
					.catch(function(e){
						console.error(e);
						socket.emit('streamError', {reason: e.message});
						dropConnection(socket);
					});
			} else {
				socket.emit('streamError', {reason: "Provided url does not include video id."});
				dropConnection(socket);
			}
		});
	});
}

exports.YoutubeStreamerServer = YoutubeStreamerServer;