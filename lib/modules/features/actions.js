import actionTypes from './action-types';
import {Immutable} from 'nuclear-js';

export default function(reactor, opts = {}) {
  const {REGISTER_FEATURES, ENABLE_FEATURE, DISABLE_FEATURE, RESET_FEATURES, UPDATE_FEATURES_FROM_CLIENT} = actionTypes;

  const FeatureActions = {
    /**
     * Register and initialize the feature store with the feature configuration file.
     * Any feature referenced must be initialized through registration.  Attempting to reference a non-initialized
     * feature will result in an error in debug and a logged warning in production.
     * This supports overriding the default values via urls
     * Explicit javascript calls to enable or disable overwrite url parameters
     * @param {Object} featureConfiguration must be a collection of features
     * @param {Object} feature must contain an 'enabled' field and any number of other fields, which serve as parameters
     */
    register(configuration, urlParameters) {
      // validate configuration
      const featureConfiguration = Immutable.Map.isMap(configuration) ? configuration : Immutable.fromJS(configuration);
      featureConfiguration.forEach(function(value, key) {
        if (!value || typeof value.get('enabled') === 'undefined') {
          throw new Error('Invalid configuration: key ' +
            key + ' has value ' + value + ' without default enabled state.');
        }
      });
      reactor.dispatch(REGISTER_FEATURES, {featureConfiguration, urlParameters});
    },

    /**
     * This will re-load the values from the window's Features cash, if it exists, and then load any recognized features
     * from the url parameters.
     * @param urlParameters
     */
    reinitializeWithUrlParameters(urlParameters) {
      reactor.dispatch(UPDATE_FEATURES_FROM_CLIENT, {urlParameters});
    },

    /**
     * Enable the feature indicated by 'featureName'
     * @param {String} featureName
     */
    enable(featureName) {
      reactor.dispatch(ENABLE_FEATURE, {featureName});
    },

    /**
     * Disable the feature indicated by 'featureName'
     * @param {String} featureName
     */
    disable(featureName) {
      reactor.dispatch(DISABLE_FEATURE, {featureName});
    },

    /**
     * Clears all state from the feature store
     * Used in testing only. If the feature store is not mocked, this must be called in each 'after' method
     */
    reset() {
      reactor.dispatch(RESET_FEATURES);
    }
  };

  global.FeatureActions = {
    enable: FeatureActions.enable,
    disable: FeatureActions.disable
  };

  return {FeatureActions};
}

