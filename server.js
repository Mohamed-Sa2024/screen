const express = require("express");
// const cors = require("cors");
require("dotenv").config();
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// app.use(cors());

const getpdfRouter = require("./routers/pdf")


app.use("/download", getpdfRouter);

app.use("*", (req,res)=>{
  res.status(404).json("No content at this path")
})


(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome', // Path to Chrome binary
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for many cloud environments
  });

  const page = await browser.newPage();
  await page.goto('https://example.com');
  await browser.close();
})();



app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});