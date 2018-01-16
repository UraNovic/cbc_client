/**
 * History profile
 *
 * This is the "History" profile implementation
 */

var module = angular.module('integrationHistory', []);

module.service('rpHistoryProfile', ['$rootScope', 'rpNetwork', '$http',
  function($scope, $network, $http)
{
  this.historyProfile = function(manifest) {
    return {
      type: manifest.type,
      version: manifest.version,

      getTransactions: function(cbcAddress, callback) {
        $http({
          url: manifest.urls.transactions,
          method: 'GET',
          params: {
            cbcAddress: cbcAddress
          }
        })
        .success(function(response){
          if (response.status === 'error') {
            callback({
              message: response.message
            });

            return;
          }

          callback(null, response.history);
        })
        .error(function(data,status){
          callback({
            message: 'Unable to fetch the history.'
          });
        });
      }
    };
  };

  this.fromManifest = function (manifest) {
    return new this.historyProfile(manifest);
  };
}]);
