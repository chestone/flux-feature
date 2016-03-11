import {assign} from 'lodash';
import reactor from './reactor';
import {store as featureStore} from './features';

const stores = assign({}, featureStore);

reactor.registerStores(stores);

export default reactor;

