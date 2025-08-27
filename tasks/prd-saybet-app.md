# PRD: SayBet - Casual Activity Discovery & Coordination Platform

## Introduction/Overview

SayBet is a web-first social platform that helps friends discover what to do together and coordinate casual hangouts. Unlike existing apps that focus on formal event planning or calendar scheduling, SayBet addresses the fundamental question "what should we do?" through AI-powered activity suggestions and frictionless social coordination.

The platform solves three core problems that existing solutions fail to address: (1) people don't know what activities to do (ideation problem), (2) coordinating with friends is unnecessarily complicated (logistics problem), and (3) current apps require downloads and feel too formal for casual hangouts (friction problem).

**Goal**: Create the go-to platform for spontaneous and planned casual activities among friend groups, positioning between Partiful's event hosting and Howbout's calendar coordination.

## Goals

1. **Solve the Activity Ideation Problem**: Provide AI-powered suggestions for activities when users don't know what to do
2. **Reduce Coordination Friction**: Enable seamless activity sharing and joining without app downloads
3. **Build Authentic Social Networks**: Use phone number verification to create trusted, real-identity friend networks
4. **Drive Casual Social Engagement**: Focus on low-pressure, accessible activities rather than formal events
5. **Achieve Product-Market Fit**: Reach sustainable user retention rates through genuine utility and social value

## User Stories

### Primary User Stories
- **As a bored friend group**, I want AI suggestions for activities so I can quickly find something fun to do together
- **As someone planning activities**, I want to post casual hangouts so friends can easily see and join what I'm doing
- **As a recipient of activity invites**, I want to respond with "I'm in" or "maybe" via a simple web link so I don't need to download another app
- **As a social connector**, I want to add people I've hung out with as friends so I can see their future activities and stay connected

### Secondary User Stories
- **As a spontaneous person**, I want to post "right now" activities so friends can join me on short notice
- **As a regular user**, I want to set my availability status so friends know when I'm free to hang out
- **As someone discovering new connections**, I want to see activities from people I've previously hung out with so I can decide to add them as friends
- **As a privacy-conscious user**, I want phone number verification so I know I'm connecting with real people, not fake accounts

## Functional Requirements

### 1. User Authentication & Profile Management
1.1. Users must be able to sign up using their phone number
1.2. The system must send SMS verification codes for account creation
1.3. Users must be able to set a display name and optional profile photo
1.4. Users must be able to set availability status from predefined options (e.g., "Free this evening", "Looking for weekend plans")

### 2. Activity Creation & Management
2.1. Users must be able to create activities with title, description, timeframe, location, and vibe tags
2.2. The system must automatically categorize activities as "spontaneous" (containing "now", "30 mins") or "planned"
2.3. Users must be able to set activity visibility: "Friends Only", "Previous Hangout People", or "Open to All"
2.4. Activities must display host information, participant count, and response status
2.5. Users must be able to respond to activities with "I'm in!" or "Maybe" options

### 3. AI Activity Suggestions
3.1. The system must provide 3 AI-generated activity suggestions on the Discover tab
3.2. AI suggestions must include title, description, timeframe, location, and vibe categorization
3.3. Users must be able to create activities directly from AI suggestions with pre-filled forms
3.4. The system must offer a "Get Fresh Ideas" button to generate new suggestions

### 4. Friend Network & Social Discovery
4.1. Users must be able to add friends through phone number search
4.2. The system must display friend availability status and next planned activity
4.3. Users must see a "People You've Hung Out With" section showing previous activity participants
4.4. Users must be able to promote people from "hangout people" to "friends" status
4.5. Friend profiles must show availability, upcoming activities, and activity history

### 5. Activity Feed & Timeline
5.1. The system must display current activities and past activities in separate sections
5.2. Activity feed must show activities from friends and "previous hangout people" based on visibility settings
5.3. Past activities must be visually differentiated (grayed out) and show "went" vs "interested" status
5.4. Users must be able to browse both current and historical activities

### 6. Web-First Experience
6.1. The entire platform must function as a responsive web application
6.2. Activity links must be shareable via SMS without requiring app installation
6.3. Recipients must be able to view activity details and respond through web interface
6.4. The system must work optimally on both mobile browsers and desktop

## Non-Goals (Out of Scope for MVP)

