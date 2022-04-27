
# Streaminal
A CLI to stream movies, TV shows etc. from your terminal, for free.

## Installation

Install streaminal globally with npm

```bash
npm install -g streaminal
```
    
## Requirements

Streaminal requires 32 bit VLC media player. Download [here](https://www.videolan.org/vlc/download-windows.html).
## Usage

Simply type "streaminal" in your terminal.
```bash
> streaminal
? Enter a search query > 
? Select a file to play >
> Playing...
```


## How it works

Streaminal scrapes The Pirate Bay  for the entered search query.  
It then extracts the magnet link for each result, and streams the selected torrent using [WebTorrent](https://github.com/webtorrent/webtorrent-cli).  
Files are temporarily downloaded in the temp folder, and deleted on every run.