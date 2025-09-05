import * as d3 from 'd3'
import type { MapColorConfig, ColorScheme } from './types'
import type { RegionData } from './processors/types'

export class MapColor {
  private readonly thresholds: number[]
  private readonly colors: string[]
  private readonly borderColor: string

  constructor(
    minValue: number,
    maxValue: number,
    numBins: number = 7,
    colorScheme: ColorScheme = 'viridis'
  ) {
    const bins = Math.max(1, Math.floor(numBins))
    const lo = Math.min(minValue, maxValue)
    const hi = Math.max(minValue, maxValue)

    const range = hi - lo
    const safeRange = range === 0 ? Number.EPSILON : range
    const binSize = safeRange / bins

    this.thresholds = Array.from({ length: bins + 1 }, (_, i) => lo + i * binSize)
    this.borderColor = this.getOptimalBorderColor(colorScheme)

    const colorInterpolator = this.getColorInterpolator(colorScheme)
    this.colors = Array.from({ length: bins }, (_, i) => colorInterpolator((i + 0.5) / bins))
  }

  private getOptimalBorderColor(scheme?: ColorScheme): string {
    const darkSchemes: ReadonlySet<ColorScheme> = new Set([
      'inferno','magma','plasma','viridis','turbo','cubehelix','cividis',
    ])
    const lightSchemes: ReadonlySet<ColorScheme> = new Set(['warm','cool'])
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
    for (let i = 0; i < this.thresholds.length - 1; i++) {
      if (value >= this.thresholds[i] && value < this.thresholds[i + 1]) return i
    }
    if (value >= this.thresholds[this.thresholds.length - 1]) return this.colors.length - 1
    if (value < this.thresholds[0]) return 0
    return this.colors.length - 1
  }

  getBinColor(value: number): string {
    return this.colors[this.findBinIndex(value)] ?? '#ffffff'
  }
  getBinIndex(value: number): number { return this.findBinIndex(value) }
  getThresholds(): readonly number[] { return this.thresholds }
  getColors(): readonly string[] { return this.colors }
  getBorderColor(): string { return this.borderColor }
}

export function createMapColor(
  config: MapColorConfig,
  regionData: RegionData[]
): MapColor {
  let minValue = config.minValue
  let maxValue = config.maxValue

  if (config.dynamic && regionData?.length) {
    const numericValues = regionData
      .map(r => Number.parseFloat(r.value))
      .filter(v => Number.isFinite(v))

    if (numericValues.length) {
      minValue = Math.min(...numericValues)
      maxValue = Math.max(...numericValues)
      if (minValue === maxValue) {
        const eps = Math.max(Math.abs(minValue) * 1e-12, Number.EPSILON)
        minValue -= eps
        maxValue += eps
      }
    }
  }

  return new MapColor(
    minValue,
    maxValue,
    config.numBins ?? 7,
    config.colorScheme ?? 'viridis'
  )
}

