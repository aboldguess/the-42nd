import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This page now simply forwards users to the unified onboarding page
export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
}
