<template>
  <div
    class="loader loader-default"
    :class="{ 'is-active': isLoading }"
    data-text="資料載入中"
  ></div>
  <main class="container">
    <div class="map_container" ref="mapEl"></div>
    <div class="control_panel">
      <div class="h1">圖層控制</div>
      <div v-for="layer in managedLayers" :key="layer.id">
        <layer-item :layer="layer" @opacity-change="rangeChange" />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
  // ===== internal components & modules =====
  import LayerItem from "./components/LayerItem.vue";

  // ===== external libs =====
  import { defineComponent } from "vue";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import "leaflet-kml";
  import "leaflet.glify";

  // ===== types =====
  import type { Layer, LayerGroup, Map } from "leaflet";
  import type { LayerControlPayload, ManagedLayer } from "./types/ManagedLayer";

  type GeoJsonFeature = {
    properties: {
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };

  type GeoJsonData = {
    features: GeoJsonFeature[];
    [key: string]: unknown;
  };

  export default defineComponent({
    components: {
      LayerItem,
    },
    data() {
      return {
        mapInstance: null as Map | null,
        // 需要由 UI 控制的 Layers 通通放在這邊管理，底圖或是 glify 的不在這
        layerGroup: null as LayerGroup | null,
        managedLayers: [] as ManagedLayer[],
        geoJsonData: {} as GeoJsonData,
        isLoading: false,
      };
    },
    methods: {
      addManagedLayer(layer: Layer, managed: ManagedLayer) {
        const vm = this;
        if (!vm.layerGroup) return;
        layer.managed = managed;
        vm.layerGroup.addLayer(layer);
        vm.updateManagedLayers();
      },

      updateManagedLayers() {
        const vm = this;
        if (!vm.layerGroup) return;

        const updatedManagedLayers: ManagedLayer[] = [];
        vm.layerGroup.eachLayer((layer: Layer) => {
          const id = vm.layerGroup!.getLayerId(layer);
          const managed = layer.managed || {};

          const updatedManagedLayer: ManagedLayer = {
            id,
            name: managed.name || `layer_${id}`,
            type: managed.type || "UnknownLayer",
            opacity: typeof managed.opacity === "number" ? managed.opacity : 1,
            subType: managed.subType,
          };
          updatedManagedLayers.push(updatedManagedLayer);
        });

        vm.managedLayers = updatedManagedLayers;
      },

      rangeChange(payload?: LayerControlPayload) {
        const vm = this;
        if (!vm.layerGroup) return;
        if (!payload || typeof payload !== "object") return;

        const layerId = payload.id;
        const updatedOpacity = payload.opacity;

        // 先更新 managedLayers 的 opacity（UI 狀態）
        const managedLayer = vm.managedLayers.find((item) => item.id === layerId);
        if (managedLayer) managedLayer.opacity = updatedOpacity;

        // 再用 id 找 layerGroup 內實體圖層做實際更新
        const targetLayer = vm.layerGroup.getLayer(layerId);
        if (!targetLayer) return;
        if (!targetLayer.managed) return;

        targetLayer.managed.opacity = updatedOpacity;

        const leafLayer = targetLayer as unknown as {
          setOpacity?: (opacity: number) => void;
          eachLayer?: (fn: (childLayer: Layer) => void) => void;
        };

        if (typeof leafLayer.setOpacity === "function") {
          leafLayer.setOpacity(updatedOpacity);
        }

        if (typeof leafLayer.eachLayer === "function") {
          leafLayer.eachLayer((childLayer: Layer) => {
            const child = childLayer as unknown as {
              setStyle?: (style: { opacity: number; fillOpacity: number }) => void;
              setOpacity?: (opacity: number) => void;
            };

            if (typeof child.setStyle === "function") {
              child.setStyle({
                opacity: updatedOpacity,
                fillOpacity: updatedOpacity,
              });
            }
            if (typeof child.setOpacity === "function") {
              child.setOpacity(updatedOpacity);
            }
          });
        }

        vm.updateManagedLayers();
      },
      // 取得 GeoJSON 資料
      async getGeoJSONData(): Promise<GeoJsonData> {
        const vm = this;
        const url = `${import.meta.env.BASE_URL}Mid2_Country_Site.json`;
        vm.isLoading = true;
        try {
          const response = await (vm as any).axios.get(url, {
            responseType: "text",
            transformResponse: [(data: string) => data],
          });
          return JSON.parse(response.data) as GeoJsonData;
        } catch (err) {
          console.error(err);
          throw err;
        } finally {
          vm.isLoading = false;
          // console.log('finally');
        }
      },

      displayGeoJSON(geoJsonResponse: GeoJsonData) {
        const vm = this;
        // 資料目前是 MultiPolygon
        const geoJsonResponseFormatted = geoJsonResponse.features.map((item) => {
          return vm.convertDNtoColor(item);
        });
        L.geoJSON(geoJsonResponseFormatted as any, {
          style: function (feature: any) {
            return { color: feature.properties.color };
          },
        })
          // .bindPopup(function (geoJsonToMap) {
          //   return geoJsonToMap.feature.properties.DN;
          // })
          .addTo(vm.mapInstance as Map);
      },

      displayGeoJSONLeafletGL(geoJsonResponse: GeoJsonData) {
        const vm = this;
        if (!geoJsonResponse || !Array.isArray(geoJsonResponse.features)) {
          console.error("Invalid GeoJSON payload for glify shapes");
          return;
        }

        geoJsonResponse.features.forEach((item) => {
          if (!item.properties) item.properties = { DN: 0 };
          item.properties.color = vm.convertDnToColorLeafletGL(item.properties.DN);
        });

        L.glify.shapes({
          map: vm.mapInstance,
          data: geoJsonResponse,
          // vertexShaderSource() {
          //   console.log(arguments);
          // },
          // fragmentShaderSource() {
          //   console.log(arguments);
          // },
          color() {
            // console.log(arguments[1].properties.color);
            return (arguments as IArguments)[1].properties.color;
          },
          // click(event) {
          //   console.log('ev', event);
          //   console.log('arg', arguments);
          // },
          // 不透明度，預設為 0.5，全不透是 1
          opacity: 0.8,
          // preserveDrawingBuffer: 0,
          // borders: true,
        } as any);
      },

      convertDnToColorLeafletGL(DN: number) {
        if (DN <= 2) return { r: 1, g: 1, b: 0 };
        if (DN <= 4) return { r: 1, g: 0.5, b: 0 };
        if (DN <= 6) return { r: 1, g: 0, b: 0 };
        return { r: 0.4, g: 0, b: 0.2 };
      },

      convertDNtoColor(item: GeoJsonFeature) {
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
        const url = `${import.meta.env.BASE_URL}T61_intersection.kml`;
        (vm as any).axios.get(url).then(function (response: { data: string }) {
          const data = response.data;
          // console.log(arguments);
          // console.log(data);
          const parser = new DOMParser();
          // 解析 Kml
          const kmlData = parser.parseFromString(data, "text/xml");

          vm.addManagedLayer(new L.KML(kmlData), {
            name: "T61_intersection.kml",
            type: "VectorLayer",
            opacity: 1,
            subType: "KML",
          });
        });
      },

      displayCctvKml() {
        const vm = this;
        const url = `${import.meta.env.BASE_URL}CCTV_T61.kml`;
        (vm as any).axios.get(url).then(function (response: { data: string }) {
          const data = response.data;
          // console.log(arguments);
          const parser = new DOMParser();
          // 解析 Kml
          const kmlData = parser.parseFromString(data, "text/xml");

          vm.addManagedLayer(new L.KML(kmlData), {
            name: "CCTV_T61.kml",
            type: "VectorLayer",
            opacity: 1,
            subType: "KML",
          });
        });
      },

      displayMine2020WMS() {
        const vm = this;
        const wmsOption = {
          version: "1.3.0",
          layers: "1",
          transparent: true,
          bgcolor: "0xFFFFFF",
          format: "image/png",
          // srs: 'EPSG:4326',
          opacity: 1,
          layerName: `MineMapLayer_1`,
        };
        const wmsUrl =
          "https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_v2/MapServer/WMSServer";
        const mineLayer = L.tileLayer.wms(wmsUrl, wmsOption);
        vm.addManagedLayer(mineLayer, {
          name: wmsOption.layerName,
          type: "TileLayer",
          opacity: wmsOption.opacity,
          subType: "WMS",
        });
      },

      displayMineHistoryWMS() {
        const vm = this;
        const mapInstance = vm.mapInstance;
        if (!mapInstance) return;

        for (let i = 0; i < 6; i++) {
          const wmsOption = {
            version: "1.3.0",
            layers: i.toString(),
            transparent: true,
            bgcolor: "0xFFFFFF",
            format: "image/png",
            // srs: 'EPSG:4326',
            layerName: `MineMapHistory_${i}`,
          };
          const wmsUrl =
            "https://gis.pstcom.com.tw/pstarcgisserver/services/MINE/MineMap_history/MapServer/WMSServer";
          L.tileLayer.wms(wmsUrl, wmsOption).addTo(mapInstance);
        }
      },
    },
    async mounted() {
      const vm = this;
      const mapInstance = L.map(vm.$refs.mapEl, {
        center: [23.58, 120.58],
        zoom: 9,
      });
      vm.mapInstance = mapInstance;
      vm.layerGroup = L.layerGroup().addTo(mapInstance);
      // 底圖，不放在 layerGroup 裡管理
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      const geoJsonData = await vm.getGeoJSONData();

      const bounds = L.geoJSON(geoJsonData as any).getBounds();
      if (bounds.isValid()) vm.mapInstance.fitBounds(bounds);
      vm.displayGeoJSONLeafletGL(geoJsonData);

      // Native Leaflet GeoJSON Rendering, this method is very slow
      // vm.displayGeoJSON(geoJsonData);

      vm.displayMine2020WMS();
      //vm.displayMineHistoryWMS();

      vm.displayIntersectionKml();
      vm.displayCctvKml();
    },
  });
</script>

<style scoped>
  .container {
    display: flex;

    .map_container {
      width: 70%;
      height: 100vh;
    }

    .control_panel {
      width: 30%;
      height: 100vh;
    }
  }
</style>
