import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const alpha = await prisma.base.upsert({
    where: { code: "ALPHA" },
    update: {},
    create: { name: "Fort Alpha", code: "ALPHA", location: "Northern Command" },
  });
  const bravo = await prisma.base.upsert({
    where: { code: "BRAVO" },
    update: {},
    create: { name: "Fort Bravo", code: "BRAVO", location: "Central Command" },
  });
  const charlie = await prisma.base.upsert({
    where: { code: "CHARLIE" },
    update: {},
    create: { name: "Fort Charlie", code: "CHARLIE", location: "Southern Command" },
  });

  const equipment = [
    { name: "M4 Carbine", category: "Weapons", description: "Standard infantry rifle" },
    { name: "5.56mm Ammunition", category: "Ammunition", description: "Rifle ammunition (rounds)" },
    { name: "Humvee", category: "Vehicles", description: "Light utility vehicle" },
    { name: "Field Radio", category: "Communications", description: "Portable tactical radio" },
    { name: "Body Armor", category: "Protective Gear", description: "Ballistic vest" },
  ];

  const types = [];
  for (const item of equipment) {
    const record = await prisma.equipmentType.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
    types.push(record);
  }

  await prisma.user.upsert({
    where: { email: "admin@mams.mil" },
    update: {},
    create: {
      email: "admin@mams.mil",
      passwordHash,
      name: "System Administrator",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "commander.alpha@mams.mil" },
    update: {},
    create: {
      email: "commander.alpha@mams.mil",
      passwordHash,
      name: "Cmdr. Hale",
      role: "BASE_COMMANDER",
      baseId: alpha.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "logistics.alpha@mams.mil" },
    update: {},
    create: {
      email: "logistics.alpha@mams.mil",
      passwordHash,
      name: "Lt. Ortega",
      role: "LOGISTICS_OFFICER",
      baseId: alpha.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "commander.bravo@mams.mil" },
    update: {},
    create: {
      email: "commander.bravo@mams.mil",
      passwordHash,
      name: "Cmdr. Singh",
      role: "BASE_COMMANDER",
      baseId: bravo.id,
    },
  });

  console.log("Seed complete.");
  console.log("Demo logins (password: Password123!):");
  console.log("  admin@mams.mil");
  console.log("  commander.alpha@mams.mil");
  console.log("  logistics.alpha@mams.mil");
  console.log("  commander.bravo@mams.mil");
  console.log(`Bases: ${alpha.code}, ${bravo.code}, ${charlie.code}`);
  console.log(`Equipment types: ${types.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
