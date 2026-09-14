import { pgTable, text, serial, timestamp, real, varchar } from "drizzle-orm/pg-core";

// Store instrument mappings (NSE symbols to Upstox instrument keys)
export const instruments = pgTable("instruments", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 50 }).notNull().unique(),
  instrumentKey: text("instrument_key").notNull(),
  exchange: varchar("exchange", { length: 10 }).notNull(),
  tradingSymbol: varchar("trading_symbol", { length: 100 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Store scan results for historical tracking
export const scanResults = pgTable("scan_results", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull(), // 1min, 3min, 5min
  direction: varchar("direction", { length: 20 }).notNull(), // BULLISH or BEARISH
  ltp: real("ltp"),
  volumeMultiple: real("volume_multiple"),
  prevDayHigh: real("prev_day_high"),
  prevDayLow: real("prev_day_low"),
  dailyHigh: real("daily_high"),
  currentVolume: real("current_volume"),
  avgVolume: real("avg_volume"),
  triggeredAt: timestamp("triggered_at").defaultNow(),
});
