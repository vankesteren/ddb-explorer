const CATEGORY_COLUMNS = ["year", "month", "disease"]
const VALUE_COLUMN = "mention_rate"
const ID_COLUMN_GEOJSON = "cbscode"
const ID_COLUMN_DATA_FILE = "cbscode"
const DATA_FILE_NAME = "disease_database_v1.2.parquet"
const GEOJSON_FILE_NAME = "nl1869.geojson"
const LEGEND_MIN_MAX = [0, 0.4]
const LEGEND_TITLE = "Mention Rate"

//const CATEGORY_COLUMNS = ["A", "B"]
//const VALUE_COLUMN = "value"
//const ID_COLUMN_GEOJSON = "statcode"
//const ID_COLUMN_DATA_FILE = "statcode"
//const DATA_FILE_NAME = "dataset.csv"
//const GEOJSON_FILE_NAME = "nederland.geojson"
//const LEGEND_MIN_MAX = [0, 100]
//const LEGEND_TITLE = "Test"

export interface AppConfig {
    categoryColumns: string[]
    valueColumn: string
    idColumnGeojson: string
    idColumnDataFile: string
    dataFileName: string
    geojsonFileName: string
    legendMinMax: [number, number]
    legendTitle: string
}

export const appConfig: AppConfig = {
    categoryColumns: CATEGORY_COLUMNS,
    valueColumn: VALUE_COLUMN,
    idColumnGeojson: ID_COLUMN_GEOJSON,
    idColumnDataFile: ID_COLUMN_DATA_FILE,
    dataFileName: DATA_FILE_NAME,
    geojsonFileName: GEOJSON_FILE_NAME,
    legendMinMax: LEGEND_MIN_MAX,
    legendTitle: LEGEND_TITLE,
}

export default appConfig
