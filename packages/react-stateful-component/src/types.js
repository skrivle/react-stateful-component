// @flow

export type Reduce<A> = (action: A) => void;

export type Refs = { [key: string]: ?HTMLElement };

export type SideEffect<A, S> = (reduce: Reduce<A>, state: S, refs: Refs) => any;

export type ReleaseSubscription = () => any;
export type Subscribe<A> = (reduce: Reduce<A>, refs: Refs) => ReleaseSubscription;
export type Subscription<A> = Subscribe<A>;

export type SideEffectDefault<A, S> = {
    type: 'sideEffectDefault',
    sideEffect: ?SideEffect<A, S>
};

export type SideEffectSupscription<A, S> = {
    type: 'sideEffectSupscription',
    sideEffect: ?SideEffect<A, S>
};

export type SideEffectWrapper<A, S> = SideEffectDefault<A, S> | SideEffectSupscription<A, S>;
