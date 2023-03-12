<script setup>
import { onMounted, ref } from 'vue';
import L from 'leaflet';

import cityNameJson from '../assets/cityName.json';

import { apiCityData } from '../utlis/api';
import { icons } from '../utlis/context';

const map = ref({});
const cityData = ref({});
const cityName = ref(cityNameJson);
const select = ref({
  city: '臺北市',
  area: '大安區'
});

const addMapMarker = (x, y, item) => {
  const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;

  L.marker([x, y], {
    icon
  }).addTo(map.value).bindPopup(`<strong>${item.name}</strong> <br>
    口罩剩餘：<strong>成人 - ${item.mask_adult ? `${item.mask_adult} 個` : '未取得資料'}/ 兒童 - ${
    item.mask_child ? `${item.mask_child} 個` : '未取得資料'
  }</strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${item.address}" target="_blank">${
    item.address
  }</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`);
};

const removeMarker = () => {
  map.value.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.value.removeLayer(layer);
    }
  });
};

const penTo = (x, y, item) => {
  const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;

  map.value.panTo(new L.LatLng(y, x));

  L.marker([y, x], {
    icon
  })
    .addTo(map.value)
    .bindPopup(
      `<strong>${item.name}</strong> <br>
    口罩剩餘：<strong>成人 - ${item.mask_adult ? `${item.mask_adult} 個` : '未取得資料'}/ 兒童 - ${
        item.mask_child ? `${item.mask_child} 個` : '未取得資料'
      }</strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${item.address}" target="_blank">${
        item.address
      }</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`
    )
    .openPopup();
};

const updateMaker = () => {
  const pharmacies = cityData.value.filter((pharmacy) => {
    if (!select.value.area) {
      return pharmacy.properties.county === select.value.city;
    }
    return pharmacy.properties.town === select.value.area;
  });

  pharmacies.forEach((pharmacie) => {
    const { properties, geometry } = pharmacie;
    addMapMarker(geometry.coordinates[1], geometry.coordinates[0], properties);
  });

  if (pharmacies.length > 0) {
    penTo(
      pharmacies[0].geometry.coordinates[0],
      pharmacies[0].geometry.coordinates[1],
      pharmacies[0].properties
    );
  }
};

const updateSelect = () => {
  removeMarker();
  updateMaker();
  const pharmacy = cityData.value.find((item) => item.properties.town === select.value.area);

  if (pharmacy) {
    const { geometry, properties } = pharmacy;
    penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
  }
};

const getCityData = async () => {
  const res = await apiCityData();
  cityData.value = res?.data?.features;
  updateMaker();
};

onMounted(() => {
  getCityData();

  map.value = L.map('map', {
    center: [25.03, 121.55],
    zoom: 14
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map.value);
});
</script>

<template>
  <div class="relative flex flex-wrap space-x-0">
    <div class="sm:w-1/4 w-full">
      <div class="toolbox">
        <div class="sticky bg-white p-2 shadow">
          <div class="mb-4 flex items-center">
            <label for="cityName" class="mr-2 text-right leading-normal">縣市</label>
            <div class="flex-1">
              <select
                id="cityName"
                class="block w-full rounded-[5px] border border-[#ced4da] px-3 py-[6px]"
                v-model="select.city"
              >
                <option value="" disabled>--Select One--</option>
                <option v-for="city in cityName" :key="city.CityName" :value="city.CityName">
                  {{ city.CityName }}
                </option>
              </select>
            </div>
          </div>
          <div class="mb-4 flex items-center">
            <label for="cityName" class="mr-2 text-right leading-normal">地區</label>
            <div class="flex-1">
              <select
                id="cityName"
                class="block w-full rounded-[5px] border border-[#ced4da] px-3 py-[6px]"
                @change="updateSelect"
                v-model="select.area"
              >
                <option value="" disabled>--Select One--</option>
                <option
                  v-for="a in cityName.find((city) => city.CityName === select.city).AreaList"
                  :key="a.AreaName"
                  :value="a.AreaName"
                >
                  {{ a.AreaName }}
                </option>
              </select>
            </div>
          </div>
          <p class="mb-0 text-right text-sm text-[#6c757d]">請先選擇區域查看（綠色表示還有口罩）</p>
        </div>
        <ul class="flex flex-col">
          <template v-for="(item, key) in cityData">
            <a
              v-if="item.properties.county === select.city && item.properties.town === select.area"
              class="highlight relative block rounded-t border border-zinc-900 px-5 py-3 text-left"
              :class="{ highlight: item.properties.mask_adult || item.properties.mask_child }"
              :key="key"
              @click="
                penTo(item.geometry.coordinates[0], item.geometry.coordinates[1], item.properties)
              "
            >
              <h3>{{ item.properties.name }}</h3>
              <p class="mb-0">
                成人口罩：{{ item.properties.mask_adult }} | 兒童口罩：{{
                  item.properties.mask_child
                }}
              </p>
              <p class="mb-0">
                地址：<a
                  :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                  target="_blank"
                  title="Google Map"
                  class="text-sky-600 hover:underline hover:text-sky-900"
                >
                  {{ item.properties.address }}</a
                >
              </p>
            </a>
          </template>
        </ul>
      </div>
    </div>
    <div class="flex-1">
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
