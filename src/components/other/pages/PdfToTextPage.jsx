import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "./PdfToTextPage.css";
import "./pdf.worker.mjs"; // Import the custom worker

const PdfToTextPage = () => {
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
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              for (let j = 0; j < data.length; j += 4) {
                const grayscale = data[j] * 0.3 + data[j + 1] * 0.59 + data[j + 2] * 0.11;
                data[j] = grayscale;
                data[j + 1] = grayscale;
                data[j + 2] = grayscale;
              }
              context.putImageData(imageData, 0, 0);

              const { data: { text } } = await Tesseract.recognize(
                canvas.toDataURL(), 
                "tha", 
                {
                  logger: (m) => console.log(m),
                  psm: 6, // Try different modes: 3, 4, 6, 11, 12, 13
                  oem: 1, // Try different modes: 0, 1, 2, 3
                  tessedit_char_whitelist: 'ก-๙0-9a-zA-Z', // Limit recognized characters
                }
              );
              

              return text;
            })
          );
        }

        const texts = await Promise.all(pageTextPromises);
        return texts.join("\n");
      });

      const results = await Promise.all(textPromises);
      setTexts(results);
    } catch (error) {
      console.error("Error extracting text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet(
      texts.map((text, index) => [files[index].name, text])
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Extracted Texts");
    XLSX.writeFile(wb, "Extracted_Texts.xlsx");
  };

  const handleExportPDF = () => {
    texts.forEach((text, index) => {
      const doc = new jsPDF();
      doc.text(text, 10, 10);
      doc.save(`${files[index].name.replace(".pdf", "")}.pdf`);
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
        {texts.map((text, index) => (
          <div key={index} className="extracted-text">
            <h4>Extracted Text from File {index + 1}:</h4>
            <textarea
              value={text}
              readOnly
              rows="10"
              cols="80"
              className="text-output"
            />
            <button
              className={`copy-button ${copiedIndex === index ? "copied" : ""}`}
              onClick={() => handleCopy(text, index)}
            >
              {copiedIndex === index ? "Copied!" : "Copy Text"}
            </button>
          </div>
        ))}
      </div>

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
    </div>
  );
};

export default PdfToTextPage;
