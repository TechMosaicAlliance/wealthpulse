import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface CreateTransactionArgs {
    accountId: AccountId;
    date: Timestamp;
    description: string;
    isDemo: boolean;
    category: TransactionCategory;
    amount: bigint;
}
export interface PassiveIncomeEntry {
    receivedYtdUsd: number;
    ticker: string;
    assetId: AssetId;
    assetName: string;
    currentValueUsd: number;
    monthlyExpectedUsd: number;
    annualExpectedUsd: number;
    expectedYieldPct: number;
}
export interface AccountView {
    id: AccountId;
    balance: bigint;
    owner: UserId;
    institution: string;
    name: string;
    createdAt: Timestamp;
    isDemo: boolean;
    accountType: AccountType;
    currency: string;
}
export interface TransactionView {
    id: TransactionId;
    accountId: AccountId;
    owner: UserId;
    date: Timestamp;
    createdAt: Timestamp;
    description: string;
    isDemo: boolean;
    category: TransactionCategory;
    amount: bigint;
}
export type AccountId = bigint;
export interface AssetView {
    id: AssetId;
    ticker: string;
    owner: UserId;
    name: string;
    createdAt: Timestamp;
    isDemo: boolean;
    linkedAccountId?: AccountId;
    assetClass: AssetClass;
    expectedYieldPct: number;
    isFortress: boolean;
}
export interface CreateAssetArgs {
    ticker: string;
    name: string;
    isDemo: boolean;
    linkedAccountId?: AccountId;
    assetClass: AssetClass;
    expectedYieldPct: number;
    isFortress: boolean;
}
export type TransactionId = bigint;
export interface DetectedTradeView {
    id: DetectedTradeId;
    rawText: string;
    tradeType: TradeType;
    owner: UserId;
    detectedAt: Timestamp;
    isDemo: boolean;
    currency: string;
    assetName: string;
    price: number;
    confidence: number;
    amount: number;
    assetClass: AssetClass;
}
export interface UpdateAccountArgs {
    id: AccountId;
    balance: bigint;
    institution: string;
    name: string;
    currency: string;
}
export type HoldingId = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface CreateAccountArgs {
    balance: bigint;
    institution: string;
    name: string;
    isDemo: boolean;
    accountType: AccountType;
    currency: string;
}
export interface UpdateAssetArgs {
    id: AssetId;
    ticker: string;
    name: string;
    linkedAccountId?: AccountId;
    assetClass: AssetClass;
    expectedYieldPct: number;
    isFortress: boolean;
}
export interface UpdateEmailScanSettingsArgs {
    scanIntervalMinutes: bigint;
    isEnabled: boolean;
}
export interface NetWorthSnapshot {
    totalValueNgn: number;
    totalValueUsd: number;
    isDemo: boolean;
    timestamp: Timestamp;
}
export interface HoldingView {
    id: HoldingId;
    purchasePrice: number;
    accountId: AccountId;
    purchaseDate: Timestamp;
    assetId: AssetId;
    owner: UserId;
    createdAt: Timestamp;
    isDemo: boolean;
    quantity: number;
}
export interface UpdateTransactionArgs {
    id: TransactionId;
    accountId: AccountId;
    date: Timestamp;
    description: string;
    category: TransactionCategory;
    amount: bigint;
}
export interface EmailScanSettings {
    lastScanAt?: Timestamp;
    scanIntervalMinutes: bigint;
    isEnabled: boolean;
}
export interface UpdateHoldingArgs {
    id: HoldingId;
    purchasePrice: number;
    purchaseDate: Timestamp;
    quantity: number;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export type UserId = Principal;
export interface RiskBalance {
    growthPct: number;
    totalValueUsd: number;
    fortressValueUsd: number;
    growthValueUsd: number;
    isAggressive: boolean;
}
export interface PriceEntryView {
    updatedAt: Timestamp;
    currency: string;
    price: number;
}
export interface NetWorthResult {
    exchangeRateNgnPerUsd: number;
    holdingsValueNgn: number;
    holdingsValueUsd: number;
    totalNgn: number;
    totalUsd: number;
    liquidBalanceNgn: number;
}
export type AssetId = bigint;
export type DetectedTradeId = bigint;
export interface CreateHoldingArgs {
    purchasePrice: number;
    accountId: AccountId;
    purchaseDate: Timestamp;
    assetId: AssetId;
    isDemo: boolean;
    quantity: number;
}
export enum AccountType {
    Liquid = "Liquid",
    Investment = "Investment"
}
export enum AssetClass {
    ETF = "ETF",
    Stock = "Stock",
    Bond = "Bond",
    Cash = "Cash",
    Crypto = "Crypto"
}
export enum TradeType {
    Buy = "Buy",
    Sell = "Sell"
}
export enum TransactionCategory {
    Interest = "Interest",
    Dividend = "Dividend",
    Investment = "Investment",
    Transfer = "Transfer",
    Income = "Income",
    Expense = "Expense"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateNetWorth(): Promise<NetWorthResult>;
    clearDemoData(): Promise<void>;
    clearDetectedTrades(): Promise<void>;
    convertDetectedTradeToTransaction(tradeId: DetectedTradeId, accountId: bigint): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createAccount(args: CreateAccountArgs): Promise<AccountView>;
    createAsset(args: CreateAssetArgs): Promise<AssetView>;
    createHolding(args: CreateHoldingArgs): Promise<HoldingView>;
    createTransaction(args: CreateTransactionArgs): Promise<TransactionView>;
    deleteAccount(id: AccountId): Promise<boolean>;
    deleteAsset(id: AssetId): Promise<boolean>;
    deleteHolding(id: HoldingId): Promise<boolean>;
    deleteTransaction(id: TransactionId): Promise<boolean>;
    fetchCryptoPrice(coinId: string): Promise<string>;
    fetchExchangeRate(): Promise<string>;
    fetchStockPrice(ticker: string): Promise<string>;
    getAccounts(): Promise<Array<AccountView>>;
    getAssets(): Promise<Array<AssetView>>;
    getCallerUserRole(): Promise<UserRole>;
    getDetectedTrades(): Promise<Array<DetectedTradeView>>;
    getEmailScanSettings(): Promise<EmailScanSettings>;
    getExchangeRate(): Promise<number>;
    getHoldings(): Promise<Array<HoldingView>>;
    getNetWorthHistory(): Promise<Array<NetWorthSnapshot>>;
    getPassiveIncome(): Promise<Array<PassiveIncomeEntry>>;
    getPriceCache(ticker: string): Promise<PriceEntryView | null>;
    getRiskBalance(): Promise<RiskBalance>;
    getTransactions(): Promise<Array<TransactionView>>;
    isCallerAdmin(): Promise<boolean>;
    isDemoLoaded(): Promise<boolean>;
    loadDemoData(): Promise<void>;
    recordNetWorthSnapshot(snapshot: NetWorthSnapshot): Promise<void>;
    simulateEmailScan(): Promise<Array<DetectedTradeView>>;
    storeDetectedTrade(tradeType: TradeType, assetName: string, assetClass: AssetClass, amount: number, price: number, currency: string, confidence: number, rawText: string, isDemo: boolean): Promise<DetectedTradeView>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAccount(args: UpdateAccountArgs): Promise<AccountView | null>;
    updateAsset(args: UpdateAssetArgs): Promise<AssetView | null>;
    updateEmailScanSettings(args: UpdateEmailScanSettingsArgs): Promise<EmailScanSettings>;
    updateHolding(args: UpdateHoldingArgs): Promise<HoldingView | null>;
    updateTransaction(args: UpdateTransactionArgs): Promise<TransactionView | null>;
}
