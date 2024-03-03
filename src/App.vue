<template>
  <div
    class="loader loader-default"
    :class="{ 'is-active': isLoading }"
    data-text="資料載入中"
  ></div>
  <main style="display: flex">
    <div class="main__map_container" id="mapContainer" ref="mapContainer"></div>
    <div class="main__control_panel">
      <div class="h1">圖層控制台</div>
      <div class="main__layer_section">
        礦業用地(線)
        <label class="form-label" for="opacity1">透明度{{ opacity1 }}</label>
        <input
          class="form-range"
          id="opacity1"
          type="range"
          v-model="opacity1"
          @change="rangeChange('params1')"
          step="10"
        />
      </div>
      <div class="main__layer_section">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            id="toggleMineMapLine"
            v-model="toggleMineMapLine"
          />
          <label class="from-check-label">礦業用地(線)_202010</label>
        </div>
      </div>
      <div class="main__layer_section">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            id="toggleMineMapLine"
            v-model="toggleMineMapPolygon"
          />
          <label class="from-check-label">礦業用地(面)_202010</label>
        </div>
      </div>
      <div class="main__layer_section">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            id="toggleMineMapLine"
            v-model="toggleMineMapArea"
          />
          <label class="from-check-label">礦區範圍_202010</label>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import 'leaflet-kml';
// import 'leaflet-glify-layer';

let mapInstance, layer;

export default {
  // name: 'map_page',
  data() {
    return {
      mapInstance: {},
      WMSLayers: [],
      opacity1: '100',
      isLoading: false,
      toggleMineMapLine: false,
      toggleMineMapPolygon: false,
      toggleMineMapArea: false,
    };
  },
  methods: {
    rangeChange(params) {
      const vm = this;
      console.log(vm.opacity1);
      console.log('params', params);
      const opacityPercentage = Number(vm.opacity1) / 100;
      console.log('透明度百分比', opacityPercentage);
      vm.WMSLayers[0].setOpacity(opacityPercentage);
    },
    displayMine2020WMS() {
      const vm = this;
      let mapInstance = vm.mapInstance;

      // for (let i = 1; i < 4; i++){
      //   const wmsOption = {
      //     version: '1.3.0',
      //     layers: i,
      //     transparent: true,
      //     bgcolor: '0xFFFFFF',
      //     format: 'image/png',
      //     // srs: 'EPSG:4326',
      //     opacity: 0.1,
      //     layerName: `MineMapLayer_${i}`,
      //   };
      //   const wmsUrl = 'https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_v2/MapServer/WMSServer?';
      //   const mineLayer = L.tileLayer.wms(wmsUrl, wmsOption).addTo(mapInstance);
      //   console.log(mineLayer);
      // }
      const wmsOption = {
        version: '1.3.0',
        layers: 1,
        transparent: true,
        bgcolor: '0xFFFFFF',
        format: 'image/png',
        // srs: 'EPSG:4326',
        opacity: 1,
        layerName: `MineMapLayer_1`,
      };
      const wmsUrl =
        'https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_v2/MapServer/WMSServer?';
      const mineLayer = L.tileLayer.wms(wmsUrl, wmsOption).addTo(mapInstance);
      mineLayer.name = 'MineMapLayerName';
      vm.WMSLayers.push(mineLayer);
      // console.log(mineLayer);
    },
    displayMineHistoryWMS() {
      const vm = this;
      let mapInstance = vm.mapInstance;

      for (let i = 0; i < 6; i++) {
        const wmsOption = {
          version: '1.3.0',
          layers: i,
          transparent: true,
          bgcolor: '0xFFFFFF',
          format: 'image/png',
          // srs: 'EPSG:4326',
          layerName: `MineMapHistory_${i}`,
        };
        const wmsUrl =
          'https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_history/MapServer/WMSServer?';
        const mineLayer = L.tileLayer.wms(wmsUrl, wmsOption).addTo(mapInstance);
      }
    },
  },
  computed: {},
  mounted() {
    const vm = this;
    const mapDom = this.$refs.mapContainer;
    let mapInstance = L.map(mapDom, {
      center: [23.58, 120.58],
      zoom: 9,
    });
    vm.mapInstance = mapInstance;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);
    vm.displayMine2020WMS();
    //vm.displayMineHistoryWMS();
  },
  created() {},
};
</script>

<style scoped>
.main__map_container {
  width: 70%;
  height: 100vh;
}
.main__control_panel {
  width: 30%;
  height: 100vh;
}

.main__layer_section {
  border: 2px solid #000;
  padding: 0.25rem;
  margin: 0.25rem;
}
</style>
