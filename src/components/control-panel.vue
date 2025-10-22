<template>
  <!-- Controls panel -->
  <div class="w-80">
    <ControlsPanelContent
      :available-filter-options="availableFilterOptions"
      :config="config"
      @filter-changed="handleSelectionChanged"
      @map-config-changed="handleMapConfigChanged"
      @toggle-data-import="emit('toggle-data-import')"
    />
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
  'map-config-changed',
])

// Mobile panel state
const isControlsPanelOpen = ref(false)

// Event handlers
function handleSelectionChanged(categoryName, value) {
  emit('filter-changed', categoryName, value)
}

function handleMapConfigChanged(value) {
  emit('map-config-changed', value)
}

function toggleControlsPanel() {
  return isControlsPanelOpen.value = !isControlsPanelOpen.value
}
</script>
