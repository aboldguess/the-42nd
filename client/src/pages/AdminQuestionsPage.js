import React, { useEffect, useState } from 'react';
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  fetchScanSummary
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
  const [editImage, setEditImage] = useState(null); // unused placeholder for future updates
  const [scanInfo, setScanInfo] = useState({});

  useEffect(() => {
    load();
  }, []);

  // Fetch all existing trivia questions
  const load = async () => {
    try {
      const { data } = await fetchQuestions();
      setQuestions(data);
      const info = {};
      await Promise.all(
        data.map(async (q) => {
          try {
            const res = await fetchScanSummary('question', q._id);
            info[q._id] = res.data;
          } catch (e) {
            console.error(e);
          }
        })
      );
      setScanInfo(info);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error loading questions');
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
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating question');
    }
  };

  // Persist edits to an existing question
  const handleSave = async (id) => {
    try {
      const payload = { ...editData };
      await updateQuestion(id, payload);
      if (editImage) {
        // image update not supported in API yet
      }
      setEditId(null);
      setEditData({});
      setEditImage(null);
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

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Questions</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Scanned By</th>
            <th>Status</th>
            <th>Last Scanned By</th>
            <th>Total Scans</th>
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
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
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
                    {/* small preview of the attached image */}
                    {q.imageUrl ? <img src={q.imageUrl} alt={q.title} width={50} /> : '-'}
                  </td>
                  <td>
                    {q.qrCodeData ? <img src={q.qrCodeData} alt="QR" width={50} /> : '-'}
                  </td>
                  <td>
                    <button onClick={() => handleSave(q._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <a href={`/question/${q._id}`}>{q.title}</a>
                  </td>
                  <td>{Object.keys(scanInfo[q._id]?.firstPerTeam || {}).length}</td>
                  <td>{(scanInfo[q._id]?.solved || []).length}</td>
                  <td>{scanInfo[q._id]?.lastScanner?.user || '-'}</td>
                  <td>{scanInfo[q._id]?.totalUniqueScanners || 0}</td>
                  <td>{q.text}</td>
                  <td>{q.options?.join(', ')}</td>
                  <td>{q.correctAnswer || '-'}</td>
                  <td>{q.notes}</td>
                  <td>{q.imageUrl ? <img src={q.imageUrl} alt={q.title} width={50} /> : '-'}</td>
                  <td>{q.qrCodeData ? <img src={q.qrCodeData} alt="QR" width={50} /> : '-'}</td>
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
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
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
              {/* optional question image */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files[0])}
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
