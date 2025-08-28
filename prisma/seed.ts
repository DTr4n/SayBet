import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.activityResponse.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.friendship.deleteMany()
  await prisma.previousConnection.deleteMany()
  await prisma.user.deleteMany()

  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'cmeui1jgv0003ro4if40284zp', // Fixed ID for development user  
        phone: '+1234567890',
        name: 'Alice Johnson',
        isVerified: true,
        availabilityStatus: 'available'
      }
    }),
    prisma.user.create({
      data: {
        phone: '+1234567891',
        name: 'Bob Smith',
        isVerified: true,
        availabilityStatus: 'available'
      }
    }),
    prisma.user.create({
      data: {
        phone: '+1234567892',
        name: 'Charlie Brown',
        isVerified: true,
        availabilityStatus: 'busy'
      }
    }),
    prisma.user.create({
      data: {
        phone: '+1234567893',
        name: 'Diana Prince',
        isVerified: true,
        availabilityStatus: 'available'
      }
    })
  ])

  console.log('Created users:', users.map(u => u.name))

  // Create friendships
  const friendships = await Promise.all([
    prisma.friendship.create({
      data: {
        senderId: users[0].id,
        receiverId: users[1].id,
        status: 'accepted'
      }
    }),
    prisma.friendship.create({
      data: {
        senderId: users[0].id,
        receiverId: users[2].id,
        status: 'accepted'
      }
    }),
    prisma.friendship.create({
      data: {
        senderId: users[1].id,
        receiverId: users[3].id,
        status: 'pending'
      }
    })
  ])

  console.log('Created friendships:', friendships.length)

  // Create test activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        title: 'Coffee Meetup',
        description: 'Quick coffee at the local café',
        location: 'Blue Bottle Coffee',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '2:00 PM',
        category: 'spontaneous',
        visibility: 'friends',
        maxParticipants: 4,
        creatorId: users[0].id
      }
    }),
    prisma.activity.create({
      data: {
        title: 'Weekend Hiking',
        description: 'Explore the mountain trails',
        location: 'Mount Tamalpais',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: '9:00 AM',
        category: 'planned',
        visibility: 'open',
        maxParticipants: 8,
        creatorId: users[1].id
      }
    }),
    prisma.activity.create({
      data: {
        title: 'Board Game Night',
        description: 'Casual board game session at my place',
        location: '123 Main St',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        time: '7:00 PM',
        category: 'planned',
        visibility: 'friends',
        maxParticipants: 6,
        creatorId: users[2].id
      }
    }),
    prisma.activity.create({
      data: {
        title: 'Lunch Now?',
        description: 'Anyone free for lunch right now?',
        location: 'Food court downtown',
        category: 'spontaneous',
        visibility: 'previous',
        maxParticipants: 3,
        creatorId: users[3].id
      }
    }),
    // Past activity for Alice (Danny) 
    prisma.activity.create({
      data: {
        title: 'Beach Volleyball Last Weekend',
        description: 'Great weather for volleyball at the beach!',
        location: 'Santa Monica Beach',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        time: '10:00 AM',
        category: 'planned',
        visibility: 'open',
        maxParticipants: 8,
        creatorId: users[0].id // Alice (development user)
      }
    })
  ])

  console.log('Created activities:', activities.map(a => a.title))

  // Create activity responses
  const responses = await Promise.all([
    prisma.activityResponse.create({
      data: {
        userId: users[1].id,
        activityId: activities[0].id,
        response: 'in'
      }
    }),
    prisma.activityResponse.create({
      data: {
        userId: users[2].id,
        activityId: activities[0].id,
        response: 'maybe'
      }
    }),
    prisma.activityResponse.create({
      data: {
        userId: users[0].id,
        activityId: activities[1].id,
        response: 'in'
      }
    }),
    prisma.activityResponse.create({
      data: {
        userId: users[3].id,
        activityId: activities[2].id,
        response: 'in'
      }
    }),
    // Responses to past beach volleyball activity
    prisma.activityResponse.create({
      data: {
        userId: users[1].id, // Bob
        activityId: activities[4].id, // Beach volleyball
        response: 'in'
      }
    }),
    prisma.activityResponse.create({
      data: {
        userId: users[2].id, // Charlie
        activityId: activities[4].id, // Beach volleyball  
        response: 'in'
      }
    })
  ])

  console.log('Created activity responses:', responses.length)

  // Create previous connections
  const connections = await Promise.all([
    prisma.previousConnection.create({
      data: {
        user1Id: users[0].id,
        user2Id: users[1].id,
        activityId: activities[0].id
      }
    }),
    prisma.previousConnection.create({
      data: {
        user1Id: users[0].id,
        user2Id: users[3].id
      }
    })
  ])

  console.log('Created previous connections:', connections.length)

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })