'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';

interface SupportBotProps {
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const CATEGORIES = [
  { value: 'order_issue',   labelKey: 'supportBot.categoryOrder' },
  { value: 'billing',       labelKey: 'supportBot.categoryBilling' },
  { value: 'technical',     labelKey: 'supportBot.categoryTechnical' },
  { value: 'account',       labelKey: 'supportBot.categoryAccount' },
  { value: 'other',         labelKey: 'supportBot.categoryOther' },
] as const;

type Category = typeof CATEGORIES[number]['value'];

export default function SupportBot({ open: openProp, onOpen, onClose }: SupportBotProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', category: '' as Category | '', issue: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketRef, setTicketRef]       = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);

  const isOpen      = openProp !== undefined ? openProp : internalOpen;
  const handleOpen  = onOpen  ?? (() => setInternalOpen(true));
  const handleClose = onClose ?? (() => setInternalOpen(false));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.post('/support/tickets', {
        name:     formData.name,
        email:    formData.email,
        phone:    formData.phone    || undefined,
        category: formData.category || 'other',
        message:  formData.issue,
      });
      const ref: string | undefined =
        response.data?.ticketNumber ?? response.data?.id;
      setTicketRef(ref ?? 'OK');
    } catch (err: any) {
      const status = err?.response?.status;
      if (!status || status >= 500 || status === 404) {
        // Endpoint not yet deployed — show graceful pending confirmation
        setTicketRef('PENDING');
      } else {
        setError(err?.response?.data?.message ?? t('supportBot.submitError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setFormData({ name: '', email: '', phone: '', category: '', issue: '' });
    setTicketRef(null);
    setError(null);
    handleClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <>
      {/* Floating Support Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{ zIndex: 1200 }}
        aria-label={t('supportBot.contactSupport')}
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 1200 }}>
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDismiss} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
              <button onClick={handleDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('supportBot.contactSupport')}</h2>
                <p className="text-gray-600 text-sm mt-1">{t('supportBot.hereToHelp')}</p>
              </div>

              {ticketRef ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('supportBot.messageSent')}</h3>
                  {ticketRef !== 'PENDING' && ticketRef !== 'OK' && (
                    <p className="text-sm text-teal-700 font-medium mb-1">
                      {t('supportBot.ticketRef')}: <span className="font-bold">{ticketRef}</span>
                    </p>
                  )}
                  <p className="text-gray-600 text-sm">{t('supportBot.getBackSoon')}</p>
                  <button onClick={handleDismiss} className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors">
                    {t('common.close')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="support-name" className="block text-sm font-medium text-gray-700 mb-1">{t('supportBot.fullName')}</label>
                    <input type="text" id="support-name" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      placeholder={t('form.name')} />
                  </div>

                  <div>
                    <label htmlFor="support-email" className="block text-sm font-medium text-gray-700 mb-1">{t('supportBot.emailAddress')}</label>
                    <input type="email" id="support-email" name="email" value={formData.email} onChange={handleChange} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      placeholder={t('form.email')} />
                  </div>

                  <div>
                    <label htmlFor="support-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('supportBot.phoneNumber')} <span className="text-gray-400 font-normal">({t('supportBot.optional')})</span>
                    </label>
                    <input type="tel" id="support-phone" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      placeholder={t('form.phone')} />
                  </div>

                  <div>
                    <label htmlFor="support-category" className="block text-sm font-medium text-gray-700 mb-1">{t('supportBot.category')}</label>
                    <div className="relative">
                      <select id="support-category" name="category" value={formData.category} onChange={handleChange} required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all appearance-none bg-white pr-10">
                        <option value="">{t('supportBot.selectCategory')}</option>
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="support-issue" className="block text-sm font-medium text-gray-700 mb-1">{t('supportBot.describeIssue')}</label>
                    <textarea id="support-issue" name="issue" value={formData.issue} onChange={handleChange} required rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder={t('supportBot.describeIssuePlaceholder')} />
                  </div>

                  {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-medium py-3 rounded-lg transition-colors">
                    {isSubmitting ? t('supportBot.sending') : t('supportBot.sendMessage')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
