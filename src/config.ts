import type {
  AppConfig,
  MapColorConfig
} from "./types.ts"

const CATEGORY_COLUMNS = ["year", "month", "disease"]
const INITIAL_FILTERING = {
  "year": "1918",
  "month": "10",
  "disease": "influenza"
}
const VALUE_COLUMN = "mention_rate"
const ID_COLUMN_GEOJSON = "cbscode"
const ID_COLUMN_DATA_FILE = "cbscode"
const DATA_FILE_NAME = "disease_database_v1.2.parquet"
const GEOJSON_FILE_NAME = "nl1869.geojson"
const LEGEND_TITLE = "Mention Rate"

//const CATEGORY_COLUMNS = ["A", "B"]
//const VALUE_COLUMN = "value"
//const ID_COLUMN_GEOJSON = "statcode"
//const ID_COLUMN_DATA_FILE = "statcode"
//const DATA_FILE_NAME = "dataset.csv"
//const GEOJSON_FILE_NAME = "nederland.geojson"
//const LEGEND_MIN_MAX = [0, 100]
//const LEGEND_TITLE = "Test"

const MAP_COLOR_CONFIG: MapColorConfig = {
  minValue: 0,
  maxValue: 0.4,
  colorScheme: "viridis",
  dynamic: false,
}

export const appConfig: AppConfig = {
    categoryColumns: CATEGORY_COLUMNS,
    valueColumn: VALUE_COLUMN,
    idColumnGeojson: ID_COLUMN_GEOJSON,
    idColumnDataFile: ID_COLUMN_DATA_FILE,
    dataFileName: DATA_FILE_NAME,
    geojsonFileName: GEOJSON_FILE_NAME,
    legendTitle: LEGEND_TITLE,
    mapColorConfig: MAP_COLOR_CONFIG,
    initialFiltering: INITIAL_FILTERING,
}

export default appConfig
