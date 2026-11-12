import CommonTypes "common";

module {
  public type Account = {
    id : CommonTypes.AccountId;
    owner : CommonTypes.UserId;
    name : Text;
    accountType : CommonTypes.AccountType;
    institution : Text;
    var balance : Nat; // in smallest currency unit (kobo for NGN, cents for USD)
    currency : Text;   // "NGN" or "USD"
    isDemo : Bool;
    createdAt : CommonTypes.Timestamp;
  };

  // Shared (immutable) version for API boundary
  public type AccountView = {
    id : CommonTypes.AccountId;
    owner : CommonTypes.UserId;
    name : Text;
    accountType : CommonTypes.AccountType;
    institution : Text;
    balance : Nat;
    currency : Text;
    isDemo : Bool;
    createdAt : CommonTypes.Timestamp;
  };

  public type CreateAccountArgs = {
    name : Text;
    accountType : CommonTypes.AccountType;
    institution : Text;
    balance : Nat;
    currency : Text;
    isDemo : Bool;
  };

  public type UpdateAccountArgs = {
    id : CommonTypes.AccountId;
    name : Text;
    institution : Text;
    balance : Nat;
    currency : Text;
  };
};
