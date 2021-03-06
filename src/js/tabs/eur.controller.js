var util = require('util'),
    Tab = require('../client/tab').Tab;

var EurTab = function ()
{
  Tab.call(this);
};

util.inherits(EurTab, Tab);

EurTab.prototype.tabName = 'eur';
EurTab.prototype.mainMenu = 'fund';

EurTab.prototype.angular = function(module) {
 
  module.controller('EurCtrl', ['$scope', 'rpId', 'rpAppManager', 'rpTracker', '$routeParams',
    'rpKeychain', 'rpNetwork', 'rpAPI', '$timeout',
    function ($scope, id, appManager, rpTracker, $routeParams, keychain, $network, api, $timeout)
    {
      $scope.toggle_instructions = function () {
        $scope.showInstructions = !$scope.showInstructions;
      };

      $scope.toggle_gatehub_instructions = function() {
        $scope.show3Instructions = !$scope.show3Instructions;
      };

      $scope.save_account = function() {
        $scope.loading = true;

        var amount = cbc.Amount.from_human(
            Options.gateway_max_limit + ' ' + 'EUR',
            {reference_date: new Date(+new Date() + 5*60000)}
            );

        amount.set_issuer('rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q');

        if (!amount.is_valid()) {
          // Invalid amount. Indicates a bug in one of the validators.
          console.log('Invalid amount');
          return;
        }

        var tx = $network.remote.transaction();

        // Add memo to tx
        tx.addMemo('client', 'text/plain', 'rt' + $scope.version);

        // Flags
        tx
          .cbcLineSet(id.account, amount)
          .setFlags('Nocbc')
          .on('proposed', function(res){
            $scope.$apply(function () {
              setEngineStatus(res, false);
            });
          })
          .on('success', function (res) {
            $scope.$apply(function () {
              setEngineStatus(res, true);

              $scope.loading = false;
              $scope.editing = false;
            });

            api.addTransaction(res.tx_json, {Status: 'success'}, res.tx_json.hash, new Date().toString());
          })
          .on('error', function (res) {
            setEngineStatus(res, false);
            console.log('error', res);
            setImmediate(function () {
              $scope.$apply(function () {
                $scope.mode = 'error';

                $scope.loading = false;
                $scope.editing = false;
              });
            });

            api.addTransaction(res.tx_json, {Status: 'error'}, res.tx_json.hash, new Date().toString());
          });

        function setEngineStatus(res, accepted) {
          $scope.engine_result = res.engine_result;
          $scope.engine_result_message = res.engine_result_message;
          $scope.engine_status_accepted = accepted;

          switch (res.engine_result.slice(0, 3)) {
            case 'tes':
              $scope.tx_result = accepted ? 'cleared' : 'pending';
              break;
            case 'tem':
              $scope.tx_result = 'malformed';
              break;
            case 'ter':
              $scope.tx_result = 'failed';
              break;
            case 'tec':
              $scope.tx_result = 'failed';
              break;
            case 'tel':
              $scope.tx_result = 'local';
              break;
            case 'tep':
              console.warn('Unhandled engine status encountered!');
          }
          if ($scope.tx_result === 'cleared') {
            $scope.eurConnected = true;
            $scope.showInstructions = true;
          }
          console.log($scope.tx_result);
        }

        keychain.requestSecret(id.account, id.username, function(err, secret) {
          // XXX Error handling
          if (err) {
            $scope.loading = false;
            console.log(err);
            return;
          }

          $scope.mode = 'granting';

          tx.secret(secret);

          api.getUserAccess().then(function(res) {
            tx.submit();
          }, function(err2) {
            console.log('error', err2);
            setImmediate(function () {
              $scope.$apply(function () {
                $scope.mode = 'error';

                $scope.loading = false;
                $scope.editing = false;
              });
            });
          });

        });
      };

      $scope.save_gatehub_account = function() {
        $scope.eur3loading = true;

        var amount = cbc.Amount.from_human(
            Options.gateway_max_limit + ' ' + 'EUR',
            {reference_date: new Date(+new Date() + 5*60000)}
            );

        amount.set_issuer('rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq');

        if (!amount.is_valid()) {
          // Invalid amount. Indicates a bug in one of the validators.
          console.log('Invalid amount');
          return;
        }

        var tx = $network.remote.transaction();

        // Add memo to tx
        tx.addMemo('client', 'text/plain', 'rt' + $scope.version);

        // Flags
        tx
          .cbcLineSet(id.account, amount)
          .setFlags('Nocbc')
          .on('proposed', function(res) {
            $scope.$apply(function() {
              setEngineStatus(res, false);
            });
          })
          .on('success', function(res) {
            $scope.$apply(function() {
              setEngineStatus(res, true);

              $scope.eur3loading = false;
            });

            api.addTransaction(res.tx_json, {Status: 'success'}, res.tx_json.hash, new Date().toString());
          })
          .on('error', function(res) {
            setEngineStatus(res, false);
            console.log('error', res);
            setImmediate(function() {
              $scope.$apply(function () {
                $scope.eur3loading = false;
              });
            });

            api.addTransaction(res.tx_json, {Status: 'error'}, res.tx_json.hash, new Date().toString());
          });

        function setEngineStatus(res, accepted) {
          $scope.engine3_result = res.engine_result;
          $scope.engine3_result_message = res.engine_result_message;
          $scope.engine3_status_accepted = accepted;

          switch (res.engine_result.slice(0, 3)) {
            case 'tes':
              $scope.tx3_result = accepted ? 'cleared' : 'pending';
              break;
            case 'tem':
              $scope.tx3_result = 'malformed';
              break;
            case 'ter':
              $scope.tx3_result = 'failed';
              break;
            case 'tec':
              $scope.tx3_result = 'failed';
              break;
            case 'tel':
              $scope.tx3_result = 'local';
              break;
            case 'tep':
              console.warn('Unhandled engine status encountered!');
          }
          if ($scope.tx3_result === 'cleared') {
            $scope.eur3Connected = true;
            $scope.show3Instructions = true;
          }
          console.log($scope.tx_result);
        }

        keychain.requestSecret(id.account, id.username, function(err, secret) {
          // XXX Error handling
          if (err) {
            $scope.eur3loading = false;
            console.log(err);
            return;
          }

          tx.secret(secret);

          api.getUserAccess().then(function (res) {
            tx.submit();
          }, function (err2) {
            console.log('error', err2);
            setImmediate(function () {
              $scope.$apply(function () {
                $scope.eur3loading = false;
              });
            });
          });
        });
      };

      $scope.$watch('lines', function() {
        $scope.eurConnected = !!$scope.lines.rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2qEUR;
        $scope.eur3Connected = !!$scope.lines.rhub8VRN55s94qWKDv6jmDy1pUykJzF3wqEUR;
      }, true);

      // User should be notified if the reserve is insufficient to add a gateway
      $scope.$watch('account', function() {
        $scope.can_add_trust = false;
        if ($scope.account.Balance && $scope.account.reserve_to_add_trust) {
          if (!$scope.account.reserve_to_add_trust.subtract($scope.account.Balance).is_positive()
            || $.isEmptyObject($scope.lines))
          {
            $scope.can_add_trust = true;
          }
        }
      }, true);

    }]);
};

module.exports = EurTab;
