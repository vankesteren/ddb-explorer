<template>
  <div class="flex flex-col items-center justify-center min-h-screen w-full">
    <div class="w-full max-w-6xl bg-white">
      <div class="px-8 py-6 flex items-center">
        <h1 class="text-2xl font-medium text-gray-800">Map Explorer</h1>
        <div class="ml-auto flex items-center gap-4">
        </div>
      </div>

      <div class="h-px w-full bg-gray-200"></div>

      <div class="flex">
        <div class="w-1/3 p-6 border-r border-gray-200">
          <h2 class="text-lg font-medium mb-4 text-gray-700">Map Controls</h2>
          <div v-for="(values, group) in selectionCategoryData" :key="group" class="mb-4">
            <Selection
              :label="group"
              :options="values"
              @selection-changed="(value: any) => handleSelectionChange(group, value)"
            />
          </div>
        </div>

        <div class="w-2/3 p-6 flex flex-col items-center justify-center">
          <Map
            v-if="geojsonData"
            :geojson="geojsonData"
            :regionData="regionData"
            :regionId="'cbscode'"
            :colorScaleDomain="[0, 1]"
            class="w-full h-96"
          />
          <LegendHistogram
            v-if="geojsonData"
            :regionData="regionData"
            :title="'Mention Rate'"
            :minValue="0"
            :maxValue="1"
            class="w-full h-96"
          />
          <div v-else class="text-gray-500 flex items-center justify-center h-96">
            <Spinner />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, computed, watch } from 'vue'
import Map from './components/map.vue'
import LegendHistogram from './components/legend-histogram.vue'
import Spinner from './components/spinner.vue'
import Selection from './components/selection.vue'
import { fetchPublicFile } from './helpers.ts'
import type { GeoJSON } from 'geojson'

import {
  getRegionData,
  extractGroupsAndValues,
  initializeRegionDataSet
} from './parse_data'
import type { RegionData } from './parse_data'

// reactive variables
const geojsonData = ref<GeoJSON | null>(null)
const regionData = ref<RegionData[] | null>(null)
const selectionCategoryData = ref<{ [key: string]: string[] }>({});
const selectedCategoryValues = ref<{ [key: string]: string }>({});

// constants
const GEOJSON = "nl1869.geojson"

async function fetchAndParseFile(url: string) {
  const response = await fetchPublicFile(url)
  const data = await response.json()
  return data
}

async function loadInitialData() {
  const geoJson = await fetchAndParseFile(GEOJSON) as GeoJSON
  await initializeRegionDataSet()
  geojsonData.value = geoJson
  selectionCategoryData.value = await extractGroupsAndValues()
}

function handleSelectionChange(category: string, value: any) {
  selectedCategoryValues.value[category] = value
}

watch(selectedCategoryValues, async () => {
  const allSelectedNow = Object.keys(selectionCategoryData.value).every(key =>
    selectedCategoryValues.value[key] !== undefined &&
    selectedCategoryValues.value[key] !== null &&
    selectedCategoryValues.value[key] !== ''
  );

  if (allSelectedNow) {
    regionData.value = await getRegionData(selectedCategoryValues.value);
  }
}, { deep: true })

onMounted(() => {
  loadInitialData()
})

</script>
