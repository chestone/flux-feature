import {Store, Immutable} from 'nuclear-js';
import actionTypes from './action-types';

const ENABLED = Immutable.fromJS({enabled: true});
const DISABLED = Immutable.fromJS({enabled: false});

function featureExists(state, featureName) {
  return !!state.get(featureName);
}

function addUrlParameterOverrides(initialFeatures, urlParameters) {
  let features = initialFeatures;
  // load any parameter overrides from the url
  if (urlParameters) {
    const updateValues = Immutable.fromJS(urlParameters).filter((value, key) => {
      return featureExists(features, key);
    }).map((parameterValue) => {
      return (!parameterValue || parameterValue === 'false') ? DISABLED : ENABLED;
    });
    features = features.merge(updateValues);
  }
  return features;
}

/**
 * Register initial state data
 * @param {Immutable.Map} state
 * @param {String} id
 * @param {Object} featureConfiguration
 * @param {Object} urlParameters
 * @return {Immutable.Map}
 */
function register(state, {featureConfiguration, urlParameters}) {
  let features = Immutable.Map.isMap(featureConfiguration) ? featureConfiguration : Immutable.fromJS(featureConfiguration);

  // include any initial state already registered.  This should override defaults, but not url params.
  features = features.merge(state);

  return addUrlParameterOverrides(features, urlParameters);
}

/**
 * Update from URL parameters and re-pull from window.Features
 * @param {Immutable.Map} state
 * @param {String} id
 * @param {Object} urlParameters
 * @return {Immutable.Map}
 */
function updateFromClient(state, {urlParameters}) {
  // include any initial state already registered.  This should override defaults, but not url params.
  let features = state;

  if (window && window.Features && window.Features.getFeatureQueue) {
    features = features.merge(Immutable.fromJS(window.Features.getFeatureQueue()));
  }

  return addUrlParameterOverrides(features, urlParameters);
}

/**
 * Enable the specified feature
 * @param {Immutable.Map} state
 * @param {String} id
 * @param {Object} data
 * @return {Immutable.Map}
 */
function enable(state, {featureName}) {
  return state.mergeIn([featureName], ENABLED);
}

/**
 * Disable the specified feature
 * @param {Immutable.Map} state
 * @param {String} id
 * @param {Object} data
 * @return {Immutable.Map}
 */
function disable(state, {featureName}) {
  return state.mergeIn([featureName], DISABLED);
}

/**
 * Erases all data from the store.
 * This supports testing with the singleton.
 */
function reset() {
  return Immutable.Map();
}

export const storeName = 'featureStore';

export default Store({
  getInitialState() {
    return global.Features ? Immutable.fromJS(global.Features.getFeatureQueue()) : Immutable.Map();
  },

  initialize() {
    const {REGISTER_FEATURES, ENABLE_FEATURE, DISABLE_FEATURE, RESET_FEATURES, UPDATE_FEATURES_FROM_CLIENT} = actionTypes;

    this.on(REGISTER_FEATURES, register);
    this.on(ENABLE_FEATURE, enable);
    this.on(DISABLE_FEATURE, disable);
    this.on(RESET_FEATURES, reset);
    this.on(UPDATE_FEATURES_FROM_CLIENT, updateFromClient);
  }
});

