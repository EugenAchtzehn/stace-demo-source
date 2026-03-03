<template>
  <div class="layer_section">
    <div class="layer-title">{{ layer.name }}</div>
    <div class="layer-meta">
      <span>
        {{ layer.type }}
      </span>
      <span v-if="layer.subType"> / {{ layer.subType }}</span>
    </div>
    <label class="layer-opacity-label" :for="`opacity-${layer.id}`"
      >透明度: {{ Math.round(localOpacity * 100) }}%</label
    >
    <input
      :id="`opacity-${layer.id}`"
      type="range"
      min="0"
      max="100"
      step="1"
      v-model.number="opacityPercent"
      @input="onOpacityChange"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, type PropType } from "vue";
  import type { LayerControlPayload, ManagedLayer } from "../types/ManagedLayer";

  export default defineComponent({
    name: "LayerItem",
    props: {
      layer: {
        type: Object as PropType<ManagedLayer>,
        required: true,
      },
    },
    emits: {
      "opacity-change": (payload: LayerControlPayload) => {
        return typeof payload?.id === "number" && typeof payload?.opacity === "number";
      },
    },
    data() {
      return {
        opacityPercent: Math.round((this.layer?.opacity ?? 1) * 100),
      };
    },
    computed: {
      localOpacity(): number {
        return this.opacityPercent / 100;
      },
    },
    watch: {
      "layer.opacity": {
        handler(nextOpacity: number) {
          const nextPercent = Math.round((nextOpacity ?? 1) * 100);
          if (nextPercent !== this.opacityPercent) {
            this.opacityPercent = nextPercent;
          }
        },
      },
    },
    methods: {
      onOpacityChange() {
        this.$emit("opacity-change", {
          id: this.layer.id,
          opacity: this.localOpacity,
        });
      },
    },
  });
</script>

<style scoped>
  .layer_section {
    border: 2px solid #000;
    padding: 0.25rem;
    margin: 0.25rem;
  }

  .layer-title {
    font-weight: 700;
  }

  .layer-meta {
    color: #666;
    margin-bottom: 0.5rem;
  }

  .layer-opacity-label {
    display: inline-block;
    margin-bottom: 0.25rem;
  }

  input[type="range"] {
    width: 100%;
  }
</style>
