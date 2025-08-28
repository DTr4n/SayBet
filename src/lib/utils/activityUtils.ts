/**
 * Utility functions for activity processing and categorization
 */

export interface ActivityTimeInfo {
  isPast: boolean
  isImmediate: boolean
  priority: number
  parsedDate?: Date
}

/**
 * Analyzes activity timing and categorizes it
 */
export function analyzeActivityTiming(
  activity: {
    timeframe?: string
    date?: Date | string | null
    time?: string | null
    type?: 'spontaneous' | 'planned' | 'completed'
    category?: 'spontaneous' | 'planned'
  }
): ActivityTimeInfo {
  const now = new Date()
  
  // If explicitly marked as completed, it's past
  if (activity.type === 'completed') {
    return {
      isPast: true,
      isImmediate: false,
      priority: 1000, // Low priority (high number)
    }
  }

  // Try to parse structured date/time first
  if (activity.date) {
    const activityDate = activity.date instanceof Date ? activity.date : new Date(activity.date)
    
    if (!isNaN(activityDate.getTime())) {
      const isPast = activityDate < now
      
      // If we have time, combine it with the date
      if (activity.time) {
        const [hours, minutes] = activity.time.split(':').map(Number)
        const activityDateTime = new Date(activityDate)
        activityDateTime.setHours(hours, minutes, 0, 0)
        
        const diffMinutes = Math.floor((activityDateTime.getTime() - now.getTime()) / (1000 * 60))
        
        return {
          isPast: activityDateTime < now,
          isImmediate: !isPast && diffMinutes <= 60,
          priority: isPast ? 1000 : Math.max(0, diffMinutes),
          parsedDate: activityDateTime,
        }
      }
      
      const diffDays = Math.floor((activityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        isPast,
        isImmediate: !isPast && diffDays <= 0,
        priority: isPast ? 1000 : Math.max(0, diffDays * 24 * 60),
        parsedDate: activityDate,
      }
    }
  }

  // Fallback to natural language parsing from timeframe
  if (!activity.timeframe) {
    return {
      isPast: false,
      isImmediate: false,
      priority: 500,
    }
  }

  const timeframe = activity.timeframe.toLowerCase()
  
  // Immediate activities (highest priority)
  if (timeframe.includes('now') || timeframe.includes('right now')) {
    return {
      isPast: false,
      isImmediate: true,
      priority: 0,
    }
  }
  
  // Near-future activities
  const minutesMatch = timeframe.match(/(\d+)\s*min/)
  if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1])
    return {
      isPast: false,
      isImmediate: minutes <= 30,
      priority: minutes,
    }
  }
  
  const hoursMatch = timeframe.match(/(\d+)\s*hour/)
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1])
    return {
      isPast: false,
      isImmediate: hours <= 1,
      priority: hours * 60,
    }
  }
  
  // Today activities
  if (timeframe.includes('today') || timeframe.includes('tonight') || timeframe.includes('this evening')) {
    return {
      isPast: false,
      isImmediate: false,
      priority: 8 * 60, // 8 hours
    }
  }
  
  // Tomorrow activities
  if (timeframe.includes('tomorrow')) {
    return {
      isPast: false,
      isImmediate: false,
      priority: 24 * 60, // 24 hours
    }
  }
  
  // This week activities
  if (timeframe.includes('this week') || 
      timeframe.includes('monday') || timeframe.includes('tuesday') || 
      timeframe.includes('wednesday') || timeframe.includes('thursday') || 
      timeframe.includes('friday') || timeframe.includes('saturday') || 
      timeframe.includes('sunday')) {
    return {
      isPast: false,
      isImmediate: false,
      priority: 3 * 24 * 60, // 3 days
    }
  }
  
  // Past indicators
  if (timeframe.includes('yesterday') || 
      timeframe.includes('last week') || 
      timeframe.includes('last month') || 
      timeframe.includes('ago') ||
      timeframe.includes('earlier') ||
      timeframe.includes('before')) {
    return {
      isPast: true,
      isImmediate: false,
      priority: 1000,
    }
  }
  
  // Default for ambiguous cases - assume current but low priority
  return {
    isPast: false,
    isImmediate: false,
    priority: 12 * 60, // 12 hours
  }
}

/**
 * Sorts activities by their timing priority
 */
export function sortActivitiesByTiming<T extends {
  timeframe?: string
  date?: Date | string | null
  time?: string | null
  type?: 'spontaneous' | 'planned' | 'completed'
  category?: 'spontaneous' | 'planned'
  id: number
}>(activities: T[]): T[] {
  return activities.sort((a, b) => {
    const aInfo = analyzeActivityTiming(a)
    const bInfo = analyzeActivityTiming(b)
    
    // Past activities go to the end
    if (aInfo.isPast && !bInfo.isPast) return 1
    if (!aInfo.isPast && bInfo.isPast) return -1
    
    // For current activities, sort by priority (lower priority number = more urgent)
    if (!aInfo.isPast && !bInfo.isPast) {
      if (aInfo.priority !== bInfo.priority) {
        return aInfo.priority - bInfo.priority
      }
    }
    
    // For same priority or past activities, sort by ID (newer first)
    return b.id - a.id
  })
}

