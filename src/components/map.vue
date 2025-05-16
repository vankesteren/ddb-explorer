<template>
  <svg ref="svgRef"></svg>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
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

const renderMap = () => {
  const svgElement = svgRef.value
  const geojsonData = props.geojson
  const regionData = props.regionData
  const regionId = props.regionId
  const colorScaleDomain = props.colorScaleDomain

  if (!svgElement || !geojsonData) {
    return
  }

  const svg = d3.select(svgElement)
  const width = svgElement.getBoundingClientRect().width
  const height = svgElement.getBoundingClientRect().height

  // Clear existing content
  svg.selectAll("*").remove()
  const g = svg.append('g')

  if (!tooltipRef.value) {
    tooltipRef.value = d3.select("body").append("div")
      .attr("class", "absolute bg-white border border-gray-200 rounded-md p-2 pointer-events-none text-sm shadow-md")
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

      // Update virtual element position
      virtualElement.value.getBoundingClientRect = () => ({
        width: 0,
        height: 0,
        top: event.clientY,
        right: event.clientX,
        bottom: event.clientY,
        left: event.clientX,
        x: event.clientX,
        y: event.clientY,
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
      virtualElement.value.getBoundingClientRect = () => ({
        width: 0,
        height: 0,
        top: event.clientY,
        right: event.clientX,
        bottom: event.clientY,
        left: event.clientX,
        x: event.clientX,
        y: event.clientY,
      })

      // Update Popper position
      if (popperInstance.value) {
        popperInstance.value.update()
      }
    })
}

onMounted(() => {
  renderMap()
})

watchEffect(() => {
  if (props.geojson && props.regionData) {
    renderMap()
  }
})

onMounted(() => {
  window.addEventListener('resize', renderMap)
  return () => {
    window.removeEventListener('resize', renderMap)
    if (tooltipRef.value) {
      tooltipRef.value.remove()
      tooltipRef.value = null
    }
    if (popperInstance.value) {
      popperInstance.value.destroy()
      popperInstance.value = null
    }
  }
})
</script>
