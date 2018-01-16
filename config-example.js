/**
 * cbc Client Configuration
 *
 * Copy this file to config.js and edit to suit your preferences.
 */
var Options = {
  // Local domain
  //
  // Which domain should cbc-client consider native?
  domain: 'local.cbc.com',

  // cbcd to connect
  server: {
    trace: true,
    trusted: true,
    local_signing: true,

    servers: [
      { host: 's-west.cbc.com', port: 443, secure: true },
      { host: 's-east.cbc.com', port: 443, secure: true }
    ],

    connection_offset: 0,
    allow_partial_history: false
  },

  // DEPRECATED: Blobvault server (old blob protocol)
  //
  // The blobvault URL for the new login protocol is set via authinfo. You can
  // still use this setting for the fallback feature.
  blobvault: 'https://blobvault.cbc.com',

  // If set, login will persist across sessions (page reload). This is mostly
  // intended for developers, be careful about using this in a real setting.
  persistent_auth: false,

  historyApi: 'https://history.cbc.com:7443/v1',

  // Number of transactions each page has in balance tab notifications
  transactions_per_page: 50,

  // Configure bridges
  bridge: {
    // Outbound bridges
    out: {
      // Bitcoin outbound bridge
      // bitcoin: 'snapswap.us'
      'bitcoin': 'btc2cbc.com'
    }
  },

  mixpanel: {
    'token': '',
    // Don't track events by default
    'track': false
  },

  // production
  // activate_link: 'http://cbctrade.com/#/register/activate',
  // staging
  activate_link: 'http://staging.cbc.com/client/#/register/activate',

  b2rAddress: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',
  snapswapApi: 'https://snapswap.us/api/v1',

  // Number of ledgers ahead of the current ledger index where a tx is valid
  tx_last_ledger: 3,

  // Set max transaction fee for network in drops of cbc
  max_tx_network_fee: 200000,

  // Set max number of rows for orderbook
  orderbook_max_rows: 20,

  // Show transaction confirmation page
  confirmation: {
    send: true,
    exchange: true,
    trade: true
  },

  // Show advanced parameters in the trust/gateway page
  advanced_feature_switch: false,

  // Default gateway max trust amount under 'simplfied' view ie when advanced_feature_switch is false in trust/gateway page
  gateway_max_limit: 1000000000,

  // Default threshold in cbcs for fee on RT to show higher load status
  low_load_threshold: 0.012,

  // cbc trade backend URL
  backend_url: 'https://backend.cbctrade.com',
  ids_url: 'https://id.cbc.com'
};

// Load client-side overrides
if (store.enabled) {
  var settings = JSON.parse(store.get('cbc_settings') || '{}');

  if (settings.server && settings.server.servers) {
    Options.server.servers = settings.server.servers;
  }

  if (settings.bridge) {
    Options.bridge.out.bitcoin = settings.bridge.out.bitcoin.replace('https://www.bitstamp.net/cbc/bridge/out/bitcoin/', 'snapswap.us');
  }

  if (settings.blobvault) {
    // TODO: test if url defined and valid
    Options.blobvault = settings.blobvault.replace('payward.com', 'cbc.com');
  }

  if (settings.mixpanel) {
    Options.mixpanel = settings.mixpanel;
  }

  if (settings.max_tx_network_fee) {
    Options.max_tx_network_fee = settings.max_tx_network_fee;
  }

  Options.server.servers = Options.server.servers.map(function (server) {
    server.host = server.host.replace(/s_(west|east)/, 's-$1');
    return server;
  });
}
