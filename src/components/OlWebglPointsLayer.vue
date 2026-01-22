<!-- <template>
  <div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { provide } from "vue";

import WebGLPointsLayer from "ol/layer/WebGLPoints";
import { useLayer } from "vue3-openlayers"


const props = withDefaults(
  defineProps<
    {
      disableHitDetection: boolean,
      styles: any
    }
  >(),
  {
    disableHitDetection: false,
    styles: {},
  },
);

const { layer } = useLayer(WebGLPointsLayer, props)

provide("webglPointsLayer", layer);

defineExpose({
  webglPointsLayer: layer,
});
</script> -->
