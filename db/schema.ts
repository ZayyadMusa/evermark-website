import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const brands = sqliteTable("brands", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  markType: text("mark_type").notNull(),
  category: text("category").notNull(),
  market: text("market").notNull(),
  owner: text("owner").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at").notNull(),
}, table => [index("brands_user_created").on(table.userId, table.createdAt)]);

export const reviewLinks = sqliteTable("review_links", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  brandId: text("brand_id").references(() => brands.id),
  url: text("url").notNull(),
  title: text("title").notNull(),
  channel: text("channel").notNull(),
  note: text("note").notNull(),
  status: text("status").notNull(),
  createdAt: integer("created_at").notNull(),
}, table => [index("review_links_user_brand").on(table.userId, table.brandId)]);

export const accessRequests = sqliteTable("access_requests", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  interest: text("interest").notNull(),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at").notNull(),
}, table => [index("access_requests_user_created").on(table.userId, table.createdAt)]);
