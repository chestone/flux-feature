window.Features = (function() {
  var queuedFeatures = {};

  return {
    enable: function(featureName) {
      if (window.FeatureActions && window.FeatureActions.enable) {
        window.FeatureActions.enable(featureName);
      } else {
        queuedFeatures[featureName] = {enabled: true};
      }
    },
    disable: function(featureName) {
      if (window.FeatureActions && window.FeatureActions.disable) {
        window.FeatureActions.disable(featureName);
      } else {
        queuedFeatures[featureName] = {enabled: false};
      }
    },
    getFeatureQueue: function() {
      return queuedFeatures;
    }
  };
}());
