import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: integer('expires_at').notNull()
});

export const folders = sqliteTable('folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
  createdAt: integer('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const plans = sqliteTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  folderId: text('folder_id').notNull(),
  createdAt: integer('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  description: text('description')
});

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isCustom: integer('is_custom').notNull().default(0),
  createdBy: text('created_by'),
  createdAt: integer('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const planExercises = sqliteTable('plan_exercises', {
  id: text('id').primaryKey(),
  planId: text('plan_id').notNull(),
  exerciseId: text('exercise_id').notNull(),
  order: integer('order').notNull(),
  warmupSets: integer('warmup_sets').notNull().default(0),
  warmupReps: integer('warmup_reps').notNull().default(0),
  workingSets: integer('working_sets').notNull().default(0),
  workingReps: integer('working_reps').notNull().default(0),
  restTime: integer('rest_time').notNull().default(60),
  notes: text('notes')
});

export const workoutSessions = sqliteTable('workout_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  planId: text('plan_id').notNull(),
  startedAt: integer('started_at').notNull(),
  completedAt: integer('completed_at').notNull()
});

export const sets = sqliteTable('sets', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  exerciseId: text('exercise_id').notNull(),
  weight: integer('weight').notNull().default(0),
  reps: integer('reps').notNull().default(0),
  isWarmup: integer('is_warmup').notNull().default(0),
  completedAt: integer('completed_at').notNull()
});

// Only export the types you commonly need in your app
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;