import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function DashboardPage() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || '대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  // Get avatar emoji based on level
  const getAvatarEmoji = (level) => {
    if (level < 2) return '🌱';
    if (level < 5) return '🌿';
    if (level < 10) return '🌳';
    return '🏆';
  };

  // Get avatar title based on level
  const getAvatarTitle = (level) => {
    if (level < 2) return '새싹 건강인';
    if (level < 5) return '성장하는 건강인';
    if (level < 10) return '건강 마스터';
    return '건강 전설';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const xpPercentage = (dashboardData.xp / dashboardData.xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            📊 나의 건강 대시보드
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Avatar & Level */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  성장형 아바타
                </h2>

                <div className="text-center">
                  <div className="text-8xl mb-4">
                    {getAvatarEmoji(dashboardData.level)}
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    {getAvatarTitle(dashboardData.level)}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-gray-600">레벨</span>
                    <span className="text-2xl font-bold text-yellow-700">
                      {dashboardData.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  🏅 획득한 배지
                </h2>

                {dashboardData.badges.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    아직 획득한 배지가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dashboardData.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg border-2 border-purple-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏆</span>
                          <span className="font-semibold text-gray-800">
                            {badge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Progress & Health Data */}
            <div className="lg:col-span-2 space-y-6">
              {/* Experience Progress */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  ⭐ 경험치 진행도
                </h2>

                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>현재 XP: {dashboardData.xp}</span>
                    <span>다음 레벨: {dashboardData.xpToNextLevel} XP</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                      style={{ width: `${Math.min(xpPercentage, 100)}%` }}
                    >
                      <span className="text-white font-bold text-sm">
                        {Math.round(xpPercentage)}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  다음 레벨까지 {dashboardData.xpToNextLevel - dashboardData.xp} XP 남았습니다!
                </p>
              </div>

              {/* Health Data */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  💪 건강 데이터
                </h2>

                <div className="space-y-4">
                  {/* Sleep Level */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">😴</span>
                        <span className="font-semibold text-gray-700">수면 레벨</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {dashboardData.mockHealth.sleepLevel}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${dashboardData.mockHealth.sleepLevel * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboardData.mockHealth.sleepLevel >= 7 ? '우수한 수면 상태입니다!' : '수면 개선이 필요합니다.'}
                    </p>
                  </div>

                  {/* Vitality Level */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        <span className="font-semibold text-gray-700">활력 레벨</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {dashboardData.mockHealth.vitalityLevel}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${dashboardData.mockHealth.vitalityLevel * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboardData.mockHealth.vitalityLevel >= 7 ? '활력이 넘치네요!' : '활력 증진이 필요합니다.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4">
                  📈 종합 건강 점수
                </h2>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {dashboardData.level}
                    </p>
                    <p className="text-sm opacity-90">레벨</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {dashboardData.badges.length}
                    </p>
                    <p className="text-sm opacity-90">배지</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {Math.round((dashboardData.mockHealth.sleepLevel + dashboardData.mockHealth.vitalityLevel) / 2)}
                    </p>
                    <p className="text-sm opacity-90">평균 건강도</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
