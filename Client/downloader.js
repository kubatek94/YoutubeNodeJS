(function ()
{
	var ProgressBarScript = "var _ProgressBar=function(width,height){var _progressBar=function(w,h){this.html='<div class=\"YoutubeStreamer meter blue\"><span></span><span class=\"YoutubeStreamer speed\"></span></div>';this.container=null;this.progress=null;this.speed=null;this.init=function(){this.container=((new DOMParser()).parseFromString(this.html,\"text/html\")).getElementsByTagName(\"div\")[0];this.progress=this.container.children[0];this.speed=this.container.children[1];if(w){this.setWidth(w)}if(h){this.setHeight(h)}this.progress.style.width=0};this.setWidth=function(width){this.container.style.width=width+\"px\"};this.setHeight=function(height){this.container.style.height=height+\"px\"};this.setSpeed=function(speed){this.speed.innerHTML=speed};this.setValue=function(value){this.progress.style.width=value+\"%\"};this.init()};this.progressBar=new _progressBar(width,height);this.setSpeed=function(speed){this.progressBar.setSpeed(speed)};this.setValue=function(value){this.progressBar.setValue(value)};this.get=function(){return this.progressBar.container}};";
	var ProgressWindowScript = "var _ProgressWindow=function(e,t){var n=function(e,t){this.html=\"<div class='YoutubeStreamer window'><span class='YoutubeStreamer title'></span></div>\";this.container=null;this.title=null;this.progressBar=null;this.init=function(){this.container=(new DOMParser).parseFromString(this.html,\"text/html\").getElementsByTagName(\"div\")[0];this.title=this.container.children[0];this.progressBar=new _ProgressBar(e,15);this.container.appendChild(this.progressBar.get());if(e)this.setWidth(e)};this.setWidth=function(e){this.container.style.width=e+\"px\"};this.setHeight=function(e){this.container.style.height=e+\"px\"};this.setTitle=function(e){this.title.innerHTML=e};this.setSpeed=function(s){this.progressBar.setSpeed(s)};this.setValue=function(e){this.progressBar.setValue(e)};this.show=function(){this.container.style.display=\"inline-block\"};this.hide=function(){this.container.style.display=\"none\"};this.init()};this.progressWindow=new n(e,t);this.setTitle=function(e){this.progressWindow.setTitle(e)};this.setSpeed=function(s){this.progressWindow.setSpeed(s)};this.setValue=function(e){this.progressWindow.setValue(e)};this.show=function(){this.progressWindow.show()};this.hide=function(){this.progressWindow.hide()};this.get=function(){return this.progressWindow.container}}";
	var ProgressBarCss = ".YoutubeStreamer.meter{text-align:left;position:relative;margin:0;background:#BBC1C4;-moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5px;padding:0;-webkit-box-shadow:inset 0 -1px 1px rgba(255,255,255,.3);-moz-box-shadow:inset 0 -1px 1px rgba(255,255,255,.3);box-shadow:inset 0 -1px 1px rgba(255,255,255,.3)}span.YoutubeStreamer.speed{text-align:center;color:#000;background:0 0!important;position:absolute!important;top:0;left:0;width:100%}.YoutubeStreamer.meter>span{display:block;height:100%;-webkit-border-radius:5px;-moz-border-radius-topright:5px;-moz-border-radius-bottomright:5px;border-radius:5px;-moz-border-radius-topleft:5px;-moz-border-radius-bottomleft:5px;background-color:#2bc253;background-image:-webkit-gradient(linear,left bottom,left top,color-stop(0,#2bc253),color-stop(1,#54f054));background-image:-moz-linear-gradient(center bottom,#2bc253 37%,#54f054 69%);-webkit-box-shadow:inset 0 2px 9px rgba(255,255,255,.3),inset 0 -2px 6px rgba(0,0,0,.4);-moz-box-shadow:inset 0 2px 9px rgba(255,255,255,.3),inset 0 -2px 6px rgba(0,0,0,.4);box-shadow:inset 0 2px 9px rgba(255,255,255,.3),inset 0 -2px 6px rgba(0,0,0,.4);position:relative;overflow:hidden}.YoutubeStreamer.animate>span>span,.YoutubeStreamer.meter>span:first-child:after{content:'';position:absolute;top:0;left:0;bottom:0;right:0;background-image:-webkit-gradient(linear,0 0,100% 100%,color-stop(.25,rgba(255,255,255,.2)),color-stop(.25,transparent),color-stop(.5,transparent),color-stop(.5,rgba(255,255,255,.2)),color-stop(.75,rgba(255,255,255,.2)),color-stop(.75,transparent),to(transparent));background-image:-moz-linear-gradient(-45deg,rgba(255,255,255,.2) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.2) 75%,transparent 75%,transparent);z-index:1;-webkit-background-size:50px 50px;-moz-background-size:50px 50px;-webkit-animation:move 2s linear infinite;-webkit-border-radius:5px;-moz-border-radius-topright:5px;-moz-border-radius-bottomright:5px;border-radius:5px;-moz-border-radius-topleft:5px;-moz-border-radius-bottomleft:5px;overflow:hidden}.YoutubeStreamer.animate>span:after{display:none}@-webkit-keyframes move{0%{background-position:0 0}100%{background-position:50px 50px}}.YoutubeStreamer.blue>span{background-color:#A3CCF0;background-image:-moz-linear-gradient(top,#A3CCF0,#2385F4);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#A3CCF0),color-stop(1,#2385F4));background-image:-webkit-linear-gradient(#A3CCF0,#2385F4)}.YoutubeStreamer.nostripes>span:after,.YoutubeStreamer.nostripes>span>span{-webkit-animation:none;background-image:none}";
	var ProgressWindowCss = ".YoutubeStreamer.window{text-align:left;display:none;color:#fff;background:#333;padding:10px;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;position:fixed;top:10px;left:10px;z-index:2999999999}.YoutubeStreamer.title{text-align:left}";

	{
		var ScriptsLoader = function(){
			this._filesCounter = 0;
			this._filesLoaded = 0;

			this._files = {_all: false};

			this.onCompleteCallback = null;
			this.onProgressCallback = null;

			this.onComplete = function(callback){
				this.onCompleteCallback = callback;
				return this;
			}

			this.onProgress = function(callback){
				this.onProgressCallback = callback;
				return this;
			}

			this._fileLoaded = function(id){
				this._filesLoaded += 1;

				//call on progress callback with percent done
				if(this.onProgressCallback)
					this.onProgressCallback(((this._filesLoaded/this._filesCounter)*100));

				this._files[id] = true;
				var allLoaded = true;
				for (var s in this._files){
					if ((s != "_all") && (!this._files[s])){
						allLoaded = false;
						break;
					}
				}
				if (allLoaded && this.onCompleteCallback){
					this.onCompleteCallback();
				}
			}

			this.isUrl = function(url){
				var pattern = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
				return pattern.test(url);
			}

			this.addStyle = function (styleUrl){
				var id = "_style" + this._filesCounter++;
				var fileLoader = new FileLoader(this, id, styleUrl);
			}

			this.addScript = function (scriptUrl){
				var id = "_script" + this._filesCounter++;
				var fileLoader = new FileLoader(this, id, scriptUrl);
			}

			//this is responsible for loading a single script or css
			function FileLoader(parent, id, url){
				var self = parent;
				var fileId = id;
				parent._files[id] = false;
				this.url = url;
				this.file = null;
				if (fileId.indexOf('_style') == 0){
					if(self.isUrl(url)){
						/* load using src */
						this.file = document.createElement('link');
						this.file.setAttribute("rel", "stylesheet");
						this.file.setAttribute("type", "text/css");
						this.file.setAttribute("href", this.url);
						this.file.onload = function ()
						{
							self._fileLoaded(fileId);
						};
					} else {
						/* load using text */
						this.file = document.createElement('style');
						this.file.innerHTML = url;
						this.file.onload = null;
					}
				} else if (fileId.indexOf('_script') == 0){
					this.file = document.createElement('script');
					this.file.type = "text/javascript";
					this.file.onload = null;

					if(self.isUrl(url)){
						/* load using src */
						this.file.src = this.url;
						this.file.onload = function(){
							self._fileLoaded(fileId);
						};
					} else {
						/* load using text */
						this.file.innerHTML = url;
					}
				}

				document.getElementsByTagName('head')[0].appendChild(this.file);

				if(this.file.onload == null){
					self._fileLoaded(fileId);
				}
			};
		};
	}

	/* load ProgressWindow and ProgressBar instantly */
	var uiLoader = new ScriptsLoader();
	uiLoader.addStyle(ProgressBarCss);
	uiLoader.addStyle(ProgressWindowCss);
	uiLoader.addScript(ProgressBarScript);
	uiLoader.addScript(ProgressWindowScript);

	var progressWindow = new _ProgressWindow(250, 50);
	document.getElementsByTagName("body")[0].appendChild(progressWindow.get());
	progressWindow.setTitle("Loading files..");
	progressWindow.show();

	var scriptsLoader = new ScriptsLoader();
	scriptsLoader
		.onProgress(function(progress){
			progressWindow.setValue(progress);
		})
		.onComplete(function(){
			progressWindow.setTitle("Connecting to server..");
			progressWindow.setValue(100);

			var url = window.location.href;
			var socket = io((window.YOUTUBE_NODE_JS_HOST + ":" + window.YOUTUBE_NODE_JS_PORT) + "/download");
			var youtubeDownloaderClient = new YoutubeDownloaderClient(socket);

			var progressSpeed = {
				lastSize : 0,
				lastTime : 0
			};

			youtubeDownloaderClient
				.onStart(new YoutubeCallback(function (args)
				{
					progressWindow.setTitle(args.fileName);
					progressWindow.setValue(0);

					progressSpeed.lastTime = (new Date()).getTime();
				}, youtubeDownloaderClient))

				.onProgress(new YoutubeCallback(function (args)
				{
					var t = ((new Date()).getTime());
					var time = (t - progressSpeed.lastTime);

					if(time >= 1000)
					{
						progressSpeed.lastTime = t;
						var size = (args.size - progressSpeed.lastSize);
						progressSpeed.lastSize = args.size;

						progressWindow.setSpeed(Math.floor((size/1024)) + "KB/s");
					}

					progressWindow.setValue(Math.floor(((args.size / this.youtubeDownloaderClientFile.fileSize) * 100)));
				}, youtubeDownloaderClient))

				.onComplete(new YoutubeCallback(function (args)
				{
					progressWindow.hide();
					saveAs(args.file.blob, args.file.fileName + args.file.fileExt);
				}, youtubeDownloaderClient))

				.onError(new YoutubeCallback(function (args)
				{
					this.setValue(100);
					this.setTitle("Error: " + args.reason);

					var that = this;
					setTimeout(function(){
						that.hide();
					}, 2000);
				}, progressWindow));

			youtubeDownloaderClient.download(url);
		});

	scriptsLoader.addScript((window.YOUTUBE_NODE_JS_HOST + ":" + window.YOUTUBE_NODE_JS_PORT) + "/Client/socket.io-1.0.6.js?type=text/javascript");
	scriptsLoader.addScript((window.YOUTUBE_NODE_JS_HOST + ":" + window.YOUTUBE_NODE_JS_PORT) + "/Client/YoutubeDownloaderClient.js?type=text/javascript");
	scriptsLoader.addScript((window.YOUTUBE_NODE_JS_HOST + ":" + window.YOUTUBE_NODE_JS_PORT) + "/Client/FileSaver.js?type=text/javascript");
})();