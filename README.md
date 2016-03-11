### HFA Flux-Features

This module supports defining feature switches that can then be set from Optimizely, from the url or programmatically.
Feature switches should be defined in a configuration file registered with the store via the register action.  This
file must contain a map of feature names to fields.  The fields must contain an 'enabled' field, but may contain any
number of other fields (all of which will be ignored).  This is useful for attributing ownership, recording the
association with an Optimizely test or documenting dates when the feature is to be active.  Remember: it is
important to clean up features as soon as possible!  Every Feature Is Code Debt.
An example configuration file: 
```sh
{
  first_feature: {
    enabled: true
  },
  second_feature: {
    enabled: false
  }
}
```
You must register the store with the reactor. Initializing the FeatureStore will look something like this: 
```sh
import {store as featureStore, makeActions} from '@hfa/flux-features/modules/features';
...
reactor.registerStores({featureStore});
...
const FeatureActions = makeActions(reactor);
FeatureActions.register(featureConfiguration, urlParameters);
```

In order to access a feature and determine if it is enabled, you must create a feature-specific Getter.  For example:
```sh
import {makeGetters} from '@hfa/flux-features/lib/modules/features'
...
const testFeatureEnabled = makeGetters('test_feature');
...
if (reactor.evaluate(testFeatureEnabled)) {
  // Feature-dependent code here
  ...
}
```
It is only possible to check features that exist in the feature store.

To set a feature programmatically, there are feature actions to enable or disable a feature.  Integration with
 Optimizely, on the other hand, relies on methods we put on the window object.  To enable Optimizely integration, before
 the Optimizely script is included in your project template include the flux-feature inline script.  This should look
 similar to this:

 ```sh
 {% inline_script 'node_modules/@hfa/flux-features/lib/inline.js' %}
 ```

Now in your Optimizely test, you can call window.Features.enable('feature_name') or
window.Features.disable('feature_name'), respectively. If you want the feature to affect initial set up, you should
surround the call with Optimizely comments telling it to execute immediately instead of on DOM ready:
```sh
 /* _optimizely_evaluate=force */
 window.Features.enable('feature_name');
 /* _optimizely_evaluate=safe */
```

(See https://help.optimizely.com/hc/en-us/articles/200040185-Force-variation-code-or-Experiment-JavaScript-to-execute-immediately-when-Optimizely-loads
for the technical details.)

If you are enabling a feature later in the flow or any time after load, all feature checks must be in code that gets
re-rendered.

#### Integration with Server-Side Rendering
To allow the feature store to serve when rendering server-side, there is an action reinitializeWithUrlParameters.  No feature-dependent code should live in
initialization.  On the client, it will use the window.Features store and the parameters you pass in in reinitializeWithUrlParameters to set up the store
with the appropriate values, and then NuclearJS will correctly re-render anything that relies on the updated features.

##### Development

#### Install
```sh
git clone git@github.com:codewithher/flux-feature.git
npm i -g gulp
npm i
```

#### Building the library
```sh
gulp build
```

#### Running Unit Tests
```sh
gulp test
```

