<template>
  <span
    ref="triggerRef"
    class="inline-flex items-center align-middle cursor-pointer select-none"
    role="button"
    tabindex="0"
    aria-haspopup="true"
    :aria-expanded="isOpen ? 'true' : 'false'"
    @mouseenter="open()"
    @mouseleave="close()"
    @click.stop="toggle()"
    @keydown.escape.stop.prevent="close()"
    @focusin="open()"
    @focusout="close()"
    title=""
  >
    <!-- Info Icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4m0-4h.01" />
    </svg>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { createPopper } from '@popperjs/core'

interface Props {
  /** Text shown in the tooltip */
  text: string
  /** Optional: initial open state (default: false) */
  defaultOpen?: boolean
  /** Optional: preferred placement (default: 'top') */
  placement?: import('@popperjs/core').Placement
}
const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  placement: 'top',
})

const triggerRef = ref<HTMLElement | null>(null)
const tooltipEl = ref<HTMLDivElement | null>(null)
const popper = ref<ReturnType<typeof createPopper> | null>(null)
const isOpen = ref<boolean>(props.defaultOpen)

function ensureTooltipEl() {
  if (tooltipEl.value) return
  const el = document.createElement('div')
  el.setAttribute('role', 'tooltip')
  el.className =
    // Tailwind styles to match app
    'bg-white border border-gray-200 rounded-md shadow-md text-sm text-gray-700 px-2 py-1 z-[1000] ' +
    // Hide by default (use visibility to keep layout/calcs stable)
    'invisible'
  el.style.maxWidth = '24rem' // ~max-w-md
  el.style.pointerEvents = 'none' // tooltip should not intercept mouse
  el.textContent = props.text
  document.body.appendChild(el)
  tooltipEl.value = el
}

function mountPopper() {
  if (!triggerRef.value || !tooltipEl.value) return
  popper.value = createPopper(triggerRef.value, tooltipEl.value, {
    placement: props.placement,
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
      { name: 'preventOverflow', options: { padding: 8, boundary: document.body } },
      { name: 'flip', options: { fallbackPlacements: ['bottom', 'right', 'left'] } },
    ],
  })
}

function destroyPopper() {
  popper.value?.destroy()
  popper.value = null
}

function open() {
  if (!tooltipEl.value) return
  isOpen.value = true
  tooltipEl.value.style.visibility = 'visible'
  tooltipEl.value.classList.remove('invisible')
  popper.value?.update()
}

function close() {
  if (!tooltipEl.value) return
  isOpen.value = false
  tooltipEl.value.style.visibility = 'hidden'
  tooltipEl.value.classList.add('invisible')
}

function toggle() {
  isOpen.value ? close() : open()
}

onMounted(() => {
  ensureTooltipEl()
  mountPopper()
  if (isOpen.value) open()
})

onUnmounted(() => {
  destroyPopper()
  if (tooltipEl.value) {
    tooltipEl.value.remove()
    tooltipEl.value = null
  }
})

watch(
  () => props.text,
  (val) => {
    if (tooltipEl.value) {
      tooltipEl.value.textContent = val ?? ''
      if (isOpen.value) popper.value?.update()
    }
  }
)

watch(
  () => props.placement,
  (val) => {
    if (!popper.value) return
    popper.value.setOptions((opts) => ({ ...opts, placement: val }))
    if (isOpen.value) popper.value.update()
  }
)
</script>

