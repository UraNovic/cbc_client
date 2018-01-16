var pairs = require('../data/pairs');

/**
 * Calculate executed order price
 *
 * @param effect
 * @returns {*}
 */
var getPrice = function(effect, referenceDate) {
  var g = effect.got ? effect.got : effect.gets;
  var p = effect.paid ? effect.paid : effect.pays;
  var price;

  if (!p.is_zero() && !g.is_zero()) {
    _.find(pairs, function(pair) {
      if (pair.name == g.currency().to_human() + '/' + p.currency().to_human()) {
        price = p.ratio_human(g, {reference_date: referenceDate});
      }
    });

    if (!price) {
      price = g.ratio_human(p, {reference_date: referenceDate});
    }
  }

  return price || 0;
};

var getStraightPrice = function(effect, referenceDate) {
  var g = effect.got ? effect.got : effect.gets;
  var p = effect.paid ? effect.paid : effect.pays;
  var price;

  if (!p.is_zero() && !g.is_zero()) {
    price = g.ratio_human(p, {reference_date: referenceDate});
  }

  return price || 0;
};

var getInvStraightPrice = function(effect, referenceDate) {
  var g = effect.got ? effect.got : effect.gets;
  var p = effect.paid ? effect.paid : effect.pays;
  var price;

  if (!p.is_zero() && !g.is_zero()) {
    price = p.ratio_human(g, {reference_date: referenceDate});
  }

  return price || 0;
};

/**
 * Determine if the transaction is a 'rippling' transaction based on effects
 *
 * @param effects
 */
var isRippling = function(effects) {
  if (
    effects
    && effects.length
    && 2 === effects.length
    && 'trust_change_balance' == effects[0].type
    && 'trust_change_balance' == effects[1].type
    && effects[0].currency == effects[1].currency
    && !effects[0].amount.compareTo(effects[1].amount.negate())
  ) {
    return true;
  }
};

/**
 * Simple static class for processing server-side JSON.
 */
