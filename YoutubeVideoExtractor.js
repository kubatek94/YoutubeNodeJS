var request = require('request');
var Promise = require('promise');
var JSInterpreter = require('./JSInterpreter.js').JSInterpreter;

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

//some constants used for youtube webpage scraping
var YoutubeConstant = {
	prefixUrl : "https:",
	youtubeUrl : "//www.youtube.com/watch?v=",
	embedUrl : "//www.youtube.com/embed/",
	infoUrl : "//www.youtube.com/get_video_info?video_id={0}&eurl=https://youtube.googleapis.com/v/{0}&sts={1}"
};

//use this to download webpages
var Download = {
	page : function(url)
	{
		var options = {
			"url" : url,
			"headers" : {
				"User-Agent" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36" //"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36"
			}
		};

		return new Promise(function (fulfill, reject){
			request(options, function(error, response, body){
				//anything with code other than 2xx will result in error
				if(error || (Math.floor(response.statusCode / 100) != 2)){
					reject(error);
				} else {
					fulfill(body);
				}
			});
		});
	}
};

function InfoStore()
{
	var info = {};

	this.setKey = function(key, val){
		info[key] = val;
	}

	this.getKey = function(key, def){
		return (info[key] != undefined) ? info[key] : def;
	}

	this.deleteKey = function(key){
		if (this.hasKey(key)){
			delete info[key];
		}
	}

	this.hasKey = function(key){
		return info[key] != undefined;
	}
};

