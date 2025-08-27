import { prisma } from './client'
import type { CreateFriendshipInput, UpdateFriendshipInput } from './schema'

export class FriendshipService {
  static async sendFriendRequest(senderId: string, data: CreateFriendshipInput) {
    // Find the receiver by phone
    const receiver = await prisma.user.findUnique({
      where: { phone: data.receiverPhone },
    })

    if (!receiver) {
      throw new Error('User not found with this phone number')
    }

    if (receiver.id === senderId) {
      throw new Error('Cannot send friend request to yourself')
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: senderId },
        ],
      },
    })

    if (existingFriendship) {
      throw new Error('Friendship already exists')
    }

    return await prisma.friendship.create({
      data: {
        senderId,
        receiverId: receiver.id,
        status: 'pending',
      },
      include: {
        sender: true,
        receiver: true,
      },
    })
  }

  static async respondToFriendRequest(friendshipId: string, userId: string, data: UpdateFriendshipInput) {
    // Verify the user is the receiver
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    })

    if (!friendship || friendship.receiverId !== userId) {
      throw new Error('Friend request not found or unauthorized')
    }

    return await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: data.status },
      include: {
        sender: true,
        receiver: true,
      },
    })
  }

  static async getFriendRequests(userId: string) {
    return await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'pending',
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  static async getSentFriendRequests(userId: string) {
    return await prisma.friendship.findMany({
      where: {
        senderId: userId,
        status: 'pending',
      },
      include: {
        receiver: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  static async removeFriend(friendshipId: string, userId: string) {
    // Verify the user is part of the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    })

    if (!friendship || (friendship.senderId !== userId && friendship.receiverId !== userId)) {
      throw new Error('Friendship not found or unauthorized')
    }

    return await prisma.friendship.delete({
      where: { id: friendshipId },
    })
  }

  static async getFriendshipStatus(userId1: string, userId2: string) {
    return await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
    })
  }

  static async createPreviousConnection(userId1: string, userId2: string, activityId?: string) {
    // Ensure user1Id is always the smaller ID for consistency
    const [user1Id, user2Id] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]

    return await prisma.previousConnection.upsert({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
      update: {
        activityId: activityId || undefined,
      },
      create: {
        user1Id,
        user2Id,
        activityId: activityId || undefined,
      },
    })
  }
}