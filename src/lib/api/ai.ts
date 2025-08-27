import { AIActivitySuggestion } from "@/types";

export async function getAIActivitySuggestions(): Promise<AIActivitySuggestion[]> {
  // TODO: Implement OpenAI API integration (Post-MVP)
  // Mock suggestions for now
  return [
    {
      id: 1,
      title: "Trivia Night at Murphy's Pub",
      description: "Perfect for 3-4 friends who love a good challenge",
      type: "social",
      timeframe: "Tonight",
      location: "Murphy's Pub, Downtown",
      vibe: "competitive"
    },
    {
      id: 2,
      title: "Quick Coffee Run",
      description: "Great for catching up 1:1",
      type: "casual",
      timeframe: "This afternoon",
      location: "Blue Bottle Coffee",
      vibe: "chill"
    },
    {
      id: 3,
      title: "Try That New Ramen Place",
      description: "Everyone's been talking about it",
      type: "food",
      timeframe: "This weekend",
      location: "Noodle Bar District",
      vibe: "foodie"
    }
  ];
}