/**
This takes downloaded youtube video page (normal or embed)
and runs some regex to extract the youtube player config json.
*/
function YoutubeConfig(videoPage)
{
	var infoStore = new InfoStore();

	//config for video page
	var config = new RegExp(/(ytplayer\.config = )({.*?});/g).exec(videoPage);
	if (config != null) {
		config = JSON.parse(config[2]);
	}

	//config for embed page
	if (config == null) {
		config = new RegExp(/\(\{'PLAYER_CONFIG':\s*(\{.*?\}),\s*'EXPERIMENT_FLAGS'/g).exec(videoPage);
		if (config != null) {
			config = JSON.parse(config[1]);
		}
	}

	if (config != null) {
		for(var k in config)
		{
			infoStore.setKey(k, config[k]);
		}
	}

	return infoStore;
};

/**
YoutubeVideoFormat represents a single video format. It decrypts the s field if present only for itself, lazily.
*/
function YoutubeVideoFormat(formatsContainer, formatString)
{
	var params = new InfoStore();
	var container = formatsContainer;
	var url = null;

	this.getParams = function(){
		return params;
	}

	this.isEncrypted = function(){
		return params.hasKey("s");
	}

	this.getUrl = function(){
		if (url == null){
			if (params.hasKey("url")){
				url = decodeURIComponent(params.getKey("url"));

				//s field need to be decrypted and appened as signature to the url
				if (this.isEncrypted()) {
					var decryptionFunction = container.getDecryptionFunction();

					if (decryptionFunction == null) {
						throw new Error("Decryption function is required");
					}

					//decrypt s field using decryption function provided
					var signature = decryptionFunction(params.getKey("s"));

					//append signature to the url
					url += ("&signature=" + signature);

					//delete the s field from the params
					params.deleteKey("s");
				}
			}
		}

		return url;
	}

	{
		//regex to extract format params
		var paramsRegex = new RegExp(/[\&]*([^=]+)\=([^&]*)/g);

		var paramMatch = paramsRegex.exec(formatString);
		while (paramMatch != null){
			params.setKey(paramMatch[1], paramMatch[2]);
			paramMatch = paramsRegex.exec(formatString);
		}
	}
};

/**
This is a container for the video formats.
*/
function YoutubeVideoFormats(formatsString){
	var formats = {};
	var decryptionFunction = null;

	this.setDecryptionFunction = function(fn){
		decryptionFunction = fn;
	}

	this.getDecryptionFunction = function(){
		return decryptionFunction;
	}

	this.hasFormat = function(itag){
		return formats[itag] != undefined;
	}

	this.getFormat = function(itag){
		return formats[itag];
	}

	//return first n formats
	this.take = function(n){
		var result = [];

		for (var itag in formats){
			result.push(formats[itag]);
			n--;

			if (n <= 0) {
				return result;
			}
		}
	}

	//parse each format
	{
		var allFormats = formatsString.split(",");

		for (var i in allFormats)
		{
			var formatString = allFormats[i];

			if (formatString.length > 0) {
				var format = new YoutubeVideoFormat(this, formatString);
				formats[format.getParams().getKey("itag")] = format;
			}
		}
	}
};

/**
YoutubeVideoInfo parses the response from /get_video_info request.
It extracts the strings holding video formats and creates formats using YoutubeVideoFormats.
*/
function YoutubeVideoInfo(infoString)
{
	var params = new InfoStore();
	var formats = null;

	this.getParams = function() {
		return params;
	}

	this.getFormats = function() {
		return formats;
	}

	{
		//regex to extract info params
		var paramsRegex = new RegExp(/[\&]*([^=]+)\=([^&]*)/g);

		var paramMatch = paramsRegex.exec(infoString);
		while (paramMatch != null){
			params.setKey(paramMatch[1], paramMatch[2]);
			paramMatch = paramsRegex.exec(infoString);
		}

		//parse video formats
		if (params.hasKey("adaptive_fmts") || params.hasKey("url_encoded_fmt_stream_map"))
		{
			formats = new YoutubeVideoFormats(decodeURIComponent(
				params.getKey("adaptive_fmts", "") + "," + params.getKey("url_encoded_fmt_stream_map", "")
			));
		}
	}
};

/**
This is the main 'class'. It takes a video id as a parameter,
It returns a promise. The promise is fulfiled if it was able to extract all the video formats for given video id,
or is rejected when an exception is thrown.

Example use:
new YoutubeVideoExtractor("eSbEbym0eXM")
	.then(function(extractor){
		var formats = extractor.getFormats();
		if (formats.hasFormat(140)) {
			console.log(formats.getFormat(140).getUrl());
		}
	}, function(error){
		console.log(error);
	})
*/
function YoutubeVideoExtractor(videoId){
	var self = this;

	//used to store videoId and video title 
	var info = new InfoStore();

	//used to store the video formats with url
	var formats = null;

	//used to store the youtube config
	var config = null;

	this.getFormats = function(){
		return formats;
	}

	this.getInfo = function(){
		return info;
	}

	return new Promise(function(fulfill, reject){
		//save video id in the store
		info.setKey("id", videoId);

		//download video webpage
		Download.page(YoutubeConstant.prefixUrl + YoutubeConstant.youtubeUrl + info.getKey("id"))
			.then(function(page){
				//if video is age restricted
				if((new RegExp("player-age-gate-content")).test(page)){
					//video age restricted
					//need to get the sts field, which can be extracted from the embed website
					return Download.page(YoutubeConstant.prefixUrl + YoutubeConstant.embedUrl + info.getKey("id"))
							.then(function(embedPage){
								config = new YoutubeConfig(embedPage);

								//set title of the video
								info.setKey("title", config.getKey("args").title);

								//download video info page
								return Download.page(YoutubeConstant.prefixUrl + YoutubeConstant.infoUrl.format(info.getKey("id"), config.getKey("sts")))
									.then(function(infoPage){
										//parse video info and youtube video formats
										var videoInfo = new YoutubeVideoInfo(infoPage);

										if (videoInfo.getParams().getKey("status") == "fail") {
											throw new Error(videoInfo.getParams().getKey("reason"));
										} else {
											formats = videoInfo.getFormats();
										}
									});
							});
				} else {
					//video not restricted
					config = new YoutubeConfig(page);

					//args stores the title and video formats list
					var args = config.getKey("args");
					if (args == null) {
						throw new Error("Could not parse Youtube config");
					}

					//set title of the video
					info.setKey("title", args.title);

					//parse youtube video formats
					formats = new YoutubeVideoFormats(args.adaptive_fmts + "," + args.url_encoded_fmt_stream_map);
				}
			})
			.then(function(){
				if (formats == null) {
					throw new Error("Video formats required!");
				}

				//if url's are encrypted, we need to extract decryption function first
				if (formats.take(1)[0].isEncrypted()) {
					if (config == null) {
						throw new Error("Youtube config required!");
					}

					//download html5 player, which holds the decryption function
					return Download.page(YoutubeConstant.prefixUrl + config.getKey("assets").js)
						.then(function(playerPage){
							//extract signature decryption function from the html5 player code
							var decryptSignature = new JSInterpreter(playerPage).decryptSignature;

							//set the decryption function for the formats
							formats.setDecryptionFunction(decryptSignature);

							fulfill(self);
						});
				}

				fulfill(self);
			})
			.catch(function(e){
				console.error(e);
				reject(e.message);
			})
	});
};

exports.YoutubeVideoExtractor = YoutubeVideoExtractor;