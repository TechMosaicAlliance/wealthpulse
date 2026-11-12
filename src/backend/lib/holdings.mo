import List "mo:core/List";
import CommonTypes "../types/common";
import HoldingTypes "../types/holdings";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public type State = {
    holdings : List.List<HoldingTypes.Holding>;
    nextHoldingId : { var val : Nat };
  };

  public func newState() : State {
    {
      holdings = List.empty<HoldingTypes.Holding>();
      nextHoldingId = { var val = 0 };
    };
  };

  public func createHolding(
    state : State,
    owner : CommonTypes.UserId,
    args : HoldingTypes.CreateHoldingArgs,
  ) : HoldingTypes.HoldingView {
    let id = state.nextHoldingId.val;
    state.nextHoldingId.val += 1;
    let holding : HoldingTypes.Holding = {
      id;
      owner;
      assetId = args.assetId;
      accountId = args.accountId;
      var quantity = args.quantity;
      var purchasePrice = args.purchasePrice;
      purchaseDate = args.purchaseDate;
      isDemo = args.isDemo;
      createdAt = Time.now();
    };
    state.holdings.add(holding);
    toView(holding);
  };

  public func updateHolding(
    state : State,
    caller : CommonTypes.UserId,
    args : HoldingTypes.UpdateHoldingArgs,
  ) : ?HoldingTypes.HoldingView {
    var result : ?HoldingTypes.HoldingView = null;
    state.holdings.mapInPlace(
      func(h) {
        if (h.id == args.id and Principal.equal(h.owner, caller)) {
          h.quantity := args.quantity;
          h.purchasePrice := args.purchasePrice;
          result := ?toView(h);
          h;
        } else { h };
      }
    );
    result;
  };

  public func deleteHolding(
    state : State,
    caller : CommonTypes.UserId,
    id : CommonTypes.HoldingId,
  ) : Bool {
    let sizeBefore = state.holdings.size();
    let filtered = state.holdings.filter(func(h) { not (h.id == id and Principal.equal(h.owner, caller)) });
    state.holdings.clear();
    state.holdings.append(filtered);
    state.holdings.size() < sizeBefore;
  };

  public func getHoldings(
    state : State,
    caller : CommonTypes.UserId,
  ) : [HoldingTypes.HoldingView] {
    state.holdings
      .filter(func(h) { Principal.equal(h.owner, caller) })
      .map<HoldingTypes.Holding, HoldingTypes.HoldingView>(func(h) { toView(h) })
      .toArray();
  };

  public func toView(h : HoldingTypes.Holding) : HoldingTypes.HoldingView {
    {
      id = h.id;
      owner = h.owner;
      assetId = h.assetId;
      accountId = h.accountId;
      quantity = h.quantity;
      purchasePrice = h.purchasePrice;
      purchaseDate = h.purchaseDate;
      isDemo = h.isDemo;
      createdAt = h.createdAt;
    };
  };

  public func deleteDemoHoldings(state : State, owner : CommonTypes.UserId) {
    let filtered = state.holdings.filter(func(h) { not (h.isDemo and Principal.equal(h.owner, owner)) });
    state.holdings.clear();
    state.holdings.append(filtered);
  };
};
