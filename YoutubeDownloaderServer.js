var url = require('url');
var YoutubeVideoExtractor = require('./YoutubeVideoExtractor.js').YoutubeVideoExtractor;

/**
YoutubeDownloaderServer takes socket.io server as parameter and creates /download websocket endpoint.
On downloadRequest message, it starts YoutubeVideoExtractor. If the extractor fulfils, the server will
send client the title, file size and url of the AAC audio, which the client can use to download straight from youtube server,
instead of streaming using /stream endpoint.
*/
function YoutubeDownloaderServer(io)
{
	var self = this;
	this.io = io;

	this.io.of('/download').on('connection', function(socket){
		socket.on('disconnect', function(){});

		socket.on('downloadRequest', function(data, callback)
		{
			//extract video id from the url passed by the client
			var videoId = url.parse(data.url, true).query.v;

			//if we have found the videoId
			if (videoId != undefined) {
				new YoutubeVideoExtractor(videoId)
					.then(function(extractor){
						//youtube formats were succesfully extracted
						var formats = extractor.getFormats();

						//check if audio only (itag=140) format is included
						if (!formats.hasFormat(140)){
							throw new Error("Video does not include AAC audio only format!");
						}

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
					})
					.catch(function(e){
						console.log(e);
						callback({
							status : "error",
							reason : e.message
						});
					});
			} else {
				callback({
					status : "error",
					reason : "Provided url does not include video id."
				});
			}
		});
	});
};

exports.YoutubeDownloaderServer = YoutubeDownloaderServer;