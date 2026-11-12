import CommonTypes "common";

module {
  public type Holding = {
    id : CommonTypes.HoldingId;
    owner : CommonTypes.UserId;
    assetId : CommonTypes.AssetId;
    accountId : CommonTypes.AccountId;
    var quantity : Float;
    var purchasePrice : Float; // price per unit at purchase time
    purchaseDate : CommonTypes.Timestamp;
    isDemo : Bool;
    createdAt : CommonTypes.Timestamp;
  };

  public type HoldingView = {
    id : CommonTypes.HoldingId;
    owner : CommonTypes.UserId;
    assetId : CommonTypes.AssetId;
    accountId : CommonTypes.AccountId;
    quantity : Float;
    purchasePrice : Float;
    purchaseDate : CommonTypes.Timestamp;
    isDemo : Bool;
    createdAt : CommonTypes.Timestamp;
  };

  public type CreateHoldingArgs = {
    assetId : CommonTypes.AssetId;
    accountId : CommonTypes.AccountId;
    quantity : Float;
    purchasePrice : Float;
    purchaseDate : CommonTypes.Timestamp;
    isDemo : Bool;
  };

  public type UpdateHoldingArgs = {
    id : CommonTypes.HoldingId;
    quantity : Float;
    purchasePrice : Float;
    purchaseDate : CommonTypes.Timestamp;
  };
};
