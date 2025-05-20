<template>
  <div class="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 relative">
    <!-- Main content with map centered -->
    <div class="w-full h-screen flex flex-col">
      <!-- Map container (takes full width/height) -->
      <div class="w-full h-full items-center p-5 lg:m-10">
        <Map
          v-if="isAppLoaded"
          :geojson="geojsonData"
          :regionData="regionData"
          :regionId="appConfig.idColumn"
          :colorScaleDomain="[0, 1]"
          class="w-full h-full"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Spinner />
        </div>

        <!-- Legend in bottom left -->
        <div v-if="isAppLoaded" class="absolute top-0">
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
    <div class="absolute right-0 top-0 h-full flex" :class="{'hidden': !isAppLoaded}">
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
          <div v-for="(values, group) in filterCategoryData" :key="group" class="mb-6">
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

// components
import Map from './components/map.vue'
import LegendHistogram from './components/legend-histogram.vue'
import Spinner from './components/spinner.vue'
import Selection from './components/selection.vue'
import DataImportWizard from "./components/wizard.vue"

import { fetchPublicFile } from './helpers.ts'
import type { GeoJSON } from 'geojson'
import type { RegionData } from "./processors/types"
import { ProcessorFactory } from "./processors/processor_factory"
import { appConfig } from "./config"


// reactive variables
const geojsonData = ref<GeoJSON | null>(null)
const regionData = ref<RegionData[] | null>(null)
const filterCategoryData = ref<{ [key: string]: string[] }>({})
const selectedFilterCategoryData = ref<{ [key: string]: string }>({})
const isControlsOpen = ref(false)
const isAppLoaded = ref(false)

// create the data processor
const dataProcessor = ProcessorFactory.create(appConfig.dataFileName)

async function fetchAndParseFile(url: string) {
  const response = await fetchPublicFile(url)
  const data = await response.json()
  return data
}

function handleSelectionChange(category: string, value: any) {
  selectedFilterCategoryData.value[category] = value
}

watch(selectedFilterCategoryData, async () => {
  const allSelectedNow = Object.keys(filterCategoryData.value).every(key =>
    selectedFilterCategoryData.value[key] !== undefined &&
    selectedFilterCategoryData.value[key] !== null &&
    selectedFilterCategoryData.value[key] !== ''
  );

  if (allSelectedNow) {
    regionData.value = await dataProcessor.getRegionData(
      selectedFilterCategoryData.value,
      appConfig.idColumn,
      appConfig.valueColumn
    )
    isAppLoaded.value = true
  }
}, { deep: true })


async function loadInitialData() {
  geojsonData.value = await fetchAndParseFile(appConfig.geojsonFileName) as GeoJSON
  await dataProcessor.initialize()
  filterCategoryData.value = await dataProcessor.extractFilterCategories(appConfig.categoryColumns)
}

onMounted(() => {
  (async () => {
    await loadInitialData()
  })()
})
</script>
