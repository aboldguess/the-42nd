import React from 'react';
import { useParams } from 'react-router-dom';
import Wall from '../components/Wall';

// Page wrapper showing another player's wall
export default function PlayerWallPage() {
  const { id } = useParams();
  const token = localStorage.getItem('token');

  return <Wall userId={id} allowPost={!!token} />;
}
