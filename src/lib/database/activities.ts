import { prisma } from './client'
import type { CreateActivityInput, UpdateActivityInput, CreateActivityResponseInput } from './schema'

export class ActivityService {
  static async createActivity(creatorId: string, data: CreateActivityInput) {
    return await prisma.activity.create({
      data: {
        ...data,
        creatorId,
      },
      include: {
        creator: true,
        responses: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  static async getActivityById(id: string) {
    return await prisma.activity.findUnique({
      where: { id },
      include: {
        creator: true,
        responses: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  static async getActivitiesForUser(userId: string) {
    // Get user's friends
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' },
        ],
      },
    })

    const friendIds = friends.map((f) => (f.senderId === userId ? f.receiverId : f.senderId))

    // Get previous connections
    const connections = await prisma.previousConnection.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
    })

    const connectionIds = connections.map((c) => (c.user1Id === userId ? c.user2Id : c.user1Id))

    return await prisma.activity.findMany({
      where: {
        OR: [
          // User's own activities
          { creatorId: userId },
          // Open activities
          { visibility: 'open' },
          // Friends' activities if visibility is 'friends' or 'open'
          {
            AND: [
              { creatorId: { in: friendIds } },
              { visibility: { in: ['friends', 'open'] } },
            ],
          },
          // Previous connections' activities if visibility is 'previous' or 'open'
          {
            AND: [
              { creatorId: { in: connectionIds } },
              { visibility: { in: ['previous', 'open'] } },
            ],
          },
        ],
      },
      include: {
        creator: true,
        responses: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  static async updateActivity(id: string, userId: string, data: UpdateActivityInput) {
    // Verify the user is the creator
    const activity = await prisma.activity.findUnique({
      where: { id },
    })

    if (!activity || activity.creatorId !== userId) {
      throw new Error('Activity not found or unauthorized')
    }

    return await prisma.activity.update({
      where: { id },
      data,
      include: {
        creator: true,
        responses: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  static async deleteActivity(id: string, userId: string) {
    // Verify the user is the creator
    const activity = await prisma.activity.findUnique({
      where: { id },
    })

    if (!activity || activity.creatorId !== userId) {
      throw new Error('Activity not found or unauthorized')
    }

    return await prisma.activity.delete({
      where: { id },
    })
  }

  static async respondToActivity(userId: string, data: CreateActivityResponseInput) {
    return await prisma.activityResponse.upsert({
      where: {
        userId_activityId: {
          userId,
          activityId: data.activityId,
        },
      },
      update: {
        response: data.response,
      },
      create: {
        userId,
        activityId: data.activityId,
        response: data.response,
      },
      include: {
        user: true,
        activity: true,
      },
    })
  }

  static async removeActivityResponse(userId: string, activityId: string) {
    return await prisma.activityResponse.deleteMany({
      where: {
        userId,
        activityId,
      },
    })
  }

  static async getActivityResponses(activityId: string) {
    return await prisma.activityResponse.findMany({
      where: { activityId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
}