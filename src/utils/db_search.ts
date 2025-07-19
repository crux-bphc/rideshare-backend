import { Column, desc, getTableColumns, or, sql, Table } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { db } from "../db/client.ts";

export const getItems = async <T>(
  table: T,
  col: Column,
  item: string,
  ...idColumns: PgColumn[]
) => {
  await db.execute(
    `SET pg_trgm.similarity_threshold = ${0.3}`,
  );
  const tokens = item.trim().split(/\s+/);
  const queryRank =
    sql`ts_rank(to_tsvector('english', ${col}), websearch_to_tsquery('english', ${item}))`;
  return await db
    .select({
      ...getTableColumns(table as Table),
      score: queryRank,
    })
    .from(table as Table)
    .crossJoinLateral(
      sql`UNNEST(${sql.param(tokens)}::text[]) AS tokens(t)`,
    )
    .where(
      or(
        sql`tokens.t <<% ${col}`,
        sql`to_tsvector('english', ${col}) @@ websearch_to_tsquery('english', ${item})`,
      ),
    )
    .groupBy(...idColumns)
    .orderBy((t) => desc(t.score)) as T[];
};
