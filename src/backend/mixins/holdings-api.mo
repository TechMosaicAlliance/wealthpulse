import AccessControl "mo:caffeineai-authorization/access-control";
import HoldingTypes "../types/holdings";
import CommonTypes "../types/common";
import HoldingsLib "../lib/holdings";

mixin (
  accessControlState : AccessControl.AccessControlState,
  holdingState : HoldingsLib.State,
) {
  public shared ({ caller }) func createHolding(
    args : HoldingTypes.CreateHoldingArgs
  ) : async HoldingTypes.HoldingView {
    HoldingsLib.createHolding(holdingState, caller, args);
  };

  public shared ({ caller }) func updateHolding(
    args : HoldingTypes.UpdateHoldingArgs
  ) : async ?HoldingTypes.HoldingView {
    HoldingsLib.updateHolding(holdingState, caller, args);
  };

  public shared ({ caller }) func deleteHolding(
    id : CommonTypes.HoldingId
  ) : async Bool {
    HoldingsLib.deleteHolding(holdingState, caller, id);
  };

  public query ({ caller }) func getHoldings() : async [HoldingTypes.HoldingView] {
    HoldingsLib.getHoldings(holdingState, caller);
  };
};
