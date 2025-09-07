Hello! As requested, I've updated the Curriculum Manager page.

I've made the following changes:
1.  **Increased Modal Size:** The modal for adding or editing curriculum modules is now significantly wider, providing more space for the description field.
2.  **New "Wide Table View":** I've added a new tab to the Curriculum Manager that presents the data in a wide, scrollable table format. This new view features:
    *   **Hierarchical Rows:** Topic, Sub-Topic, and Module are grouped neatly in the row headers.
    *   **Level-Based Columns:** Each of the 6 curriculum levels has its own column.
    *   **Sticky Headers:** The first three columns (Topic, Sub-Topic, Module) are sticky, so you can scroll horizontally to see all levels without losing context.
    *   **Animated Tab Switching:** The transition between the "List View" and the new "Wide Table View" is smoothly animated.

Here are the modified files:

I've enlarged the popup modal by adjusting its max-width class.

<!-- FILE_START: src/components/ui/Modal.tsx -->
```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, showCloseButton = true }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl p-6 mx-4 max-w-2xl w-full shadow-2xl"
          >
            {/* Close Button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
            
            {/* Title */}
            {title && (
              <h2 className="text-xl font-bold text-gray-900 mb-4 pr-8">{title}</h2>
            )}
            
            {/* Content */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```
<!-- FILE_END: src/components/ui/Modal.tsx -->

Next, I've updated the main page for the Curriculum Manager to include the new tabbed interface and the wide table view component.

