import { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  
  try {
    // Fetch activity data for meta tags
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/activities/${id}`, {
      cache: 'no-store' // Always get fresh data for sharing
    })
    
    if (!response.ok) {
      return {
        title: 'Activity Not Found | SayBet',
        description: 'This activity could not be found.',
      }
    }
    
    const activity = await response.json()
    
    return {
      title: `${activity.title} | SayBet`,
      description: activity.description || `Join ${activity.host.name} for ${activity.title}`,
      openGraph: {
        title: activity.title,
        description: activity.description || `Join ${activity.host.name} for ${activity.title}`,
        type: 'website',
        url: `${baseUrl}/activity/${id}`,
        siteName: 'SayBet',
        images: [
          {
            url: '/og-image.png', // We'll create this later
            width: 1200,
            height: 630,
            alt: activity.title,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: activity.title,
        description: activity.description || `Join ${activity.host.name} for ${activity.title}`,
        images: ['/og-image.png'],
      },
      robots: {
        index: activity.visibility === 'open',
        follow: activity.visibility === 'open',
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Activity | SayBet',
      description: 'Join activities and meet new people on SayBet',
    }
  }
}

export default function ActivityLayout({ children }: Props) {
  return children
}