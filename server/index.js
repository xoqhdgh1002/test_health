const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./authMiddleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: '서버 앱 (Server App)' });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: '로그인 성공',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Get daily quests (protected route)
app.get('/api/quests/daily', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all daily quests
    const dailyQuests = await prisma.quest.findMany({
      where: { type: 'DAILY' },
      include: {
        book: true,
        userQuests: {
          where: { userId }
        }
      }
    });

    // Filter quests that are not completed or create UserQuest if doesn't exist
    const availableQuests = [];

    for (const quest of dailyQuests) {
      let userQuest = quest.userQuests[0];

      // If no UserQuest exists, create one
      if (!userQuest) {
        userQuest = await prisma.userQuest.create({
          data: {
            userId,
            questId: quest.id,
            status: 'PENDING'
          }
        });
      }

      // Only include pending quests
      if (userQuest.status === 'PENDING') {
        availableQuests.push({
          id: quest.id,
          title: quest.title,
          description: quest.description,
          type: quest.type,
          xp: quest.xp,
          book: quest.book,
          userQuestId: userQuest.id,
          streak: userQuest.streak
        });
      }
    }

    res.json(availableQuests);
  } catch (error) {
    console.error('Get daily quests error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Complete quest (protected route)
app.post('/api/quests/:questId/complete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const questId = parseInt(req.params.questId);

    // Get quest details
    const quest = await prisma.quest.findUnique({
      where: { id: questId }
    });

    if (!quest) {
      return res.status(404).json({ error: '퀘스트를 찾을 수 없습니다.' });
    }

    // Get or create UserQuest
    let userQuest = await prisma.userQuest.findUnique({
      where: {
        userId_questId: {
          userId,
          questId
        }
      }
    });

    if (!userQuest) {
      userQuest = await prisma.userQuest.create({
        data: {
          userId,
          questId,
          status: 'PENDING'
        }
      });
    }

    // Check if already completed
    if (userQuest.status === 'COMPLETED') {
      return res.status(400).json({ error: '이미 완료한 퀘스트입니다.' });
    }

    // Calculate streak
    let newStreak = 1;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Check if completed yesterday
    const yesterdayCompletion = await prisma.userQuest.findFirst({
      where: {
        userId,
        questId,
        status: 'COMPLETED',
        completedAt: {
          gte: yesterday,
          lte: yesterdayEnd
        }
      }
    });

    if (yesterdayCompletion) {
      newStreak = yesterdayCompletion.streak + 1;
    }

    // Update UserQuest to completed
    const updatedUserQuest = await prisma.userQuest.update({
      where: { id: userQuest.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        streak: newStreak
      }
    });

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Update user XP
    const newXp = user.xp + quest.xp;

    // Check for level up
    let newLevel = user.level;
    const xpRequiredForNextLevel = user.level * 100;

    if (newXp >= xpRequiredForNextLevel) {
      newLevel = user.level + 1;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel
      }
    });

    // Check if leveled up
    const leveledUp = newLevel > user.level;

    res.json({
      message: '퀘스트를 완료했습니다!',
      quest: {
        id: quest.id,
        title: quest.title,
        xp: quest.xp
      },
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        xp: updatedUser.xp,
        level: updatedUser.level
      },
      streak: newStreak,
      leveledUp
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Get dashboard data (protected route)
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // Calculate XP to next level
    const xpToNextLevel = user.level * 100;

    // Mock badges based on user's progress
    const badges = [];
    if (user.xp >= 50) badges.push('일주일 꿀잠');
    if (user.xp >= 100) badges.push('건강 마스터');
    if (user.level >= 2) badges.push('레벨업 챔피언');
    if (user.xp >= 200) badges.push('완전무결 식단');

    // Mock health data
    const mockHealth = {
      sleepLevel: Math.min(10, Math.floor(user.xp / 20) + 3),
      vitalityLevel: Math.min(10, Math.floor(user.xp / 15) + 2)
    };

    res.json({
      level: user.level,
      xp: user.xp,
      xpToNextLevel,
      badges,
      mockHealth
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Chat with mock AI (protected route)
app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: '질문을 입력해주세요.' });
    }

    // Mock AI: Quiz mode
    if (query.includes('퀴즈')) {
      return res.json({
        response: '방탄 커피에 들어가는 최고의 지방은 무엇일까요? (힌트: 그래스페드 버터와 함께 사용됩니다)',
        isQuiz: true
      });
    }

    // Mock AI: Keyword-based card detection
    const keywords = ['인슐린 저항성', '방탄 커피'];
    let foundCard = null;

    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        foundCard = await prisma.knowledgeCard.findFirst({
          where: { term: keyword }
        });
        break;
      }
    }

    if (foundCard) {
      // Check if user already has this card
      const existingUserCard = await prisma.userCard.findUnique({
        where: {
          userId_cardId: {
            userId,
            cardId: foundCard.id
          }
        }
      });

      let newCard = false;

      // If user doesn't have the card, collect it
      if (!existingUserCard) {
        await prisma.userCard.create({
          data: {
            userId,
            cardId: foundCard.id
          }
        });
        newCard = true;
      }

      return res.json({
        response: foundCard.description,
        card: {
          id: foundCard.id,
          term: foundCard.term
        },
        newCard
      });
    }

    // Default response
    res.json({
      response: '죄송합니다. 해당 주제에 대한 정보를 찾을 수 없습니다. "인슐린 저항성"이나 "방탄 커피"에 대해 물어보세요!'
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Get user's knowledge card collection (protected route)
app.get('/api/collection', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userCards = await prisma.userCard.findMany({
      where: { userId },
      include: {
        card: true
      },
      orderBy: {
        collectedAt: 'desc'
      }
    });

    const collection = userCards.map(uc => ({
      id: uc.card.id,
      term: uc.card.term,
      description: uc.card.description,
      collectedAt: uc.collectedAt
    }));

    res.json(collection);
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
