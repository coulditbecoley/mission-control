'use client';

import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDashboardStore } from '@/lib/store';
import { KnowledgeItem } from '@/lib/types';
import { Plus, BookOpen } from 'lucide-react';
import { generateId } from '@/lib/utils';

export default function KnowledgePage() {
  const { knowledge, setKnowledge, searchQuery } = useDashboardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
  });

  const categories = ['general', 'api', 'procedures', 'architecture', 'troubleshooting'];

  const filteredItems = knowledge.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreateItem = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    const newItem: KnowledgeItem = {
      id: generateId(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setKnowledge([...knowledge, newItem]);

    setFormData({
      title: '',
      content: '',
      category: 'general',
      tags: '',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 bg-[#0a0e27] min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Knowledge Base</h1>
            <p className="text-gray-400">Document and organize system knowledge</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={18} />
            New Article
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-sm">
          <SearchBar />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div>
            <h3 className="font-semibold text-white mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`block w-full text-left px-3 py-2 rounded text-sm ${
                  selectedCategory === null
                    ? 'bg-black text-white'
                    : 'text-gray-300 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm capitalize ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filteredItems.length > 0 ? (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#141829] rounded-lg border border-[#374151] p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <BookOpen size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          Category: {item.category}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.content}</p>

                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="mx-auto mb-2 opacity-30" size={32} />
                <p>No articles found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Article Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Article"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateItem();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-[#374151] rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Article title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-[#374151] rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              placeholder="Article content"
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-[#374151] rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-[#374151] rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" onClick={handleCreateItem} className="flex-1">
              Create Article
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
