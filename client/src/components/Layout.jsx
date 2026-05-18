import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
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
    { name: 'Dashboard', href: '/donor', icon: ChartBarIcon },
    { name: 'Donations', href: '/donor/donations', icon: CurrencyDollarIcon },
  ],
};

const roleLabels = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  FACILITATOR: 'Facilitator',
  DONOR: 'Donor Manager',
};

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || 'ADMIN';
  const roleDisplay = roleLabels[role] || role;

  const menu = navigation[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb]">
      {/* SIDEBAR */}
      <aside
        className="
          hidden md:flex md:w-72 md:flex-col
          bg-gradient-to-b
          from-[#8884d8]
          via-[#6f6ad9]
          to-[#82ca9d]
          text-white
          relative
          overflow-hidden
        "
      >
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full" />

        {/* TOP */}
        <div className="relative z-10 flex items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MIET Africa</h1>
            <p className="text-sm text-white/80 mt-1">Education Platform</p>
          </div>
        </div>

        {/* USER CARD */}
        <div className="relative z-10 px-5">
          <div
            className="
              bg-white/10
              border border-white/10
              backdrop-blur-md
              rounded-2xl
              p-4
            "
          >
            <p className="text-sm text-white/70">Logged in as</p>
            <h3 className="font-semibold mt-1">{user?.full_name}</h3>
            <span
              className="
                inline-block
                mt-3
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                bg-white/15
                text-white
              "
            >
              {roleDisplay}
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="relative z-10 flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? 'bg-white text-[#6f6ad9] shadow-lg'
                        : 'text-white/85 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 transition-all ${
                      active ? 'text-[#6f6ad9]' : 'text-white/80 group-hover:text-white'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* LOGOUT */}
        <div className="relative z-10 p-5">
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center justify-center gap-2 rounded-2xl
              bg-white/10 border border-white/10 py-3 text-sm font-medium text-white
              transition-all hover:bg-white hover:text-[#6f6ad9]
            "
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto overscroll-none">
        {/* TOPBAR */}
        <div
          className="
            sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100
          "
        >
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage your MIET Africa platform activities
              </p>
            </div>
            <div
              className="
                hidden md:flex items-center gap-3 rounded-2xl border border-[#e2e8f0]
                bg-white px-4 py-2 shadow-sm
              "
            >
              <div
                className="
                  flex h-10 w-10 items-center justify-center rounded-full
                  bg-gradient-to-br from-[#8884d8] to-[#82ca9d] text-white font-bold
                "
              >
                {user?.full_name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.full_name}</p>
                <p className="text-xs text-slate-500">{roleDisplay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;