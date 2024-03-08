<template>
  <div class="main__layer_section">
    <div class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        v-model="layerDisplayStatus"
        @change="toggleMineMapLayers"
      />
      <label class="from-check-label">{{ passInLayerInfo.nameChinese }}</label>
    </div>
    <div v-if="layerDisplayStatus">
      <label class="form-label"> 透明度：{{ layerOpacity }} </label>
      <input
        class="form-range"
        type="range"
        v-model="layerOpacity"
        step="10"
        @change="changeOpacity('mineHistoryArea2020')"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'LayerSwitch',
  data() {
    return {
      layerDisplayStatus: false,
      layerOpacity: '100',
    };
  },
  // 接收父層傳入的數值
  props: {
    // 範例
    // passInLayerInfo: {
    //   nameChinese: '礦業用地(線)_202010',
    //   nameEnglish: 'mineMapLine',
    //   layerNo: 1,
    // },
    passInLayerInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['toggle-layer', 'update-opacity'],
  methods: {
    toggleMineMapLayers() {
      const vm = this;
      const layerInfo = {
        layerName: vm.passInLayerInfo.nameEnglish,
        layerNo: vm.passInLayerInfo.layerNo,
        displayStatus: vm.layerDisplayStatus,
      };
      vm.$emit('toggle-layer', layerInfo);
    },
    changeOpacity() {
      const vm = this;
      const layerInfo = {
        layerName: vm.passInLayerInfo.nameEnglish,
        layerOpacity: vm.layerOpacity,
      };
      vm.$emit('update-opacity', layerInfo);
    },
  },
};
</script>

<style scoped>
.main__layer_section {
  border: 2px solid #0b346e;
  padding: 0.25rem;
  margin: 0.8rem;
}
</style>
