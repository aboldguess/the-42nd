import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageSelector from '../components/ImageSelector';
import ExpandableQr from '../components/ExpandableQr';
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../services/api';

// Admin table for trivia questions with CRUD actions
export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  // Store form fields for creating a question
  const [newQ, setNewQ] = useState({
    title: '',
    text: '',
    options: '',
    correctAnswer: '',
    notes: ''
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newImage, setNewImage] = useState(null); // file selected for new question
  const [editImage, setEditImage] = useState(null); // replacement image while editing
  // Preview thumbnails for chosen images so admins know they've been selected
  const [newPreview, setNewPreview] = useState('');
  const [editPreview, setEditPreview] = useState('');

  useEffect(() => {
    load();
  }, []);

  // Fetch all existing trivia questions
  const load = async () => {
    try {
      const { data } = await fetchQuestions();
      setQuestions(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error loading questions');
    }
  };

  // When choosing a new image, store the file and generate a preview
  const handleNewImageSelect = (file) => {
    setNewImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setNewPreview('');
    }
  };

  // When editing, allow replacement of the existing question image
  const handleEditImageSelect = (file) => {
    setEditImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditPreview('');
    }
  };

  // Create a new trivia question
  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newQ.title);
      formData.append('text', newQ.text);
      formData.append('options', newQ.options);
      formData.append('correctAnswer', newQ.correctAnswer);
      formData.append('notes', newQ.notes);
      if (newImage) formData.append('image', newImage);
      await createQuestion(formData);
      setNewQ({ title: '', text: '', options: '', correctAnswer: '', notes: '' });
      setNewImage(null);
      setNewPreview('');
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating question');
    }
  };

  // Persist edits to an existing question
  const handleSave = async (id) => {
    try {
      let payload;
      if (editImage) {
        // Build multipart form data when a new image is selected
        const form = new FormData();
        Object.entries(editData).forEach(([k, v]) => form.append(k, v));
        form.append('image', editImage);
        payload = form;
      } else {
        payload = { ...editData };
      }
      await updateQuestion(id, payload);
      setEditId(null);
      setEditData({});
      setEditImage(null);
      setEditPreview('');
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating question');
    }
  };

  // Delete a question
  const handleDelete = async (id) => {
    try {
      await deleteQuestion(id);
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting question');
    }
  };

  // Table of all quiz questions
  return (
    <div className="card spaced-card">
      <h2>Questions</h2>
      {/* Quick link to a printable crib sheet */}
      <p>
        <Link to="/admin/cribsheet">Print Crib Sheet</Link>
      </p>
      {/* responsive table for managing questions */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Question</th>
            <th>Options</th>
            <th>Answer</th>
            <th>Notes</th>
            <th>Image</th>
            <th>QR</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q._id}>
              {editId === q._id ? (
                <>
                  <td>
                    <input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editData.text}
                      onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editData.options}
                      onChange={(e) => setEditData({ ...editData, options: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editData.correctAnswer}
                      onChange={(e) => setEditData({ ...editData, correctAnswer: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    />
                  </td>
                  <td>
                    {/* show preview when a replacement image is chosen */}
                    {editPreview ? (
                      <img src={editPreview} alt={q.title} width={50} />
                    ) : q.imageUrl ? (
                      <img src={q.imageUrl} alt={q.title} width={50} />
                    ) : (
                      '-'
                    )}
                    <ImageSelector onSelect={handleEditImageSelect} />
                  </td>
                  <td>
                    {q.qrCodeData ? <ExpandableQr data={q.qrCodeData} size={50} /> : '-'}
                  </td>
                  <td>
                    <button onClick={() => handleSave(q._id)}>Save</button>
                    <button
                      onClick={() => {
                        setEditId(null);
                        setEditData({});
                        setEditImage(null);
                        setEditPreview('');
                      }}
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{q.title}</td>
                  <td>{q.text}</td>
                  <td>{q.options?.join(', ')}</td>
                  <td>{q.correctAnswer || '-'}</td>
                  <td>{q.notes}</td>
                  <td>{q.imageUrl ? <img src={q.imageUrl} alt={q.title} width={50} /> : '-'}</td>
                  <td>{q.qrCodeData ? <ExpandableQr data={q.qrCodeData} size={50} /> : '-'}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditId(q._id);
                        setEditData({
                          title: q.title,
                          text: q.text,
                          options: q.options?.join(', '),
                          correctAnswer: q.correctAnswer,
                          notes: q.notes
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(q._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <td>
              <input
                value={newQ.title}
                onChange={(e) => setNewQ({ ...newQ, title: e.target.value })}
                placeholder="Title"
              />
            </td>
            <td>
              <input
                value={newQ.text}
                onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                placeholder="Question"
              />
            </td>
            <td>
              <input
                value={newQ.options}
                onChange={(e) => setNewQ({ ...newQ, options: e.target.value })}
                placeholder="A,B,C,D"
              />
            </td>
            <td>
              <input
                value={newQ.correctAnswer}
                onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                placeholder="Correct option"
              />
            </td>
            <td>
              <input
                value={newQ.notes}
                onChange={(e) => setNewQ({ ...newQ, notes: e.target.value })}
                placeholder="Notes"
              />
            </td>
            <td>
              {/* optional question image with preview */}
              {newPreview && <img src={newPreview} alt="preview" width={50} />}
              <ImageSelector onSelect={handleNewImageSelect} />
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
