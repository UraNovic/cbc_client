var util      = require('util');
var webutil   = require('../util/web');
var Tab       = require('../client/tab').Tab;

var ContactsTab = function ()
{
  Tab.call(this);
};

util.inherits(ContactsTab, Tab);

ContactsTab.prototype.tabName = 'contacts';
ContactsTab.prototype.mainMenu = 'wallet';

// /contact is the way it appears in cbc URIs
ContactsTab.prototype.aliases = ['contact'];

ContactsTab.prototype.angular = function (module) {
  module.controller('ContactsCtrl', ['$scope', 'rpId', 'rpTracker',
    function ($scope, id, rpTracker)
  {

    $scope.sort_options = {
      sort_field: 'contact',
      reverse: false
    };


    $scope.reset_form = function ()
    {
      $scope.contact = {
        name: '',
        view: '',
        address: '',
        federation: null
      };
      if ($scope.addForm) $scope.addForm.$setPristine();
    };

    $scope.reset_form();

    /**
     * Toggle "add contact" form
     */
    $scope.toggle_form = function ()
    {
      $scope.addform_visible = !$scope.addform_visible;
      $scope.reset_form();
    };

    /**
     * Create contact
     */
    $scope.create = function ()
    {
      var contact = {
        name: $scope.contact.name,
        view: $scope.contact.view,
        address: $scope.contact.address
      };

      if ($scope.contact.dt && !$scope.contact.federation) {
        contact.dt = $scope.contact.dt;
      }

      // Enable the animation
      $scope.enable_highlight = true;

      // Add an element
      $scope.userBlob.unshift("/contacts", contact);

      // Hide the form
      $scope.toggle_form();

      // Clear form
      $scope.reset_form();

      // Notify the user
      $scope.load_notification('createContactSuccess');
    };
  }]);

  module.controller('ContactRowCtrl', ['$scope', '$location',
    function ($scope, $location) {
      $scope.editing = false;

      /**
       * Switch to edit mode
       *
       * @param index
       */
      $scope.edit = function (index)
      {
        $scope.editing = true;
        $scope.editname = $scope.entry.name;
        $scope.editaddress = $scope.entry.address;
        $scope.editview = $scope.entry.view || $scope.entry.address;
        $scope.editdt = $scope.entry.dt;
      };

      /**
       * Update contact
       *
       * @param index
       */
      $scope.update = function (index)
      {
        if (!$scope.inlineAddress.editaddress.$error.rpUnique
            && !$scope.inlineAddress.editaddress.$error.rpDest
            && !$scope.inlineName.editname.$error.rpUnique) {

          var entry = {
            name: $scope.editname,
            view: $scope.editview,
            address: $scope.editaddress
          };

          if ($scope.editdt  && !$scope.contact.federation) {
            entry.dt = $scope.editdt;
          }

          // Update blob
          $scope.userBlob.filter('/contacts', 'name', $scope.entry.name,
                                 'extend', '', entry);
          // delete destination tag
          if (!$scope.editdt && $scope.entry.dt) {
            $scope.userBlob.filter('/contacts', 'name', $scope.entry.name,
                                   'unset', '/dt');
          }

          $scope.editing = false;

          // Notify the user
          $scope.load_notification('updateContactSuccess');
        }
      };

      /**
       * Remove contact
       *
       * @param index
       */
      $scope.remove = function (index) {
        // Update blob
        if (!$scope.entry.name) {
          // there was bug that allowed to create contact without name
          $scope.userBlob.unset('/contacts/' + index);
        } else {
          $scope.userBlob.filter('/contacts', 'name', $scope.entry.name,
                                 'unset', '');

          // Notify the user
          $scope.load_notification('removeContactSuccess');
        }
      };

      /**
       * Cancel contact edit
       *
       * @param index
       */
      $scope.cancel = function (index)
      {
        $scope.editing = false;
      };

      $scope.send = function (index)
      {
        var search = {to: $scope.entry.name};

        $location.path('/send');
        $location.search(search);
      };
    }]);
};

module.exports = ContactsTab;