<!-- FILE_START: src/app/(admin)/curriculum-manager/page.tsx -->
```typescript
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Filter, Link as LinkIcon, Save, X, CheckCircle, List, Table } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { factoryRegistry } from '@/lib/question-factories/registry';

// --- TYPE DEFINITIONS ---
interface CurriculumModule {
  id: string;
  code: string;
  topic: string;
  sub_topic: string;
  module: string;
  level: number;
  module_code: string;
  description: string;
  status: 'active' | 'archived';
  linked_factory_count: number;
}

interface Factory {
  factory_code: string;
  status: string;
}

interface EnrichedFactory extends Factory {
    topic: string;
    module: string;
    description: string;
}

interface Link {
  curriculum_module_code: string;
  factory_code: string;
}

// --- WIDE TABLE VIEW COMPONENT ---
function CurriculumWideTable({ modules }: { modules: CurriculumModule[] }) {
    type GroupedData = Map<string, Map<string, Map<string, { [level: number]: { module_code: string, description: string } }>>>;

    const groupedData: GroupedData = useMemo(() => {
        const topics = new Map<string, Map<string, Map<string, { [level: number]: { module_code: string, description: string } }>>>();
        
        modules.forEach(module => {
            if (!topics.has(module.topic)) {
                topics.set(module.topic, new Map());
            }
            const subTopics = topics.get(module.topic)!;
            
            if (!subTopics.has(module.sub_topic)) {
                subTopics.set(module.sub_topic, new Map());
            }
            const moduleNames = subTopics.get(module.sub_topic)!;
            
            if (!moduleNames.has(module.module)) {
                moduleNames.set(module.module, {});
            }
            const levels = moduleNames.get(module.module)!;
            
            levels[module.level] = {
                module_code: module.module_code,
                description: module.description,
            };
        });

        return topics;
    }, [modules]);

    const topicRowSpans = useMemo(() => {
        const spans = new Map<string, number>();
        groupedData.forEach((subTopics, topic) => {
            let count = 0;
            subTopics.forEach(moduleNames => {
                count += moduleNames.size;
            });
            spans.set(topic, count);
        });
        return spans;
    }, [groupedData]);

    const subTopicRowSpans = useMemo(() => {
        const spans = new Map<string, number>();
        groupedData.forEach((subTopics) => {
            subTopics.forEach((moduleNames, subTopic) => {
                spans.set(subTopic, moduleNames.size);
            });
        });
        return spans;
    }, [groupedData]);

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-6 border border-gray-200">
            <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="sticky left-0 bg-gray-100 p-2 border-r border-gray-200 min-w-[12rem] z-30 font-semibold text-gray-600 text-left">Topic</th>
                        <th className="sticky left-[12rem] bg-gray-100 p-2 border-r border-gray-200 min-w-[12rem] z-30 font-semibold text-gray-600 text-left">Sub-Topic</th>
                        <th className="sticky left-[24rem] bg-gray-100 p-2 border-r border-gray-200 min-w-[12rem] z-30 font-semibold text-gray-600 text-left">Module</th>
                        {[1, 2, 3, 4, 5, 6].map(level => (
                            <th key={level} className="p-2 border-b border-gray-200 min-w-[16rem] font-semibold text-gray-600 text-center">Level {level}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {Array.from(groupedData.entries()).flatMap(([topic, subTopics]) => {
                        let isFirstTopicRow = true;
                        return Array.from(subTopics.entries()).flatMap(([subTopic, moduleNames]) => {
                            let isFirstSubTopicRow = true;
                            return Array.from(moduleNames.entries()).map(([moduleName, levels]) => {
                                const topicCell = isFirstTopicRow ? <td className="sticky left-0 bg-white p-2 border-r border-gray-200 align-top font-medium text-gray-800 z-20" rowSpan={topicRowSpans.get(topic)}>{topic}</td> : null;
                                const subTopicCell = isFirstSubTopicRow ? <td className="sticky left-[12rem] bg-white p-2 border-r border-gray-200 align-top font-medium text-gray-700 z-20" rowSpan={subTopicRowSpans.get(subTopic)}>{subTopic}</td> : null;

                                isFirstTopicRow = false;
                                isFirstSubTopicRow = false;

                                return (
                                    <tr key={`${topic}-${subTopic}-${moduleName}`} className="hover:bg-gray-50">
                                        {topicCell}
                                        {subTopicCell}
                                        <td className="sticky left-[24rem] bg-white p-2 border-r border-gray-200 align-top z-20 text-gray-600">{moduleName}</td>
                                        {[1, 2, 3, 4, 5, 6].map(level => {
                                            const data = levels[level];
                                            return (
                                                <td key={level} className="p-2 align-top border-l border-gray-200">
                                                    {data ? (
                                                        <div className="bg-gray-50 p-2 rounded-md">
                                                            <span className="font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full text-xs">{data.module_code}</span>
                                                            <p className="mt-2 text-gray-600">{data.description}</p>
                                                        </div>
                                                    ) : null}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            });
                        });
                    })}
                </tbody>
            </table>
        </div>
    );
}


// --- MAIN PAGE COMPONENT ---
export default function CurriculumManagerPage() {
  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CurriculumModule | null>(null);
  const [filters, setFilters] = useState({ code: '', topic: '', sub_topic: '', module: '', level: '' });
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const fetchModules = useCallback(async () => {
    setIsLoading(true);
    const statusFilter = showArchived ? '' : '&status=active';
    try {
      const response = await fetch(`/api/admin/curriculum-modules?${statusFilter}`);
      const data = await response.json();
      setModules(data.modules || []);
    } catch (error) {
      console.error("Failed to fetch curriculum modules", error);
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);
  
  const filteredModules = useMemo(() => {
    return modules.filter(m =>
      m.code.toLowerCase().includes(filters.code.toLowerCase()) &&
      m.topic.toLowerCase().includes(filters.topic.toLowerCase()) &&
      m.sub_topic.toLowerCase().includes(filters.sub_topic.toLowerCase()) &&
      m.module.toLowerCase().includes(filters.module.toLowerCase()) &&
      (filters.level === '' || m.level.toString() === filters.level)
    );
  }, [modules, filters]);

  const handleOpenEditModal = (module: CurriculumModule | null) => {
    setSelectedModule(module);
    setIsEditModalOpen(true);
  };
  
  const handleOpenLinkModal = (module: CurriculumModule) => {
    setSelectedModule(module);
    setIsLinkModalOpen(true);
  };

  const handleModuleUpdate = (moduleCode: string, newCount: number) => {
    setModules(prev => prev.map(m => m.code === moduleCode ? { ...m, linked_factory_count: newCount } : m));
  };

  const handleSaveModule = async (moduleData: Partial<CurriculumModule>) => {
    const isNew = !moduleData.id;
    const url = isNew ? '/api/admin/curriculum-modules' : `/api/admin/curriculum-modules/${moduleData.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleData)
      });
      if (response.ok) {
        fetchModules();
        setIsEditModalOpen(false);
        setSelectedModule(null);
      } else {
        alert('Failed to save module.');
      }
    } catch (error) {
      console.error("Save module error:", error);
      alert('An error occurred while saving.');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Are you sure you want to archive this module?')) {
      try {
        const response = await fetch(`/api/admin/curriculum-modules/${moduleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived' })
        });
        if (response.ok) fetchModules();
        else alert('Failed to archive module.');
      } catch (error) {
        console.error("Archive module error:", error);
      }
    }
  };

  return (
    <div className="p-8 max-w-full mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Curriculum Manager</h1>
      <p className="text-gray-600 mb-8">Add, edit, and manage all curriculum modules for the platform.</p>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'list' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
                <List className="w-5 h-5" /> List View
            </button>
            <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'table' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
                <Table className="w-5 h-5" /> Wide Table View
            </button>
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
        >
            {activeTab === 'list' && (
                <div>
                    {/* Filters */}
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input type="text" placeholder="Filter by Code..." value={filters.code} onChange={e => setFilters({...filters, code: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
                        <input type="text" placeholder="Filter by Topic..." value={filters.topic} onChange={e => setFilters({...filters, topic: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
                        <input type="text" placeholder="Filter by Sub-Topic..." value={filters.sub_topic} onChange={e => setFilters({...filters, sub_topic: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
                        <input type="text" placeholder="Filter by Module..." value={filters.module} onChange={e => setFilters({...filters, module: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
                        <input type="number" placeholder="Filter by Level..." value={filters.level} onChange={e => setFilters({...filters, level: e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="rounded"/>
                            Show Archived
                        </label>
                        <Button onClick={() => handleOpenEditModal(null)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Module
                        </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-3/5">Curriculum Detail</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lvl</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Links</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                            <tr><td colSpan={5} className="text-center p-8">Loading...</td></tr>
                            ) : filteredModules.map((module) => (
                            <tr key={module.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                    <div className="font-medium text-sm text-gray-800 flex items-center gap-2">
                                        <span>{module.topic} / {module.sub_topic} / {module.module}</span>
                                        <span className="font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md text-xs">{module.module_code}</span>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1 max-w-md" title={module.description}>{module.description}</div>
                                    <div className="text-xs text-gray-400 font-mono mt-1">{module.code}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center align-top">{module.level}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                <button onClick={() => handleOpenLinkModal(module)} className={`flex items-center gap-1 p-1 rounded-md ${module.linked_factory_count > 0 ? 'text-purple-600 hover:text-purple-800 hover:bg-purple-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                                    <LinkIcon className="w-4 h-4" />
                                    <span className="font-semibold">{module.linked_factory_count}</span>
                                </button>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${module.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {module.status}
                                </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2 align-top">
                                <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(module)}><Edit className="w-3 h-3"/></Button>
                                {module.status === 'active' && (
                                    <Button variant="outline" size="sm" onClick={() => handleDeleteModule(module.id)}><Trash2 className="w-3 h-3"/></Button>
                                )}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            )}
            {activeTab === 'table' && (
                <CurriculumWideTable modules={modules} />
            )}
        </motion.div>
      </AnimatePresence>

      {isEditModalOpen && (
        <ModuleEditModal
          module={selectedModule}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveModule}
        />
      )}
      
      {isLinkModalOpen && selectedModule && (
        <LinkingModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          module={selectedModule}
          onUpdate={handleModuleUpdate}
        />
      )}
    </div>
  );
}

