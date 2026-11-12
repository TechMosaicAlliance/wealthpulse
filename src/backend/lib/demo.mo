import List "mo:core/List";
import Principal "mo:core/Principal";
import CommonTypes "../types/common";
import AccountsLib "accounts";
import AssetsLib "assets";
import HoldingsLib "holdings";
import TransactionsLib "transactions";
import PortfolioLib "portfolio";
import PortfolioTypes "../types/portfolio";

module {
  /// Seeds a $50k demo portfolio for the given principal.
  /// Includes: AAPL stock, DANGCEM NGX stock, BTC, ETH,
  /// NGN savings/investment accounts, and 5+ tagged transactions,
  /// plus 12-month net worth history snapshots.
  public func loadDemoData(
    caller : CommonTypes.UserId,
    accountState : AccountsLib.State,
    assetState : AssetsLib.State,
    holdingState : HoldingsLib.State,
    txState : TransactionsLib.State,
    historyState : PortfolioLib.HistoryState,
    now : Int,
  ) {
    // ─── Accounts ───────────────────────────────────────────────────────
    // Savings (NGN, Liquid) – ₦10,000,000 (~$6,667 @ 1500)
    let savingsAccId = accountState.nextAccountId.val;
    accountState.nextAccountId.val += 1;
    accountState.accounts.add({
      id = savingsAccId;
      owner = caller;
      name = "Zenith Bank Savings";
      accountType = #Liquid;
      institution = "Zenith Bank";
      var balance = 1_000_000_00; // kobo: ₦10,000,000.00
      currency = "NGN";
      isDemo = true;
      createdAt = now;
    });

    // Brokerage (USD, Investment) – $30,000 => stored in cents
    let brokerageAccId = accountState.nextAccountId.val;
    accountState.nextAccountId.val += 1;
    accountState.accounts.add({
      id = brokerageAccId;
      owner = caller;
      name = "Trove Brokerage";
      accountType = #Investment;
      institution = "Trove";
      var balance = 3_000_000; // cents: $30,000.00
      currency = "USD";
      isDemo = true;
      createdAt = now;
    });

    // Crypto wallet (USD, Investment) – $10,000
    let cryptoAccId = accountState.nextAccountId.val;
    accountState.nextAccountId.val += 1;
    accountState.accounts.add({
      id = cryptoAccId;
      owner = caller;
      name = "Binance Wallet";
      accountType = #Investment;
      institution = "Binance";
      var balance = 1_000_000; // cents: $10,000.00
      currency = "USD";
      isDemo = true;
      createdAt = now;
    });

    // ─── Assets ─────────────────────────────────────────────────────────
    // AAPL – Growth stock
    let aaplId = assetState.nextAssetId.val;
    assetState.nextAssetId.val += 1;
    assetState.assets.add({
      id = aaplId;
      owner = caller;
      ticker = "AAPL";
      name = "Apple Inc.";
      assetClass = #Stock;
      isFortress = false;
      expectedYieldPct = 0.5;
      linkedAccountId = ?brokerageAccId;
      isDemo = true;
      createdAt = now;
    });

    // DANGCEM – NGX stock (Fortress – stable blue-chip)
    let dangcemId = assetState.nextAssetId.val;
    assetState.nextAssetId.val += 1;
    assetState.assets.add({
      id = dangcemId;
      owner = caller;
      ticker = "DANGCEM";
      name = "Dangote Cement Plc";
      assetClass = #Stock;
      isFortress = true;
      expectedYieldPct = 6.0;
      linkedAccountId = ?brokerageAccId;
      isDemo = true;
      createdAt = now;
    });

    // BTC – Growth crypto
    let btcId = assetState.nextAssetId.val;
    assetState.nextAssetId.val += 1;
    assetState.assets.add({
      id = btcId;
      owner = caller;
      ticker = "BTC";
      name = "Bitcoin";
      assetClass = #Crypto;
      isFortress = false;
      expectedYieldPct = 0.0;
      linkedAccountId = ?cryptoAccId;
      isDemo = true;
      createdAt = now;
    });

    // ETH – Growth crypto
    let ethId = assetState.nextAssetId.val;
    assetState.nextAssetId.val += 1;
    assetState.assets.add({
      id = ethId;
      owner = caller;
      ticker = "ETH";
      name = "Ethereum";
      assetClass = #Crypto;
      isFortress = false;
      expectedYieldPct = 0.0;
      linkedAccountId = ?cryptoAccId;
      isDemo = true;
      createdAt = now;
    });

    // High-Yield Savings (Cash, Fortress)
    let hysaId = assetState.nextAssetId.val;
    assetState.nextAssetId.val += 1;
    assetState.assets.add({
      id = hysaId;
      owner = caller;
      ticker = "HYSA-NGN";
      name = "High-Yield Savings";
      assetClass = #Cash;
      isFortress = true;
      expectedYieldPct = 12.5;
      linkedAccountId = ?savingsAccId;
      isDemo = true;
      createdAt = now;
    });

    // ─── Holdings ────────────────────────────────────────────────────────
    // AAPL: 50 shares @ $175
    let aaplHoldingId = holdingState.nextHoldingId.val;
    holdingState.nextHoldingId.val += 1;
    holdingState.holdings.add({
      id = aaplHoldingId;
      owner = caller;
      assetId = aaplId;
      accountId = brokerageAccId;
      var quantity = 50.0;
      var purchasePrice = 175.0;
      purchaseDate = now - 15_552_000_000_000_000; // ~6 months ago
      isDemo = true;
      createdAt = now;
    });

    // DANGCEM: 1000 shares @ ₦700 (price in USD equiv: ~$0.47)
    let dangcemHoldingId = holdingState.nextHoldingId.val;
    holdingState.nextHoldingId.val += 1;
    holdingState.holdings.add({
      id = dangcemHoldingId;
      owner = caller;
      assetId = dangcemId;
      accountId = brokerageAccId;
      var quantity = 1000.0;
      var purchasePrice = 0.47;
      purchaseDate = now - 31_104_000_000_000_000; // ~12 months ago
      isDemo = true;
      createdAt = now;
    });

    // BTC: 0.12 BTC @ $42,000
    let btcHoldingId = holdingState.nextHoldingId.val;
    holdingState.nextHoldingId.val += 1;
    holdingState.holdings.add({
      id = btcHoldingId;
      owner = caller;
      assetId = btcId;
      accountId = cryptoAccId;
      var quantity = 0.12;
      var purchasePrice = 42_000.0;
      purchaseDate = now - 23_328_000_000_000_000; // ~9 months ago
      isDemo = true;
      createdAt = now;
    });

    // ETH: 2.5 ETH @ $2,200
    let ethHoldingId = holdingState.nextHoldingId.val;
    holdingState.nextHoldingId.val += 1;
    holdingState.holdings.add({
      id = ethHoldingId;
      owner = caller;
      assetId = ethId;
      accountId = cryptoAccId;
      var quantity = 2.5;
      var purchasePrice = 2_200.0;
      purchaseDate = now - 7_776_000_000_000_000; // ~3 months ago
      isDemo = true;
      createdAt = now;
    });

    // Seed price cache with demo prices
    assetState.priceCache.add("AAPL", { var price = 192.5; var updatedAt = now; currency = "USD" });
    assetState.priceCache.add("DANGCEM", { var price = 0.52; var updatedAt = now; currency = "USD" });
    assetState.priceCache.add("BTC", { var price = 67_000.0; var updatedAt = now; currency = "USD" });
    assetState.priceCache.add("ETH", { var price = 3_500.0; var updatedAt = now; currency = "USD" });
    assetState.priceCache.add("HYSA-NGN", { var price = 0.0; var updatedAt = now; currency = "USD" });
    // Set exchange rate: 1 USD = 1,550 NGN
    assetState.exchangeRate.rateNgnPerUsd := 1_550.0;
    assetState.exchangeRate.updatedAt := now;

    // ─── Transactions ────────────────────────────────────────────────────
    let monthNs : Int = 2_592_000_000_000_000;
    let txData : [(Int, Text, Nat, CommonTypes.TransactionCategory, CommonTypes.AccountId)] = [
      (now - 1 * monthNs, "AAPL Dividend Q1", 8_750, #Dividend, brokerageAccId),
      (now - 2 * monthNs, "DANGCEM Annual Dividend", 50_000_00, #Dividend, brokerageAccId),
      (now - 3 * monthNs, "Zenith HY Savings Interest", 125_000_00, #Interest, savingsAccId),
      (now - 1 * monthNs, "Netflix Subscription", 5_000_00, #Expense, savingsAccId),
      (now - 2 * monthNs, "Freelance Invoice Payment", 350_000_00, #Income, savingsAccId),
      (now - 3 * monthNs, "BTC Purchase", 5_040_00, #Investment, cryptoAccId),
      (now - 4 * monthNs, "ETH Purchase", 5_500_00, #Investment, cryptoAccId),
      (now - 5 * monthNs, "Transfer to Trove", 1_500_000_00, #Transfer, savingsAccId),
    ];
    for ((date, description, amount, category, accountId) in txData.vals()) {
      let txId = txState.nextTxId.val;
      txState.nextTxId.val += 1;
      txState.transactions.add({
        id = txId;
        owner = caller;
        date;
        description;
        amount;
        category;
        accountId;
        isDemo = true;
        createdAt = now;
      });
    };

    // ─── 12-month Net Worth history snapshots ───────────────────────────
    let historyList = List.empty<PortfolioTypes.NetWorthSnapshot>();
    let baseNgn : Float = 40_000_000.0;
    let growthPerMonth : Float = 1_000_000.0;
    let rate : Float = 1_550.0;
    for (i in List.tabulate<Nat>(12, func(n) { n }).values()) {
      let monthOffset : Int = (11 - i) * monthNs;
      let totalNgn = baseNgn + growthPerMonth * i.toFloat();
      historyList.add({
        timestamp = now - monthOffset;
        totalValueNgn = totalNgn;
        totalValueUsd = totalNgn / rate;
        isDemo = true;
      });
    };
    historyState.netWorthHistory.add(caller, historyList);

    // Mark demo loaded
    PortfolioLib.setDemoLoaded(historyState, caller, true, now);
  };

  /// Removes all records flagged isDemo=true for this principal.
  public func clearDemoData(
    caller : CommonTypes.UserId,
    accountState : AccountsLib.State,
    assetState : AssetsLib.State,
    holdingState : HoldingsLib.State,
    txState : TransactionsLib.State,
    historyState : PortfolioLib.HistoryState,
  ) {
    AccountsLib.deleteDemoAccounts(accountState, caller);
    AssetsLib.deleteDemoAssets(assetState, caller);
    HoldingsLib.deleteDemoHoldings(holdingState, caller);
    TransactionsLib.deleteDemoTransactions(txState, caller);
    // Clear demo price cache entries only if no real assets use same tickers
    let demoTickers = ["AAPL", "DANGCEM", "BTC", "ETH", "HYSA-NGN"];
    for (ticker in demoTickers.vals()) {
      let hasRealAsset = assetState.assets.any(
        func(a) { a.ticker == ticker and Principal.equal(a.owner, caller) and not a.isDemo }
      );
      if (not hasRealAsset) {
        assetState.priceCache.remove(ticker);
      };
    };
    // Clear demo snapshots
    switch (historyState.netWorthHistory.get(caller)) {
      case null {};
      case (?snapshots) {
        let filtered = snapshots.filter(func(s) { not s.isDemo });
        snapshots.clear();
        snapshots.append(filtered);
      };
    };
    PortfolioLib.setDemoLoaded(historyState, caller, false, 0);
  };
};
