import CommonTypes "common";

module {
  public type DetectedTradeId = Nat;

  public type TradeType = {
    #Buy;
    #Sell;
  };

  public type DetectedTrade = {
    id : DetectedTradeId;
    owner : CommonTypes.UserId;
    tradeType : TradeType;
    assetName : Text;
    assetClass : CommonTypes.AssetClass;
    amount : Float;
    price : Float;
    currency : Text;
    confidence : Float; // 0.0 - 1.0
    rawText : Text;
    detectedAt : CommonTypes.Timestamp;
    isDemo : Bool;
  };

  public type DetectedTradeView = {
    id : DetectedTradeId;
    owner : CommonTypes.UserId;
    tradeType : TradeType;
    assetName : Text;
    assetClass : CommonTypes.AssetClass;
    amount : Float;
    price : Float;
    currency : Text;
    confidence : Float;
    rawText : Text;
    detectedAt : CommonTypes.Timestamp;
    isDemo : Bool;
  };

  public type EmailScanSettings = {
    scanIntervalMinutes : Nat;
    lastScanAt : ?CommonTypes.Timestamp;
    isEnabled : Bool;
  };

  public type UpdateEmailScanSettingsArgs = {
    scanIntervalMinutes : Nat;
    isEnabled : Bool;
  };
};
