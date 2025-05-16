<template>
  <div class="flex flex-col items-center">
    <svg
      class="animate-spin text-gray-400"
      :class="[sizeClasses, marginClass]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span v-if="label" class="text-gray-500" :class="textSizeClass">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'SpinnerComponent',
  props: {
    size: {
      type: String,
      default: 'lg',
      validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    label: {
      type: String,
      default: ''
    },
    margin: {
      type: String,
      default: 'mb-2'
    },
    color: {
      type: String,
      default: 'text-gray-400'
    }
  },
  computed: {
    sizeClasses() {
      const sizes = {
        xs: 'h-4 w-4',
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-64 w-64',
        xl: 'h-256 w-256'
      };
      return sizes[this.size] || sizes.md;
    },
    textSizeClass() {
      const textSizes = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
      };
      return textSizes[this.size] || textSizes.md;
    },
    marginClass() {
      return this.label ? this.margin : '';
    }
  },
  created() {
    // Override default color class if custom color is provided
    if (this.color !== 'text-gray-400') {
      this.$el?.classList.remove('text-gray-400');
      this.$el?.classList.add(this.color);
    }
  }
}
</script>
