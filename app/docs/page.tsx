'use client';

import { useEffect, useState } from 'react';
import { FileText, Tag, Calendar, RefreshCw } from 'lucide-react';
import type { Document } from '@/lib/gateway-service';

export default function Docs() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  async function fetchDocs() {
    try {
      setLoading(true);
      const res = await fetch('/api/gateway');
      const data = await res.json();
      setDocs((data.docs || []).sort((a: Document, b: Document) => {
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }));
    } catch (error) {
      console.error('Failed to fetch docs:', error);
    } finally {
      setLoading(false);
    }
  }

  const typeColors: Record<string, string> = {
    markdown: 'bg-blue-900/20 text-blue-400',
    document: 'bg-purple-900/20 text-purple-400',
    guide: 'bg-green-900/20 text-green-400',
    reference: 'bg-yellow-900/20 text-yellow-400',
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Loading docs...</p>
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
              <FileText className="text-blue-400" size={32} />
              <h1 className="text-4xl font-bold text-white">Documentation</h1>
            </div>
            <button
              onClick={fetchDocs}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
          <p className="text-gray-400">Browse guides, documentation, and references</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Documents</p>
            <p className="text-3xl font-bold text-white">{docs.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Markdown</p>
            <p className="text-3xl font-bold text-blue-400">
              {docs.filter(d => d.type === 'markdown').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Guides</p>
            <p className="text-3xl font-bold text-green-400">
              {docs.filter(d => d.type === 'guide').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">References</p>
            <p className="text-3xl font-bold text-yellow-400">
              {docs.filter(d => d.type === 'reference').length}
            </p>
          </div>
        </div>

        {/* Docs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-400">No documents found</p>
            </div>
          ) : (
            docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white/10 rounded-lg border border-white/20 p-6 hover:border-white/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{doc.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{doc.type}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ml-2 ${
                      typeColors[doc.type] || 'bg-gray-900/20 text-gray-400'
                    }`}
                  >
                    {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                  </span>
                </div>

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doc.tags.map((tag) => (
                      <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/10 text-xs text-gray-400">
                        <Tag size={12} />
                        {tag}
                      </div>
                    ))}
                  </div>
                )}

                {/* Last Modified */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  <span>
                    Modified{' '}
                    {new Date(doc.lastModified).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
