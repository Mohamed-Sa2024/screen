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
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Page navigation successful. Capturing screenshot...");

    // Create directory if doesn't exist
    const dirPath = path.join(__dirname, "debug_final");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const imagePath = path.join(dirPath, "debug_final.pdf");

    // Generate PDF
    await page.pdf({
      path: imagePath,
      fullPage: true,
      format: 'A4',
      printBackground: true,  // Ensures background is included
    });

    console.log(`PDF saved at: ${imagePath}`);

    await browser.close();

    // Send the PDF as response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="invoice.pdf"'
    );

    const pdfBuffer = fs.readFileSync(imagePath);
    res.send(pdfBuffer);
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
