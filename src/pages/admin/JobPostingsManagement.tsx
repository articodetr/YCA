import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';

interface JobPosting {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  department: string;
  employment_type: string;
  location: string;
  salary_range: string;
  requirements_en: string;
  requirements_ar: string;
  responsibilities_en: string;
  responsibilities_ar: string;
  application_deadline: string;
  application_url: string;
  is_active: boolean;
  applications_count: number;
}

export default function JobPostingsManagement() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<JobPosting>>({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    department: '',
    employment_type: 'full_time',
    location: 'Birmingham, UK',
    salary_range: '',
    requirements_en: '',
    requirements_ar: '',
    responsibilities_en: '',
    responsibilities_ar: '',
    application_deadline: '',
    application_url: '',
    is_active: true
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title_en || !formData.title_ar) {
        alert('Please fill in both English and Arabic job titles');
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from('job_postings')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('job_postings')
          .insert([formData]);

        if (error) throw error;
      }

      loadJobs();
      resetForm();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Error saving job posting');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job posting');
    }
  };

  const handleEdit = (job: JobPosting) => {
    setFormData(job);
    setEditingId(job.id);
    setIsAdding(true);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadJobs();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      department: '',
      employment_type: 'full_time',
      location: 'Birmingham, UK',
      salary_range: '',
      requirements_en: '',
      requirements_ar: '',
      responsibilities_en: '',
      responsibilities_ar: '',
      application_deadline: '',
      application_url: '',
      is_active: true
    });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Job Postings Management</h1>
            <p className="text-muted mt-1">Manage job opportunities and track applications</p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              <Plus size={20} />
              Add Job Posting
            </button>
          )}
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-primary p-6 rounded-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">
                {editingId ? 'Edit Job Posting' : 'Add New Job Posting'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Job Title (English) *</label>
                  <input
                    type="text"
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Job Title (Arabic) *</label>
                  <input
                    type="text"
                    value={formData.title_ar || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Employment Type</label>
                  <select
                    value={formData.employment_type || 'full_time'}
                    onChange={(e) => setFormData(prev => ({ ...prev, employment_type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Salary Range</label>
                  <input
                    type="text"
                    value={formData.salary_range || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                    placeholder="e.g., £25,000 - £30,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.application_deadline || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

<div>
  <label className="block text-sm font-semibold text-primary mb-2">Application Link (URL)</label>
  <input
    type="url"
    value={formData.application_url || ''}
    onChange={(e) => setFormData(prev => ({ ...prev, application_url: e.target.value }))}
    placeholder="https://..."
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  />
  <p className="text-xs text-muted mt-1">
    Optional: If provided, the public page will show an &quot;Apply&quot; button that opens this link.
  </p>
</div>


              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Description (English)</label>
                <textarea
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Description (Arabic)</label>
                <textarea
                  value={formData.description_ar || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  dir="rtl"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Requirements (English)</label>
                  <textarea
                    value={formData.requirements_en || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements_en: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Requirements (Arabic)</label>
                  <textarea
                    value={formData.requirements_ar || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements_ar: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Responsibilities (English)</label>
                  <textarea
                    value={formData.responsibilities_en || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsibilities_en: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Responsibilities (Arabic)</label>
                  <textarea
                    value={formData.responsibilities_ar || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsibilities_ar: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    dir="rtl"
                  />
                </div>
              </div>

<div>
  <label className="block text-sm font-semibold text-primary mb-2">Application Link (URL)</label>
  <input
    type="url"
    value={formData.application_url || ''}
    onChange={(e) => setFormData(prev => ({ ...prev, application_url: e.target.value }))}
    placeholder="https://..."
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  />
  <p className="text-xs text-muted mt-1">
    Optional: If provided, the public page will show an &quot;Apply&quot; button that opens this link.
  </p>
</div>


              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-5 h-5 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-sm font-semibold text-primary">Active (visible to public)</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  <Save size={20} />
                  {editingId ? 'Update' : 'Save'} Job Posting
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : jobs.length > 0 ? (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className={!job.is_active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{job.title_en}</div>
                      <div className="text-sm text-gray-500" dir="rtl">{job.title_ar}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {job.employment_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.applications_count || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => toggleActive(job.id, job.is_active)}>
                        {job.is_active ? (
                          <Eye size={20} className="text-green-500" />
                        ) : (
                          <EyeOff size={20} className="text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(job)} className="text-primary hover:text-secondary mr-4">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(job.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No job postings yet. Click "Add Job Posting" to create your first job listing.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
