const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Book
  const book = await prisma.book.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: '최강의 식사'
    }
  });

  console.log(`Created book: ${book.title}`);

  // Create Quest 1: Daily - 방탄 커피 마시기
  const quest1 = await prisma.quest.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: '방탄 커피 마시기',
      description: '아침에 방탄 커피를 만들어 마셔보세요. MCT 오일과 그래스페드 버터를 넣은 완벽한 에너지 부스터입니다.',
      type: 'DAILY',
      xp: 50,
      bookId: book.id
    }
  });

  console.log(`Created quest: ${quest1.title} (${quest1.type}, ${quest1.xp}XP)`);

  // Create Quest 2: Weekly - '완전무결' 식재료 3종 구매
  const quest2 = await prisma.quest.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: '완전무결 식재료 3종 구매',
      description: '그래스페드 버터, MCT 오일, 유기농 커피 등 완전무결한 식재료 3종을 구매하세요.',
      type: 'WEEKLY',
      xp: 200,
      bookId: book.id
    }
  });

  console.log(`Created quest: ${quest2.title} (${quest2.type}, ${quest2.xp}XP)`);

  // Create KnowledgeCard 1: 인슐린 저항성
  const card1 = await prisma.knowledgeCard.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      term: '인슐린 저항성',
      description: '인슐린 저항성은 세포가 인슐린에 제대로 반응하지 않아 혈당 조절이 어려워지는 상태입니다. 이는 체중 증가, 만성 피로, 그리고 제2형 당뇨병의 위험을 높입니다. 건강한 지방 섭취와 간헐적 단식이 인슐린 저항성 개선에 도움이 됩니다.',
      bookId: book.id
    }
  });

  console.log(`Created knowledge card: ${card1.term}`);

  // Create KnowledgeCard 2: 방탄 커피
  const card2 = await prisma.knowledgeCard.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      term: '방탄 커피',
      description: '방탄 커피는 고품질 커피에 그래스페드 버터와 MCT 오일을 혼합한 음료입니다. 아침 에너지 부스팅과 인지 기능 향상에 도움이 되며, 케톤 생성을 촉진하여 지방 연소를 돕습니다. 포만감이 오래 지속되어 간헐적 단식에도 유용합니다.',
      bookId: book.id
    }
  });

  console.log(`Created knowledge card: ${card2.term}`);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