/**
 * Categorizes activities into current and past
 */
export function categorizeActivities<T extends {
  timeframe?: string
  date?: Date | string | null
  time?: string | null
  type?: 'spontaneous' | 'planned' | 'completed'
  category?: 'spontaneous' | 'planned'
  id: number
}>(activities: T[]): { current: T[], past: T[] } {
  const current: T[] = []
  const past: T[] = []
  
  activities.forEach(activity => {
    const info = analyzeActivityTiming(activity)
    if (info.isPast) {
      past.push(activity)
    } else {
      current.push(activity)
    }
  })
  
  return {
    current: sortActivitiesByTiming(current),
    past: sortActivitiesByTiming(past),
  }
}

/**
 * Gets a human-readable relative time description
 */
export function getRelativeTimeDescription(activity: {
  timeframe?: string
  date?: Date | string | null
  time?: string | null
}): string {
  const info = analyzeActivityTiming(activity)
  
  if (info.parsedDate) {
    const now = new Date()
    const diffMinutes = Math.floor((info.parsedDate.getTime() - now.getTime()) / (1000 * 60))
    
    if (info.isPast) {
      if (diffMinutes > -60) {
        return `${Math.abs(diffMinutes)} minutes ago`
      } else if (diffMinutes > -24 * 60) {
        return `${Math.abs(Math.floor(diffMinutes / 60))} hours ago`
      } else {
        return `${Math.abs(Math.floor(diffMinutes / (24 * 60)))} days ago`
      }
    } else {
      if (diffMinutes < 60) {
        return `in ${diffMinutes} minutes`
      } else if (diffMinutes < 24 * 60) {
        return `in ${Math.floor(diffMinutes / 60)} hours`
      } else {
        return `in ${Math.floor(diffMinutes / (24 * 60))} days`
      }
    }
  }
  
  return activity.timeframe || 'Time not specified'
}

/**
 * Automatically categorizes activity as spontaneous or planned based on timing
 */
export function categorizeActivityByTiming(activity: {
  timeframe?: string
  date?: Date | string | null
  time?: string | null
}): 'spontaneous' | 'planned' {
  const info = analyzeActivityTiming(activity)
  
  // If we have a parsed date/time, use precise calculation
  if (info.parsedDate) {
    const now = new Date()
    const diffHours = (info.parsedDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    // Activities within 4 hours are considered spontaneous
    return diffHours <= 4 ? 'spontaneous' : 'planned'
  }
  
  // Fallback to natural language analysis
  if (!activity.timeframe) return 'planned'
  
  const timeframe = activity.timeframe.toLowerCase()
  
  // Immediate/very near-term activities are spontaneous
  if (
    timeframe.includes('now') ||
    timeframe.includes('right now') ||
    timeframe.includes('asap') ||
    timeframe.includes('immediately')
  ) {
    return 'spontaneous'
  }
  
  // Activities within a few hours are spontaneous
  if (
    timeframe.includes('30 min') ||
    timeframe.includes('1 hour') ||
    timeframe.includes('2 hour') ||
    timeframe.includes('3 hour') ||
    timeframe.includes('in a bit') ||
    timeframe.includes('soon')
  ) {
    return 'spontaneous'
  }
  
  // Today activities can be spontaneous or planned based on specificity
  if (timeframe.includes('today')) {
    // Vague time = more spontaneous
    if (
      timeframe.includes('sometime') ||
      timeframe.includes('later') ||
      timeframe.includes('this afternoon') ||
      timeframe.includes('this evening')
    ) {
      return 'spontaneous'
    }
    // Specific time = more planned
    return 'planned'
  }
  
  // Tonight activities are typically spontaneous
  if (timeframe.includes('tonight')) {
    return 'spontaneous'
  }
  
  // Future dates are planned
  if (
    timeframe.includes('tomorrow') ||
    timeframe.includes('next week') ||
    timeframe.includes('weekend') ||
    timeframe.includes('monday') ||
    timeframe.includes('tuesday') ||
    timeframe.includes('wednesday') ||
    timeframe.includes('thursday') ||
    timeframe.includes('friday') ||
    timeframe.includes('saturday') ||
    timeframe.includes('sunday')
  ) {
    return 'planned'
  }
  
  // Default to planned for ambiguous cases
  return 'planned'
}

/**
 * Suggests better timeframe descriptions based on category
 */
export function suggestTimeframeForCategory(
  currentTimeframe: string, 
  category: 'spontaneous' | 'planned'
): string[] {
  const suggestions: string[] = []
  
  if (category === 'spontaneous') {
    suggestions.push(
      'Right now',
      'In 30 minutes', 
      'In 1 hour',
      'In 2 hours',
      'Later today',
      'This evening',
      'Tonight'
    )
  } else {
    suggestions.push(
      'Tomorrow morning',
      'Tomorrow evening', 
      'This weekend',
      'Next week',
      'Friday evening',
      'Saturday afternoon'
    )
  }
  
  return suggestions
}