<template>
 <div
    role="status"
    class="w-full max-w-xs sm:max-w-md lg:max-w-3xl
           p-4 md:p-6 border border-gray-200 rounded-sm shadow-sm animate-pulse dark:border-gray-700"
  >
    <!-- Title placeholders -->
    <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-24 mb-2.5"></div>
    <div class="w-40 h-2 mb-6 bg-gray-200 rounded-full dark:bg-gray-700"></div>

    <!-- Chart bars -->
    <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-1 mt-4 items-end h-48">
      <!-- Base 6 bars (always visible) -->
      <div class="w-4 h-40 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <div class="w-4 h-36 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <div class="w-4 h-44 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <div class="w-4 h-32 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <div class="w-4 h-40 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <div class="w-4 h-32 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <!-- +2 on sm+ -->
      <div class="hidden sm:block w-4 h-42 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <div class="hidden sm:block w-4 h-38 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <!-- +2 on md+ -->
      <div class="hidden md:block w-4 h-34 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <div class="hidden md:block w-4 h-46 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <!-- +2 on lg+ -->
      <div class="hidden lg:block w-4 h-40 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <div class="hidden lg:block w-4 h-44 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <!-- +2 on xl+ -->
      <div class="hidden xl:block w-4 h-32 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
      <div class="hidden xl:block w-4 h-42 bg-gray-200 rounded-t-sm dark:bg-gray-700"></div>
    </div>
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script>
export default {
  name: 'ChartSkeleton',
}
</script>
