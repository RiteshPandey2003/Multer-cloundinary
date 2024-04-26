import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import cookieParser from "cookie-parser";
import productRoute from "./routes/product.js";
import userRoute from "./routes/user.js";
import { corsOption } from "./constant/config.js";
import cors from "cors";

dotenv.config({
  path: "./.env",
});

const app = express();

app.use(cors(corsOption))
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(cookieParser());
app.use("/cm", userRoute, productRoute);

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
