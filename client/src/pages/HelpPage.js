import React from 'react';

// This page provides a high level overview of how the game works
// and explains each main feature players will encounter.
export default function HelpPage() {
  return (
    <div className="card spaced-card">
      <h2>Help & Quick Start</h2>
      <p>
        {/* Very brief explanation for new players */}
        Treasure Hunt is a team based scavenger hunt. Sign up with your first
        and last name and either create a new team or join an existing one.
      </p>

      {/* Step by step instructions for getting into the game quickly */}
      <h3>Quick Start</h3>
      <ol>
        <li>Sign up or log in from the home page.</li>
        <li>Create a team or join one using another player&apos;s last name.</li>
        <li>Check your Dashboard to see your current clue.</li>
        <li>Scan QR codes around the venue to reveal questions.</li>
        <li>Submit answers and move on to the next clue!</li>
      </ol>

      {/* Summary of what each section in the sidebar does */}
      <h3>Features</h3>
      <ul>
        <li><strong>Dashboard</strong> – overview of your team and progress.</li>
        <li><strong>Questions & Clues</strong> – solve riddles to advance.</li>
        <li><strong>Sidequests</strong> – optional tasks for extra points.</li>
        <li><strong>Players & Teams</strong> – browse all participants.</li>
        <li><strong>Scoreboard</strong> – see who&apos;s leading the hunt.</li>
        <li>
          <strong>Rogues Gallery</strong> – view and react to uploaded photos
          from sidequest submissions.
        </li>
        <li>
          <strong>Progress</strong> – track which questions, clues and sidequests
          you&apos;ve completed.
        </li>
        <li>
          <strong>Profile</strong> – manage your selfie, team colours and other
          personal details.
        </li>
      </ul>
      <p>
        {/* Mention PWA support so users know it works offline */}
        The site works great as a Progressive Web App. Add it to your home screen
        to play offline and receive notifications when new clues appear.
      </p>
    </div>
  );
}
