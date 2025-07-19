import {
  Column,
  desc,
  getTableColumns,
  or,
  type SQL,
  sql,
  Table,
} from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { db } from "../db/client.ts";

type JoinOptions = {
  joinTable: Table;
  on: SQL;
  selectFromJoinTable?: boolean;
};

export const getItems = async <T>(
  table: T,
  col: Column,
  item: string,
  idColumns: PgColumn[],
  joinOptions?: JoinOptions,
) => {
  await db.execute(
    `SET pg_trgm.similarity_threshold = ${0.2}`,
  );

  const tokens = item.trim().split(/\s+/);
  const queryRank =
    sql`ts_rank(to_tsvector('english', ${col}), websearch_to_tsquery('english', ${item}))`;

  const q = db
    .select({
      ...(joinOptions?.selectFromJoinTable
        ? getTableColumns(joinOptions.joinTable)
        : getTableColumns(table as Table)),
      score: queryRank,
    })
    .from(table as Table);

  if (joinOptions) {
    q.innerJoin(joinOptions.joinTable, joinOptions.on);
  }

  q.crossJoinLateral(
    sql`UNNEST(${sql.param(tokens)}::text[]) AS tokens(t)`,
  )
    .where(
      or(
        sql`tokens.t <<% ${col}`,
        sql`to_tsvector('english', ${col}) @@ websearch_to_tsquery('english', ${item})`,
      ),
    )
    .groupBy(...idColumns)
    .orderBy((t) => desc(t.score));

  return await q as T[];
};
