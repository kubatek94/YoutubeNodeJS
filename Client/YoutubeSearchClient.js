var _YoutubeSearchClient = function(socket)
{
	var self = this;
	this.socket = socket;

	this.searchResultCallback = null;

	this.onSearchResult = function(YoutubeCallback)
	{
		this.searchResultCallback = YoutubeCallback;
		return this;
	};

	this.search = function(query, YoutubeCallback)
	{
		this.socket.emit('searchYoutube', {"query" : query, "startIndex" : "1"}, function(result)
		{
			if(self.searchResultCallback)
			{
				if(result.status == "success")
				{
					self.searchResultCallback.addArg("result", result.results);
				}
				
				self.searchResultCallback.run();
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