# 건강 퀘스트 - 게이미피케이션 기반 건강 도서 체험 웹 앱

게임처럼 즐기는 건강 지식 학습 플랫폼입니다. 퀘스트를 완료하고, AI 챗봇과 대화하며, 지식 카드를 수집하세요!

## 주요 기능

### 1. 사용자 인증
- 회원가입 및 로그인 (JWT 기반)
- 비밀번호 암호화 (bcrypt)
- 사용자별 레벨 및 XP 관리

### 2. 퀘스트 시스템
- 일일/주간 퀘스트 제공
- 퀘스트 완료 시 XP 보상
- 연속 완료 스트릭(Streak) 추적
- 자동 레벨업 시스템 (레벨 * 100 XP 요구)

### 3. 대시보드
- 성장 아바타 시각화 (🌱 → 🌿 → 🌳 → 🏆)
- XP 진행도 바
- 획득 배지 표시
- 건강 지표 모니터링 (Mock 데이터)

### 4. AI 챗봇 & 지식 컬렉션
- 건강 관련 질문에 답변하는 Mock AI
- 키워드 기반 지식 카드 자동 수집
- 퀴즈 모드 지원
- 수집한 카드 갤러리 및 통계

## 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **React Router DOM** - 라우팅
- **Axios** - HTTP 클라이언트
- **TailwindCSS** - 스타일링

### Backend
- **Node.js** - 런타임
- **Express** - 웹 프레임워크
- **Prisma** - ORM
- **SQLite** - 데이터베이스
- **JWT** - 인증
- **bcryptjs** - 비밀번호 해싱

## 프로젝트 구조

```
test_health/
├── client/                 # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   │   └── Header.jsx
│   │   ├── context/       # React Context (전역 상태)
│   │   │   └── AuthContext.jsx
│   │   ├── pages/         # 페이지 컴포넌트
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── CollectionPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── server/                # 백엔드 (Express + Prisma)
    ├── prisma/
    │   ├── schema.prisma  # 데이터베이스 스키마
    │   └── seed.js        # 초기 데이터
    ├── authMiddleware.js  # JWT 인증 미들웨어
    ├── index.js           # Express 서버
    └── package.json
```

## 데이터베이스 스키마

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  xp        Int      @default(0)
  level     Int      @default(1)
  createdAt DateTime @default(now())
}

model Book {
  id     Int      @id @default(autoincrement())
  title  String
  author String
}

model Quest {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  xpReward    Int
  frequency   String   // "daily" | "weekly"
  bookId      Int
}

model UserQuest {
  id           Int      @id @default(autoincrement())
  userId       Int
  questId      Int
  completedAt  DateTime @default(now())
  streak       Int      @default(1)
}

model KnowledgeCard {
  id          Int      @id @default(autoincrement())
  term        String
  description String
  bookId      Int
}

model UserCard {
  id          Int      @id @default(autoincrement())
  userId      Int
  cardId      Int
  collectedAt DateTime @default(now())
}
```

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd test_health
```

### 2. 서버 설정

```bash
cd server
npm install

# 데이터베이스 초기화 및 시드 데이터 삽입
npm run seed

# 서버 실행 (http://localhost:3001)
npm start
```

### 3. 클라이언트 설정

```bash
cd client
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev
```

### 4. 브라우저에서 접속

```
http://localhost:5173
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 퀘스트
- `GET /api/quests/daily` - 일일 퀘스트 조회
- `POST /api/quests/:questId/complete` - 퀘스트 완료

### 대시보드
- `GET /api/dashboard` - 사용자 대시보드 데이터 조회

### AI 챗봇 & 컬렉션
- `POST /api/chat` - AI 챗봇 대화 (지식 카드 획득)
- `GET /api/collection` - 수집한 카드 목록 조회

## 주요 시드 데이터

### 도서
- 완전무결 식사법 (데이브 아스프리)

### 퀘스트
1. **방탄 커피 마시기** (일일, 50 XP)
2. **완전무결 식재료로 식사하기** (주간, 100 XP)

### 지식 카드
1. **인슐린 저항성** - 혈당 조절 관련 설명
2. **방탄 커피** - MCT 오일과 버터의 효능 설명

## 개발 가이드

### 환경 변수 (.env)

서버 디렉토리에 `.env` 파일이 자동 생성됩니다:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production_12345"
```

### 데이터베이스 재설정

```bash
cd server
rm -f prisma/dev.db
npm run seed
```

## 사용 방법

1. **회원가입/로그인**
   - `/register` 페이지에서 계정 생성
   - `/login` 페이지에서 로그인

2. **퀘스트 완료**
   - 홈 페이지에서 일일 퀘스트 확인
   - "완료" 버튼 클릭하여 XP 획득
   - 레벨업 알림 확인

3. **대시보드 확인**
   - 현재 레벨 및 XP 진행도 확인
   - 성장 아바타 변화 관찰
   - 획득한 배지 확인

4. **AI 챗봇 대화**
   - 채팅 페이지에서 건강 관련 질문
   - 키워드 입력 시 자동으로 지식 카드 수집
   - "퀴즈"라고 입력하면 퀴즈 모드 활성화

5. **컬렉션 확인**
   - 수집한 지식 카드 갤러리 보기
   - 컬렉터 등급 및 완성도 확인

## 라이선스

MIT License

## 기여

이슈 및 풀 리퀘스트를 환영합니다!

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
