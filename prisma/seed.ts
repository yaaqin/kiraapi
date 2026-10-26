import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Category,
  PrismaClient,
  Role,
  type Prisma,
} from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;

const catalog: Prisma.CatalogItemCreateManyInput[] = [
  {
    name: 'Haircut Wanita',
    price: 75000,
    duration: '45 min',
    category: Category.HAIRCUT,
  },
  {
    name: 'Haircut Primary',
    price: 50000,
    duration: '30 min',
    category: Category.HAIRCUT,
  },
  {
    name: 'Haircut Anak',
    price: 40000,
    duration: '30 min',
    category: Category.HAIRCUT,
  },
  {
    name: 'Bob Cut',
    price: 75000,
    duration: '45 min',
    category: Category.HAIRCUT,
  },
  {
    name: 'Layer Cut',
    price: 75000,
    duration: '45 min',
    category: Category.HAIRCUT,
  },
  {
    name: 'Butterfly Cut',
    price: 100000,
    duration: '60 min',
    category: Category.HAIRCUT,
  },
  {
    name: 'Wolf Cut',
    price: 100000,
    duration: '60 min',
    category: Category.HAIRCUT,
  },
  {
    name: 'Pixie Cut',
    price: 75000,
    duration: '45 min',
    category: Category.HAIRCUT,
  },
  {
    name: 'Curtain Bangs',
    price: 25000,
    duration: '15 min',
    category: Category.HAIRCUT,
  },
  {
    name: 'Rapikan Ujung Rambut',
    price: 35000,
    duration: '20 min',
    category: Category.HAIRCUT,
  },

  {
    name: 'Basic Hair Coloring',
    price: 150000,
    duration: '90 min',
    category: Category.COLORING,
  },
  {
    name: 'Advanced Coloring',
    price: 250000,
    duration: '150 min',
    category: Category.COLORING,
  },
  {
    name: 'Balayage / Highlight',
    price: 300000,
    duration: '180 min',
    category: Category.COLORING,
  },

  {
    name: 'Smoothing Keratin',
    price: 250000,
    duration: '120 min',
    category: Category.SMOOTHING,
  },
  {
    name: 'Smoothing Silk Protein',
    price: 350000,
    duration: '150 min',
    category: Category.SMOOTHING,
  },

  {
    name: 'Deep Repair Creambath',
    price: 95000,
    duration: '75 min',
    category: Category.CREAMBATH,
  },
  {
    name: 'Hair Spa Ginseng',
    price: 85000,
    duration: '60 min',
    category: Category.CREAMBATH,
  },

  {
    name: 'Basic Blow Dry',
    price: 45000,
    duration: '30 min',
    category: Category.HAIRSTYLING,
  },
  {
    name: 'Straight Styling',
    price: 50000,
    duration: '30 min',
    category: Category.HAIRSTYLING,
  },
  {
    name: 'Curl Styling',
    price: 70000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
  },
  {
    name: 'Korean Blow Up',
    price: 80000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
  },
  {
    name: 'Loose Curls',
    price: 80000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
  },
  {
    name: 'Beach Waves',
    price: 80000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
  },
  {
    name: 'Ponytail Styling',
    price: 80000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
  },
  {
    name: 'Formal Up Do',
    price: 150000,
    duration: '60 min',
    category: Category.HAIRSTYLING,
  },
  {
    name: 'Classic Braid',
    price: 50000,
    duration: '30 min',
    category: Category.HAIRSTYLING,
  },

  {
    name: 'Hair Wash / Keramas',
    price: 30000,
    duration: '15 min',
    category: Category.ADDONS,
  },
  {
    name: 'Hair Mask',
    price: 35000,
    duration: '30 min',
    category: Category.ADDONS,
  },
  {
    name: 'Hair Tonic Extra',
    price: 25000,
    duration: '10 min',
    category: Category.ADDONS,
  },
  {
    name: 'Hair Accessories',
    price: 15000,
    duration: null,
    category: Category.ADDONS,
  },
  {
    name: 'Hair Serum Application',
    price: 15000,
    duration: '5 min',
    category: Category.ADDONS,
  },

  {
    name: 'Shampoo Salon 250ml',
    price: 85000,
    category: Category.RETAIL,
    imageUrl: img('photo-1535585209827-a15fcdbc4c2d'),
  },
  {
    name: 'Conditioner Soft Touch',
    price: 80000,
    category: Category.RETAIL,
    imageUrl: img('photo-1526947425960-945c6e72858f'),
  },
  {
    name: 'Hair Mask Pot 200g',
    price: 120000,
    category: Category.RETAIL,
    imageUrl: img('photo-1556228720-195a672e8a03'),
  },
  {
    name: 'Pewarna Rambut DIY',
    price: 95000,
    category: Category.RETAIL,
    imageUrl: img('photo-1522337360788-8b13dee7a37e'),
  },
  {
    name: 'Vitamin Serum 50ml',
    price: 45000,
    category: Category.RETAIL,
    imageUrl: img('photo-1608248597261-e4d091a0c490'),
  },
];

async function main() {
  const email =
    process.env.SEED_SUPERADMIN_EMAIL ?? 'superadmin@styleonmotion.com';
  const password = process.env.SEED_SUPERADMIN_PASSWORD ?? 'superadmin123';
  const name = process.env.SEED_SUPERADMIN_NAME ?? 'Super Admin';

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      role: Role.SUPERADMIN,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  console.log(`Superadmin ready: ${admin.email}`);

  // Only seed the catalog into an empty table so admin edits are never overwritten.
  if ((await prisma.catalogItem.count()) === 0) {
    const { count } = await prisma.catalogItem.createMany({ data: catalog });
    console.log(`Seeded ${count} catalog items`);
  } else {
    console.log('Catalog already has items, skipping');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
