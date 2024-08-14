import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './db/firebaseConfig';
import { jsPDF } from 'jspdf';
import './CoverSheetPage.css';
import ConfirmationModal from './admin/ConfirmationModal';
import thSarabunFont from './fonts/THSarabunNew-base64';


const CoverSheetPage = () => {
  const [coverSheets, setCoverSheets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoverSheet, setNewCoverSheet] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderSubDistrict: '',
    senderDistrict: '',
    senderProvince: '',
    senderPostalCode: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientSubDistrict: '',
    recipientDistrict: '',
    recipientProvince: '',
    recipientPostalCode: ''
  });
  
  const [isEditing, setIsEditing] = useState(false); // Track whether editing an existing cover sheet
  const [editCoverSheetId, setEditCoverSheetId] = useState(null); // Store the ID of the cover sheet being edited
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedCoverSheetIds, setSelectedCoverSheetIds] = useState([]);
  const [selectedCoverSheet, setSelectedCoverSheet] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'printed', 'notPrinted'

  useEffect(() => {
    fetchCoverSheets();
  }, []);

  const openAddCoverSheetModal = () => {
    setNewCoverSheet({
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      recipientName: '',
      recipientPhone: '',
      recipientAddress: ''
    });
    setIsEditing(false);
    setEditCoverSheetId(null);
    setIsModalOpen(true);
  };

  const fetchCoverSheets = async () => {
    try {
      const coverSheetsCollection = collection(db, "coverSheets");
      const querySnapshot = await getDocs(coverSheetsCollection);
      const coverSheetsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoverSheets(coverSheetsList);
    } catch (error) {
      console.error("Error fetching cover sheets: ", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCoverSheet(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCoverSheet = async () => {
    try {
      const coverSheetsCollection = collection(db, "coverSheets");

      if (isEditing) {
        // Update existing cover sheet
        const coverSheetRef = doc(db, "coverSheets", editCoverSheetId);
        await updateDoc(coverSheetRef, newCoverSheet);
        setCoverSheets(prev => prev.map(sheet => sheet.id === editCoverSheetId ? { id: editCoverSheetId, ...newCoverSheet } : sheet));
      } else {
        // Add new cover sheet
        const docRef = await addDoc(coverSheetsCollection, newCoverSheet);
        setCoverSheets(prev => [...prev, { id: docRef.id, ...newCoverSheet }]);
      }

      // Reset state and close modal
      setNewCoverSheet({
        senderName: '',
        senderPhone: '',
        senderAddress: '',
        recipientName: '',
        recipientPhone: '',
        recipientAddress: ''
      });
      setIsEditing(false);
      setEditCoverSheetId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding/editing cover sheet: ", error);
    }
  };
  

  const validateCoverSheet = (coverSheet) => {
    const errors = [];
    if (coverSheet.senderName.length > 50) errors.push("Sender name must be 50 characters or less.");
    if (!/^\d{1,10}$/.test(coverSheet.senderPhone)) errors.push("Sender phone must be numeric and up to 10 digits.");
    if (coverSheet.senderAddress.trim() === '') errors.push("Sender address cannot be empty.");
    if (coverSheet.recipientName.length > 50) errors.push("Recipient name must be 50 characters or less.");
    if (!/^\d{1,10}$/.test(coverSheet.recipientPhone)) errors.push("Recipient phone must be numeric and up to 10 digits.");
    if (coverSheet.recipientAddress.trim() === '') errors.push("Recipient address cannot be empty.");
    return errors;
  };

  const handleCheckboxChange = (id) => {
    setSelectedCoverSheetIds(prevIds =>
      prevIds.includes(id) ? prevIds.filter(item => item !== id) : [...prevIds, id]
    );
  };



  const generatePDFs = async (coverSheets) => {
    if (coverSheets.length === 0) return; // No cover sheets to generate PDFs
  
    const doc = new jsPDF('p', 'mm', [100, 150]);
  
    doc.addFileToVFS('THSarabunNew.ttf', thSarabunFont);
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal');
    doc.setFont('THSarabun');
    
    coverSheets.forEach((coverSheet, index) => {
      if (index > 0) doc.addPage();
  
      const margin = 10;
      const lineHeight = 8; // Increased line height for readability
      let cursorY = margin;
  
      // Title
      doc.setFontSize(16); // Increased font size for title
      doc.setTextColor(0, 0, 0);
      doc.text("Shipping Label", margin, cursorY);
      cursorY += lineHeight + 0; // Increased space after title
  
      // Divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(150, 150, 150);
      doc.line(margin, cursorY, 90, cursorY);
      cursorY += 10;
  
      // Sender Information
      doc.setFontSize(16); // Increased font size for section headers
      doc.setTextColor(50, 50, 50);
      doc.text("ผู้ส่ง:", margin, cursorY);
      cursorY += lineHeight;
  
      doc.setFontSize(14); // Increased font size for content
      doc.text(`${coverSheet.senderName} ${coverSheet.senderPhone}`, margin, cursorY);
      cursorY += lineHeight;
      doc.text(`${coverSheet.senderAddress}`, margin, cursorY);
      cursorY += lineHeight + 10; // Increased space after section
  
      // Divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(150, 150, 150);
      doc.line(margin, cursorY, 90, cursorY);
      cursorY += 10;
  
      // Recipient Information
      doc.setFontSize(16); // Increased font size for section headers
      doc.setTextColor(50, 50, 50);
      doc.text("ผู้รับ:", margin, cursorY);
      cursorY += lineHeight;
  
      doc.setFontSize(14); // Increased font size for content
      doc.text(`${coverSheet.recipientName} ${coverSheet.recipientPhone}`, margin, cursorY);
      cursorY += lineHeight;
      doc.text(`${coverSheet.recipientAddress}`, margin, cursorY);
      cursorY += lineHeight + 10; // Increased space after section
  
      // Footer with a small note
      doc.setFontSize(10); // Font size for footer
      doc.setTextColor(100, 100, 100);
      doc.text("Thank you.", margin, cursorY);
    });
  
    doc.output('dataurlnewwindow');
  };


  const handlePrintStatusChange = async (id, printed, generatePdf = false) => {
    try {
      const coverSheetRef = doc(db, "coverSheets", id);
      await updateDoc(coverSheetRef, { printed });
  
      const updatedCoverSheets = coverSheets.map(sheet => sheet.id === id ? { ...sheet, printed } : sheet);
      setCoverSheets(updatedCoverSheets);
  
      if (printed && generatePdf) {
        const selectedCoverSheet = updatedCoverSheets.find(sheet => sheet.id === id);
        if (selectedCoverSheet) {
          generatePDFs([selectedCoverSheet]); // Generate PDF for the selected cover sheet
        }
      }
    } catch (error) {
      console.error("Error updating print status: ", error);
    }
  };
  
  const handleEditCoverSheet = (coverSheet) => {
    setNewCoverSheet(coverSheet);
    setIsEditing(true);
    setEditCoverSheetId(coverSheet.id);
    setIsModalOpen(true);
  };
  
  

  const filteredCoverSheets = coverSheets.filter(sheet => {
    if (filterStatus === 'printed') return sheet.printed;
    if (filterStatus === 'notPrinted') return !sheet.printed;
    return true;
  });

  return (
    <div className="cover-sheet-page">
      <h2>Cover Sheets</h2>
      <div className='filter-buttons'>
        <button onClick={openAddCoverSheetModal}>Add Cover Sheet</button>
        <button onClick={() => generatePDFs(filteredCoverSheets.filter(sheet => selectedCoverSheetIds.includes(sheet.id)))}>Generate PDF</button>
      </div>


      
      <div className="filter-buttons">
        <button onClick={() => setFilterStatus('all')} className={filterStatus === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilterStatus('printed')} className={filterStatus === 'printed' ? 'active' : ''}>Printed</button>
        <button onClick={() => setFilterStatus('notPrinted')} className={filterStatus === 'notPrinted' ? 'active' : ''}>Not Printed</button>
      </div>
      <table className="cover-sheet-table">
        <thead>
          <tr>
            <th></th>
            <th>Sender Name</th>
            <th>Recipient Name</th>
            <th>Printed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {filteredCoverSheets.map(sheet => (
          <tr
            key={sheet.id}
            onClick={() => handleCheckboxChange(sheet.id)}
            className={selectedCoverSheetIds.includes(sheet.id) ? 'selected' : ''}
          >
            <td>
              <input
                type="checkbox"
                checked={selectedCoverSheetIds.includes(sheet.id)}
                onChange={() => handleCheckboxChange(sheet.id)}
                onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้ checkbox ถูกเลือกโดยอัตโนมัติเมื่อคลิกที่แถว
              />
            </td>
            <td>{sheet.senderName}</td>
            <td>{sheet.recipientName}</td>
            <td>{sheet.printed ? 'Yes' : 'No'}</td>
            <td>
              <button onClick={(e) => { e.stopPropagation(); handleEditCoverSheet(sheet); }}>Edit</button>
              <button onClick={(e) => { e.stopPropagation(); handlePrintStatusChange(sheet.id, !sheet.printed, true); }}>
                {sheet.printed ? 'Reprint' : 'Print'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>

      </table>

      
  {isModalOpen && (
    <div className="modal">
      <div className="modal-content">
        <h3>{isEditing ? 'Edit Cover Sheet' : 'Add Cover Sheet'}</h3>
        <input
          type="text"
          name="senderName"
          placeholder="Sender Name"
          value={newCoverSheet.senderName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="senderPhone"
          placeholder="Sender Phone"
          value={newCoverSheet.senderPhone}
          onChange={handleChange}
        />
        <textarea
          name="senderAddress"
          placeholder="Sender Address"
          value={newCoverSheet.senderAddress}
          onChange={handleChange}
        />
        <input
          type="text"
          name="recipientName"
          placeholder="Recipient Name"
          value={newCoverSheet.recipientName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="recipientPhone"
          placeholder="Recipient Phone"
          value={newCoverSheet.recipientPhone}
          onChange={handleChange}
        />
        <textarea
          name="recipientAddress"
          placeholder="Recipient Address"
          value={newCoverSheet.recipientAddress}
          onChange={handleChange}
        />
        <button onClick={handleAddCoverSheet}>{isEditing ? 'Save Changes' : 'Add Cover Sheet'}</button>
        <button onClick={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setEditCoverSheetId(null);
        }}>Cancel</button>
      </div>
    </div>
  )}

    </div>
  );
};

export default CoverSheetPage;
