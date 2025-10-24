<template>
  <div class="absolute top-0 left-full ml-2 p-5 bg-white card-box
    w-[550px]
    max-[685px]:w-[80vw]
    max-[685px]:left-0
    max-[685px]:top-full
    max-[685px]:ml-0
    max-[685px]:mt-2"
  >
    <div class="text-24 underline underline-offset-8 mb-2 font-bold">
      {{ config.mapDescription.title }}
    </div>
    <div class="text-[14px]" v-html="config.mapDescription.description"</div>
    <p class="float-right text-sm text-gray-600">
      made with ♡ by
      <a
        href="https://odissei-soda.nl/"
        class="underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        @sodascience
      </a>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { AppConfig } from './types'

interface Props {
  config: AppConfig
}

defineProps<Props>()
</script>
