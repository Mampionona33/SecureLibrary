const mockRestoreSession = jest.fn().mockResolvedValue(null);
const mockLogin = jest.fn().mockResolvedValue({
  success: true,
  token: 'mock-token',
  userProfile: {
    user: {
      id: '1',
      username: 'test',
      role: 'reader',
      status: 'active'
    }
  },
  message: 'Login successful'
});
const mockLogout = jest.fn().mockResolvedValue(undefined);

const authService = {
  restoreSession: mockRestoreSession,
  login: mockLogin,
  logout: mockLogout,
};

export { authService };
export default authService;
