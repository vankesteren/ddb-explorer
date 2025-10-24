<template>
  <div class="items-center justify-center h-screen w-full">
    <!-- Main content - only show when app is ready and regionData exists -->
    <div v-if="isAppReady" class="w-full h-screen flex">
      <!-- Map container -->
      <div class="flex-1 flex flex-col p-2 bg-gray-50 border border-gray-300 rounded">
        <div class="w-full h-full flex flex-col">
          <div class="flex-1">
            <Map
              :geojson="geojsonData"
              :regionData="regionData"
              :config="config"
            />
          </div>
        </div>

        <!-- Map information -->
        <div class="absolute top-4 left-4">
          <Button v-model="showInfo">
            <InformationIcon />
          </Button>
          <div v-show="showInfo" >
            <MapDescription :config="config" />
          </div>
        </div>

        <!-- Legend -->
        <div class="absolute bottom-4 left-4">
          <Button v-model="showLegend">
            <BarchartIcon />
          </Button>
          <div
            class="absolute bottom-0 ml-2 left-full w-100 h-25 card-box bg-white
             w-100
             max-[485px]:w-[80vw]
             max-[485px]:bottom-full
             max-[485px]:left-0
             max-[485px]:mb-2
             overflow-hidden"
            v-show="showLegend"
          >
            <LegendHistogram
              :regionData="regionData"
              :config="config"
            />
          </div>
        </div>

        <!-- Control Panel -->
        <div class="absolute top-4 right-4">
          <Button v-model="showControls">
            <SettingsIcon />
          </Button>
            <div
              class="absolute top-full right-0 mt-2 overflow-y-auto card-box bg-white w-75"
              style="max-height: calc(100vh - 10rem);"
              v-show="showControls"
            >
            <ControlPanel
              :availableFilterOptions="availableFilterOptions"
              :config="config"
              @filter-changed="handleFilterChanged"
              @map-config-changed="handleMapConfigChanged"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading App -->
    <div v-else
      class="w-full h-full flex items-center justify-center
        animate-[pulse_2s_ease-in-out_infinite]
      "
    >
      <LoadingMap />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"

// icons
import BarchartIcon from "./components/icons/BarchartIcon.vue"
import SettingsIcon from "./components/icons/SettingsIcon.vue"
import InformationIcon from "./components/icons/InformationIcon.vue"
import LoadingMap from "./components/icons/LoadingMap.vue"
import Button from "./components/button.vue"

// components
import Map from "./components/map.vue"
import LegendHistogram from "./components/legend-histogram.vue"
import ControlPanel from "./components/control-panel.vue"
import MapDescription from "./components/map-description.vue"

import { fetchPublicFile } from "./helpers.ts"
import type { GeoJSON } from "geojson"
import type { RegionData } from "./processors/types"
import { ProcessorFactory } from "./processors/processor_factory"
import { appConfig } from "./config"
import { validateAppConfig } from "./types.ts"

// --- UI toggles ---
const showInfo = ref(false)
const showLegend = ref(false)
const showControls = ref(false)

// App state
const dataProcessor = ref<any | undefined>(undefined)
const geojsonData = ref<GeoJSON | null>(undefined)
const regionData = ref<RegionData[] | null>(undefined)

let config = ref<any>(validateAppConfig(appConfig))

// Filter state
const availableFilterOptions = ref<{ [key: string]: string[] }>({})
const selectedFilters = ref<{ [key: string]: string }>({})

// UI state
const isAppReady = ref(false)

// Map control handlers
function handleFilterChanged(categoryName: string, value: any) {
  selectedFilters.value[categoryName] = value
}

function handleMapConfigChanged(value: any) {
  console.log(`[App] map config changed to:`, value)
  config.value = {
    ...config.value,
    mapColorConfig: value
  }
}

function resetSelectedFilters() {
  selectedFilters.value = {}
}

async function setMapControls(dp: any) {
  resetSelectedFilters()
  if (dp) {
    availableFilterOptions.value = await dp.extractFilterCategories(config.value.categoryColumns)
    for (const [categoryName, values] of Object.entries(availableFilterOptions.value)) {
      selectedFilters.value[categoryName] = (values as string[])[0]
    }
  } else {
    availableFilterOptions.value = {}
  }
}

// Import handlers
async function handleImport(importedConfig: any, importedGeojson: GeoJSON, importedProcessor: any) {
  console.log("[App] Importing new data")
  isAppReady.value = false

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

  // config dependent initialization
  switch (config.value.kind) {
    case "geojson-only":
      break
    case "geojson-datafile": {
      const dataFile = await fetchPublicFile(config.value.dataFileName)
      dataProcessor.value = await ProcessorFactory.create(dataFile)
      await setMapControls(dataProcessor.value)

      const initialFilters = config.value.initialFiltering || selectedFilters.value
      regionData.value = await dataProcessor.value.getRegionData(
        initialFilters,
        config.value.idColumnDataFile,
        config.value.valueColumn
      )
      break
    }
    case "geojson-embedded":
      break
    default:
      throw new Error(`Unhandled AppConfig kind: ${JSON.stringify(config.value)}`)
  }

  isAppReady.value = true
  console.log("[App] App initialized")
}

// Watch filter if filter changed query new data
watch(
  selectedFilters,
  async () => {
    if (isAppReady.value !== true) return
    console.log("[App] Filter changed querying new data]")
    regionData.value = await dataProcessor.value.getRegionData(
      selectedFilters.value,
      config.value.idColumnDataFile,
      config.value.valueColumn
    )
  },
  { deep: true }
)

onMounted(async () => {
  await initializeApp()
})
</script>
