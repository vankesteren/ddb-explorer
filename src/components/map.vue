<template>
  <svg ref="svgRef"></svg>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import * as d3 from 'd3'
import type { RegionData } from "../parse_data.ts"
import type { GeoJSON } from "geojson"

interface Props {
  geojson?: GeoJSON | null
  regionData?: RegionData[] | null
}

const props = withDefaults(defineProps<Props>(), {
  geojson: null,
  regionData: () => null,
})

const svgRef = ref<SVGSVGElement | null>(null)
const tooltipRef = ref<d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null>(null)

const renderMap = () => {
  const svgElement = svgRef.value
  const geojsonData = props.geojson
  const regionData = props.regionData

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
      .attr("class", "absolute invisible bg-white border border-gray-200 rounded-md p-2 pointer-events-none text-sm shadow-md")
      .style("visibility", "hidden")
  }
  const tooltip = tooltipRef.value
  const projection = d3.geoMercator().fitSize([width, height], geojsonData)
  const pathGenerator = d3.geoPath().projection(projection)

  const regionDataMap = new Map<string, any>()
  regionData?.forEach(region => {
    regionDataMap.set(region.region_id, region)
  })

  const d3ColorScale = d3.scaleLinear([0, 10000], ["red", "blue"])

  g.selectAll<SVGPathElement, Feature>('path')
    .data(geojsonData.features)
    .join('path')
    .attr('d', pathGenerator)
    .attr('stroke', '#333')
    .attr('stroke-width', 1)
    .attr('fill', 'transparent')
    .on('mouseover', function(event, d) {
      const bbox = this.getBBox()
      const centerX = bbox.x + bbox.width / 2
      const centerY = bbox.y + bbox.height / 2
      d3.select(this)
        .transition()
        .duration(100)
        .attr('transform', `translate(${centerX}, ${centerY}) scale(1.05) translate(${-centerX}, ${-centerY})`)

      tooltip
        .style("visibility", "visible")
        .html(`
          <div class="font-bold text-gray-800">Region: ${d.properties.statcode}</div>
          <div class="text-gray-600 mt-1">Additional information here</div>
          <div class="text-gray-600 mt-1">Value: ${regionDataMap.get(d.properties.statcode)?.value}</div>
        `)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 10) + "px")
    })
    .on('mouseout', function(event, d) {
      d3.select(this)
        .transition()
        .duration(100)
        .attr('transform', 'scale(1)')

      tooltip.style("visibility", "hidden")
    })
    .on('mousemove', function(event) {
      tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 10) + "px")
    })
    .transition()
    .duration(500)
    .attr('fill', (d) => {
      const color = d3ColorScale(regionDataMap.get(d.properties.statcode)?.value)
      return color || '#ccc'
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
  }
})
</script>
