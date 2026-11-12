import CommonTypes "common";

module {
  public type Transaction = {
    id : CommonTypes.TransactionId;
    owner : CommonTypes.UserId;
    date : CommonTypes.Timestamp;
    description : Text;
    amount : Nat;  // in smallest currency unit
    category : CommonTypes.TransactionCategory;
    accountId : CommonTypes.AccountId;
    isDemo : Bool;
    createdAt : CommonTypes.Timestamp;
  };

  public type TransactionView = {
    id : CommonTypes.TransactionId;
    owner : CommonTypes.UserId;
    date : CommonTypes.Timestamp;
    description : Text;
    amount : Nat;
    category : CommonTypes.TransactionCategory;
    accountId : CommonTypes.AccountId;
    isDemo : Bool;
    createdAt : CommonTypes.Timestamp;
  };

  public type CreateTransactionArgs = {
    date : CommonTypes.Timestamp;
    description : Text;
    amount : Nat;
    category : CommonTypes.TransactionCategory;
    accountId : CommonTypes.AccountId;
    isDemo : Bool;
  };

  public type UpdateTransactionArgs = {
    id : CommonTypes.TransactionId;
    date : CommonTypes.Timestamp;
    description : Text;
    amount : Nat;
    category : CommonTypes.TransactionCategory;
    accountId : CommonTypes.AccountId;
  };
};
