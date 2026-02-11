import { useState, useEffect } from 'react';
import { FileText, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FormResponse {
  id: string;
  question_id: string;
  response_text: string;
  response_files: string[];
  question: {
    question_text_en: string;
    question_text_ar: string;
    question_type: string;
    section: string;
  };
}

interface FormResponsesViewerProps {
  applicationId: string;
  formType: 'volunteer' | 'partnership' | 'job_application';
  language?: 'en' | 'ar';
}

export default function FormResponsesViewer({
  applicationId,
  formType,
  language = 'en'
}: FormResponsesViewerProps) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResponses();
  }, [applicationId, formType]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('form_responses')
        .select(`
          id,
          question_id,
          response_text,
          response_files,
          question:form_questions(
            question_text_en,
            question_text_ar,
            question_type,
            section
          )
        `)
        .eq('application_id', applicationId)
        .eq('form_type', formType)
        .order('created_at');

      if (fetchError) throw fetchError;

      setResponses(data || []);
    } catch (err) {
      console.error('Error loading form responses:', err);
      setError('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const groupBySection = (responses: FormResponse[]) => {
    const grouped: Record<string, FormResponse[]> = {};

    responses.forEach(response => {
      const section = response.question?.section || 'other';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(response);
    });

    return grouped;
  };

  const renderResponseValue = (response: FormResponse) => {
    if (!response.response_text && (!response.response_files || response.response_files.length === 0)) {
      return <span className="text-gray-400 italic">No response</span>;
    }

    if (response.question?.question_type === 'file' && response.response_files && response.response_files.length > 0) {
      return (
        <div className="space-y-2">
          {response.response_files.map((fileUrl, index) => (
            <a
              key={index}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-secondary transition-colors"
            >
              <FileText size={18} />
              <span className="underline">View File {index + 1}</span>
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      );
    }

    return <p className="text-gray-900 whitespace-pre-wrap">{response.response_text}</p>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No additional responses found</p>
      </div>
    );
  }

  const groupedResponses = groupBySection(responses);

  return (
    <div className="space-y-6">
      {Object.entries(groupedResponses).map(([section, sectionResponses]) => (
        <div key={section} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent px-6 py-3">
            <h3 className="text-lg font-semibold text-white capitalize">
              {section === 'basic' ? 'Basic Information' :
               section === 'details' ? 'Additional Details' :
               section || 'Other Information'}
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {sectionResponses.map((response) => (
              <div key={response.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-primary mb-1">
                    {language === 'ar' && response.question?.question_text_ar
                      ? response.question.question_text_ar
                      : response.question?.question_text_en || 'Question'}
                  </label>
                </div>
                <div className="text-base">
                  {renderResponseValue(response)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
