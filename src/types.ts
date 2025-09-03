export const colorSchemes = [
  'viridis',
  'plasma',
  'inferno',
  'magma',
  'cividis',
  'turbo',
  'warm',
  'cool',
  'cubehelix',
] as const

export type ColorScheme = typeof colorSchemes[number]

export interface MapColorConfig {
  minValue: number
  maxValue: number
  numBins?: number
  colorScheme?: ColorScheme
}

export interface AppConfig {
    categoryColumns: string[]
    valueColumn: string
    idColumnGeojson: string
    idColumnDataFile: string
    dataFileName: string
    geojsonFileName: string
    legendTitle: string
    mapColorConfig: MapColorConfig
}