var JsonRewriter = module.exports = {
  /**
   * Filter affected nodes by type.
   *
   * If affectedNodes is not a valid set of nodes, returns an empty array.
   */
  filterAnodes: function (affectedNodes, type) {
    if (!affectedNodes) return [];

    return affectedNodes.filter(function (an) {
      an = an.CreatedNode ? an.CreatedNode :
          an.ModifiedNode ? an.ModifiedNode :
          {};

      return an.LedgerEntryType === type;
    });
  },

  /**
   * Returns resulting (new or modified) fields from an affected node.
   */
  getAnodeResult: function (an) {
    an = an.CreatedNode ? an.CreatedNode :
        an.ModifiedNode ? an.ModifiedNode :
        {};

    var fields = $.extend({}, an.NewFields, an.FinalFields);

    return fields;
  },

  /**
   * Takes a metadata affected node and returns a simpler JSON object.
   *
   * The resulting object looks like this:
   *
   *   {
   *     // Type of diff, e.g. CreatedNode, ModifiedNode
   *     diffType: 'CreatedNode'
   *
   *     // Type of node affected, e.g. cbcState, AccountRoot
   *     entryType: 'cbcState',
   *
   *     // Index of the ledger this change occurred in
   *     ledgerIndex: '01AB01AB...',
   *
   *     // Contains all fields with later versions taking precedence
   *     //
   *     // This is a shorthand for doing things like checking which account
   *     // this affected without having to check the diffType.
   *     fields: {...},
   *
   *     // Old fields (before the change)
   *     fieldsPrev: {...},
   *
   *     // New fields (that have been added)
   *     fieldsNew: {...},
   *
   *     // Changed fields
   *     fieldsFinal: {...}
   *   }
   */
  processAnode: function (an) {
    var result = {};

    ['CreatedNode', 'ModifiedNode', 'DeletedNode'].forEach(function (x) {
      if (an[x]) result.diffType = x;
    });

    if (!result.diffType) return null;

    an = an[result.diffType];

    result.entryType = an.LedgerEntryType;
    result.ledgerIndex = an.LedgerIndex;

    result.fields = $.extend({}, an.PreviousFields, an.NewFields, an.FinalFields);
    result.fieldsPrev = an.PreviousFields || {};
    result.fieldsNew = an.NewFields || {};
    result.fieldsFinal = an.FinalFields || {};

    return result;
  },

  /**
   * Takes a transaction and its metadata and returns the amount sent as:
   *
   * If cbc, value sent as String
   *
   * If not cbc,
      {
       value: value sent as String,
       currency: currency code of value sent
      }
    *
    * If unable to determine, returns undefined
    *
    * If the caller needs the issuer of sent currency as well, try tx.sendMax.issuer
   */
  getAmountSent: function (tx, meta) {
    var sender = tx.Account,
        difference = null,
        tmpDifference,
        cur = null,
        i,
        affectedNode,
        amtSent;

    if (tx.TransactionType === 'Payment') {
      if (meta.DeliveredAmount) {
        return meta.DeliveredAmount;
      }

      if (meta.AffectedNodes) {
        // Find the metadata node with entry type == 'cbcState'
        // and either HighLimit.issuer == [sender's account] or
        // LowLimit.issuer == [sender's account] and
        // Balance.currency == [currency of SendMax || Amount]
        if (tx.SendMax && tx.SendMax.currency) {
          for (i = 0; i < meta.AffectedNodes.length; i++) {
            affectedNode = meta.AffectedNodes[i];
            if (affectedNode.ModifiedNode && affectedNode.ModifiedNode.LedgerEntryType === 'cbcState' &&
              (affectedNode.ModifiedNode.FinalFields.HighLimit.issuer === sender ||
                affectedNode.ModifiedNode.FinalFields.LowLimit.issuer === sender) &&
              affectedNode.ModifiedNode.FinalFields.Balance.currency === tx.SendMax.currency) {
              // Calculate the difference before/after. If HighLimit.issuer == [sender's account] negate it.

              tmpDifference = affectedNode.ModifiedNode.PreviousFields.Balance.value - affectedNode.ModifiedNode.FinalFields.Balance.value;
              if (affectedNode.ModifiedNode.FinalFields.HighLimit.issuer === sender) tmpDifference *= -1;
              difference += tmpDifference;
              cur = affectedNode.ModifiedNode.FinalFields.Balance.currency;
            }
          }
        }

        if (difference === null) {
          // Find the metadata node with entry type == 'AccountRoot' and Account == [sender's account].
          for (i = 0; i < meta.AffectedNodes.length; i++) {
            affectedNode = meta.AffectedNodes[i];
            if (affectedNode.ModifiedNode && affectedNode.ModifiedNode.LedgerEntryType === 'AccountRoot' &&
              affectedNode.ModifiedNode.FinalFields && affectedNode.ModifiedNode.FinalFields.Account === sender) {
              // Calculate the difference minus the fee

              difference = affectedNode.ModifiedNode.PreviousFields.Balance - affectedNode.ModifiedNode.FinalFields.Balance - tx.Fee;
              break;
            }
          }
        }

        if (difference) {  // calculated and non-zero
          var diff = String(difference);
          amtSent = cur ? {value: diff, currency : cur} : diff;
        }

        else {
          amtSent = tx.Amount;
        }
      }
    }

    return amtSent;
  },

  /**
   * Convert transactions into a more useful (for our purposes) format.
   *
   * The main operation this function performs is to change the view on the
   * transaction from a neutral view to a subjective view specific to our
   * account.
   *
   * For example, rather than having a sender and receiver, the transaction has
   * a counterparty and a flag whether it is incoming or outgoing.
   *
   * processTxn returns main purpose of transaction and side effects.
   *
   * Main purpose
   *  Real transaction names
   *  - Payment (sent/received/exchange)
   *  - TrustSet (trusting/trusted)
   *  - OfferCreate (offernew)
   *  - OfferCancel (offercancel)
   *
   *  Virtual transaction names
   *  - Failed
   *  - Rippling
   *
   * Side effects
   *  - balance_change
   *  - Trust (trust_create_local, trust_create_remote, trust_change_local,
   *          trust_change_remote, trust_change_balance, trust_change_no_cbc)
   *  - Offer (offer_created, offer_funded, offer_partially_funded,
   *          offer_cancelled, offer_bought)
   */
  processTxn: function (tx, meta, account) {
    try {
      return JsonRewriter._processTxn(tx, meta, account);
    } catch (err) {
      var transaction = {};
      transaction.type = 'error';
      if (tx && 'object' === typeof tx) {
        transaction.hash = tx.hash;
        transaction.date = cbc.utils.toTimestamp(tx.date);
        transaction.dateRaw = tx.date;
      } else {
        transaction.hash = 'unknown';
        transaction.date = new Date().getTime();
        transaction.dateRaw = cbc.utils.fromTimestamp(fromTimestamp);
      }
      return {transaction: transaction, error: err};
    }
  },

  _processTxn: function (tx, meta, account) {
    var obj = {},
        hasFee = false;

    // Currency balances that have been affected by the transaction
    var affectedCurrencies = [];

    // Main transaction
    if (tx.Account === account
        || (tx.Destination && tx.Destination === account)
        || (tx.LimitAmount && tx.LimitAmount.issuer === account)) {

      var transaction = {};

      if ('tesSUCCESS' === meta.TransactionResult) {
        switch (tx.TransactionType) {
          case 'Payment':
            
            var amount;
            // If partial payment, use delivered amount 
            if(meta.DeliveredAmount){
              amount = cbc.Amount.from_json(meta.DeliveredAmount);
            }
            else {
              amount = cbc.Amount.from_json(tx.Amount);
            }

            if (tx.Account === account) {
              if (tx.Destination === account) {
                transaction.type = 'exchange';
                transaction.spent = cbc.Amount.from_json(tx.SendMax);
              }
              else {
                transaction.type = 'sent';
                transaction.counterparty = tx.Destination;
              }
            }
            else {
              transaction.type = 'received';
              transaction.counterparty = tx.Account;
            }

            if (typeof tx.SendMax === 'object') transaction.sendMax = tx.SendMax;

            var amtSent = JsonRewriter.getAmountSent(tx, meta);
            if (amtSent) transaction.amountSent = amtSent;

            transaction.amount = amount;
            transaction.currency = amount.currency().to_human();
            break;

          case 'TrustSet':
            transaction.type = tx.Account === account ? 'trusting' : 'trusted';
            transaction.counterparty = tx.Account === account ? tx.LimitAmount.issuer : tx.Account;
            transaction.amount = cbc.Amount.from_json(tx.LimitAmount);
            transaction.currency = tx.LimitAmount.currency;
            break;

          case 'OfferCreate':
            transaction.type = 'offernew';
            transaction.pays = cbc.Amount.from_json(tx.TakerPays);
            transaction.gets = cbc.Amount.from_json(tx.TakerGets);
            transaction.sell = tx.Flags & cbc.Transaction.flags.OfferCreate.Sell;
            break;

          case 'OfferCancel':
            transaction.type = 'offercancel';
            break;

          case 'AccountSet':
            // Ignore empty accountset transactions. (Used to sync sequence numbers)
            if (meta.AffectedNodes.length === 1 && _.size(meta.AffectedNodes[0].ModifiedNode.PreviousFields) === 2)
              break;

            transaction.type = 'accountset';
            break;

          default:
            console.log('Unknown transaction type: \''+tx.TransactionType+'\'', tx);
        }

        if (tx.Flags) {
          transaction.flags = tx.Flags;
        }
      } else {
        transaction.type = 'failed';
      }

      if (!$.isEmptyObject(transaction)) {
        obj.transaction = transaction;
      }
    }

    // Side effects
    if ('tesSUCCESS' === meta.TransactionResult) {
      meta.AffectedNodes.forEach(function (n) {
        var node = JsonRewriter.processAnode(n);
        var feeEff;
        var effect = {};

        // AccountRoot - Current account node
        if (node.entryType === 'AccountRoot' && node.fields.Account === account) {
          obj.accountRoot = node.fields;

          // This is the first transaction on current account
          if (node.diffType === 'CreatedNode') {
            effect.type = 'balance_change';
            effect.amount = cbc.Amount.from_json(node.fields.Balance);
            effect.balance = effect.amount;

            obj.balance_changer = effect.balance_changer = true;
            affectedCurrencies.push('cbc');
          }

          // Balance has been changed
          else if (node.fieldsPrev.Balance) {
            var balance = cbc.Amount.from_json(node.fields.Balance);

            // Fee
            if (tx.Account === account && tx.Fee) {
              feeEff = {
                type: 'fee',
                amount: cbc.Amount.from_json(tx.Fee).negate(),
                balance: balance
              };
            }

            // Updated cbc Balance
            if (tx.Fee != node.fieldsPrev.Balance - node.fields.Balance) {
              if (feeEff)
                balance = balance.subtract(feeEff.amount);

              effect.type = 'balance_change';
              effect.amount = balance.subtract(node.fieldsPrev.Balance);
              effect.balance = balance;

              // balance_changer is set to true if the transaction / effect has changed one of the account balances
              obj.balance_changer = effect.balance_changer = true;
              affectedCurrencies.push('cbc');
            }
          }
        }

        // cbcState - cbc Lines
        if (node.entryType === 'cbcState'
            && (node.fields.HighLimit.issuer === account || node.fields.LowLimit.issuer === account)) {

          var high = node.fields.HighLimit;
          var low = node.fields.LowLimit;
          var viewHigh = high.issuer === account;

          // old method, because sometimes there is no transaction
          var which = viewHigh ? 'HighNocbc' : 'LowNocbc';

          if (obj.transaction) {
            which = obj.transaction.type === 'trusting' ? (viewHigh ? 'HighNocbc' : 'LowNocbc') :
                                                            (viewHigh ? 'LowNocbc' : 'HighNocbc');
          }

          // New trust line
          if (node.diffType === 'CreatedNode') {
            effect.limit = cbc.Amount.from_json(viewHigh ? high : low);
            effect.limit_peer = cbc.Amount.from_json(viewHigh ? low : high);

            if (obj.transaction) {
              effect.type = obj.transaction.type === 'trusting' ? 'trust_create_local' : 'trust_create_remote';
            } else {
              if ((high.value > 0 && high.issuer === account)
                   || (low.value > 0 && low.issuer === account)) {
                effect.type = 'trust_create_local';
              } else {
                effect.type = 'trust_create_remote';
              }
            }
          }

          // Modified trust line
          else if (node.diffType === 'ModifiedNode' || node.diffType === 'DeletedNode') {
            var highPrev = node.fieldsPrev.HighLimit;
            var lowPrev = node.fieldsPrev.LowLimit;

            // Trust Balance change
            if (node.fieldsPrev.Balance) {
              effect.type = 'trust_change_balance';

              var issuer =  node.fields.Balance.value > 0 || node.fieldsPrev.Balance.value > 0
                  ? high.issuer : low.issuer;

              effect.amount = high.issuer === account
                  ? effect.amount = cbc.Amount.from_json(
                  node.fieldsPrev.Balance.value
                      + '/' + node.fieldsPrev.Balance.currency
                      + '/' + issuer).subtract(node.fields.Balance)
                  : effect.amount = cbc.Amount.from_json(
                  node.fields.Balance.value
                      + '/' + node.fields.Balance.currency
                      + '/' + issuer).subtract(node.fieldsPrev.Balance);

              obj.balance_changer = effect.balance_changer = true;
              affectedCurrencies.push(high.currency.toUpperCase());
            }

            // Trust Limit change
            else if (highPrev || lowPrev) {
              if (high.issuer === account) {
                effect.limit = cbc.Amount.from_json(high);
                effect.limit_peer = cbc.Amount.from_json(low);
              } else {
                effect.limit = cbc.Amount.from_json(low);
                effect.limit_peer = cbc.Amount.from_json(high);
              }

              if (highPrev) {
                effect.prevLimit = cbc.Amount.from_json(highPrev);
                effect.type = high.issuer === account ? 'trust_change_local' : 'trust_change_remote';
              }
              else if (lowPrev) {
                effect.prevLimit = cbc.Amount.from_json(lowPrev);
                effect.type = high.issuer === account ? 'trust_change_remote' : 'trust_change_local';
              }
            }

            // Trust flag change (effect gets this type only if nothing else but flags has been changed)
            else if (node.fieldsPrev.Flags) {
              // Account set a nocbc flag
              if (node.fields.Flags & cbc.Remote.flags.state[which] &&
                  !(node.fieldsPrev.Flags & cbc.Remote.flags.state[which])) {
                effect.type = 'trust_change_no_cbc';
              }

              // Account removed the nocbc flag
              else if (node.fieldsPrev.Flags & cbc.Remote.flags.state[which] &&
                  !(node.fields.Flags & cbc.Remote.flags.state[which])) {
                effect.type = 'trust_change_no_cbc';
              }

              if (effect.type)
                effect.flags = node.fields.Flags;
            }
          }

          if (!$.isEmptyObject(effect)) {
            effect.counterparty = high.issuer === account ? low.issuer : high.issuer;
            effect.currency = high.currency;
            effect.balance = high.issuer === account
                ? cbc.Amount.from_json(node.fields.Balance).negate(true)
                : cbc.Amount.from_json(node.fields.Balance);

            if (effect.balance.is_zero() && effect.balance.is_negative()) {
              effect.balance = effect.balance.negate(true);
            }

            if (obj.transaction && obj.transaction.type === 'trust_change_balance') {
              obj.transaction.balance = effect.balance;
            }

            // nocbc flag
            if (node.fields.Flags & cbc.Remote.flags.state[which]) {
              effect.nocbc = true;
            }
          }
        }

        // Offer
        else if (node.entryType === 'Offer') {
          // For new and cancelled offers we use 'fields'
          var fieldSet = node.fields;

          // Current account offer
          if (node.fields.Account === account) {
            // Partially funded offer [and deleted.. no more funds]
            /* Offer has been partially funded and deleted (because of the luck of funds)
             if the node is deleted and the TakerGets/TakerPays field has been changed */
            if (node.diffType === 'ModifiedNode' ||
                (node.diffType === 'DeletedNode'
                    && node.fieldsPrev.TakerGets
                    && !cbc.Amount.from_json(node.fieldsFinal.TakerGets).is_zero())) {
              effect.type = 'offer_partially_funded';

              if (node.diffType !== 'DeletedNode') {
                effect.remaining = cbc.Amount.from_json(node.fields.TakerGets);
              }
              else {
                effect.cancelled = true;
              }
            }
            else {
              // New / Funded / Cancelled offer
              effect.type = node.diffType === 'CreatedNode'
                  ? 'offer_created'
                  : node.fieldsPrev.TakerPays
                  ? 'offer_funded'
                  : 'offer_cancelled';

              // For funded offers we use 'fieldsPrev'.
              if (effect.type === 'offer_funded')
                fieldSet = node.fieldsPrev;

              // We don't count cancelling an offer as a side effect if it's
              // already the primary effect of the transaction.
              if (effect.type === 'offer_cancelled' &&
                  obj.transaction &&
                  obj.transaction.type === 'offercancel') {
                // Fill in remaining information about offer
                obj.transaction.gets = fieldSet.TakerGets;
                obj.transaction.pays = fieldSet.TakerPays;
              }
            }

            effect.seq = +node.fields.Sequence;
          }

          // Another account offer. We care about it only if our transaction changed the offer amount (we bought currency)
          else if (tx.Account === account && !$.isEmptyObject(node.fieldsPrev) // Offer is unfunded if node.fieldsPrev is empty
            && !$.isEmptyObject(node.fieldsPrev.TakerGets) && !$.isEmptyObject(node.fieldsPrev.TakerPays)) { // TakerGets or TakerPays might not be there if the change is smaller then a drop
            effect.type = 'offer_bought';
          }

          if (effect.type) {
            effect.gets = cbc.Amount.from_json(fieldSet.TakerGets);
            effect.pays = cbc.Amount.from_json(fieldSet.TakerPays);

            if ('offer_partially_funded' === effect.type || 'offer_bought' === effect.type) {
              effect.got = cbc.Amount.from_json(node.fieldsPrev.TakerGets).subtract(node.fields.TakerGets);
              effect.paid = cbc.Amount.from_json(node.fieldsPrev.TakerPays).subtract(node.fields.TakerPays);
            }

            effect.price = getPrice(effect, tx.date);
            effect.straightPrice = getStraightPrice(effect, tx.date);
            effect.invStraightPrice = getInvStraightPrice(effect, tx.date);

            // Flags
            if (node.fields.Flags) {
              effect.flags = node.fields.Flags;
              effect.sell = node.fields.Flags & cbc.Remote.flags.offer.Sell;
            }
          }
        }

        if (!$.isEmptyObject(effect)) {
          if (node.diffType === 'DeletedNode') {
            effect.deleted = true;
          }

          if (!obj.effects) obj.effects = [];
          obj.effects.push(effect);
        }

        // Fee effect
        if (feeEff) {
          hasFee = true;
          if (!obj.effects) obj.effects = [];
          obj.effects.push(feeEff);
        }
      });
    }

    // Balance after the transaction
    if (obj.accountRoot && obj.transaction && 'undefined' === typeof obj.transaction.balance) {
      obj.transaction.balance = cbc.Amount.from_json(obj.accountRoot.Balance);
    }

    if ($.isEmptyObject(obj))
      return;

    // If the transaction didn't wind up cancelling an offer
    if (tx.TransactionType === 'OfferCancel' && obj.transaction &&
      (!obj.transaction.gets || !obj.transaction.pays)) {
      return;
    }

    // Rippling transaction
    if (isRippling(obj.effects)) {
      if (!obj.transaction) {
        obj.transaction = {};
      }
      obj.transaction.type = 'rippling';
    }

    obj.tx_type = tx.TransactionType;
    obj.tx_result = meta.TransactionResult;
    obj.fee = cbc.Amount.from_json(hasFee ? tx.Fee : 0);
    obj.date = cbc.utils.toTimestamp(tx.date);
    obj.dateRaw = tx.date;
    obj.hash = tx.hash;
    obj.affectedCurrencies = affectedCurrencies || [];
    obj.ledger_index = tx.ledger_index;

    return obj;
  }
};
