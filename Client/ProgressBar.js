var _ProgressBar = function(width, height)
{
	var _progressBar = function(w, h){
		this.html = "<div class=\"YoutubeStreamer meter blue animate\"><span><span></span></span></div>";
		this.container = null;
		this.progress = null;

		this.init = function()
		{
			this.container = ((new DOMParser()).parseFromString(this.html, "text/html")).getElementsByTagName("div")[0];
			this.progress = this.container.children[0];

			if(w) this.setWidth(w);
			if(h) this.setHeight(h);

			this.progress.style.width = 0;
		};

		this.setWidth = function(width)
		{
			this.container.style.width = width + "px";
		};

		this.setHeight = function(height)
		{
			this.container.style.height = height + "px";
		};

		this.setValue = function(value)
		{
			this.progress.style.width = value + "%";
		};

		this.init();
	};

	this.progressBar = new _progressBar(width, height);

	this.setValue = function(value)
	{
		this.progressBar.setValue(value);
	};

	this.get = function()
	{
		return this.progressBar.container;
	};
};