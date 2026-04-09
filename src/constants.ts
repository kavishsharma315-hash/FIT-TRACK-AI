import { Exercise, MuscleGroup } from './types';

export const EXERCISES: Record<MuscleGroup, Exercise[]> = {
  Chest: [
    { id: 'c1', name: 'Push-ups', muscleGroup: 'Chest', sets: 3, reps: '15-20' },
    { id: 'c2', name: 'Bench Press', muscleGroup: 'Chest', sets: 4, reps: '8-12' },
    { id: 'c3', name: 'Incline Press', muscleGroup: 'Chest', sets: 3, reps: '10-12' },
    { id: 'c4', name: 'Chest Fly', muscleGroup: 'Chest', sets: 3, reps: '12-15' },
  ],
  Back: [
    { id: 'b1', name: 'Pull-ups', muscleGroup: 'Back', sets: 3, reps: 'Max' },
    { id: 'b2', name: 'Lat Pulldown', muscleGroup: 'Back', sets: 4, reps: '10-12' },
    { id: 'b3', name: 'Deadlift', muscleGroup: 'Back', sets: 3, reps: '5-8' },
    { id: 'b4', name: 'Seated Row', muscleGroup: 'Back', sets: 3, reps: '12-15' },
  ],
  Shoulders: [
    { id: 's1', name: 'Shoulder Press', muscleGroup: 'Shoulders', sets: 4, reps: '8-12' },
    { id: 's2', name: 'Lateral Raise', muscleGroup: 'Shoulders', sets: 3, reps: '15-20' },
    { id: 's3', name: 'Front Raise', muscleGroup: 'Shoulders', sets: 3, reps: '12-15' },
  ],
  Arms: [
    { id: 'a1', name: 'Bicep Curl', muscleGroup: 'Arms', sets: 3, reps: '12-15' },
    { id: 'a2', name: 'Hammer Curl', muscleGroup: 'Arms', sets: 3, reps: '12-15' },
    { id: 'a3', name: 'Tricep Dips', muscleGroup: 'Arms', sets: 3, reps: '12-15' },
    { id: 'a4', name: 'Tricep Pushdown', muscleGroup: 'Arms', sets: 3, reps: '12-15' },
  ],
  Legs: [
    { id: 'l1', name: 'Squats', muscleGroup: 'Legs', sets: 4, reps: '10-12' },
    { id: 'l2', name: 'Lunges', muscleGroup: 'Legs', sets: 3, reps: '12 per leg' },
    { id: 'l3', name: 'Leg Press', muscleGroup: 'Legs', sets: 3, reps: '12-15' },
    { id: 'l4', name: 'Calf Raises', muscleGroup: 'Legs', sets: 4, reps: '15-20' },
  ],
  Abs: [
    { id: 'ab1', name: 'Crunches', muscleGroup: 'Abs', sets: 3, reps: '20' },
    { id: 'ab2', name: 'Plank', muscleGroup: 'Abs', sets: 3, reps: '60 sec' },
    { id: 'ab3', name: 'Leg Raises', muscleGroup: 'Abs', sets: 3, reps: '15' },
    { id: 'ab4', name: 'Russian Twist', muscleGroup: 'Abs', sets: 3, reps: '20 per side' },
  ],
};

export const DIET_PLAN = [
  { time: 'Morning', items: 'Banana + Milk', protein: '8g', calories: '250' },
  { time: 'Lunch', items: 'Roti + Dal + Sabzi', protein: '15g', calories: '450' },
  { time: 'Pre-workout', items: 'Banana + Peanuts', protein: '10g', calories: '300' },
  { time: 'Post-workout', items: 'Eggs or Paneer + Milk', protein: '25g', calories: '350' },
  { time: 'Dinner', items: 'Rice + Chicken or Paneer', protein: '30g', calories: '500' },
];
