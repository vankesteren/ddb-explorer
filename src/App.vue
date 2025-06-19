<template>
  <div class="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 relative" :class="{ 'bg-gray-400': isDataImportWizardOpen }">
    <!-- DataImportWizard overlay -->
    <div
      v-if="isDataImportWizardOpen"
      class="fixed inset-0 z-100 bg-opacity-50 bg-white"
    >
      <div class="bg-white rounded-lg">
        <div class="p-4 border-b border-gray-300 flex justify-between items-center">
          <button
            @click="toggleDataImportWizard"
            class="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <DataImportWizard @import-done="handleImport" />
        </div>
      </div>
    </div>

    <!-- Main content with map centered -->
    <div class="w-full h-screen flex flex-col transition-all duration-300" :class="{ 'filter grayscale opacity-50': isDataImportWizardOpen }">
      <!-- Map container (takes full width/height) -->
      <div class="w-full h-full items-center p-5 lg:m-10">
        <Map
          v-if="isAppReady"
          :geojson="geojsonData"
          :regionData="regionData"
          :regionId="config.idColumnGeojson"
          :colorScaleDomain="config.legendMinMax"
          class="w-full h-full"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Spinner />
        </div>

        <!-- Legend in bottom left -->
        <div v-if="isAppReady" class="absolute top-0">
          <LegendHistogram
            :regionData="regionData"
            :title="config.legendTitle"
            :legendMinMax="config.legendMinMax"
          />
        </div>
      </div>
    </div>

    <!-- Slide-out controls panel -->
    <div class="absolute right-0 top-0 h-full flex transition-all duration-300" :class="{ 'hidden': !isAppReady, 'filter grayscale opacity-50': isDataImportWizardOpen }">
      <!-- Controls panel toggle button -->
      <button
        @click="toggleControlsPanel"
        class="bg-gray-800 text-white p-2 h-12 -ml-12 rounded-l-lg flex items-center
        justify-center shadow-lg lg:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :class="{ 'rotate-180': !isControlsPanelOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Controls panel content -->
      <div
        class="bg-white h-full shadow-lg transition-all duration-300 ease-in-out overflow-y-auto lg:w-80"
        :class="isControlsPanelOpen ? 'w-80' : 'w-0'"
      >
        <div class="p-6" :class="{ 'opacity-0 lg:opacity-100': !isControlsPanelOpen }">
          <h2 class="text-lg font-medium mb-4 text-gray-700">Map Controls</h2>

          <!-- Filter Controls -->
          <div v-for="(options, categoryName) in availableFilterOptions" :key="categoryName" class="mb-6">
            <Selection
              :label="categoryName"
              :options="options"
              @selection-changed="(value) => updateSelectedFilter(categoryName, value)"
            />
          </div>

          <!-- Data Import Button - Moved to bottom -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <button
              @click="toggleDataImportWizard"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import Data
            </button>
          </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"

// components
import Map from "./components/map.vue"
import LegendHistogram from "./components/legend-histogram.vue"
import Spinner from "./components/spinner.vue"
import Selection from "./components/selection.vue"
import DataImportWizard from "./components/wizard.vue"

import { fetchPublicFile } from "./helpers.ts"
import type { GeoJSON } from "geojson"
import type { RegionData } from "./processors/types"
import { ProcessorFactory } from "./processors/processor_factory"
import { appConfig } from "./config"

// App state
const dataProcessor = ref(null)
const config = ref(appConfig)
const geojsonData = ref<GeoJSON | null>(null)
const regionData = ref<RegionData[] | null>(null)

// Filter state
const availableFilterOptions = ref<{ [key: string]: string[] }>({})
const selectedFilters = ref<{ [key: string]: string }>({})

// UI state
const isControlsPanelOpen = ref(false)
const isAppReady = ref(false)
const isDataImportWizardOpen = ref(false)

// UI handlers
function toggleControlsPanel() {
  isControlsPanelOpen.value = !isControlsPanelOpen.value
}

function toggleDataImportWizard() {
  isDataImportWizardOpen.value = !isDataImportWizardOpen.value
}

function updateSelectedFilter(categoryName: string, value: any) {
  selectedFilters.value[categoryName] = value
}

// Import handlers
async function handleImport(importedConfig, importedGeojson, importedProcessor) {
  console.log("Starting import")

  isAppReady.value = false
  isDataImportWizardOpen.value = false // Close wizard after import

  config.value = importedConfig
  geojsonData.value = importedGeojson
  dataProcessor.value = importedProcessor

  availableFilterOptions.value = await dataProcessor.value.extractFilterCategories(config.value.categoryColumns)
  for (const [categoryName, values] of Object.entries(availableFilterOptions.value)) {
    updateSelectedFilter(categoryName, values[0])
  }
  isAppReady.value = true
}

// App initialization
async function initializeApp() {
  const geojsonFile = await fetchPublicFile(config.value.geojsonFileName)
  geojsonData.value = JSON.parse(await geojsonFile.text()) as GeoJSON

  const dataFile = await fetchPublicFile(config.value.dataFileName)
  dataProcessor.value = await ProcessorFactory.create(dataFile)

  availableFilterOptions.value = await dataProcessor.value.extractFilterCategories(config.value.categoryColumns)
}

// Data loading based on filter selection
watch(selectedFilters, async () => {
  const allFiltersSelected = Object.keys(availableFilterOptions.value).every(categoryName =>
    selectedFilters.value[categoryName] !== undefined &&
    selectedFilters.value[categoryName] !== null &&
    selectedFilters.value[categoryName] !== ""
  )

  if (allFiltersSelected && dataProcessor.value) {
    console.log("Fetching new region data")
    regionData.value = await dataProcessor.value.getRegionData(
      selectedFilters.value,
      config.value.idColumnDataFile,
      config.value.valueColumn
    )
    isAppReady.value = true
  }
}, { deep: true })

onMounted(async () => {
  await initializeApp()
})
</script>
