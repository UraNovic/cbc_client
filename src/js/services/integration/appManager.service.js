/**
 * APP MANAGER
 *
 * The app manager service is used to communicate with the cbc apps
 * and connect them to the client.
 */

var module = angular.module('appManager', ['domainalias','integrationProfileManager']);

module.service('rpAppManager', ['$rootScope', '$http', 'rpDomainAlias', 'rpcbcTxt', 'rpProfileManager',
  function($scope, $http, aliasService, txt, profileManager)
{
  var log = function(){
    var mainArguments = Array.prototype.slice.call(arguments);
    mainArguments[0] = '%c ' + mainArguments[0] + ' ';
    mainArguments.splice(1, 0, 'background: green; color: white');
    console.log.apply(console,mainArguments);
  };

  /**
   * Load all apps
   */
  var init = function () {
    $scope.$watch('userBlob.data.apps', function(apps){
      if (apps && apps.length) {
        apps.forEach(function(appInBlob){
          loadApp(appInBlob.cbcAddress, function(err, app){
            $scope.apps[appInBlob.cbcAddress] = app;
          });
        });
      }
    });
  };

  // Loaded apps
  $scope.apps = {};

  /**
   * App object
   *
   * @param manifest
   * @constructor
   */
  var App = function(manifest){
    this.name = manifest.name;
    this.description = manifest.description;
    this.image = manifest.imageUrl;
    this.cbcAddress = manifest.cbcAddress;
    this.profiles = [];

    var self = this;

    _.each(manifest.profiles, function(profile,key){
      self.profiles[key] = profileManager.getProfile(profile);
    });
  };

  App.prototype.findProfile = function (type) {
    return _.findWhere(this.profiles, {type:type});
  };

  App.prototype.getInboundBridge = function (currency) {
    var found;

    this.profiles.forEach(function(profile,key){
      if ('inboundBridge' === profile.type) {
        profile.currencies.forEach(function(c){
          if (currency.toUpperCase() === c.currency) {
            found = profile;
          }
        });
      }
    });

    return found;
  };

  var getApp = function(cbcAddress,callback) {
    $scope.$watch('apps', function(apps){
      if (app = apps[cbcAddress]) {
        callback(null, app);
      }
    }, true);
  };

  var getAllApps = function(callback) {
    $scope.$watch('apps', function(apps){
      if (!$.isEmptyObject(apps)) callback(apps);
    }, true);
  };

  /**
   * Save app to userBlob
   *
   * @param app
   */
  var save = function(app) {
    var watcher = $scope.$watch('userBlob', function(userBlob){
      if (userBlob.data.created && !_.findWhere($scope.userBlob.data.apps, {cbcAddress:app.cbcAddress})) {
        $scope.userBlob.unshift("/apps", {
          name: app.name,
          cbcAddress: app.cbcAddress
        });

        watcher();
      }
    });
  };

  /**
   * Initializes cbc App.
   *
   * @param cbcAddress
   * @param callback
   */
  var loadApp = function(cbcAddress, callback){
    var domain, manifest;

    // Get Domain
    log('appManager:','Looking up',cbcAddress);

    var alias = aliasService.getAliasForAddress(cbcAddress);
    alias.then(
      // Fulfilled
      function (domain) {
        log('appManager:','The domain for',cbcAddress,'is',domain);
        log('appManager:','Looking up ',domain,'for cbc.txt');

        // Get cbc.txt
        var txtPromise = txt.get(domain);
        txtPromise.then(
          // Fulfilled
          function(cbctxt){
            log('appManager:','Got cbc.txt',cbctxt);

            if (cbctxt.manifest_url) {
              log('appManager:','Looking up manifest',cbctxt.manifest_url);

              $http({url: cbctxt.manifest_url, method: 'get'})
                .success(function(data, status, headers, config) {
                  manifest = jQuery.extend(true, {}, data);

                  log('appManager:','Got the manifest for',manifest.name,manifest);

                  if (!validateManifest(manifest)) {
                    log('appManager:','Manifest is invalid.');
                    return;
                  }

                  // Create the App object.
                  $scope.apps[cbcAddress] = new App(manifest);

                  callback(null, $scope.apps[cbcAddress]);
                })
                .error(function(data, status, headers, config) {
                  log('appManager:','Can\'t get the manifest');
                });
            }
          },

          // Rejected
          function(reason) {
            callback(reason);
          }
        );
      },

      // Rejected
      function(reason) {
        callback(reason);
      }
    );
  };

  /**
   * Function to validate manifest file
   *
   * @param m manifest json
   * @returns {boolean}
   */
  var validateManifest = function(m) {
    // TODO more validation
    if (!m.name || !m.cbcAddress || !m.profiles) {
      return;
    }

    // cbc address is wrong
    if (!cbc.UInt160.from_json(m.cbcAddress).is_valid()) return;

    return true;
  };

  return {
    getApp: getApp,
    getAllApps: getAllApps,
    loadApp: loadApp,
    init: init,
    save: save
  };
}]);
