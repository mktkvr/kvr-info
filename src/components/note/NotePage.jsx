import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../db/firebaseConfig';
import './NotePage.css'; // Import the CSS file

const NotePage = () => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleAddNote = async () => {
    if (note.trim() === '') {
      setMessage('Note cannot be empty');
      setMessageType('error');
      return;
    }

    try {
      await addDoc(collection(db, 'notes'), {
        content: note,
        createdAt: new Date(),
      });
      setNote('');
      setMessage('Note added successfully!');
      setMessageType('success');
      fetchNotes(); // Refresh the list after adding a new note
    } catch (error) {
      console.error('Error adding note: ', error);
      setMessage('Failed to add note');
      setMessageType('error');
    }
  };

  const fetchNotes = async () => {
    try {
      const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const notesArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesArray);
    } catch (error) {
      console.error('Error fetching notes: ', error);
      setMessage('Failed to fetch notes');
      setMessageType('error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      setMessage('Note deleted successfully!');
      setMessageType('success');
      fetchNotes(); // Refresh the list after deleting a note
    } catch (error) {
      console.error('Error deleting note: ', error);
      setMessage('Failed to delete note');
      setMessageType('error');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="note-page">
      <h2>Add a Note</h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows="5"
        placeholder="Enter your note here..."
        className="note-textarea"
      />
      <button onClick={handleAddNote} className="add-note-button">
        Add Note
      </button>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <h2>Note List</h2>
      {notes.length > 0 ? (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id} className="note-item">
              <p>{note.content}</p>
              <small>Created at: {note.createdAt.toDate().toLocaleString()}</small>
              <button onClick={() => handleDeleteNote(note.id)} className="delete-note-button">
                Delete Note
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notes available</p>
      )}
    </div>
  );
};

export default NotePage;
