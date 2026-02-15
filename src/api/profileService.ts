import api from './api';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const profileService = {
  // Update profile
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put('/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData) => {
    const response = await api.put('/me/password', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (imageUri: string) => {
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const response = await api.post('/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete avatar
  deleteAvatar: async () => {
    const response = await api.delete('/me/avatar');
    return response.data;
  },
};
