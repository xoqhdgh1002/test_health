import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {user ? (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              게이미피케이션 건강 도서 체험
            </h1>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-lg text-gray-700">
                환영합니다, <span className="font-semibold">{user.email}</span>님!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">레벨</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {user.level}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">경험치</p>
                <p className="text-3xl font-bold text-green-700">
                  {user.xp} XP
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              게이미피케이션 건강 도서 체험
            </h1>
            <p className="text-gray-600 mb-6">
              로그인이 필요합니다.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              로그인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
