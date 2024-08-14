// src/utils/pdfToText.js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // ใช้ legacy build
import Tesseract from 'tesseract.js';

// ใช้ URL ที่ถูกต้องสำหรับเวอร์ชันที่ใช้
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.5.136/build/pdf.worker.min.js';

export const pdfToText = async (file) => {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  const numPages = pdf.numPages;
  const textPromises = [];

  for (let i = 1; i <= numPages; i++) {
    textPromises.push(
      pdf.getPage(i).then(async (page) => {
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // ใช้ Tesseract.js เพื่อดึงข้อความจาก canvas
        const { data: { text } } = await Tesseract.recognize(
          canvas.toDataURL(), // ใช้ data URL ของ canvas
          'eng', // ภาษา
          {
            logger: info => console.log(info) // logger แบบ optional
          }
        );

        return text;
      })
    );
  }

  const texts = await Promise.all(textPromises);
  return texts.join('\n'); // รวมข้อความจากทุกหน้า
};
