import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "./pdf-label.css";
import "./pdf.worker.mjs"; // Import the custom worker

const Pdflabel = () => {
  const [files, setFiles] = useState([]);
  const [texts, setTexts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setTexts([]);
    setCopiedIndex(null);
  };

  const handleExtractText = async () => {
    if (files.length === 0) return;
    setIsLoading(true);

    try {
      const textPromises = files.map(async (file) => {
        const pdf = await getDocument(URL.createObjectURL(file)).promise;
        const numPages = pdf.numPages;
        const pageTextPromises = [];

        for (let i = 1; i <= numPages; i++) {
          pageTextPromises.push(
            pdf.getPage(i).then(async (page) => {
              const viewport = page.getViewport({ scale: 2 });
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d");
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              await page.render({
                canvasContext: context,
                viewport: viewport,
              }).promise;

              // Convert the canvas to grayscale
              const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
              const data = imageData.data;
              for (let j = 0; j < data.length; j += 4) {
                const grayscale =
                  data[j] * 0.3 + data[j + 1] * 0.59 + data[j + 2] * 0.11;
                data[j] = grayscale;
                data[j + 1] = grayscale;
                data[j + 2] = grayscale;
              }
              context.putImageData(imageData, 0, 0);

              const {
                data: { text },
              } = await Tesseract.recognize(canvas.toDataURL(), "tha+eng", {
                logger: (m) => console.log(m),
                psm: 6, // Assume a single uniform block of text.
                oem: 3, // Use LSTM OCR engine.
                tessedit_char_whitelist: "ก-ฮa-zA-Z0-9", // Limit recognized characters to Thai, English, and numbers
              });

              return text;
            })
          );
        }

        const pageTexts = await Promise.all(pageTextPromises);
        return pageTexts; // Return array of texts, each representing a page
      });

      const results = await Promise.all(textPromises);
      setTexts(results);
    } catch (error) {
      console.error("Error extracting text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, fileIndex, pageIndex) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(`${fileIndex}-${pageIndex}`);
  };

  const handleExportExcel = () => {
    const wsData = texts.flatMap((pageTexts, fileIndex) =>
      pageTexts.map((text, pageIndex) => [
        `${files[fileIndex].name} - Page ${pageIndex + 1}`,
        text,
      ])
    );
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Extracted Texts");
    XLSX.writeFile(wb, "Extracted_Texts.xlsx");
  };

  const handleExportPDF = () => {
    texts.forEach((pageTexts, fileIndex) => {
      const doc = new jsPDF();
      pageTexts.forEach((text, pageIndex) => {
        if (pageIndex > 0) doc.addPage();
        doc.text(text, 10, 10);
      });
      doc.save(`${files[fileIndex].name.replace(".pdf", "")}.pdf`);
    });
  };

  return (
    <div className="ocr-page">
      <h4>Extract Text from PDF Files (ภาษาไทย)</h4>
      <input
        id="file-upload"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        multiple
        style={{ display: "none" }}
      />
      <button
        onClick={() => document.getElementById("file-upload").click()}
        className="upload-button"
      >
        Select PDF Files
      </button>

      {files.length > 0 && (
        <div className="file-info">
          <p>
            <strong>Selected Files:</strong>
          </p>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <p>Total files: {files.length}</p>
        </div>
      )}

      {files.length > 0 && (
        <button onClick={handleExtractText} disabled={isLoading}>
          {isLoading ? "Extracting..." : "Extract Text"}
        </button>
      )}

      <div className="extracted-texts">
        {texts.map((pageTexts, fileIndex) => (
          <div key={fileIndex} className="file-extracted-texts">
            {texts.length > 0 && (
              <>
                <button onClick={handleExportExcel} className="export-button">
                  Export to Excel
                </button>
                <button onClick={handleExportPDF} className="export-button">
                  Export to PDF
                </button>
              </>
            )}
            <h4>Extracted Text from File {fileIndex + 1}:</h4>
            {pageTexts.map((text, pageIndex) => (
              <div key={pageIndex} className="extracted-text">
                <h5>Page {pageIndex + 1}:</h5>
                <textarea
                  value={text}
                  readOnly
                  rows="10"
                  cols="80"
                  className="text-output"
                />
                <button
                  className={`copy-button ${
                    copiedIndex === `${fileIndex}-${pageIndex}` ? "copied" : ""
                  }`}
                  onClick={() => handleCopy(text, fileIndex, pageIndex)}
                >
                  {copiedIndex === `${fileIndex}-${pageIndex}`
                    ? "Copied!"
                    : "Copy Text"}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pdflabel;
