import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, Users, LogOut, Briefcase, Calendar } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const adminNavLinks = [
    { name: 'Dashboard Reports', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Projects & Allocation', icon: <FolderKanban size={20} />, path: '/admin/projects' },
  ];

  const userNavLinks = [
    { name: 'My Projects', icon: <Briefcase size={20} />, path: '/user/dashboard' },
    { name: 'Weekly Allocation', icon: <Calendar size={20} />, path: '/user/weekly' },
  ];

  const navLinks = user?.role === 'admin' ? adminNavLinks : userNavLinks;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-xl font-bold">
            RM
          </div>
          <span className="text-xl font-bold tracking-wide text-indigo-50">App</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 bg-indigo-950">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center border-2 border-indigo-500">
              <Users size={18} className="text-indigo-200" />
            </div>
            <div>
              <p className="text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-xs text-indigo-400 capitalize">{user?.role} {user?.employeeId && `• ${user.employeeId}`}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-800 hover:bg-red-600 hover:text-white text-indigo-200 rounded-lg transition-colors duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-10 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
                {navLinks.find(link => isActive(link.path))?.name || 'Overview'}
            </h1>
            <div className="text-sm text-gray-500">
               {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </header>
        <div className="p-8 pb-16 max-w-7xl mx-auto w-full flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
