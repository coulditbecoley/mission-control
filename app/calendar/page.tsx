'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ScheduledTask {
  id: string;
  name: string;
  time: string;
  color: 'orange' | 'red' | 'green' | 'blue' | 'purple';
  frequency: string;
}

const MOCK_TASKS: ScheduledTask[] = [
  { id: '1', name: 'Trend Radar', time: '12:00 PM', color: 'orange', frequency: '5x daily' },
  { id: '2', name: 'Morning Kickoff', time: '8:30 AM', color: 'orange', frequency: 'Daily' },
  { id: '3', name: 'YouTube OpenClaw R...', time: '7:00 AM', color: 'red', frequency: 'Daily' },
  { id: '4', name: 'Scout Morning Resear...', time: '8:30 AM', color: 'green', frequency: 'Daily' },
  { id: '5', name: 'Morning Brief', time: '8:00 AM', color: 'orange', frequency: 'Daily' },
  { id: '6', name: 'Trend Radar Daily Dig...', time: '8:00 AM', color: 'orange', frequency: 'Daily' },
  { id: '7', name: 'Quill Script Writer', time: '9:30 AM', color: 'blue', frequency: 'Daily' },
  { id: '8', name: 'Daily Digest', time: '9:00 AM', color: 'purple', frequency: 'Daily' },
  { id: '9', name: 'Evening Wrap Up', time: '5:00 PM', color: 'blue', frequency: 'Daily' },
  { id: '10', name: 'Health Check', time: '12:00 AM', color: 'green', frequency: '3 hours' },
  { id: '11', name: 'Weekly Newsletter Dr...', time: '9:30 AM', color: 'purple', frequency: 'Weekly' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getColorClasses = (color: string) => {
  switch (color) {
    case 'orange':
      return 'bg-orange-900/40 text-orange-300 border border-orange-800/50';
    case 'red':
      return 'bg-red-900/40 text-red-300 border border-red-800/50';
    case 'green':
      return 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50';
    case 'blue':
      return 'bg-blue-900/40 text-blue-300 border border-blue-800/50';
    case 'purple':
      return 'bg-purple-900/40 text-purple-300 border border-purple-800/50';
    default:
      return 'bg-gray-900/40 text-gray-300';
  }
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekDates = (date: Date) => {
    const week = [];
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i));
      week.push(new Date(day));
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  const goToPreviousWeek = () => {
    setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-400" size={28} />
              <h1 className="text-3xl font-bold text-white">Calendar</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousWeek}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1f3a] rounded transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-400 w-32 text-center">
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <button
                onClick={goToNextWeek}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1f3a] rounded transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <p className="text-gray-400">Scheduled tasks and cron jobs</p>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, dayIdx) => (
            <div
              key={dayIdx}
              className="bg-[#141829] rounded-lg border border-[#374151] min-h-[600px] p-3"
            >
              {/* Day Header */}
              <div className="mb-4 pb-3 border-b border-[#374151]">
                <p className="text-xs font-semibold text-gray-400">
                  {DAYS[date.getDay()]}
                </p>
                <p className="text-sm font-bold text-white">
                  {date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                </p>
              </div>

              {/* Tasks for this day */}
              <div className="space-y-2">
                {MOCK_TASKS.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded p-2 text-xs cursor-pointer hover:opacity-80 transition-opacity ${getColorClasses(task.color)}`}
                  >
                    <p className="font-semibold truncate text-xs">{task.name}</p>
                    <p className="text-xs opacity-80">{task.time}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Task List Below */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Always Running</h2>
          <div className="flex gap-2 flex-wrap">
            {MOCK_TASKS.map((task) => (
              <button
                key={task.id}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${getColorClasses(task.color)}`}
              >
                {task.name} • {task.frequency}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
