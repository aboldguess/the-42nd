import React, { useEffect, useState } from 'react';
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../services/api';

// Admin table for trivia questions with CRUD actions
export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({
    title: '',
    text: '',
    options: '',       // comma separated list of choices
    correctAnswer: '', // exact text of the correct option
    notes: ''
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newImage, setNewImage] = useState(null);
  const [editImage, setEditImage] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await fetchQuestions();
    setQuestions(data);
  };

  const handleCreate = async () => {
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
  };

  const handleSave = async (id) => {
    const payload = { ...editData };
    await updateQuestion(id, payload);
    if (editImage) {
      // image update not supported in API yet
    }
    setEditId(null);
    setEditData({});
    setEditImage(null);
    load();
  };

  const handleDelete = async (id) => {
    await deleteQuestion(id);
    load();
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Questions</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Question</th>
            <th>Options</th>
            <th>Answer</th>
            <th>Notes</th>
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
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                    />
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
                    <input
                      value={editData.options}
                      onChange={(e) =>
                        setEditData({ ...editData, options: e.target.value })
                      }
                    />
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
                    <input
                      value={editData.notes}
                      onChange={(e) =>
                        setEditData({ ...editData, notes: e.target.value })
                      }
                    />
                  </td>
                  <td>-</td>
                  <td>
                    <button onClick={() => handleSave(q._id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{q.title}</td>
                  <td>{q.text}</td>
                  <td>{q.options ? q.options.join(', ') : '-'}</td>
                  <td>{q.correctAnswer}</td>
                  <td>{q.notes}</td>
                  <td>
                    {q.qrCodeData ? (
                      <img
                        src={q.qrCodeData}
                        alt="QR"
                        style={{ width: '50px' }}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
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
                placeholder="a,b,c,d"
              />
            </td>
            <td>
              <input
                value={newQ.correctAnswer}
                onChange={(e) =>
                  setNewQ({ ...newQ, correctAnswer: e.target.value })
                }
                placeholder="Correct"
              />
            </td>
            <td>
              <input
                value={newQ.notes}
                onChange={(e) => setNewQ({ ...newQ, notes: e.target.value })}
                placeholder="Notes"
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
