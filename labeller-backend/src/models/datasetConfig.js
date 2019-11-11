import mongoose from "mongoose";

const DatasetConfigSchema = mongoose.Schema({
  dataSetName: { type: String, required: true },
  dataSetFolder: { type: String, required: true },
  wholeImageLabels: { type: Boolean, required: true },
  findJpeg: { type: Boolean },
  findPng: { type: Boolean },
  randomizeOrder: { type: Boolean },
  classnames: [String],
  fileList: [String],
  created: { type: Date, default: () => new Date() }
});

const DatasetConfig = (module.exports = mongoose.model(
  "DatasetConfig",
  DatasetConfigSchema
));
