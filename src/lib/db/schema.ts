import { pgTable, text, integer, timestamp, boolean, serial, pgEnum, date, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const dayOfWeekEnum = pgEnum("day_of_week", ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]);
export const activityStatusEnum = pgEnum("activity_status", ["saved", "attended", "cancelled"]);
export const categoryNameEnum = pgEnum("category_name", ["deportes", "academico", "cultural", "bienestar", "talleres"]);
export const dataOperationEnum = pgEnum("data_operation", ["access", "rectify", "cancel", "oppose", "delete"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  areaAcademica: text("area_academica"),
  ciclo: integer("ciclo"),
  consentAcceptedAt: timestamp("consent_accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  semester: text("semester").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userSemesterIdx: uniqueIndex("schedules_user_semester_idx").on(table.userId, table.semester),
}));

export const scheduleBlocks = pgTable("schedule_blocks", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull().references(() => schedules.id, { onDelete: "cascade" }),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  courseName: text("course_name").notNull(),
  classroom: text("classroom"),
}, (table) => ({
  scheduleIdx: index("blocks_schedule_idx").on(table.scheduleId),
}));

export const freeSlots = pgTable("free_slots", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
}, (table) => ({
  userDayIdx: index("free_slots_user_day_idx").on(table.userId, table.dayOfWeek),
}));

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: categoryNameEnum("name").notNull().unique(),
  icon: text("icon").notNull().default("📌"),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  location: text("location"),
  campus: text("campus").notNull().default("Ciudad Universitaria"),
  organizer: text("organizer"),
  startDate: date("start_date").notNull(),
  validUntil: date("valid_until").notNull(),
  capacity: integer("capacity"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("activities_category_idx").on(table.categoryId),
  validUntilIdx: index("activities_valid_until_idx").on(table.validUntil),
}));

export const activitySlots = pgTable("activity_slots", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
}, (table) => ({
  activityIdx: index("activity_slots_activity_idx").on(table.activityId),
  dayIdx: index("activity_slots_day_idx").on(table.dayOfWeek),
}));

export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityId: integer("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  status: activityStatusEnum("status").notNull().default("saved"),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
  attendedAt: timestamp("attended_at"),
}, (table) => ({
  userActivityUnique: uniqueIndex("user_activity_unique_idx").on(table.userId, table.activityId),
}));

export const userInterests = pgTable("user_interests", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: uniqueIndex("user_interests_pk").on(table.userId, table.categoryId),
}));

export const dataProcessingLog = pgTable("data_processing_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  operation: dataOperationEnum("operation").notNull(),
  description: text("description"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by"),
}, (table) => ({
  userIdx: index("data_log_user_idx").on(table.userId),
  operationIdx: index("data_log_operation_idx").on(table.operation),
}));

export const usersRelations = relations(users, ({ many }) => ({
  schedules: many(schedules),
  freeSlots: many(freeSlots),
  userActivities: many(userActivities),
  userInterests: many(userInterests),
  dataProcessingLog: many(dataProcessingLog),
}));

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  user: one(users, { fields: [schedules.userId], references: [users.id] }),
  blocks: many(scheduleBlocks),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  category: one(categories, { fields: [activities.categoryId], references: [categories.id] }),
  slots: many(activitySlots),
  userActivities: many(userActivities),
}));

export const activitySlotsRelations = relations(activitySlots, ({ one }) => ({
  activity: one(activities, { fields: [activitySlots.activityId], references: [activities.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  activities: many(activities),
  userInterests: many(userInterests),
}));
