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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-kml';
import 'leaflet-glify-layer';

let mapInstance, layer;

export default {
  // name: 'map_page',
  data() {
    return {
      // maxDN: 0,
      mapInstance: {},
      WMSLayers: [],
      opacity1: '100',
      // 用來測試套件的假資料
      geoJsonLayerTest: {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              // 原本的記錄方式會跳錯，所以下面用一支 disbracket() 來替換結構
              // 注意，原生 leaflet 跟 leaflet-glify (少一層) 能讀的結構似乎不同
              // 可能也跟 Polygon, MultiPolygon 的記錄方式有關，之後使用要先做測試用資料，確定 OK 再讀取 API
              // coordinates: [
              //   [
              //     [
              //       [120.9121, 24.7384],
              //       [120.9121, 24.7284],
              //       [120.9021, 24.7284],
              //       [120.9121, 24.7384],
              //     ],
              //   ],
              //   [
              //     [
              //       [120.9131, 24.7294],
              //       [120.9131, 24.7194],
              //       [120.9031, 24.7194],
              //       [120.9131, 24.7294],
              //     ],
              //   ],
              // ],
              coordinates: [
                [
                  [120.9121, 24.7384],
                  [120.9121, 24.7284],
                  [120.9021, 24.7284],
                  [120.9121, 24.7384],
                ],
                [
                  [120.9131, 24.7294],
                  [120.9131, 24.7194],
                  [120.9031, 24.7194],
                  [120.9131, 24.7294],
                ],
              ],
            },
            properties: { DN: 2 },
          },
        ],
        type: 'FeatureCollection',
        name: 'Mid2_Country_Site',
      },
      geoJsonLayerTest2: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              // 先經後緯
              coordinates: [
                [
                  [120.9121, 24.7],
                  [120.9221, 24.7],
                  [120.9221, 24.8],
                  [120.9121, 24.7],
                ],
                [
                  [120.92, 24.7],
                  [120.93, 24.7],
                  [120.93, 24.8],
                  [120.92, 24.7],
                ],
              ],
            },
            properties: { DN: 2, color: 'red' },
          },
        ],
        name: 'Mid2_Country_Site',
      },
      // the sample data on official page of leaflet-glify
      // geoJsonLayerCzech: {
      //   type: 'FeatureCollection',
      //   features: [
      //     {
      //       type: 'Feature',
      //       geometry: {
      //         type: 'Polygon',
      //         coordinates: [
      //           [
      //             [14.55496, 50.0121],
      //             [14.55566, 50.0109],
      //             [14.55142, 50.0077],
      //             [14.56239, 50.0121],
      //             [14.55496, 50.0121],
      //           ],
      //         ],
      //       },
      //       properties: {
      //         AREA: 496077216,
      //         PERIMETER: 150985,
      //       },
      //     },
      //   ],
      // },
      isLoading: false,
      kmlLayerIntersection: {},
      kmlLayerCctv: {},
    };
  },
  methods: {
    rangeChange() {
      const vm = this;
      console.log('input changed...');
      console.log(vm.opacity1);
      const opacityPercentage = Number(vm.opacity1) / 100;
      console.log('透明度百分比', opacityPercentage);
      vm.WMSLayers[0].setOpacity(opacityPercentage);
    },
    getGeoJsonLayer() {
      const vm = this;
      const url = '/Mid2_Country_Site.geojson';
      // const url = 'src/assets/Mid2_Country_Site.geojson';
      return new Promise(function (resolve, reject) {
        vm.isLoading = true;
        vm.axios
          .get(url, { responseType: 'json' })
          .then(function (response) {
            // vm.displayGeoJson(response.data);
            vm.displayGeoJsonLeafletGL(response.data);
            resolve(response);
          })
          .catch(function (err) {
            console.error(err);
            reject(err);
          })
          .finally(() => {
            vm.isLoading = false;
            // console.log('finally');
          });
      });
    },
    displayGeoJson(geoJsonResponse) {
      const vm = this;
      // 都是 MultiPolygon
      // console.log('displayGeoJson');
      // console.log(geoJsonResponse);
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
    displayGeoJsonLeafletGL(geoJsonResponse) {
      const vm = this;
      // console.log('displayTest Executed!');
      // console.log('beforeFormatted', geoJsonResponse);
      geoJsonResponse.features.forEach((item, index) => {
        vm.disbracket(item);
        item.properties.color = vm.convertDnToColorLeafletGL(item.properties.DN);
      });
      // console.log('geoJsonResponse', geoJsonResponse);
      // console.log(L.glify.shapes);
      L.glify.shapes({
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
      // switch (DN) {
      //   case 1:
      //     // light gray
      //     color = { r: 220, g: 220, b: 220 };
      //     break;
      //   case 2:
      //     // azure
      //     color = { r: 240, g: 255, b: 255 };
      //     break;
      //   case 3:
      //     // pale green
      //     color = { r: 152, g: 251, b: 152 };
      //     break;
      //   case 4:
      //     // khaki
      //     color = { r: 240, g: 230, b: 140 };
      //     break;
      //   case 5:
      //     // crimson
      //     color = { r: 220, g: 20, b: 60 };
      //     break;
      //   case 6:
      //     // maroon
      //     color = { r: 128, g: 0, b: 0 };
      //     break;
      //   case 7:
      //     // violet
      //     color = { r: 238, g: 130, b: 238 };
      //     break;
      //   case 8:
      //     // purple
      //     color = { r: 102, g: 51, b: 0 };
      //     break;
      //   case 9:
      //     // navy
      //     color = { r: 0, g: 0, b: 128 };
      //     break;
      //   default:
      //     color = null;
      //     break;
      // }
      return color;
    },
    convertDNtoColor(item) {
      // 最大為 9
      // if (item.properties.DN > this.maxDN) {
      //   this.maxDN = item.properties.DN;
      // }
      switch (item.properties.DN) {
        case 1:
          item.properties.color = 'gray';
          break;
        case 2:
          item.properties.color = 'green';
          break;
        case 3:
          item.properties.color = 'yellow';
          break;
        case 4:
          item.properties.color = 'orange';
          break;
        case 5:
          item.properties.color = 'red';
          break;
        case 6:
          item.properties.color = 'maroon';
          break;
        case 7:
          item.properties.color = 'violet';
          break;
        case 8:
          item.properties.color = 'purple';
          break;
        case 9:
          item.properties.color = 'navy';
          break;
        default:
          item.properties.color = null;
          break;
      }
      return item;
    },
    // 拆 [] 括號
    disbracket(item) {
      item.geometry.coordinates = item.geometry.coordinates[0];
    },
    displayIntersectionKml() {
      const vm = this;
      vm.axios.get('/T61_intersection.kml').then(function (response) {
        let data = response.data;
        // console.log(arguments);
        // console.log(data);
        const parser = new DOMParser();
        // 解析 Kml
        const kmlData = parser.parseFromString(data, 'text/xml');
        vm.kmlLayerIntersection = new L.KML(kmlData);

        vm.mapInstance.addLayer(vm.kmlLayerIntersection);
      });
    },
    // 懶得改
    displayCctvKml() {
      const vm = this;
      vm.axios.get('/CCTV_T61.kml').then(function (response) {
        let data = response.data;
        // console.log(arguments);
        // console.log(data);
        const parser = new DOMParser();
        // 解析 Kml
        const kmlData = parser.parseFromString(data, 'text/xml');
        vm.kmlLayerCctv = new L.KML(kmlData);

        vm.mapInstance.addLayer(vm.kmlLayerCctv);
      });
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
    // console.log(L.glify.shader.fragment.polygon);
    // console.log(L.glify.shader.vertex);

    //vm.getGeoJsonLayer();
    // vm.displayGeoJsonTest();
    vm.displayMine2020WMS();
    //vm.displayMineHistoryWMS();
    // icon 目前直接在 kml 中改，由 flaticon 下載後放到公司測試機的路徑下
    // vm.displayIntersectionKml();
    // vm.displayCctvKml();
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
