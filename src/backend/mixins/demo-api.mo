import AccessControl "mo:caffeineai-authorization/access-control";
import AccountsLib "../lib/accounts";
import AssetsLib "../lib/assets";
import HoldingsLib "../lib/holdings";
import TransactionsLib "../lib/transactions";
import PortfolioLib "../lib/portfolio";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import DemoLib "../lib/demo";

mixin (
  accessControlState : AccessControl.AccessControlState,
  accountState : AccountsLib.State,
  assetState : AssetsLib.State,
  holdingState : HoldingsLib.State,
  txState : TransactionsLib.State,
  historyState : PortfolioLib.HistoryState,
) {
  public shared ({ caller }) func loadDemoData() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    DemoLib.loadDemoData(
      caller,
      accountState,
      assetState,
      holdingState,
      txState,
      historyState,
      Time.now(),
    );
  };

  public shared ({ caller }) func clearDemoData() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    DemoLib.clearDemoData(
      caller,
      accountState,
      assetState,
      holdingState,
      txState,
      historyState,
    );
  };
};
