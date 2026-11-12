import AccessControl "mo:caffeineai-authorization/access-control";
import Time "mo:core/Time";
import PortfolioTypes "../types/portfolio";
import AccountsLib "../lib/accounts";
import AssetsLib "../lib/assets";
import HoldingsLib "../lib/holdings";
import TransactionsLib "../lib/transactions";
import PortfolioLib "../lib/portfolio";

mixin (
  accessControlState : AccessControl.AccessControlState,
  accountState : AccountsLib.State,
  assetState : AssetsLib.State,
  holdingState : HoldingsLib.State,
  txState : TransactionsLib.State,
  historyState : PortfolioLib.HistoryState,
) {
  public query ({ caller }) func calculateNetWorth() : async PortfolioTypes.NetWorthResult {
    PortfolioLib.calculateNetWorth(caller, accountState, assetState, holdingState);
  };

  public query ({ caller }) func getPassiveIncome() : async [PortfolioTypes.PassiveIncomeEntry] {
    // currentYear in nanoseconds epoch — derive calendar year from Time.now()
    let nsPerYear : Int = 31_536_000_000_000_000;
    let currentYear : Int = Time.now() / nsPerYear;
    PortfolioLib.getPassiveIncome(caller, assetState, holdingState, txState, currentYear);
  };

  public query ({ caller }) func getRiskBalance() : async PortfolioTypes.RiskBalance {
    PortfolioLib.getRiskBalance(caller, assetState, holdingState);
  };

  public query ({ caller }) func getNetWorthHistory() : async [PortfolioTypes.NetWorthSnapshot] {
    PortfolioLib.getNetWorthHistory(historyState, caller);
  };

  public query ({ caller }) func isDemoLoaded() : async Bool {
    PortfolioLib.isDemoLoaded(historyState, caller);
  };

  public shared ({ caller }) func recordNetWorthSnapshot(
    snapshot : PortfolioTypes.NetWorthSnapshot
  ) : async () {
    PortfolioLib.recordNetWorthSnapshot(historyState, caller, snapshot);
  };
};
