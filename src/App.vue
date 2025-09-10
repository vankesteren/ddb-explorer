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
        <DataImportWizard @import-done="handleImport" />
      </div>
    </div>

    <!-- Main content - only show when app is ready and regionData exists -->
    <div
      v-if="isAppReady"
      class="w-full h-screen flex transition-all duration-300"
      :class="{ 'filter grayscale opacity-50': isDataImportWizardOpen }"
    >
      <!-- Map container -->
      <div class="flex-1 flex flex-col relative p-5">
        <div class="w-full h-full flex flex-col">
          <div class="flex-1">
            <Map
              :geojson="geojsonData"
              :regionData="regionData"
              :config="config"
              class="w-full h-full"
            />
          </div>
          <!-- Legend below the map -->
          <div class="w-full mt-4">
            <LegendHistogram
              :regionData="regionData"
              :config="config"
            />
          </div>
        </div>
      </div>

      <!-- Controls panel -->
      <ControlPanel
        :availableFilterOptions="availableFilterOptions"
        :config="config"
        @filter-changed="handleFilterChanged"
        @color-scheme-changed="handleColorSchemeChanged"
        @dynamic-legend-changed="handleDynamicLegendChanged"
        @toggle-data-import="toggleDataImportWizard"
      />
    </div>

    <!-- Loading App -->
    <div v-else class="w-full h-full flex items-center justify-center" >
      <ChartSkeleton />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"

// components
import Map from "./components/map.vue"
import LegendHistogram from "./components/legend-histogram.vue"
import ChartSkeleton from "./components/chart-skeleton.vue"
import DataImportWizard from "./components/wizard.vue"
import ControlPanel from "./components/control-panel.vue"

import { fetchPublicFile } from "./helpers.ts"
import type { GeoJSON } from "geojson"
import type { RegionData } from "./processors/types"
import { ProcessorFactory } from "./processors/processor_factory"
import { appConfig } from "./config"
import { validateAppConfig } from "./types.ts"


// App state
const dataProcessor = ref(undefined)
const geojsonData = ref<GeoJSON | null>(undefined)
const regionData = ref<RegionData[] | null>(undefined)

let config = ref(undefined)
config.value = validateAppConfig(appConfig)

// Filter state
const availableFilterOptions = ref<{ [key: string]: string[] }>({})
const selectedFilters = ref<{ [key: string]: string }>({})

// UI state
const isAppReady = ref(false)
const isDataImportWizardOpen = ref(false)

// Map control handlers
function toggleDataImportWizard() {
  isDataImportWizardOpen.value = !isDataImportWizardOpen.value
}

function handleFilterChanged(categoryName: string, value: any) {
  selectedFilters.value[categoryName] = value
}

function handleDynamicLegendChanged(bool: boolean) {
  console.log(`[App] dynamic legend set to: ${bool}`)
  config.value = {
    ...config.value,
    mapColorConfig: { ...config.value.mapColorConfig, dynamic: bool }
  }
}

function handleColorSchemeChanged(s: string) {
  console.log(`[App] color scheme set to: ${s}`)
  config.value = {
    ...config.value,
    mapColorConfig: { ...config.value.mapColorConfig, colorScheme: s }
  }
}

function resetSelectedFilters() {
  selectedFilters.value = {}
}

async function setMapControls(dataProcessor) {
  resetSelectedFilters()
  if (dataProcessor) {
    availableFilterOptions.value = await dataProcessor.extractFilterCategories(config.value.categoryColumns)
    for (const [categoryName, values] of Object.entries(availableFilterOptions.value)) {
      handleFilterChanged(categoryName, values[0])
    }
  } else {
    availableFilterOptions.value = {}
  }
}

// Import handlers
async function handleImport(importedConfig, importedGeojson, importedProcessor) {
  console.log("[App] Importing new data")

  isAppReady.value = false
  toggleDataImportWizard()

  config.value = importedConfig
  geojsonData.value = importedGeojson
  dataProcessor.value = importedProcessor

  await setMapControls(dataProcessor.value)

  isAppReady.value = true
}

// App initialization
async function initializeApp() {
  console.log("[App] App Initializing")

    // Load Geojson
    const geojsonFile = await fetchPublicFile(config.value.geojsonFileName)
    geojsonData.value = JSON.parse(await geojsonFile.text()) as GeoJSON

    // config dependend initialization
    switch (config.value.kind) {
      case "geojson-only":
        break

      case "geojson-datafile":
        // Load data file and create Processor
        const dataFile = await fetchPublicFile(config.value.dataFileName)
        dataProcessor.value = await ProcessorFactory.create(dataFile)

        // Determine the data filters for the map control from the data
        await setMapControls(dataProcessor.value)

        // Either use an initial filtering from the config or one set in the config file
        const initialFilters = config.value.initialFiltering || selectedFilters.value
        regionData.value = await dataProcessor.value.getRegionData(
          initialFilters,
          config.value.idColumnDataFile,
          config.value.valueColumn
        )
        break

      case "geojson-embedded":
        break

      default: {
        throw new Error(`Unhandled AppConfig kind: ${JSON.stringify(config)}`)
      }
    }

  isAppReady.value = true
  console.log("[App] App initialized")
}

// Watch filter if filter changed query new data
watch(selectedFilters, async () => {
  if (isAppReady.value !== true) {
    return
  }
  console.log("[App] Filter changed querying new data")
  regionData.value = await dataProcessor.value.getRegionData(
    selectedFilters.value,
    config.value.idColumnDataFile,
    config.value.valueColumn
  )
}, { deep: true })

onMounted(async () => {
  await initializeApp()
})
</script>
