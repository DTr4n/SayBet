import { z } from 'zod'

// User schemas
export const CreateUserSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  name: z.string().min(1, 'Name is required').optional(),
  avatar: z.string().url().optional(),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  avatar: z.string().url().optional(),
  availabilityStatus: z.enum(['available', 'busy', 'invisible']).optional(),
})

export const VerifyUserSchema = z.object({
  phone: z.string(),
  verificationCode: z.string().length(6, 'Verification code must be 6 digits'),
})

// Activity schemas
export const CreateActivitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.date().optional(),
  time: z.string().optional(),
  category: z.enum(['spontaneous', 'planned']).default('spontaneous'),
  visibility: z.enum(['friends', 'previous', 'open']).default('friends'),
  maxParticipants: z.number().int().min(1).optional(),
})

export const UpdateActivitySchema = CreateActivitySchema.partial()

// Activity response schema
export const CreateActivityResponseSchema = z.object({
  activityId: z.string().cuid(),
  response: z.enum(['in', 'maybe']),
})

// Friendship schemas
export const CreateFriendshipSchema = z.object({
  receiverPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
})

export const UpdateFriendshipSchema = z.object({
  status: z.enum(['pending', 'accepted', 'blocked']),
})

// Type exports
export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type VerifyUserInput = z.infer<typeof VerifyUserSchema>
export type CreateActivityInput = z.infer<typeof CreateActivitySchema>
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>
export type CreateActivityResponseInput = z.infer<typeof CreateActivityResponseSchema>
export type CreateFriendshipInput = z.infer<typeof CreateFriendshipSchema>
export type UpdateFriendshipInput = z.infer<typeof UpdateFriendshipSchema>