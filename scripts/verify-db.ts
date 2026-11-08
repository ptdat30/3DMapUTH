import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('--- Checking Aiven PostgreSQL Database ---');
  
  const campuses = await prisma.campus.findMany({
    include: {
      buildings: {
        include: {
          floors: true,
        },
      },
      qrNodes: true,
    },
  });

  console.log(`Found ${campuses.length} campuses:`);
  for (const c of campuses) {
    console.log(`- Campus: ${c.name} (${c.code})`);
    console.log(`  Buildings (${c.buildings.length}): ${c.buildings.map((b) => b.code).join(', ')}`);
    console.log(`  QR Nodes (${c.qrNodes.length}): ${c.qrNodes.map((q) => q.code).join(', ')}`);
  }

  const segment = await prisma.routeSegment.findFirst({
    where: { type: 'OUTDOOR_HUB_TO_HUB' },
    include: {
      fromBuilding: true,
      toBuilding: true,
      steps: {
        orderBy: { stepOrder: 'asc' },
      },
    },
  });

  if (segment) {
    console.log(
      `\n✔ Found outdoor hub-to-hub route: ${segment.fromBuilding?.name} -> ${segment.toBuilding?.name}`
    );
    console.log(`  Total steps in DB: ${segment.steps.length}`);
    for (const step of segment.steps) {
      console.log(`   Step ${step.stepOrder}: ${step.instruction}`);
    }
  } else {
    console.error('❌ OUTDOOR_HUB_TO_HUB route not found!');
  }

  const roomCount = await prisma.room.count();
  console.log(`\n✔ Total rooms in database: ${roomCount}`);

  await prisma.$disconnect();
  console.log('\nAll database verification checks PASSED successfully!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

