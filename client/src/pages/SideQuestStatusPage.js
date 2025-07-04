import React from 'react';
import ItemTablePage from './ItemTablePage';

export default function SideQuestStatusPage() {
  return (
    <div>
      {/*
        Provide quick access to start a new quest. Placing the button
        above the table keeps it visible even when the quest list grows
        long and requires scrolling.
      */}
      <div style={{ margin: '1rem' }}>
        <a href="/sidequests/create">
          <button>Create New Sidequest</button>
        </a>
      </div>
      {/* Table showing all side quests and their completion status */}
      <ItemTablePage type="sidequest" titlePrefix="Side Quests" />
    </div>
  );
}
