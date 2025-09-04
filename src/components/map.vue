<template>
  <div class="relative w-full h-full border border-gray-300 rounded p-2">
    <svg class="w-full h-full" ref="svgRef"></svg>
    <button
      v-show="isZoomedRef"
      @click="resetZoom"
      class="absolute bottom-2 right-2 bg-white border border-gray-300 rounded-full p-2 shadow-lg
      hover:bg-gray-50 transition-colors z--10"
      title="Reset zoom"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { createPopper } from '@popperjs/core'
import { MapColor } from "../map_color"
import type { GeoJSON } from "geojson"
import type { MapColorConfig } from "../types"
import type { RegionData } from "../processors/types"

interface Props {
  geojson: GeoJSON | null
  regionData: RegionData[] | null
  regionId: string
  mapColorConfig: MapColorConfig
}

const props = withDefaults(defineProps<Props>(), {
  geojson: null,
  regionData: () => null,
})

const svgRef = ref<SVGSVGElement | null>(null)
const tooltipRef = ref<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null)
const popperInstanceRef = ref(null)
const isZoomedRef = ref(false)
let zoomBehavior = null
let svg = null
let g = null
let currentTransform = d3.zoomIdentity
let mapColor: MapColor | null = null

const virtualElement = ref({
  getBoundingClientRect: () => ({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    x: 0,
    y: 0,
  }),
})

const resetZoom = () => {
  if (svg && zoomBehavior) {
    currentTransform = d3.zoomIdentity // Reset stored transform
    svg.transition()
      .duration(750)
      .call(zoomBehavior.transform, d3.zoomIdentity)
  }
}

const renderMap = () => {
  const geojsonData = props.geojson
  const regionData = props.regionData
  const regionId = props.regionId
  const mapColorConfig = props.mapColorConfig

  if (!svgRef.value || !geojsonData || !regionData) {
    return
  }

  // Create MapColor instance
  mapColor = new MapColor(mapColorConfig)

  svg = d3.select(svgRef.value)
  const width = svgRef.value.getBoundingClientRect().width
  const height = svgRef.value.getBoundingClientRect().height

  // Clear existing content
  svg.selectAll("*").remove()
  g = svg.append('g')

  // Setup zoom behavior
  zoomBehavior = d3.zoom()
    .scaleExtent([0.5, 8])
    .on('zoom', (event) => {
      tooltipRef.value.style("visibility", "hidden")
      const { transform } = event
      currentTransform = transform // Store current transform
      g.attr('transform', transform)

      // Update zoom state
      isZoomedRef.value = transform.k !== 1 || transform.x !== 0 || transform.y !== 0
    })

  svg.call(zoomBehavior)

  // Restore previous zoom state
  if (currentTransform && (currentTransform.k !== 1 || currentTransform.x !== 0 || currentTransform.y !== 0)) {
    svg.call(zoomBehavior.transform, currentTransform)
  }

  if (!tooltipRef.value) {
    tooltipRef.value = d3.select("body").append("div")
      .attr("class", "absolute bg-white border border-gray-200 rounded-md p-2 pointer-events-none text-sm shadow-md z-50")
      .style("visibility", "hidden")
  }
  const projection = d3.geoMercator().fitSize([width, height], geojsonData)
  const pathGenerator = d3.geoPath().projection(projection)

  const regionDataMap = new Map<string, any>()
  regionData.forEach(region => {
    regionDataMap.set(region.regionId, region)
  })

  function getColor(d) {
    const regionInfo = regionDataMap.get(d.properties[regionId])
    if (!regionInfo || !Number.isFinite(regionInfo.value)) {
      return '#ccc' // Default color for missing data
    }
    return mapColor.getBinColor(regionInfo.value)
  }

  const paths = g.selectAll<SVGPathElement, Feature>('path')
    .data(geojsonData.features)
    .join('path')
    .attr('d', pathGenerator)
    .attr('stroke', mapColor.getBorderColor())
    .attr('stroke-width', 0.5)
    .attr('fill', 'transparent');

  paths.attr('fill', (d) => {
      return getColor(d)
    })

  paths.on('mouseover', function(event, d) {
      const bbox = this.getBBox()
      const centerX = bbox.x + bbox.width / 2
      const centerY = bbox.y + bbox.height / 2
      d3.select(this)
        .transition()
        .duration(100)
        .attr('transform', `translate(${centerX}, ${centerY}) scale(1.05) translate(${-centerX}, ${-centerY})`)
        .attr('fill', (d) => {
          return getColor(d)
        })

      // Get region data for tooltip
      const regionInfo = regionDataMap.get(d.properties[regionId])
      const value = regionInfo?.value ?? 'No data'
      const formattedValue = typeof value === 'number' ? value.toLocaleString() : value

      // Set tooltip content
      tooltipRef.value
        .style("visibility", "visible")
        .html(`
          <div class="font-bold text-gray-800">Region: ${d.properties[regionId]}</div>
          <div class="text-gray-600 mt-1">${d.properties.name || 'Unknown'}</div>
          <div class="text-gray-600 mt-1">Value: ${formattedValue}</div>
        `)

      // Get the mouse position relative to the page, accounting for zoom
      const [mouseX, mouseY] = d3.pointer(event, document.body)

      // Update virtual element position
      virtualElement.value.getBoundingClientRect = () => ({
        width: 0,
        height: 0,
        top: mouseY,
        right: mouseX,
        bottom: mouseY,
        left: mouseX,
        x: mouseX,
        y: mouseY,
      })

      if (popperInstanceRef.value) {
        popperInstanceRef.value.update()
      } else if (tooltipRef.value.node()) {
        popperInstanceRef.value = createPopper(virtualElement.value, tooltipRef.value.node(), {
          placement: 'top',
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: document.body,
                padding: 10,
              },
            },
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['bottom', 'right', 'left'],
              },
            },
            {
              name: 'offset',
              options: {
                offset: [0, 10],
              },
            },
          ],
        })
      }
    })
    .on('mouseenter', function(event, d) {
      d3.select(this)
        .attr('fill', (d) => {
          return getColor(d)
        })
    })
    .on('mouseout', function(event, d) {
      d3.select(this)
        .transition()
        .duration(100)
        .attr('transform', 'scale(1)')
        .attr('fill', (d) => {
          return getColor(d)
        })
      tooltipRef.value.style("visibility", "hidden")
    })
    .on('mousemove', function(event) {
      // Get the mouse position relative to the page, accounting for zoom
      const [mouseX, mouseY] = d3.pointer(event, document.body)

      virtualElement.value.getBoundingClientRect = () => ({
        width: 0,
        height: 0,
        top: mouseY,
        right: mouseX,
        bottom: mouseY,
        left: mouseX,
        x: mouseX,
        y: mouseY,
      })

      // Update Popper position
      if (popperInstanceRef.value) {
        popperInstanceRef.value.update()
      }
    })
}

const resizeObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    renderMap()
  }
});

onMounted(() => {
  resizeObserver.observe(svgRef.value);
})

watchEffect(() => {
  if (props.geojson && props.regionData) {
    renderMap()
  }
})

onUnmounted(() => {
  if (tooltipRef.value) {
    tooltipRef.value.remove()
    tooltipRef.value = null
  }
  if (popperInstanceRef.value) {
    popperInstanceRef.value.destroy()
    popperInstanceRef.value = null
  }
  resizeObserver.disconnect()
})
</script>
