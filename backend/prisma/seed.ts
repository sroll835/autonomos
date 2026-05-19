import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const hashed = await bcrypt.hash('Test1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@autonomos.co' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'test@autonomos.co',
      phone: '+573001234567',
      password: hashed,
      role: 'CONDUCTOR',
      isVerified: true,
    },
  });
  console.log('✅ Usuario demo:', user.email, '/ contraseña: Test1234');

  // Create providers
  const providerData = [
    { name: 'Taller El Maestro', serviceType: 'MECANICO', rating: 4.8, reviewCount: 124, pricePerHour: 80000, certifications: '["ASE Certified","Toyota Specialist"]', locationLat: 4.7110, locationLng: -74.0721 },
    { name: 'Grúas Rápidas 24/7', serviceType: 'GRUA', rating: 4.6, reviewCount: 89, pricePerHour: 120000, certifications: '["Operador Certificado"]', locationLat: 4.7200, locationLng: -74.0650 },
    { name: 'Ambulancias Vida', serviceType: 'AMBULANCIA', rating: 4.9, reviewCount: 56, certifications: '["Paramédico","BLS Certified"]', locationLat: 4.7050, locationLng: -74.0800 },
    { name: 'LogiCargo Express', serviceType: 'LOGISTICA', rating: 4.5, reviewCount: 203, pricePerHour: 65000, certifications: '["Transporte de carga"]', locationLat: 4.7300, locationLng: -74.0500 },
    { name: 'AutoService Premium', serviceType: 'MECANICO', rating: 4.7, reviewCount: 167, pricePerHour: 95000, certifications: '["BMW Specialist","Mercedes Specialist"]', locationLat: 4.6900, locationLng: -74.0900 },
  ];

  for (const data of providerData) {
    await prisma.provider.upsert({ where: { id: data.name }, update: {}, create: { id: data.name, ...data } }).catch(() =>
      prisma.provider.create({ data })
    );
  }
  console.log('✅ Proveedores creados');

  // Create products
  const products = [
    { name: 'Filtro de aceite Toyota', brand: 'Toyota', description: 'Filtro original para motores 1.8L-2.5L', price: 45000, discountPrice: 38000, category: 'Filtros', origin: 'IMPORTADO', stock: 50, rating: 4.5, images: '["https://via.placeholder.com/300x300?text=Filtro"]', vehicleBrand: 'Toyota' },
    { name: 'Pastillas de freno Brembo', brand: 'Brembo', description: 'Pastillas de alto rendimiento para discos ventilados', price: 180000, discountPrice: 152000, category: 'Frenos', origin: 'IMPORTADO', stock: 25, rating: 4.8, images: '["https://via.placeholder.com/300x300?text=Pastillas"]' },
    { name: 'Aceite Mobil 1 5W-30', brand: 'Mobil', description: 'Aceite sintético premium para motores modernos', price: 95000, category: 'Lubricantes', origin: 'IMPORTADO', stock: 100, rating: 4.7, images: '["https://via.placeholder.com/300x300?text=Aceite"]' },
    { name: 'Batería Willard 60Ah', brand: 'Willard', description: 'Batería libre de mantenimiento 12V 60Ah', price: 320000, discountPrice: 289000, category: 'Eléctrico', origin: 'NACIONAL', stock: 15, rating: 4.4, images: '["https://via.placeholder.com/300x300?text=Bateria"]' },
    { name: 'Kit de embrague LUK', brand: 'LUK', description: 'Kit completo disco, plato y rodamiento', price: 580000, category: 'Transmisión', origin: 'IMPORTADO', stock: 8, rating: 4.6, images: '["https://via.placeholder.com/300x300?text=Embrague"]' },
    { name: 'Amortiguadores Monroe', brand: 'Monroe', description: 'Par de amortiguadores delanteros gas-presión', price: 420000, discountPrice: 378000, category: 'Suspensión', origin: 'IMPORTADO', stock: 20, rating: 4.5, images: '["https://via.placeholder.com/300x300?text=Amortiguadores"]' },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product }).catch(() => {});
  }
  console.log('✅ Productos creados');

  console.log('\n🎉 Seed completado!');
  console.log('📧 Login: test@autonomos.co');
  console.log('🔑 Password: Test1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());
