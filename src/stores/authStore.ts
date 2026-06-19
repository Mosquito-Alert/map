import { defineStore } from 'pinia';

import { authApi } from 'src/boot/api';
import type { AuthApiObtainTokenRequest } from 'mosquito-alert';

import { useUserStore } from './userStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await authApi.obtainToken({
          appUserTokenObtainPairRequest: {
            username: username,
            password: password,
          },
        } as AuthApiObtainTokenRequest);

        // Update both state and localStorage
        this.accessToken = response.data.access;
        this.refreshToken = response.data.refresh;
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Load user info after login
        const userStore = useUserStore();
        await userStore.fetchCurrentUser();
      } catch (error) {
        console.error('Login failed:', error);
        // Handle login error (e.g., show a notification)
        throw error;
      }
    },
    logout() {
      // Clear both state and localStorage
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      const userStore = useUserStore();
      userStore.clearUser();
    },
    async initialize() {
      // Check if tokens exist in localStorage on app start
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (accessToken && refreshToken) {
        // Restore tokens to state
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        // Fetch user info
        const userStore = useUserStore();
        try {
          await userStore.fetchCurrentUser();
        } catch (error) {
          // If fetching user fails, tokens might be invalid - clear them
          console.error('Failed to fetch user on initialization:', error);
          this.logout();
        }
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
});
