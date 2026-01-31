import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config({path: './config.env'});
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    global.mongoConnected = true;
    console.log("Connection Successful");
  })
  .catch((err) => {
    console.log(err);
  });