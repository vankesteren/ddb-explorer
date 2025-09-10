import * as d3 from 'd3'
import type {
  AppConfig,
  ColorScheme,
  MapColorConfig
} from './types'
import type { RegionData } from './processors/types.ts'

export class MapColor {
  private readonly thresholds: number[]
  private readonly colors: string[]
  private readonly borderColor: string
  private readonly colorScheme: string

  constructor({ minValue, maxValue, numBins = 7, colorScheme = "viridis" }: MapColorConfig) {
    const bins = Math.max(1, Math.floor(numBins))
    const lo = Math.min(minValue, maxValue)
    const hi = Math.max(minValue, maxValue)
    const range = hi - lo || Number.EPSILON
    const binSize = range / bins

    this.thresholds = Array.from({ length: bins + 1 }, (_, i) => lo + i * binSize)
    this.colorScheme = colorScheme
    this.borderColor = this.getOptimalBorderColor()

    if (colorScheme === "no colorscheme") {
      this.colors = Array.from({ length: bins }, () => '#FFFFFF')
    } else {
      const colorInterpolator = this.getColorInterpolator()
      this.colors = Array.from({ length: bins }, (_, i) => colorInterpolator((i + 0.5) / bins))
    }
  }

  private getOptimalBorderColor(): string {
    const dark: ColorScheme[] = ['inferno', 'magma', 'plasma', 'viridis', 'turbo', 'cubehelix', 'cividis', 'interpolate']
    const light: ColorScheme[] = ['warm', 'cool']

    if (this.colorScheme && dark.includes(this.colorScheme)) return '#FFFFFF'
    if (this.colorScheme && light.includes(this.colorScheme)) return '#000000'
    if (this.colorScheme === "no colorscheme") return "#000000"

    return '#000000' // Default fallback
  }

  private getColorInterpolator(): (t: number) => string {
    switch (this.colorScheme) {
      case 'viridis':     return d3.interpolateViridis
      case 'plasma':      return d3.interpolatePlasma
      case 'inferno':     return d3.interpolateInferno
      case 'magma':       return d3.interpolateMagma
      case 'cividis':     return d3.interpolateCividis
      case 'turbo':       return d3.interpolateTurbo
      case 'warm':        return d3.interpolateWarm
      case 'cool':        return d3.interpolateCool
      case 'cubehelix':   return d3.interpolateCubehelixDefault
      case 'interpolate': return d3.interpolateRdYlBu
      case 'no colorscheme': return () => '#FFFFFF'
      default:            return d3.interpolateViridis
    }
  }

  getBinColor(value: number): string {
    if (value === undefined || this.colorScheme === "no colorscheme") {
      return "#FFFFFF" // The default missing data color
    }

    const i = this.thresholds.findIndex((t, j) =>
      value >= t && value < this.thresholds[j + 1]
    )
    return this.colors[i >= 0 ? i : this.colors.length - 1] ?? '#FFFFFF'
  }

  getThresholds() { return this.thresholds }
  getColors() { return this.colors }
  getBorderColor() { return this.borderColor }
}

export function createMapColor(
  config: AppConfig,
  regionData: RegionData[] | undefined
): MapColor {
  switch (config.kind) {
    case "geojson-only": {
      return new MapColor({
        minValue: 0,
        maxValue: 1,
        numBins: 7,
        colorScheme: "no colorscheme"
      })
    }
    case "geojson-datafile": {
      let minValue = config.mapColorConfig.minValue
      let maxValue = config.mapColorConfig.maxValue

      if (config.mapColorConfig.dynamic && regionData?.length) {
        const numericValues = regionData
          .map(r => Number.parseFloat(String(r.value)))
          .filter(v => Number.isFinite(v))
        if (numericValues.length) {
          minValue = Math.min(...numericValues)
          maxValue = Math.max(...numericValues)
        }
      }

      return new MapColor({
        minValue: minValue,
        maxValue: maxValue,
        colorScheme: config.mapColorConfig.colorScheme
      })
    }
    default:
      throw new Error(`Unknown config.kind: ${String((config as any)?.kind)}`)
  }
}
