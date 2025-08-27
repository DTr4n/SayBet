# SayBet

**The go-to platform for spontaneous and planned casual activities among friend groups.**

SayBet solves the fundamental question "what should we do?" by combining AI-powered activity suggestions with frictionless social coordination. Unlike formal event planning apps, SayBet focuses on casual hangouts and removes the friction of downloading apps or complex scheduling.

## 🎯 What SayBet Solves

- **The Ideation Problem**: "We want to hang out but don't know what to do"
- **The Coordination Problem**: Complicated group chats and planning overhead  
- **The Friction Problem**: Apps that feel too formal for casual get-togethers

## ✨ Key Features

- **AI Activity Suggestions** - Get fresh ideas when you're stuck on what to do
- **Casual Activity Posts** - Share spontaneous or planned hangouts with friends
- **Web-First Experience** - Friends can respond via web link without downloading anything
- **Smart Friend Network** - Connect through phone verification with people you've actually hung out with
- **Response Simplicity** - Just "I'm in!" or "Maybe" - no complex RSVP systems

## 🏗️ How It Works

1. **Sign up with your phone** - Real identity verification, no fake accounts
2. **Set your availability** - "Free this evening", "Looking for weekend plans", etc.
3. **Post activities or get AI suggestions** - From "coffee run in 30 mins" to "hiking this weekend"
4. **Friends respond easily** - Share web links, no app download required
5. **Build your network** - Add people you've hung out with to stay connected

## 🚧 Development Status

**Phase 1.0 - Project Setup** ✅ Complete
- Next.js 15 project with TypeScript
- Tailwind CSS with glass morphism design system
- Core dependencies and tooling setup

**Phase 2.0 - UI Foundation** 🔄 Next
- Navigation and core components
- Activity cards and forms
- Friend management interface

## 🛠 Tech Stack

Built with Next.js 15, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

## 🚀 Getting Started

```bash
# Clone and install
git clone <repository-url>
cd SayBet
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Twilio and database credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Code linting
- `npm run format` - Code formatting

## 📚 Documentation

- [Product Requirements Document](tasks/prd-saybet-app.md)
- [Development Tasks](tasks/tasks-prd-saybet-app.md)
- [Reference Design](reference_materials/social-event-app.tsx)

---

**SayBet** - Making spontaneous hangouts effortless 🎯