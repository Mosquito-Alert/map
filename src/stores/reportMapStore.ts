import { defineStore } from 'pinia';
import { ReportType, type Report } from 'src/types/reportType';
import { bitesApi, breedingSitesApi, observationsApi } from 'src/boot/api';

export const useReportMapStore = defineStore('reportMap', {
  state: () => ({
    selectedReport: null as Report | null,
  }),
  actions: {
    async setSelectedReport({ uuid, type }: { uuid: string; type: ReportType }) {
      if (uuid === null) {
        this.selectedReport = null;
        return;
      }

      switch (type) {
        case ReportType.Bite: {
          const bite = await bitesApi.retrieve({ uuid: uuid }).then((res) => res.data);
          this.selectedReport = { ...bite, type: ReportType.Bite };
          break;
        }
        case ReportType.BreedingSite: {
          const breedingSite = await breedingSitesApi
            .retrieve({ uuid: uuid })
            .then((res) => res.data);
          this.selectedReport = { ...breedingSite, type: ReportType.BreedingSite };
          break;
        }
        case ReportType.Observation: {
          const observation = await observationsApi
            .retrieve({ uuid: uuid })
            .then((res) => res.data);
          this.selectedReport = { ...observation, type: ReportType.Observation };
          break;
        }
        default:
          this.selectedReport = null;
      }
    },
  },
});
