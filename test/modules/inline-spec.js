import {expect} from 'chai';
import '../../lib/inline.js';


describe('inline functions', () => {
  let oldWindowFeatureActions;
  before(() => {
    oldWindowFeatureActions = window.FeatureActions;
    window.FeatureActions = undefined;
  });
  after(() => {
    window.FeatureActions = oldWindowFeatureActions;
  });
  it('sets properties on window', () => {
    expect(window.Features).to.exist;
    expect(window.Features.enable).to.exist;
    expect(window.Features.disable).to.exist;
    expect(window.Features.getFeatureQueue).to.exist;
  });
  describe('initial behavior', () => {
    it('can enable and disable features', () => {
      window.Features.enable('feature');
      window.Features.disable('feature2');
      expect(window.Features.getFeatureQueue()).to.deep.equal({
        feature: {enabled: true},
        feature2: {enabled: false}
      });
    });
  });
  describe('behavior after initialization', () => {
    it('can enable and disable features', () => {
      // Leftover features from previous test, where FeatureActions was undefined
      expect(window.Features.getFeatureQueue()).to.deep.equal({
        feature: {enabled: true},
        feature2: {enabled: false}
      });
      window.FeatureActions = {
        enableCalled: false,
        disableCalled: false,
        enable: function() {
          this.enableCalled = true;
        },
        disable: function() {
          this.disableCalled = true;
        }
      };
      window.Features.enable('feature3');
      window.Features.disable('feature4');
      expect(window.Features.getFeatureQueue()).to.deep.equal({
        feature: {enabled: true},
        feature2: {enabled: false}
      });
      expect(window.FeatureActions.enableCalled).to.be.true;
      expect(window.FeatureActions.disableCalled).to.be.true;
    });
  });
});
