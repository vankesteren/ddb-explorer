<template>
  <div>
    <label v-if="label" class="block text-gray-700 text-sm font-bold mb-2">
      {{ label }}
    </label>
    <select
      class="w-full p-2 border border-gray-300 bg-white"
      v-model="selectedValue"
      @change="emitSelection"
    >
      <option
        v-for="option in options"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'Selection',
  props: {
    options: {
      type: Array,
      required: true,
    },
    defaultValue: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedValue: this.defaultValue || (this.options.length > 0 ? this.options[0] : null)
    };
  },
  methods: {
    emitSelection() {
      this.$emit('selection-changed', this.selectedValue);
    }
  },
  watch: {
    defaultValue(newValue) {
      this.selectedValue = newValue;
    }
  },
  mounted() {
    // Emit initial selection on mount
    if (this.selectedValue) {
      this.emitSelection();
    }
  }
}
</script>
