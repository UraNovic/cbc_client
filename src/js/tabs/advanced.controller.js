var util = require('util'),
    webutil = require('../util/web'),
    Tab = require('../client/tab').Tab,
    settings = require('../util/settings'),
    Currency = cbc.Currency;

var AdvancedTab = function ()
{
  Tab.call(this);
};

util.inherits(AdvancedTab, Tab);

AdvancedTab.prototype.tabName = 'advanced';
AdvancedTab.prototype.mainMenu = 'advanced';

AdvancedTab.prototype.angular = function(module)
{
  module.controller('AdvancedCtrl', ['$scope', 'rpId', 'rpKeychain', 'rpNetwork',
                                    function ($scope, id, keychain, network)
  {
    // cbc currency object.
    // {name: 'cbc - cbcs', order: 146, value: 'cbc'}
    var cbcCurrency = Currency.from_json('cbc');

    $scope.cbc = {
      name: cbcCurrency.to_human({full_name:$scope.currencies_all_keyed.cbc.name}),
      code: cbcCurrency.get_iso(),
      currency: cbcCurrency
    };

    $scope.options = Options;
    $scope.optionsBackup = $.extend(true, {}, Options);
    $scope.editConfirmation = {
      send: false,
      exchange: false,
      trade: false
    };
    $scope.edit = {
      blobvault: false,
      maxNetworkFee: false,
      historyApi: false,
      sendMax: false,
      exchangeMax: false
    };

    function readSettings() {
      $scope.passwordProtection = !settings.getSetting($scope.userBlob, 'persistUnlock', false);
      $scope.sendMaxDeviation = settings.getSetting($scope.userBlob, 'sendMaxDeviation', 0.1);
      $scope.exchangeMaxDeviation = settings.getSetting($scope.userBlob, 'exchangeMaxDeviation', 0.1);
    }

    if (settings.blobIsValid($scope.userBlob)) {
      readSettings();
    } else {
      var removeListener = $scope.$on('$blobUpdate', function() {
        if (!settings.blobIsValid($scope.userBlob)) return;
        readSettings();
        removeListener();
      });
    }

    $scope.max_tx_network_fee_human = cbc.Amount.from_json($scope.options.max_tx_network_fee).to_human();

    $scope.confirmationChanged = {
      send: false,
      exchange: false,
      trade: false
    };

    // Initialize the notification object
    $scope.success = {};

    $scope.save = function(type) {
      switch (type) {
        case 'sendMax':
          $scope.userBlob.set('/clients/cbctradecom/sendMaxDeviation', $scope.sendMaxDeviation);
        case 'exchangeMax':
          $scope.userBlob.set('/clients/cbctradecom/exchangeMaxDeviation', $scope.exchangeMaxDeviation);
        case 'maxNetworkFee':
          $scope.options.max_tx_network_fee = cbc.Amount.from_human($scope.max_tx_network_fee_human).to_json();
          $scope.userBlob.set('/clients/cbctradecom/maxNetworkFee', $scope.options.max_tx_network_fee);
          // This has to be updated manually because the network object is not
          // recreated unless we do location.reload()
          network.remote.max_fee = $scope.options.max_tx_network_fee;
          break;
        case 'historyApi':
          $scope.userBlob.set('/clients/cbctradecom/historyApi', $scope.options.historyApi.replace(/[\/]*$/, ''));
          break;
        default:
          // Save in local storage
          if (!store.disabled) {
            store.set('cbc_settings', JSON.stringify($scope.options));
          }
      }

      $scope.edit[type] = false;

      if (type === 'blobvault') {
        location.reload();
      }

      // Notify the user
      $scope.success[type] = true;
    };

    $scope.saveConfirmation = function(transactionType) {
      // ignore it if we are not going to change anything
      if (!$scope.confirmationChanged[transactionType]) {
        $scope.editConfirmation[transactionType] = false;
        return;
      }
      $scope.confirmationChanged[transactionType] = false;

      $scope.userBlob.set('/clients/cbctradecom/confirmation', $scope.options.confirmation);

      $scope.editConfirmation[transactionType] = false;
      // Notify the user
      $scope.success.saveConfirmation[transactionType] = true;
    };

    $scope.deleteUrl = function(type) {
      if (type === 'blobvault') {
        $scope.options.blobvault = '';
      }
      // Save in local storage
      if (!store.disabled) {
        store.set('cbc_settings', JSON.stringify($scope.options));
      }
    };

    $scope.cancelEdit = function(type) {
      $scope.edit[type] = false;
      if (type === 'maxNetworkFee') {
        $scope.options.max_tx_network_fee = $scope.optionsBackup.max_tx_network_fee;
        $scope.max_tx_network_fee_human = cbc.Amount.from_json($scope.options.max_tx_network_fee).to_human();
      } if (type === 'sendMax') {
        $scope.sendMaxDeviation = settings.getSetting($scope.userBlob, 'sendMaxDeviation', 0.1);
      } if (type === 'exchangeMax') {
        $scope.exchangeMaxDeviation = settings.getSetting($scope.userBlob, 'exchangeMaxDeviation', 0.1);
      } else {
        $scope.options[type] = $scope.optionsBackup[type];
      }
    };

    $scope.cancelEditConfirmation = function(transactionType) {
      $scope.editConfirmation[transactionType] = false;
      $scope.options.confirmation[transactionType] = $scope.optionsBackup.confirmation[transactionType];
    };

    $scope.$on('$blobUpdate', function() {
      $scope.passwordProtection = !settings.getSetting($scope.userBlob, 'persistUnlock', false);

      // we assume that some fields in Options are updated in rpId service $blobUpdate handler
      $scope.optionsBackup = $.extend(true, {}, Options);

      // still assuming that fields in Options have been updated in rpId service $blobUpdate handler
      $scope.max_tx_network_fee_human = cbc.Amount.from_json($scope.options.max_tx_network_fee).to_human();
    });

    // Add a new server
    $scope.addServer = function() {
      // Create a new server line
      if (!$scope.options.server.servers.isEmptyServer)
        $scope.options.server.servers.push({isEmptyServer: true, secure: true});

      // Set editing to true
      $scope.editing = true;

      // Notify the user on save later
      $scope.success.addServer = true;
    };
  }]);

  module.controller('ServerRowCtrl', ['$scope',
    function ($scope) {
      $scope.editing = $scope.server.isEmptyServer;

      // Delete the server
      $scope.remove = function () {
        $scope.options.server.servers.splice($scope.index, 1);

        $scope.persist();

        // Notify the user
        $scope.success.removeServer = true;
      };

      $scope.hasRemove = function () {
        return !$scope.server.isEmptyServer && $scope.options.server.servers.length !== 1;
      };

      $scope.cancel = function () {
        if ($scope.server.isEmptyServer) {
          $scope.remove();
          return;
        }

        $scope.editing = false;
        $scope.server = $.extend({}, $scope.optionsBackup.server.servers[$scope.index]);
      };

      $scope.noCancel = function () {
        return $scope.server.isEmptyServer && $scope.options.server.servers.length === 1;
      };

      $scope.save = function () {
        $scope.server.isEmptyServer = false;
        $scope.editing = false;

        // Determine port if empty
        if (!$scope.server.port) {
          $scope.server.port = $scope.server.secure ? '443' : '80'
        }

        $scope.persist(function() {
          // Reload
          // A force reload is necessary here because we have to re-initialize
          // the network object with the new server list.
          location.reload();
        });

        // Notify the user
        $scope.success.saveServer = true;
      };

      $scope.persist = function(cb) {
        // Save in local storage
        if (!store.disabled) {
          store.set('cbc_settings', JSON.stringify($scope.options));
        }
        var servers = settings.getClearServers($scope.options.server.servers);
        $scope.userBlob.set('/clients/cbctradecom/server/servers', servers, cb);
      }
    }
  ]);
};

module.exports = AdvancedTab;
