var util = require('util'),
    Tab = require('../client/tab').Tab;

var JpyTab = function ()
{
  Tab.call(this);
};

util.inherits(JpyTab, Tab);

JpyTab.prototype.tabName = 'jpy';
JpyTab.prototype.mainMenu = 'fund';

JpyTab.prototype.angular = function(module)
{
  module.controller('JpyCtrl', ['$scope', 'rpId', 'rpAppManager', 'rpTracker',
    '$routeParams', 'rpKeychain', 'rpNetwork', 'rpAPI', '$timeout',
    function ($scope, id, appManager, rpTracker, $routeParams, keychain, network, api, $timeout)
    {
      $scope.toggle_mrcbc_instructions = function() {
        $scope.showMrcbcInstructions = !$scope.showMrcbcInstructions;
      };

      $scope.save_mrcbc_account = function() {
        $scope.mrLoading = true;

        var amount = cbc.Amount.from_human(
            Options.gateway_max_limit + ' ' + 'JPY',
            {reference_date: new Date(+new Date() + 5 * 60000)}
        );

        amount.set_issuer('rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS');

        if (!amount.is_valid()) {
          // Invalid amount. Indicates a bug in one of the validators.
          console.log('Invalid amount');
          return;
        }

        var tx = network.remote.transaction();

        // Add memo to tx
        tx.addMemo('client', 'text/plain', 'rt' + $scope.version);

        // Flags
        tx
            .cbcLineSet(id.account, amount)
            .setFlags('Nocbc')
            .on('proposed', function(res) {
              $scope.$apply(function() {
                setMrEngineStatus(res, false);              
              });
            })
            .on('success', function(res) {
              $scope.$apply(function() {
                setMrEngineStatus(res, true);

                $scope.mrLoading = false;
              });

              api.addTransaction(res.tx_json, {Status: 'success'}, res.tx_json.hash, new Date().toString());
            })
            .on('error', function(res) {
              setMrEngineStatus(res, false);
              console.log('error', res);
              setImmediate(function() {
                $scope.$apply(function() {
                  $scope.mode = 'error';

                  $scope.mrLoading = false;
                });
              });

              api.addTransaction(res.tx_json, {Status: 'error'}, res.tx_json.hash, new Date().toString());
            });

        function setMrEngineStatus(res, accepted) {
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
          if ($scope.tx_result == 'cleared') {
            $scope.mrcbcConnected = true;
            $scope.showMrcbcInstructions = true;

          }
          console.log($scope.tx_result);
        }

        keychain.requestSecret(id.account, id.username, function(err, secret) {
          // XXX Error handling
          if (err) {
            $scope.mrLoading = false;
            console.log(err);
            return;
          }

          $scope.mode = 'granting';

          tx.secret(secret);

          api.getUserAccess().then(function(res) {
            tx.submit();
          }, function(err2) {
            console.log('error', err2);
            setImmediate(function() {
              $scope.$apply(function () {
                $scope.mode = 'error';

                $scope.mrLoading = false;
              });
            });
          });
        });
      };

      $scope.toggle_instructions = function() {
        $scope.showInstructions = !$scope.showInstructions;
      };

      $scope.save_account = function () {

        $scope.loading = true;

        var amount = cbc.Amount.from_human(
            Options.gateway_max_limit + ' ' + 'JPY',
            {reference_date: new Date(+new Date() + 5 * 60000)}
        );

        amount.set_issuer('r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN');

        if (!amount.is_valid()) {
          // Invalid amount. Indicates a bug in one of the validators.
          console.log('Invalid amount');
          return;
        }

        var tx = network.remote.transaction();

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
              $scope.tx_result = "local";
              break;
            case 'tep':
              console.warn('Unhandled engine status encountered!');
          }
          if ($scope.tx_result=="cleared"){
            $scope.jpyConnected = true;
            $scope.showInstructions = true;

          }
          console.log($scope.tx_result);
        }

        keychain.requestSecret(id.account, id.username, function (err, secret) {
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

      $scope.$watch('lines', function () {
        $scope.jpyConnected = Boolean($scope.lines['r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcNJPY']);
        $scope.mrcbcConnected = Boolean($scope.lines['rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiSJPY']);
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

module.exports = JpyTab;
