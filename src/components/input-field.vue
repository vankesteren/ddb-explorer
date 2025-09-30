<template>
  <div>
    <label v-if="label" class="block text-gray-700 text-sm font-bold mb-2">
      {{ label }}
    </label>
    <input
      :type="inputType"
      :value="inputValue"
      @input="onInput"
      :placeholder="placeholder"
      :step="step"
      :disabled="disabled"
      class="h-9 px-3 py-2 border border-gray-300 rounded bg-white text-sm text-gray-700 focus:outline-none focus:border-gray-400 w-full disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

type InputValueType = 'text' | 'number' | 'integer'

export default defineComponent({
  name: 'InputField',
  props: {
    defaultValue: {
      type: [String, Number] as PropType<string | number>,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String as PropType<InputValueType>,
      default: 'text',
      validator: (value: string): boolean =>
        ['text', 'number', 'integer'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputValue: this.defaultValue as string | number,
      debounceTimer: null as number | null
    }
  },
  computed: {
    inputType(): string {
      if (this.type === 'integer' || this.type === 'number') {
        return 'number'
      }
      return this.type
    },
    step(): string | undefined {
      if (this.type === 'integer') {
        return '1'
      } else if (this.type === 'number') {
        return 'any'
      }
      return undefined
    }
  },
  methods: {
    onInput(e: Event): void {
      const target = e.target as HTMLInputElement
      let value: string | number = target.value

      // Type validation and conversion
      if (this.type === 'number') {
        value = value === '' ? '' : parseFloat(value)
        if (value !== '' && isNaN(value as number)) return
      } else if (this.type === 'integer') {
        value = value === '' ? '' : parseInt(value, 10)
        if (value !== '' && isNaN(value as number)) return
      }

      this.inputValue = value

      // Clear existing timer
      if (this.debounceTimer !== null) {
        clearTimeout(this.debounceTimer)
      }

      // Set debounce timer (500ms cooldown)
      this.debounceTimer = window.setTimeout(() => {
        this.$emit('input-changed', this.inputValue)
      }, 500)
    }
  },
  watch: {
    defaultValue(val: string | number): void {
      this.inputValue = val
    }
  },
  mounted(): void {
    // Emit initial state on mount (mirrors Checkbox behavior)
    this.$emit('input-changed', this.inputValue)
  },
  beforeUnmount(): void {
    // Clean up timer
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer)
    }
  }
})
</script>
