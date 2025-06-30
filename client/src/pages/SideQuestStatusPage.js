import React from 'react';
import ItemTablePage from './ItemTablePage';

export default function SideQuestStatusPage() {
  return (
    <div>
      <ItemTablePage type="sidequest" titlePrefix="Side Quests" />
      <div style={{ margin: '1rem' }}>
        <a href="/sidequests/create">
          <button>Create New Sidequest</button>
        </a>
      </div>
    </div>
  );
}
