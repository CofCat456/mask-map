<script setup>
import { onMounted, ref } from 'vue';
import { apiCityData } from '../utlis/api';

const cityData = ref({});

onMounted(async () => {
  const res = await apiCityData();
  cityData.value = res?.data?.features;
  console.log(cityData.value);
});
</script>

<template>
  <div class="relative space-x-0 flex flex-wrap">
    <div class="w-1/4 bg-fuchsia-500">
      <div class="toolbox">
        <div class="sticky bg-white shadow p-2">
          <div class="flex items-center mb-4">
            <label for="cityName" class="mr-2 text-right leading-normal">縣市</label>
            <div class="flex-1">
              <select
                id="cityName"
                class="block border border-[#ced4da] px-3 py-[6px] w-full rounded-[5px]"
              >
                <option>Select One</option>
              </select>
            </div>
          </div>
          <div class="flex items-center mb-4">
            <label for="cityName" class="mr-2 text-right leading-normal">地區</label>
            <div class="flex-1">
              <select
                id="cityName"
                class="block border border-[#ced4da] px-3 py-[6px] w-full rounded-[5px]"
              >
                <option>Select One</option>
              </select>
            </div>
          </div>
          <p class="mb-0 text-right text-[#6c757d] text-sm">請先選擇區域查看（綠色表示還有口罩）</p>
        </div>
        <ul class="flex flex-col"></ul>
      </div>
    </div>
    <div class="flex-1 bg-zinc-600">
      <div id="map"></div>
    </div>
  </div>
</template>

<style scoped>
#map {
  height: 100vh;
}

.highlight {
  background: #e0ffe3;
}

.toolbox {
  height: 100vh;
  overflow-x: auto;
}

.toolbox a {
  cursor: pointer;
}
</style>
