import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function HomePage() {
  const navigate = useNavigate();
  const { user, token, logout, updateUser } = useContext(AuthContext);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingQuestId, setCompletingQuestId] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch daily quests
  useEffect(() => {
    const fetchQuests = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/quests/daily', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setQuests(response.data);
      } catch (err) {
        setError(err.response?.data?.error || '퀘스트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, [token]);

  const handleCompleteQuest = async (questId) => {
    try {
      setCompletingQuestId(questId);
      const response = await axios.post(
        `http://localhost:3001/api/quests/${questId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update user data in context
      updateUser(response.data.user);

      // Remove completed quest from list
      setQuests(quests.filter(q => q.id !== questId));

      // Show level up notification if leveled up
      if (response.data.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      setError('');
    } catch (err) {
      setError(err.response?.data?.error || '퀘스트 완료 중 오류가 발생했습니다.');
    } finally {
      setCompletingQuestId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Level Up Notification */}
        {showLevelUp && (
          <div className="fixed top-4 right-4 bg-yellow-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce z-50">
            <p className="text-lg font-bold">🎉 레벨 업! Level {user.level}</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
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
                <p className="text-xs text-gray-600 mt-1">
                  다음 레벨까지: {user.level * 100 - user.xp} XP
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              로그아웃
            </button>
          </div>

          {/* Quests Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📋 오늘의 건강 퀘스트
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">퀘스트를 불러오는 중...</p>
              </div>
            ) : quests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xl text-gray-600">🎊 오늘의 퀘스트를 모두 완료했습니다!</p>
                <p className="text-sm text-gray-500 mt-2">내일 다시 도전하세요!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {quest.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {quest.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {quest.type === 'DAILY' ? '일일' : '주간'}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            +{quest.xp} XP
                          </span>
                          {quest.streak > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                              🔥 {quest.streak}일 연속
                            </span>
                          )}
                        </div>
                        {quest.book && (
                          <p className="text-sm text-gray-500 mt-2">
                            📚 {quest.book.title}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCompleteQuest(quest.id)}
                        disabled={completingQuestId === quest.id}
                        className="ml-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {completingQuestId === quest.id ? '완료 중...' : '✓ 완료'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