- **SMS Integration**: Automated SMS notifications for activity updates (post-MVP feature)
- **External Event Discovery**: Integration with Eventbrite, Meetup, or Instagram (future enhancement)
- **Calendar Integration**: Syncing with Google Calendar or Apple Calendar (not core to casual coordination)
- **Advanced AI Personalization**: Learning from user history and preferences (v2 feature)
- **Monetization Features**: Premium accounts, business partnerships, or revenue streams
- **Real-time Chat**: In-activity messaging or group chats (separate from core activity coordination)
- **Location-based Discovery**: GPS integration for nearby activities or friends

## Design Considerations

### Visual Design
- **Modern, clean interface** with cool-toned color palette (indigo/cyan gradients)
- **Glass morphism effects** with backdrop blur for premium feel
- **Responsive design** optimized for mobile-first usage
- **Clear visual hierarchy** separating current vs past activities
- **Accessibility compliance** with proper contrast ratios and semantic markup

### User Experience
- **Three-tab navigation**: Activities (primary), Discover, Friends
- **Progressive disclosure**: Show essential information first, details on demand
- **Contextual interactions**: Different button states for different activity types
- **Social proof elements**: Show friend participation to encourage engagement

## Technical Considerations

### Recommended Tech Stack
- **Frontend**: Next.js with React (server-side rendering for SEO and performance)
- **Backend**: Next.js API routes or Express.js with Node.js
- **Database**: PostgreSQL with Prisma ORM (relational data for social connections)
- **Authentication**: NextAuth.js or Clerk for phone number verification
- **SMS Service**: Twilio for phone verification and future notifications
- **AI Integration**: OpenAI API for activity suggestions
- **Hosting**: Vercel (seamless Next.js deployment) or AWS
- **Styling**: Tailwind CSS for rapid development

### Key Technical Requirements
- **Phone number verification system** with SMS integration
- **Real-time data updates** for activity responses and friend status
- **Responsive web design** that works across all devices
- **SEO optimization** for activity sharing and discovery
- **Performance optimization** for fast loading times

### Data Models
- **Users**: phone, name, avatar, availability_status, created_at
- **Activities**: title, description, timeframe, location, vibe, visibility, host_id, type
- **Friendships**: user_id, friend_id, status, created_at
- **Activity_Responses**: activity_id, user_id, response_type, created_at
- **Previous_Connections**: user_id, connected_user_id, last_activity_id

## Success Metrics

### Primary Success Metric
**User Acquisition (Number of Signups)**
- **Target**: 1,000+ users within first 3 months of launch
- **Growth Rate**: 20%+ month-over-month user growth
- **Viral Coefficient**: Average 1.5+ friend invites per new user signup

### Secondary Metrics
- **Weekly Active Users**: 40%+ of total users active weekly
- **Activity Creation Rate**: Average 2+ activities created per active user per month
- **Social Network Formation**: 70%+ of users add at least 3 friends within first week
- **Response Rate**: 60%+ response rate on activity invitations

### Leading Indicators
- **Signup Conversion**: 80%+ phone verification completion rate
- **Time to First Activity**: Users create or respond to first activity within 24 hours
- **Friend Network Growth**: New users add first friend within 48 hours
- **AI Suggestion Engagement**: 30%+ of new users try AI-generated activity suggestions

## Open Questions

### Product Questions
1. **Activity Visibility Logic**: Should "Previous Hangout People" activities be visible to all friends, or only to mutual connections?
2. **Friend Request System**: Should adding friends require mutual acceptance, or is one-way following acceptable?
3. **Activity Editing**: Should users be able to edit activities after posting, and how does this affect responses?
4. **Geographic Scope**: Should the initial launch target specific cities/regions, or be location-agnostic?

### Technical Questions
1. **Phone Number Privacy**: Should phone numbers be hidden from other users, or visible to friends?
2. **AI Model Selection**: Should we use GPT-4 for richer suggestions or GPT-3.5 for cost efficiency?
3. **Real-time Updates**: Do activity responses need real-time updates, or is periodic refresh sufficient?
4. **Data Retention**: How long should we keep past activities and user interaction data?

### Go-to-Market Questions
1. **Launch Strategy**: Should we seed with specific communities (colleges, companies) or launch broadly?
2. **Growth Mechanism**: What viral mechanics will encourage users to invite friends to the platform?
3. **Content Moderation**: What guidelines and systems need to be in place for user-generated activity content?

---

_This PRD targets junior developers and assumes basic web development knowledge. All technical implementation details should be determined during the development planning phase._