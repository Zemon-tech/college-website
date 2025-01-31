import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getNavItems = (role) => {
    const baseItems = [
      { name: 'Dashboard', path: `/${role}/dashboard` },
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Users', path: '/admin/users' },
          { name: 'Classes', path: '/admin/classes' },
          { name: 'Updates', path: '/admin/updates' }
        ];
      case 'teacher':
        return [
          ...baseItems,
          { name: 'Classes', path: '/teacher/classes' },
          { name: 'Resources', path: '/teacher/resources' }
        ];
      case 'cr':
        return [
          ...baseItems,
          { name: 'Updates', path: '/cr/updates' },
          { name: 'Resources', path: '/cr/resources' }
        ];
      case 'student':
        return [
          ...baseItems,
          { name: 'Schedule', path: '/student/schedule' },
          { name: 'Resources', path: '/student/resources' }
        ];
      default:
        return baseItems;
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block md:flex-shrink-0`}>
        <div className="flex flex-col w-64 h-full bg-gray-800">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <h1 className="text-xl font-bold text-white">LOGO</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {user && getNavItems(user.role).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    isActivePath(item.path)
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="sr-only">Open sidebar</span>
            {/* Add hamburger icon */}
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              {/* Add search or other controls */}
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-4">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 