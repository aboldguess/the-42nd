import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchQuestion,
  submitQuestionAnswer,
  fetchProgressItem
} from "../services/api";

// Display a single trivia question for players
export default function QuestionPlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [lockedUntil, setLockedUntil] = useState(null);
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // seconds remaining on cooldown
  const [stats, setStats] = useState(null); // progress details

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchQuestion(id);
        setQuestion(data);
        setAnswer(data.selectedAnswer || "");
        setLockedUntil(
          data.lockExpiresAt ? new Date(data.lockExpiresAt) : null,
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      load();
      fetchProgressItem("question", id)
        .then((data) => setStats(data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  // Update countdown timer whenever the lock expiry changes
  useEffect(() => {
    if (!lockedUntil) {
      setTimeLeft(0);
      return;
    }

    const update = () => {
      const diff = Math.ceil((new Date(lockedUntil) - new Date()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  if (loading) return <p>Loading question…</p>;
  if (!question) return <p>Question not found.</p>;

  const isLocked = timeLeft > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    try {
      setSaving(true);
      const { data } = await submitQuestionAnswer(id, answer);
      setLockedUntil(data.lockExpiresAt ? new Date(data.lockExpiresAt) : null);
      // After submitting an answer navigate straight to the scoreboard
      navigate("/scoreboard");
    } catch (err) {
      alert(err.response?.data?.message || "Error saving answer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Link back to the list of questions */}
      <Link to="/progress/questions" className="btn-link">
        &larr; Return to list
      </Link>
      <h2>{question.title}</h2>
      <div className="card">
        <p>{question.text}</p>
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt={question.title}
            style={{ maxWidth: "100%", marginTop: "1rem" }}
          />
        )}
        {question.options && question.options.length > 0 && (
          <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            {question.options.map((o, idx) => (
              <div key={idx}>
                <label>
                  <input
                    type="radio"
                    value={o}
                    checked={answer === o}
                    onChange={() => setAnswer(o)}
                    disabled={isLocked}
                  />{" "}
                  {o}
                </label>
              </div>
            ))}
            <button type="submit" disabled={isLocked || saving}>
              {answer ? "Update Answer" : "Submit Answer"}
            </button>
            {isLocked && (
              <p style={{ color: "red" }}>
                {`You can update your answer in ${Math.floor(timeLeft / 60)}:${(
                  "0" +
                  (timeLeft % 60)
                ).slice(-2)}`}
              </p>
            )}
          </form>
        )}
      </div>
      {stats && (
        <div style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          <p>Last scanned by: {stats.lastScannedBy || '-'}</p>
          <p>Total scans: {stats.totalScans}</p>
        </div>
      )}
    </div>
  );
}
