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
