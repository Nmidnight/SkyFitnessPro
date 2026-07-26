export interface DailyDuration {
  from: number;
  to: number;
}

export interface Course {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  workouts: string[];
  difficulty?: string;
  durationInDays?: number;
  dailyDurationInMinutes?: DailyDuration;
  order?: number;
}
