import {
  registerFile,
  executeQuery,
} from "./duckdb.ts"


export interface RegionData {
  regionId: string
  value: string
}


export async function initializeRegionDataSet(fileName: string): void {
  await registerFile("dataset.parquet", `${fileName}`)
}


export async function extractFilterCategories(categoryCols: string[]): { [group: string]: string[] } {
  const out: { [group: string]: string[] } = {};

  for (const category of categoryCols) {
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


export async function getRegionData(
  selectedCategoryValues,
  idColumn,
  valueColumn,
): RegionData[] {
  const filter_clause = Object.entries(selectedCategoryValues)
    .map(([category_col, value]) => `${category_col} == '${value}'`)
    .join(" AND ")

  const query = `
    SELECT
      ${idColumn} AS regionId,
      ${valueColumn} AS value
    FROM
      read_parquet('dataset.parquet')
    WHERE
      ${filter_clause}
  `;

    const out = await executeQuery(query);
    return out
}
