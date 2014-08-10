var _YoutubeStreamerClient = function(socket)
{
	var self = this;

	this.socket = socket;
	this.url = null;

	this.YoutubeStreamerClientFile = null;

	this.onStartCallback = null;
	this.onProgressCallback = null;
	this.onCompleteCallback = null;

	this.socket.on('connect', function(){
		this.on('disconnect', function(){});

		this.on('streamYoutubeVideo', function(data, callback){
			self.YoutubeStreamerClientFile.addFileChunk(data.buffer);

			if(self.onProgressCallback)
			{
				self.onProgressCallback.addArg('size', self.YoutubeStreamerClientFile.size);
				self.onProgressCallback.run();
			}

			callback(self.YoutubeStreamerClientFile.size);
		});

		this.on('streamYoutubeVideoComplete', function(data){
			self.YoutubeStreamerClientFile.blob = new Blob(self.YoutubeStreamerClientFile.fileChunks, {type:"audio/mp4"});
			self.YoutubeStreamerClientFile.fileChunks = null;
			self.YoutubeStreamerClientFile.addFileChunk = null;

			if(self.onCompleteCallback)
			{
				self.onCompleteCallback.addArg('file', self.YoutubeStreamerClientFile);
				self.onCompleteCallback.run();
			}
		});
	});

	this.onStart = function(YoutubeCallback)
	{
		this.onStartCallback = YoutubeCallback;
		return this;
	};

	this.onProgress = function(YoutubeCallback)
	{
		this.onProgressCallback = YoutubeCallback;
		return this;
	};

	this.onComplete = function(YoutubeCallback)
	{
		this.onCompleteCallback = YoutubeCallback;
		return this;
	};

	this.stream = function(url)
	{
		this.url = url;

		this.socket.emit('streamYoutubeVideoRequest', {"url" : this.url}, function(res)
		{
			if(res.status == "success")
			{
				self.YoutubeStreamerClientFile = new _YoutubeStreamerClientFile(res);

				if(self.onStartCallback)
				{
					self.onStartCallback.addArg('fileExt', res.fileExt);
					self.onStartCallback.addArg('fileName', res.fileName);
					self.onStartCallback.addArg('fileSize', res.fileSize);

					self.onStartCallback.run();
				}
			} else {
				console.log( "streamYoutubeVideoRequest", res);
			}
		});
	};
};

var _YoutubeCallback = function(callback, context)
{
	this.callbacks = [];
	this.args = {};
	this.context = context;

	this.addCallback = function(callback)
	{
		this.callbacks.push(callback);
	};

	this.addArg = function(key, val)
	{
		this.args[key] = val;
	};

	this.getArg = function(key, def)
	{
		return (this.args[key] != undefined) ? this.args[key] : def;
	};

	this.run = function()
	{
		if(!this.context)
			this.context = {};

		for(var callback in this.callbacks)
		{
			this.callbacks[callback].call(this.context, this.args);
		}
	};

	if(callback)
		this.addCallback(callback);
};

var _YoutubeStreamerClientFile = function(info)
{
	//actual, expected info
	this.fileSize = parseInt(info.fileSize);
	this.fileName = info.fileName;
	this.fileExt = info.fileExt;
	this.fileUrl = info.fileUrl;

	//current size
	this.size = 0;

	//array of arraybuffers
	this.fileChunks = [];

	this.blob = null;

	this.addFileChunk = function(fileChunk)
	{
		this.fileChunks.push(fileChunk);
		this.size += fileChunk.byteLength;
	};
};