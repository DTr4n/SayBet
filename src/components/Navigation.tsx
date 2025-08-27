'use client'

import { Zap, Sparkles, Users } from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'activities', label: 'Activities', icon: Zap },
    { id: 'discover', label: 'Discover', icon: Sparkles },
    { id: 'friends', label: 'Friends', icon: Users }
  ]

  return (
    <div className="flex space-x-1 glass-nav rounded-xl p-1 mb-4 sm:mb-8 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-white shadow-sm text-indigo-700 border border-indigo-200'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export default Navigation