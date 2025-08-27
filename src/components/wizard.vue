<template>
  <div class="max-w-sm md:mx-auto p-2 m-2">
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

    <!--- STEP: SELECT GEOJSON --->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
      <div v-if="currentStep === 0">
        <label class="block text-gray-700 mb-2">Select a GeoJSON file. This file will be the basis
          for the map.</label>
        <div
          @drop.prevent="e => handleGeojsonFileSelect({target: {files: e.dataTransfer.files}})"
          @dragover.prevent
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
        >
          <input
            type="file"
            @change="handleGeojsonFileSelect"
            class="hidden"
            id="geojsonFileInput"
            accept=".geojson,.json,application/geo+json,application/json"
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
              <span class="ml-2 text-gray-700">{{ config.geojsonFileName }}</span>
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

        <div v-if="geojsonFile" class="mt-4">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="geojsonOnly"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-gray-700">Continue with GeoJSON only (render the map do not apply
            coloring)</span>
          </label>
        </div>
      </div>

    <!--- STEP: SELECT ID FROM GEOJSON --->
    <div v-if="currentStep === 1">
      <label class="block text-gray-700 mb-3">
        Select the ID from your GeoJSON file. This ID will be used to identify the regions on the map.
      </label>
      <div class="relative">
        <select
          v-model="config.idColumnGeojson"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white max-h-[100px] overflow-y-auto"
        >
          <option value="">-- Select column --</option>
          <option v-for="col in geojsonIdColumns" :key="col" :value="col">
            {{ col }}
          </option>
        </select>
      </div>
      <p v-if="errors.idColumnGeojson" class="text-red-500 text-sm mt-2">{{ errors.idColumnGeojson }}</p>
    </div>

      <!--- STEP: SELECT DATA FILE --->
      <div v-if="currentStep === 2">
        <label class="block text-gray-700 mb-2">
          The selected data file should contain an ID column and a value column. The ID will be used to map the value to a region in the GeoJSON, and the value will be used to color the region.
        </label>
        <div
          @drop.prevent="e => handleDataFileSelect({target: {files: e.dataTransfer.files}})"
          @dragover.prevent
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
        >
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
          <div v-if="config.dataFileName !== ''" class="mt-4 text-left">
            <div class="flex items-center">
              <span class="text-green-600">✓</span>
              <span class="ml-2 text-gray-700">{{ config.dataFileName }}</span>
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

      <!--- STEP: SELECT COLUMNS DATAFILE --->
      <div v-if="currentStep === 3">
        <label class="block text-gray-700 mb-3">Map the columns:</label>

        <div class="mb-4">
          <label class="block text-gray-600 text-sm mb-1">ID Column (matches with geojson {{ config.idColumnGeojson }}):</label>
          <select
            v-model="config.idColumnDataFile"
            class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select column --</option>
            <option v-for="column in dataFileColumns" :key="column" :value="column">
              {{ column }}
            </option>
          </select>
          <p v-if="errors.idColumnDataFile" class="text-red-500 text-sm mt-1">{{ errors.idColumnDataFile }}</p>
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

      <!--- STEP: CONFIGURE LEGEND --->
      <div v-if="currentStep === 4">
        <label class="block text-gray-700 mb-3">Configure Legend:</label>

        <div class="mb-4">
          <label class="block text-gray-600 text-sm mb-1">Legend Title:</label>
          <input
            type="text"
            v-model="config.legendTitle"
            class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :placeholder="config.valueColumn"
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
          <p v-if="errors.legendMinMax" class="text-red-500 text-sm mt-1">{{ errors.legendMinMax }}</p>
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
        @click="nextStep"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {{ steps[currentStep].nextButtonText || 'Continue' }}
      </button>
    </div>
  </div>
</template>

<script>
import { readFileAsText } from "../helpers"
import {
  parseGeojson,
  extractPropertyKeys,
} from "../parse_geojson"
import { ProcessorFactory } from "../processors/processor_factory"

