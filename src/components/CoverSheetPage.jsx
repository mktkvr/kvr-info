import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { jsPDF } from 'jspdf';
import './CoverSheetPage.css';
import ConfirmationModal from './ConfirmationModal';
import thSarabunFont from './fonts/THSarabunNew-base64';

const CoverSheetPage = () => {
  const [coverSheets, setCoverSheets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoverSheet, setNewCoverSheet] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: ''
  });
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedCoverSheetIds, setSelectedCoverSheetIds] = useState([]);
  const [selectedCoverSheet, setSelectedCoverSheet] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'printed', 'notPrinted'

  useEffect(() => {
    fetchCoverSheets();
  }, []);

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
      const docRef = await addDoc(coverSheetsCollection, newCoverSheet);
      setCoverSheets(prev => [...prev, { id: docRef.id, ...newCoverSheet }]);
      setNewCoverSheet({
        senderName: '',
        senderPhone: '',
        senderAddress: '',
        recipientName: '',
        recipientPhone: '',
        recipientAddress: ''
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding cover sheet: ", error);
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
    doc.setFontSize(18);
    doc.setTextColor(50, 50, 50);

    for (const coverSheet of coverSheets) {
      if (coverSheets.indexOf(coverSheet) > 0) {
        doc.addPage();
      }

      const errors = validateCoverSheet(coverSheet);
      if (errors.length > 0) {
        doc.text(`Error: ${errors.join(', ')}`, 10, 10);
        continue; // Skip this cover sheet if there are validation errors
      }

      const margin = 10;
      const lineHeight = 8;
      let cursorY = margin;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(30, 30, 30);
      doc.text("Shipping Label", margin, cursorY);
      
      cursorY += lineHeight + 4;

      // Divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(150, 150, 150);
      doc.line(margin, cursorY, 90, cursorY);
      cursorY += 4;

      // Sender Information
      doc.setFontSize(16);
      doc.setTextColor(50, 50, 50);
      doc.text(`Sender Information:`, margin, cursorY);
      cursorY += lineHeight;

      doc.setFontSize(14);
      doc.text(`Name: ${coverSheet.senderName}`, margin, cursorY);
      cursorY += lineHeight;
      doc.text(`Phone: ${coverSheet.senderPhone}`, margin, cursorY);
      cursorY += lineHeight;
      doc.text(`Address: ${coverSheet.senderAddress}`, margin, cursorY);
      cursorY += lineHeight + 4;

      // Divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(150, 150, 150);
      doc.line(margin, cursorY, 90, cursorY);
      cursorY += 4;

      // Recipient Information
      doc.setFontSize(16);
      doc.setTextColor(50, 50, 50);
      doc.text(`Recipient Information:`, margin, cursorY);
      cursorY += lineHeight;

      doc.setFontSize(14);
      doc.text(`Name: ${coverSheet.recipientName}`, margin, cursorY);
      cursorY += lineHeight;
      doc.text(`Phone: ${coverSheet.recipientPhone}`, margin, cursorY);
      cursorY += lineHeight;
      doc.text(`Address: ${coverSheet.recipientAddress}`, margin, cursorY);
      cursorY += lineHeight;

      // Footer with a small note
      cursorY += lineHeight + 8;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("Thank you for using our service.", margin, cursorY);

      // Update cover sheet status to printed
      await handlePrintStatusChange(coverSheet.id, true);
    }

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
  
  

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const filteredCoverSheets = coverSheets.filter(sheet => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'printed') return sheet.printed;
    if (filterStatus === 'notPrinted') return !sheet.printed;
    return true;
  });

  const openConfirmationModal = (coverSheet) => {
    setSelectedCoverSheet(coverSheet);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirm = async () => {
    if (selectedCoverSheet) {
      await deleteCoverSheet(selectedCoverSheet.id);
      setCoverSheets(prev => prev.filter(sheet => sheet.id !== selectedCoverSheet.id));
    }
    setIsConfirmationModalOpen(false);
  };

  const deleteCoverSheet = async (id) => {
    try {
      const coverSheetRef = doc(db, "coverSheets", id);
      await deleteDoc(coverSheetRef);
    } catch (error) {
      console.error("Error deleting cover sheet: ", error);
    }
  };

  const handlePrintAndGeneratePDF = async (id) => {
    try {
      const coverSheetRef = doc(db, "coverSheets", id);
      await updateDoc(coverSheetRef, { printed: true });
      
      const updatedCoverSheets = coverSheets.map(sheet => sheet.id === id ? { ...sheet, printed: true } : sheet);
      setCoverSheets(updatedCoverSheets);
      
      const selectedCoverSheet = updatedCoverSheets.find(sheet => sheet.id === id);
      if (selectedCoverSheet) {
        generatePDFs([selectedCoverSheet]); // Generate PDF only for the printed cover sheet
      }
    } catch (error) {
      console.error("Error printing and generating PDF: ", error);
    }
  };

  return (
    <div className="cover-sheet-container">
      <h2>Cover Sheets</h2>
      <button className="add-cover-sheet-button" onClick={() => setIsModalOpen(true)}>
        Add Cover Sheet
      </button>
      {selectedCoverSheetIds.length > 0 && (
        <button
          className="generate-pdfs-button"
          onClick={() => {
            const selectedCoverSheets = coverSheets.filter(sheet => selectedCoverSheetIds.includes(sheet.id));
            generatePDFs(selectedCoverSheets);
          }}
        >
          Generate PDFs
        </button>
      )}
      <div className="filter-buttons">
        <button onClick={() => handleFilterChange('all')}>All</button>
        <button onClick={() => handleFilterChange('printed')}>Printed</button>
        <button onClick={() => handleFilterChange('notPrinted')}>Not Printed</button>
      </div>
      <ul className="cover-sheet-list">
        {filteredCoverSheets.map(sheet => (
          <li key={sheet.id} className="cover-sheet-item">
          <input
            type="checkbox"
            checked={selectedCoverSheetIds.includes(sheet.id)}
            onChange={() => handleCheckboxChange(sheet.id)}
          />
          <div>
            <p><strong>Sender:</strong> {sheet.senderName} - {sheet.senderPhone}</p>
            <p><strong>Address:</strong> {sheet.senderAddress}</p>
            <p><strong>Recipient:</strong> {sheet.recipientName} - {sheet.recipientPhone}</p>
            <p><strong>Address:</strong> {sheet.recipientAddress}</p>
            <p><strong>Status:</strong> {sheet.printed ? 'Printed' : 'Not Printed'}</p>
            <button
              className="print-button"
              onClick={() => handlePrintStatusChange(sheet.id, true, true)}
            >
              Print
            </button>
            <button className="delete-button" onClick={() => openConfirmationModal(sheet)}>
              Delete
            </button>
          </div>
        </li>
        ))}
      </ul>
      {isModalOpen && (
        <div className="modal">
          <h2>Add Cover Sheet</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleAddCoverSheet(); }}>
            <input type="text" name="senderName" value={newCoverSheet.senderName} onChange={handleChange} placeholder="Sender Name" maxLength="50" required />
            <input type="text" name="senderPhone" value={newCoverSheet.senderPhone} onChange={handleChange} placeholder="Sender Phone" maxLength="10" pattern="\d*" required />
            <textarea name="senderAddress" value={newCoverSheet.senderAddress} onChange={handleChange} placeholder="Sender Address" required></textarea>
            <input type="text" name="recipientName" value={newCoverSheet.recipientName} onChange={handleChange} placeholder="Recipient Name" maxLength="50" required />
            <input type="text" name="recipientPhone" value={newCoverSheet.recipientPhone} onChange={handleChange} placeholder="Recipient Phone" maxLength="10" pattern="\d*" required />
            <textarea name="recipientAddress" value={newCoverSheet.recipientAddress} onChange={handleChange} placeholder="Recipient Address" required></textarea>
            <button type="submit">Add</button>
            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
          </form>
        </div>
      )}
      {isConfirmationModalOpen && selectedCoverSheet && (
        <ConfirmationModal
          onConfirm={handleConfirm}
          onCancel={() => setIsConfirmationModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CoverSheetPage;
