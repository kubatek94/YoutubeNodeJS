var YoutubeStreamerClient = function(socket)
{
	var self = this;

	this.socket = socket;
	this.url = null;

	this.youtubeStreamerClientFile = null;

	this.onStartCallback = null;
	this.onProgressCallback = null;
	this.onCompleteCallback = null;
	this.onErrorCallback = null;

	this.socket.on('connect', function(){
		this.on('disconnect', function(){
			//if the server has disconnected and the streaming didn't complete, that's an error
			if (self.youtubeStreamerClientFile != null && self.youtubeStreamerClientFile.size != self.youtubeStreamerClientFile.fileSize)
			{
				if (self.onErrorCallback)
				{
					self.onErrorCallback.addArg('reason', "Server has disconnected!");
					self.onErrorCallback.run();
				}

				//release the memory held by incomplete file
				self.youtubeStreamerClientFile = null;
			}
		});

		this.on('streamBuffer', function(data, callback){
			self.youtubeStreamerClientFile.addFileChunk(data.buffer);

			if(self.onProgressCallback)
			{
				self.onProgressCallback.addArg('size', self.youtubeStreamerClientFile.size);
				self.onProgressCallback.run();
			}

			callback(self.youtubeStreamerClientFile.size);
		});

		this.on('streamError', function(error){
			if(self.onErrorCallback)
			{
				self.onErrorCallback.addArg("reason", error.reason);
				self.onErrorCallback.run();
			}
		});

		this.on('streamYoutubeVideoComplete', function(data){
			self.youtubeStreamerClientFile.blob = new Blob(self.youtubeStreamerClientFile.fileChunks, {type:"audio/mp4"});
			self.youtubeStreamerClientFile.fileChunks = null;
			self.youtubeStreamerClientFile.addFileChunk = null;

			if(self.onCompleteCallback)
			{
				self.onCompleteCallback.addArg('file', self.youtubeStreamerClientFile);
				self.onCompleteCallback.run();
			}

			//release the memory
			self.youtubeStreamerClientFile = null;
		});
	});

	this.onStart = function(youtubeCallback)
	{
		this.onStartCallback = youtubeCallback;
		return this;
	};

	this.onProgress = function(youtubeCallback)
	{
		this.onProgressCallback = youtubeCallback;
		return this;
	};

	this.onComplete = function(youtubeCallback)
	{
		this.onCompleteCallback = youtubeCallback;
		return this;
	};

	this.onError = function(youtubeCallback)
	{
		this.onErrorCallback = youtubeCallback;
		return this;
	};

	this.stream = function(url)
	{
		this.url = url;

		this.socket.emit('streamYoutubeVideoRequest', {"url" : this.url}, function(res)
		{
			if(res.status == "success")
			{
				self.youtubeStreamerClientFile = new ClientFile(res);

				if(self.onStartCallback)
				{
					self.onStartCallback.addArg('fileExt', self.youtubeStreamerClientFile.fileExt);
					self.onStartCallback.addArg('fileName', self.youtubeStreamerClientFile.fileName);
					self.onStartCallback.addArg('fileSize', self.youtubeStreamerClientFile.fileSize);

					self.onStartCallback.run();
				}
			}
		});
	};
};

var YoutubeCallback = function(callback, context)
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

var ClientFile = function(info)
{
	//expected info
	this.fileSize = parseInt(info.fileSize);
	this.fileName = decodeURIComponent(info.fileName);
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