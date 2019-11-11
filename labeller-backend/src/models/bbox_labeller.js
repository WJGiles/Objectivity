import mongoose from "mongoose";

const BboxSchema = mongoose.Schema({
  id: { type: Number, required: true },
  classname: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  widthScaleFactor: { type: Number, required: true },
  heightScaleFactor: { type: Number, required: true }
});

const ImageMetaDataSchema = mongoose.Schema({
  dataSetName: { type: String, required: true },
  dataSetFolder: { type: String, required: true },
  path: { type: String, required: true },
  bboxes: [BboxSchema],
  wholeImageLabel: { type: String, required: true },
  userName: { type: String, required: true }
});

const ImageMetaData = (module.exports = mongoose.model(
  "ImageMetaData",
  ImageMetaDataSchema
));
