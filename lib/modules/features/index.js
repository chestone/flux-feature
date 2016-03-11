import featureStore, {storeName} from './store';
import makeGetters from './getters';
import makeActions from './actions';

export const store = {
  [storeName]: featureStore
};

export default {
  makeGetters,
  makeActions,
  store
};

