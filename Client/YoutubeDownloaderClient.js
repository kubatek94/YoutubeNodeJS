var YoutubeDownloaderClient = function(socket)
{
	var self = this;

	this.socket = socket;
	this.url = null;

	this.youtubeDownloaderClientFile = null;

	this.onStartCallback = null;
	this.onProgressCallback = null;
	this.onCompleteCallback = null;
	this.onErrorCallback = null;

	this.socket.on('connect', function(){
		this.on('disconnect', function(){
			//if server disconnected and we don't have client file, that's an error
			if (self.youtubeDownloaderClientFile == null)
			{
				if (self.onErrorCallback)
				{
					self.onErrorCallback.addArg('reason', "Server has disconnected!");
					self.onErrorCallback.run();
				}
			}
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

	this.download = function(url)
	{
		this.url = url;

		this.socket.emit('downloadRequest', {"url" : this.url}, function(res)
		{
			if(res.status == "success")
			{
				self.youtubeDownloaderClientFile = 
					new DownloaderClientFile(res)
						.onProgress(function(file){
							if(self.onProgressCallback)
							{
								self.onProgressCallback.addArg('size', file.size);
								self.onProgressCallback.run();
							}
						})
						.onComplete(function(file){
							if(self.onCompleteCallback)
							{
								if(self.onCompleteCallback)
								{
									self.onCompleteCallback.addArg('file', file);
									self.onCompleteCallback.run();
								}
							}
						})
						.onError(function(reason){
							if(self.onErrorCallback)
							{
								self.onErrorCallback.addArg("reason", reason);
								self.onErrorCallback.run();
							}
						});

				if(self.onStartCallback)
				{
					self.onStartCallback.addArg('fileExt', self.youtubeDownloaderClientFile.fileExt);
					self.onStartCallback.addArg('fileName', self.youtubeDownloaderClientFile.fileName);
					self.onStartCallback.addArg('fileSize', self.youtubeDownloaderClientFile.fileSize);

					self.onStartCallback.run();
				}

				self.youtubeDownloaderClientFile.download();
			} else {
				if(self.onErrorCallback)
				{
					self.onErrorCallback.addArg("reason", res.reason);
					self.onErrorCallback.run();
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

var DownloaderClientFile = function(info)
{
	var self = this;

	//actual, expected info
	this.fileSize = parseInt(info.fileSize);
	this.fileName = decodeURIComponent(info.fileName);
	this.fileExt = info.fileExt;
	this.fileUrl = info.fileUrl;

	//event callbacks
	this.onProgressCallback = null;
	this.onCompleteCallback = null;
	this.onErrorCallback = null;

	//current size
	this.size = 0;

	this.blob = null;

	this.onProgress = function(callback)
	{
		this.onProgressCallback = callback;
		return this;
	};

	this.onComplete = function(callback)
	{
		this.onCompleteCallback = callback;
		return this;
	};

	this.onError = function(callback)
	{
		this.onErrorCallback = callback;
		return this;
	};

	this.download = function()
	{
		//make ajax request to the server to download the file
		var req = new XMLHttpRequest();
		req.open("GET", this.fileUrl, true);
		req.responseType = "blob";

		req.addEventListener("progress", function(event){
			self.size = event.loaded;

			if (self.onProgressCallback) {
				self.onProgressCallback(self);
			}
		});
		req.addEventListener("load", function(event){
			self.blob = req.response;
			if (self.onCompleteCallback) {
				self.onCompleteCallback(self);
			}
		});
		req.addEventListener("error", function(event){
			if (self.onErrorCallback) {
				self.onErrorCallback("An error occurred while transferring the file.");
			}
		});

		req.send(null);
	};
};