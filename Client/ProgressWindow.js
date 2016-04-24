var _ProgressWindow = function(width, height)
{
	var _progressWindow = function(w, h){
		this.html = "<div class=\"YoutubeStreamer window\"><span class=\"YoutubeStreamer title\"></span></div>";
		this.container = null;

		this.title = null;
		this.progressBar = null;

		this.init = function()
		{
			this.container = ((new DOMParser()).parseFromString(this.html, "text/html")).getElementsByTagName("div")[0];
			this.title = this.container.children[0];
			this.progressBar = new _ProgressBar(w, 15);

			this.container.appendChild(this.progressBar.get());

			if(w) this.setWidth(w);
			if(h) this.setHeight(h);
		};

		this.setWidth = function(width)
		{
			this.container.style.width = width + "px";
		};

		this.setHeight = function(height)
		{
			this.container.style.height = height + "px";
		};

		this.setTitle = function(title)
		{
			this.title.innerHTML = title;
		};

		this.setValue = function(value)
		{
			this.progressBar.setValue(value);
		};

		this.show = function()
		{
			this.container.style.display = "inline-block";
		};

		this.hide = function()
		{
			this.container.style.display = "none";
		};

		this.init();
	};

	this.progressWindow = new _progressWindow(width, height);

	this.setTitle = function(title)
	{
		this.progressWindow.setTitle(title);
	};

	this.setValue = function(value)
	{
		this.progressWindow.setValue(value);
	};

	this.show = function()
	{
		this.progressWindow.show();
	};

	this.hide = function()
	{
		this.progressWindow.hide();
	};

	this.get = function()
	{
		return this.progressWindow.container;
	};
};