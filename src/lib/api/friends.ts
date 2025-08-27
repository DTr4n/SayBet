import { User, Friendship } from "@/types";

export async function searchUsersByPhone(phone: string): Promise<User[]> {
  // TODO: Implement user search by phone number
  return [];
}

export async function getFriends(userId: string): Promise<User[]> {
  // TODO: Implement get user friends
  return [];
}

export async function addFriend(userId: string, friendId: string): Promise<Friendship> {
  // TODO: Implement add friend request
  throw new Error("Not implemented");
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  // TODO: Implement accept friend request
  throw new Error("Not implemented");
}

export async function getFriendRequests(userId: string): Promise<Friendship[]> {
  // TODO: Implement get pending friend requests
  return [];
}