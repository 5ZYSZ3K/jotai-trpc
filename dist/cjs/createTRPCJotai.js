"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTRPCJotai = exports.DISABLED = void 0;
const client_1 = require("@trpc/client");
const vanilla_1 = require("jotai/vanilla");
const utils_1 = require("jotai/vanilla/utils");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProcedure = (obj, path) => {
    for (let i = 0; i < path.length; ++i) {
        obj = obj[path[i]];
    }
    return obj;
};
const isGetter = (v) => typeof v === 'function';
exports.DISABLED = Symbol();
const atomWithQuery = (path, getClient, getInput, getOptions) => {
    const refreshAtom = (0, vanilla_1.atom)(0);
    const queryAtom = (0, vanilla_1.atom)(async (get, { signal }) => {
        get(refreshAtom);
        const procedure = getProcedure(getClient(get), path);
        const options = isGetter(getOptions) ? getOptions(get) : getOptions;
        const input = await (isGetter(getInput) ? getInput(get) : getInput);
        if (input === exports.DISABLED) {
            return options === null || options === void 0 ? void 0 : options.disabledOutput;
        }
        const output = await procedure.query(input, {
            signal,
            ...options,
        });
        return output;
    }, (_, set) => set(refreshAtom, (counter) => counter + 1));
    return queryAtom;
};
const atomWithMutation = (path, getClient) => {
    const mutationAtom = (0, vanilla_1.atom)(null, async (get, set, args) => {
        const procedure = getProcedure(getClient(get), path);
        const result = await procedure.mutate(...args);
        set(mutationAtom, result);
        return result;
    });
    return mutationAtom;
};
const atomWithSubscription = (path, getClient, getInput, getOptions) => {
    const subscriptionAtom = (0, utils_1.atomWithObservable)((get) => {
        const procedure = getProcedure(getClient(get), path);
        const input = isGetter(getInput) ? getInput(get) : getInput;
        const options = isGetter(getOptions) ? getOptions(get) : getOptions;
        const observable = {
            subscribe: (arg) => {
                const callbacks = {
                    onNext: arg.next.bind(arg),
                    onError: arg.error.bind(arg),
                };
                const unsubscribable = procedure.subscribe(input, {
                    ...options,
                    ...callbacks,
                });
                return unsubscribable;
            },
        };
        return observable;
    });
    return subscriptionAtom;
};
function createTRPCJotai(opts) {
    const client = (0, client_1.createTRPCClient)(opts);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createProxy = (target, path = []) => {
        return new Proxy(() => {
            // empty
        }, {
            get(_target, prop) {
                return createProxy(target[prop], [...path, prop]);
            },
            apply(_target, _thisArg, args) {
                const parentProp = path[path.length - 1];
                const parentPath = path.slice(0, -1);
                if (parentProp === 'atomWithQuery') {
                    const [getInput, getOptions, getClient] = args;
                    return atomWithQuery(parentPath, getClient || (() => client), getInput, getOptions);
                }
                if (parentProp === 'atomWithMutation') {
                    const [getClient] = args;
                    return atomWithMutation(parentPath, getClient || (() => client));
                }
                if (parentProp === 'atomWithSubscription') {
                    const [getInput, getOptions, getClient] = args;
                    return atomWithSubscription(parentPath, getClient || (() => client), getInput, getOptions);
                }
                throw new Error(`unexpected function call ${path.join('/')}`);
            },
        });
    };
    return createProxy(client);
}
exports.createTRPCJotai = createTRPCJotai;
