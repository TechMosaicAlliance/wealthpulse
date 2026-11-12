import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import CommonTypes "../types/common";
import PortfolioTypes "../types/portfolio";
import AssetTypes "../types/assets";
import HoldingTypes "../types/holdings";
import TxTypes "../types/transactions";
import AccountsLib "accounts";
import AssetsLib "assets";
import HoldingsLib "holdings";

module {
  // State slice for net-worth history and demo flags, keyed by principal
  public type HistoryState = {
    netWorthHistory : Map.Map<CommonTypes.UserId, List.List<PortfolioTypes.NetWorthSnapshot>>;
    demoState : Map.Map<CommonTypes.UserId, PortfolioTypes.DemoState>;
  };

  public func newHistoryState() : HistoryState {
    {
      netWorthHistory = Map.empty<CommonTypes.UserId, List.List<PortfolioTypes.NetWorthSnapshot>>();
      demoState = Map.empty<CommonTypes.UserId, PortfolioTypes.DemoState>();
    };
  };

  public func calculateNetWorth(
    caller : CommonTypes.UserId,
    accountState : AccountsLib.State,
    assetState : AssetsLib.State,
    holdingState : HoldingsLib.State,
  ) : PortfolioTypes.NetWorthResult {
    let rate = assetState.exchangeRate.rateNgnPerUsd;
    // Sum liquid account balances (balance in kobo/cents = 1/100 of base currency)
    var liquidBalanceNgn : Float = 0.0;
    accountState.accounts.forEach(
      func(a) {
        if (Principal.equal(a.owner, caller) and a.accountType == #Liquid) {
          let balBase = a.balance.toFloat() / 100.0;
          if (a.currency == "NGN") {
            liquidBalanceNgn += balBase;
          } else {
            // USD account — convert to NGN
            liquidBalanceNgn += balBase * rate;
          };
        };
      }
    );
    // Sum holdings valued at latest cached prices (in USD)
    var holdingsValueUsd : Float = 0.0;
    holdingState.holdings.forEach(
      func(h) {
        if (Principal.equal(h.owner, caller)) {
          switch (assetState.assets.find(func(a) { a.id == h.assetId })) {
            case null {};
            case (?asset) {
              let priceUsd = switch (assetState.priceCache.get(asset.ticker)) {
                case null h.purchasePrice;
                case (?pe) pe.price;
              };
              holdingsValueUsd += h.quantity * priceUsd;
            };
          };
        };
      }
    );
    let holdingsValueNgn = holdingsValueUsd * rate;
    let totalNgn = liquidBalanceNgn + holdingsValueNgn;
    let totalUsd = if (rate > 0.0) { totalNgn / rate } else { 0.0 };
    { liquidBalanceNgn; holdingsValueUsd; holdingsValueNgn; totalNgn; totalUsd; exchangeRateNgnPerUsd = rate };
  };

  public func getPassiveIncome(
    caller : CommonTypes.UserId,
    assetState : AssetsLib.State,
    holdingState : HoldingsLib.State,
    txState : { transactions : List.List<TxTypes.Transaction>; nextTxId : { var val : Nat } },
    currentYear : Int,
  ) : [PortfolioTypes.PassiveIncomeEntry] {
    let rate = assetState.exchangeRate.rateNgnPerUsd;
    // nanoseconds per year
    let nsPerYear : Int = 31_536_000_000_000_000;
    let yearStart : Int = currentYear * nsPerYear;
    let yearEnd : Int = yearStart + nsPerYear;
    let result = List.empty<PortfolioTypes.PassiveIncomeEntry>();
    assetState.assets.forEach(
      func(asset) {
        if (Principal.equal(asset.owner, caller) and asset.expectedYieldPct > 0.0) {
          var totalQty : Float = 0.0;
          holdingState.holdings.forEach(
            func(h) {
              if (Principal.equal(h.owner, caller) and h.assetId == asset.id) {
                totalQty += h.quantity;
              };
            }
          );
          let currentPriceUsd = switch (assetState.priceCache.get(asset.ticker)) {
            case null 0.0;
            case (?pe) pe.price;
          };
          let currentValueUsd = totalQty * currentPriceUsd;
          let annualExpectedUsd = currentValueUsd * asset.expectedYieldPct / 100.0;
          let monthlyExpectedUsd = annualExpectedUsd / 12.0;
          // Sum Dividend/Interest transactions YTD
          var receivedYtdUsd : Float = 0.0;
          txState.transactions.forEach(
            func(t) {
              if (
                Principal.equal(t.owner, caller) and
                t.date >= yearStart and t.date < yearEnd and
                (t.category == #Dividend or t.category == #Interest)
              ) {
                receivedYtdUsd += t.amount.toFloat() / 100.0 / rate;
              };
            }
          );
          result.add({
            assetId = asset.id;
            assetName = asset.name;
            ticker = asset.ticker;
            expectedYieldPct = asset.expectedYieldPct;
            currentValueUsd;
            annualExpectedUsd;
            monthlyExpectedUsd;
            receivedYtdUsd;
          });
        };
      }
    );
    result.toArray();
  };

  public func getRiskBalance(
    caller : CommonTypes.UserId,
    assetState : AssetsLib.State,
    holdingState : HoldingsLib.State,
  ) : PortfolioTypes.RiskBalance {
    var growthValueUsd : Float = 0.0;
    var fortressValueUsd : Float = 0.0;
    holdingState.holdings.forEach(
      func(h) {
        if (Principal.equal(h.owner, caller)) {
          switch (assetState.assets.find(func(a) { a.id == h.assetId })) {
            case null {};
            case (?asset) {
              let priceUsd = switch (assetState.priceCache.get(asset.ticker)) {
                case null h.purchasePrice;
                case (?pe) pe.price;
              };
              let valueUsd = h.quantity * priceUsd;
              if (asset.isFortress) {
                fortressValueUsd += valueUsd;
              } else {
                growthValueUsd += valueUsd;
              };
            };
          };
        };
      }
    );
    let totalValueUsd = growthValueUsd + fortressValueUsd;
    let growthPct = if (totalValueUsd > 0.0) { growthValueUsd / totalValueUsd * 100.0 } else { 0.0 };
    { growthValueUsd; fortressValueUsd; totalValueUsd; growthPct; isAggressive = growthPct > 70.0 };
  };

  public func recordNetWorthSnapshot(
    historyState : HistoryState,
    caller : CommonTypes.UserId,
    snapshot : PortfolioTypes.NetWorthSnapshot,
  ) {
    switch (historyState.netWorthHistory.get(caller)) {
      case null {
        let snapshotList = List.singleton<PortfolioTypes.NetWorthSnapshot>(snapshot);
        historyState.netWorthHistory.add(caller, snapshotList);
      };
      case (?snapshotList) {
        snapshotList.add(snapshot);
      };
    };
  };

  public func getNetWorthHistory(
    historyState : HistoryState,
    caller : CommonTypes.UserId,
  ) : [PortfolioTypes.NetWorthSnapshot] {
    switch (historyState.netWorthHistory.get(caller)) {
      case null [];
      case (?snapshotList) snapshotList.toArray();
    };
  };

  public func isDemoLoaded(
    historyState : HistoryState,
    caller : CommonTypes.UserId,
  ) : Bool {
    switch (historyState.demoState.get(caller)) {
      case null false;
      case (?ds) ds.isDemo;
    };
  };

  public func setDemoLoaded(
    historyState : HistoryState,
    caller : CommonTypes.UserId,
    loaded : Bool,
    loadedAt : CommonTypes.Timestamp,
  ) {
    switch (historyState.demoState.get(caller)) {
      case null {
        historyState.demoState.add(caller, { var isDemo = loaded; var demoLoadedAt = loadedAt });
      };
      case (?ds) {
        ds.isDemo := loaded;
        ds.demoLoadedAt := loadedAt;
      };
    };
  };
};
