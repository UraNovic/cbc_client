var util = require('util'),
    webutil = require('../util/web'),
    Tab = require('../client/tab').Tab,
    Amount = cbc.Amount,
    Base = cbc.Base;

var AppsTab = function ()
{
  Tab.call(this);
};

util.inherits(AppsTab, Tab);

AppsTab.prototype.tabName = 'apps';
AppsTab.prototype.mainMenu = 'apps';

AppsTab.prototype.angular = function (module)
{
  module.controller('AppsCtrl', ['$scope', 'rpId', 'rpAppManager',
    function ($scope, id, appManager)
  {


    /**
     * Add an app
     */
    $scope.add = function(){
      $scope.loading = true;

      if ($scope.app && $scope.app.cbcAddress) {
        appManager.getApp($scope.app.cbcAddress, function(err, app){
          if (err) {
            console.log('err',err);
            $scope.error = err.message;
            return;
          }

          $scope.app.name = app.name;
          $scope.userBlob.unshift("/apps", $scope.app);
          $scope.success = true;

          $scope.loading = false;
        });
      }
    };

    /**
     * Remove app
     *
     * @param index
     */
    $scope.remove = function (cbcAddress) {
      // TODO this should also close/remove account, disconnect from an app.

      // Update blob
      $scope.userBlob.filter('/apps', 'cbcAddress', cbcAddress, 'unset', '');
    };
  }]);
};

module.exports = AppsTab;
