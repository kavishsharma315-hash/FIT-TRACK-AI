export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;
  demoUrl?: string;
  isDone?: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  muscleGroup: MuscleGroup;
  exercises: Exercise[];
  completed: boolean;
}

export interface UserStats {
  weight: number[];
  chest: number[];
  arms: number[];
  waist: number[];
  shoulders: number[];
  dates: string[];
}

export interface UserProfile {
  uid: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  totalWorkouts: number;
  waterIntake: number; // in ml
  waterGoal: number; // in ml
  privacy?: {
    publicProfile: boolean;
    twoFactor: boolean;
    activityAlerts: boolean;
  };
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}
