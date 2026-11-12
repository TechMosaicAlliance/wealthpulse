import Map "mo:core/Map";
import List "mo:core/List";

module {
  public type UserId = Principal;
  public type Timestamp = Int;
  public type AssetId = Nat;
  public type AccountId = Nat;
  public type HoldingId = Nat;
  public type TransactionId = Nat;

  public type AssetClass = {
    #Stock;
    #ETF;
    #Crypto;
    #Bond;
    #Cash;
  };

  public type TransactionCategory = {
    #Investment;
    #Expense;
    #Income;
    #Transfer;
    #Dividend;
    #Interest;
  };

  public type AccountType = {
    #Liquid;      // Bank accounts, savings, cash
    #Investment;  // Brokerages, crypto wallets
  };
};
