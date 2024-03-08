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
      <section class="main__nlsc_section">
        <LayerSwitch
          v-for="item in NLSCLayers"
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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import LayerSwitch from '@/components/LayerSwitch.vue';

export default {
  name: 'MainMap',
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
          nameChinese: '礦業用地(線)_202010',
          nameEnglish: 'mineMapLine',
          layerSource: 'current',
          layerName: 1,
        },
        {
          nameChinese: '礦業用地(面)_202010',
          nameEnglish: 'mineMapPolygon',
          layerSource: 'current',
          layerName: 2,
        },
        {
          nameChinese: '礦區範圍_202010',
          nameEnglish: 'mineMapArea',
          layerSource: 'current',
          layerName: 3,
        },
      ],
      mineHistoryLayers: [
        {
          nameChinese: '礦業用地_201906',
          nameEnglish: 'mineHistoryLand2019',
          layerSource: 'history',
          layerName: 1,
        },
        {
          nameChinese: '礦區範圍_201906',
          nameEnglish: 'mineHistoryArea2019',
          layerSource: 'history',
          layerName: 4,
        },
      ],
      NLSCLayers: [
        {
          nameChinese: '段籍圖',
          nameEnglish: 'landSectMap',
          layerSource: 'NLSC',
          layerName: 'LANDSECT',
        },
        {
          nameChinese: '道路路網',
          nameEnglish: 'roadMap',
          layerSource: 'NLSC',
          layerName: 'ROAD',
        },
        {
          nameChinese: '各級學校範圍圖',
          nameEnglish: 'schoolMap',
          layerSource: 'NLSC',
          layerName: 'SCHOOL',
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
        if (item.wmsParams.layerName === layerInfo.layerNameEnglish) {
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
      const { layerNameEnglish } = layerInfo;
      const vm = this;
      let mapInstance = vm.mapInstance;
      vm.WMSLayers.forEach((item, index) => {
        // console.log(item);
        if (item.wmsParams.layerName === layerNameEnglish) {
          item.removeFrom(mapInstance);
        }
      });
    },
    openWMSLayer(layerInfo) {
      const vm = this;
      const { layerNameEnglish, layerName, layerSource } = layerInfo;
      let mapInstance = vm.mapInstance;
      let wmsUrl = '';

      switch (layerSource) {
        case 'current': {
          wmsUrl =
            'https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_v2/MapServer/WMSServer?';
          break;
        }
        case 'history': {
          wmsUrl =
            'https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_history/MapServer/WMSServer?';
          break;
        }
        case 'NLSC': {
          wmsUrl = 'https://wms.nlsc.gov.tw/wms';
          break;
        }
      }

      const wmsOption = {
        version: '1.3.0',
        layers: layerName,
        transparent: true,
        bgcolor: '0xFFFFFF',
        format: 'image/png',
        // srs: 'EPSG:4326',
        opacity: 1,
        layerName: layerNameEnglish,
      };

      const wmsLayer = L.tileLayer.wms(wmsUrl, wmsOption).addTo(mapInstance);
      vm.WMSLayers.push(wmsLayer);
    },
  },
  mounted() {
    const vm = this;
    const mapDom = this.$refs.mapContainer;
    let mapInstance = L.map(mapDom, {
      center: [23.995, 121.552],
      zoom: 12,
    });
    vm.mapInstance = mapInstance;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

.main__nlsc_section {
  background-color: #9b90c2;
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
