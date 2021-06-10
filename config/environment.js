'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'thetaboard-ui',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  //Ember-simple-auth

  ENV['ember-simple-auth'] = {
    routeAfterAuthentication: 'dashboard',
  };

  ENV['ember-simple-auth-token'] = {
    routeAfterAuthentication: 'dashboard',
    refreshAccessTokens: false,
    serverTokenEndpoint: '/auth/login', // Server endpoint to send authenticate request
    // tokenDataPropertyName: 'tokenData', // Key in session to store token data
    tokenPropertyName: 'token', // Key in server response that contains the access token
    refreshLeeway: 300, // refresh 5 minutes (300 seconds) before expiration
    // tokenExpirationInvalidateSession: true, // Enables session invalidation on token expiration
    // serverTokenRefreshEndpoint: '/auth/login', // Server endpoint to send refresh request
    // refreshTokenPropertyName: 'token', // Key in server response that contains the refresh token
    // tokenExpireName: 'exp', // Field containing token expiration
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
