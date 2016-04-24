javascript: (function () { 
	window.YOUTUBE_NODE_JS_HOST = "https://kubatek94.co.uk";
	window.YOUTUBE_NODE_JS_PORT = 8443;

    var jsCode = document.createElement("script"); 
    jsCode.setAttribute("src", (window.YOUTUBE_NODE_JS_HOST + ":" + window.YOUTUBE_NODE_JS_PORT) + "/Client/streamer.js?type=text/javascript");                 
    document.body.appendChild(jsCode);
 }());