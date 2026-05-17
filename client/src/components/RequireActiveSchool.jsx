import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import api from '../services/api';
import PendingApproval from '../pages/auth/PendingApproval';
import SchoolRejected from '../pages/auth/SchoolRejected';
import SchoolDeactivated from '../pages/auth/SchoolDeactivated';

const RequireActiveSchool = () => {
  const [status, setStatus] = useState('loading'); // 'approved', 'pending', 'rejected', 'deactivated'

  useEffect(() => {
    (async () => {
      try {
        const { data: centre } = await api.get('/centres/my-centre');
        if (!centre) {
          setStatus('pending');
          return;
        }
        if (centre.registration_status !== 'APPROVED') {
          setStatus(centre.registration_status.toLowerCase()); // pending / rejected
          return;
        }
        if (!centre.is_active) {
          setStatus('deactivated');
          return;
        }
        setStatus('approved');
      } catch (err) {
        // If the endpoint returns 403, it might be because no centre linked, treat as pending
        setStatus('pending');
      }
    })();
  }, []);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (status === 'pending') return <PendingApproval />;
  if (status === 'rejected') return <SchoolRejected />;
  if (status === 'deactivated') return <SchoolDeactivated />;

  return <Outlet />;
};

export default RequireActiveSchool;