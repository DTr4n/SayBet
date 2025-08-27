import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, Plus, User, Search, Sparkles, Heart, X, Check, AlertCircle, Coffee, Zap } from 'lucide-react';

// Mock AI suggestions - in real app, this would call OpenAI API
const getAIActivitySuggestions = () => {
  const suggestions = [
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
  
  return suggestions;
};

const SocialActivityApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('activities');
  const [activities, setActivities] = useState([]);
  const [friends, setFriends] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showFriendSearch, setShowFriendSearch] = useState(false);

  // Mock users database
  const [allUsers] = useState([
    { id: 1, name: "Alex Chen", phone: "+1 (555) 123-4567", avatar: "👤" },
    { id: 2, name: "Sarah Johnson", phone: "+1 (555) 234-5678", avatar: "👤" },
    { id: 3, name: "Mike Torres", phone: "+1 (555) 345-6789", avatar: "👤" },
    { id: 4, name: "Emma Davis", phone: "+1 (555) 456-7890", avatar: "👤" },
    { id: 5, name: "Jordan Kim", phone: "+1 (555) 567-8901", avatar: "👤" }
  ]);

  // Mock discover friends
  const [discoverFriends] = useState([
    { id: 6, name: "Lisa Park", phone: "+1 (555) 678-9012", avatar: "👤", 
      lastActivity: "Hiking at Griffith Park", mutualFriends: 2 },
    { id: 7, name: "David Kim", phone: "+1 (555) 789-0123", avatar: "👤", 
      lastActivity: "Trivia night at Murphy's", mutualFriends: 1 },
    { id: 8, name: "Maya Rodriguez", phone: "+1 (555) 890-1234", avatar: "👤", 
      lastActivity: "Coffee at Blue Bottle", mutualFriends: 3 }
  ]);

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    timeframe: '',
    location: '',
    type: 'casual',
    vibe: 'chill',
    visibility: 'friends'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState("Free this evening");

  const availabilityOptions = [
    "Free right now",
    "Free this evening", 
    "Free this weekend",
    "Down for coffee this week",
    "Looking for weekend plans",
    "Free for spontaneous hangouts",
    "Busy until Friday"
  ];

  // Initialize with mock data
  useEffect(() => {
    if (!currentUser) {
      setCurrentUser({ id: 0, name: "You", phone: "+1 (555) 000-0000", avatar: "👤" });
    }
    
    setFriends([
      { 
        id: 1, 
        name: "Alex Chen", 
        phone: "+1 (555) 123-4567", 
        avatar: "👤",
        availability: "Free this weekend",
        nextActivity: {
          title: "Coffee catch-up",
          time: "Tomorrow 3pm",
          location: "Starbucks Downtown"
        }
      },
      { 
        id: 2, 
        name: "Sarah Johnson", 
        phone: "+1 (555) 234-5678", 
        avatar: "👤",
        availability: "Down for anything tonight",
        nextActivity: {
          title: "Trying new sushi place",
          time: "Friday 7pm", 
          location: "Sakura Restaurant"
        }
      }
    ]);

    setActivities([
      {
        id: 1,
        title: "Boba run - anyone free? 🧋",
        description: "Getting my usual from Tiger Sugar, lmk if you want to join",
        timeframe: "In 30 mins",
        location: "Tiger Sugar, Main St",
        host: { name: "Sarah Johnson", id: 2 },
        type: "spontaneous",
        interested: [1],
        joinRequests: { 1: "interested" },
        vibe: "casual",
        visibility: "friends"
      },
      {
        id: 2,
        title: "Hiking Griffith Park tomorrow morning",
        description: "Early bird gets the worm! Beautiful sunrise views 🌅",
        timeframe: "Saturday 7am",
        location: "Griffith Observatory Trail",
        host: { name: "Mike Torres", id: 3 },
        type: "planned",
        interested: [2],
        joinRequests: { 2: "maybe" },
        vibe: "active",
        visibility: "friends"
      },
      {
        id: 3,
        title: "Coffee catch-up ☕",
        description: "Let's finally catch up! It's been too long",
        timeframe: "Yesterday 3pm",
        location: "Starbucks Downtown",
        host: { name: "Alex Chen", id: 1 },
        type: "completed",
        interested: [0],
        joinRequests: { 0: "interested" },
        vibe: "casual",
        visibility: "friends"
      },
      {
        id: 4,
        title: "Trivia Night Domination 🧠",
        description: "We absolutely crushed it! 2nd place isn't bad",
        timeframe: "Last Thursday 7pm",
        location: "Murphy's Pub",
        host: { name: "Lisa Park", id: 6 },
        type: "completed",
        interested: [0, 1, 7],
        joinRequests: { 0: "interested", 1: "interested", 7: "interested" },
        vibe: "social",
        visibility: "previous"
      },
      {
        id: 5,
        title: "Weekend farmers market run 🥕",
        description: "Getting fresh produce and trying new vendors",
        timeframe: "This Sunday 9am",
        location: "Santa Monica Farmers Market",
        host: { name: "Maya Rodriguez", id: 8 },
        type: "planned",
        interested: [6],
        joinRequests: { 6: "maybe" },
        vibe: "chill",
        visibility: "previous"
      }
    ]);

    setAiSuggestions(getAIActivitySuggestions());
  }, []);

  const handleCreateActivity = () => {
    const newActivity = {
      id: activities.length + 1,
      title: activityForm.title,
      description: activityForm.description,
      timeframe: activityForm.timeframe,
      location: activityForm.location,
      vibe: activityForm.vibe,
      host: currentUser,
      interested: [],
      joinRequests: {},
      type: activityForm.timeframe.includes('now') || activityForm.timeframe.includes('30') ? 'spontaneous' : 'planned',
      visibility: activityForm.visibility
    };
    setActivities([...activities, newActivity]);
    setActivityForm({ title: '', description: '', timeframe: '', location: '', type: 'casual', vibe: 'chill', visibility: 'friends' });
    setShowActivityForm(false);
  };

  const handleJoinInterest = (activityId, response) => {
    setActivities(activities.map(activity => 
      activity.id === activityId 
        ? { 
            ...activity, 
            joinRequests: { ...activity.joinRequests, [currentUser.id]: response },
            interested: response === 'interested' && !activity.interested.includes(currentUser.id) 
              ? [...activity.interested, currentUser.id] 
              : activity.interested.filter(id => id !== currentUser.id)
          }
        : activity
    ));
  };

  const addFriend = (user) => {
    if (!friends.find(f => f.id === user.id)) {
      setFriends([...friends, { 
        ...user, 
        availability: "Just joined!",
        nextActivity: null
      }]);
    }
    setShowFriendSearch(false);
    setSearchTerm('');
  };

  const createActivityFromSuggestion = (suggestion) => {
    setActivityForm({
      title: suggestion.title,
      description: suggestion.description,
      timeframe: suggestion.timeframe,
      location: suggestion.location,
      type: 'casual',
      vibe: suggestion.vibe,
      visibility: 'friends'
    });
    setShowActivityForm(true);
  };

  const filteredUsers = allUsers.filter(user => 
    !friends.find(f => f.id === user.id) && 
    !discoverFriends.find(d => d.id === user.id) &&
    user.id !== currentUser?.id &&
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     user.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                SayBet
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <select 
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="bg-transparent text-sm text-green-700 border-none outline-none"
                >
                  {availabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hey,</span>
                <span className="font-semibold text-indigo-700">{currentUser?.name}</span>
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-200 to-cyan-200 rounded-full flex items-center justify-center">
                  {currentUser?.avatar}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 mb-8 border border-slate-200">
          {[
            { id: 'activities', label: 'Activities', icon: Zap },
            { id: 'discover', label: 'Discover', icon: Sparkles },
            { id: 'friends', label: 'Friends', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-indigo-700 border border-indigo-200'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Activity Feed</h2>
              <button
                onClick={() => setShowActivityForm(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Post Activity</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Current Activities Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Current Activities
                </h3>
                {activities.filter(activity => activity.type !== 'completed').map((activity) => (
                  <div key={activity.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-800">{activity.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.type === 'spontaneous' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {activity.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.vibe === 'active' ? 'bg-orange-100 text-orange-700' :
                            activity.vibe === 'casual' ? 'bg-green-100 text-green-700' :
                            activity.vibe === 'social' ? 'bg-purple-100 text-purple-700' :
                            activity.vibe === 'chill' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.vibe}
                          </span>
                          {activity.visibility === 'previous' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              from hangouts
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{activity.description}</p>
                        <div className="space-y-1 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            {activity.timeframe}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-2" />
                            {activity.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="w-4 h-4 mr-2" />
                            Posted by {activity.host.name}
                          </div>
                        </div>
                        {activity.interested.length > 0 && (
                          <div className="flex items-center text-sm text-indigo-600 mb-2">
                            <Heart className="w-4 h-4 mr-1" />
                            {activity.interested.length} interested
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!activity.joinRequests[currentUser?.id] || activity.joinRequests[currentUser?.id] === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleJoinInterest(activity.id, 'interested')}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                              <span>I'm in!</span>
                            </button>
                            <button
                              onClick={() => handleJoinInterest(activity.id, 'maybe')}
                              className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>Maybe</span>
                            </button>
                          </>
                        ) : (
                          <div className={`px-3 py-1 rounded-lg font-medium ${
                            activity.joinRequests[currentUser?.id] === 'interested' ? 'bg-green-100 text-green-700' :
                            activity.joinRequests[currentUser?.id] === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {activity.joinRequests[currentUser?.id] === 'interested' ? "You're in!" : 
                             activity.joinRequests[currentUser?.id] === 'maybe' ? 'Maybe going' : 'Not interested'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Past Activities Section */}
              {activities.filter(activity => activity.type === 'completed').length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-600 border-b border-gray-200 pb-2">
                    Past Activities
                  </h3>
                  {activities.filter(activity => activity.type === 'completed').map((activity) => (
                    <div key={activity.id} className="bg-gray-50/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-600">{activity.title}</h3>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              completed
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.vibe === 'active' ? 'bg-orange-100 text-orange-700' :
                              activity.vibe === 'casual' ? 'bg-green-100 text-green-700' :
                              activity.vibe === 'social' ? 'bg-purple-100 text-purple-700' :
                              activity.vibe === 'chill' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {activity.vibe}
                            </span>
                            {activity.visibility === 'previous' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                from hangouts
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 mb-3">{activity.description}</p>
                          <div className="space-y-1 mb-4">
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="w-4 h-4 mr-2" />
                              {activity.timeframe}
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <MapPin className="w-4 h-4 mr-2" />
                              {activity.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <Users className="w-4 h-4 mr-2" />
                              Posted by {activity.host.name}
                            </div>
                          </div>
                          {activity.interested.length > 0 && (
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <Heart className="w-4 h-4 mr-1" />
                              {activity.interested.length} went
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="px-3 py-1 rounded-lg font-medium bg-gray-100 text-gray-600">
                            {activity.joinRequests[currentUser?.id] === 'interested' ? 'You went' : 'Completed'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activities.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No activities yet. Post something fun to do!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                What should we do?
              </h2>
              <p className="text-gray-600 mb-6">
                AI-powered activity ideas for spontaneous hangouts
              </p>
              <button
                onClick={() => setAiSuggestions(getAIActivitySuggestions())}
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-indigo-500/25 transition-all transform hover:scale-105"
              >
                ✨ Get Fresh Ideas
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {aiSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all transform hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.vibe === 'active' ? 'bg-orange-100 text-orange-700' :
                        suggestion.vibe === 'foodie' ? 'bg-red-100 text-red-700' :
                        suggestion.vibe === 'competitive' ? 'bg-blue-100 text-blue-700' :
                        suggestion.vibe === 'cozy' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {suggestion.vibe}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{suggestion.title}</h3>
                    <p className="text-gray-600 mb-4">{suggestion.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        {suggestion.timeframe}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        {suggestion.location}
                      </div>
                    </div>
                    <button
                      onClick={() => createActivityFromSuggestion(suggestion)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105"
                    >
                      Post This Activity
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Your Crew</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-5 hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-200 to-cyan-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                      {friend.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800">{friend.name}</h3>
                      
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-green-700 font-medium">{friend.availability}</span>
                        </div>
                        
                        {friend.nextActivity && (
                          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-4 border border-indigo-100">
                            <div className="text-xs text-indigo-600 font-medium mb-1">Next up:</div>
                            <div className="text-sm font-semibold text-indigo-800">{friend.nextActivity.title}</div>
                            <div className="text-xs text-indigo-600 mt-1">
                              {friend.nextActivity.time} • {friend.nextActivity.location}
                            </div>
                          </div>
                        )}
                        
                        {!friend.nextActivity && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="text-xs text-gray-500 italic">No upcoming activities</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {friends.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No friends added yet. Check out people you've hung out with below!</p>
                </div>
              )}
            </div>

            {/* Discover Friends Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">People You've Hung Out With</h3>
                <p className="text-sm text-gray-500">Add them to see their activities</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoverFriends.map((person) => (
                  <div key={person.id} className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl shadow-md border border-slate-200 p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-slate-200 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {person.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm">{person.name}</h4>
                        
                        <div className="space-y-1 mt-2">
                          <div className="text-xs text-slate-600">
                            Last activity: {person.lastActivity}
                          </div>
                          <div className="text-xs text-gray-500">
                            {person.mutualFriends} mutual friend{person.mutualFriends > 1 ? 's' : ''}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => addFriend(person)}
                          className="mt-3 w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Add to Friends
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Creation Modal */}
      {showActivityForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Post Activity</h3>
                <button
                  onClick={() => setShowActivityForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What's the plan?</label>
                  <input
                    type="text"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Coffee run, hiking, trying new restaurant..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any extra details or context..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">When?</label>
                  <input
                    type="text"
                    value={activityForm.timeframe}
                    onChange={(e) => setActivityForm({...activityForm, timeframe: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Right now, in 30 mins, tomorrow evening..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Where?</label>
                  <input
                    type="text"
                    value={activityForm.location}
                    onChange={(e) => setActivityForm({...activityForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Location or meeting spot"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Who can join?</label>
                  <select
                    value={activityForm.visibility}
                    onChange={(e) => setActivityForm({...activityForm, visibility: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="friends">Friends Only</option>
                    <option value="previous">Previous Hangout People</option>
                    <option value="open">Open to All</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vibe</label>
                  <select
                    value={activityForm.vibe}
                    onChange={(e) => setActivityForm({...activityForm, vibe: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="chill">Chill</option>
                    <option value="active">Active</option>
                    <option value="casual">Casual</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowActivityForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateActivity}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105"
                  >
                    Post Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialActivityApp;