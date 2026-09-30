import { render, screen } from '@testing-library/react';
import ApprovalsPanel from '../components/ApprovalsPanel';
import { useChatStore } from '../store/useChatStore';

// Mock Zustand store
vi.mock('../store/useChatStore', () => ({
  useChatStore: vi.fn(),
}));

describe('ApprovalsPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    (useChatStore as any).mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      summaryData: null,
      triggerAction: vi.fn(),
      resetChat: vi.fn()
    });

    render(<ApprovalsPanel />);
    expect(screen.getByText(/Talk to me/i)).toBeInTheDocument();
    expect(screen.getByText(/Present me Summary/i)).toBeInTheDocument();
  });

  it('shows loading state when fetching response', () => {
    (useChatStore as any).mockReturnValue({
      messages: [],
      isLoading: true,
      error: null,
      summaryData: null,
      triggerAction: vi.fn(),
      resetChat: vi.fn()
    });

    render(<ApprovalsPanel />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('displays error gracefully when AI fails', () => {
    (useChatStore as any).mockReturnValue({
      messages: [],
      isLoading: false,
      error: 'Failed to reach AI. Please try again.',
      summaryData: null,
      triggerAction: vi.fn(),
      resetChat: vi.fn()
    });

    render(<ApprovalsPanel />);
    expect(screen.getByText(/Failed to reach AI/i)).toBeInTheDocument();
  });
});
