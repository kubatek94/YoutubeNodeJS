var util = require('util');
var Writable = require('stream').Writable;
util.inherits(NetworkStreamer, Writable);


/**
NetworkStreamer inherits from writable stream. In takes an socket.io connection as the parameter,
and whenever new data arrives to this stream, it emits it in the 'streamBuffer' event.
It is used to send whole file streams to the client using socket.io.
*/
function NetworkStreamer(socket, options)
{
	if(!(this instanceof NetworkStreamer))
		return new NetworkStreamer(socket, options);

	Writable.call(this, options);

	this.socket = socket;
	this.totalSize = 0;
};

NetworkStreamer.prototype._write = function(chunk, encoding, callback)
{
	this.totalSize += chunk.length;

	this.socket.emit('streamBuffer', {"buffer" : chunk}, function(){
		callback();
	});
};

NetworkStreamer.prototype.getTotalSize = function()
{
	return this.totalSize;
};

exports.NetworkStreamer = NetworkStreamer;