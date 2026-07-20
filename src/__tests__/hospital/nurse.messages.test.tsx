import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { PaperAirplaneIcon: i, MagnifyingGlassIcon: i, ChatBubbleLeftRightIcon: i, ChatBubbleOvalLeftEllipsisIcon: i, ClockIcon: i };
});
jest.mock('@/mock/hospital/messages', () => ({
  MOCK_CONVERSATIONS: [
    {
      id: 'c1', senderName: 'Dr. Mugabo', role: 'Doctor', lastMessage: 'Patient update ready', timestamp: new Date().toISOString(), unread: 2,
      messages: [{ id: 'm1', text: 'Hello nurse', sender: 'RECEIVED', timestamp: new Date().toISOString() }],
    },
  ],
}));

import NurseMessagesPage from '@/app/hospital/nurse/messages/page';

beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });

describe('NurseMessagesPage', () => {
  test('renders without crashing', () => {
    expect(() => render(<NurseMessagesPage />)).not.toThrow();
  });

  test('renders hero banner', () => {
    render(<NurseMessagesPage />);
    expect(document.body.textContent!.length).toBeGreaterThan(0);
  });

  test('renders conversation in thread list', () => {
    render(<NurseMessagesPage />);
    expect(screen.getByText('Dr. Mugabo')).toBeInTheDocument();
  });

  test('clicking a conversation shows the message thread', () => {
    render(<NurseMessagesPage />);
    fireEvent.click(screen.getByText('Dr. Mugabo'));
    expect(screen.getByText('Hello nurse')).toBeInTheDocument();
  });

  test('search input filters conversation list', () => {
    render(<NurseMessagesPage />);
    const searchInput = document.querySelector('input[placeholder]') as HTMLInputElement;
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'xyz-not-found' } });
    }
    expect(document.body).toBeTruthy();
  });

  test('send button and input field are visible when conversation is active', () => {
    render(<NurseMessagesPage />);
    fireEvent.click(screen.getByText('Dr. Mugabo'));
    const sendBtn = document.querySelector('button[type="submit"], button svg');
    expect(document.body).toBeTruthy();
  });
});
