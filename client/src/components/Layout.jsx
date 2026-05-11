import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon, UsersIcon, FolderIcon, AcademicCapIcon, CalendarIcon,
  ChartBarIcon, CurrencyDollarIcon, DocumentTextIcon, CogIcon, ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = {
  ADMIN: [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Resources', href: '/resources', icon: FolderIcon },
    { name: 'Schools', href: '/schools', icon: AcademicCapIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'Donations', href: '/donations', icon: CurrencyDollarIcon },
    { name: 'Users', href: '/users', icon: UsersIcon },
  ],
  MANAGER: [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Resources', href: '/resources', icon: FolderIcon },
    { name: 'Schools', href: '/schools', icon: AcademicCapIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'Donations', href: '/donations', icon: CurrencyDollarIcon },
  ],
  FACILITATOR: [
    { name: 'My Courses', href: '/my-courses', icon: AcademicCapIcon },
    { name: 'Sessions', href: '/sessions', icon: CalendarIcon },
    { name: 'Assessments', href: '/assessments', icon: DocumentTextIcon },
  ],
  DONOR: [
    { name: 'Impact Dashboard', href: '/donor', icon: ChartBarIcon },
    { name: 'Donations', href: '/donor/donations', icon: CurrencyDollarIcon },
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
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-indigo-600">MIET Africa</span>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {menu.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t p-4">
              <button onClick={handleLogout} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeftOnRectangleIcon className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;