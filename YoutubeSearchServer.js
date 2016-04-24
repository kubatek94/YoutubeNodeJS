var request = require('request');

//add string format function
//use like "Hello, {0}!".format("world")
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

/**
YoutubeSearchServer simply searches youtube for the provied query,
and returns the results to the client.
*/
function YoutubeSearchServer(io)
{
	var self = this;
	this.io = io;

	this.searchURL = "https://gdata.youtube.com/feeds/api/videos?q={0}&start-index={1}&max-results=10&v=2&alt=jsonc";

	this.io.of('/search').on('connection', function(socket){
		socket.on('disconnect', function(){});

		socket.on('searchYoutube', function(data, callback)
		{
			var searchURL = self.searchURL.format(data.query, data.startIndex);
			request(searchURL, function(error, response, body){
				callback({
					status : "success",
					results : (JSON.parse(body))
				});
			});
		});
	});
}

exports.YoutubeSearchServer = YoutubeSearchServer;