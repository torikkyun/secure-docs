import axios from "axios";

const API_URL = "http://localhost:3001/api"; // Adjust if your backend runs on a different port

export interface RegisterDto {
  walletAddress: string;
  username: string;
  email: string;
  signature: string;
  message: string;
  publicKey: string;
}

export const authService = {
  async getNonce(walletAddress: string) {
    const response = await axios.get(`${API_URL}/auth/nonce/${walletAddress}`);
    return response.data;
  },

  async login(walletAddress: string, message: string, signature: string) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      walletAddress,
      message,
      signature,
    });
    return response.data;
  },

  async register(data: RegisterDto) {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },
};
