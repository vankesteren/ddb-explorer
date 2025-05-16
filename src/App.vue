<template>
  <div class="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 relative">
    <!-- Main content with map centered -->
    <div class="w-full h-screen flex flex-col">
      <!-- Map container (takes full width/height) -->
      <div class="w-full h-full items-center p-5 lg:m-10">
        <Map
          v-if="geojsonData"
          :geojson="geojsonData"
          :regionData="regionData"
          :regionId="'cbscode'"
          :colorScaleDomain="[0, 1]"
          class="w-full h-full"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Spinner />
        </div>

        <!-- Legend in bottom left -->
        <div v-if="geojsonData && regionData" class="absolute top-0">
          <LegendHistogram
            :regionData="regionData"
            :title="'Mention Rate'"
            :minValue="0"
            :maxValue="1"
            />
        </div>
      </div>
    </div>

    <!-- Slide-out controls panel -->
    <div class="absolute right-0 top-0 h-full flex">
      <!-- Controls panel toggle button -->
      <button
        @click="isControlsOpen = !isControlsOpen"
        class="bg-gray-800 text-white p-2 h-12 -ml-12 rounded-l-lg flex items-center
        justify-center shadow-lg lg:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :class="{'rotate-180': !isControlsOpen}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Controls panel content -->
      <div
        class="bg-white h-full shadow-lg transition-all duration-300 ease-in-out overflow-y-auto lg:w-80"
        :class="isControlsOpen ? 'w-80' : 'w-0'"
      >
        <div class="p-6" :class="{'opacity-0 lg:opacity-100': !isControlsOpen}">
          <h2 class="text-lg font-medium mb-4 text-gray-700">Map Controls</h2>
          <div v-for="(values, group) in selectionCategoryData" :key="group" class="mb-6">
            <Selection
              :label="group"
              :options="values"
              @selection-changed="(value: any) => handleSelectionChange(group, value)"
            />
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
const isControlsOpen = ref(false); // Controls panel state

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
