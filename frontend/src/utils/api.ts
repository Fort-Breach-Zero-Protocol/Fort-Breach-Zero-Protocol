import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_BASE_URL || 'http://localhost:3000';

export interface CompleteLevelData {
  level: number;
  points?: number;
}

export interface CompleteLevelResponse {
  message: string;
  user: {
    levelCompleted: number;
    points: {
      level1: number;
      level2: number;
      level3: number;
      level4: number;
      level5: number;
    };
  };
}

export const completeLevel = async (
  level: number,
  points?: number
): Promise<CompleteLevelResponse> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.post<CompleteLevelResponse>(
      `${API_BASE_URL}/user/complete-level`,
      { level, points },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to complete level');
    }
    throw error;
  }
};

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
    throw error;
  }
};

export const getLeaderboard = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/user/leaderboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
    throw error;
  }
};
