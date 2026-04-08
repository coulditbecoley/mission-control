'use client';

import { useState } from 'react';
import { FileText, Search, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DocEntry {
  id: string;
  date: string;
  title: string;
  category: 'daily' | 'notes';
  preview: string;
}

const MOCK_DOCS: DocEntry[] = [
  {
    id: '1',
    date: '2026-04-08',
    title: 'Daily Summary — Apr 8, 2026',
    category: 'daily',
    preview: 'Deployed Asgard Dashboard with dark theme. Added Calendar tab with Linear-style week view. Updated Health Check timer to 3 hours. Fixed Traefik routing issues and container deployment.',
  },
  {
    id: '2',
    date: '2026-04-08',
    title: 'Mission Control Features',
    category: 'notes',
    preview: 'Priority features to implement: Real-time gateway monitoring, Task auto-sync from Telegram, Knowledge base full-text search integration, Agent performance metrics dashboard.',
  },
  {
    id: '3',
    date: '2026-04-07',
    title: 'Daily Summary — Apr 7, 2026',
    category: 'daily',
    preview: 'Built initial Mission Control dashboard. Configured Docker deployment on Hostinger VPS. Set up GitHub Actions CI/CD pipeline. Integrated OpenClaw gateway health checks.',
  },
  {
    id: '4',
    date: '2026-04-07',
    title: 'Tyr Capital Q2 Strategy',
    category: 'notes',
    preview: 'Focus areas: Expand lending portfolio, improve market research automation, build institutional partnerships, develop proprietary trading signals.',
  },
  {
    id: '5',
    date: '2026-04-06',
    title: 'Daily Summary — Apr 6, 2026',
    category: 'daily',
    preview: 'Initialized GitHub repository. Designed dashboard architecture. Selected Next.js + Tailwind tech stack. Created backup and deployment procedures.',
  },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'daily' | 'notes'>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocEntry | null>(null);

  const filteredDocs = MOCK_DOCS.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="flex h-full">
        {/* Left Sidebar - Document List */}
        <div className="w-80 bg-[#0f1318] border-r border-[#374151] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#374151]">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-blue-400" size={24} />
              <h1 className="text-xl font-bold text-white">Docs</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-[#1a1f3a] border border-[#374151] text-white placeholder-gray-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pt-4 pb-3 border-b border-[#374151] flex gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'daily', label: 'Daily' },
              { id: 'notes', label: 'Notes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as 'all' | 'daily' | 'notes')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No documents found</div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedDoc?.id === doc.id
                        ? 'bg-[#1a1f3a] border border-[#4b5563]'
                        : 'hover:bg-[#1a1f3a] border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs text-gray-500">{formatDate(doc.date)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        doc.category === 'daily'
                          ? 'bg-orange-900/40 text-orange-300'
                          : 'bg-blue-900/40 text-blue-300'
                      }`}>
                        {doc.category === 'daily' ? '📅 Daily' : '📝 Notes'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{doc.preview}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Doc Button */}
          <div className="p-4 border-t border-[#374151]">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <Plus size={16} />
              New Doc
            </Button>
          </div>
        </div>

        {/* Right Panel - Document Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {selectedDoc ? (
            <div>
              {/* Document Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-sm px-3 py-1 rounded ${
                    selectedDoc.category === 'daily'
                      ? 'bg-orange-900/40 text-orange-300'
                      : 'bg-blue-900/40 text-blue-300'
                  }`}>
                    {selectedDoc.category === 'daily' ? '📅 Daily Summary' : '📝 Notes'}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(selectedDoc.date)}</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{selectedDoc.title}</h1>
                <p className="text-sm text-gray-400">{selectedDoc.preview.length} characters</p>
              </div>

              {/* Document Content */}
              <div className="prose prose-invert max-w-none">
                <div className="bg-[#141829] border border-[#374151] rounded-lg p-6">
                  {selectedDoc.category === 'daily' ? (
                    <div className="space-y-6">
                      <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Accomplishments</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                          <li>Deployed Asgard Dashboard with complete dark theme styling</li>
                          <li>Added Calendar tab with Linear-style week view layout</li>
                          <li>Implemented color-coded cron job tracking</li>
                          <li>Fixed Docker deployment and Traefik routing issues</li>
                          <li>Updated Health Check frequency to 3-hour intervals</li>
                        </ul>
                      </section>

                      <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Key Decisions</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                          <li>Switched from Traefik subdomain routing to direct port mapping (3001)</li>
                          <li>Implemented automated backup system for code safety</li>
                          <li>Created deployment checklist to prevent future breakages</li>
                        </ul>
                      </section>

                      <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Blockers & Issues</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                          <li>Initial Dockerfile didn't copy app source files (fixed)</li>
                          <li>Browser caching delays (mitigated with hard refresh instructions)</li>
                        </ul>
                      </section>

                      <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Next Steps</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                          <li>Add real-time gateway monitoring metrics</li>
                          <li>Integrate Telegram Notes sync to Docs dashboard</li>
                          <li>Implement full-text search for knowledge base</li>
                          <li>Add agent performance analytics</li>
                        </ul>
                      </section>
                    </div>
                  ) : (
                    <div className="space-y-4 text-gray-300">
                      <p>{selectedDoc.preview}</p>
                      <div className="bg-[#0a0e27] border border-[#374151] rounded p-4">
                        <p className="text-xs text-gray-500 mb-2">Full note content here...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="text-gray-600 mb-4" size={48} />
              <p className="text-gray-400">Select a document to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
