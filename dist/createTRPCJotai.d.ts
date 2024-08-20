import type { CreateTRPCClientOptions } from '@trpc/client';
import type { AnyTRPCMutationProcedure, AnyTRPCProcedure, AnyTRPCQueryProcedure, AnyTRPCSubscriptionProcedure, AnyTRPCRouter, TRPCRouterRecord, TRPCProcedureOptions, inferProcedureInput, inferProcedureOutput } from '@trpc/server';
import type { inferObservableValue } from '@trpc/server/observable';
import { type RouterRecord } from '@trpc/server/unstable-core-do-not-import';
import type { Atom, Getter, WritableAtom } from 'jotai/vanilla';
type ValueOrGetter<T> = T | ((get: Getter) => T);
type AsyncValueOrGetter<T> = T | Promise<T> | ((get: Getter) => T) | ((get: Getter) => Promise<T>);
export declare const DISABLED: unique symbol;
type QueryResolver<TProcedure extends AnyTRPCProcedure, TClient> = {
    (getInput: AsyncValueOrGetter<inferProcedureInput<TProcedure>>, getOptions?: ValueOrGetter<TRPCProcedureOptions>, getClient?: (get: Getter) => TClient): WritableAtom<Promise<inferProcedureOutput<TProcedure>>, [], void>;
    (getInput: AsyncValueOrGetter<inferProcedureInput<TProcedure> | typeof DISABLED>, getOptions?: ValueOrGetter<TRPCProcedureOptions & {
        disabledOutput?: undefined;
    }>, getClient?: (get: Getter) => TClient): WritableAtom<Promise<inferProcedureOutput<TProcedure> | undefined>, [
    ], void>;
    <DisabledOutput>(getInput: AsyncValueOrGetter<inferProcedureInput<TProcedure> | typeof DISABLED>, getOptions: ValueOrGetter<TRPCProcedureOptions & {
        disabledOutput: DisabledOutput;
    }>, getClient?: (get: Getter) => TClient): WritableAtom<Promise<inferProcedureOutput<TProcedure> | DisabledOutput>, [
    ], void>;
};
type MutationResolver<TProcedure extends AnyTRPCProcedure, TClient> = (getClient?: (get: Getter) => TClient) => WritableAtom<inferProcedureOutput<TProcedure> | null, [
    [inferProcedureInput<TProcedure>, TRPCProcedureOptions]
], Promise<inferProcedureOutput<TProcedure>>>;
type SubscriptionResolver<TProcedure extends AnyTRPCProcedure, TClient> = (getInput: ValueOrGetter<inferProcedureInput<TProcedure>>, getOptions?: ValueOrGetter<TRPCProcedureOptions>, getClient?: (get: Getter) => TClient) => Atom<inferObservableValue<inferProcedureOutput<TProcedure>>>;
type DecorateProcedure<TProcedure extends AnyTRPCProcedure, TClient> = TProcedure extends AnyTRPCQueryProcedure ? {
    atomWithQuery: QueryResolver<TProcedure, TClient>;
} : TProcedure extends AnyTRPCMutationProcedure ? {
    atomWithMutation: MutationResolver<TProcedure, TClient>;
} : TProcedure extends AnyTRPCSubscriptionProcedure ? {
    atomWithSubscription: SubscriptionResolver<TProcedure, TClient>;
} : never;
type DecoratedProcedureRecord<TProcedures extends TRPCRouterRecord, TClient> = {
    [TKey in keyof TProcedures]: TProcedures[TKey] extends RouterRecord ? DecoratedProcedureRecord<TProcedures[TKey], TClient> : TProcedures[TKey] extends AnyTRPCProcedure ? DecorateProcedure<TProcedures[TKey], TClient> : never;
};
export declare function createTRPCJotai<TRouter extends AnyTRPCRouter>(opts: CreateTRPCClientOptions<TRouter>): DecoratedProcedureRecord<TRouter["_def"]["record"], import("@trpc/client").CreateTRPCProxyClient<TRouter>>;
export {};
