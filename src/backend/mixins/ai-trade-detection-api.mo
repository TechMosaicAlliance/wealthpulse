import AccessControl "mo:caffeineai-authorization/access-control";
import TradeLib "../lib/ai-trade-detection";
import TxLib "../lib/transactions";
import TxTypes "../types/transactions";
import Types "../types/ai-trade-detection";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Array "mo:core/Array";

mixin (
  accessControlState : AccessControl.AccessControlState,
  tradeState : TradeLib.State,
  txState : TxLib.State,
) {
  /// Returns the most recent 50 detected trades for the caller.
  public shared query ({ caller }) func getDetectedTrades() : async [Types.DetectedTradeView] {
    TradeLib.getDetectedTrades(tradeState, caller);
  };

  /// Stores a single detected trade for the caller.
  public shared ({ caller }) func storeDetectedTrade(
    tradeType : Types.TradeType,
    assetName : Text,
    assetClass : { #Stock; #ETF; #Crypto; #Bond; #Cash },
    amount : Float,
    price : Float,
    currency : Text,
    confidence : Float,
    rawText : Text,
    isDemo : Bool,
  ) : async Types.DetectedTradeView {
    let trade = TradeLib.storeDetectedTrade(
      tradeState, caller,
      tradeType, assetName, assetClass,
      amount, price, currency,
      confidence, rawText, isDemo,
      Time.now(),
    );
    {
      id = trade.id;
      owner = trade.owner;
      tradeType = trade.tradeType;
      assetName = trade.assetName;
      assetClass = trade.assetClass;
      amount = trade.amount;
      price = trade.price;
      currency = trade.currency;
      confidence = trade.confidence;
      rawText = trade.rawText;
      detectedAt = trade.detectedAt;
      isDemo = trade.isDemo;
    };
  };

  /// Clears all detected trades for the caller.
  public shared ({ caller }) func clearDetectedTrades() : async () {
    TradeLib.clearDetectedTrades(tradeState, caller);
  };

  /// Returns email scan settings for the caller (with defaults if not yet configured).
  public shared query ({ caller }) func getEmailScanSettings() : async Types.EmailScanSettings {
    TradeLib.getEmailScanSettings(tradeState, caller);
  };

  /// Updates email scan settings for the caller.
  public shared ({ caller }) func updateEmailScanSettings(
    args : Types.UpdateEmailScanSettingsArgs,
  ) : async Types.EmailScanSettings {
    TradeLib.updateEmailScanSettings(tradeState, caller, args);
  };

  /// Simulates an email scan: generates 2-3 realistic mock detected trades
  /// (buy/sell, stocks/crypto/bonds), stores them, and updates lastScanAt.
  public shared ({ caller }) func simulateEmailScan() : async [Types.DetectedTradeView] {
    let now = Time.now();
    let trades = TradeLib.generateMockTrades(tradeState, caller, now);
    TradeLib.setLastScanAt(tradeState, caller, now);
    trades.map<Types.DetectedTrade, Types.DetectedTradeView>(
      func(t : Types.DetectedTrade) : Types.DetectedTradeView {
        {
          id = t.id;
          owner = t.owner;
          tradeType = t.tradeType;
          assetName = t.assetName;
          assetClass = t.assetClass;
          amount = t.amount;
          price = t.price;
          currency = t.currency;
          confidence = t.confidence;
          rawText = t.rawText;
          detectedAt = t.detectedAt;
          isDemo = t.isDemo;
        };
      },
    );
  };

  /// Converts a detected trade into a real Investment transaction,
  /// then removes the detected trade entry.
  public shared ({ caller }) func convertDetectedTradeToTransaction(
    tradeId : Types.DetectedTradeId,
    accountId : Nat,
  ) : async { #ok : Nat; #err : Text } {
    switch (TradeLib.removeDetectedTrade(tradeState, caller, tradeId)) {
      case null { #err("Trade not found") };
      case (?trade) {
        // amount in smallest unit = floor(price * quantity * 100)
        let rawAmount = trade.price * trade.amount * 100.0;
        let amountNat = rawAmount.toInt().toNat();
        let tradeLabel = switch (trade.tradeType) {
          case (#Buy) "Buy";
          case (#Sell) "Sell";
        };
        let description = tradeLabel # " " # trade.assetName # " x" # debug_show(trade.amount);
        let view = TxLib.createTransaction(
          txState,
          caller,
          {
            date = trade.detectedAt;
            description;
            amount = amountNat;
            category = #Investment;
            accountId;
            isDemo = false;
          },
        );
        #ok(view.id);
      };
    };
  };
};
