YoutubeNodeJS
=======================
YoutubeNodeJS parses the Youtube video page and creates a list of video formats and their urls, which can be used to download video or audio from Youtube.
It consists of server, which runs the extractor and streams the results back to the client using socket.io stream.
The client is a bookmarklet, which loads the streaming script, connects to the server and requests audio. It will show progress bar, and in the background will create local file in the browser and ask the user to save it when download completes.

You will need to upload SSL certificates for the https server to the ssl directory for the streamer to work, and change server hostname in the bookmarklet to your own.
************************
There is also a bookmarklet for a downloader, which instead of streaming from the NodeJS server, will request the download url and download the contents straight from Youtube's server.