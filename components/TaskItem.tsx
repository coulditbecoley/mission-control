'use client';

import { Task } from '@/lib/types';
import { getStatusColor, getPriorityColor, formatDate } from '@/lib/utils';
import { Badge } from './ui/Badge';
import { Trash2, Edit2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
}

export function TaskItem({ task, onEdit, onDelete, onStatusChange }: TaskItemProps) {
  return (
    <div className="bg-[#141829] rounded-lg border border-[#374151] p-4 hover:border-[#4b5563] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={task.status === 'done'}
            onChange={(e) => onStatusChange?.(task.id, e.target.checked ? 'done' : 'todo')}
            className="mt-1 cursor-pointer accent-emerald-500"
          />
          <div className="flex-1">
            <h4 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-gray-400 mt-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="secondary">{task.status}</Badge>
              {task.priority !== 'medium' && (
                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatDate(task.dueDate)}
            </span>
          )}
          <button
            onClick={() => onEdit?.(task)}
            className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-[#1a1f3a] rounded transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete?.(task.id)}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-[#1a1f3a] rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
