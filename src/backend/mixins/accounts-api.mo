import AccessControl "mo:caffeineai-authorization/access-control";
import AccountTypes "../types/accounts";
import CommonTypes "../types/common";
import AccountsLib "../lib/accounts";

mixin (
  accessControlState : AccessControl.AccessControlState,
  accountState : AccountsLib.State,
) {
  public shared ({ caller }) func createAccount(
    args : AccountTypes.CreateAccountArgs
  ) : async AccountTypes.AccountView {
    AccountsLib.createAccount(accountState, caller, args);
  };

  public shared ({ caller }) func updateAccount(
    args : AccountTypes.UpdateAccountArgs
  ) : async ?AccountTypes.AccountView {
    AccountsLib.updateAccount(accountState, caller, args);
  };

  public shared ({ caller }) func deleteAccount(
    id : CommonTypes.AccountId
  ) : async Bool {
    AccountsLib.deleteAccount(accountState, caller, id);
  };

  public query ({ caller }) func getAccounts() : async [AccountTypes.AccountView] {
    AccountsLib.getAccounts(accountState, caller);
  };
};