// --- EDIT/ADD MODAL COMPONENT ---
function ModuleEditModal({ module, onClose, onSave }: { module: Partial<CurriculumModule> | null, onClose: () => void, onSave: (data: Partial<CurriculumModule>) => void }) {
  const [formData, setFormData] = useState(module || { code: '', topic: '', sub_topic: '', module: '', level: 1, description: '', status: 'active', module_code: 'A' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'level' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={formData.id ? 'Edit Module' : 'Add New Module'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm">Code</label><input name="code" value={formData.code} onChange={handleChange} required className="w-full p-2 border rounded"/></div>
            <div><label className="block text-sm">Topic</label><input name="topic" value={formData.topic} onChange={handleChange} required className="w-full p-2 border rounded"/></div>
            <div><label className="block text-sm">Sub-Topic</label><input name="sub_topic" value={formData.sub_topic} onChange={handleChange} required className="w-full p-2 border rounded"/></div>
            <div className="col-span-2"><label className="block text-sm">Module Name</label><input name="module" value={formData.module} onChange={handleChange} required className="w-full p-2 border rounded"/></div>
            <div><label className="block text-sm">Level</label><input type="number" name="level" value={formData.level} onChange={handleChange} required className="w-full p-2 border rounded" min="1" max="6"/></div>
            <div><label className="block text-sm">Module Code</label><input name="module_code" value={formData.module_code} onChange={handleChange} required className="w-full p-2 border rounded" maxLength={1} /></div>
            <div className="col-span-2"><label className="block text-sm">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} required className="w-full p-2 border rounded" rows={4}/></div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Module</Button>
        </div>
      </form>
    </Modal>
  );
}

const parseFactoryCode = (code: string) => {
    const parts = code.split('_');
    if (parts.length < 3) return { topic: 'Unknown', module: 'Unknown' };
    const topicMap: { [key: string]: string } = { PV: 'Place Value' };
    return { topic: topicMap[parts[0]] || parts[0], module: parts[1] };
};

// --- LINKING MODAL COMPONENT ---
function LinkingModal({ isOpen, onClose, module, onUpdate }: { isOpen: boolean, onClose: () => void, module: CurriculumModule, onUpdate: (moduleCode: string, newCount: number) => void }) {
  const [factories, setFactories] = useState<EnrichedFactory[]>([]);
  const [linkedFactories, setLinkedFactories] = useState<Set<string>>(new Set());
  const [initialLinks, setInitialLinks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchModalData = async () => {
      setIsLoading(true);
      try {
        const [factoriesRes, linksRes] = await Promise.all([
          fetch('/api/admin/factories?status=approved'),
          fetch(`/api/admin/curriculum-links?moduleCode=${module.code}`)
        ]);
        
        const factoriesData = await factoriesRes.json();
        const linksData = await linksRes.json();

        const enrichedFactories = (factoriesData.factories || []).map((dbFactory: Factory) => {
            const registryInstance = factoryRegistry.getFactory(dbFactory.factory_code);
            const parsed = parseFactoryCode(dbFactory.factory_code);
            return {
                ...dbFactory,
                topic: parsed.topic,
                module: parsed.module,
                description: registryInstance.description || 'No description available.',
            };
        });
        
        setFactories(enrichedFactories);
        
        const factoryCodes = new Set<string>(linksData.links.map((link: Link) => link.factory_code));
        setLinkedFactories(factoryCodes);
        setInitialLinks(factoryCodes);
      } catch (error) { console.error("Failed to fetch modal data", error); }
      finally { setIsLoading(false); }
    };
    fetchModalData();
  }, [isOpen, module.code]);

  const handleLinkToggle = (factoryCode: string) => {
    const newLinks = new Set(linkedFactories);
    if (newLinks.has(factoryCode)) newLinks.delete(factoryCode);
    else newLinks.add(factoryCode);
    setLinkedFactories(newLinks);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/curriculum-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleCode: module.code, factoryCodes: Array.from(linkedFactories) })
      });
      if(response.ok) {
        onUpdate(module.code, linkedFactories.size);
        onClose();
      } else { console.error("Failed to save links"); }
    } catch (error) { console.error("Save error:", error); }
    finally { setIsSaving(false); }
  };

  const hasChanges = JSON.stringify(Array.from(initialLinks).sort()) !== JSON.stringify(Array.from(linkedFactories).sort());

  return (
    <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Link Factories to Module</h2>
              <p className="text-sm text-gray-500">{module.code}: {module.module}</p>
            </div>
            <Button onClick={onClose} variant="outline" size="sm"><X className="w-4 h-4" /></Button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {isLoading ? <p>Loading approved factories...</p> : (
              <div className="space-y-3">
                {factories.map(factory => (
                  <label key={factory.factory_code} className="block p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start">
                      <input type="checkbox" checked={linkedFactories.has(factory.factory_code)} onChange={() => handleLinkToggle(factory.factory_code)} className="mt-1 h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"/>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-semibold text-gray-800">{factory.factory_code}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{factory.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{factory.topic} / {factory.module}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
              {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        </motion.div>
      </div>
    )}
    </AnimatePresence>
  );
}
```
<!-- FILE_END: src/app/(admin)/curriculum-manager/page.tsx -->