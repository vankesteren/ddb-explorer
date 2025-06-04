import {
  registerFile,
  initializeDuckDB,
} from "../duckdb"
import { Processor } from "./processor"
import type { RegionData } from "./types"
import {
  extractFilterCategories,
  getRegionData,
  getColumnNames
} from "./helpers"

const DATASET_NAME = "dataset.csv"
const READ_FUNCTION = "read_csv"

export class CsvProcessor extends Processor {
  constructor(file: File) {
    super(file)
  }

  async initialize(): Promise<void> {
    await initializeDuckDB()
    await registerFile(DATASET_NAME, this.file)
  }

  async extractFilterCategories(categoryCols: string[]): Promise<{ [group: string]: string[] }> {
    return extractFilterCategories(categoryCols, READ_FUNCTION, DATASET_NAME)
  }

  async getRegionData(
    selectedCategoryValues: Record<string, string>,
    idColumn: string,
    valueColumn: string
  ): Promise<RegionData[]> {
    return getRegionData(
      selectedCategoryValues,
      idColumn,
      valueColumn,
      READ_FUNCTION,
      DATASET_NAME
    )
  }

  async getColumnNames() {
    return getColumnNames(READ_FUNCTION, DATASET_NAME)
  }
}

