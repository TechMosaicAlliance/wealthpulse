import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import AccountsLib "lib/accounts";
import AssetsLib "lib/assets";
import HoldingsLib "lib/holdings";
import TransactionsLib "lib/transactions";
import PortfolioLib "lib/portfolio";
import AccountsApi "mixins/accounts-api";
import AssetsApi "mixins/assets-api";
import HoldingsApi "mixins/holdings-api";
import TransactionsApi "mixins/transactions-api";
import PortfolioApi "mixins/portfolio-api";
import DemoApi "mixins/demo-api";
import PricesApi "mixins/prices-api";
import TradeDetectionLib "lib/ai-trade-detection";
import TradeDetectionApi "mixins/ai-trade-detection-api";

actor {
  // --- Authorization ---
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Domain state ---
  let accountState = AccountsLib.newState();
  let assetState = AssetsLib.newState();
  let holdingState = HoldingsLib.newState();
  let txState = TransactionsLib.newState();
  let historyState = PortfolioLib.newHistoryState();
  let tradeDetectionState = TradeDetectionLib.newState();

  // --- Domain mixins ---
  include AccountsApi(accessControlState, accountState);
  include AssetsApi(accessControlState, assetState);
  include HoldingsApi(accessControlState, holdingState);
  include TransactionsApi(accessControlState, txState);
  include PortfolioApi(
    accessControlState,
    accountState,
    assetState,
    holdingState,
    txState,
    historyState,
  );
  include DemoApi(
    accessControlState,
    accountState,
    assetState,
    holdingState,
    txState,
    historyState,
  );
  include PricesApi(accessControlState, assetState);
  include TradeDetectionApi(accessControlState, tradeDetectionState, txState);
};
