<template>
  <div class="histogram-legend-container" ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'
import { MapColor } from '../map_color.ts'
import type { RegionData } from '../parse_data.ts'
import type { MapColorConfig } from '../types.ts'

interface Props {
  regionData: RegionData[]
  mapColorConfig: MapColorConfig
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Value Legend',
})

const container = ref<HTMLElement | null>(null)
let svg: any = null
let mapColor: MapColor | null = null

const createMapColor = () => {
  mapColor = new MapColor(props.mapColorConfig)
}

const renderLegend = () => {
  if (!svg || !mapColor) return

  svg.selectAll('*').remove()

  const width = 300
  const height = 150
  const margin = { top: 40, right: 20, bottom: 40, left: 20 }

  const thresholds = mapColor.getThresholds()
  const colors = mapColor.getColors()
  const numBins = colors.length

  const binWidth = (width - margin.left - margin.right) / numBins
  const binHeight = 20

  const group = svg.append('g')

  // Title
  group.append('text')
    .attr('x', width / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .text(props.title)

  // Color bins
  colors.forEach((color, i) => {
    group.append('rect')
      .attr('x', margin.left + i * binWidth)
      .attr('y', margin.top)
      .attr('width', binWidth)
      .attr('height', binHeight)
      .style('fill', color)
      .style('stroke', mapColor!.getBorderColor())
      .style('stroke-width', 0.5)
  })

  // Threshold labels
  thresholds.forEach((threshold, i) => {
    const x = margin.left + i * binWidth

    // Tick marks
    group.append('line')
      .attr('x1', x)
      .attr('y1', margin.top + binHeight + 5)
      .attr('x2', x)
      .attr('y2', margin.top + binHeight + 10)
      .attr('stroke', '#888')

    // Threshold values
    group.append('text')
      .attr('x', x)
      .attr('y', margin.top + binHeight + 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text(d3.format(Math.abs(threshold) < 1 ? '.2f' : ',.0f')(threshold))
  })
}

const getBinColor = (value: number): string => {
  return mapColor ? mapColor.getBinColor(value) : '#ccc'
}

const initialize = () => {
  if (!container.value || !props.regionData.length) return

  svg = d3.select(container.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '150px')
    .attr('viewBox', '0 0 300 150')

  createMapColor()
  renderLegend()
}

onMounted(initialize)

watch(
  () => [props.regionData, props.mapColorConfig],
  () => {
    createMapColor()
    renderLegend()
  },
  { deep: true }
)
</script>
