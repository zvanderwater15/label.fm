require("dotenv/config");
const express = require("express");
const { resolve } = require("path");
const { topLabelsForUser } = require("./controllers/labels.js");
const { checkJob } = require("./controllers/jobs.js");
const { ExternalAPIError} = require("./lib/errors.js");

function createServer() {
  const app = express();
  // Have Node serve the files for our built React app
  app.use(express.static(resolve(__dirname, "../client/build")));

  app.use("/api/labels/:username", async (req, res, next) => {
    try {
        await topLabelsForUser(req, res, next)
    } catch (err) {
        next(err)
    }
  });

  app.use("/api/jobs/:jobId", async (req, res, next) => {
    try {
        await checkJob(req, res, next)
    } catch (err) {
        next(err)
    }
  });

  // All other GET requests not handled before will return our React app
  app.get("*", (req, res) => {
    res.sendFile(resolve(__dirname, "../client/build", "index.html"));
  });

  app.use((err, req, res, next) => {
    if (err instanceof ExternalAPIError) {
      res.status(err.status).send(`${err.message}`)
    }
    else {
      console.error(err.stack)
      res.status(500).send("Unknown error")
    }
  })
  
  return app;
}

module.exports = createServer