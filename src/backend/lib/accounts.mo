import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccountTypes "../types/accounts";
import CommonTypes "../types/common";

module {
  public type State = {
    accounts : List.List<AccountTypes.Account>;
    nextAccountId : { var val : Nat };
  };

  public func newState() : State {
    {
      accounts = List.empty<AccountTypes.Account>();
      nextAccountId = { var val = 0 };
    };
  };

  public func createAccount(
    state : State,
    owner : CommonTypes.UserId,
    args : AccountTypes.CreateAccountArgs,
  ) : AccountTypes.AccountView {
    let id = state.nextAccountId.val;
    state.nextAccountId.val += 1;
    let account : AccountTypes.Account = {
      id;
      owner;
      name = args.name;
      accountType = args.accountType;
      institution = args.institution;
      var balance = args.balance;
      currency = args.currency;
      isDemo = args.isDemo;
      createdAt = Time.now();
    };
    state.accounts.add(account);
    toView(account);
  };

  public func updateAccount(
    state : State,
    caller : CommonTypes.UserId,
    args : AccountTypes.UpdateAccountArgs,
  ) : ?AccountTypes.AccountView {
    switch (state.accounts.find(func(a) { a.id == args.id and Principal.equal(a.owner, caller) })) {
      case null null;
      case (?_account) {
        state.accounts.mapInPlace(
          func(a) {
            if (a.id == args.id and Principal.equal(a.owner, caller)) {
              {
                id = a.id;
                owner = a.owner;
                name = args.name;
                accountType = a.accountType;
                institution = args.institution;
                var balance = args.balance;
                currency = args.currency;
                isDemo = a.isDemo;
                createdAt = a.createdAt;
              };
            } else { a };
          }
        );
        switch (state.accounts.find(func(a) { a.id == args.id and Principal.equal(a.owner, caller) })) {
          case null null;
          case (?updated) ?toView(updated);
        };
      };
    };
  };

  public func deleteAccount(
    state : State,
    caller : CommonTypes.UserId,
    id : CommonTypes.AccountId,
  ) : Bool {
    let sizeBefore = state.accounts.size();
    let filtered = state.accounts.filter(func(a) { not (a.id == id and Principal.equal(a.owner, caller)) });
    state.accounts.clear();
    state.accounts.append(filtered);
    state.accounts.size() < sizeBefore;
  };

  public func getAccounts(
    state : State,
    caller : CommonTypes.UserId,
  ) : [AccountTypes.AccountView] {
    state.accounts
      .filter(func(a) { Principal.equal(a.owner, caller) })
      .map<AccountTypes.Account, AccountTypes.AccountView>(func(a) { toView(a) })
      .toArray();
  };

  public func toView(a : AccountTypes.Account) : AccountTypes.AccountView {
    {
      id = a.id;
      owner = a.owner;
      name = a.name;
      accountType = a.accountType;
      institution = a.institution;
      balance = a.balance;
      currency = a.currency;
      isDemo = a.isDemo;
      createdAt = a.createdAt;
    };
  };

  public func deleteDemoAccounts(
    state : State,
    owner : CommonTypes.UserId,
  ) {
    let filtered = state.accounts.filter(func(a) { not (a.isDemo and Principal.equal(a.owner, owner)) });
    state.accounts.clear();
    state.accounts.append(filtered);
  };
};
