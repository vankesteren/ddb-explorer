<template>
  <div>
    <h2 class="text-lg font-medium mb-4 text-gray-700">Map Controls</h2>

    <!-- Filter Controls -->
    <div v-if="hasFilterOptions">
      <div
        v-for="(options, categoryName) in availableFilterOptions"
        :key="categoryName"
        class="mb-6"
      >
        <Selection
          :label="categoryName"
          :options="options"
          @selection-changed="(value) => handleSelectionChanged(categoryName, value)"
        />
      </div>
    </div>
    <div v-else class="text-gray-500 mb-6">
      No filter options available
    </div>

    <!-- Data Import Button -->
    <div class="mt-6 pt-4 border-t border-gray-200">
      <button
        @click="emit('toggle-data-import')"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
        Import Data
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Selection from './selection.vue'

// Props
const props = defineProps({
  availableFilterOptions: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits([
  'filter-changed',
  'toggle-data-import'
])

// Computed properties
const hasFilterOptions = computed(() => {
  return props.availableFilterOptions && Object.keys(props.availableFilterOptions).length > 0
})

// Event handlers
const handleSelectionChanged = (categoryName, value) => {
  emit('filter-changed', categoryName, value)
}
</script>
