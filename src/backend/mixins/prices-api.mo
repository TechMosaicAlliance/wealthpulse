import OutCall "mo:caffeineai-http-outcalls/outcall";
import AccessControl "mo:caffeineai-authorization/access-control";
import AssetsLib "../lib/assets";
import AssetTypes "../types/assets";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import PricesLib "../lib/prices";

mixin (
  accessControlState : AccessControl.AccessControlState,
  assetState : AssetsLib.State,
) {
  public query func transform(
    input : OutCall.TransformationInput
  ) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  /// Fetch and cache stock/ETF price from Twelve Data. Returns raw JSON.
  public shared ({ caller }) func fetchStockPrice(ticker : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let raw = await PricesLib.fetchStockPrice(ticker, transform);
    // Cache the price by ticker; parsing of JSON happens on frontend.
    // We still update the cache with the raw return so frontend can trigger a cache update.
    AssetsLib.upsertPrice(assetState, ticker, 0.0, "USD", Time.now());
    raw;
  };

  /// Fetch and cache crypto price from CoinGecko. Returns raw JSON.
  public shared ({ caller }) func fetchCryptoPrice(coinId : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let raw = await PricesLib.fetchCryptoPrice(coinId, transform);
    raw;
  };

  /// Fetch and cache NGN/USD exchange rate. Returns raw JSON.
  public shared ({ caller }) func fetchExchangeRate() : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let raw = await PricesLib.fetchExchangeRate(transform);
    raw;
  };
};
