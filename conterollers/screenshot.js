const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const downloadImage = async (req, res) => {
  let { url } = req.query;

  if (!url) {
    return res.status(400).send("URL is required");
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `http://${url}`;
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", '--disable-gpu',
      '--disable-dev-shm-usage'],
      executablePath: puppeteer.executablePath()
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Page navigation successful. Capturing screenshot...");

    // تحديد مسار حفظ الصورة
    const imagePath = path.join(__dirname, "debug_final.png");

    // التقاط لقطة الشاشة
    await page.pdf({ path: imagePath, fullPage: true, format:'A4' });

    console.log(`Screenshot saved at: ${imagePath}`);

    await browser.close();

    // إرسال الصورة كاستجابة
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="invoice.pdf"'
    );

    // قراءة الصورة من المسار وإرسالها
    const imageBuffer = fs.readFileSync(imagePath);
    res.send(imageBuffer);
  } catch (err) {
    console.error("Error generating pdf:", err.message);

    if (err.message.includes("ERR_NAME_NOT_RESOLVED")) {
      res.status(400).send("Invalid URL or cannot resolve the domain.");
    } else if (err.message.includes("Timeout")) {
      res.status(408).send("Request timed out. Please try again later.");
    } else {
      res.status(500).send("Error generating the pdf file");
    }
  }
};

module.exports = {
  downloadImage,
};