export default {
  name: "DataImportWizard",
  emits: [
    "import-done",
  ],
  data() {
    return {
      currentStep: 0,
      steps: [
        {
          title: "Select GeoJSON File",
          nextButtonText: "Continue"
        },
        {
          title: "Select ID Variable",
          nextButtonText: "Continue"
        },
        {
          title: "Select Data File",
          nextButtonText: "Continue"
        },
        {
          title: "Map Columns",
          nextButtonText: "Continue"
        },
        {
          title: "Configure Legend",
          nextButtonText: "Ready to Import"
        }
      ],
      geojsonFile: null,
      dataProcessor: null,
      config: {
        categoryColumns: [],
        valueColumn: "",
        idColumnGeojson: "",
        idColumnDataFile: "",
        dataFileName: "",
        geojsonFileName: "",
        legendMinMax: [0, 1],
        legendTitle: ""
      },
      errors: {},
      geojsonIdColumns: [],
      dataFileColumns: [],
      geojsonOnly: false,
    }
  },
  computed: {
    availableCategoryColumns() {
      return this.dataFileColumns.filter(col =>
        col !== this.config.idColumnDataFile &&
        col !== this.config.valueColumn
      )
    }
  },
  methods: {
    async handleGeojsonFileSelect(event) {
      delete this.errors.geojsonFile
      const input = event.target
      const file = input.files?.[0]
      if (!file) return

      try {
        const fileContent = await readFileAsText(file)
        const { valid, geojson, errors: geojsonErrors } = parseGeojson(fileContent)

        if (!valid) {
          this.errors.geojsonFile = geojsonErrors || "Invalid geojson file"
          return
        }

        this.geojsonFile = geojson
        this.config.geojsonFileName = file.name
        this.geojsonIdColumns = extractPropertyKeys(geojson)
      } catch (error) {
        this.errors.geojsonFile = "Error processing file: " + error.message
      }
    },

    async handleDataFileSelect(event) {
      delete this.errors.dataFile
      const input = event.target
      const file = input.files?.[0]
      if (!file) return

      try {
        this.dataProcessor = await ProcessorFactory.create(file)
        this.config.dataFileName = file.name

        this.dataFileColumns = await this.dataProcessor.getColumnNames()
      } catch (error) {
        this.errors.dataFile = "Error processing file: " + error.message
      }
    },

    removeGeojsonFile() {
      this.geojsonFile = null
      this.config.geojsonFileName = ""
      const input = document.getElementById("geojsonFileInput")
      if (input) input.value = ""
    },

    removeDataFile() {
      this.dataProcessor = null // CREATE A METHOD TO DESTROY PROCESSORS
      this.config.dataFileName = ""
      const input = document.getElementById("dataFileInput")
      if (input) input.value = ""
    },

    validateStep() {
      // Clear all errors
      this.errors = {}

      if (this.currentStep === 0) {
        if (this.geojsonOnly) { this.finishImport() }
        if (!this.geojsonFile) {
          this.errors.geojsonFile = "Please select a geojson file"
          return false
        }
      } else if (this.currentStep === 1) {
        if (!this.config.idColumnGeojson) {
          this.errors.idColumnGeojson = "Please select an ID variable"
          return false
        }
      } else if (this.currentStep === 2) {
        if (this.config.dataFileName === "") {
          this.errors.dataFile = "Please select a data file"
          return false
        }
      } else if (this.currentStep === 3) {
        if (!this.config.idColumnDataFile) {
          this.errors.idColumnDataFile = "Please select an ID column"
          return false
        }
        this.config.legendTitle = this.config.valueColumn.trim()
        if (!this.config.valueColumn) {
          this.errors.valueColumn = "Please select a value column"
          return false
        }
      } else if (this.currentStep === 4) {
        if (!this.config.legendTitle.trim()) {
          this.errors.legendTitle = "Please enter a legend title"
          return false
        }
        if (this.config.legendMinMax[0] !== null && this.config.legendMinMax[1] !== null) {
          if (this.config.legendMinMax[0] >= this.config.legendMinMax[1]) {
            this.errors.legendMinMax = "Min value must be less than max value"
            return false
          }
        }
      }
      return true
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    nextStep() {
      if (this.validateStep()) {
        if (this.currentStep < this.steps.length - 1) {
          this.currentStep++
        } else {
          this.finishImport()
        }
      }
    },

    finishImport() {
      this.$emit("import-done", this.config, this.geojsonFile,this.dataProcessor)
    },
  }
}
</script>
