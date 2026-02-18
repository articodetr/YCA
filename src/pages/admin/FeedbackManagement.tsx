import { useState, useEffect } from 'react';
import { Star, Search, Filter, Eye, X, Download, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Ratings {
  access: string;
  communication: string;
  staff: string;
  timeliness: string;
  overall: string;
}

interface EqualityData {
  age_range: string;
  gender: string;
  ethnic_background: string;
}

interface FeedbackRecord {
  id: string;
  service_type: string;
  service_date: string;
  ratings: Ratings;
  what_went_well: string | null;
  what_to_improve: string | null;
  other_comments: string | null;
  would_recommend: string;
  contact_requested: boolean;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  equality_data: EqualityData | null;
  created_at: string;
}

const ratingToNumber = (value: string): number => {
  const map: Record<string, number> = {
    very_satisfied: 5,
    satisfied: 4,
    neutral: 3,
    dissatisfied: 2,
    very_dissatisfied: 1,
  };
  return map[value] || 0;
};

const ratingLabel = (value: string): string => {
  const map: Record<string, string> = {
    very_satisfied: 'Very Satisfied',
    satisfied: 'Satisfied',
    neutral: 'Neutral',
    dissatisfied: 'Dissatisfied',
    very_dissatisfied: 'Very Dissatisfied',
  };
  return map[value] || value;
};

const StarDisplay = ({ count }: { count: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i <= count ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
      />
    ))}
  </div>
);

const RecommendBadge = ({ value }: { value: string }) => {
  const styles: Record<string, string> = {
    yes: 'bg-emerald-100 text-emerald-700',
    no: 'bg-red-100 text-red-700',
    not_sure: 'bg-amber-100 text-amber-700',
  };
  const labels: Record<string, string> = {
    yes: 'Yes',
    no: 'No',
    not_sure: 'Not Sure',
  };
  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${styles[value] || 'bg-gray-100 text-gray-700'}`}>
      {labels[value] || value}
    </span>
  );
};

const formatServiceName = (service: string): string => {
  return service
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function FeedbackManagement() {
  const [items, setItems] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [selected, setSelected] = useState<FeedbackRecord | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes = Array.from(new Set(items.map((i) => i.service_type))).sort();

  const filtered = items.filter((i) => {
    const matchesSearch =
      i.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.contact_name && i.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.contact_email && i.contact_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesService = filterService === 'all' || i.service_type === filterService;
    const matchesRating =
      filterRating === 'all' || i.ratings.overall === filterRating;
    return matchesSearch && matchesService && matchesRating;
  });

  const exportToCSV = () => {
    const headers = [
      'Service',
      'Service Date',
      'Access Rating',
      'Communication Rating',
      'Staff Rating',
      'Timeliness Rating',
      'Overall Rating',
      'What Went Well',
      'What To Improve',
      'Other Comments',
      'Recommend',
      'Contact Requested',
      'Contact Name',
      'Contact Email',
      'Contact Phone',
      'Age Range',
      'Gender',
      'Ethnic Background',
      'Created At',
    ];
    const escape = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };
    const rows = filtered.map((i) => [
      escape(i.service_type),
      i.service_date,
      ratingLabel(i.ratings.access),
      ratingLabel(i.ratings.communication),
      ratingLabel(i.ratings.staff),
      ratingLabel(i.ratings.timeliness),
      ratingLabel(i.ratings.overall),
      escape(i.what_went_well || ''),
      escape(i.what_to_improve || ''),
      escape(i.other_comments || ''),
      i.would_recommend,
      i.contact_requested ? 'Yes' : 'No',
      escape(i.contact_name || ''),
      escape(i.contact_email || ''),
      escape(i.contact_phone || ''),
      escape(i.equality_data?.age_range || ''),
      escape(i.equality_data?.gender || ''),
      escape(i.equality_data?.ethnic_background || ''),
      new Date(i.created_at).toLocaleString(),
    ]);
    const csv = [headers.map((h) => escape(h)), ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const avgOverall =
    items.length > 0
      ? (items.reduce((sum, i) => sum + ratingToNumber(i.ratings.overall), 0) / items.length).toFixed(1)
      : '0';

  const recommendPercent =
    items.length > 0
      ? Math.round((items.filter((i) => i.would_recommend === 'yes').length / items.length) * 100)
      : 0;

  const contactCount = items.filter((i) => i.contact_requested).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Feedback</h1>
          <p className="text-gray-600 text-sm mt-1">View and manage service feedback submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{avgOverall} / 5</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Star className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Would Recommend</p>
              <p className="text-2xl font-bold text-gray-900">{recommendPercent}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Filter className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Requests</p>
              <p className="text-2xl font-bold text-gray-900">{contactCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="all">All Services</option>
            {serviceTypes.map((s) => (
              <option key={s} value={s}>
                {formatServiceName(s)}
              </option>
            ))}
          </select>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="all">All Ratings</option>
            <option value="very_satisfied">Very Satisfied (5)</option>
            <option value="satisfied">Satisfied (4)</option>
            <option value="neutral">Neutral (3)</option>
            <option value="dissatisfied">Dissatisfied (2)</option>
            <option value="very_dissatisfied">Very Dissatisfied (1)</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No feedback found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Overall Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recommend</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Requested</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((i) => (
                  <tr
                    key={i.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(i)}
                  >
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900">
                      {formatServiceName(i.service_type)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {new Date(i.service_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <StarDisplay count={ratingToNumber(i.ratings.overall)} />
                    </td>
                    <td className="px-4 py-3.5">
                      <RecommendBadge value={i.would_recommend} />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {i.contact_requested ? (
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {new Date(i.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(i);
                        }}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {items.length} submissions
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {formatServiceName(selected.service_type)} Feedback
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Service date: {new Date(selected.service_date).toLocaleDateString()} &middot; Submitted: {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Ratings</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                  {(
                    [
                      ['overall', 'Overall'],
                      ['access', 'Access'],
                      ['communication', 'Communication'],
                      ['staff', 'Staff'],
                      ['timeliness', 'Timeliness'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 w-32">{label}</span>
                      <div className="flex items-center gap-3">
                        <StarDisplay count={ratingToNumber(selected.ratings[key])} />
                        <span className="text-xs text-gray-500 w-28 text-right">
                          {ratingLabel(selected.ratings[key])}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Recommend</label>
                  <div className="mt-1">
                    <RecommendBadge value={selected.would_recommend} />
                  </div>
                </div>
              </div>

              {selected.what_went_well && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">What Went Well</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{selected.what_went_well}</p>
                  </div>
                </div>
              )}

              {selected.what_to_improve && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">What Could Be Improved</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{selected.what_to_improve}</p>
                  </div>
                </div>
              )}

              {selected.other_comments && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Other Comments</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{selected.other_comments}</p>
                  </div>
                </div>
              )}

              {selected.contact_requested && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Contact Details</h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                        <p className="text-sm text-gray-900 mt-0.5">{selected.contact_name || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                        <p className="text-sm text-gray-900 mt-0.5">{selected.contact_email || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                        <p className="text-sm text-gray-900 mt-0.5">{selected.contact_phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selected.equality_data && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Equality Monitoring</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Age Range</label>
                        <p className="text-sm text-gray-900 mt-0.5">{selected.equality_data.age_range || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
                        <p className="text-sm text-gray-900 mt-0.5">{selected.equality_data.gender || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Ethnic Background</label>
                        <p className="text-sm text-gray-900 mt-0.5">{selected.equality_data.ethnic_background || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
