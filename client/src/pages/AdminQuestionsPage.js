import React, { useEffect, useState } from 'react';
import {
  fetchQuestions,
  createQuestion,
  deleteQuestion
} from '../services/api';

// Simple CRUD interface for Questions
export default function AdminQuestionsPage() {
  // List of existing questions
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [options, setOptions] = useState('');
  const [notes, setNotes] = useState('');
  // Image file selected for upload
  const [image, setImage] = useState(null);

  useEffect(() => {
    load();
  }, []);

  // Fetch questions from API
  const load = async () => {
    const { data } = await fetchQuestions();
    setQuestions(data);
  };

  // Submit a new question to the server
  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    formData.append('options', options);
    formData.append('notes', notes);
    if (image) formData.append('image', image);
    await createQuestion(formData);
    setTitle('');
    setText('');
    setOptions('');
    setNotes('');
    setImage(null);
    load();
  };

  // Delete a question by ID
  const handleDelete = async (id) => {
    await deleteQuestion(id);
    load();
  };

  return (
    <div className="card" style={{ padding: '1rem', margin: '1rem' }}>
      <h2>Questions</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Question"
          required
        />
        <input
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          placeholder="Options comma separated"
          // Admins enter answers as a comma separated list
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
        />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Create</button>
      </form>
      <ul>
        {questions.map((q) => (
          <li key={q._id}>
            {q.title} <button onClick={() => handleDelete(q._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
