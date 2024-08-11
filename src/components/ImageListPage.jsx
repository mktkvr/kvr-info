// src/components/ImageListPage.js
import React, { useState, useEffect } from 'react';
import { storage } from './firebaseConfigStorage';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import './ImageListPage.css';

const ImageListPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const listRef = ref(storage, 'images/');
        const listResult = await listAll(listRef);
        const imagePromises = listResult.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        });
        const imageList = await Promise.all(imagePromises);
        setImages(imageList);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
    const intervalId = setInterval(fetchImages, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleVerify = (image) => {
    alert(`Verification for image: ${image.name}`);
    // Implement verification logic here
  };

  return (
    <div className="image-list-page">
      <h3>Uploaded Images</h3>
      {loading ? (
        <p>Loading images...</p>
      ) : (
        <div className="image-list">
          {images.length > 0 ? (
            images.map((image) => (
              <div key={image.name} className="image-item">
                <img src={image.url} alt={image.name} className="image-thumbnail" />
                <div className="image-info">
                  <p className="image-name">{image.name}</p>
                  <button onClick={() => handleVerify(image)} className="verify-button">
                    Verify
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No images available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageListPage;
