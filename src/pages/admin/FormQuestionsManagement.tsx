import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, GripVertical, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';

interface FormQuestion {
  id: string;
  form_type: string;
  question_text_en: string;
  question_text_ar: string;
  question_type: string;
  options: Array<{ value: string; label_en: string; label_ar: string }>;
  placeholder_en?: string;
  placeholder_ar?: string;
  is_required: boolean;
  validation_rules: Record<string, any>;
  order_index: number;
  is_active: boolean;
  section?: string;
}

const FORM_TYPES = [
  { value: 'volunteer', label: 'Volunteer Applications' },
  { value: 'partnership', label: 'Partnership Inquiries' },
  { value: 'job_application', label: 'Job Applications' }
];

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date Picker' },
  { value: 'email', label: 'Email Input' },
  { value: 'phone', label: 'Phone Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'file', label: 'File Upload' }
];

export default function FormQuestionsManagement() {
  const [activeTab, setActiveTab] = useState('volunteer');
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<FormQuestion>>({
    form_type: 'volunteer',
    question_text_en: '',
    question_text_ar: '',
    question_type: 'text',
    options: [],
    placeholder_en: '',
    placeholder_ar: '',
    is_required: true,
    is_active: true,
    order_index: 0,
    section: ''
  });
  const [optionInput, setOptionInput] = useState({ value: '', label_en: '', label_ar: '' });

  useEffect(() => {
    loadQuestions(activeTab);
  }, [activeTab]);

  const loadQuestions = async (formType: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_questions')
        .select('*')
        .eq('form_type', formType)
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.question_text_en || !formData.question_text_ar) {
        alert('Please fill in both English and Arabic question text');
        return;
      }

      const dataToSave = {
        ...formData,
        form_type: activeTab,
        order_index: editingId
          ? formData.order_index
          : questions.length > 0
          ? Math.max(...questions.map(q => q.order_index)) + 1
          : 0
      };

      if (editingId) {
        const { error } = await supabase
          .from('form_questions')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('form_questions')
          .insert([dataToSave]);

        if (error) throw error;
      }

      loadQuestions(activeTab);
      resetForm();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error saving question');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('form_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadQuestions(activeTab);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Error deleting question');
    }
  };

  const handleEdit = (question: FormQuestion) => {
    setFormData(question);
    setEditingId(question.id);
    setIsAdding(true);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('form_questions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadQuestions(activeTab);
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      form_type: activeTab,
      question_text_en: '',
      question_text_ar: '',
      question_type: 'text',
      options: [],
      placeholder_en: '',
      placeholder_ar: '',
      is_required: true,
      is_active: true,
      order_index: 0,
      section: ''
    });
    setEditingId(null);
    setIsAdding(false);
    setOptionInput({ value: '', label_en: '', label_ar: '' });
  };

  const addOption = () => {
    if (optionInput.value && optionInput.label_en && optionInput.label_ar) {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), optionInput]
      }));
      setOptionInput({ value: '', label_en: '', label_ar: '' });
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(formData.question_type || '');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Form Questions Management</h1>
            <p className="text-muted mt-1">Manage custom questions for each form type</p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              <Plus size={20} />
              Add Question
            </button>
          )}
        </div>

        <div className="flex gap-2 border-b">
          {FORM_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setActiveTab(type.value);
                resetForm();
              }}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === type.value
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-primary p-6 rounded-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Question Text (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.question_text_en || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, question_text_en: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Question Text (Arabic) *
                  </label>
                  <input
                    type="text"
                    value={formData.question_text_ar || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, question_text_ar: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Question Type *
                  </label>
                  <select
                    value={formData.question_type || 'text'}
                    onChange={(e) => setFormData(prev => ({ ...prev, question_type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Section (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.section || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Personal Info"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_required || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                      className="w-5 h-5 text-primary focus:ring-primary rounded"
                    />
                    <span className="text-sm font-semibold text-primary">Required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-5 h-5 text-primary focus:ring-primary rounded"
                    />
                    <span className="text-sm font-semibold text-primary">Active</span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Placeholder (English)
                  </label>
                  <input
                    type="text"
                    value={formData.placeholder_en || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, placeholder_en: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Placeholder (Arabic)
                  </label>
                  <input
                    type="text"
                    value={formData.placeholder_ar || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, placeholder_ar: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    dir="rtl"
                  />
                </div>
              </div>

              {needsOptions && (
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Options (for {formData.question_type})
                  </label>
                  <div className="space-y-3">
                    {(formData.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm font-mono">{option.value}</span>
                        <span className="text-sm">{option.label_en}</span>
                        <span className="text-sm" dir="rtl">{option.label_ar}</span>
                        <button
                          onClick={() => removeOption(index)}
                          className="ml-auto p-1 hover:bg-red-100 text-red-500 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Value (e.g., option1)"
                        value={optionInput.value}
                        onChange={(e) => setOptionInput(prev => ({ ...prev, value: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Label (English)"
                        value={optionInput.label_en}
                        onChange={(e) => setOptionInput(prev => ({ ...prev, label_en: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Label (Arabic)"
                        value={optionInput.label_ar}
                        onChange={(e) => setOptionInput(prev => ({ ...prev, label_ar: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        dir="rtl"
                      />
                      <button
                        onClick={addOption}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                  {editingId ? 'Update' : 'Save'} Question
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : questions.length > 0 ? (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question.id} className={!question.is_active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <GripVertical size={20} className="text-gray-400" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{question.question_text_en}</div>
                      <div className="text-sm text-gray-500" dir="rtl">{question.question_text_ar}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {question.question_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {question.is_required ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <X size={20} className="text-gray-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(question.id, question.is_active)}
                        className="flex items-center gap-1"
                      >
                        {question.is_active ? (
                          <Eye size={20} className="text-green-500" />
                        ) : (
                          <EyeOff size={20} className="text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(question)}
                        className="text-primary hover:text-secondary mr-4"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
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
            <p className="text-gray-500">
              No questions yet. Click "Add Question" to create your first question for {FORM_TYPES.find(t => t.value === activeTab)?.label}.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
