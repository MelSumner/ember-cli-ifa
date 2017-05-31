/* global window, __assetMapPlaceholder__ */
import RSVP from 'rsvp';
import $ from 'jquery';
import AssetMap from '../services/asset-map';

export function initialize(app) {
  let config;

  if (app.__container__.factoryFor) {
    config = app.__container__.factoryFor('config:environment').class;
  } else {
    config = app.__container__.lookupFactory('config:environment');
  }

  let assetMapFile = window && window.__assetMapPlaceholder__;

  if (!assetMapFile) {
    app.register('service:asset-map', AssetMap);
    return;
  }

  if (config.ifa.inline) {
    AssetMap.reopen({
      map: assetMapFile.assets,
      prepend: assetMapFile.prepend,
      enabled: true
    });
    app.register('service:asset-map', AssetMap);
  } else {
    app.deferReadiness();

    const promise = new RSVP.Promise((resolve, reject) => {
      $.getJSON(assetMapFile, resolve).fail(reject);
    });

    promise.then((map = {}) => {
      AssetMap.reopen({
        map: map.assets,
        prepend: map.prepend,
        enabled: true
      });
    }).then(() => {
      app.register('service:asset-map', AssetMap);
      app.advanceReadiness();
    });
  }
}

export default {
  name: 'asset-map',
  initialize
};
