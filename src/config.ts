import type {
  AppConfig,
} from "./types.ts"

export const appConfig: AppConfig = {
  kind: "geojson-datafile",
  categoryColumns: ["year", "month", "disease"],
  valueColumn: "mention_rate",
  idColumnGeojson: "cbscode",
  idColumnDataFile: "cbscode",
  dataFileName: "disease_database_v1.2.parquet",
  geojsonFileName: "nl1869.geojson",
  legendTitle: "Mention Rate",
  mapColorConfig: {
    minValue: 0,
    maxValue: 0.4,
    colorScheme: "viridis",
    dynamic: false,
    colorSchemeInverted: false,
  },
  initialFiltering: {
    "year": "1918",
    "month": "10",
    "disease": "influenza",
  },
}

//export const appConfig: AppConfig = {
//  kind: "geojson-only",
//  idColumnGeojson: "cbscode",
//  geojsonFileName: "nl1869.geojson"
//}

export default appConfig
