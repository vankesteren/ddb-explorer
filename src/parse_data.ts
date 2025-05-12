import {
  initialize,
  registerFile,
  executeQuery,
} from "./duckdb.ts"

// Set the variables of dataset
// could be initialized differently
// Move to config file or UI interface later
const CATEGORY_COLS = [
  "year",
  "month",
  "disease"
]
const VALUE_COL = "mention_rate"
const ID_COL = "cbscode"
const PARQUET_FILE = "mentions_monthly.parquet"

export interface RegionData {
  regionId: string
  value: string
}


export async function initializeRegionDataSet(): void {
  await initialize()
  await registerFile("dataset.parquet", `${PARQUET_FILE}`)
}


export async function extractGroupsAndValues(): { [group: string]: string[] } {
  const out: { [group: string]: string[] } = {};

  for (const category of CATEGORY_COLS) {
    const query = `
      SELECT DISTINCT
        ${category}
      FROM
        read_parquet('dataset.parquet')
    `;

    const result = await executeQuery(query);
    out[category] = result.map(item => item[category].toString());
  }

  return out;
}

export async function getRegionData(selectedCategoryValues): RegionData[] {
  const filter_clause = Object.entries(selectedCategoryValues)
    .map(([category_col, value]) => `${category_col} == '${value}'`)
    .join(" AND ")

  const query = `
    SELECT
      ${ID_COL} AS regionId,
      ${VALUE_COL} AS value
    FROM
      read_parquet('dataset.parquet')
    WHERE
      ${filter_clause}
  `;

    const out = await executeQuery(query);
    return out
}
