import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { Feature } from 'ol';
import type { Polygon, MultiPolygon } from 'ol/geom';
import type { Projection } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';

import type { TemporaryBoundary } from 'mosquito-alert';

import { boundariesApi } from 'src/boot/api';

interface TemporaryBoundaryWithExpiry extends TemporaryBoundary {
  expires_at: Date;
}

export const useBoundaryStore = defineStore('boundary', () => {
  const temporaryBoundary = ref<TemporaryBoundaryWithExpiry | null>(null);
  const feature = ref<Feature<Polygon | MultiPolygon> | null>(null);

  const geojsonFormatter = new GeoJSON();

  async function createTemporaryBoundary(): Promise<TemporaryBoundaryWithExpiry | null> {
    if (!feature.value) return null;

    try {
      const projection = feature.value.get('projection') as string;
      const geometry = feature.value.getGeometry() as Polygon | MultiPolygon;
      const transformed = projection
        ? geometry.clone().transform(projection, 'EPSG:4326')
        : geometry;
      const geojson = geojsonFormatter.writeGeometryObject(transformed);
      const response = await boundariesApi.createTemporary({
        temporaryBoundaryRequest: {
          geojson: geojson,
        },
      });

      const boundary: TemporaryBoundaryWithExpiry = {
        ...response.data,
        expires_at: new Date(new Date().getTime() + response.data.expires_in * 1000),
      };

      temporaryBoundary.value = boundary;
      // Refresh slightly before expiration
      return boundary;
    } catch (err) {
      console.error('Failed to create temporary boundary', err);
      temporaryBoundary.value = null;
      return null;
    }
  }

  // Lazy getter: renew if expired
  async function getTemporaryBoundary(): Promise<TemporaryBoundaryWithExpiry | null> {
    const now = new Date();
    if (!temporaryBoundary.value || temporaryBoundary.value.expires_at < now) {
      return await createTemporaryBoundary();
    }
    return temporaryBoundary.value;
  }

  function setPolygon(newPolygon: null): void;
  function setPolygon(newPolygon: Polygon | MultiPolygon, proj: Projection, name: string): void;
  function setPolygon(
    newPolygon: Polygon | MultiPolygon | null,
    proj?: Projection | null,
    name?: string,
  ) {
    // Invalidate existing boundary
    temporaryBoundary.value = null;

    if (!newPolygon) {
      feature.value = null;
    } else {
      feature.value = new Feature({
        geometry: newPolygon,
        name: name ?? null,
        projection: proj?.getCode() ?? null,
      });
    }
  }

  const getPolygon = computed(() =>
    feature.value ? (feature.value.getGeometry() as Polygon | MultiPolygon) : null,
  );
  const getBoundaryName = computed(() =>
    feature.value ? (feature.value.get('name') as string | null) : null,
  );

  return { getPolygon, getBoundaryName, setPolygon, getTemporaryBoundary };
});
