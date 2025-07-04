import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSideQuest, fetchMe } from '../services/api';

// First step in the side quest wizard. The user chooses a name and type
// then a new quest is created and the edit page opens for additional details.
export default function CreateSideQuestPage() {
  const [title, setTitle] = useState('');
  const [questType, setQuestType] = useState('photo');
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchMe();
        setTeamName(data.team?.name || '');
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (questType === 'bonus' && teamName) {
      setTitle(`${teamName}'s sidequest QR hunt`);
    }
  }, [questType, teamName]);

  // Available quest types presented in the dropdown
  const questTypeOptions = [
    { value: 'bonus', label: 'Bonus hunt!' },
    { value: 'meetup', label: 'Come and meet us!' },
    { value: 'photo', label: 'Take a photo!' },
    { value: 'race', label: 'Race!' },
    { value: 'passcode', label: 'Secret Passcode!' },
    { value: 'trivia', label: 'Trivia Challenge!' }
  ];

  // Create the quest and redirect to the edit page
  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('questType', questType);
      const res = await createSideQuest(formData);
      navigate(`/sidequests/${res.data._id}/edit`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating side quest');
    }
  };

  return (
    <div className="card spaced-card">
      <h2>Create Side Quest</h2>
      {/* Wrapping the fields in a form allows the Enter key to submit */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Name:
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </label>
          <label style={{ display: 'block' }}>
            Type:
            <select
              value={questType}
              onChange={(e) => setQuestType(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              {questTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={!title}>
          Continue
        </button>
      </form>
    </div>
  );
}
