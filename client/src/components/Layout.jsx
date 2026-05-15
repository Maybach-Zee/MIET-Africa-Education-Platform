import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon, UsersIcon, FolderIcon, AcademicCapIcon, CalendarIcon,
  ChartBarIcon, CurrencyDollarIcon, DocumentTextIcon, ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = {
  ADMIN: [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Resources', href: '/admin/resources', icon: FolderIcon },
    { name: 'Schools', href: '/admin/schools', icon: AcademicCapIcon },
    { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
    { name: 'Events', href: '/admin/events', icon: CalendarIcon },
    { name: 'Donations', href: '/admin/donations', icon: CurrencyDollarIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
  ],
  MANAGER: [
    { name: 'Dashboard', href: '/manager', icon: HomeIcon },
    { name: 'Events', href: '/manager/events', icon: CalendarIcon },
    { name: 'Reports', href: '/manager/reports', icon: ChartBarIcon },
    { name: 'My School', href: '/manager/my-school', icon: AcademicCapIcon },
  ],
  FACILITATOR: [
    { name: 'Dashboard', href: '/facilitator', icon: HomeIcon },
    { name: 'Sessions', href: '/facilitator/sessions', icon: CalendarIcon },
    { name: 'Assessments', href: '/facilitator/assessments', icon: DocumentTextIcon },
  ],
  DONOR: [
    { name: 'Impact Dashboard', href: '/donor', icon: ChartBarIcon },
    { name: 'Donations', href: '/donor/donations', icon: CurrencyDollarIcon },
    { name: 'Public Impact', href: '/donor/impact', icon: HomeIcon },
  ],
};

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || 'ADMIN';
  const menu = navigation[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <span className="text-xl font-bold text-indigo-600">MIET Africa</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <button onClick={handleLogout} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeftOnRectangleIcon className="mr-2 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;