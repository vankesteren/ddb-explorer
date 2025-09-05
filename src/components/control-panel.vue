<template>
  <!-- Controls panel -->
  <div class="lg:flex lg:flex-col lg:w-80 lg:bg-white lg:shadow-lg lg:h-full relative">
    <!-- Mobile/tablet: slide-out panel -->
    <div class="lg:hidden absolute right-0 top-0 h-full flex transition-all duration-300">
      <!-- Controls panel toggle button (mobile only) -->
      <button
        @click="toggleControlsPanel"
        class="bg-gray-800 text-white p-2 h-12 -ml-12 rounded-l-lg flex items-center justify-center shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          :class="{ 'rotate-180': !isControlsPanelOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Mobile controls panel content -->
      <div
        class="bg-white h-full shadow-lg transition-all duration-300 ease-in-out overflow-y-auto"
        :class="isControlsPanelOpen ? 'w-80' : 'w-0'"
      >
        <div class="p-6" :class="{ 'hidden': !isControlsPanelOpen }">
          <ControlsPanelContent
            :available-filter-options="availableFilterOptions"
            :config="config"
            @filter-changed="handleSelectionChanged"
            @color-scheme-changed="handleColorSchemeChanged"
            @toggle-data-import="emit('toggle-data-import')"
            @dynamic-legend-changed="handleDynamicLegendChanged"
          />
        </div>
      </div>
    </div>

    <!-- Desktop: fixed panel content -->
    <div class="hidden lg:block lg:h-full lg:overflow-y-auto lg:p-6">
      <ControlsPanelContent
        :available-filter-options="availableFilterOptions"
        :config="config"
        @filter-changed="handleSelectionChanged"
        @color-scheme-changed="handleColorSchemeChanged"
        @toggle-data-import="emit('toggle-data-import')"
        @dynamic-legend-changed="handleDynamicLegendChanged"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ControlsPanelContent from './control-panel-contents.vue'

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
  'dynamic-legend-changed'
])

// Mobile panel state
const isControlsPanelOpen = ref(false)

// Event handlers
function handleSelectionChanged(categoryName, value) {
  emit('filter-changed', categoryName, value)
}

function handleColorSchemeChanged(value) {
  emit('color-scheme-changed', value)
}

function handleDynamicLegendChanged(value) {
  emit('dynamic-legend-changed', value)
}

function toggleControlsPanel() {
  return isControlsPanelOpen.value = !isControlsPanelOpen.value
}
</script>
