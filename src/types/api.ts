export interface ApiError {
  message: string;
}

export interface MessageResponse {
  message: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AddCoursePayload {
  courseId: string;
}

export interface SaveProgressPayload {
  progressData: number[];
}
