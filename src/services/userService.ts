import {
  ApiRequestError,
  apiRequest,
  setStoredToken,
} from '@/services/apiClient';
import { loginUser } from '@/services/coursesService';
import type { MessageResponse, User } from '@/types';

type UserResponse = User | { user: User };

export async function getCurrentUser(): Promise<User> {
  const data = await apiRequest<UserResponse>('/users/me');

  if (data && typeof data === 'object' && 'user' in data) {
    const user = data.user;
    return {
      email: user.email,
      selectedCourses: user.selectedCourses ?? [],
    };
  }

  return {
    email: data.email,
    selectedCourses: data.selectedCourses ?? [],
  };
}

async function tryUpdateUser(body: {
  email?: string;
  password?: string;
}): Promise<MessageResponse> {
  const endpoints = [
    { method: 'PUT' as const, path: '/users/me' },
    { method: 'PATCH' as const, path: '/users/me' },
    { method: 'PUT' as const, path: '/auth/password' },
    { method: 'PATCH' as const, path: '/auth/password' },
  ];

  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      return await apiRequest<MessageResponse>(endpoint.path, {
        method: endpoint.method,
        body,
      });
    } catch (error) {
      lastError = error;
      if (error instanceof ApiRequestError && error.status === 404) {
        continue;
      }
      if (error instanceof ApiRequestError && error.status === 405) {
        continue;
      }
      throw error;
    }
  }

  if (lastError instanceof ApiRequestError) {
    throw new Error(
      'Смена данных недоступна: учебный API не поддерживает этот запрос',
    );
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Не удалось обновить данные');
}

export async function changePassword(payload: {
  email: string;
  oldPassword: string;
  password: string;
}): Promise<void> {
  // Проверяем старый пароль и обновляем токен для последующего запроса
  const { token: currentToken } = await loginUser({
    email: payload.email,
    password: payload.oldPassword,
  });
  setStoredToken(currentToken);

  await tryUpdateUser({ password: payload.password });

  const { token } = await loginUser({
    email: payload.email,
    password: payload.password,
  });
  setStoredToken(token);
}

export async function changeEmail(payload: {
  email: string;
  newEmail: string;
  password: string;
}): Promise<void> {
  const { token: currentToken } = await loginUser({
    email: payload.email,
    password: payload.password,
  });
  setStoredToken(currentToken);

  await tryUpdateUser({ email: payload.newEmail });

  const { token } = await loginUser({
    email: payload.newEmail,
    password: payload.password,
  });
  setStoredToken(token);
}
