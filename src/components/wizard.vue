<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-800">{{ steps[currentStep].title }}</h2>
      <div class="flex items-center mt-4">
        <div v-for="(step, index) in steps" :key="index" class="flex items-center">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            :class="{
              'bg-blue-500 text-white': index < currentStep,
              'bg-blue-600 text-white font-bold': index === currentStep,
              'bg-gray-200 text-gray-600': index > currentStep
            }"
          >
            {{ index + 1 }}
          </div>
          <div v-if="index < steps.length - 1" class="w-10 h-1 bg-gray-200 mx-1"
               :class="{ 'bg-blue-500': index < currentStep }">
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
      <div v-if="currentStep === 0">
        <label class="block text-gray-700 mb-2">Select a geojson file:</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            @change="handleGeojsonFileSelect"
            class="hidden"
            id="geojsonFileInput"
            accept=".geojson,application/geo+json"
          />
          <label for="geojsonFileInput" class="cursor-pointer">
            <div class="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-gray-600">Click to select a geojson file or drag and drop</span>
              <span class="text-sm text-gray-500 mt-1">Supported format: geojson</span>
            </div>
          </label>
          <div v-if="geojsonFile" class="mt-4 text-left">
            <div class="flex items-center">
              <span class="text-green-600">✓</span>
              <span class="ml-2 text-gray-700">{{ geojsonFile.name }}</span>
              <button
                @click.prevent="removeGeojsonFile"
                class="ml-auto text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        <p v-if="errors.geojsonFile" class="text-red-500 text-sm mt-2">{{ errors.geojsonFile }}</p>
      </div>

      <div v-if="currentStep === 1">
        <label class="block text-gray-700 mb-3">
          Select the ID variable from your geojson:
        </label>
        <div class="space-y-3">
          <div v-for="field in geojsonFields" :key="field" class="flex items-center">
            <input
              type="radio"
              :id="'field-' + field"
              name="idVariable"
              :value="field"
              v-model="idVariable"
              class="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <label :for="'field-' + field" class="ml-2 text-gray-700">
              {{ field }}
            </label>
          </div>
        </div>
        <p v-if="errors.idVariable" class="text-red-500 text-sm mt-2">{{ errors.idVariable }}</p>
      </div>

      <div v-if="currentStep === 2">
        <label class="block text-gray-700 mb-2">Select a data file:</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            @change="handleDataFileSelect"
            class="hidden"
            id="dataFileInput"
            accept=".parquet,.csv"
          />
          <label for="dataFileInput" class="cursor-pointer">
            <div class="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-gray-600">Click to select a data file or drag and drop</span>
              <span class="text-sm text-gray-500 mt-1">Supported formats: Parquet, CSV</span>
            </div>
          </label>
          <div v-if="dataFile" class="mt-4 text-left">
            <div class="flex items-center">
              <span class="text-green-600">✓</span>
              <span class="ml-2 text-gray-700">{{ dataFile.name }}</span>
              <button
                @click.prevent="removeDataFile"
                class="ml-auto text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        <p v-if="errors.dataFile" class="text-red-500 text-sm mt-2">{{ errors.dataFile }}</p>
      </div>

      <div v-if="currentStep === 3">
        <label class="block text-gray-700 mb-3">Map the columns:</label>

        <div class="mb-4">
          <label class="block text-gray-600 text-sm mb-1">ID Column (matches with geojson {{ idVariable }}):</label>
          <select
            v-model="config.idColumn"
            class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select column --</option>
            <option v-for="column in dataFileColumns" :key="column" :value="column">
              {{ column }}
            </option>
          </select>
          <p v-if="errors.idColumn" class="text-red-500 text-sm mt-1">{{ errors.idColumn }}</p>
        </div>

        <div class="mb-4">
          <label class="block text-gray-600 text-sm mb-1">Value Column (for choropleth):</label>
          <select
            v-model="config.valueColumn"
            class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select column --</option>
            <option v-for="column in dataFileColumns" :key="column" :value="column">
              {{ column }}
            </option>
          </select>
          <p v-if="errors.valueColumn" class="text-red-500 text-sm mt-1">{{ errors.valueColumn }}</p>
        </div>

        <div class="mb-4">
          <label class="block text-gray-600 text-sm mb-2">Category Columns (select multiple):</label>
          <div class="space-y-2">
            <div v-for="column in availableCategoryColumns" :key="column" class="flex items-center">
              <input
                type="checkbox"
                :id="'category-' + column"
                :value="column"
                v-model="config.categoryColumns"
                class="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <label :for="'category-' + column" class="ml-2 text-gray-700">
                {{ column }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 4">
        <label class="block text-gray-700 mb-3">Configure Legend:</label>

        <div class="mb-4">
          <label class="block text-gray-600 text-sm mb-1">Legend Title:</label>
          <input
            type="text"
            v-model="config.legendTitle"
            class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter legend title"
          />
          <p v-if="errors.legendTitle" class="text-red-500 text-sm mt-1">{{ errors.legendTitle }}</p>
        </div>

        <div class="mb-4">
          <label class="block text-gray-600 text-sm mb-1">Legend Range:</label>
          <div class="flex space-x-2">
            <div class="flex-1">
              <input
                type="number"
                v-model.number="config.legendMinMax[0]"
                class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min value"
              />
            </div>
            <div class="flex-1">
              <input
                type="number"
                v-model.number="config.legendMinMax[1]"
                class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max value"
              />
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-1">Leave empty for auto-calculation from data</p>
          <p v-if="errors.legendMinMax" class="text-red-500 text-sm mt-1">{{ errors.legendMinMax }}</p>
        </div>
      </div>

      <div v-if="currentStep === 5">
        <div class="text-center py-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-semibold mb-2">Ready to import!</h3>
          <div class="bg-gray-50 p-3 rounded-md text-left">
            <p class="text-sm text-gray-600">geojson: <span class="font-medium">{{ geojsonFile?.name }}</span></p>
            <p class="text-sm text-gray-600">ID Variable: <span class="font-medium">{{ idVariable }}</span></p>
            <p class="text-sm text-gray-600">Data File: <span class="font-medium">{{ dataFile?.name }}</span></p>
            <p class="text-sm text-gray-600 mt-1">Mappings:</p>
            <ul class="text-xs text-gray-500 mt-1 ml-4">
              <li>ID Column: {{ config.idColumn }}</li>
              <li>Value Column: {{ config.valueColumn }}</li>
              <li>Category Columns: {{ config.categoryColumns.join(", ") || "None" }}</li>
              <li>Legend Title: {{ config.legendTitle || "Not set" }}</li>
              <li>Legend Range: {{ config.legendMinMax[0] !== null && config.legendMinMax[1] !== null ? `${config.legendMinMax[0]} - ${config.legendMinMax[1]}` : "Auto" }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between">
      <button
        v-if="currentStep > 0"
        @click="prevStep"
        class="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div v-else></div>

      <button
        v-if="currentStep < steps.length - 1"
        @click="nextStep"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {{ steps[currentStep].nextButtonText || 'Continue' }}
      </button>
      <button
        v-else
        @click="finishImport"
        class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        Import Data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { readFileAsText } from "../helpers"
import {
  parseGeojson,
  extractPropertyKeys,
} from "../parse_geojson"
import type { AppConfig } from "../config"
import { ProcessorFactory } from "../processors/processor_factory"

import { ref, reactive, computed } from 'vue'

const currentStep = ref(0)
const steps = [
  {
    title: 'Select geojson File',
    nextButtonText: 'Continue'
  },
  {
    title: 'Select ID Variable',
    nextButtonText: 'Continue'
  },
  {
    title: 'Select Data File',
    nextButtonText: 'Continue'
  },
  {
    title: 'Map Columns',
    nextButtonText: 'Continue'
  },
  {
    title: 'Configure Legend',
    nextButtonText: 'Confirm'
  },
  {
    title: 'Confirmation'
  }
]

const geojsonFile = ref<File | null>(null)
const idVariable = ref("")
const dataFile = ref<File | null>(null)
const config = reactive<AppConfig>({
  categoryColumns: [],
  valueColumn: "",
  idColumn: "",
  dataFileName: "",
  geojsonFileName: "",
  legendMinMax: [null, null],
  legendTitle: ""
})
const errors = reactive<Record<string, string>>({})
const geojsonFields = ref<string[]>([])
const dataFileColumns = ref<string[]>([])

const availableCategoryColumns = computed(() => {
  return dataFileColumns.value.filter(col =>
    col !== config.idColumn &&
    col !== config.valueColumn
  )
})

async function handleGeojsonFileSelect(event: Event) {
  errors.geojsonFile = ""
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const fileContent = await readFileAsText(file)
    const { valid, geojson, errors: geojsonErrors } = parseGeojson(fileContent)

    if (!valid) {
      errors.geojsonFile = geojsonErrors || "Invalid geojson file"
      return
    }

    geojsonFile.value = geojson
    config.geojsonFileName = file.name

    geojsonFields.value = extractPropertyKeys(geojson)
  } catch (error: any) {
    errors.geojsonFile = "Error processing file: " + error.message
  }
}

async function handleDataFileSelect(event: Event) {
  errors.dataFile = ""
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    dataFile.value = file
    const dataProcessor = await ProcessorFactory.create(file)
    config.dataFileName = file.name

    dataFileColumns.value = await dataProcessor.getColumnNames()
  } catch (error: any) {
    errors.dataFile = "Error processing file: " + error.message
  }
}

