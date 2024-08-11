import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import './OCRPage.css';

const OCRPage = () => {
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
    setTexts([]); // Reset extracted texts when new images are selected
    setCopiedIndex(null); // Reset copied index when new images are selected
  };

  const handleExtractText = () => {
    if (images.length === 0) return;
    setIsLoading(true);

    const textPromises = images.map((image) =>
      Tesseract.recognize(image, 'tha', {
        logger: (m) => console.log(m),
      })
    );

    Promise.all(textPromises)
      .then((results) => {
        const extractedTexts = results.map(({ data: { text } }) => {
          const cleanedText = text.replace(/^.*?\)/, ''); // ลบคำที่อยู่ก่อนหน้าวงเล็บปิดออก
          return cleanedText.trim();
        });
        setTexts(extractedTexts);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index); // Set the index of the copied text
  };

  return (
    <div className="ocr-page">
      <h4>Extract Text from Images (ภาษาไทย)</h4>
      <label htmlFor="file-upload" className="custom-file-upload">
        Choose Files
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        multiple
      /><br />

      {images.length > 0 && (
        <div className="file-info">
          <p><strong>Selected Files:</strong></p>
          <ul>
            {Array.from(images).map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <p>Total files: {images.length}</p>
        </div>
      )}

      {images.length > 0 && (
        <button onClick={handleExtractText} disabled={isLoading}>
          {isLoading ? 'Extracting...' : 'Extract Text'}
        </button>
      )}

      <div className="extracted-texts">
        {texts.map((text, index) => (
          <div key={index} className="extracted-text">
            <h4>Extracted Text from Image {index + 1}:</h4>
            <p>{text}</p>
            <button
              className={`copy-button ${copiedIndex === index ? 'copied' : ''}`}
              onClick={() => handleCopy(text, index)}
            >
              {copiedIndex === index ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OCRPage;
