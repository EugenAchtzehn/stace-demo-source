<template>
  <div
    class="loader loader-default"
    :class="{ 'is-active': isLoading }"
    data-text="資料載入中"
  ></div>
  <div id="mapContainer" ref="mapContainer"></div>
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
      geoJsonLayerTest: {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
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
      // 先經後緯
      geoJsonLayerTest2: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
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
      kmlLayer: {},
    };
  },
  methods: {
    getGeoJsonLayer() {
      const vm = this;
      const url =
        'https://raw.githubusercontent.com/wiki70170/XDevelop/master/Mid2_Country_Site.geojson';
      // const url = 'src/assets/Mid2_Country_Site.geojson';
      return new Promise(function (resolve, reject) {
        vm.isLoading = true;
        vm.axios
          .get(url)
          .then(function (response) {
            // vm.displayGeoJson(response.data);
            vm.displayGeoJsonTest(response.data);
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
    displayGeoJsonTest(geoJsonResponse) {
      const vm = this;
      // console.log('displayTest Executed!');
      console.log('beforeFormatted', geoJsonResponse);
      geoJsonResponse.features.forEach((item, index) => {
        vm.disbracket(item);
      });
      console.log('formatted', geoJsonResponse);
      // console.log(L.glify.shapes);
      L.glify.shapes({
        map: vm.mapInstance,
        data: geoJsonResponse,
        // data: vm.geoJsonLayerTest,
        color() {
          return {
            r: 255,
            g: 0,
            b: 0,
          };
        },
        // 不透明度，預設為 0.5，全不透是 1
        opacity: 1,
      });
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
          item.properties.color = 'Green';
          break;
        case 3:
          item.properties.color = 'Yellow';
          break;
        case 4:
          item.properties.color = 'Orange';
          break;
        case 5:
          item.properties.color = 'red';
          break;
        case 6:
          item.properties.color = 'maroon';
          break;
        case 7:
          item.properties.color = 'purple';
          break;
        case 8:
          item.properties.color = 'violet';
          break;
        case 9:
          item.properties.color = 'Navy';
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
    displayKml() {
      const vm = this;
      vm.axios.get('src/assets/T61_intersection.kml').then(function (response) {
        let data = response.data;
        // console.log(arguments);
        // console.log(data);
        const parser = new DOMParser();
        // 解析 Kml
        const kmlData = parser.parseFromString(data, 'text/xml');
        vm.kmlLayer = new L.KML(kmlData);

        vm.mapInstance.addLayer(vm.kmlLayer);
      });
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
    vm.getGeoJsonLayer();
    // vm.displayGeoJsonTest();
    vm.displayKml();
  },
  created() {},
};
</script>

<style scoped>
#mapContainer {
  width: 100%;
  height: 100vh;
}
</style>
