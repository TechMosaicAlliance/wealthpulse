import OutCall "mo:caffeineai-http-outcalls/outcall";
import AssetsLib "assets";
import Time "mo:core/Time";

module {
  /// Fetches current stock/ETF price from Twelve Data API.
  /// Returns raw JSON string — parse on the frontend.
  public func fetchStockPrice(ticker : Text, transform : OutCall.Transform) : async Text {
    let url = "https://api.twelvedata.com/price?symbol=" # ticker # "&format=JSON";
    await OutCall.httpGetRequest(url, [], transform);
  };

  /// Fetches current crypto price from CoinGecko API.
  /// coinId is the CoinGecko coin identifier (e.g., "bitcoin", "ethereum").
  public func fetchCryptoPrice(coinId : Text, transform : OutCall.Transform) : async Text {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=" # coinId # "&vs_currencies=usd";
    await OutCall.httpGetRequest(url, [], transform);
  };

  /// Fetches the current NGN/USD exchange rate.
  public func fetchExchangeRate(transform : OutCall.Transform) : async Text {
    let url = "https://open.er-api.com/v6/latest/USD";
    await OutCall.httpGetRequest(url, [], transform);
  };
};
