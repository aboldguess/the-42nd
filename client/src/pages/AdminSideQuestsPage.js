import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageSelector from '../components/ImageSelector';
import ExpandableQr from '../components/ExpandableQr';
import {
  fetchSideQuestsAdmin,
  createSideQuestAdmin,
  updateSideQuestAdmin,
  deleteSideQuestAdmin
} from '../services/api';

// Admin table for side quests with CRUD
export default function AdminSideQuestsPage() {
  const [quests, setQuests] = useState([]);
  // Store form fields for creating a side quest
  const [newQuest, setNewQuest] = useState({
    title: '',
    text: '',
    timeLimitSeconds: '',
    useStopwatch: false,
    image: null // holds the uploaded quest picture
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  // Preview thumbnails for selected images so admins know what was chosen
  const [newPreview, setNewPreview] = useState('');
  const [editPreview, setEditPreview] = useState('');

  // When choosing an image for a new quest, store the file and preview
  const handleNewImageSelect = (file) => {
    setNewQuest((q) => ({ ...q, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setNewPreview('');
    }
  };

  // When replacing an image on an existing quest show a preview as well
  const handleEditImageSelect = (file) => {
    setEditData((d) => ({ ...d, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditPreview('');
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Retrieve all side quests for display
  const load = async () => {
    try {
      const { data } = await fetchSideQuestsAdmin();
      setQuests(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error loading side quests');
    }
  };

  // Create a new side quest entry
  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newQuest.title);
      formData.append('text', newQuest.text);
      if (newQuest.image) formData.append('image', newQuest.image);
      if (newQuest.timeLimitSeconds)
        formData.append('timeLimitSeconds', newQuest.timeLimitSeconds);
      formData.append('useStopwatch', newQuest.useStopwatch ? 'true' : 'false');
      await createSideQuestAdmin(formData);
      setNewQuest({ title: '', text: '', timeLimitSeconds: '', useStopwatch: false, image: null });
      setNewPreview('');
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating side quest');
    }
  };

  // Save updates to a quest
  const handleSave = async (id) => {
    try {
      // If a new image was selected send multipart data, otherwise plain JSON
      let payload = editData;
      if (editData.image) {
        // build multipart form data when a new image file is present
        const formData = new FormData();
        formData.append('title', editData.title);
        formData.append('text', editData.text);
        formData.append('image', editData.image);
        formData.append('timeLimitSeconds', editData.timeLimitSeconds);
        formData.append('useStopwatch', editData.useStopwatch ? 'true' : 'false');
        payload = formData;
      }
      await updateSideQuestAdmin(id, payload);
      setEditId(null);
      setEditData({});
      setEditPreview('');
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating side quest');
    }
  };

  // Delete a quest
  const handleDelete = async (id) => {
    try {
      await deleteSideQuestAdmin(id);
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting side quest');
    }
  };

  // Admin CRUD interface for side quests
  return (
    <div className="card spaced-card">
      <h2>Side Quests</h2>
      {/* Access printable summary */}
      <p>
        <Link to="/admin/cribsheet">Print Crib Sheet</Link>
      </p>
      {/* responsive table for side quests */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Text</th>
            <th>Image</th>
            <th>Time Limit</th>
            <th>QR</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quests.map((q) => (
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
                    {/* show preview when replacing the quest image */}
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
                    <input
                      value={editData.timeLimitSeconds}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          timeLimitSeconds: e.target.value
                        })
                      }
                    />
                  </td>
                  <td>
                    {q.qrCodeData ? (
                      <ExpandableQr data={q.qrCodeData} size={50} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleSave(q._id)}>Save</button>
                    <button
                      onClick={() => {
                        setEditId(null);
                        setEditData({});
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
                  <td>
                    {/* show thumbnail if quest has an image */}
                    {q.imageUrl ? (
                      <img src={q.imageUrl} alt={q.title} width={50} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{q.timeLimitSeconds || '-'}</td>
                  <td>
                    {q.qrCodeData ? (
                      <ExpandableQr data={q.qrCodeData} size={50} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <button onClick={() => { setEditId(q._id); setEditData({ title: q.title, text: q.text, timeLimitSeconds: q.timeLimitSeconds, useStopwatch: q.useStopwatch }); }}>Edit</button>
                    <button onClick={() => handleDelete(q._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <td>
              <input
                value={newQuest.title}
                onChange={(e) =>
                  setNewQuest({ ...newQuest, title: e.target.value })
                }
                placeholder="Title"
              />
            </td>
            <td>
              <input
                value={newQuest.text}
                onChange={(e) =>
                  setNewQuest({ ...newQuest, text: e.target.value })
                }
                placeholder="Text"
              />
            </td>
            <td>
              {/* preview the chosen image for new quests */}
              {newPreview && <img src={newPreview} alt="preview" width={50} />}
              <ImageSelector onSelect={handleNewImageSelect} />
            </td>
            <td>
              <input
                value={newQuest.timeLimitSeconds}
                onChange={(e) =>
                  setNewQuest({
                    ...newQuest,
                    timeLimitSeconds: e.target.value
                  })
                }
                placeholder="Seconds"
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
