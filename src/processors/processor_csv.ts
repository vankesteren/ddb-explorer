import {
  registerFile,
  executeQuery,
  initializeDuckDB,
} from "../duckdb"
import { Processor } from "./processor"
import type { RegionData } from "./types"

export class CsvProcessor extends Processor {
  constructor(fileName: string) {
    super(fileName);
  }

  async initialize(): Promise<void> {
    await initializeDuckDB()
    await registerFile("dataset.csv", this.fileName);
  }

  async extractFilterCategories(categoryCols: string[]): Promise<{ [group: string]: string[] }> {
    const out: { [group: string]: string[] } = {};
    for (const category of categoryCols) {
      const query = `
        SELECT DISTINCT
          CAST(${category} AS VARCHAR) AS ${category}
        FROM
          read_csv('dataset.csv')
      `;
      const result = await executeQuery(query)
      out[category] = result.map(item => item[category].toString())
    }
    return out;
  }

  async getRegionData(
    selectedCategoryValues: Record<string, string>,
    idColumn: string,
    valueColumn: string
  ): Promise<RegionData[]> {
    const filter_clause = Object.entries(selectedCategoryValues)
      .map(([category_col, value]) => `${category_col} == '${value}'`)
      .join(" AND ");
    const query = `
      SELECT
        ${idColumn} AS regionId,
        CAST(${valueColumn} AS VARCHAR) AS value
      FROM
        read_csv('dataset.csv')
      WHERE
        ${filter_clause}
    `;
    const out = await executeQuery(query);
    return out;
  }
}
