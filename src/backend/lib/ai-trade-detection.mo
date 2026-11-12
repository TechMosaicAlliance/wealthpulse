import CommonTypes "../types/common";
import Types "../types/ai-trade-detection";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Float "mo:core/Float";

module {
  public type State = {
    trades : Map.Map<CommonTypes.UserId, List.List<Types.DetectedTrade>>;
    emailSettings : Map.Map<CommonTypes.UserId, Types.EmailScanSettings>;
    nextTradeId : { var val : Nat };
  };

  public func newState() : State {
    {
      trades = Map.empty<CommonTypes.UserId, List.List<Types.DetectedTrade>>();
      emailSettings = Map.empty<CommonTypes.UserId, Types.EmailScanSettings>();
      nextTradeId = { var val = 0 };
    };
  };

  func toView(t : Types.DetectedTrade) : Types.DetectedTradeView {
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
  };

  func getUserTrades(
    state : State,
    owner : CommonTypes.UserId,
  ) : List.List<Types.DetectedTrade> {
    switch (state.trades.get(owner)) {
      case (?list) list;
      case null {
        let list = List.empty<Types.DetectedTrade>();
        state.trades.add(owner, list);
        list;
      };
    };
  };

  public func getDetectedTrades(
    state : State,
    owner : CommonTypes.UserId,
  ) : [Types.DetectedTradeView] {
    let list = getUserTrades(state, owner);
    let size = list.size();
    let start : Nat = if (size > 50) { size - 50 } else { 0 };
    let views = list.map<Types.DetectedTrade, Types.DetectedTradeView>(func(t) { toView(t) }).toArray();
    views.sliceToArray(start, views.size());
  };

  public func storeDetectedTrade(
    state : State,
    owner : CommonTypes.UserId,
    tradeType : Types.TradeType,
    assetName : Text,
    assetClass : CommonTypes.AssetClass,
    amount : Float,
    price : Float,
    currency : Text,
    confidence : Float,
    rawText : Text,
    isDemo : Bool,
    detectedAt : CommonTypes.Timestamp,
  ) : Types.DetectedTrade {
    let id = state.nextTradeId.val;
    state.nextTradeId.val += 1;
    let trade : Types.DetectedTrade = {
      id;
      owner;
      tradeType;
      assetName;
      assetClass;
      amount;
      price;
      currency;
      confidence;
      rawText;
      detectedAt;
      isDemo;
    };
    let list = getUserTrades(state, owner);
    list.add(trade);
    trade;
  };

  public func clearDetectedTrades(
    state : State,
    owner : CommonTypes.UserId,
  ) : () {
    switch (state.trades.get(owner)) {
      case (?list) list.clear();
      case null {};
    };
  };

  public func getEmailScanSettings(
    state : State,
    owner : CommonTypes.UserId,
  ) : Types.EmailScanSettings {
    switch (state.emailSettings.get(owner)) {
      case (?settings) settings;
      case null {
        { scanIntervalMinutes = 60; lastScanAt = null; isEnabled = true };
      };
    };
  };

  public func updateEmailScanSettings(
    state : State,
    owner : CommonTypes.UserId,
    args : Types.UpdateEmailScanSettingsArgs,
  ) : Types.EmailScanSettings {
    let existing = getEmailScanSettings(state, owner);
    let updated : Types.EmailScanSettings = {
      existing with
      scanIntervalMinutes = args.scanIntervalMinutes;
      isEnabled = args.isEnabled;
    };
    state.emailSettings.add(owner, updated);
    updated;
  };

  public func setLastScanAt(
    state : State,
    owner : CommonTypes.UserId,
    scanAt : CommonTypes.Timestamp,
  ) : () {
    let existing = getEmailScanSettings(state, owner);
    let updated : Types.EmailScanSettings = {
      existing with
      lastScanAt = ?scanAt;
    };
    state.emailSettings.add(owner, updated);
  };

  public func generateMockTrades(
    state : State,
    owner : CommonTypes.UserId,
    now : CommonTypes.Timestamp,
  ) : [Types.DetectedTrade] {
    let templates : [(Types.TradeType, Text, CommonTypes.AssetClass, Float, Float, Text, Text)] = [
      (#Buy,  "AAPL",      #Stock,  10.0,   185.20, "USD", "Trade confirmation: Bought 10 shares AAPL at $185.20 on 2026-05-17"),
      (#Sell, "BTC",       #Crypto, 0.05,   67800.0, "USD", "Crypto trade alert: Sold 0.05 BTC at $67,800 on 2026-05-17"),
      (#Buy,  "ETH",       #Crypto, 1.5,    3420.0, "USD", "Crypto trade alert: Bought 1.5 ETH at $3,420 on 2026-05-17"),
      (#Buy,  "DANGCEM",   #Stock,  500.0,  340.5,  "NGN", "Trade confirmation: Bought 500 shares DANGCEM at \u{20a6}340.50 on 2026-05-17"),
      (#Buy,  "NGX Bonds", #Bond,   1.0,    500000.0, "NGN", "Investment confirmation: Purchased NGX Bond unit at \u{20a6}500,000 on 2026-05-17"),
    ];
    // Pick 2-3 trades using a deterministic selection based on the trade ID counter
    let startId = state.nextTradeId.val;
    let count : Nat = 2 + (startId % 2); // 2 or 3
    let result = List.empty<Types.DetectedTrade>();
    var i = 0;
    while (i < count) {
      let idx = (startId + i) % templates.size();
      let (tradeType, assetName, assetClass, amount, price, currency, rawText) = templates[idx];
      let trade = storeDetectedTrade(
        state, owner,
        tradeType, assetName, assetClass,
        amount, price, currency,
        0.92, rawText, false,
        now,
      );
      result.add(trade);
      i += 1;
    };
    result.toArray();
  };

  public func removeDetectedTrade(
    state : State,
    owner : CommonTypes.UserId,
    tradeId : Types.DetectedTradeId,
  ) : ?Types.DetectedTrade {
    switch (state.trades.get(owner)) {
      case null null;
      case (?list) {
        var found : ?Types.DetectedTrade = null;
        let filtered = list.filter(
          func(t : Types.DetectedTrade) : Bool {
            if (t.id == tradeId) { found := ?t; false } else { true };
          }
        );
        list.clear();
        list.append(filtered);
        found;
      };
    };
  };
};
