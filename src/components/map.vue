<template>
  <div class="relative w-full h-full border border-gray-300 rounded p-2">
    <svg class="w-full h-full" ref="svgRef"></svg>
<button
      v-show="isZoomed"
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
import type { RegionData } from "../parse_data.ts"
import type { GeoJSON } from "geojson"

interface Props {
  geojson: GeoJSON | null
  regionData: RegionData[] | null
  regionId: string
  colorScaleDomain: [string, string]
}

const props = withDefaults(defineProps<Props>(), {
  geojson: null,
  regionData: () => null,
})

const svgRef = ref<SVGSVGElement | null>(null)
const tooltipRef = ref<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null)
const popperInstance = ref(null)
const isZoomed = ref(false)
let zoomBehavior = null
let svg = null
let g = null
let currentTransform = d3.zoomIdentity

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
  const svgElement = svgRef.value
  const geojsonData = props.geojson
  const regionData = props.regionData
  const regionId = props.regionId
  const colorScaleDomain = props.colorScaleDomain

  if (!svgElement || !geojsonData) {
    return
  }

  svg = d3.select(svgElement)
  const width = svgElement.getBoundingClientRect().width
  const height = svgElement.getBoundingClientRect().height

  // Clear existing content
  svg.selectAll("*").remove()
  g = svg.append('g')

  // Setup zoom behavior
  zoomBehavior = d3.zoom()
    .scaleExtent([0.5, 8])
    .on('zoom', (event) => {
      const { transform } = event
      currentTransform = transform // Store current transform
      g.attr('transform', transform)

      // Update zoom state
      isZoomed.value = transform.k !== 1 || transform.x !== 0 || transform.y !== 0
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
  const tooltip = tooltipRef.value
  const projection = d3.geoMercator().fitSize([width, height], geojsonData)
  const pathGenerator = d3.geoPath().projection(projection)

  const regionDataMap = new Map<string, any>()
  regionData?.forEach(region => {
    regionDataMap.set(region.regionId, region)
  })

  const d3ColorScale = d3.scaleLinear(colorScaleDomain, ["white", "red"])
  function getColor(d) {
    const color = d3ColorScale(regionDataMap.get(d.properties[regionId])?.value)
    return color || '#ccc'
  }

  const paths = g.selectAll<SVGPathElement, Feature>('path')
    .data(geojsonData.features)
    .join('path')
    .attr('d', pathGenerator)
    .attr('stroke', '#333')
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

      // Set tooltip content
      tooltip
        .style("visibility", "visible")
        .html(`
          <div class="font-bold text-gray-800">Region: ${d.properties[regionId]}</div>
          <div class="text-gray-600 mt-1">${d.properties.name}</div>
          <div class="text-gray-600 mt-1">Value: ${regionDataMap.get(d.properties[regionId])?.value}</div>
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

      if (popperInstance.value) {
        popperInstance.value.update()
      } else if (tooltip.node()) {
        popperInstance.value = createPopper(virtualElement.value, tooltip.node(), {
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
      tooltip.style("visibility", "hidden")
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
      if (popperInstance.value) {
        popperInstance.value.update()
      }
    })
}

onMounted(() => {
  resizeObserver.observe(svgRef.value);
})

watchEffect(() => {
  if (props.geojson && props.regionData) {
    renderMap()
  }
})

const resizeObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    renderMap()
  }
});



onUnmounted(() => {
  if (tooltipRef.value) {
    tooltipRef.value.remove()
    tooltipRef.value = null
  }
  if (popperInstance.value) {
    popperInstance.value.destroy()
    popperInstance.value = null
  }
})
</script>
