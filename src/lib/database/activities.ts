import { prisma } from './client'
import { FriendshipService } from './friendships'
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

  static async getActivitiesForUser(userId: string, filters?: {
    category?: string | null
    visibility?: string | null
    creatorType?: string | null
    participationStatus?: string | null
  }) {
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

    // Build base visibility filter
    let visibilityConditions: any[] = []
    
    // Apply creator type filter
    if (filters?.creatorType === 'me') {
      visibilityConditions.push({ creatorId: userId })
    } else if (filters?.creatorType === 'friends') {
      visibilityConditions.push({
        AND: [
          { creatorId: { in: friendIds } },
          { visibility: { in: ['friends', 'open'] } },
        ],
      })
    } else if (filters?.creatorType === 'connections') {
      visibilityConditions.push({
        AND: [
          { creatorId: { in: connectionIds } },
          { visibility: { in: ['previous', 'open'] } },
        ],
      })
    } else {
      // Default: all accessible activities
      visibilityConditions = [
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
      ]
    }

    // Build additional filters
    const additionalFilters: any = {}
    
    if (filters?.category) {
      additionalFilters.category = filters.category
    }
    
    if (filters?.visibility) {
      additionalFilters.visibility = filters.visibility
    }

    // Get activities with base visibility and additional filters
    let activities = await prisma.activity.findMany({
      where: {
        OR: visibilityConditions,
        ...additionalFilters,
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

    // Apply participation status filter (post-query since it's complex)
    if (filters?.participationStatus === 'participating') {
      activities = activities.filter(activity => 
        activity.creatorId === userId || 
        activity.responses.some(response => response.userId === userId && response.response === 'in')
      )
    } else if (filters?.participationStatus === 'not_participating') {
      activities = activities.filter(activity => 
        activity.creatorId !== userId && 
        !activity.responses.some(response => response.userId === userId && response.response === 'in')
      )
    }

    return activities
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
    const response = await prisma.activityResponse.upsert({
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

    // Only create previous connections for "in" responses (actual participation)
    if (data.response === 'in') {
      await this.createPreviousConnectionsForActivity(data.activityId, userId)
    }

    return response
  }

  static async createPreviousConnectionsForActivity(activityId: string, newParticipantId: string) {
    try {
      // Get all users who have responded "in" to this activity (including the creator)
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          responses: {
            where: { response: 'in' },
            include: { user: true },
          },
        },
      })

      if (!activity) return

      // Include the activity creator as a participant
      const allParticipants = [
        activity.creatorId,
        ...activity.responses.map(r => r.userId)
      ]

      // Remove duplicates and exclude the new participant from the list
      const existingParticipants = [...new Set(allParticipants)].filter(id => id !== newParticipantId)

      // Create previous connections between the new participant and all existing participants
      for (const participantId of existingParticipants) {
        await FriendshipService.createPreviousConnection(newParticipantId, participantId, activityId)
      }
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to create previous connections:', error)
    }
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