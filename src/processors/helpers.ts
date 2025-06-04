import { executeQuery } from "../duckdb"
import type { RegionData } from "./types"

export async function extractFilterCategories(
  categoryCols: string[],
  readFunction: string,
  datasetName: string
): Promise<{ [group: string]: string[] }> {
  const out: { [group: string]: string[] } = {}
  for (const category of categoryCols) {
    const query = `
      SELECT DISTINCT
        CAST(${category} AS VARCHAR) AS ${category}
      FROM
        ${readFunction}('${datasetName}')
    `
    const result = await executeQuery(query)
    out[category] = result.map(item => item[category].toString())
  }
  return out
}

export async function getRegionData(
    selectedCategoryValues: Record<string, string>,
    idColumn: string,
    valueColumn: string,
    readFunction: string,
    datasetName: string
  ): Promise<RegionData[]> {
    const filter_clause = Object.entries(selectedCategoryValues)
      .map(([category_col, value]) => `${category_col} == '${value}'`)
      .join(" AND ");

    const query = `
      SELECT
        ${idColumn} AS regionId,
        CAST(${valueColumn} AS DOUBLE) AS value
      FROM
        ${readFunction}('${datasetName}')
      WHERE
        ${filter_clause}
    `;

    const out = await executeQuery(query);
    return out;
  }
