// Shared mock factories — imported by test files via jest.mock()

export const mockT = (key: string, fallback?: string) => fallback ?? key;

export const mockUseTranslation = () => ({
  t: mockT,
  i18n: { language: 'en', changeLanguage: jest.fn() },
});

export const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

export const MOCK_HOSPITAL_ID = 'test-hospital-id-123';

export const mockUseHospitalId = jest.fn().mockReturnValue(MOCK_HOSPITAL_ID);

export const mockUseAuth = () => ({
  user: {
    id: 'user-1',
    role: 'HOSPITAL_ADMIN',
    hospitalId: MOCK_HOSPITAL_ID,
    hospitalName: 'Test Hospital',
  },
  logout: jest.fn(),
  login: jest.fn(),
});

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  refresh: jest.fn(),
};
