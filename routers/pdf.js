const express = require("express");
const getpdfRouter = express.Router();

const {downloadImage} = require("../conterollers/screenshot.js")


getpdfRouter.get("/Image", downloadImage);




module.exports = getpdfRouter;