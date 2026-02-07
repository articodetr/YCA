import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface SectionWrapperProps {
  title: string;
  icon: ReactNode;
  preview: ReactNode;
  editor: ReactNode;
  defaultOpen?: boolean;
}

export default function SectionWrapper({
  title,
  icon,
  preview,
  editor,
  defaultOpen = false,
}: SectionWrapperProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <span className="font-semibold text-primary text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Eye size={14} />
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <div className="p-4">
        <div className="rounded-lg overflow-hidden border border-gray-100 mb-4">
          {preview}
        </div>

        {isOpen && (
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Edit Content</p>
            {editor}
          </div>
        )}
      </div>
    </div>
  );
}
