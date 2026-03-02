<template>
  <div
    class="loader loader-default"
    :class="{ 'is-active': isLoading }"
    data-text="資料載入中"
  ></div>
  <main style="display: flex">
    <div class="main__map_container" id="mapContainer" ref="mapContainer"></div>
    <div class="main__control_panel">
      <div class="h1">Control Panel</div>
      <div class="main__layer_section">
        礦業用地(線)
        <label for="opacity1">透明度</label>
        <input id="opacity1" type="range" v-model="opacity1" @change="rangeChange" />
      </div>
    </div>
  </main>
</template>

<script>
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import "leaflet-kml";
  import "leaflet.glify";

  export default {
    // name: 'map_page',
    data() {
      return {
        // maxDN: 0,
        mapInstance: {},
        WMSLayers: [],
        opacity1: "100",
        geoJsonData: {},
        isLoading: false,
        kmlLayerIntersection: {},
        kmlLayerCctv: {},
      };
    },
    methods: {
      rangeChange() {
        const vm = this;
        console.log("input changed...");
        console.log(vm.opacity1);
        const opacityPercentage = Number(vm.opacity1) / 100;
        console.log("透明度百分比", opacityPercentage);
        vm.WMSLayers[0].setOpacity(opacityPercentage);
      },
      // 取得 GeoJSON 資料
      async getGeoJSONLayer() {
        const vm = this;
        const url = new URL("Mid2_Country_Site.json", import.meta.env.BASE_URL).pathname;
        vm.isLoading = true;
        try {
          const response = await vm.axios.get(url, {
            responseType: "text",
            transformResponse: [(data) => data],
          });
          return JSON.parse(response.data);
        } catch (err) {
          console.error(err);
          throw err;
        } finally {
          vm.isLoading = false;
          // console.log('finally');
        }
      },

      displayGeoJSON(geoJsonResponse) {
        const vm = this;
        // 資料目前是 MultiPolygon
        const geoJsonResponseFormatted = geoJsonResponse.features.map((item, index) => {
          return vm.convertDNtoColor(item);
        });
        const geoJsonToMap = L.geoJSON(geoJsonResponseFormatted, {
          style: function (feature) {
            return { color: feature.properties.color };
          },
        })
          // .bindPopup(function (geoJsonToMap) {
          //   return geoJsonToMap.feature.properties.DN;
          // })
          .addTo(vm.mapInstance);
      },

      displayGeoJSONLeafletGL(geoJsonResponse) {
        const vm = this;
        if (!geoJsonResponse || !Array.isArray(geoJsonResponse.features)) {
          console.error("Invalid GeoJSON payload for glify shapes");
          return;
        }

        geoJsonResponse.features.forEach((item) => {
          if (!item.properties) item.properties = {};
          item.properties.color = vm.convertDnToColorLeafletGL(item.properties.DN);
        });

        const shapes = L.glify.shapes({
          map: vm.mapInstance,
          data: geoJsonResponse,
          // data: vm.geoJsonLayerTest,
          // color: '#00FF00',
          // vertexShaderSource() {
          //   console.log(arguments);
          // },
          // fragmentShaderSource() {
          //   console.log(arguments);
          // },
          color() {
            // console.log(arguments[1].properties.color);
            return arguments[1].properties.color;
          },
          // click(event) {
          //   console.log('ev', event);
          //   console.log('arg', arguments);
          // },
          // color() {
          //   return {
          //     r: 255,
          //     g: 0,
          //     b: 0,
          //   };
          // },
          // 不透明度，預設為 0.5，全不透是 1
          opacity: 0.5,
          // preserveDrawingBuffer: 0,
          // borders: true,
        });
        console.log("shapes", shapes);
      },

      convertDnToColorLeafletGL(DN) {
        let color;
        if (DN <= 2) {
          color = { r: 1, g: 1, b: 0 };
        } else if (DN <= 4) {
          color = { r: 1, g: 0.5, b: 0 };
        } else if (DN <= 6) {
          color = { r: 1, g: 0, b: 0 };
        } else {
          color = { r: 0.4, g: 0, b: 0.2 };
        }
        return color;
      },

      convertDNtoColor(item) {
        // 最大為 9
        switch (item.properties.DN) {
          case 1:
            item.properties.color = "gray";
            break;
          case 2:
            item.properties.color = "green";
            break;
          case 3:
            item.properties.color = "yellow";
            break;
          case 4:
            item.properties.color = "orange";
            break;
          case 5:
            item.properties.color = "red";
            break;
          case 6:
            item.properties.color = "maroon";
            break;
          case 7:
            item.properties.color = "violet";
            break;
          case 8:
            item.properties.color = "purple";
            break;
          case 9:
            item.properties.color = "navy";
            break;
          default:
            item.properties.color = null;
            break;
        }
        return item;
      },

      displayIntersectionKml() {
        const vm = this;
        const url = new URL("T61_intersection.kml", import.meta.env.BASE_URL).pathname;
        vm.axios.get(url).then(function (response) {
          let data = response.data;
          // console.log(arguments);
          // console.log(data);
          const parser = new DOMParser();
          // 解析 Kml
          const kmlData = parser.parseFromString(data, "text/xml");
          vm.kmlLayerIntersection = new L.KML(kmlData);

          vm.mapInstance.addLayer(vm.kmlLayerIntersection);
        });
      },

      // 懶得改
      displayCctvKml() {
        const vm = this;
        const url = new URL("CCTV_T61.kml", import.meta.env.BASE_URL).pathname;
        vm.axios.get(url).then(function (response) {
          debugger;
          let data = response.data;
          console.log(data);
          // console.log(arguments);
          const parser = new DOMParser();
          // 解析 Kml
          const kmlData = parser.parseFromString(data, "text/xml");
          vm.kmlLayerCctv = new L.KML(kmlData);

          vm.mapInstance.addLayer(vm.kmlLayerCctv);
        });
      },

      displayMine2020WMS() {
        const vm = this;
        let mapInstance = vm.mapInstance;
        const wmsOption = {
          version: "1.3.0",
          layers: 1,
          transparent: true,
          bgcolor: "0xFFFFFF",
          format: "image/png",
          // srs: 'EPSG:4326',
          opacity: 1,
          layerName: `MineMapLayer_1`,
        };
        const wmsUrl =
          "https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_v2/MapServer/WMSServer";
        const mineLayer = L.tileLayer.wms(wmsUrl, wmsOption).addTo(mapInstance);
        vm.WMSLayers.push(mineLayer);
        // console.log(mineLayer);
      },

      displayMineHistoryWMS() {
        const vm = this;
        let mapInstance = vm.mapInstance;

        for (let i = 0; i < 6; i++) {
          const wmsOption = {
            version: "1.3.0",
            layers: i,
            transparent: true,
            bgcolor: "0xFFFFFF",
            format: "image/png",
            // srs: 'EPSG:4326',
            layerName: `MineMapHistory_${i}`,
          };
          const wmsUrl =
            "https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_history/MapServer/WMSServer";
          const mineLayer = L.tileLayer.wms(wmsUrl, wmsOption).addTo(mapInstance);
        }
      },
    },
    async mounted() {
      const vm = this;
      const mapDom = this.$refs.mapContainer;
      let mapInstance = L.map(mapDom, {
        center: [23.58, 120.58],
        zoom: 9,
      });
      vm.mapInstance = mapInstance;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);
      // console.log(L.glify.shader.fragment.polygon);
      // console.log(L.glify.shader.vertex);

      const geoJsonData = await vm.getGeoJSONLayer();
      const bounds = L.geoJSON(geoJsonData).getBounds();
      if (bounds.isValid()) {
        vm.mapInstance.fitBounds(bounds);
      }
      vm.displayGeoJSONLeafletGL(geoJsonData);

      // Native Leaflet GeoJSON Rendering, this method is very slow
      // vm.displayGeoJSON(geoJsonData);

      vm.displayMine2020WMS();
      //vm.displayMineHistoryWMS();

      vm.displayIntersectionKml();
      vm.displayCctvKml();
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
