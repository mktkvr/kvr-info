// components/AddressModal.jsx
import React, { useState, useEffect } from 'react';
import './AddressModal.css';

const AddressModal = ({ isOpen, onClose, onAddAddress, addressData, onEditAddress }) => {
  const [address, setAddress] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    if (addressData) {
      setAddress(addressData.address || '');
      setSubdistrict(addressData.subdistrict || '');
      setDistrict(addressData.district || '');
      setProvince(addressData.province || '');
      setZipCode(addressData.zipCode || '');
    } else {
      resetForm();
    }
  }, [addressData, isOpen]);

  const resetForm = () => {
    setAddress('');
    setSubdistrict('');
    setDistrict('');
    setProvince('');
    setZipCode('');
  };

  const handleSubmit = () => {
    const addressToSave = {
      address,
      subdistrict,
      district,
      province,
      zipCode
    };

    if (addressData) {
      onEditAddress(addressToSave);
    } else {
      onAddAddress(addressToSave);
    }

    resetForm(); // Reset form after submission
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{addressData ? 'Edit Address' : 'Add Address'}</h2>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder=" "
            />
            <label htmlFor="address">Address</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              id="subdistrict"
              value={subdistrict}
              onChange={(e) => setSubdistrict(e.target.value)}
              required
              placeholder=" "
            />
            <label htmlFor="subdistrict">Subdistrict</label>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              placeholder=" "
            />
            <label htmlFor="district">District</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
              placeholder=" "
            />
            <label htmlFor="province">Province</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              id="postalCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              placeholder=" "
            />
            <label htmlFor="postalCode">Postal Code</label>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={handleSubmit} className="modal-button">
            {addressData ? 'Update' : 'Add'}
          </button>
          <button onClick={() => {resetForm(); onClose();}} className="modal-button cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
