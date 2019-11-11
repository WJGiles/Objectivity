"use strict";

import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import ImageMetaData from "../models/bbox_labeller.js";
import DatasetConfig from "../models/datasetConfig.js";

var fs = require("fs");
var path = require("path");

const app = express();

// env variables
const PORT = process.env.PORT || 3030;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/basic-mern";
const REQUEST_SIZE_LIMIT = process.env.REQUEST_SIZE_LIMIT || "100mb";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.use(bodyParser.json({ limit: REQUEST_SIZE_LIMIT }), cors());
app.set("json spaces", 4);

app.use(express.static("/"));

app.get("/", function(request, response) {
  response.send("Hello world!");
});

// List all files in a directory in Node.js recursively in a synchronous fashion
function walkSync(dir, filelist, topLevel, addTopLevel) {
  var d;
  if (addTopLevel) {
    d = path.join(topLevel, dir);
  } else {
    d = dir;
  }
  var files = fs.readdirSync(d);
  files.forEach(function(file) {
    var p;
    if (addTopLevel) {
      p = path.join(topLevel, dir, file);
    } else {
      p = path.join(dir, file);
    }
    if (fs.statSync(p).isDirectory()) {
      filelist = walkSync(file, filelist, topLevel, true);
    } else {
      if (addTopLevel) {
        filelist.push(path.join(dir, file));
      } else {
        filelist.push(file);
      }
    }
  });

  console.log(filelist);
  return filelist;
}

app.get("/filelist", cors(), function(request, response) {
  const q = request.query;
  console.log(q);
  if (q.recursiveFlag === "true") {
    console.log("Recurse!");
    var files = walkSync(q.dataSetFolder, [], q.dataSetFolder, false);
  } else {
    console.log("Don't recurse!");
    var files = fs.readdirSync(q.dataSetFolder);
  }
  var allowedExtensions = [];
  if (q.findJpeg === "true") {
    console.log("jpeg is true!");
    allowedExtensions.push("jpeg", "jpg");
  }
  if (q.findPng === "true") {
    console.log("png is true!");
    allowedExtensions.push("png");
  }
  console.log("allowedExtensions");
  console.log(allowedExtensions);

  const imageFileNames = files.filter(f => {
    return allowedExtensions.includes(
      f
        .toLowerCase()
        .split(".")
        .slice(-1)[0]
    );
  });

  if (q.randomizeOrder) {
    shuffleArray(imageFileNames);
  }

  console.log(imageFileNames);
  response.send({ fileList: imageFileNames });
});

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

app.get("/labelledPathList", cors(), function(request, response) {
  var config = request.query;
  ImageMetaData.find(config, "path", function(err, metaData) {
    if (err) response.send({ message: "Database error", type: "error" });
    else console.log("/labelledPathList with query:");
    console.log(config);
    console.log(metaData);

    response.send({ labelledPathList: metaData });
  });
});

app.get("/configlist", cors(), function(request, response) {
  DatasetConfig.find(
    {},
    "dataSetName dataSetFolder wholeImageLabels classnames fileList",
    function(err, configList) {
      if (err) response.send({ message: "Database error", type: "error" });
      //console.log(configList);
      else response.send({ configList: configList });
    }
  );
});

app.get("/labellerExistingImage", cors(), function(request, response) {
  console.log("labellerExistingImage");
  console.log(request.query);
  ImageMetaData.findOne(
    {
      dataSetName: request.query.dataSetName,
      dataSetFolder: request.query.dataSetFolder,
      path: request.query.path
    },
    function(err, metaData) {
      if (err) {
        response.send({ message: "Database error", type: "error" });
      } else {
        console.log(metaData);
        response.send({ metaData });
      }
    }
  );
});

app.post("/configSubmit", cors(), function(req, res) {
  console.log("configSubmit");
  var configInfo = req.body;
  var newConfigData = {
    classnames: configInfo.config_state.classnames,
    findJpeg: configInfo.config_state.findJpeg,
    findPng: configInfo.config_state.findPng,
    randomizeOrder: configInfo.config_state.randomizeOrder,
    fileList: configInfo.config_state.fileList
  };

  var query = {
    dataSetName: configInfo.config_state.dataSetName,
    dataSetFolder: configInfo.config_state.dataSetFolder,
    wholeImageLabels: configInfo.config_state.wholeImageLabels
  };

  DatasetConfig.updateOne(query, newConfigData, { upsert: true }, function(
    err,
    configData
  ) {
    if (err) {
      res.send({ message: "Database error updating config", type: "error" });
    } else {
      res.send({ message: "dataSetConfig added/updated!", type: "success" });
    }
  });
});

app.post("/labellerSubmit", cors(), function(req, res) {
  var labellerInfo = req.body; //Get the parsed information
  console.log("labellerSubmit");
  console.log(labellerInfo.labeller_state.bboxes);
  console.log(labellerInfo.labeller_state.wholeImageLabel);
  var newImageMetaData = {
    bboxes: labellerInfo.labeller_state.bboxes,
    wholeImageLabel: labellerInfo.labeller_state.wholeImageLabel,
    userName: labellerInfo.labeller_state.userName
  };

  var query = {
    dataSetName: labellerInfo.config_state.dataSetName,
    dataSetFolder: labellerInfo.config_state.dataSetFolder,
    path:
      labellerInfo.config_state.fileList[labellerInfo.labeller_state.pathIndex]
  };

  ImageMetaData.updateOne(query, newImageMetaData, { upsert: true }, function(
    err,
    ImageMetaData
  ) {
    if (err) res.send({ message: "Database error", type: "error" });
    else
      res.send({
        message: "New ImageMetaData added",
        type: "success",
        ImageMetaData: ImageMetaData
      });
  });
});

// error middleware
//app.use(require('./error-middleware'));

export const start = () => {
  app.listen(PORT, () => {
    console.log("Backend is listening on port: " + PORT.toString());
  });
};

export const stop = () => {
  app.close(PORT, () => {
    console.log("Shut down on port: ${PORT}");
  });
};
