import List "mo:core/List";
import CommonTypes "../types/common";
import TxTypes "../types/transactions";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public type State = {
    transactions : List.List<TxTypes.Transaction>;
    nextTxId : { var val : Nat };
  };

  public func newState() : State {
    {
      transactions = List.empty<TxTypes.Transaction>();
      nextTxId = { var val = 0 };
    };
  };

  public func createTransaction(
    state : State,
    owner : CommonTypes.UserId,
    args : TxTypes.CreateTransactionArgs,
  ) : TxTypes.TransactionView {
    let id = state.nextTxId.val;
    state.nextTxId.val += 1;
    let tx : TxTypes.Transaction = {
      id;
      owner;
      date = args.date;
      description = args.description;
      amount = args.amount;
      category = args.category;
      accountId = args.accountId;
      isDemo = args.isDemo;
      createdAt = Time.now();
    };
    state.transactions.add(tx);
    toView(tx);
  };

  public func updateTransaction(
    state : State,
    caller : CommonTypes.UserId,
    args : TxTypes.UpdateTransactionArgs,
  ) : ?TxTypes.TransactionView {
    var result : ?TxTypes.TransactionView = null;
    state.transactions.mapInPlace(
      func(t) {
        if (t.id == args.id and Principal.equal(t.owner, caller)) {
          let updated = { t with
            date = args.date;
            description = args.description;
            amount = args.amount;
            category = args.category;
            accountId = args.accountId;
          };
          result := ?toView(updated);
          updated;
        } else { t };
      }
    );
    result;
  };

  public func deleteTransaction(
    state : State,
    caller : CommonTypes.UserId,
    id : CommonTypes.TransactionId,
  ) : Bool {
    let sizeBefore = state.transactions.size();
    let filtered = state.transactions.filter(func(t) { not (t.id == id and Principal.equal(t.owner, caller)) });
    state.transactions.clear();
    state.transactions.append(filtered);
    state.transactions.size() < sizeBefore;
  };

  public func getTransactions(
    state : State,
    caller : CommonTypes.UserId,
  ) : [TxTypes.TransactionView] {
    state.transactions
      .filter(func(t) { Principal.equal(t.owner, caller) })
      .map<TxTypes.Transaction, TxTypes.TransactionView>(func(t) { toView(t) })
      .toArray();
  };

  public func toView(t : TxTypes.Transaction) : TxTypes.TransactionView {
    {
      id = t.id;
      owner = t.owner;
      date = t.date;
      description = t.description;
      amount = t.amount;
      category = t.category;
      accountId = t.accountId;
      isDemo = t.isDemo;
      createdAt = t.createdAt;
    };
  };

  public func deleteDemoTransactions(state : State, owner : CommonTypes.UserId) {
    let filtered = state.transactions.filter(func(t) { not (t.isDemo and Principal.equal(t.owner, owner)) });
    state.transactions.clear();
    state.transactions.append(filtered);
  };
};
