export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'staff' | 'reader';
  status: 'active' | 'pending' | 'suspended';
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'staff' | 'reader';
  status: 'active' | 'pending';
}
