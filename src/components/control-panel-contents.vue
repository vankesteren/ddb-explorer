<template>
  <div class="space-y-4">
    <!-- CARD: MAP CONTROLS -->
    <section class="rounded-lg border border-gray-200 shadow-sm bg-white">
      <!-- Header -->
      <header class="px-4 py-3 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5 2V6l5-2 6 2 5-2v16l-5 2-6-2zM9 4v16M15 6v16"/>
          </svg>
          <h2 class="font-semibold text-gray-900">Map Controls</h2>
        </div>
      </header>

      <!-- Body -->
      <div class="p-4 space-y-6">
        <!-- Filter Options -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3">Filter Options</h3>
          <div v-if="hasFilterOptions" class="space-y-4">
            <div v-for="(options, categoryName) in availableFilterOptions" :key="categoryName">
              <Selection
                :label="categoryName"
                :options="options"
                @selection-changed="(value) => handleFilterChanged(categoryName, value)"
              />
            </div>
          </div>
          <div v-else class="text-gray-500 text-sm italic">
            No filter options available.
          </div>
        </div>

        <!-- Map Options -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3">Map Options</h3>
          <Selection
            :label="'Color Scheme'"
            :options="colorSchemes"
            :defaultValue="config.mapColorConfig.colorScheme"
            @selection-changed="(value) => handleColorSchemeChanged(value)"
          />
        </div>
      </div>
    </section>

    <!-- CARD: DATA IMPORT -->
    <section class="rounded-lg border border-gray-200 shadow-sm bg-white">
      <!-- Header -->
      <header class="px-4 py-3 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"/>
          </svg>
          <div>
            <h2 class="font-semibold text-gray-900">Data Import</h2>
            <p class="text-xs text-gray-500">Load your own map with coloring data</p>
          </div>
        </div>
      </header>

      <!-- Body -->
      <div class="p-4">
        <button
          @click="emit('toggle-data-import')"
          class="w-full flex items-center justify-center gap-2 rounded-md bg-emerald-600 text-white font-medium py-2.5 px-4 hover:bg-emerald-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          Import Data
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Selection from './selection.vue'
import { colorSchemes } from '../types.ts'

// Props
const props = defineProps({
  availableFilterOptions: {
    type: Object,
    default: () => ({})
  },
  config: {
    type: Object
  }
})

// Emits
const emit = defineEmits([
  'filter-changed',
  'toggle-data-import',
  'color-scheme-changed',
])

// Computed properties
const hasFilterOptions = computed(() => {
  return props.availableFilterOptions && Object.keys(props.availableFilterOptions).length > 0
})

// Event handlers
function handleFilterChanged(categoryName, value) {
  emit('filter-changed', categoryName, value)
}

function handleColorSchemeChanged(value) {
  emit('color-scheme-changed', value)
}

</script>
