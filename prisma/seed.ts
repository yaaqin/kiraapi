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
    description: 'Potongan yang disesuaikan dengan bentuk wajah.',
  },
  {
    name: 'Haircut Primary',
    price: 50000,
    duration: '30 min',
    category: Category.HAIRCUT,
    description: 'Potongan rapi untuk tampilan sehari-hari.',
  },
  {
    name: 'Haircut Anak',
    price: 40000,
    duration: '30 min',
    category: Category.HAIRCUT,
    description: 'Potongan nyaman untuk si kecil.',
  },
  {
    name: 'Bob Cut',
    price: 75000,
    duration: '45 min',
    category: Category.HAIRCUT,
    description: 'Bob modern dengan bentuk yang presisi.',
    isBestSeller: true,
  },
  {
    name: 'Layer Cut',
    price: 75000,
    duration: '45 min',
    category: Category.HAIRCUT,
    description: 'Layer untuk dimensi dan gerakan rambut.',
    isBestSeller: true,
  },
  {
    name: 'Butterfly Cut',
    price: 100000,
    duration: '60 min',
    category: Category.HAIRCUT,
    description: 'Layer bervolume dengan framing wajah.',
    isBestSeller: true,
  },
  {
    name: 'Wolf Cut',
    price: 100000,
    duration: '60 min',
    category: Category.HAIRCUT,
    description: 'Gaya bertekstur dengan karakter edgy.',
  },
  {
    name: 'Pixie Cut',
    price: 75000,
    duration: '45 min',
    category: Category.HAIRCUT,
    description: 'Potongan pendek yang chic dan praktis.',
  },
  {
    name: 'Curtain Bangs',
    price: 25000,
    duration: '15 min',
    category: Category.HAIRCUT,
    description: 'Poni yang membingkai wajah dengan lembut.',
  },
  {
    name: 'Rapikan Ujung Rambut',
    price: 35000,
    duration: '20 min',
    category: Category.HAIRCUT,
    description: 'Merapikan ujung rambut yang bercabang.',
  },

  {
    name: 'Basic Hair Coloring',
    price: 150000,
    duration: '90 min',
    category: Category.COLORING,
    description: 'Pewarnaan satu warna untuk tampilan segar.',
  },
  {
    name: 'Advanced Coloring',
    price: 250000,
    duration: '150 min',
    category: Category.COLORING,
    description: 'Pewarnaan dengan teknik dan dimensi lebih kaya.',
  },
  {
    name: 'Balayage / Highlight',
    price: 300000,
    duration: '180 min',
    category: Category.COLORING,
    description: 'Warna gradasi dengan hasil natural.',
    isBestSeller: true,
  },

  {
    name: 'Smoothing Keratin',
    price: 250000,
    duration: '120 min',
    category: Category.SMOOTHING,
    description: 'Rambut lebih lurus, halus, dan mudah diatur.',
    isBestSeller: true,
  },
  {
    name: 'Smoothing Silk Protein',
    price: 350000,
    duration: '150 min',
    category: Category.SMOOTHING,
    description: 'Smoothing dengan protein untuk kilau ekstra.',
  },

  {
    name: 'Deep Repair Creambath',
    price: 95000,
    duration: '75 min',
    category: Category.CREAMBATH,
    description: 'Perawatan intensif dan pijat kepala relaksasi.',
    isBestSeller: true,
  },
  {
    name: 'Hair Spa Ginseng',
    price: 85000,
    duration: '60 min',
    category: Category.CREAMBATH,
    description: 'Hair spa untuk menutrisi akar dan batang rambut.',
  },

  {
    name: 'Basic Blow Dry',
    price: 45000,
    duration: '30 min',
    category: Category.HAIRSTYLING,
    description: 'Blow rapi untuk tampilan lebih bervolume.',
  },
  {
    name: 'Straight Styling',
    price: 50000,
    duration: '30 min',
    category: Category.HAIRSTYLING,
    description: 'Catok lurus untuk hasil sleek.',
  },
  {
    name: 'Curl Styling',
    price: 70000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
    description: 'Curl bergelombang yang tahan seharian.',
  },
  {
    name: 'Korean Blow Up',
    price: 80000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
    description: 'Volume ala Korea dari akar rambut.',
  },
  {
    name: 'Loose Curls',
    price: 80000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
    description: 'Gelombang longgar yang effortless.',
  },
  {
    name: 'Beach Waves',
    price: 80000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
    description: 'Tekstur bergelombang santai ala pantai.',
  },
  {
    name: 'Ponytail Styling',
    price: 80000,
    duration: '45 min',
    category: Category.HAIRSTYLING,
    description: 'Ponytail rapi dan bervolume.',
  },
  {
    name: 'Formal Up Do',
    price: 150000,
    duration: '60 min',
    category: Category.HAIRSTYLING,
    description: 'Tatanan rambut untuk acara spesial.',
  },
  {
    name: 'Classic Braid',
    price: 50000,
    duration: '30 min',
    category: Category.HAIRSTYLING,
    description: 'Kepang klasik yang manis dan rapi.',
  },

  {
    name: 'Hair Wash / Keramas',
    price: 30000,
    duration: '15 min',
    category: Category.ADDONS,
    description: 'Keramas dan pengeringan rambut.',
  },
  {
    name: 'Hair Mask',
    price: 35000,
    duration: '30 min',
    category: Category.ADDONS,
    description: 'Masker untuk membantu kelembutan rambut.',
  },
  {
    name: 'Hair Tonic Extra',
    price: 25000,
    duration: '10 min',
    category: Category.ADDONS,
    description: 'Tonik tambahan untuk kulit kepala.',
  },
  {
    name: 'Hair Accessories',
    price: 15000,
    duration: null,
    category: Category.ADDONS,
    description: 'Aksesoris rambut pelengkap styling.',
  },
  {
    name: 'Hair Serum Application',
    price: 15000,
    duration: '5 min',
    category: Category.ADDONS,
    description: 'Serum penutup untuk kilau rambut.',
  },

  {
    name: 'Shampoo Salon 250ml',
    price: 85000,
    category: Category.RETAIL,
    imageUrl: img('photo-1535585209827-a15fcdbc4c2d'),
    description: 'Pembersih rambut untuk rutinitas homecare.',
    isBestSeller: true,
    subcategory: 'Shampoo',
  },
  {
    name: 'Conditioner Soft Touch',
    price: 80000,
    category: Category.RETAIL,
    imageUrl: img('photo-1526947425960-945c6e72858f'),
    description: 'Membantu rambut terasa lembut dan mudah diatur.',
    isBestSeller: true,
    subcategory: 'Conditioner',
  },
  {
    name: 'Hair Mask Pot 200g',
    price: 120000,
    category: Category.RETAIL,
    imageUrl: img('photo-1556228720-195a672e8a03'),
    description: 'Masker rambut untuk perawatan berkala.',
    isBestSeller: true,
    subcategory: 'Hair Mask',
  },
  {
    name: 'Pewarna Rambut DIY',
    price: 95000,
    category: Category.RETAIL,
    imageUrl: img('photo-1522337360788-8b13dee7a37e'),
    description: 'Pilihan warna untuk tampilan yang berbeda.',
    subcategory: 'Coloring',
  },
  {
    name: 'Vitamin Serum 50ml',
    price: 45000,
    category: Category.RETAIL,
    imageUrl: img('photo-1608248597261-e4d091a0c490'),
    description: 'Serum praktis untuk melengkapi perawatan rambut.',
    isBestSeller: true,
    subcategory: 'Serum',
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
    // Backfill the landing-page fields on items that predate them, matched by name.
    let filled = 0;
    for (const item of catalog) {
      const { count } = await prisma.catalogItem.updateMany({
        where: { name: item.name, description: null },
        data: {
          description: item.description,
          subcategory: item.subcategory,
          isBestSeller: item.isBestSeller,
        },
      });
      filled += count;
    }
    console.log(`Catalog already has items, backfilled ${filled} descriptions`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
