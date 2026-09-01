import { pgTable, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const doctorAvailability = pgTable("doctor_availability", {
  id: serial("id").primaryKey(),
  doctorUserId: integer("doctor_user_id").notNull().unique(),
  weekly: jsonb("weekly").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
