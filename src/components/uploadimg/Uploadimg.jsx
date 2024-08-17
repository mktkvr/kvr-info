import React, { useState, useEffect, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';
import { storage } from '../db/firebaseConfigStorage';
import '../uploadimg/Uploadimg.css';

const Uploadimg = () => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [downloadURLs, setDownloadURLs] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadFiles = () => {
    const uploadPromises = Array.from(files).map(file => {
      const storageRef = ref(storage, `img/${file.name}`);

      return getMetadata(storageRef)
        .then(() => {
          // File already exists, skip upload
          setErrorMessage(`File ${file.name} already exists!`);
          return Promise.reject('File already exists');
        })
        .catch((error) => {
          if (error.code === 'storage/object-not-found') {
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
              uploadTask.on('state_changed',
                (snapshot) => {
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  setUploadProgress(prevProgress => ({
                    ...prevProgress,
                    [file.name]: progress,
                  }));
                },
                (error) => {
                  console.error("Upload failed: ", error);
                  reject(error);
                },
                () => {
                  getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    resolve(url);
                  });
                }
              );
            });
          } else {
            console.error("Error checking file existence: ", error);
            return Promise.reject(error);
          }
        });
    });

    Promise.all(uploadPromises)
      .then(urls => {
        setDownloadURLs(prevURLs => [...prevURLs, ...urls]);
        setErrorMessage(null);
      })
      .catch(error => {
        console.error("Upload failed: ", error);
      });
  };

  const fetchUploadedFiles = () => {
    const imagesRef = ref(storage, 'img/');
    listAll(imagesRef).then((res) => {
      const urlPromises = res.items.map((itemRef) => getDownloadURL(itemRef));
      Promise.all(urlPromises).then((urls) => {
        setDownloadURLs(urls);
      });
    }).catch((error) => {
      console.error("Failed to retrieve files: ", error);
    });
  };

  const handleDelete = (url) => {
    const fileName = decodeURIComponent(url.split('/').pop().split('?')[0]);
    const fileRef = ref(storage, `img/${fileName}`);

    deleteObject(fileRef).then(() => {
      setDownloadURLs(prevURLs => prevURLs.filter(u => u !== url));
    }).catch((error) => {
      console.error("Delete failed: ", error);
      setErrorMessage("Failed to delete file. Please try again.");
    });
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(url);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  return (
    <div className="upload-page">
      <h1>Upload Files</h1>
      <input
        type="file"
        accept="image/png, image/jpeg, image/gif"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={handleUpload}>Choose Files</button>
      <button onClick={uploadFiles} disabled={!files.length}>Upload</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <div className="upload-progress">
        {Object.keys(uploadProgress).map((fileName) => (
          <p key={fileName}>{fileName}: {uploadProgress[fileName]}%</p>
        ))}
      </div>
      <div className="uploaded-files">
        <h2>Uploaded Files:</h2>
        <div className="files-grid">
          {downloadURLs.map((url, index) => (
            <div key={index} className="file-item">
              <img src={url} alt={`Uploaded ${index}`} />
              <button onClick={() => handleCopyLink(url)}>Copy Link</button>
              {copiedLink === url && <span className="copied-notification">Copied!</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Uploadimg;
