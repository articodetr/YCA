import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Users, FileText, Award, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventCategory?: string;
  maxCapacity?: number;
  currentRegistrations?: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberOfAttendees: number;
  notes: string;
  skills: string;
  isMember: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  numberOfAttendees?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export default function EventRegistrationModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventCategory,
  maxCapacity,
  currentRegistrations,
}: EventRegistrationModalProps) {
  const requiresEmergencyContact = eventCategory === 'children' || eventCategory === 'youth';
  const isFull = maxCapacity && currentRegistrations !== undefined && currentRegistrations >= maxCapacity;

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfAttendees: 1,
    notes: '',
    skills: '',
    isMember: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      numberOfAttendees: 1,
      notes: '',
      skills: '',
      isMember: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    });
    setErrors({});
    setSubmitSuccess(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.numberOfAttendees < 1) {
      newErrors.numberOfAttendees = 'Number of attendees must be at least 1';
    }

    if (requiresEmergencyContact) {
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'Emergency contact name is required for this event';
      }
      if (!formData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = 'Emergency contact phone is required for this event';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (maxCapacity && currentRegistrations !== undefined) {
        const spotsLeft = maxCapacity - currentRegistrations;
        if (formData.numberOfAttendees > spotsLeft) {
          alert(spotsLeft > 0
            ? `Only ${spotsLeft} spot(s) remaining. Please reduce the number of attendees.`
            : 'This event is fully booked.');
          setIsSubmitting(false);
          return;
        }
      }

      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      const insertData: Record<string, any> = {
        event_id: eventId,
        full_name: fullName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        number_of_attendees: formData.numberOfAttendees,
        notes: formData.notes.trim() || null,
        skills: formData.skills.trim() || null,
      };

      if (formData.isMember) {
        insertData.is_member = formData.isMember === 'yes';
      }
      if (formData.emergencyContactName) {
        insertData.emergency_contact_name = formData.emergencyContactName.trim();
      }
      if (formData.emergencyContactPhone) {
        insertData.emergency_contact_phone = formData.emergencyContactPhone.trim();
      }

      const { error } = await supabase.from('event_registrations').insert(insertData);

      if (error) throw error;

      setSubmitSuccess(true);

      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numberOfAttendees' ? parseInt(value) || 1 : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg md:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-t-xl sm:rounded-t-2xl flex items-center justify-between z-10">
              <div className="min-w-0 flex-1 mr-3">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Event Registration</h2>
                <p className="text-white/90 text-xs sm:text-sm mt-1 truncate">{eventTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {submitSuccess ? (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  Registration Successful!
                </h3>
                <p className="text-muted">
                  Thank you for registering. We look forward to seeing you at the event!
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="flex items-center gap-2 text-sm font-semibold text-primary mb-2"
                    >
                      <User size={16} />
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                        errors.firstName
                          ? 'border-red-500'
                          : 'border-gray-200 focus:border-primary'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="flex items-center gap-2 text-sm font-semibold text-primary mb-2"
                    >
                      <User size={16} />
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                        errors.lastName
                          ? 'border-red-500'
                          : 'border-gray-200 focus:border-primary'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-semibold text-primary mb-2"
                  >
                    <Mail size={16} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                      errors.email
                        ? 'border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-sm font-semibold text-primary mb-2"
                  >
                    <Phone size={16} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                      errors.phone
                        ? 'border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {isFull && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-700 font-semibold">This event is fully booked</p>
                    <p className="text-red-600 text-sm mt-1">Please check back later or contact us for waitlist options.</p>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
                    <User size={16} />
                    Are you a registered YCA member?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="isMember" value="yes" checked={formData.isMember === 'yes'} onChange={handleChange} className="text-primary" />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="isMember" value="no" checked={formData.isMember === 'no'} onChange={handleChange} className="text-primary" />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="numberOfAttendees"
                    className="flex items-center gap-2 text-sm font-semibold text-primary mb-2"
                  >
                    <Users size={16} />
                    Number of Attendees *
                  </label>
                  <input
                    type="number"
                    id="numberOfAttendees"
                    name="numberOfAttendees"
                    value={formData.numberOfAttendees}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                      errors.numberOfAttendees
                        ? 'border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                  {errors.numberOfAttendees && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.numberOfAttendees}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="skills"
                    className="flex items-center gap-2 text-sm font-semibold text-primary mb-2"
                  >
                    <Award size={16} />
                    Skills (Optional)
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                    placeholder="Tell us about any skills you have that might be helpful (e.g., photography, event planning, technical skills)"
                  />
                </div>

                {requiresEmergencyContact && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 space-y-4">
                    <p className="text-sm font-semibold text-amber-800">Emergency Contact (Required for this event)</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          id="emergencyContactName"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                          placeholder="Emergency contact name"
                        />
                        {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
                      </div>
                      <div>
                        <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Phone *
                        </label>
                        <input
                          type="tel"
                          id="emergencyContactPhone"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                          placeholder="Emergency contact phone"
                        />
                        {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="notes"
                    className="flex items-center gap-2 text-sm font-semibold text-primary mb-2"
                  >
                    <FileText size={16} />
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                    placeholder="Any special requirements, dietary restrictions, or questions you may have"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Register'
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
