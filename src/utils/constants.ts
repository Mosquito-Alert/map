import { BreedingSiteSiteType } from 'mosquito-alert';

export const mosquitoTaxonIds = {
  albopictus: [112],
  aegypti: [113],
  japonicus: [114],
  koreicus: [115],
  culex: [10],
  unidentified: [null],
  other: [112, 113, 114, 115, 10, null], // This will be negated
};

export const breedingSiteTypes = {
  stormDrain: [BreedingSiteSiteType.StormDrain],
  other: [
    BreedingSiteSiteType.Other,
    BreedingSiteSiteType.Basin,
    BreedingSiteSiteType.Bucket,
    BreedingSiteSiteType.Fountain,
    BreedingSiteSiteType.SmallContainer,
    BreedingSiteSiteType.Well,
  ],
};
