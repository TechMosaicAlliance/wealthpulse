import List "mo:core/List";
import Map "mo:core/Map";
import CommonTypes "../types/common";
import AssetTypes "../types/assets";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public type State = {
    assets : List.List<AssetTypes.Asset>;
    nextAssetId : { var val : Nat };
    priceCache : Map.Map<Text, AssetTypes.PriceEntry>; // ticker -> price
    exchangeRate : AssetTypes.ExchangeRate;
  };

  public func newState() : State {
    {
      assets = List.empty<AssetTypes.Asset>();
      nextAssetId = { var val = 0 };
      priceCache = Map.empty<Text, AssetTypes.PriceEntry>();
      exchangeRate = { var rateNgnPerUsd = 1500.0; var updatedAt = 0 };
    };
  };

  public func createAsset(
    state : State,
    owner : CommonTypes.UserId,
    args : AssetTypes.CreateAssetArgs,
  ) : AssetTypes.AssetView {
    let id = state.nextAssetId.val;
    state.nextAssetId.val += 1;
    let asset : AssetTypes.Asset = {
      id;
      owner;
      ticker = args.ticker;
      name = args.name;
      assetClass = args.assetClass;
      isFortress = args.isFortress;
      expectedYieldPct = args.expectedYieldPct;
      linkedAccountId = args.linkedAccountId;
      isDemo = args.isDemo;
      createdAt = Time.now();
    };
    state.assets.add(asset);
    toView(asset);
  };

  public func updateAsset(
    state : State,
    caller : CommonTypes.UserId,
    args : AssetTypes.UpdateAssetArgs,
  ) : ?AssetTypes.AssetView {
    var result : ?AssetTypes.AssetView = null;
    state.assets.mapInPlace(
      func(a) {
        if (a.id == args.id and Principal.equal(a.owner, caller)) {
          let updated = { a with
            ticker = args.ticker;
            name = args.name;
            assetClass = args.assetClass;
            isFortress = args.isFortress;
            expectedYieldPct = args.expectedYieldPct;
            linkedAccountId = args.linkedAccountId;
          };
          result := ?toView(updated);
          updated;
        } else { a };
      }
    );
    result;
  };

  public func deleteAsset(
    state : State,
    caller : CommonTypes.UserId,
    id : CommonTypes.AssetId,
  ) : Bool {
    let sizeBefore = state.assets.size();
    let filtered = state.assets.filter(func(a) { not (a.id == id and Principal.equal(a.owner, caller)) });
    state.assets.clear();
    state.assets.append(filtered);
    state.assets.size() < sizeBefore;
  };

  public func getAssets(
    state : State,
    caller : CommonTypes.UserId,
  ) : [AssetTypes.AssetView] {
    state.assets
      .filter(func(a) { Principal.equal(a.owner, caller) })
      .map<AssetTypes.Asset, AssetTypes.AssetView>(func(a) { toView(a) })
      .toArray();
  };

  public func toView(a : AssetTypes.Asset) : AssetTypes.AssetView {
    {
      id = a.id;
      owner = a.owner;
      ticker = a.ticker;
      name = a.name;
      assetClass = a.assetClass;
      isFortress = a.isFortress;
      expectedYieldPct = a.expectedYieldPct;
      linkedAccountId = a.linkedAccountId;
      isDemo = a.isDemo;
      createdAt = a.createdAt;
    };
  };

  public func upsertPrice(
    state : State,
    ticker : Text,
    price : Float,
    currency : Text,
    updatedAt : Int,
  ) {
    switch (state.priceCache.get(ticker)) {
      case (?entry) {
        entry.price := price;
        entry.updatedAt := updatedAt;
      };
      case null {
        state.priceCache.add(ticker, { var price; var updatedAt; currency });
      };
    };
  };

  public func getPrice(state : State, ticker : Text) : ?AssetTypes.PriceEntryView {
    switch (state.priceCache.get(ticker)) {
      case null null;
      case (?entry) ?{ price = entry.price; updatedAt = entry.updatedAt; currency = entry.currency };
    };
  };

  public func updateExchangeRate(state : State, rateNgnPerUsd : Float, updatedAt : Int) {
    state.exchangeRate.rateNgnPerUsd := rateNgnPerUsd;
    state.exchangeRate.updatedAt := updatedAt;
  };

  public func getExchangeRate(state : State) : Float {
    state.exchangeRate.rateNgnPerUsd;
  };

  public func deleteDemoAssets(state : State, owner : CommonTypes.UserId) {
    let filtered = state.assets.filter(func(a) { not (a.isDemo and Principal.equal(a.owner, owner)) });
    state.assets.clear();
    state.assets.append(filtered);
  };
};
