const cors = require("cors");
const express = require("express");
const { proxy } = require("rtsp-relay");

const createRTSPStreamServer = (port = 2000) => {
  const app = express();
  app.use(cors());

  const handler = (url) => {
    return proxy({
      additionalFlags: ["-q", "1"],
      url: url,
      transport: "tcp",
      verbose: true,
    });
  };

  app.ws("/api/stream", (ws, req) => {
    const url = req.query.url;
    handler(url)(ws, req);
  });

  app.listen(port, () => {
    console.log(`RTSP stream server is running on port ${port}`);
  });

  return app;
};

module.exports = createRTSPStreamServer;
