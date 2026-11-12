import AccessControl "mo:caffeineai-authorization/access-control";
import TxTypes "../types/transactions";
import CommonTypes "../types/common";
import TransactionsLib "../lib/transactions";

mixin (
  accessControlState : AccessControl.AccessControlState,
  txState : TransactionsLib.State,
) {
  public shared ({ caller }) func createTransaction(
    args : TxTypes.CreateTransactionArgs
  ) : async TxTypes.TransactionView {
    TransactionsLib.createTransaction(txState, caller, args);
  };

  public shared ({ caller }) func updateTransaction(
    args : TxTypes.UpdateTransactionArgs
  ) : async ?TxTypes.TransactionView {
    TransactionsLib.updateTransaction(txState, caller, args);
  };

  public shared ({ caller }) func deleteTransaction(
    id : CommonTypes.TransactionId
  ) : async Bool {
    TransactionsLib.deleteTransaction(txState, caller, id);
  };

  public query ({ caller }) func getTransactions() : async [TxTypes.TransactionView] {
    TransactionsLib.getTransactions(txState, caller);
  };
};
