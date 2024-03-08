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
        <LayerSwitch
          v-for="(item, index) in mineMapLayers"
          :key="item.nameChinese"
          :passInLayerInfo="item"
          @update-opacity="updateLayerOpacity"
          @toggle-layer="toggleLayerDisplay"
        ></LayerSwitch>
      </section>
      <section class="main__history_section">
        <LayerSwitch
          v-for="(item, index) in mineHistoryLayers"
          :key="item.nameChinese"
          :passInLayerInfo="item"
          @update-opacity="updateLayerOpacity"
          @toggle-layer="toggleLayerDisplay"
        ></LayerSwitch>
      </section>
    </div>
  </main>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import LayerSwitch from "@/components/LayerSwitch.vue";

export default {
  name: "MainMap",
  components: {
    LayerSwitch,
  },
  data() {
    return {
      mapInstance: {},
      // 存放 WMSLayer 的地方
      WMSLayers: [],
      isLoading: false,
      mineMapLayers: [
        {
          nameChinese: "礦業用地(線)_202010",
          nameEnglish: "mineMapLine",
          isHistory: false,
          layerNo: 1,
        },
        {
          nameChinese: "礦業用地(面)_202010",
          nameEnglish: "mineMapPolygon",
          isHistory: false,
          layerNo: 2,
        },
        {
          nameChinese: "礦區範圍_202010",
          nameEnglish: "mineMapArea",
          isHistory: false,
          layerNo: 3,
        },
      ],
      mineHistoryLayers: [
        {
          nameChinese: "礦業用地_201711",
          nameEnglish: "mineHistoryLand2017",
          isHistory: true,
          layerNo: 0,
        },
        {
          nameChinese: "礦業用地_201906",
          nameEnglish: "mineHistoryLand2019",
          isHistory: true,
          layerNo: 1,
        },
        {
          nameChinese: "礦業用地_202008",
          nameEnglish: "mineHistoryLand2020",
          isHistory: true,
          layerNo: 2,
        },
        {
          nameChinese: "礦區範圍_201811",
          nameEnglish: "mineHistoryArea2018",
          isHistory: true,
          layerNo: 3,
        },
        {
          nameChinese: "礦區範圍_201906",
          nameEnglish: "mineHistoryArea2019",
          isHistory: true,
          layerNo: 4,
        },
        {
          nameChinese: "礦區範圍_202008",
          nameEnglish: "mineHistoryArea2020",
          isHistory: true,
          layerNo: 5,
        },
      ],
    };
  },
  methods: {
    updateLayerOpacity(layerInfo) {
      const vm = this;
      // console.log(layerInfo);
      const opacity = Number(layerInfo.layerOpacity) / 100;
      vm.WMSLayers.forEach((item) => {
        if (item.wmsParams.layerName === layerInfo.layerName) {
          item.setOpacity(opacity);
        }
      });
    },
    toggleLayerDisplay(layerInfo) {
      const vm = this;
      console.log(layerInfo);
      // 假使為 false/關閉
      if (!layerInfo.displayStatus) {
        vm.closeWMSLayer(layerInfo);
      } else {
        vm.openWMSLayer(layerInfo);
      }
    },
    closeWMSLayer(layerInfo) {
      const { layerName } = layerInfo;
      const vm = this;
      let mapInstance = vm.mapInstance;
      vm.WMSLayers.forEach((item, index) => {
        // console.log(item);
        if (item.wmsParams.layerName === layerName) {
          item.removeFrom(mapInstance);
        }
      });
    },
    openWMSLayer(layerInfo) {
      const vm = this;
      const { layerName, layerNo, isHistory } = layerInfo;
      let mapInstance = vm.mapInstance;
      let wmsUrl = "";

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
        layerName: layerName,
      };

      const wmsLayer = L.tileLayer.wms(wmsUrl, wmsOption).addTo(mapInstance);
      vm.WMSLayers.push(wmsLayer);
    },
  },
  mounted() {
    const vm = this;
    const mapDom = this.$refs.mapContainer;
    let mapInstance = L.map(mapDom, {
      center: [23.994975495847584, 121.55228927116447],
      zoom: 15,
    });
    vm.mapInstance = mapInstance;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);
  },
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
  overflow: auto;
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
  padding: 0.5rem 0;
}
.main__history_section {
  background-color: #fad689;
  margin: 0 auto;
  padding: 0.5rem 0;
}
/* .mineArea {
  display: none;
}
.mineLand {
  display: none;
} */
</style>
