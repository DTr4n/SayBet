import { prisma } from './client'

export class StatusUpdateService {
  static async createStatusUpdate(userId: string, status: string, message?: string) {
    // Create the status update record
    const statusUpdate = await prisma.statusUpdate.create({
      data: {
        userId,
        status,
        message,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    // Update the user's current availability status
    await prisma.user.update({
      where: { id: userId },
      data: { availabilityStatus: status },
    })

    return statusUpdate
  }

  static async getRecentStatusUpdates(userId: string, limit: number = 20) {
    return await prisma.statusUpdate.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  }

  static async getFriendsStatusUpdates(userId: string, limit: number = 50) {
    // Get user's friends
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' },
        ],
      },
    })

    const friendIds = friends.map(f => 
      f.senderId === userId ? f.receiverId : f.senderId
    )

    if (friendIds.length === 0) {
      return []
    }

    // Get recent status updates from friends
    return await prisma.statusUpdate.findMany({
      where: {
        userId: { in: friendIds },
        // Only show updates from last 24 hours
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            availabilityStatus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  }

  static async getFriendsCurrentStatus(userId: string) {
    // Get user's friends
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' },
        ],
      },
    })

    const friendIds = friends.map(f => 
      f.senderId === userId ? f.receiverId : f.senderId
    )

    if (friendIds.length === 0) {
      return []
    }

    // Get current status of all friends
    const friendsWithStatus = await prisma.user.findMany({
      where: {
        id: { in: friendIds },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        availabilityStatus: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Get the most recent status update for each friend (for custom messages)
    const recentStatusUpdates = await prisma.statusUpdate.findMany({
      where: {
        userId: { in: friendIds },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Create a map of most recent status messages
    const statusMessages: { [userId: string]: string } = {}
    recentStatusUpdates.forEach(update => {
      if (!statusMessages[update.userId] && update.message) {
        statusMessages[update.userId] = update.message
      }
    })

    // Combine friends with their status messages
    return friendsWithStatus.map(friend => ({
      ...friend,
      statusMessage: statusMessages[friend.id] || null,
    }))
  }
}