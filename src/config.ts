export const CATEGORY_COLS = [
  "year",
  "month",
  "disease"
];
export const VALUE_COL = "mention_rate";
export const ID_COL = "cbscode";
export const PARQUET_FILE = "mentions_monthly.parquet";
export const GEOJSON = "nl1869.geojson";

export interface AppConfig {
  categoryColumns: string[]
  valueColumn: string
  idColumn: string
  files: {
    parquet: string
    geojson: string
  };
}

export const appConfig: AppConfig = {
  categoryColumns: CATEGORY_COLS,
  valueColumn: VALUE_COL,
  idColumn: ID_COL,
  files: {
    parquet: PARQUET_FILE,
    geojson: GEOJSON
  }
};

export default appConfig;
