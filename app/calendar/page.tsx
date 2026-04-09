'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, RefreshCw } from 'lucide-react';
import type { CalendarEvent } from '@/lib/gateway-service';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const res = await fetch('/api/gateway');
      const data = await res.json();
      setEvents((data.events || []).sort((a: CalendarEvent, b: CalendarEvent) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }

  const typeColors = {
    meeting: 'bg-blue-900/20 text-blue-400',
    deadline: 'bg-red-900/20 text-red-400',
    reminder: 'bg-yellow-900/20 text-yellow-400',
  };

  const typeIcons = {
    meeting: '👥',
    deadline: '⏰',
    reminder: '🔔',
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Loading calendar...</p>
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-400" size={32} />
              <h1 className="text-4xl font-bold text-white">Calendar</h1>
            </div>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
          <p className="text-gray-400">Upcoming events and deadlines</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Events</p>
            <p className="text-3xl font-bold text-white">{events.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Meetings</p>
            <p className="text-3xl font-bold text-blue-400">
              {events.filter(e => e.type === 'meeting').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Deadlines</p>
            <p className="text-3xl font-bold text-red-400">
              {events.filter(e => e.type === 'deadline').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Reminders</p>
            <p className="text-3xl font-bold text-yellow-400">
              {events.filter(e => e.type === 'reminder').length}
            </p>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No upcoming events</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white/10 rounded-lg border border-white/20 p-6 hover:border-white/40 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-3xl">{typeIcons[event.type]}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${typeColors[event.type]}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
