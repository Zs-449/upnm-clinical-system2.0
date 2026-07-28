import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  date,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  password: varchar("password", { length: 200 }).notNull(),
  role: varchar("role", { length: 40 }).notNull().default("student"),
  avatarColor: varchar("avatar_color", { length: 20 }).default("#1B3A6B"),
  specialization: varchar("specialization", { length: 120 }),
  online: boolean("online").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientCode: varchar("patient_code", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  bloodType: varchar("blood_type", { length: 8 }).notNull(),
  department: varchar("department", { length: 60 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Active"),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 200 }),
  allergies: text("allergies"),
  chronicConditions: text("chronic_conditions"),
  emergencyContact: varchar("emergency_contact", { length: 200 }),
  healthScore: integer("health_score").default(80),
  lastVisit: date("last_visit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  patientName: varchar("patient_name", { length: 160 }).notNull(),
  doctorName: varchar("doctor_name", { length: 160 }).notNull(),
  department: varchar("department", { length: 60 }).notNull(),
  date: date("date").notNull(),
  time: varchar("time", { length: 20 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("Scheduled"),
  urgency: varchar("urgency", { length: 20 }).default("Routine"),
  symptoms: text("symptoms"),
  queueNumber: integer("queue_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  patientName: varchar("patient_name", { length: 160 }).notNull(),
  doctorName: varchar("doctor_name", { length: 160 }).notNull(),
  medications: jsonb("medications").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("Pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const labResults = pgTable("lab_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  patientName: varchar("patient_name", { length: 160 }).notNull(),
  testName: varchar("test_name", { length: 120 }).notNull(),
  value: varchar("value", { length: 60 }).notNull(),
  unit: varchar("unit", { length: 30 }),
  referenceRange: varchar("reference_range", { length: 60 }),
  flag: varchar("flag", { length: 20 }).default("Normal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  category: varchar("category", { length: 60 }).notNull(),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(20),
  unit: varchar("unit", { length: 30 }).default("units"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  patientName: varchar("patient_name", { length: 160 }).notNull(),
  action: varchar("action", { length: 200 }).notNull(),
  urgency: varchar("urgency", { length: 20 }).default("normal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medicalCertificates = pgTable("medical_certificates", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  patientName: varchar("patient_name", { length: 160 }).notNull(),
  patientCode: varchar("patient_code", { length: 40 }).notNull(),
  doctorName: varchar("doctor_name", { length: 160 }).notNull(),
  diagnosis: varchar("diagnosis", { length: 300 }).notNull(),
  reason: text("reason").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: integer("days").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Active"),
  certificateNo: varchar("certificate_no", { length: 40 }).notNull().unique(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
