import { useState, useRef, useEffect } from 'react';
import { Calendar, ExternalLink, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  downloadICSFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getYahooCalendarUrl
} from '../lib/calendar';

interface AddToCalendarProps {
  event: {
    title: string;
    description: string;
    location: string;
    date: string;
    time: string;
  };
  variant?: 'button' | 'icon';
}

export default function AddToCalendar({ event, variant = 'button' }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const calendarEvent = {
    title: event.title,
    description: event.description,
    location: event.location,
    startDate: event.date,
    startTime: event.time,
    duration: 120
  };

  const handleDownloadICS = () => {
    downloadICSFile(calendarEvent);
    setIsOpen(false);
  };

  const handleGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(calendarEvent), '_blank');
    setIsOpen(false);
  };

  const handleOutlookCalendar = () => {
    window.open(getOutlookCalendarUrl(calendarEvent), '_blank');
    setIsOpen(false);
  };

  const handleYahooCalendar = () => {
    window.open(getYahooCalendarUrl(calendarEvent), '_blank');
    setIsOpen(false);
  };

  const calendarOptions = [
    {
      name: 'Google Calendar',
      icon: '📅',
      onClick: handleGoogleCalendar
    },
    {
      name: 'Outlook',
      icon: '📧',
      onClick: handleOutlookCalendar
    },
    {
      name: 'Yahoo Calendar',
      icon: '📆',
      onClick: handleYahooCalendar
    },
    {
      name: 'Apple Calendar',
      icon: '🍎',
      onClick: handleDownloadICS
    },
    {
      name: 'Download ICS',
      icon: '💾',
      onClick: handleDownloadICS
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {variant === 'button' ? (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-transparent border-2 border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold flex items-center gap-2 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ExternalLink size={16} />
          Add to Calendar
        </motion.button>
      ) : (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-sand transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Add to Calendar"
        >
          <Calendar size={20} className="text-primary" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
            style={{ top: '100%', right: 0 }}
          >
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span className="font-semibold text-sm">Add to Calendar</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-secondary rounded p-1 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="py-2">
              {calendarOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.onClick}
                  className="w-full px-4 py-3 text-left hover:bg-sand transition-colors flex items-center gap-3 group"
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-sm font-medium text-primary group-hover:text-secondary">
                    {option.name}
                  </span>
                  {option.name === 'Download ICS' ? (
                    <Download size={14} className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ExternalLink size={14} className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
