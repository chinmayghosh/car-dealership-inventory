import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

/**
 * Seeds the database with:
 *  - one ADMIN account (the only way to get an admin; registration always creates USERs)
 *  - one regular demo USER
 *  - a sample inventory, including sold-out cars to demo the disabled Purchase button.
 * Safe to re-run: users are upserted and vehicles are only inserted into an empty table.
 */
const prisma = new PrismaClient();

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const vehicles = [
  { make: 'Toyota', model: 'Camry XSE', category: 'Sedan', year: 2023, price: 29500, quantity: 8, color: 'Celestial Grey', imageUrl: img('1621007947382-bb3c3994e3fb'), description: 'Sporty mid-size sedan with a 2.5L hybrid-ready engine and a refined, quiet cabin.' },
  { make: 'Hyundai', model: 'Verna', category: 'Sedan', year: 2023, price: 15800, quantity: 12, color: 'Phantom Black', imageUrl: img('1619767886558-efdc259cde1a'), description: 'Efficient, feature-packed city sedan with ventilated seats and a large touchscreen.' },
  { make: 'Porsche', model: 'Panamera 4', category: 'Sedan', year: 2022, price: 102000, quantity: 2, color: 'Jet Black', imageUrl: img('1503376780353-7e6692767b70'), description: 'Four-door sports car: all-wheel drive, adaptive air suspension and a luxurious interior.' },
  { make: 'Tesla', model: 'Model 3', category: 'EV', year: 2024, price: 40990, quantity: 6, color: 'Pearl White', imageUrl: img('1560958089-b8a1929cea89'), description: 'Long-range all-electric sedan with Autopilot and over-the-air updates.' },
  { make: 'Tesla', model: 'Roadster', category: 'EV', year: 2025, price: 200000, quantity: 0, color: 'Pearl White', imageUrl: img('1617788138017-80ad40651399'), description: 'Electric hypercar with a removable glass roof. Currently sold out.' },
  { make: 'Ford', model: 'Expedition', category: 'SUV', year: 2023, price: 58000, quantity: 4, color: 'Oxford White', imageUrl: img('1533473359331-0135ef1b58bf'), description: 'Full-size, three-row SUV with seating for eight and serious towing capacity.' },
  { make: 'Nissan', model: 'Juke', category: 'SUV', year: 2023, price: 24500, quantity: 7, color: 'Gun Metallic', imageUrl: img('1609521263047-f8f205293f24'), description: 'Compact crossover with bold styling, ideal for city driving.' },
  { make: 'Toyota', model: 'Tacoma TRD', category: 'Truck', year: 2022, price: 38900, quantity: 3, color: 'Quicksand', imageUrl: img('1559416523-140ddc3d238c'), description: 'Off-road ready mid-size pickup with crawl control and a locking rear differential.' },
  { make: 'Ford', model: 'Mustang GT', category: 'Coupe', year: 2022, price: 44000, quantity: 3, color: 'Shadow Black', imageUrl: img('1494976388531-d1058494cdd8'), description: 'Iconic 5.0L V8 muscle car with a 6-speed manual option.' },
  { make: 'Chevrolet', model: 'Camaro SS', category: 'Coupe', year: 2023, price: 42500, quantity: 0, color: 'Riverside Blue', imageUrl: img('1552519507-da3b142c6e3d'), description: '455 hp V8 coupe with Brembo brakes. Currently sold out.' },
  { make: 'BMW', model: 'M4 Competition', category: 'Coupe', year: 2023, price: 78600, quantity: 2, color: 'Fire Orange', imageUrl: img('1549399542-7e3f8b79c341'), description: 'Twin-turbo inline-six performance coupe with track-tuned M suspension.' },
  { make: 'BMW', model: '430i Coupe', category: 'Coupe', year: 2021, price: 46000, quantity: 5, color: 'Estoril Blue', imageUrl: img('1502877338535-766e1452684a'), description: 'Elegant two-door grand tourer with a smooth turbocharged four-cylinder.' },
  { make: 'Lamborghini', model: 'Huracán EVO', category: 'Coupe', year: 2022, price: 261000, quantity: 1, color: 'Giallo Orion', imageUrl: img('1511919884226-fd3cad34687c'), description: 'Naturally aspirated V10 supercar with rear-wheel steering.' },
  { make: 'Lamborghini', model: 'Aventador S', category: 'Coupe', year: 2021, price: 417000, quantity: 1, color: 'Arancio Argos', imageUrl: img('1525609004556-c46c7d6cf023'), description: '740 hp V12 flagship with scissor doors.' },
  { make: 'Ferrari', model: 'LaFerrari', category: 'Coupe', year: 2016, price: 3500000, quantity: 1, color: 'Rosso Corsa', imageUrl: img('1583121274602-3e2820c69888'), description: 'Limited-production V12 hybrid hypercar. A collector piece.' },
  { make: 'Bugatti', model: 'Chiron', category: 'Coupe', year: 2021, price: 3000000, quantity: 1, color: 'Glacier White', imageUrl: img('1544636331-e26879cd4d9b'), description: 'Quad-turbo W16 hypercar with 1,500 hp.' },
];

async function upsertUser(name: string, email: string, password: string, role: 'USER' | 'ADMIN') {
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role },
    create: { name, email, passwordHash, role },
  });
}

async function main() {
  await upsertUser(
    'Dealership Admin',
    process.env.ADMIN_EMAIL ?? 'admin@dealership.com',
    process.env.ADMIN_PASSWORD ?? 'Admin@123',
    'ADMIN',
  );
  await upsertUser('Demo Customer', 'user@dealership.com', 'User@123', 'USER');

  if ((await prisma.vehicle.count()) === 0) {
    await prisma.vehicle.createMany({ data: vehicles });
  }

  console.log(`Seed complete: ${await prisma.user.count()} users, ${await prisma.vehicle.count()} vehicles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
