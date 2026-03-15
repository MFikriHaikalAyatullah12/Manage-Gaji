import { PrismaClient } from '@prisma/client/index'

const prisma = new PrismaClient()

const defaultCategories = [
  // Makanan Pokok - Sub kategori
  { name: 'Beras', icon: '🍚', color: '#f59e0b', isDefault: true },
  { name: 'Lauk', icon: '🍖', color: '#ef4444', isDefault: true },
  { name: 'Bumbu Dapur', icon: '🧄', color: '#f97316', isDefault: true },
  // Kategori lainnya
  { name: 'Kebersihan', icon: '🧹', color: '#06b6d4', isDefault: true },
  { name: 'Skincare', icon: '🧴', color: '#ec4899', isDefault: true },
  { name: 'Jajan', icon: '🍿', color: '#8b5cf6', isDefault: true },
  { name: 'Pulsa/Token', icon: '📱', color: '#3b82f6', isDefault: true },
  { name: 'Lainnya/Mendadak', icon: '⚡', color: '#6b7280', isDefault: true },
]

async function main() {
  console.log('Seeding database...')

  // Create default categories
  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name, isDefault: true }
    })
    
    if (!existing) {
      await prisma.category.create({
        data: {
          name: category.name,
          icon: category.icon,
          color: category.color,
          isDefault: category.isDefault,
        },
      })
    }
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
