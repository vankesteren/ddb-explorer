<template>
  <div class="histogram-legend-container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import type { RegionData } from "../parse_data.ts"

interface HistogramOptions {
  title?: string;
  bins?: number;
  [key: string]: any;
}

export default defineComponent({
  name: 'HistogramLegend',
  props: {
    regionData: {
      type: Array as PropType<RegionData[]>,
      required: true
    },
    options: {
      type: Object as PropType<HistogramOptions>,
      default: () => ({})
    }
  },
  setup(props) {
    const container = ref<HTMLElement | null>(null);
    let svg: any = null;
    const colorScale = ref(d3.scaleLinear<string>()
      .domain([0, 10000])
      .range(['red', 'blue']));

    const regionDataMap = ref(new Map<string, RegionData>());

    // Create map from regionData array and determine min/max values
    const createDataMap = () => {
      regionDataMap.value.clear();

      if (!props.regionData || props.regionData.length === 0) return;

      // Populate the map
      props.regionData.forEach(region => {
        regionDataMap.value.set(region.region_id, region);
      });

      // Extract values and find min/max
      const values = Array.from(regionDataMap.value.values())
        .map(d => d.value)
        .filter((d): d is number => d !== undefined);

      if (values.length === 0) return;

      const minValue = d3.min(values) || 0;
      const maxValue = d3.max(values) || 10000;

      // Update color scale domain with the actual min/max values
      colorScale.value = d3.scaleLinear<string>()
        .domain([minValue, maxValue])
        .range(['red', 'blue']);
    };

    const initializeChart = () => {
      if (!container.value) return;

      // Create the SVG element
      svg = d3.select(container.value)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '220px')
        .attr('viewBox', '0 0 180 220')
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Create the data map from regionData
      createDataMap();
      updateChart();
    };

    const updateChart = () => {
      if (!svg || regionDataMap.value.size === 0) return;

      // Clear existing content
      svg.selectAll('*').remove();

      addHistogramLegend();
    };

    const addHistogramLegend = () => {
      // Configure legend dimensions and position
      const legendWidth = 180;
      const legendHeight = 220;
      const legendMargin = { top: 20, right: 10, bottom: 30, left: 10 };
      const position = { x: 0, y: 0 };

      // Create a group for the legend
      const legendGroup = svg.append('g')
        .attr('class', 'legend-group')
        .attr('transform', `translate(${position.x}, ${position.y})`);

      // Extract all values for histogram
      const allValues = Array.from(regionDataMap.value.values())
        .map(d => d.value)
        .filter((d): d is number => d !== undefined);

      // Get the domain from the color scale
      const [minValue, maxValue] = colorScale.value.domain();

      // Create histogram bins
      const histogram = d3.histogram()
        .domain(colorScale.value.domain())
        .thresholds(props.options.bins || 8);

      const bins = histogram(allValues);

      // Create scales for the histogram
      const xScale = d3.scaleLinear()
        .domain(colorScale.value.domain())
        .range([legendMargin.left + 20, legendWidth - legendMargin.right - 10]);

      const histHeight = 120;
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length) || 1])
        .nice()
        .range([legendHeight - legendMargin.bottom - 60, legendHeight - legendMargin.bottom - histHeight]);

      // Add title with improved styling
      legendGroup.append('text')
        .attr('class', 'legend-title')
        .attr('text-anchor', 'middle')
        .attr('x', legendWidth / 2)
        .attr('y', legendMargin.top + 5)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(props.options.title || 'Value Distribution');

      // Add histogram bars with improved styling
      legendGroup.selectAll('.histogram-bar')
        .data(bins)
        .join('rect')
        .attr('class', 'histogram-bar')
        .attr('x', d => xScale(d.x0))
        .attr('y', d => yScale(d.length))
        .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr('height', d => legendHeight - legendMargin.bottom - 60 - yScale(d.length))
        .attr('fill', d => colorScale.value((d.x0 + d.x1) / 2))
        .attr('opacity', 0.9)
        .attr('rx', 2) // Slightly rounded bars
        .attr('ry', 2);

      // Add a subtle x-axis - just tick marks without the axis line
      const xAxis = d3.axisBottom(xScale)
        .tickSize(3)
        .tickFormat(d => formatTickValue(d))
        .ticks(4);

      legendGroup.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${legendHeight - legendMargin.bottom - 60})`)
        .call(xAxis)
        .call(g => g.select('.domain').remove()) // Remove the axis line
        .call(g => g.selectAll('.tick line').attr('stroke', '#888').attr('stroke-opacity', 0.5)) // Subtle tick marks
        .call(g => g.selectAll('.tick text').attr('fill', '#555').attr('font-size', '10px')); // Subtle text

      // Add a color gradient legend below the histogram
      const gradientHeight = 15;
      const gradientWidth = legendWidth - legendMargin.left - legendMargin.right - 30;
      const gradientY = legendHeight - legendMargin.bottom - 35;

      // Create a gradient definition
      const gradientId = 'color-gradient-' + Math.random().toString(36).substr(2, 9); // Unique ID
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      // Add color stops based on the color scale
      const colorRange = colorScale.value.range();
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorRange[0]);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorRange[1]);

      // Add the gradient rectangle with rounded corners
      legendGroup.append('rect')
        .attr('x', legendMargin.left + 20)
        .attr('y', gradientY)
        .attr('width', gradientWidth)
        .attr('height', gradientHeight)
        .attr('rx', 4)
        .attr('ry', 4)
        .style('fill', `url(#${gradientId})`);

      // Add min and max labels for the gradient with proper formatting
      legendGroup.append('text')
        .attr('x', legendMargin.left + 20)
        .attr('y', gradientY + gradientHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#555')
        .text(formatLabelValue(minValue));

      legendGroup.append('text')
        .attr('x', legendMargin.left + 20 + gradientWidth)
        .attr('y', gradientY + gradientHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#555')
        .text(formatLabelValue(maxValue));
    };

    // Format values for labels based on magnitude
    const formatLabelValue = (value: number): string => {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
      } else {
        return value.toString();
      }
    };

    // Format values for axis ticks
    const formatTickValue = (value: number): string => {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
      } else {
        return value.toString();
      }
    };

    onMounted(() => {
      initializeChart();
    });

    watch(() => props.regionData, () => {
      createDataMap();
      updateChart();
    }, { deep: true });

    return {
      container
    };
  }
});
</script>

