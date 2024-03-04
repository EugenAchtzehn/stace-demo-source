<template>
  <div
    class="loader loader-default"
    :class="{ 'is-active': isLoading }"
    data-text="資料載入中"
  ></div>
  <main style="display: flex">
    <div class="main__map_container" id="mapContainer" ref="mapContainer"></div>
    <div class="main__control_panel">
      <section class="main__recent_section">
        <!-- <div class="h2 fw-bold">近期資料</div> -->
        <div class="main__layer_section">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="mineMapLine"
              @click="toggleMineMapLayers('mineMapLine', false)"
            />
            <label class="from-check-label">礦業用地(線)_202010</label>
          </div>
          <div v-if="mineMapLine">
            <label class="form-label"> 透明度：{{ layerOpacity.mineMapLine }} </label>
            <input
              class="form-range"
              type="range"
              v-model="layerOpacity.mineMapLine"
              step="10"
              @change="changeOpacity('mineMapLine')"
            />
          </div>
        </div>
        <div class="main__layer_section">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="mineMapPolygon"
              @click="toggleMineMapLayers('mineMapPolygon', false)"
            />
            <label class="from-check-label">礦業用地(面)_202010</label>
          </div>
          <div v-if="mineMapPolygon">
            <label class="form-label"> 透明度：{{ layerOpacity.mineMapPolygon }} </label>
            <input
              class="form-range"
              type="range"
              v-model="layerOpacity.mineMapPolygon"
              step="10"
              @change="changeOpacity('mineMapPolygon')"
            />
          </div>
        </div>
        <div class="main__layer_section">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="mineMapArea"
              @click="toggleMineMapLayers('mineMapArea', false)"
            />
            <label class="from-check-label">礦區範圍_202010</label>
          </div>
          <div v-if="mineMapArea">
            <label class="form-label"> 透明度：{{ layerOpacity.mineMapArea }} </label>
            <input
              class="form-range"
              type="range"
              v-model="layerOpacity.mineMapArea"
              step="10"
              @change="changeOpacity('mineMapArea')"
            />
          </div>
        </div>
      </section>
      <section class="main__history_section">
        <!-- <div class="h2 fw-bold">歷史資料</div> -->
        <div class="main__layer_section mineLand">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="mineHistoryLand2017"
              @click="toggleMineMapLayers('mineHistoryLand2017', true)"
            />
            <label class="from-check-label">礦業用地_201711</label>
          </div>
          <div v-if="mineHistoryLand2017">
            <label class="form-label"> 透明度：{{ layerOpacity.mineHistoryLand2017 }} </label>
            <input
              class="form-range"
              type="range"
              v-model="layerOpacity.mineHistoryLand2017"
              step="10"
              @change="changeOpacity('mineHistoryLand2017')"
            />
          </div>
        </div>
        <div class="main__layer_section mineLand">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="mineHistoryLand2019"
              @click="toggleMineMapLayers('mineHistoryLand2019', true)"
            />
            <label class="from-check-label">礦業用地_201906</label>
          </div>
          <div v-if="mineHistoryLand2019">
            <label class="form-label"> 透明度：{{ layerOpacity.mineHistoryLand2019 }} </label>
            <input
              class="form-range"
              type="range"
              v-model="layerOpacity.mineHistoryLand2019"
              step="10"
              @change="changeOpacity('mineHistoryLand2019')"
            />
          </div>
        </div>
        <div class="main__layer_section mineLand">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="mineHistoryLand2020"
              @click="toggleMineMapLayers('mineHistoryLand2020', true)"
            />
            <label class="from-check-label">礦業用地_202008</label>
          </div>
          <div v-if="mineHistoryLand2020">
            <label class="form-label"> 透明度：{{ layerOpacity.mineHistoryLand2020 }} </label>
            <input
              class="form-range"
              type="range"
              v-model="layerOpacity.mineHistoryLand2020"
              step="10"
              @change="changeOpacity('mineHistoryLand2020')"
            />
          </div>
        </div>
        <div class="main__layer_section mineArea">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="mineHistoryArea2018"
              @click="toggleMineMapLayers('mineHistoryArea2018', true)"
            />
            <label class="from-check-label">礦區範圍_201811</label>
          </div>
          <div v-if="mineHistoryArea2018">
            <label class="form-label"> 透明度：{{ layerOpacity.mineHistoryArea2018 }} </label>
            <input
              class="form-range"
              type="range"
              v-model="layerOpacity.mineHistoryArea2018"
              step="10"
              @change="changeOpacity('mineHistoryArea2018')"
            />
          </div>
        </div>
        <div class="main__layer_section mineArea">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="mineHistoryArea2019"
              @click="toggleMineMapLayers('mineHistoryArea2019', true)"
            />
            <label class="from-check-label">礦區範圍_201906</label>
          </div>
          <div v-if="mineHistoryArea2019">
            <label class="form-label"> 透明度：{{ layerOpacity.mineHistoryArea2019 }} </label>
            <input
              class="form-range"
              type="range"
              v-model="layerOpacity.mineHistoryArea2019"
              step="10"
              @change="changeOpacity('mineHistoryArea2019')"
            />
          </div>
        </div>
        <div class="main__layer_section mineArea">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="mineHistoryArea2020"
              @click="toggleMineMapLayers('mineHistoryArea2020', true)"
            />
            <label class="from-check-label">礦區範圍_202008</label>
          </div>
          <div v-if="mineHistoryArea2020">
            <label class="form-label"> 透明度：{{ layerOpacity.mineHistoryArea2020 }} </label>
            <input
              class="form-range"
              type="range"
              v-model="layerOpacity.mineHistoryArea2020"
              step="10"
              @change="changeOpacity('mineHistoryArea2020')"
            />
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// import 'leaflet-kml';
// import 'leaflet-glify-layer';

