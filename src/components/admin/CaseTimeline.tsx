import { useState, useEffect } from 'react';
import {
  MessageSquare,
  RefreshCw,
  UserCheck,
  Pencil,
  Send,
  Loader2,
  Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface CaseNote {
  id: string;
  entity_type: string;
  entity_id: string;
  admin_id: string;
  note_text: string;
  note_type: string;
  created_at: string;
  admin_name?: string;
}

interface CaseTimelineProps {
  entityType: 'wakala_application' | 'booking';
  entityId: string;
  onBeforeAddNote?: () => Promise<void>;
}

const noteTypeConfig: Record<string, { icon: typeof MessageSquare; color: string; bg: string; label: string }> = {
  general: { icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-100', label: 'Note' },
  status_change: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Status Change' },
  assignment: { icon: UserCheck, color: 'text-teal-600', bg: 'bg-teal-100', label: 'Assignment' },
  data_edit: { icon: Pencil, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Data Edit' },
};

export default function CaseTimeline({ entityType, entityId, onBeforeAddNote }: CaseTimelineProps) {
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, adminData } = useAdminAuth();

  useEffect(() => {
    fetchNotes();
  }, [entityId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('case_notes')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const adminIds = [...new Set(data.map((n) => n.admin_id))];
        const { data: admins } = await supabase
          .from('admins')
          .select('id, full_name')
          .in('id', adminIds);

        const adminMap = new Map(admins?.map((a) => [a.id, a.full_name]) || []);
        const enriched = data.map((n) => ({
          ...n,
          admin_name: adminMap.get(n.admin_id) || 'Unknown',
        }));
        setNotes(enriched);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !user) return;

    setSubmitting(true);
    try {
      if (onBeforeAddNote) await onBeforeAddNote();
      const { error } = await supabase.from('case_notes').insert({
        entity_type: entityType,
        entity_id: entityId,
        admin_id: user.id,
        note_text: newNote.trim(),
        note_type: 'general',
      });

      if (error) throw error;
      setNewNote('');
      await fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' at ' + d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border-t border-gray-200 pt-5 mt-5">
      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Case Timeline
      </h4>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && addNote()}
          placeholder="Add a note..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          onClick={addNote}
          disabled={submitting || !newNote.trim()}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {notes.map((note) => {
            const config = noteTypeConfig[note.note_type] || noteTypeConfig.general;
            const Icon = config.icon;
            const isAutomatic = note.note_type !== 'general';

            return (
              <div
                key={note.id}
                className={`flex gap-3 ${isAutomatic ? 'opacity-80' : ''}`}
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-full ${config.bg} flex items-center justify-center mt-0.5`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-800">
                      {note.admin_name}
                    </span>
                    {isAutomatic && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {formatTimestamp(note.created_at)}
                    </span>
                  </div>
                  <p className={`text-sm mt-0.5 ${isAutomatic ? 'text-gray-500 italic' : 'text-gray-700'}`}>
                    {note.note_text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export async function addSystemNote(
  entityType: 'wakala_application' | 'booking',
  entityId: string,
  adminId: string,
  noteText: string,
  noteType: 'status_change' | 'assignment' | 'data_edit'
) {
  try {
    await supabase.from('case_notes').insert({
      entity_type: entityType,
      entity_id: entityId,
      admin_id: adminId,
      note_text: noteText,
      note_type: noteType,
    });
  } catch (error) {
    console.error('Error adding system note:', error);
  }
}
