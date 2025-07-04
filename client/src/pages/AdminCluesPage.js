import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageSelector from '../components/ImageSelector';
import ExpandableQr from '../components/ExpandableQr';
import {
  fetchClues,
  createClueAdmin,
  updateClueAdmin,
  deleteClueAdmin
} from '../services/api';

// Admin table for managing clues with inline editing
export default function AdminCluesPage() {
  const [clues, setClues] = useState([]); // list of clue objects
  const [newClue, setNewClue] = useState({
    title: '',
    text: '',
    options: '',
    correctAnswer: '',
    infoPage: false,
    image: null // file object for the clue's picture
  });
  const [editId, setEditId] = useState(null); // currently edited clue id
  const [editData, setEditData] = useState({}); // form state for edit row

  // Fetch clues on mount
  useEffect(() => {
    load();
  }, []);

  // Fetch existing clues for the list
  const load = async () => {
    try {
      const { data } = await fetchClues();
      setClues(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error loading clues');
    }
  };

  // Create a new clue using the bottom row inputs
  // Create a new clue using the form inputs
  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newClue.title);
      formData.append('text', newClue.text);
      formData.append('options', newClue.options);
      formData.append('correctAnswer', newClue.correctAnswer);
      formData.append('infoPage', newClue.infoPage ? 'true' : 'false');
      if (newClue.image) formData.append('questionImage', newClue.image);
      await createClueAdmin(formData);
      setNewClue({ title: '', text: '', options: '', correctAnswer: '', infoPage: false, image: null });
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating clue');
    }
  };

  // Save edits for an existing clue
  // Persist edits to a clue
  const handleSave = async (id) => {
    try {
      const formData = new FormData();
      formData.append('title', editData.title);
      formData.append('text', editData.text);
      formData.append('options', editData.options);
      formData.append('correctAnswer', editData.correctAnswer);
      formData.append('infoPage', editData.infoPage ? 'true' : 'false');
      if (editData.image) formData.append('questionImage', editData.image);
      await updateClueAdmin(id, formData);
      setEditId(null);
      setEditData({});
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating clue');
    }
  };

  // Delete a clue by ID
  const handleDelete = async (id) => {
    try {
      await deleteClueAdmin(id);
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting clue');
    }
  };

  // Display all clues inside a padded card
  return (
    <div className="card spaced-card">
      <h2>Clues</h2>
      {/* Link to printable overview for gamemasters */}
      <p>
        <Link to="/admin/cribsheet">Print Crib Sheet</Link>
      </p>
      {/* responsive table for clues */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Text</th>
            <th>Image</th>
            <th>Answer</th>
            <th>QR</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clues.map((c) => (
            <tr key={c._id}>
              {editId === c._id ? (
                <>
                  <td>
                    <input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                  </td>
                  <td>
                    <input
                      value={editData.text}
                      onChange={(e) =>
                        setEditData({ ...editData, text: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    {/* allow uploading a replacement image when editing */}
                    <ImageSelector onSelect={(file) =>
                      setEditData({ ...editData, image: file })
                    } />
                  </td>
                  <td>
                    <input
                      value={editData.correctAnswer}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          correctAnswer: e.target.value
                        })
                      }
                    />
                  </td>
                  <td>
                    {c.qrCodeData ? (
                      <ExpandableQr data={c.qrCodeData} size={50} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleSave(c._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{c.title}</td>
                  <td>{c.text}</td>
                  <td>
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.title} width={50} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{c.correctAnswer}</td>
                  <td>
                    {c.qrCodeData ? (
                      <ExpandableQr data={c.qrCodeData} size={50} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <button onClick={() => { setEditId(c._id); setEditData({ title: c.title, text: c.text, options: c.options?.join(', '), correctAnswer: c.correctAnswer, infoPage: c.infoPage }); }}>Edit</button>
                    <button onClick={() => handleDelete(c._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {/* Bottom row for creating a new clue */}
          <tr>
            <td>
              <input
                value={newClue.title}
                onChange={(e) =>
                  setNewClue({ ...newClue, title: e.target.value })
                }
                placeholder="Title"
              />
            </td>
            <td>
              <input
                value={newClue.text}
                onChange={(e) =>
                  setNewClue({ ...newClue, text: e.target.value })
                }
                placeholder="Text"
              />
            </td>
            <td>
              {/* file input for the clue image */}
              <ImageSelector onSelect={(file) =>
                setNewClue({ ...newClue, image: file })
              } />
            </td>
            <td>
              <input
                value={newClue.correctAnswer}
                onChange={(e) =>
                  setNewClue({ ...newClue, correctAnswer: e.target.value })
                }
                placeholder="Answer"
              />
            </td>
            <td>-</td>
            <td>
              <button onClick={handleCreate}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
