import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import './PdfToTextPage.css';
import './pdf.worker.mjs'; // Import the custom worker

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

  const extractTextAfterKeywords = (text, keywords) => {
    let result = '';
    let keywordFound = false;
    let startIndex = 0;
    keywords.forEach(keyword => {
      const keywordIndex = text.indexOf(keyword, startIndex);
      if (keywordIndex !== -1) {
        startIndex = keywordIndex + keyword.length;
        result += text.substring(startIndex).trim() + '\n'; // Extract text after keyword
        keywordFound = true;
      }
    });
    return keywordFound ? result.trim() : ''; // Return result if any keyword found
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
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
  
              await page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;
  
              const { data: { text } } = await Tesseract.recognize(
                canvas.toDataURL(),
                'eng+tha', // Specify both English and Thai languages
                {
                  logger: (m) => console.log(m),
                }
              );
  
              // Extract text starting from "ถึง" and "Order ID"
              return extractTextAfterKeywords(text, ['ถึง', 'Order ID']);
            })
          );
        }
  
        const texts = await Promise.all(pageTextPromises);
        return texts.join('\n');
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
    const ws = XLSX.utils.aoa_to_sheet(texts.map((text, index) => [files[index].name, text]));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Extracted Texts");
    XLSX.writeFile(wb, "Extracted_Texts.xlsx");
  };

  const handleExportPDF = () => {
    texts.forEach((text, index) => {
      const doc = new jsPDF();
      doc.text(text, 10, 10);
      doc.save(`${files[index].name.replace('.pdf', '')}.pdf`);
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
        style={{ display: 'none' }}
      />
      <button
        onClick={() => document.getElementById('file-upload').click()}
        className="upload-button"
      >
        Select PDF Files
      </button>

      {files.length > 0 && (
        <div className="file-info">
          <p><strong>Selected Files:</strong></p>
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
          {isLoading ? 'Extracting...' : 'Extract Text'}
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
              className={`copy-button ${copiedIndex === index ? 'copied' : ''}`}
              onClick={() => handleCopy(text, index)}
            >
              {copiedIndex === index ? 'Copied!' : 'Copy Text'}
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
