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
          <div v-for="(values, group) in selectionOptions" :key="group" class="mb-4">
            <Selection
              :label="group"
              :options="values"
              @selection-changed="(value: any) => handleSelectionChange(group, value)"
            />
          </div>
        </div>

        <div class="w-2/3 p-6 flex flex-col items-center justify-center">
          <Generic
            v-if="geojsonData"
            :geojson="geojsonData"
            :regionData="regionData"
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
import { ref, onMounted } from 'vue'
import Generic from './components/generic.vue'
import Spinner from './components/spinner.vue'
import Selection from './components/selection.vue'
import type { GeoJSON } from 'geojson'

import { getRegionData, extractGroupsAndValues } from './parse_data'
import type { RegionData, RegionDataSet } from './parse_data'

// reactive variables
const geojsonData = ref<GeoJSON | null>(null)
const regionData = ref<RegionData[] | null>(null)
const selectionOptions = ref<{ [group: string]: string[] }>({})

let REGIONDATASET: RegionDataSet

async function fetchPublicFile(filename) {
  const isProduction = import.meta.env.PROD;
  const basePath = isProduction ? '/map-explorer/' : '/';
  const response = await fetch(`${basePath}${filename}`);
  return response;
}

async function fetchAndParseFile(url: string) {
  const response = await fetchPublicFile(url)
  const data = await response.json()
  return data
}

async function loadInitialData() {
  const geoJson = await fetchAndParseFile('nederland.geojson') as GeoJSON
  REGIONDATASET = await fetchAndParseFile('region_data.json') as RegionDataSet
  geojsonData.value = geoJson
  selectionOptions.value = extractGroupsAndValues(REGIONDATASET)
}

function handleSelectionChange(group: string, value: string) {
  regionData.value = getRegionData(REGIONDATASET, group, value)
}

onMounted(() => {
  loadInitialData()
})
</script>
