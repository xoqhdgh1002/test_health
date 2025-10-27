import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function ChatPage() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (token) {
      setMessages([
        {
          type: 'ai',
          content: '안녕하세요! 건강 지식 AI 비서입니다. 궁금한 것을 물어보세요! (예: "인슐린 저항성이 뭐야?", "방탄 커피에 대해 알려줘", "퀴즈")',
          timestamp: new Date()
        }
      ]);
    }
  }, [token]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/chat',
        { query: input },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const aiMessage = {
        type: 'ai',
        content: response.data.response,
        timestamp: new Date(),
        isQuiz: response.data.isQuiz
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show toast if new card was collected
      if (response.data.newCard && response.data.card) {
        setToastMessage(`🎉 축하합니다! "${response.data.card.term}" 카드를 획득했습니다!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
    } catch (err) {
      const errorMessage = {
        type: 'ai',
        content: err.response?.data?.error || '오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-bounce">
              <p className="font-bold">{toastMessage}</p>
            </div>
          )}

          {/* Page Title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            💬 건강 지식 AI 채팅
          </h1>

          {/* Chat Container */}
          <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isQuiz
                        ? 'bg-purple-100 text-purple-900 border-2 border-purple-400'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.isQuiz && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎯</span>
                        <span className="font-bold">퀴즈 타임!</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                      </div>
                      <span>AI가 생각 중...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="질문을 입력하세요... (예: 인슐린 저항성이 뭐야?)"
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  전송
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setInput('인슐린 저항성이 뭐야?')}
                  disabled={loading}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  인슐린 저항성
                </button>
                <button
                  onClick={() => setInput('방탄 커피에 대해 알려줘')}
                  disabled={loading}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  방탄 커피
                </button>
                <button
                  onClick={() => setInput('퀴즈')}
                  disabled={loading}
                  className="px-3 py-1 bg-purple-200 text-purple-700 rounded-full text-sm hover:bg-purple-300 transition-colors disabled:opacity-50"
                >
                  🎯 퀴즈
                </button>
              </div>
            </div>
          </div>

          {/* Hint Box */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>💡 팁:</strong> 특정 건강 주제에 대해 물어보면 지식 카드를 획득할 수 있습니다!
              획득한 카드는 "컬렉션" 페이지에서 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
