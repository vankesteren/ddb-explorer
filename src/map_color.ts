import * as d3 from 'd3'
import type {
  MapColorConfig,
  ColorScheme
} from './types'
import type { RegionData } from "./processors/types.ts"


export class MapColor {
  private readonly thresholds: number[]
  private readonly colors: string[]
  private readonly borderColor: string

  constructor(config: MapColorConfig) {
    const {
      minValue,
      maxValue,
      numBins = 7,
      colorScheme = 'viridis',
    } = config

    const bins = Math.max(1, Math.floor(numBins))
    const lo = Math.min(minValue, maxValue)
    const hi = Math.max(minValue, maxValue)
    const binSize = (hi - lo) / bins || 1 // avoid div-by-zero

    this.thresholds = Array.from({ length: bins + 1 }, (_, i) => lo + i * binSize)
    this.borderColor = this.getOptimalBorderColor(colorScheme)

    // Get the D3 color interpolator based on scheme
    const colorInterpolator = this.getColorInterpolator(colorScheme)

    // Use the center of each bin for color sampling
    this.colors = Array.from({ length: bins }, (_, i) => {
      const t = (i + 0.5) / bins
      return colorInterpolator(t)
    })
  }

  private getOptimalBorderColor(scheme?: ColorScheme): string {
    // Darker schemes → white borders; lighter → black
    const darkSchemes: ReadonlySet<ColorScheme> = new Set([
      'inferno', 'magma', 'plasma', 'viridis', 'turbo', 'cubehelix', 'cividis',
    ])
    const lightSchemes: ReadonlySet<ColorScheme> = new Set(['warm', 'cool'])

    if (scheme && darkSchemes.has(scheme)) return '#ffffff'
    if (scheme && lightSchemes.has(scheme)) return '#000000'
    return '#ffffff'
  }

  private getColorInterpolator(scheme?: ColorScheme): (t: number) => string {
    switch (scheme) {
      case 'viridis': return d3.interpolateViridis
      case 'plasma': return d3.interpolatePlasma
      case 'inferno': return d3.interpolateInferno
      case 'magma': return d3.interpolateMagma
      case 'cividis': return d3.interpolateCividis
      case 'turbo': return d3.interpolateTurbo
      case 'warm': return d3.interpolateWarm
      case 'cool': return d3.interpolateCool
      case 'cubehelix': return d3.interpolateCubehelixDefault
      default: return d3.interpolateViridis
    }
  }

  private findBinIndex(value: number): number {
    if (!Number.isFinite(value)) return 0
    // Left-closed, right-open intervals, except the last which is closed
    for (let i = 0; i < this.thresholds.length - 1; i++) {
      if (value >= this.thresholds[i] && value < this.thresholds[i + 1]) {
        return i
      }
    }
    // Handle maximum edge case and out-of-range
    if (value >= this.thresholds[this.thresholds.length - 1]) return this.colors.length - 1
    if (value < this.thresholds[0]) return 0
    return this.colors.length - 1
  }

  getBinColor(value: number): string {
    return this.colors[this.findBinIndex(value)] ?? '#ffffff'
  }

  getBinIndex(value: number): number {
    return this.findBinIndex(value)
  }

  getThresholds(): readonly number[] {
    return this.thresholds
  }

  getColors(): readonly string[] {
    return this.colors
  }

  getBorderColor(): string {
    return this.borderColor
  }
}

/**
 * Creates a MapColor instance with dynamic min/max calculation
 * @param config - MapColorConfig with dynamic flag
 * @param regionData - Array of region data to calculate min/max from
 * @returns MapColor instance
 */
export function createMapColor(
  config: MapColorConfig,
  regionData: RegionData[]
): MapColor {

  if (config.dynamic && regionData.length > 0) {
    // Convert string values to numbers and filter out invalid values
    const numericValues = regionData
      .map(region => parseFloat(region.value))
      .filter(value => Number.isFinite(value))

    if (numericValues.length > 0) {
      config.minValue = Math.min(...numericValues)
      config.maxValue = Math.max(...numericValues)
    }
  }

  return new MapColor(config)
}
