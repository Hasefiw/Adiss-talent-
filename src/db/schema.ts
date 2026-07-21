// src/db/schema.ts
import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({}));

// Define the 'actors' table.
export const actors = pgTable('actors', {
  id: text('id').primaryKey(), // custom string ID e.g., 'act_1'
  name: text('name').notNull(),
  type: text('type').notNull(), // 'actor' | 'model' | 'both'
  gender: text('gender').notNull(),
  age: integer('age').notNull(),
  heightCm: integer('height_cm').notNull(),
  eyeColor: text('eye_color').notNull(),
  hairColor: text('hair_color').notNull(),
  hairLength: text('hair_length').notNull(),
  ethnicity: text('ethnicity').notNull(),
  location: text('location').notNull(),
  bio: text('bio').notNull(),
  skills: jsonb('skills').$type<string[]>().default([]),
  experience: jsonb('experience').$type<any[]>().default([]),
  headshotUrl: text('headshot_url').notNull(),
  contactEmail: text('contact_email').notNull(),
  phone: text('phone').notNull(),
  instagram: text('instagram'),
  website: text('website'),
  createdAt: text('created_at').notNull(),
  isVerified: boolean('is_verified').default(false),
  isPremium: boolean('is_premium').default(false),
  professionalPhotos: jsonb('professional_photos').$type<string[]>().default([]),
  languages: jsonb('languages').$type<string[]>().default([]),
  mediaReels: jsonb('media_reels').$type<any>().default({}),
});

// Define the 'casting_calls' table.
export const castingCalls = pgTable('casting_calls', {
  id: text('id').primaryKey(), // custom string ID e.g., 'call_1'
  title: text('title').notNull(),
  company: text('company').notNull(),
  director: text('director').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  type: text('type').notNull(), // 'film' | 'tv' | 'commercial' | 'theater' | 'modeling'
  roles: jsonb('roles').$type<any[]>().default([]),
  dateCreated: text('date_created').notNull(),
  deadline: text('deadline').notNull(),
  budget: text('budget').notNull(),
  currency: text('currency').default('KSh'),
  status: text('status').default('open'), // 'open' | 'closed'
  isVerified: boolean('is_verified').default(false),
  imageUrl: text('image_url'),
});

// Define the 'applications' table.
export const applications = pgTable('applications', {
  id: text('id').primaryKey(), // custom string ID e.g., 'app_1'
  castingCallId: text('casting_call_id').notNull(),
  roleId: text('role_id').notNull(),
  actorId: text('actor_id').notNull(),
  dateApplied: text('date_applied').notNull(),
  status: text('status').default('pending'), // 'pending' | 'shortlisted' | 'invited' | 'accepted' | 'declined'
  message: text('message'),
  selfTapeUrl: text('self_tape_url'),
  audioAuditionUrl: text('audio_audition_url'),
});

// Define the 'news_articles' table.
export const newsArticles = pgTable('news_articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  author: text('author').notNull(),
  imageUrl: text('image_url').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
});

// Define the 'partners' table.
export const partners = pgTable('partners', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  iconName: text('icon_name').default('Film'), // e.g. 'Film', 'Globe', 'Award', 'TrendingUp', 'Shield'
});

// Define the 'payment_requests' table.
export const paymentRequests = pgTable('payment_requests', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userType: text('user_type').notNull(), // 'actor' | 'producer'
  userName: text('user_name').notNull(),
  userPhone: text('user_phone').notNull(),
  userEmail: text('user_email').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('ETB'),
  telebirrAccount: text('telebirr_account').default('+251911381970'),
  transactionRef: text('transaction_ref').notNull(),
  planName: text('plan_name').notNull(),
  status: text('status').default('pending'), // 'pending' | 'approved' | 'rejected'
  dateSubmitted: text('date_submitted').notNull(),
  dateProcessed: text('date_processed'),
  notes: text('notes'),
});


