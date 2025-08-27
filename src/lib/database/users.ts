import { prisma } from './client'
import type { CreateUserInput, UpdateUserInput, VerifyUserInput } from './schema'

export class UserService {
  static async createUser(data: CreateUserInput) {
    return await prisma.user.create({
      data: {
        phone: data.phone,
        name: data.name,
        avatar: data.avatar,
      },
    })
  }

  static async getUserByPhone(phone: string) {
    return await prisma.user.findUnique({
      where: { phone },
      include: {
        createdActivities: true,
        activityResponses: {
          include: {
            activity: true,
          },
        },
        sentFriendships: {
          include: {
            receiver: true,
          },
        },
        receivedFriendships: {
          include: {
            sender: true,
          },
        },
      },
    })
  }

  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        createdActivities: true,
        activityResponses: {
          include: {
            activity: true,
          },
        },
        sentFriendships: {
          include: {
            receiver: true,
          },
        },
        receivedFriendships: {
          include: {
            sender: true,
          },
        },
      },
    })
  }

  static async updateUser(id: string, data: UpdateUserInput) {
    return await prisma.user.update({
      where: { id },
      data,
    })
  }

  static async setVerificationCode(phone: string, code: string) {
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    
    return await prisma.user.upsert({
      where: { phone },
      update: {
        verificationCode: code,
        verificationExpiry: expiryTime,
      },
      create: {
        phone,
        verificationCode: code,
        verificationExpiry: expiryTime,
      },
    })
  }

  static async verifyUser(data: VerifyUserInput) {
    const user = await prisma.user.findUnique({
      where: { phone: data.phone },
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.verificationCode !== data.verificationCode) {
      throw new Error('Invalid verification code')
    }

    if (!user.verificationExpiry || user.verificationExpiry < new Date()) {
      throw new Error('Verification code has expired')
    }

    return await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpiry: null,
      },
    })
  }

  static async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
    })

    return friendships.map((friendship) =>
      friendship.senderId === userId ? friendship.receiver : friendship.sender
    )
  }

  static async getPreviousConnections(userId: string) {
    const connections = await prisma.previousConnection.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: true,
        user2: true,
      },
    })

    return connections.map((connection) =>
      connection.user1Id === userId ? connection.user2 : connection.user1
    )
  }
}