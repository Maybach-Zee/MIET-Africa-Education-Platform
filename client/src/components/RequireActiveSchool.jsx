// components/RequireActiveSchool.jsx

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PendingApproval from '../pages/auth/PendingApproval';
import SchoolRejected from '../pages/auth/SchoolRejected';
import SchoolDeactivated from '../pages/auth/SchoolDeactivated';

const RequireActiveSchool = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!user) return;

    const fetchSchoolStatus = async () => {
      try {
        let centre;
        if (user.role === 'MANAGER') {
          const { data } = await api.get('/centres/my-centre');
          centre = data;
        } else if (user.role === 'FACILITATOR') {
          const { data } = await api.get('/facilitator/school');
          centre = data;
        }

        console.log('School status response:', centre);          // <-- ADD THIS

        if (!centre) {
          console.log('No centre returned -> pending');
          setStatus('pending');
          return;
        }

        // 1. Check deactivated
        if (!centre.is_active) {
          console.log('is_active is false -> deactivated');
          setStatus('deactivated');
          return;
        }

        // 2. Then registration status
        if (centre.registration_status !== 'APPROVED') {
          console.log(`registration_status = ${centre.registration_status} -> ${centre.registration_status.toLowerCase()}`);
          setStatus(centre.registration_status.toLowerCase());
          return;
        }

        setStatus('approved');
      } catch (err) {
        console.error('Failed to fetch school status:', err);   // <-- ADD THIS
        setStatus('pending'); // fallback
      }
    };

    fetchSchoolStatus();
  }, [user]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (status === 'pending') return <PendingApproval />;
  if (status === 'rejected') return <SchoolRejected />;
  if (status === 'deactivated') return <SchoolDeactivated />;

  return <Outlet />;
};

export default RequireActiveSchool;