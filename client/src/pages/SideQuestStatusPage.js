import React from 'react';
import { Link } from 'react-router-dom';
import ItemTablePage from './ItemTablePage';

export default function SideQuestStatusPage() {
  return (
    <div>
      <ItemTablePage type="sidequest" titlePrefix="Side Quests" />
      <div style={{ margin: '1rem' }}>
        <Link to="/sidequests/new">
          <button>Create New Side Quest</button>
        </Link>
      </div>
    </div>
  );
}
