import CommonTypes "common";

module {
  public type NetWorthSnapshot = {
    timestamp : CommonTypes.Timestamp;
    totalValueNgn : Float;
    totalValueUsd : Float;
    isDemo : Bool;
  };

  public type PassiveIncomeEntry = {
    assetId : CommonTypes.AssetId;
    assetName : Text;
    ticker : Text;
    expectedYieldPct : Float;
    currentValueUsd : Float;
    annualExpectedUsd : Float;
    monthlyExpectedUsd : Float;
    receivedYtdUsd : Float; // sum of Dividend/Interest transactions YTD
  };

  public type RiskBalance = {
    growthValueUsd : Float;
    fortressValueUsd : Float;
    totalValueUsd : Float;
    growthPct : Float;    // 0–100
    isAggressive : Bool;  // growthPct > 70
  };

  public type DemoState = {
    var isDemo : Bool;
    var demoLoadedAt : CommonTypes.Timestamp;
  };

  public type NetWorthResult = {
    liquidBalanceNgn : Float;
    holdingsValueUsd : Float;
    holdingsValueNgn : Float;
    totalNgn : Float;
    totalUsd : Float;
    exchangeRateNgnPerUsd : Float;
  };
};
