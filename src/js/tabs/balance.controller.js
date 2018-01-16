var util = require('util'),
    Tab = require('../client/tab').Tab,
    Amount = cbc.Amount,
    rewriter = require('../util/jsonrewriter'),
    gateways = require('../../../deps/gateways.json');

var BalanceTab = function ()
{
  Tab.call(this);
};

util.inherits(BalanceTab, Tab);

BalanceTab.prototype.tabName = 'balance';
BalanceTab.prototype.mainMenu = 'wallet';

BalanceTab.prototype.angularDeps = Tab.prototype.angularDeps.concat(['marketchart']);

BalanceTab.prototype.angular = function (module)
{
  module.controller('BalanceCtrl', ['$scope', 'rpId', 'rpNetwork', '$filter', '$http', 'rpAppManager', '$q',
                                     function ($scope, id, network, $filter, $http, appManager, $q)
  {
    //

    // In the following, we get and watch for changes to data that is used to
    // calculate the pie chart and aggregate balance. This data includes:
    // -What balances the user holds
    // -What (if any) market value in terms of cbc each balance has, according to
    //  https://api.cbccharts.com/api/exchangeRates
    // -What metric the user has chosen to calculate the aggregate value in

    // When the selected value metric changes, update the displayed amount.

    $scope.currenciesAll = require('../data/currencies');
    $scope.currencies = [];

    $scope.exchangeRates || ($scope.exchangeRates = {cbc: 1});

    $scope.firstCurrencySelected = 'cbc';
    $scope.secondCurrencySelected = 'USD';

    var history = [];

    ($scope.selectedValueMetric = store.get('balance')) || ($scope.selectedValueMetric = 'cbc');

    /*** My Orders widget */
    $scope.sort_options = {
      current_pair_only: false,
      sort_field: 'type',
      reverse: false
    };

    $scope.validationPatternCurrency = /^[a-zA-Z]{3}/;

    $scope.changeMetric = function(scope) {
      $scope.selectedValueMetric = scope.selectedValueMetric;

      // NOTE: this really should be stored in the blob or
      // scoped to the blob_id so that it changes based on
      // which account is being viewed
      store.set('balance', $scope.selectedValueMetric);
    };

    $scope.$watch('selectedValueMetric', function() {
      if ($scope.selectedValueMetric && $scope.aggregateValueAscbc) {
        updateAggregateValueDisplayed();
      }
    });

    // Maintain a dictionary for the value of each 'currency:issuer' pair, denominated in cbc.
    // Fetch the data from cbcCharts, and refresh it whenever any non-cbc balances change.
    // When exchangeRates changes, update the aggregate value, and the list of available value metrics,
    // and also check for negative balances to see if the user should be notified.

    function updateExchangeRates() {
      var currencies = [];
      var hasNegative = false;
      for (var cur in $scope.balances) {if ($scope.balances.hasOwnProperty(cur)){
        var components = $scope.balances[cur].components;
        for (var issuer in components) {if (components.hasOwnProperty(issuer)){
          // While we're at it, check for negative balances:
          hasNegative || (hasNegative = components[issuer].is_negative());
          currencies.push({
            currency: cur,
            issuer: issuer
          });
        }}
      }}
      $scope.hasNegative = hasNegative;
      var pairs = currencies.map(function(c){
        return {
          base:c,
          counter:{currency:'cbc'}
        };
      });
      if (pairs.length) {
        $scope.exchangeRatesNonempty = false;
        $http.post('https://api.cbccharts.com/api/exchangeRates', {pairs: pairs, last: true})
        .success(function(response){
          for (var i = 0; i < response.length; i++) {
            var pair = response[i];
            if (pair.last > 0) { // Disregard unmarketable assets
              $scope.exchangeRates[pair.base.currency + ':' + pair.base.issuer] = pair.last;
            }
          }

          $scope.exchangeRatesNonempty = true;
          console.log('Exchange Rates: ', $scope.exchangeRates);
        });
      } else {
        $scope.exchangeRatesNonempty = true;
      }
    }

    $scope.$on('$balancesUpdate', updateExchangeRates);

    $scope.$watch('exchangeRates', updateNetWorthDropdown, true);

    function updateNetWorthDropdown() {
      if ($scope.exchangeRates) {
        var isAmbiguous = {};
        var okser = Object.keys($scope.exchangeRates);
        for (var i = 0; i < okser.length; i++) {
          var cur = okser[i].split(':')[0];
          if (!isAmbiguous[cur] || !isAmbiguous.hasOwnProperty(cur)) {
            // (In case there's a currency called 'constructor' or something)
            for (var j = i + 1; j < okser.length; j++) {
              var cur2 = okser[j].split(':')[0];
              if (cur === cur2) {
                isAmbiguous[cur] = true;
                break;
              }
            }
          }
        }

        var names = [];

        $scope.valueMetrics = okser.map(function(code) {
          var curIssuer = code.split(':');

          var currencyName = $filter('rpcurrency')(cbc.Amount.from_human('0 ' + curIssuer[0])); // This is really messy
          var issuerName = curIssuer.length > 1 ? $filter('rpcbcname')(curIssuer[1], false) : '';
          if (isAmbiguous[curIssuer[0]] && issuerName.indexOf('…') !== -1 && !id.addressDontHaveName(curIssuer[1])) {
            names.push(id.resolveName(curIssuer[1], { tilde: true }));
          }
          return {
            code: code,
            name: currencyName + (isAmbiguous[curIssuer[0]] ? '.' + issuerName : ''),
            nameShort: currencyName
          };
        });

        if (names.length > 0) {
          $q.all(names).then(function() {
            updateNetWorthDropdown();
          });
        }

        updateAggregateValueAscbc();
      }
    }

    // Whenever the cbc balance changes, update the aggregate value, but no need to refresh exchangeRates.
    // Update the displayed amount.

    $scope.$watch('account.Balance', updateAggregateValueAscbc);

    function updateAggregateValueAscbc() {
      if ($scope.account.Balance) {
        var av = $scope.account.Balance / 1000000;
        for (var cur in $scope.balances) {if ($scope.balances.hasOwnProperty(cur)){
          var components = $scope.balances[cur].components;
          for (var issuer in components) {if (components.hasOwnProperty(issuer)){
            var rate = ( $scope.exchangeRates[cur + ':' + issuer] || 0);
            var sbAscbc = components[issuer].to_number() * rate;
            av += sbAscbc;
          }}
        }}
        $scope.aggregateValueAscbc = av;
        updateAggregateValueDisplayed();
      }
    }

    function updateAggregateValueDisplayed() {
      var metric;
      _.forEach($scope.valueMetrics, function (valueMetric) {
        if (valueMetric.name === $scope.selectedValueMetric) {
          $scope.selectedValueMetricCode = valueMetric.code;
          $scope.selectedValueCurrencyShort = valueMetric.nameShort;
          metric = $scope.exchangeRates[valueMetric.code];
        }
      });

      if (!metric) {
        $scope.selectedValueMetric = $scope.selectedValueMetricCode = 'cbc';
        $scope.changeMetric($scope);
        metric = $scope.exchangeRates[$scope.selectedValueMetricCode];
      }

      $scope.aggregateValueAsMetric = $scope.aggregateValueAscbc / metric;

      if ($scope.selectedValueMetricCode === 'cbc' ||
          $scope.selectedValueMetricCode === '0158415500000000C1F76FF6ECB0BAC600000000:rDRXp3XC6ko3JKNh1pNrDARZzFKfBzaxyi' ||
          $scope.selectedValueMetricCode === '015841551A748AD2C1F76FF6ECB0CCCD00000000:rs9M85karFkCRjvc6KMWn8Coigm9cbcgcx')
      {
        $scope.aggregateValueDisplayed = (Amount.from_json({value:($scope.aggregateValueAsMetric.toFixed(4)
            .substring(0, (($scope.aggregateValueAscbc / metric).toFixed(4)).length - 5))})).to_human();
        $scope.aggregateValueDisplayedDecimal = $scope.aggregateValueAsMetric.toFixed(4).substring((($scope.aggregateValueAscbc / metric)
            .toFixed(4)).length - 5, (($scope.aggregateValueAscbc / metric).toFixed(4)).length);
      }
      else {
        $scope.aggregateValueDisplayed = (Amount.from_json({value:($scope.aggregateValueAsMetric.toFixed(2)
            .substring(0, (($scope.aggregateValueAscbc / metric).toFixed(2)).length - 3))})).to_human();
        $scope.aggregateValueDisplayedDecimal = $scope.aggregateValueAsMetric.toFixed(2).substring((($scope.aggregateValueAscbc / metric)
            .toFixed(2)).length - 3, (($scope.aggregateValueAscbc / metric).toFixed(2)).length);
      }
      $scope.aggregateValueDisplayedDecimalDot =
        ($scope.aggregateValueDisplayedDecimal.substring(0, 1) === '.');
      if ($scope.aggregateValueDisplayedDecimalDot) {
        $scope.aggregateValueDisplayedDecimal =
          $scope.aggregateValueDisplayedDecimal.substring(1);
      }
    }

    // if we were previously loaded, update the estimate
    if ($scope.loadState.lines) {
      updateExchangeRates();
    }

    /**
     * Market chart widget
     */
    $scope.$watch('firstCurrencySelected', function () {
      $scope.firstIssuerSelected = '';
      if ($scope.firstCurrencySelected == 'cbc') {
        $scope.disableFirstIssuer = true;
      }
      else {
        $scope.disableFirstIssuer = false;
        $scope.firstIssuer = {};
        gateways.forEach(function(gateway) {
          var accounts = gateway.accounts;
          accounts.forEach(function(account) {
            account.currencies.forEach(function(currency) {
              if (currency == $scope.firstCurrencySelected) {
                if ($scope.firstIssuerSelected === '') {
                  $scope.firstIssuerSelected = gateway.name;
                }
                $scope.firstIssuer[gateway.name] = gateway;
              }
            });
          });
        });
      }
    });

    $scope.$watch('secondCurrencySelected', function () {
      $scope.secondIssuerSelected = '';
      if ($scope.secondCurrencySelected == 'cbc') {
        $scope.disableSecondIssuer = true;
      }
      else {
        $scope.disableSecondIssuer = false;
        $scope.secondIssuer = {};
        gateways.forEach(function(gateway) {
          var accounts = gateway.accounts;
          accounts.forEach(function(account) {
            account.currencies.forEach(function(currency) {
              if (currency == $scope.secondCurrencySelected) {
                if ($scope.secondIssuerSelected === '') {
                  $scope.secondIssuerSelected = gateway.name;
                }
                $scope.secondIssuer[gateway.name] = gateway;
              }
            });
          });
        });
      }
    });

    $scope.issuerNameToAddress = function(issuerName, selectedCurrency) {
      if (selectedCurrency === 'cbc') {
        return '';
      }
      var issuerAddress = '';
      gateways.forEach(function(gateway) {
        if (issuerName !== gateway.name) {
          return;
        }
        var accounts = gateway.accounts;
        accounts.forEach(function(account){
          account.currencies.forEach(function(currency){
            if (currency === selectedCurrency) {
              issuerAddress = account.address;
            }
          });
        });
      });
      return issuerAddress;
    };

    $scope.flipCurrencies = function () {
      var oldFirstCurrencySelected  = $scope.firstCurrencySelected,
          oldFirstIssuerSelected    = $scope.firstIssuerSelected,
          oldSecondCurrencySelected = $scope.secondCurrencySelected,
          oldSecondIssuerSelected   = $scope.secondIssuerSelected;
      $scope.firstCurrencySelected  = oldSecondCurrencySelected;
      $scope.firstIssuerSelected    = oldSecondIssuerSelected;
      $scope.secondCurrencySelected = oldFirstCurrencySelected;
      $scope.secondIssuerSelected   = oldFirstIssuerSelected;
    };

    for (var i = 0; i < $scope.currenciesAll.length; i++) {
      if ($scope.currenciesAll[i].custom_trade_currency_dropdown) {
        $scope.currencies.push($scope.currenciesAll[i].value);
      }
    }

    /**
     * My Orders widget
     */
    $scope.sortOptions = {
      currentPairOnly: false,
      sortField: 'type',
      sortFieldName: 'Type',
      reverse: false
    };

    $scope.sortOptions.sortFieldName = $scope.ordersSortFieldChoicesKeyed[$scope.sortOptions.sortField];

    $scope.$watch('sortOptions.sortFieldName', function () {
      $scope.sortOptions.sortField = $scope.ordersSortFieldChoicesKeyedReverse[$scope.sortOptions.sortFieldName];
    });
    $scope.$watch('sortOptions.sortField', function () {
      $scope.sortOptions.sortFieldName = $scope.ordersSortFieldChoicesKeyed[$scope.sortOptions.sortField];
    });

    $scope.view_orders_history = function()
    {
      $location.url('/history?f=orders');
    }

  }]);
};

module.exports = BalanceTab;
