import React, { useState, useRef } from 'react';
import { storage } from './firebaseConfigStorage';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import './UploadPage.css';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [amount, setAmount] = useState('');
  const [hasUploaded, setHasUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(URL.createObjectURL(file)); // Create a URL for the preview
      setHasUploaded(false); // Reset upload status when a new file is selected
      setUploadStatus('');
    } else {
      setSelectedFile(null);
      setImageUrl('');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const generateFileName = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // Months are zero-based
    const year = now.getFullYear() + 543; // Convert to Buddhist Era
    return `${day}-${month}-${year}-${amount}.jpg`;
  };

  const checkFileExists = async (fileName) => {
    const listRef = ref(storage, 'images/');
    const listResult = await listAll(listRef);
    return listResult.items.some(item => item.name === fileName);
  };

  const handleUpload = async () => {
    if (!selectedFile || !amount) {
      setUploadStatus('Please select a file and enter a valid amount.');
      return;
    }

    const fileName = generateFileName();

    if (await checkFileExists(fileName)) {
      setUploadStatus('A file with the same name already exists.');
      return;
    }

    try {
      const generateFileName = () => {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1; // Months are zero-based
        const year = now.getFullYear() + 543; // Convert to Buddhist Era
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}-${amount}.jpg`;
      };
      
      const storageRef = ref(storage, `images/${fileName}`);
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);
      setImageUrl(downloadURL);
      setUploadStatus('Upload successful!');
      setHasUploaded(true); // Set to true to hide upload button
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  return (
    <div className="upload-page">
      <h1 className="title">Upload Image</h1>
      <div className="upload-container">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        {!hasUploaded && (
          <>
            <button className="upload-button" onClick={handleUploadClick}>
              {selectedFile ? `Selected: ${selectedFile.name.length > 20 ? `${selectedFile.name.substring(0, 17)}...` : selectedFile.name}` : 'Choose File'}
            </button>
            <input 
              type="text" 
              className="amount-input" 
              placeholder="Enter amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
            />
            {selectedFile && (
              <button className="start-upload-button" onClick={handleUpload}>
                Start Upload
              </button>
            )}
          </>
        )}
      </div>
      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.includes('successful') ? 'success' : 'error'}`}>
          {uploadStatus}
        </div>
      )}
      {imageUrl && (
        <div className="image-preview">
          <h5>Uploaded Image Preview:</h5>
          <img src={imageUrl} alt="Uploaded" className="uploaded-image" />
        </div>
      )}
    </div>
  );
};

export default UploadPage;
