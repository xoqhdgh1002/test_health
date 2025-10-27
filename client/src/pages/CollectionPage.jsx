import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function CollectionPage() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch collection
  useEffect(() => {
    const fetchCollection = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/collection', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCards(response.data);
      } catch (err) {
        setError(err.response?.data?.error || '컬렉션을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">컬렉션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📚 나의 지식 컬렉션
            </h1>
            <p className="text-gray-600">
              AI 채팅을 통해 획득한 건강 지식 카드 모음
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && cards.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                아직 획득한 카드가 없습니다
              </h2>
              <p className="text-gray-600 mb-6">
                AI 채팅에서 건강 주제에 대해 질문하여 지식 카드를 수집하세요!
              </p>
              <Link
                to="/chat"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                AI 채팅 시작하기
              </Link>
            </div>
          )}

          {/* Cards Grid */}
          {cards.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                총 <span className="font-bold text-purple-600">{cards.length}개</span>의 카드를 획득했습니다
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-3xl">🎓</span>
                          <h3 className="text-xl font-bold text-gray-800">
                            {card.term}
                          </h3>
                        </div>
                      </div>
                      <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
                        NEW
                      </div>
                    </div>

                    {/* Card Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                      {card.description}
                    </p>

                    {/* Card Footer */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>획득일</span>
                        <span>
                          {new Date(card.collectedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Collection Stats */}
          {cards.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">📊 컬렉션 통계</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{cards.length}</p>
                  <p className="text-sm opacity-90">획득한 카드</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {cards.length >= 5 ? '마스터' : cards.length >= 2 ? '초보' : '입문'}
                  </p>
                  <p className="text-sm opacity-90">수집가 등급</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {Math.round((cards.length / 10) * 100)}%
                  </p>
                  <p className="text-sm opacity-90">완성도</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8 text-center">
            <Link
              to="/chat"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              💬 더 많은 카드 수집하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectionPage;
