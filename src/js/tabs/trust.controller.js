'use strict';

var util = require('util');
var webutil = require('../util/web');
var Tab = require('../client/tab').Tab;
var Amount = cbc.Amount;
var Currency = cbc.Currency;

var TrustTab = function ()
{
  Tab.call(this);

};

util.inherits(TrustTab, Tab);

TrustTab.prototype.tabName = 'trust';
TrustTab.prototype.mainMenu = 'fund';

TrustTab.prototype.angular = function (module)
{
  module.controller('TrustCtrl', [
    '$scope', 'rpBooks', '$timeout', '$routeParams', 'rpId',
    '$filter', 'rpNetwork', 'rpTracker', 'rpKeychain', 'rpAPI',
    function($scope, books, $timeout, $routeParams, id,
             $filter, network, rpTracker, keychain, api) {

      // Get all currencies from currencies.js, parse through to display only those with display: true
      var displayCurrenciesOnly = [];

      $scope.trust = {};

      // Trust line sorting
      $scope.sorting = {
        predicate: 'balance',
        reverse: true,
        sort: function(line) {
          return $scope.sorting.predicate === 'currency' ? line.currency : line.balance.to_number();
        }
      };

      //Don't allow zero for new trust lines.
      $scope.validation_pattern = /^0*(([1-9][0-9]*.?[0-9]*)|(.0*[1-9][0-9]*))$/;

      $scope.reset = function () {
        $scope.mode = 'main';
        var usdCurrency = Currency.from_human('USD');
        $scope.currency = usdCurrency.to_human({full_name: $scope.currencies_all_keyed[usdCurrency.get_iso()].name});
        $scope.addform_visible = false;
        $scope.edituser = '';
        $scope.amount = Options.gateway_max_limit;
        $scope.allowrippling = false;
        $scope.counterparty = '';
        $scope.counterparty_view = '';
        $scope.counterparty_address = '';
        $scope.saveAddressName = '';
        $scope.error_account_reserve = false;
      };

      $scope.toggle_form = function () {

        if ($scope.addform_visible) {
          $scope.reset();
        } else {
          $scope.addform_visible = true;
        }
      };


      // User should not even be able to try granting a trust if the reserve is insufficient
      $scope.$watch('account', function() {
        // Check if account has Defaultcbc flag set
        $scope.acctDefaultcbcFlag = ($scope.account.Flags & cbc.Remote.flags.account_root.Defaultcbc);

        $scope.can_add_trust = false;
        if ($scope.account.Balance && $scope.account.reserve_to_add_trust) {
          if (!$scope.account.reserve_to_add_trust.subtract($scope.account.Balance).is_positive()
            || $.isEmptyObject($scope.lines)) {
            $scope.can_add_trust = true;
          }
        }
      }, true);

      $scope.$watch('counterparty', function() {
        $scope.error_account_reserve = false;
        $scope.contact = webutil.getContact($scope.userBlob.data.contacts, $scope.counterparty);
        if ($scope.contact) {
          $scope.counterparty_name = $scope.contact.name;
          $scope.counterparty_address = $scope.contact.address;
        } else {
          $scope.counterparty_name = '';
          $scope.counterparty_address = $scope.counterparty;
        }
      }, true);

      /**

       * N2. Confirmation page
       */
      $scope.grant = function() {
        // set variable to show throbber
        $scope.verifying = true;
        $scope.error_account_reserve = false;
        // test if account is valid
        network.remote.requestAccountInfo({account: $scope.counterparty_address})
          // if account is valid then just to confirm page
          .on('success', function(m) {
            $scope.$apply(function() {
              // hide throbber
              $scope.verifying = false;

              $scope.lineCurrencyObj = Currency.from_human($scope.currency);
              var matchedCurrency = $scope.lineCurrencyObj.has_interest() ?
                  $scope.lineCurrencyObj.to_hex() : $scope.lineCurrencyObj.get_iso();

              var match = /^([a-zA-Z0-9]{3}|[A-Fa-f0-9]{40})\b/.exec(matchedCurrency);

              if (!match) {
                // Currency code not recognized, should have been caught by
                // form validator.
                console.error('Currency code:', match, 'is not recognized');
                return;
              }

              if (Options.advanced_feature_switch === false || $scope.amount === "") {
                // $scope.amount = Number(cbc.Amount.consts.max_value);
                $scope.amount = Options.gateway_max_limit;
              }

              var amount = cbc.Amount.from_human(
                '' + $scope.amount + ' ' + $scope.lineCurrencyObj.to_hex(),
                {reference_date: new Date( + new Date() + 5 * 60000)});

              amount.set_issuer($scope.counterparty_address);
              if (!amount.is_valid()) {
                // Invalid amount. Indicates a bug in one of the validators.
                return;
              }

              $scope.amount_feedback = amount;

              $scope.confirm_wait = true;
              $timeout(function () {
                $scope.confirm_wait = false;
              }, 1000, true);

              $scope.mode = 'confirm';

              /**
               * Warning messages
               *
               * - firstIssuer
               * - sameIssuer
               * - multipleIssuers
               */
              // var currency = amount.currency().to_human({full_name:$scope.currencies_all_keyed[amount.currency().get_iso()].name});
              // var balance = $scope.balances[currency];
              // $scope.currencyWarning = false;

              // New trust on a currency or no rippling enabled
              // if (!balance || !$scope.allowrippling) {
              //   $scope.currencyWarning = 'firstIssuer';
              // }
              // else {
                // Trust limit change
                // for (var counterparty in balance.components) {
                //   if (counterparty === $scope.counterparty_address)
                //     $scope.currencyWarning = 'sameIssuer';
                // }

                // Multiple trusts on a same currency
                // if (!$scope.currencyWarning)
                //   $scope.currencyWarning = 'multipleIssuers';
              // }
            });
          })
          .on('error', function (m) {
            setImmediate(function () {
              $scope.$apply(function() {
                $scope.verifying = false;
                $scope.error_account_reserve = true;
                console.log('There was an error', m);
              });
            });
          })
          .request();
      };

      /**
       * N3. Waiting for grant result page
       */
      $scope.grant_confirmed = function () {
        var amount = $scope.amount_feedback.to_json();
        var tx = network.remote.transaction();

        // Add memo to tx
        tx.addMemo('client', 'text/plain', 'rt' + $scope.version);


        // Flags
        tx
          .cbcLineSet(id.account, amount)
          .setFlags($scope.allowrippling ? 'ClearNocbc' : 'Nocbc')
          .on('proposed', function(res) {
            $scope.$apply(function () {
              setEngineStatus(res, false);
              $scope.granted(tx.hash);

              // Remember currency and increase order
              var found;

              for (var i = 0; i < $scope.currencies_all.length; i++) {
                if ($scope.currencies_all[i].value.toLowerCase() === $scope.amount_feedback.currency().get_iso().toLowerCase()) {
                  $scope.currencies_all[i].order++;
                  found = true;
                  break;
                }
              }

              // // Removed feature until a permanent fix
              // if (!found) {
              //   $scope.currencies_all.push({
              //     'name': currency,
              //     'value': currency,
              //     'order': 1
              //   });
              // }
            });
          })
          .on('success', function(res) {
            $scope.$apply(function() {
              setEngineStatus(res, true);
            });

            api.addTransaction(res.tx_json, {Status: 'success'}, res.tx_json.hash, new Date().toString());
          })
          .on('error', function(res) {
            setImmediate(function () {
              $scope.$apply(function () {
                $scope.mode = 'error';

                setEngineStatus(res, false);

                $scope.reset();

              });
            });

            api.addTransaction(res.tx_json, {Status: 'error'}, res.tx_json.hash, new Date().toString());
          })
        ;

        keychain.requestSecret(id.account, id.username, function (err, secret) {
          // XXX Error handling
          if (err) {
            $scope.load_notification('unlock_failed');

            $scope.reset();
            return;
          }

          $scope.mode = 'granting';

          tx.secret(secret);

          api.getUserAccess().then(function(res) {
            tx.submit();
          }, function(err2) {
            setImmediate(function () {
              $scope.$apply(function () {
                $scope.mode = 'error';
                $scope.reset();
              });
            });
          });

        });

        $scope.toggle_form();
      };

      /**
       * N5. Granted page
       */
      $scope.granted = function (hash) {
        $scope.mode = 'granted';
        network.remote.on('transaction', handleAccountEvent);

        function handleAccountEvent(e) {
          $scope.$apply(function () {
            if (e.transaction.hash === hash) {
              setEngineStatus(e, true);
              network.remote.removeListener('transaction', handleAccountEvent);
            }
          });
        }

        $timeout(function() {
          $scope.mode = 'main';
        }, 10000);
      };

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
      }

      $scope.$watch('userBlob.data.contacts', function (contacts) {
        $scope.counterparty_query = webutil.queryFromContacts(contacts);
      }, true);

      for (var i = 0; i < $scope.currencies_all.length; i++) {
        if ($scope.currencies_all[i].display) {
          displayCurrenciesOnly.push($scope.currencies_all[i]);
        }
      }

      $scope.currency_query = webutil.queryFromOptionsIncludingKeys(displayCurrenciesOnly);

      $scope.reset();

      var updateAccountLines = function() {
        var obj = {};

        _.each($scope.lines, function(line) {

          if ($scope.isSignificantLine(line)) {
            if (!obj[line.currency]) {
              obj[line.currency] = { components: [] };
            }

            obj[line.currency].components.push(line);
          }
        });

        $scope.accountLines = obj;
      };

      $scope.$on('$balancesUpdate', function() {
        updateAccountLines();
      });

      updateAccountLines();
  }]);

  module.controller('AccountRowCtrl', ['$scope', 'rpBooks', 'rpNetwork', 'rpId', 'rpKeychain', 'rpAPI', '$timeout',
    function ($scope, books, network, id, keychain, api, $timeout) {
      $scope.minVal = $scope.entry.components[0].limit_peer.to_human({rel_precision: 2});
      // if($scope.minVal % 10 === 0) {
      //   $scope.minVal = String($scope.minVal) + ".00";
      //   console.warn($scope.minVal)
      //   console.warn($scope.minVal)
      // }
      if($scope.minVal !== 0) {
        $scope.minVal = -(1) * $scope.minVal;
      }
        $scope.minVal = Number($scope.minVal).toFixed(2);
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
      }

      $scope.cancel = function () {
        $scope.editing = false;
      };

      $scope.edit_account = function() {
        $scope.editing = true;

        $scope.trust = {};
        // edit as string because Chrome shows tiny numbers in e-notation
        $scope.trust.limit = String($scope.component.limit.to_json().value);
        $scope.trust.rippling = !$scope.component.no_cbc;
        $scope.trust.limit_peer = Number($scope.component.limit_peer.to_json().value);
        $scope.trust.balance = String($scope.component.balance.to_json().value);
        $scope.trust.balanceAmount = $scope.component.balance;

        var currency = Currency.from_human($scope.component.currency);

        currency.to_human({full_name: $scope.currencies_all_keyed[currency.get_iso()]})
          ? $scope.trust.currency = currency.to_human({full_name: $scope.currencies_all_keyed[currency]})
          : $scope.trust.currency = currency.to_human({full_name: $scope.currencies_all_keyed[currency.get_iso()].name});

        // $scope.trust.currency = currency.to_human({full_name:$scope.currencies_all_keyed[currency.get_iso()].name});
        $scope.trust.counterparty = $scope.component.account;

        $scope.load_orderbook();
      };

      $scope.delete_account = function() {
        $scope.trust.loading = true;
        $scope.load_notification('remove_gateway');
        $scope.trust.state = 'removing';

        var setSecretAndSubmit = function(tx) {
          tx
            .on('proposed', function(res) {
              $scope.$apply(function () {
                setEngineStatus(res, false);
              });
            })
            .on('success', function(res) {
              $scope.$apply(function () {
                setEngineStatus(res, true);
              });

              api.addTransaction(res.tx_json, {Status: 'success'}, res.tx_json.hash, new Date().toString());
            })
            .on('error', function(res) {
              console.log('error', res);
              setImmediate(function () {
                $scope.$apply(function () {
                  if (res.result === 'tejMaxFeeExceeded') {
                    $scope.load_notification('max_fee');
                  }

                  $scope.mode = 'error';
                  setEngineStatus(res, false);

                  $scope.trust.loading = false;
                });
              });

              api.addTransaction(res.tx_json, {Status: 'error'}, res.tx_json.hash, new Date().toString());
            });

          keychain.requestSecret(id.account, id.username, function (err, secret) {
            if (err) {
              $scope.mode = 'error';
              $scope.trust.loading = false;
              $scope.load_notification('unlock_failed');
              console.log('Error on requestSecret: ', err);

              $scope.reset();
              return;
            }

            tx.secret(secret);
            api.getUserAccess().then(function(res) {
              tx.submit();
            }, function(err2) {
              setImmediate(function() {
                $scope.$apply(function () {
                  $scope.mode = 'error';
                  $scope.trust.loading = false;
                });
              });
            });

          });
        };

        var nullifyTrustLine = function(idAccount, lineCurrency, lineAccount) {
          var tx = network.remote.transaction();

          // Add memo to tx
          tx.addMemo('client', 'text/plain', 'rt' + $scope.version);

          tx.trustSet(idAccount, '0' + '/' + lineCurrency + '/' + lineAccount);

          $scope.acctDefaultcbcFlag ? tx.setFlags('ClearNocbc') : tx.setFlags('Nocbc');

          setSecretAndSubmit(tx);
        };

        var clearBalance = function(selfAddress, issuerAddress, curr, amountObject, callback) {

          // Decision tree: two paths
          // 1) There is a market -> send back balance to user as cbc
          // 2) There is no market -> send back balance to issuer

          var sendBalanceToSelf = function() {
            var tx = network.remote.transaction();

            // Add memo to tx
            tx.addMemo('client', 'text/plain', 'rt' + $scope.version);

            var payment = tx.payment(selfAddress, selfAddress, '100000000000');

            payment.setFlags('PartialPayment');
            payment.sendMax(amountObject.to_human() + '/' + curr + '/' + issuerAddress);

            return tx;
          };

          var sendBalanceToIssuer = function() {
            var tx = network.remote.transaction();

            // Add memo to tx
            tx.addMemo('client', 'text/plain', 'rt' + $scope.version);

            var amount = amountObject.clone();
            var newAmount = amount.set_issuer(issuerAddress);
            var payment = tx.payment(selfAddress, issuerAddress, newAmount);

            return tx;
          };

          var tx = ($scope.orderbookStatus === 'exists') ? sendBalanceToSelf() : sendBalanceToIssuer();

          setSecretAndSubmit(tx);

          tx.once('proposed', callback);
        };

        // $scope.counterparty inside the clearBalance callback function does not have counterparty in its scope,
        // therefore, we need an immediate function to capture it.

        if ($scope.trust.balance !== '0') {
          (function (counterparty) {
            clearBalance(
              id.account,
              $scope.trust.counterparty,
              $scope.trust.currency,
              $scope.trust.balanceAmount,
              function(res) {
                nullifyTrustLine(id.account, $scope.trust.currency, counterparty);
              }
            );
          })($scope.trust.counterparty);

        } else {
          nullifyTrustLine(id.account, $scope.trust.currency, $scope.trust.counterparty);

        }

      };

      $scope.load_orderbook = function() {
        $scope.orderbookStatus = false;

        if ($scope.book) {
          $scope.book.unsubscribe();
        }

        $scope.book = books.get({
          currency: $scope.trust.currency,
          issuer: $scope.trust.counterparty
        }, {

          currency: 'cbc',
          issuer: undefined
        });

        $scope.$watchCollection('book', function () {
          if (!$scope.book.updated) return;

          if ($scope.book.asks.length !== 0 && $scope.book.bids.length !== 0) {
            $scope.orderbookStatus = 'exists';
          } else {
            $scope.orderbookStatus = 'not';
          }
        });

      };

      $scope.save_account = function () {

        $scope.trust.loading = true;
        $scope.trust.state = 'saving';

        var amount = cbc.Amount.from_human(
          $scope.trust.limit + ' ' + $scope.component.currency,
          {reference_date: new Date(+new Date() + 5 * 60000)}
        );

        amount.set_issuer($scope.component.account);

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
          .setFlags($scope.trust.rippling ? 'ClearNocbc' : 'Nocbc')
          .on('proposed', function(res) {
            $scope.$apply(function() {
              setEngineStatus(res, false);
            });
          })
          .on('success', function(res) {
            $scope.$apply(function () {
              setEngineStatus(res, true);

              $scope.trust.loading = false;
              $scope.editing = false;
              $scope.load_notification('changes_saved');
            });

            api.addTransaction(res.tx_json, {Status: 'success'}, res.tx_json.hash, new Date().toString());
          })
          .on('error', function(res) {
            setImmediate(function () {
              $scope.$apply(function () {
                $scope.mode = 'error';
                setEngineStatus(res, false);

                if (res.result === 'tejMaxFeeExceeded') {
                  $scope.load_notification('max_fee');
                }

                $scope.trust.loading = false;
                $scope.editing = false;

              });
            });

            api.addTransaction(res.tx_json, {Status: 'error'}, res.tx_json.hash, new Date().toString());
          });


        keychain.requestSecret(id.account, id.username, function (err, secret) {
          // XXX Error handling
          if (err) {
            $scope.trust.loading = false;
            $scope.load_notification('error');

            $scope.reset();

            return;
          }

          $scope.mode = 'granting';

          tx.secret(secret);

          api.getUserAccess().then(function(res) {
            tx.submit();
          }, function(err2) {
            setImmediate(function () {
              $scope.$apply(function () {
                $scope.mode = 'error';

                $scope.trust.loading = false;
                $scope.editing = false;
              });
            });
          });
        });
      };

      $scope.isIncomingOnly = function () {
        return ($scope.component.limit.is_zero() && !$scope.component.limit_peer.is_zero());
      };

      $scope.ripplingEnabled = function() {
        return !$scope.component.no_cbc;
      };

      $scope.showEnableRipplingWarningMessage = function() {
        return ($scope.isIncomingOnly() &&
                !$scope.ripplingEnabled() &&
                $scope.trust.rippling &&
                $scope.trust.balance !== '0');
      };
    }]);

};

module.exports = TrustTab;
