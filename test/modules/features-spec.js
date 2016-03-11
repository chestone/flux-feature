import {expect} from 'chai';
import reactor from '../../lib/modules/bootstrap';
import featuresModule from '../../lib/modules/features';
import featureStore from '../../lib/modules/features/store';

describe('FeaturesStore', () => {
  const {makeGetters, makeActions} = featuresModule;
  let Actions, enabledFeature, disabledFeature, missingFeature, oldWindowFeatures;

  const enabledFeatureName = 'enabled_feature';
  const disabledFeatureName = 'disabled_feature';
  const missingFeatureName = 'missing_feature';
  const configuration = {
    enabled_feature: {
      enabled: true
    },
    disabled_feature: {
      enabled: false
    }
  };

  function makeFeature(name) {
    const Getter = makeGetters(name);
    return {
      isTrue: function() {
        expect(reactor.evaluate(Getter)).to.eq(true);
      },
      isFalse: function() {
        expect(reactor.evaluate(Getter)).to.eq(false);
      },
      throwsError: function() {
        expect(function() {
          reactor.evaluate(Getter);
        }).to.throw('Invalid feature accessed in FeatureStore');
      }
    };
  }

  before(() => {
    oldWindowFeatures = window.Features;
    window.Features = {};
    Actions = makeActions(reactor);
    enabledFeature = makeFeature(enabledFeatureName);
    disabledFeature = makeFeature(disabledFeatureName);
    missingFeature = makeFeature(missingFeatureName);
  });

  after(() => {
    window.Features = oldWindowFeatures;
  });

  describe('#Features', () => {
    afterEach(() => {
      Actions.FeatureActions.reset();
      window.Features = {};
    });

    describe('Feature initialization', () => {
      it('registers actions on window', () => {
        expect(window.FeatureActions.enable).to.exist;
        expect(window.FeatureActions.disable).to.exist;
      });

      it('allows window to enable features', () => {
        window.FeatureActions.enable(disabledFeatureName);
        disabledFeature.isTrue();
      });

      it('allows window to disable features', () => {
        window.FeatureActions.disable(enabledFeatureName);
        enabledFeature.isFalse();
      });

      it('works if feature queue is missing', () => {
        enabledFeature.throwsError();
        disabledFeature.throwsError();
        missingFeature.throwsError();
      });

      it('initializes from the feature queue', () => {
        window.Features = {};
        window.Features.getFeatureQueue = () => {
          return {enabled_feature: {enabled: false}};
        };
        expect(featureStore.getInitialState().toJS()).to.deep.equal({enabled_feature: {enabled: false}});
      });
    });

    describe('#register', () => {
      it('imports default values from a config file', () => {
        Actions.FeatureActions.register(configuration, undefined);
        enabledFeature.isTrue();
        disabledFeature.isFalse();
        missingFeature.throwsError();
      });

      it('fails on invalid configuration', () => {
        expect(function() {
          Actions.FeatureActions.register({invalid_feature: {}});
        }).to.throw('Invalid configuration: key invalid_feature has value Map {} without default enabled state.');
      });

      it('overrides those default values with url parameters', () => {
        Actions.FeatureActions.register(configuration, {
          enabled_feature: 0,
          disabled_feature: 1
        });
        enabledFeature.isFalse();
        disabledFeature.isTrue();
        missingFeature.throwsError();
      });

      it('ignores extra url parameters', () => {
        Actions.FeatureActions.register(configuration, {
          enabled_feature: 0,
          extra_param: 1
        });
        enabledFeature.isFalse();
        disabledFeature.isFalse();
        missingFeature.throwsError();
      });
    });

    describe('methods that manipulate the store', () => {
      beforeEach(()=> {
        Actions.FeatureActions.register(configuration, undefined);
      });

      describe('#reinitializeWithUrlParameters', () => {
        it('reloads values from the window', () => {
          global.Features.getFeatureQueue = () => {
            return {enabled_feature: {enabled: false}};
          };
          Actions.FeatureActions.reinitializeWithUrlParameters(undefined);
          enabledFeature.isFalse();
          disabledFeature.isFalse();
          missingFeature.throwsError();
        });
        it('overwrites window value with url', () => {
          global.Features.getFeatureQueue = () => {
            return {enabled_feature: {enabled: false}, disabled_feature: {enabled: true}};
          };
          Actions.FeatureActions.reinitializeWithUrlParameters({enabled_feature: {enabled: true}});
          enabledFeature.isTrue();
          disabledFeature.isTrue();
          missingFeature.throwsError();
        });
        it('overrides those default values with url parameters', () => {
          Actions.FeatureActions.reinitializeWithUrlParameters({
            enabled_feature: 0,
            disabled_feature: 1
          });
          enabledFeature.isFalse();
          disabledFeature.isTrue();
          missingFeature.throwsError();
        });

        it('ignores extra url parameters', () => {
          Actions.FeatureActions.reinitializeWithUrlParameters({
            enabled_feature: 0,
            extra_param: 1
          });
          enabledFeature.isFalse();
          disabledFeature.isFalse();
          missingFeature.throwsError();
        });
      });

      describe('#reset', () => {
        it('removes all features from the store', () => {
          Actions.FeatureActions.reset();
          enabledFeature.throwsError();
          disabledFeature.throwsError();
          missingFeature.throwsError();
        });
      });

      describe('#enable', () => {
        it('enables a disabled feature', () => {
          Actions.FeatureActions.enable(disabledFeatureName);
          enabledFeature.isTrue();
          disabledFeature.isTrue();
          missingFeature.throwsError();
        });
        it('leaves unchanged an enabled feature', () => {
          Actions.FeatureActions.enable(enabledFeatureName);
          enabledFeature.isTrue();
          disabledFeature.isFalse();
          missingFeature.throwsError();
        });
        it('adds a feature if the feature is missing', () => {
          Actions.FeatureActions.enable(missingFeatureName);
          enabledFeature.isTrue();
          disabledFeature.isFalse();
          missingFeature.isTrue();
        });
      });

      describe('#disable', () => {
        it('disables an enabled feature', () => {
          Actions.FeatureActions.disable(enabledFeatureName);
          enabledFeature.isFalse();
          disabledFeature.isFalse();
          missingFeature.throwsError();
        });
        it('leaves unchanged a disabled feature', () => {
          Actions.FeatureActions.disable(disabledFeatureName);
          enabledFeature.isTrue();
          disabledFeature.isFalse();
          missingFeature.throwsError();
        });
        it('adds a feature if it is missing', () => {
          Actions.FeatureActions.disable(missingFeatureName);
          enabledFeature.isTrue();
          disabledFeature.isFalse();
          missingFeature.isFalse();
        });
      });
    });
  });
});