function removeGeojsonFile() {
  geojsonFile.value = null
  config.geojsonFileName = ""
  const input = document.getElementById('geojsonFileInput') as HTMLInputElement
  if (input) input.value = ''
}

function removeDataFile() {
  dataFile.value = null
  config.dataFileName = ""
  const input = document.getElementById('dataFileInput') as HTMLInputElement
  if (input) input.value = ''
}

function validateStep() {
  for (const key in errors) {
    delete errors[key]
  }

  if (currentStep.value === 0) {
    if (!geojsonFile.value) {
      errors.geojsonFile = "Please select a geojson file"
      return false
    }
  } else if (currentStep.value === 1) {
    if (!idVariable.value) {
      errors.idVariable = "Please select an ID variable"
      return false
    }
  } else if (currentStep.value === 2) {
    if (!dataFile.value) {
      errors.dataFile = "Please select a data file"
      return false
    }
  } else if (currentStep.value === 3) {
    if (!config.idColumn) {
      errors.idColumn = "Please select an ID column"
      return false
    }
    if (!config.valueColumn) {
      errors.valueColumn = "Please select a value column"
      return false
    }
  } else if (currentStep.value === 4) {
    if (!config.legendTitle.trim()) {
      errors.legendTitle = "Please enter a legend title"
      return false
    }
    if (config.legendMinMax[0] !== null && config.legendMinMax[1] !== null) {
      if (config.legendMinMax[0] >= config.legendMinMax[1]) {
        errors.legendMinMax = "Min value must be less than max value"
        return false
      }
    }
  }
  return true
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function nextStep() {
  if (validateStep()) {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    }
  }
}

const emit = defineEmits(['import-complete'])

function finishImport() {
  const appConfig: AppConfig = {
    categoryColumns: config.categoryColumns,
    valueColumn: config.valueColumn,
    idColumn: config.idColumn,
    dataFileName: config.dataFileName,
    geojsonFileName: config.geojsonFileName,
    legendMinMax: config.legendMinMax,
    legendTitle: config.legendTitle
  }

  emit('import-complete', appConfig)
}

function resetWizard() {
  currentStep.value = 0
  geojsonFile.value = null
  idVariable.value = ""
  dataFile.value = null
  config.categoryColumns = []
  config.valueColumn = ""
  config.idColumn = ""
  config.dataFileName = ""
  config.geojsonFileName = ""
  config.legendMinMax = [null, null]
  config.legendTitle = ""
  for (const key in errors) {
    delete errors[key]
  }
  geojsonFields.value = []
  dataFileColumns.value = []
}
</script>
