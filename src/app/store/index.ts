import * as React from 'react';

// react-redux/src/utils/shallowEqual.ts
export const shallowEqual = <T>(objA: T, objB: T) => {
  if (Object.is(objA, objB)) return true;

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  // 配列の比較
  if (Array.isArray(objA) && Array.isArray(objB)) {
    if (objA.length !== objB.length) return false;
    for (let i = 0; i < objA.length; i++) {
      if (!Object.is(objA[i], objB[i])) return false;
    }
    return true;
  }

  // Map の比較
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;
    for (const [key, value] of objA) {
      if (!objB.has(key) || !Object.is(value, objB.get(key))) return false;
    }
    return true;
  }

  // Set の比較
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;
    for (const value of objA) {
      if (!objB.has(value)) return false;
    }
    return true;
  }

  // Object の比較
  const keysA = Object.keys(objA as Record<string, unknown>);
  const keysB = Object.keys(objB as Record<string, unknown>);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB as Record<string, unknown>, keysA[i]) ||
      !Object.is(
        (objA as Record<string, unknown>)[keysA[i]],
        (objB as Record<string, unknown>)[keysA[i]],
      )
    ) {
      return false;
    }
  }

  return true;
};

type Listener = () => void;
type Unsubscribe = () => void;
type Selector<TState, TSelected> = (state: TState) => TSelected;
type Updater<TState> = (prevState: TState) => TState;
type EffectCallback<TState> = (state: TState, prevState: TState) => void | (() => void);

interface Store<TState> {
  getState: () => TState;
  getPrevState: () => TState;
  setState: (updater: Updater<TState>) => void;
  subscribe: <TSelected>(
    selector: Selector<TState, TSelected>,
    listener: Listener,
    options?: { fireImmediately?: boolean },
  ) => Unsubscribe;
  getSnapshot: <TSelected>(selector: Selector<TState, TSelected>) => () => TSelected;
  effect: <TSelected>(
    selector: Selector<TState, TSelected>,
    effectCallback: EffectCallback<TState>,
  ) => Unsubscribe;
  destroy: () => void;
}

export const createStore = <TState>(initialState: TState): Store<TState> => {
  let state = initialState;
  let prevState = initialState;

  const listeners = new Set<{
    selector: Selector<TState, unknown>;
    listener: Listener;
    lastValue: unknown;
  }>();

  const snapshotCache = new Map<Selector<TState, any>, any>();

  const getState = (): TState => state;

  const getPrevState = (): TState => prevState;

  const setState = (updater: Updater<TState>): void => {
    const nextState = updater(state);

    if (Object.is(state, nextState)) return;

    prevState = state;
    state = nextState;

    notifyListeners();
  };

  const notifyListeners = (): void => {
    for (const subscription of listeners) {
      const { selector, listener, lastValue } = subscription;
      const newValue = selector(state);

      if (!shallowEqual(lastValue, newValue)) {
        subscription.lastValue = newValue;
        listener();
      }
    }
  };

  const subscribe = <TSelected>(
    selector: Selector<TState, TSelected>,
    listener: Listener,
    options?: { fireImmediately?: boolean },
  ): Unsubscribe => {
    const subscription = {
      selector: selector as Selector<TState, unknown>,
      listener,
      lastValue: selector(state),
    };

    listeners.add(subscription);

    if (options?.fireImmediately) {
      listener();
    }

    return () => {
      listeners.delete(subscription);
    };
  };

  const getSnapshot = <TSelected>(selector: Selector<TState, TSelected>): (() => TSelected) => {
    return () => {
      const newValue = selector(state);
      const cachedValue = snapshotCache.get(selector as Selector<TState, any>);

      if (cachedValue !== undefined && shallowEqual(cachedValue, newValue)) {
        return cachedValue as TSelected;
      }

      snapshotCache.set(selector as Selector<TState, any>, newValue);
      return newValue;
    };
  };

  const effect = <TSelected>(
    selector: Selector<TState, TSelected>,
    effectCallback: EffectCallback<TState>,
  ): Unsubscribe => {
    let cleanup: void | (() => void);

    cleanup = effectCallback(state, prevState);

    const unsubscribe = subscribe(selector, () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
      cleanup = effectCallback(state, prevState);
    });

    // アンサブスクライブ時にクリーンアップも実行
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
      unsubscribe();
    };
  };

  const destroy = (): void => {
    listeners.clear();
    snapshotCache.clear();
  };

  return {
    getState,
    getPrevState,
    setState,
    subscribe,
    getSnapshot,
    effect,
    destroy,
  };
};

/**
 * useStore: Reactコンポーネントでストアを使用
 *
 * @param store - 使用するストア
 * @param selector - 状態から値を選択する関数（メモ化推奨）
 * @returns 選択された値
 *
 * @example
 * const count = useStore(store, s => s.count);
 * const user = useStore(store, useCallback(s => s.user, []));
 */
export function useStore<TState>(store: Store<TState>): TState;
export function useStore<TState, TSelected>(
  store: Store<TState>,
  selector: Selector<TState, TSelected>,
): TSelected;
export function useStore<TState, TSelected = TState>(
  store: Store<TState>,
  selector?: Selector<TState, TSelected>,
): TSelected {
  const actualSelector = (selector ?? ((s: TState) => s as unknown as TSelected)) as Selector<
    TState,
    TSelected
  >;
  const getSnapshotFn = React.useMemo(
    () => store.getSnapshot(actualSelector),
    [store, actualSelector],
  );

  const subscribeFn = React.useCallback(
    (listener: Listener) => store.subscribe(actualSelector, listener),
    [store, actualSelector],
  );

  const value = React.useSyncExternalStore(
    subscribeFn,
    getSnapshotFn,
    getSnapshotFn, // for SSR
  );

  return value as TSelected;
}

/**
 * useStoreEffect: ストアの変更時に副作用を実行
 *
 * @param store - 使用するストア
 * @param selector - 監視する値を選択する関数
 * @param effectCallback - 実行する副作用
 *
 * @example
 * useStoreEffect(
 *   store,
 *   s => s.user.id,
 *   (state, prevState) => {
 *     console.log('User changed:', state.user.id);
 *     return () => console.log('Cleanup');
 *   }
 * );
 */
export const useStoreEffect = <TState, TSelected = TState>(
  store: Store<TState>,
  selector: Selector<TState, TSelected>,
  effectCallback: EffectCallback<TState>,
): void => {
  React.useEffect(() => {
    return store.effect(selector, effectCallback);
  }, [store, selector, effectCallback]);
};

/**
 * useStoreActions: アクションを作成するカスタムフック
 *
 * @param store - 使用するストア
 * @returns アクションオブジェクト
 *
 * @example
 * const actions = useStoreActions(store);
 * actions.increment();
 */
export const useStoreActions = <TState, TActions extends Record<string, (...args: any[]) => void>>(
  store: Store<TState>,
  actionsFactory: (
    setState: Store<TState>['setState'],
    getState: Store<TState>['getState'],
  ) => TActions,
): TActions => {
  return React.useMemo(() => actionsFactory(store.setState, store.getState), [store]);
};
