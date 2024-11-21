import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// user
export const users = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
});

// session 
export const sessions = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

// folders
export const folders = sqliteTable('folder', {
	id:text('id').primaryKey(),
	name: text('name').notNull(),
	userId: text('user_id').notNull().references(()=> users.id),
	createdAt: integer('created_at', {mode: 'timestamp'}).notNull(),
});

// plans 
export const plans = sqliteTable('plan', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	folderId: text('folder_id').notNull().references(()=>folders.id),
	createdAt: integer('created_at', {mode: 'timestamp'}).notNull(),
	description:text('description'),
});

// exercises
export const exercises = sqliteTable('exercise', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	isCustom:integer('is_custom', {mode: 'boolean'}).notNull().default(false),
	createdBy:text('created_by').references(()=>users.id),
	createdAt: integer('created_at', {mode: 'timestamp'}).notNull(),
});

// plan exercises (junction for exercises in plan)
export const planExercises = sqliteTable('plan_exercise', {
	id: text('id').primaryKey(),
	planId: text('plan_id').notNull().references(()=> plans.id),
	exerciseId:text('exercise_id').notNull().references(()=> exercises.id),
	order: integer('order').notNull(),
	warmupSets:integer('warmup_sets').notNull().default(0),
	warmupReps:integer('warmup_reps').notNull().default(0),
	workingSets:integer('working_sets').notNull().default(0),
	workingReps:integer('working_reps').notNull().default(0),
	restTime:integer('rest_time').notNull().default(60),
	notes:text('notes'),
});

// workout session
export const workoutSessions = sqliteTable('workout_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
	.notNull()
	.references(() => users.id),
	planId: text('plan_id').notNull().references(()=> plans.id),
	startedAt: integer('started_at', {mode: 'timestamp'}).notNull(),
	completedAt:integer('completed_at', {mode: 'timestamp'}).notNull(),	
});

// sets
export const sets = sqliteTable('set', {
	id: text('id').primaryKey(),
	sessionId:text('session_id').notNull().references(()=>sessions.id),
	exerciseId: text('exercise_id').notNull().references(()=>exercises.id),
	weight:integer('weight').notNull().default(0),
	reps:integer('reps').notNull().default(0),
	isWarmup:integer('is_warmup',{mode: 'boolean'}).notNull().default(false),
	completedAt:integer('completed_at', {mode: 'timestamp'}).notNull(),
});


export type Session = typeof sessions.$inferSelect;

export type User = typeof users.$inferSelect;
