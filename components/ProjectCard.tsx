import { Project } from '@/lib/types';
import { getProjectColor, getStatusColor, formatDate } from '@/lib/utils';
import { Badge } from './ui/Badge';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getProjectColor(project.color)}`}></div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500">{project.owner}</p>
          </div>
        </div>
        <Badge variant="secondary">{project.status}</Badge>
      </div>

      <p className="text-sm text-gray-600 mb-4">{project.description}</p>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold">{project.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProjectColor(project.color)} transition-all`}
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Started {formatDate(project.startDate)}</span>
          {project.dueDate && <span>Due {formatDate(project.dueDate)}</span>}
        </div>
      </div>
    </div>
  );
}
