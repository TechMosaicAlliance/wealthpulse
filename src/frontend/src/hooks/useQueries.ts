import {
  type AccountId,
  type AssetId,
  type CreateAccountArgs,
  type CreateAssetArgs,
  type CreateTransactionArgs,
  type TransactionId,
  type UpdateAccountArgs,
  type UpdateAssetArgs,
  type UpdateTransactionArgs,
  createActor,
} from "@/backend";
import { useAppStore } from "@/store/useAppStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useExchangeRate() {
  const { actor, isFetching } = useActor(createActor);
  const setExchangeRate = useCurrencyStore((s) => s.setExchangeRate);
  return useQuery<number>({
    queryKey: ["exchangeRate"],
    queryFn: async () => {
      if (!actor) return 1600;
      const rate = await actor.getExchangeRate();
      setExchangeRate(rate);
      return rate;
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useIsDemoLoaded() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isDemoLoaded"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isDemoLoaded();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60 * 1000,
  });
}

export function useLoadDemoData() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  const setDemoMode = useAppStore((s) => s.setDemoMode);
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.loadDemoData();
    },
    onSuccess: () => {
      setDemoMode(true);
      qc.invalidateQueries();
    },
  });
}

export function useClearDemoData() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  const setDemoMode = useAppStore((s) => s.setDemoMode);
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.clearDemoData();
    },
    onSuccess: () => {
      setDemoMode(false);
      qc.invalidateQueries();
    },
  });
}

export function useAccounts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAccounts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60 * 1000,
  });
}

export function useCreateAccount() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: CreateAccountArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.createAccount(args);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: UpdateAccountArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAccount(args);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useDeleteAccount() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: AccountId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteAccount(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useAssets() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssets();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60 * 1000,
  });
}

export function useCreateAsset() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: CreateAssetArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.createAsset(args);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["passiveIncome"] });
      qc.invalidateQueries({ queryKey: ["riskBalance"] });
    },
  });
}

export function useUpdateAsset() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: UpdateAssetArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAsset(args);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["passiveIncome"] });
      qc.invalidateQueries({ queryKey: ["riskBalance"] });
    },
  });
}

export function useDeleteAsset() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: AssetId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteAsset(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["passiveIncome"] });
      qc.invalidateQueries({ queryKey: ["riskBalance"] });
    },
  });
}

export function useHoldings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["holdings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHoldings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60 * 1000,
  });
}

export function useTransactions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60 * 1000,
  });
}

export function useCreateTransaction() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: CreateTransactionArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.createTransaction(args);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["netWorth"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: UpdateTransactionArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTransaction(args);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["netWorth"] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: TransactionId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["netWorth"] });
    },
  });
}

export function useNetWorth() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["netWorth"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.calculateNetWorth();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60 * 1000,
  });
}

export function usePassiveIncome() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["passiveIncome"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPassiveIncome();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRiskBalance() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["riskBalance"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRiskBalance();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNetWorthHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["netWorthHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNetWorthHistory();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchPrices() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tickers: string[]) => {
      if (!actor) throw new Error("No actor");
      await Promise.all(tickers.map((t) => actor.fetchStockPrice(t)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["netWorth"] });
      qc.invalidateQueries({ queryKey: ["passiveIncome"] });
      qc.invalidateQueries({ queryKey: ["riskBalance"] });
    },
  });
}
