import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import FileUploader from '../../components/admin/FileUploader';

interface Resource {
  id: string;
  title: string;
  description: string;
  resource_type: 'policy' | 'form' | 'guide' | 'link';
  file_url: string;
  link: string;
  file_size: number;
  year: number;
  category: string;
  is_active: boolean;
  order_number: number;
}

export default function ResourcesManagement() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'policy' as 'policy' | 'form' | 'guide' | 'link',
    file_url: '',
    link: '',
    file_size: 0,
    year: new Date().getFullYear(),
    category: '',
    is_active: true,
    order_number: 0
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources_items')
        .select('*')
        .order('resource_type', { ascending: true })
        .order('year', { ascending: false })
        .order('order_number', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      alert('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.resource_type === 'link' && !formData.link) {
      alert('Please provide a link URL');
      return;
    }

    if (formData.resource_type !== 'link' && !formData.file_url) {
      alert('Please upload a file');
      return;
    }

    try {
      if (editingResource) {
        const { error } = await supabase
          .from('resources_items')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingResource.id);

        if (error) throw error;
        alert('Resource updated successfully!');
      } else {
        const { error } = await supabase
          .from('resources_items')
          .insert([formData]);

        if (error) throw error;
        alert('Resource added successfully!');
      }

      resetForm();
      fetchResources();
    } catch (error: any) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('resources_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Resource deleted successfully!');
      fetchResources();
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    }
  };

  const toggleActive = async (resource: Resource) => {
    try {
      const { error } = await supabase
        .from('resources_items')
        .update({ is_active: !resource.is_active })
        .eq('id', resource.id);

      if (error) throw error;
      fetchResources();
    } catch (error: any) {
      console.error('Error toggling resource:', error);
      alert('Failed to update resource status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resource_type: 'policy',
      file_url: '',
      link: '',
      file_size: 0,
      year: new Date().getFullYear(),
      category: '',
      is_active: true,
      order_number: 0
    });
    setEditingResource(null);
    setShowForm(false);
  };

  const startEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      resource_type: resource.resource_type,
      file_url: resource.file_url || '',
      link: resource.link || '',
      file_size: resource.file_size || 0,
      year: resource.year || new Date().getFullYear(),
      category: resource.category || '',
      is_active: resource.is_active,
      order_number: resource.order_number
    });
    setShowForm(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredResources = filterType === 'all'
    ? resources
    : resources.filter(r => r.resource_type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Resources Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Resource
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Resource Type *
                </label>
                <select
                  value={formData.resource_type}
                  onChange={(e) => setFormData({ ...formData, resource_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="policy">Policy Document</option>
                  <option value="form">Form</option>
                  <option value="guide">Guide</option>
                  <option value="link">External Link</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
            </div>

            {formData.resource_type === 'link' ? (
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>
            ) : (
              <FileUploader
                bucket="resources"
                currentFile={formData.file_url}
                onUploadSuccess={(url, size) => setFormData({ ...formData, file_url: url, file_size: size })}
                label="Upload File *"
              />
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Policies"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="2000"
                  max="2100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-semibold text-primary">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                {editingResource ? 'Update Resource' : 'Add Resource'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-primary px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 flex gap-2">
        {['all', 'policy', 'form', 'guide', 'link'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterType === type
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-primary hover:bg-gray-300'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-sand">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Year</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Size</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredResources.map((resource) => (
              <tr key={resource.id} className="hover:bg-sand transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {resource.resource_type === 'link' && <LinkIcon size={16} className="text-primary" />}
                    <div>
                      <p className="font-semibold text-primary">{resource.title}</p>
                      {resource.description && (
                        <p className="text-sm text-muted line-clamp-1">{resource.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-accent text-primary">
                    {resource.resource_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted">{resource.year}</td>
                <td className="px-6 py-4 text-muted">
                  {resource.file_size ? formatFileSize(resource.file_size) : '-'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(resource)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      resource.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {resource.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    {resource.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(resource)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">No resources found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
