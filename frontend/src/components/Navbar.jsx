import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaMoon, FaChartBar, FaUser, FaSignOutAlt, FaCalculator, FaCog } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <FaMoon className="text-purple-500 text-2xl" />
            <span className="font-semibold text-lg text-white">SleepEase</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <Link
              to="/calculator"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                ${isActive('/calculator')
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-purple-400'}`}
            >
              <FaCalculator />
              <span>Calculator</span>
            </Link>
            <Link
              to="/stats"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                ${isActive('/stats')
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-purple-400'}`}
            >
              <FaChartBar />
              <span>Statistics</span>
            </Link>
            <Link
              to="/settings"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                ${isActive('/settings')
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-purple-400'}`}
            >
              <FaCog />
              <span>Settings</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-400">
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-all"
                >
                  <FaSignOutAlt className="text-sm" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`ml-3 flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                  ${isActive('/login')
                    ? 'bg-purple-700 text-white'
                    : 'bg-purple-600 text-white hover:bg-purple-500'}`}
              >
                <FaUser className="text-sm" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 