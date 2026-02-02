import type { Bite, BreedingSite, Observation } from 'mosquito-alert';

export enum ReportType {
  Bite = 'bite',
  Observation = 'observation',
  BreedingSite = 'breeding_site',
}

interface BiteReport extends Bite {
  type: ReportType.Bite;
}

interface BreedingSiteReport extends BreedingSite {
  type: ReportType.BreedingSite;
}

interface ObservationReport extends Observation {
  type: ReportType.Observation;
}

export type Report = BiteReport | BreedingSiteReport | ObservationReport;
