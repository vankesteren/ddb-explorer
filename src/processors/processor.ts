import type { RegionData } from "./types.ts"

export abstract class Processor {
  protected fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  // Template method 1: Initialize the dataset
  abstract initialize(): Promise<void>;

  // Template method 2: Extract filter categories these are used to Create the Map Controls
  abstract extractFilterCategories(categoryCols: string[]): Promise<{ [group: string]: string[] }>;

  // Template method 3: Get region data
  abstract getRegionData(
    selectedCategoryValues: Record<string, string>,
    idColumn: string,
    valueColumn: string
  ): Promise<RegionData[]>;
}
