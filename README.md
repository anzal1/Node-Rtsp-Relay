# RTSP Stream Relay with Dockerized Node.js Application

This project is a Node.js application designed to relay RTSP streams over WebSocket using `rtsp-relay` and FFmpeg. It runs inside a Docker container, providing a convenient and isolated environment for streaming RTSP feeds.

## Features

- Relays RTSP streams over WebSocket.
- Configured to work with FFmpeg for handling multimedia streams.
- Containerized using Docker for easy deployment.
- Exposes two ports for HTTP and WebSocket traffic.

## Prerequisites

- Docker installed on your machine.
- Node.js version 18.x and Yarn package manager (installed inside the container).

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-repository/rtsp-relay-app.git
cd rtsp-relay-app
```

### Build the Docker Image

1. Build the Docker image using the provided `Dockerfile`:

```bash
docker build -t rtsp-relay-app .
```

2. Once the image is built, you can start the container:

```bash
docker run -p 3000:3000 -p 8000:8000 rtsp-relay-app
```

This will expose ports `3000` and `8000` to your local machine, which can be used for the application's HTTP and WebSocket traffic.

## Application Usage

1. After starting the Docker container, the application will be accessible at `http://localhost:3000` or via WebSocket at `ws://localhost:8000`.

2. To start streaming an RTSP feed, connect to the WebSocket endpoint `/api/stream` with a query parameter specifying the RTSP stream URL.

Example:

```
ws://localhost:8000/api/stream?url=rtsp://your-rtsp-url
```

The server will relay the RTSP feed over WebSocket.

## Dockerfile Overview

The application is containerized using the following `Dockerfile`:

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y ffmpeg

RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

RUN npm install -g yarn

EXPOSE 3000
EXPOSE 8000

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

CMD ["node", "index.js"]
```

### Explanation:

1. **Base Image**: Uses Ubuntu 22.04 as the base image.
2. **FFmpeg Installation**: Installs FFmpeg for multimedia processing.
3. **Node.js Installation**: Installs Node.js 18.x via the NodeSource repository.
4. **Yarn Installation**: Installs Yarn as the package manager.
5. **Expose Ports**: Exposes ports `3000` (for HTTP) and `8000` (for WebSocket).
6. **Application Setup**: Copies the application code and installs dependencies using Yarn.
7. **Startup Command**: Runs the Node.js application with `index.js`.

## Development

To make changes and run the application without Docker, follow these steps:

1. Install the required dependencies:

```bash
yarn install
```

2. Start the Node.js application locally:

```bash
node index.js
```

By default, the application will listen on port `3000` for HTTP requests and `8000` for WebSocket connections.

## Configuration

You can modify the following parameters:

- **Ports**: You can change the exposed ports by modifying the `EXPOSE` instructions in the `Dockerfile` or updating the `docker run` command with different port mappings.
- **Transport Protocol**: By default, the transport protocol for the RTSP stream is `tcp`. You can change it in the `handler` function inside `index.js`.
- **Additional FFmpeg Flags**: Adjust or add FFmpeg flags to control stream quality or other aspects by modifying the `additionalFlags` array.

### Example Usage with React

To use the RTSP stream relay in a React application, you can create a WebSocket connection and display the stream in a video element using the `MediaSource` API.

#### Step-by-Step:

1. Install the required dependencies in your React app if needed:
   ```bash
   npm install react react-dom
   ```

2. Create a React component that establishes the WebSocket connection and displays the RTSP stream:

```jsx
import React, { useEffect, useRef } from "react";

const RTSPStream = ({ streamUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/api/stream?url=${streamUrl}`);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const video = videoRef.current;
      const mediaSource = new MediaSource();
      video.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener("sourceopen", () => {
        const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
        sourceBuffer.appendBuffer(event.data);
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => ws.close();
  }, [streamUrl]);

  return (
    <div>
      <video ref={videoRef} controls autoPlay style={{ width: "100%" }} />
    </div>
  );
};

export default RTSPStream;
```

#### Usage in a React App:

```jsx
import React from "react";
import ReactDOM from "react-dom";
import RTSPStream from "./RTSPStream";

const App = () => {
  return (
    <div>
      <h1>RTSP Stream Example</h1>
      <RTSPStream streamUrl="rtsp://your-rtsp-url" />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

This will establish a WebSocket connection to your RTSP stream, and the video will be rendered in the video element.

---

### Example Usage with Plain HTML and JavaScript

For an HTML-based solution, you can similarly use the `MediaSource` API and WebSocket connection to handle the RTSP stream relay.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RTSP Stream Example</title>
</head>
<body>
  <h1>RTSP Stream Example</h1>
  <video id="video" controls autoplay style="width: 100%;"></video>

  <script>
    const video = document.getElementById('video');
    const streamUrl = 'rtsp://your-rtsp-url';
    const ws = new WebSocket(`ws://localhost:8000/api/stream?url=${streamUrl}`);

    ws.onopen = function() {
      console.log('WebSocket connection established');
    };

    ws.onmessage = function(event) {
      const mediaSource = new MediaSource();
      video.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener('sourceopen', function() {
        const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
        sourceBuffer.appendBuffer(event.data);
      });
    };

    ws.onerror = function(error) {
      console.error('WebSocket error:', error);
    };

    ws.onclose = function() {
      console.log('WebSocket connection closed');
    };
  </script>
</body>
</html>
```

#### Explanation:
- This HTML file creates a WebSocket connection to the RTSP relay server.
- The `MediaSource` API is used to stream the video data received from the WebSocket to the video element.
- The WebSocket URL includes a query parameter for the RTSP stream URL (`rtsp://your-rtsp-url`), which must be replaced with your actual RTSP feed.

---

