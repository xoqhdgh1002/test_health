import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Header() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              건강 퀘스트
            </h1>
          </Link>

          {/* User Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {/* Level Badge */}
              <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-gray-600">레벨</span>
                <span className="text-xl font-bold text-yellow-700">
                  {user?.level || 1}
                </span>
              </div>

              {/* XP Badge */}
              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-gray-600">XP</span>
                <span className="text-xl font-bold text-green-700">
                  {user?.xp || 0}
                </span>
              </div>
            </div>

            {/* User Email & Logout */}
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.email}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  로그아웃
                </button>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
