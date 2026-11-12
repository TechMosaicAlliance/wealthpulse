import AccessControl "mo:caffeineai-authorization/access-control";
import AssetTypes "../types/assets";
import CommonTypes "../types/common";
import AssetsLib "../lib/assets";

mixin (
  accessControlState : AccessControl.AccessControlState,
  assetState : AssetsLib.State,
) {
  public shared ({ caller }) func createAsset(
    args : AssetTypes.CreateAssetArgs
  ) : async AssetTypes.AssetView {
    AssetsLib.createAsset(assetState, caller, args);
  };

  public shared ({ caller }) func updateAsset(
    args : AssetTypes.UpdateAssetArgs
  ) : async ?AssetTypes.AssetView {
    AssetsLib.updateAsset(assetState, caller, args);
  };

  public shared ({ caller }) func deleteAsset(
    id : CommonTypes.AssetId
  ) : async Bool {
    AssetsLib.deleteAsset(assetState, caller, id);
  };

  public query ({ caller }) func getAssets() : async [AssetTypes.AssetView] {
    AssetsLib.getAssets(assetState, caller);
  };

  public query ({ caller }) func getPriceCache(
    ticker : Text
  ) : async ?AssetTypes.PriceEntryView {
    AssetsLib.getPrice(assetState, ticker);
  };

  public query ({ caller }) func getExchangeRate() : async Float {
    AssetsLib.getExchangeRate(assetState);
  };
};
