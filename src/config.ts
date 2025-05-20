export const CATEGORY_COLUMNS = ["year", "month", "disease"]
export const VALUE_COLUMN = "mention_rate"
export const ID_COLUMN = "cbscode"
export const DATA_FILE_NAME = "mentions_monthly.parquet"
export const GEOJSON_FILE_NAME = "nl1869.geojson"

export interface AppConfig {
    categoryColumns: string[]
    valueColumn: string
    idColumn: string
    dataFileName: string
    geojsonFileName: string
}

export const appConfig: AppConfig = {
    categoryColumns: CATEGORY_COLUMNS,
    valueColumn: VALUE_COLUMN,
    idColumn: ID_COLUMN,
    dataFileName: DATA_FILE_NAME,
    geojsonFileName: GEOJSON_FILE_NAME,
}

export default appConfig

