import CommonTypes "common";

module {
  public type Asset = {
    id : CommonTypes.AssetId;
    owner : CommonTypes.UserId;
    ticker : Text;
    name : Text;
    assetClass : CommonTypes.AssetClass;
    isFortress : Bool;         // true = low-volatility Fortress, false = Growth
    expectedYieldPct : Float;  // e.g., 4.5 for 4.5%
    linkedAccountId : ?CommonTypes.AccountId;
    isDemo : Bool;
    createdAt : CommonTypes.Timestamp;
  };

  public type AssetView = {
    id : CommonTypes.AssetId;
    owner : CommonTypes.UserId;
    ticker : Text;
    name : Text;
    assetClass : CommonTypes.AssetClass;
    isFortress : Bool;
    expectedYieldPct : Float;
    linkedAccountId : ?CommonTypes.AccountId;
    isDemo : Bool;
    createdAt : CommonTypes.Timestamp;
  };

  public type CreateAssetArgs = {
    ticker : Text;
    name : Text;
    assetClass : CommonTypes.AssetClass;
    isFortress : Bool;
    expectedYieldPct : Float;
    linkedAccountId : ?CommonTypes.AccountId;
    isDemo : Bool;
  };

  public type UpdateAssetArgs = {
    id : CommonTypes.AssetId;
    ticker : Text;
    name : Text;
    assetClass : CommonTypes.AssetClass;
    isFortress : Bool;
    expectedYieldPct : Float;
    linkedAccountId : ?CommonTypes.AccountId;
  };

  public type PriceEntry = {
    var price : Float;
    var updatedAt : CommonTypes.Timestamp;
    currency : Text;
  };

  public type PriceEntryView = {
    price : Float;
    updatedAt : CommonTypes.Timestamp;
    currency : Text;
  };

  public type ExchangeRate = {
    var rateNgnPerUsd : Float; // e.g., 1500.0 means 1 USD = 1500 NGN
    var updatedAt : CommonTypes.Timestamp;
  };
};