// let mapInstance, layer;

export default {
  // name: 'map_page',
  data() {
    return {
      mapInstance: {},
      WMSLayers: [],
      opacity1: "100",
      isLoading: false,
      mineMapLine: false,
      mineMapPolygon: false,
      mineMapArea: false,
      mineHistoryLand2017: false,
      mineHistoryLand2019: false,
      mineHistoryLand2020: false,
      mineHistoryArea2018: false,
      mineHistoryArea2019: false,
      mineHistoryArea2020: false,
      layerOpacity: {
        mineMapLine: "100",
        mineMapPolygon: "100",
        mineMapArea: "100",
        mineHistoryLand2017: "100",
        mineHistoryLand2019: "100",
        mineHistoryLand2020: "100",
        mineHistoryArea2018: "100",
        mineHistoryArea2019: "100",
        mineHistoryArea2020: "100",
      },
    };
  },
  methods: {
    changeOpacity(WMSlayerName) {
      console.log(WMSlayerName);
      const vm = this;
      const opacity = Number(vm.layerOpacity[WMSlayerName]) / 100;
      vm.WMSLayers.forEach((item, index) => {
        if (item.wmsParams.layerName === WMSlayerName) {
          item.setOpacity(opacity);
        }
      });
    },
    closeWMSLayer(WMSlayerName) {
      const vm = this;
      let mapInstance = vm.mapInstance;
      vm.WMSLayers.forEach((item, index) => {
        // console.log(item);
        if (item.wmsParams.layerName === WMSlayerName) {
          item.removeFrom(mapInstance);
        }
      });
    },
    openWMSLayer(WMSlayerName, isHistory) {
      const vm = this;
      let mapInstance = vm.mapInstance;
      let layerNo;
      let wmsUrl = "";

      switch (WMSlayerName) {
        case "mineMapLine":
          layerNo = 1;
          break;
        case "mineMapPolygon":
          layerNo = 2;
          break;
        case "mineMapArea":
          layerNo = 3;
          break;
        case "mineHistoryLand2017":
          layerNo = 0;
          break;
        case "mineHistoryLand2019":
          layerNo = 1;
          break;
        case "mineHistoryLand2020":
          layerNo = 2;
          break;
        case "mineHistoryArea2018":
          layerNo = 3;
          break;
        case "mineHistoryArea2019":
          layerNo = 4;
          break;
        case "mineHistoryArea2020":
          layerNo = 5;
          break;
      }

      if (isHistory) {
        wmsUrl =
          "https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_history/MapServer/WMSServer?";
      } else {
        wmsUrl =
          "https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_v2/MapServer/WMSServer?";
      }

      const wmsOption = {
        version: "1.3.0",
        layers: layerNo,
        transparent: true,
        bgcolor: "0xFFFFFF",
        format: "image/png",
        // srs: 'EPSG:4326',
        opacity: 1,
        layerName: WMSlayerName,
      };

      const wmsLayer = L.tileLayer.wms(wmsUrl, wmsOption).addTo(mapInstance);
      vm.WMSLayers.push(wmsLayer);
    },
    toggleMineMapLayers(WMSlayerName, isHistory) {
      // console.log("WMSlayerName", WMSlayerName);
      const vm = this;
      // 如果是已開啟狀態
      if (vm[WMSlayerName]) {
        vm.closeWMSLayer(WMSlayerName);
      } else {
        vm.openWMSLayer(WMSlayerName, isHistory);
      }
    },
  },
  mounted() {
    const vm = this;
    const mapDom = this.$refs.mapContainer;
    let mapInstance = L.map(mapDom, {
      center: [24.66, 121.37],
      zoom: 10,
    });
    vm.mapInstance = mapInstance;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);
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
  background-color: #ecf0f1;
}

.main__layer_section {
  border: 2px solid #0b346e;
  padding: 0.25rem;
  margin: 0.8rem;
}

.main__recent_section {
  background-color: #b5caa0;
  margin: 0 auto;
  padding: 0.8rem 0;
  /* width: 95%; */
  height: 100%;
  display: none;
}

.main__history_section {
  background-color: #fad689;
  margin: 0 auto;
  padding: 0.8rem 0;
  /* width: 95%; */
  height: 100%;
}
.mineArea {
  /* display: none; */
}
.mineLand {
  display: none;
}
</style>
