<template>
    <section class="bg-white">
      <div class="p-4 space-y-6">
        <!-- Filter Options -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3">
            Filter Options
          </h3>

          <div v-if="hasFilterOptions" class="space-y-4">
            <div
              v-for="(options, categoryName) in availableFilterOptions"
              :key="categoryName"
            >
              <Selection
                :label="categoryName"
                :options="options"
                :defaultValue="getDefaultFilterValue(categoryName, options)"
                @selection-changed="(value) => handleFilterChanged(categoryName, value)"
              />
            </div>
          </div>

          <div v-else class="text-gray-500 text-sm italic">
            No filter options available.
          </div>
        </div>

        <!-- Map Options -->
        <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3">
          Map Options
        </h3>

        <div v-if="config?.kind !== 'geojson-only'">
          <div>
            <Selection
              :label="'Color Scheme'"
              :options="colorSchemes"
              :defaultValue="config.mapColorConfig.colorScheme"
              @selection-changed="handleColorSchemeChanged"
            />

            <Checkbox
              class="mt-3"
              label="Invert Color Scheme"
              :defaultValue="config.mapColorConfig.colorSchemeInverted"
              @checkbox-changed="handleColorSchemeInvertedChanged"
            >
              Invert color scheme
            </Checkbox>

            <Checkbox
              class="mt-3"
              label="Dynamic Legend"
              :defaultValue="config.mapColorConfig.dynamic"
              @checkbox-changed="handleDynamicLegendChanged"
            >
              Calculate the min and max from the data
            </Checkbox>

            <InputField
              class="mt-3"
              label="Legend Minimum"
              type="number"
              :defaultValue="config.mapColorConfig.minValue"
              :disabled="config.mapColorConfig.dynamic"
              placeholder="0.00"
              @input-changed="handleLegendMinimumChanged"
            />

            <InputField
              class="mt-3"
              label="Legend Maximum"
              type="number"
              :defaultValue="config.mapColorConfig.maxValue"
              :disabled="config.mapColorConfig.dynamic"
              placeholder="1.00"
              @input-changed="handleLegendMaximumChanged"
            />
          </div>
        </div>

        <div v-else class="text-gray-500 text-sm italic">
          No map options available.
        </div>
      </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import Selection from './selection.vue'
import Checkbox from './checkbox.vue'
import InputField from './input-field.vue'
import { colorSchemes } from '../types.ts'

const props = defineProps({
  availableFilterOptions: {
    type: Object,
    default: () => ({})
  },
  config: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'filter-changed',
  'toggle-data-import',
  'map-config-changed'
])

const hasFilterOptions = computed(() =>
  props.availableFilterOptions && Object.keys(props.availableFilterOptions).length > 0
)

function getDefaultFilterValue (categoryName, options) {
  if (
    props.config.initialFiltering !== undefined &&
    Object.prototype.hasOwnProperty.call(props.config.initialFiltering, categoryName)
  ) {
    return props.config.initialFiltering[categoryName]
  }
  return options?.[0]
}

function handleFilterChanged (categoryName, value) {
  emit('filter-changed', categoryName, value)
}

function handleMapConfigChange (field, value) {
  emit('map-config-changed', {
    ...props.config.mapColorConfig,
    [field]: value
  })
}

function handleColorSchemeChanged (value) {
  handleMapConfigChange('colorScheme', value)
}

function handleColorSchemeInvertedChanged (value) {
  handleMapConfigChange('colorSchemeInverted', value)
}

function handleDynamicLegendChanged (value) {
  handleMapConfigChange('dynamic', value)
}

function handleLegendMinimumChanged (value) {
  handleMapConfigChange('minValue', value)
}

function handleLegendMaximumChanged (value) {
  handleMapConfigChange('maxValue', value)
}
</script>
