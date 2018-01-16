/**
 * NETWORK
 *
 * The network service is used to communicate with the cbc network.
 *
 * It encapsulates a cbc.Remote instance.
 */

(function () {
'use strict';

angular
  .module('network', [])
  .factory('rpNetwork', rpNetwork);

rpNetwork.$inject = ['$rootScope', '$timeout'];

function rpNetwork($scope, $timeout) {
  /**
   * Manage network state.
   *
   * This class is intended to manage the connection status to the
   * cbc network.
   *
   * Note that code in other places *is allowed* to call the cbc
   * library directly. This is not to be intended to be an abstraction
   * layer on top of an abstraction layer.
   */
  var Network = function ()
  {
    this.remote = new cbc.Remote(Options.server, true);
    this.remote.on('connected', this.handleConnect.bind(this));
    this.remote.on('disconnected', this.handleDisconnect.bind(this));

    // Set network max transaction fee from Options, or default to 12 drops of cbc
    this.remote.max_fee = Options.max_tx_network_fee || 12;

    this.connected = false;
    this.disconnectTimeout = null;
  };

  Network.prototype.init = function ()
  {
    this.remote.connect();
  };

  /**
   * Setup listeners for identity state.
   *
   * This function causes the network object to start listening to
   * changes in the identity state and automatically subscribe to
   * accounts accordingly.
   */
  Network.prototype.listenId = function (id)
  {
    var self = this;
  };

  Network.prototype.handleConnect = function (e)
  {
    var self = this;
    var dispatchConnectEvent = true;

    if (this.disconnectTimeout) {
      // must not happen, but in case...
      $timeout.cancel(this.disconnectTimeout);
      this.disconnectTimeout = null;
      dispatchConnectEvent = false;
    }

    $scope.$apply(function () {
      self.connected = true;
      if (dispatchConnectEvent) {
        $scope.connected = true;
        $scope.$broadcast('$netConnected');
      }
    });
  };

  Network.prototype.handleDisconnect = function (e)
  {
    var self = this;
    $scope.$apply(function () {
      self.connected = false;
    });
    if (this.disconnectTimeout) {
      // must not happen, but in case...
      $timeout.cancel(this.disconnectTimeout);
    }
    this.disconnectTimeout = $timeout(this.handleDisconnectReal.bind(this), 2000);
  };

  Network.prototype.handleDisconnectReal = function(e) {
    this.disconnectTimeout = null;
    $scope.$apply(function () {
      $scope.connected = false;
      $scope.$broadcast('$netDisconnected');
    });
  }

  return new Network();
}

})();
