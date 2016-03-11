import {storeName} from './store';

export default function makeGetters(featureName) {
  return [[storeName, featureName],
    function(featureState) {
      if (!featureState) {
        throw new Error('Invalid feature accessed in FeatureStore');
      }
      return featureState.get('enabled');
    }
  ];
}

