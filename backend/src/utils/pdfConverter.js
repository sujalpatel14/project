import puppeteer from "puppeteer";
import path from "path";
import fs from "fs-extra";

export default async function convertHtmlToPdf(htmlContent, studentName, courseTitle) {
  try {
    const pdfDir = path.resolve("certificates/generated");
    const pdfPath = path.join(pdfDir, `${studentName}_${courseTitle}.pdf`);
    
    // ✅ Correct Image Path
    const imagePath = path.resolve("src/certificates/assets/images/background.png");
    const imageUrl = `http://http://192.168.50.21:5000/images/background.png`;;

    // ✅ Ensure Directory Exists
    await fs.ensureDir(pdfDir);

    // ✅ Replace Image Path in HTML
    htmlContent = htmlContent.replace(
      "background-image: url('your-background-image.jpg')",
      `background-image: url('${imageUrl}')`
    );

    // ✅ Launch Puppeteer with Required Flags
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-features=site-per-process",
        "--disable-web-security",
        "--allow-file-access-from-files"
      ]
    });

    const page = await browser.newPage();

    // ✅ Set Content and Wait for Load
    await page.setContent(htmlContent, { waitUntil: "load", timeout: 0 });

    // ✅ Add Delay to Ensure Image Loads Before PDF Generation
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));

    // ✅ Debug: Save Screenshot to Check Image Loading
    await page.screenshot({ path: "debug.png", fullPage: true });

    // ✅ Generate PDF
    await page.pdf({ path: pdfPath, format: "A4", printBackground: true });

    await browser.close();
    return pdfPath;
  } catch (error) {
    console.error("Error converting HTML to PDF:", error);
    throw new Error("PDF generation failed");
  }
}
