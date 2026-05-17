// Home.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Landing from './Landing';

const roleRoutes = {
  ADMIN: '/admin',
  MANAGER: '/manager',
  FACILITATOR: '/facilitator',
  DONOR: '/donor',
};

const Home = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={roleRoutes[user.role] || '/admin'} replace />;
  }

  return <Landing />;
};

export default Home;