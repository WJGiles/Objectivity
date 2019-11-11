import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  passwordHash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  tokenSeed: { type: String, required: true, unique: true },
  created: { type: Date, default: () => new Date() }
});

const User = (module.exports = mongoose.model("user", userSchema));

const personSchema = mongoose.Schema({
  name: String,
  age: Number,
  nationality: String
});

const Person = (module.exports = mongoose.model("Person", personSchema));
