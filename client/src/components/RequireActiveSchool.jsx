import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PendingApproval from '../pages/auth/PendingApproval';
import SchoolRejected from '../pages/auth/SchoolRejected';
import SchoolDeactivated from '../pages/auth/SchoolDeactivated';

const RequireActiveSchool = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('loading'); // 'approved', 'pending', 'rejected', 'deactivated'

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

        if (!centre) {
          // No school linked – treat as pending (should not happen normally)
          setStatus('pending');
          return;
        }

        if (centre.registration_status !== 'APPROVED') {
          setStatus(centre.registration_status.toLowerCase());
          return;
        }
        if (!centre.is_active) {
          setStatus('deactivated');
          return;
        }
        setStatus('approved');
      } catch (err) {
        // If endpoint fails, assume no school → pending
        setStatus('pending');
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