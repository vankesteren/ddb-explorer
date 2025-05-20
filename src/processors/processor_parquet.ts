import {
  registerFile,
  executeQuery,
  initializeDuckDB,
} from "../duckdb"
import { Processor } from "./processor"
import type { RegionData } from "./types"


export class ParquetProcessor extends Processor {
  constructor(fileName: string) {
    super(fileName);
  }

  async initialize(): Promise<void> {
    await initializeDuckDB()
    await registerFile("dataset.parquet", this.fileName);
  }

  async extractFilterCategories(categoryCols: string[]): Promise<{ [group: string]: string[] }> {
    const out: { [group: string]: string[] } = {};
    for (const category of categoryCols) {
      const query = `
        SELECT DISTINCT
          ${category}
        FROM
          read_parquet('dataset.parquet')
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
        ${valueColumn} AS value
      FROM
        read_parquet('dataset.parquet')
      WHERE
        ${filter_clause}
    `;

    const out = await executeQuery(query);
    return out;
  }
}
