import React, { useCallback } from 'react';
import { createStore, useStore, useStoreActions, useStoreEffect } from '.';

// ============================================
// 例1: 基本的な使い方
// ============================================

interface CounterState {
  count: number;
  lastUpdated: Date;
}

// ストアを作成
const counterStore = createStore<CounterState>({
  count: 0,
  lastUpdated: new Date(),
});

// カウンターコンポーネント
const Counter: React.FC = () => {
  // 1. 全体の状態を取得
  const state = useStore(counterStore);

  // 2. 特定の値だけを取得（推奨：再レンダリングを最小化）
  // ⚠️ 重要: selectorはuseCallbackでメモ化すること！
  const count = useStore(
    counterStore,
    useCallback((s) => s.count, []),
  );

  // 3. アクションを定義
  const increment = () => {
    counterStore.setState((prev) => ({
      ...prev,
      count: prev.count + 1,
      lastUpdated: new Date(),
    }));
  };

  const decrement = () => {
    counterStore.setState((prev) => ({
      ...prev,
      count: prev.count - 1,
      lastUpdated: new Date(),
    }));
  };

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
};

// ============================================
// 例2: 複雑な状態管理（TODO アプリ）
// ============================================

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  searchQuery: string;
}

// ストアを作成
const todoStore = createStore<TodoState>({
  todos: [],
  filter: 'all',
  searchQuery: '',
});

// アクションを別ファイルに分離するパターン
const todoActions = {
  addTodo: (text: string) => {
    todoStore.setState((prev) => ({
      ...prev,
      todos: [
        ...prev.todos,
        {
          id: Math.random().toString(36),
          text,
          completed: false,
          createdAt: new Date(),
        },
      ],
    }));
  },

  toggleTodo: (id: string) => {
    todoStore.setState((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    }));
  },

  deleteTodo: (id: string) => {
    todoStore.setState((prev) => ({
      ...prev,
      todos: prev.todos.filter((todo) => todo.id !== id),
    }));
  },

  setFilter: (filter: TodoState['filter']) => {
    todoStore.setState((prev) => ({ ...prev, filter }));
  },

  setSearchQuery: (query: string) => {
    todoStore.setState((prev) => ({ ...prev, searchQuery: query }));
  },
};

// TODO リストコンポーネント
const TodoList: React.FC = () => {
  // 派生状態（filtered todos）をselectorで計算
  const filteredTodos = useStore(
    todoStore,
    useCallback((state) => {
      let result = state.todos;

      // フィルター適用
      if (state.filter === 'active') {
        result = result.filter((t) => !t.completed);
      } else if (state.filter === 'completed') {
        result = result.filter((t) => t.completed);
      }

      // 検索適用
      if (state.searchQuery) {
        result = result.filter((t) =>
          t.text.toLowerCase().includes(state.searchQuery.toLowerCase()),
        );
      }

      return result;
    }, []),
  );

  return (
    <ul>
      {filteredTodos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => todoActions.toggleTodo(todo.id)}
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
          <button onClick={() => todoActions.deleteTodo(todo.id)}>削除</button>
        </li>
      ))}
    </ul>
  );
};

// TODO 入力コンポーネント
const TodoInput: React.FC = () => {
  const [text, setText] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      todoActions.addTodo(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="新しいTODO" />
      <button type="submit">追加</button>
    </form>
  );
};

// フィルターコンポーネント
const TodoFilters: React.FC = () => {
  const filter = useStore(
    todoStore,
    useCallback((s) => s.filter, []),
  );

  return (
    <div>
      <button onClick={() => todoActions.setFilter('all')} disabled={filter === 'all'}>
        すべて
      </button>
      <button onClick={() => todoActions.setFilter('active')} disabled={filter === 'active'}>
        未完了
      </button>
      <button onClick={() => todoActions.setFilter('completed')} disabled={filter === 'completed'}>
        完了済み
      </button>
    </div>
  );
};

// ============================================
// 例3: useStoreEffect の使用
// ============================================

const TodoEffects: React.FC = () => {
  // TODOが追加されたときにローカルストレージに保存
  useStoreEffect(
    todoStore,
    useCallback((s) => s.todos, []),
    (state, prevState) => {
      // 初回レンダリング時はスキップ
      if (state.todos.length !== prevState.todos.length) {
        localStorage.setItem('todos', JSON.stringify(state.todos));
        console.log('TODOs saved to localStorage');
      }

      // クリーンアップ関数（オプション）
      return () => {
        console.log('Effect cleanup');
      };
    },
  );

  // TODOが完了したときに通知
  useStoreEffect(
    todoStore,
    useCallback((s) => s.todos.filter((t) => t.completed).length, []),
    (state, prevState) => {
      const completedCount = state.todos.filter((t) => t.completed).length;
      const prevCompletedCount = prevState.todos.filter((t) => t.completed).length;

      if (completedCount > prevCompletedCount) {
        console.log('🎉 TODO completed!');
      }
    },
  );

  return null; // このコンポーネントは何もレンダリングしない
};

// ============================================
// 例4: useStoreActions の使用
// ============================================

const TodoWithActions: React.FC = () => {
  // アクションをフック化
  const actions = useStoreActions(todoStore, (setState, getState) => ({
    addTodo: (text: string) => {
      setState((prev) => ({
        ...prev,
        todos: [
          ...prev.todos,
          {
            id: Math.random().toString(36),
            text,
            completed: false,
            createdAt: new Date(),
          },
        ],
      }));
    },

    clearCompleted: () => {
      setState((prev) => ({
        ...prev,
        todos: prev.todos.filter((t) => !t.completed),
      }));
    },

    toggleAll: () => {
      const allCompleted = getState().todos.every((t) => t.completed);
      setState((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => ({ ...t, completed: !allCompleted })),
      }));
    },
  }));

  return (
    <div>
      <button onClick={() => actions.addTodo('New TODO')}>クイック追加</button>
      <button onClick={actions.clearCompleted}>完了済みを削除</button>
      <button onClick={actions.toggleAll}>すべて切り替え</button>
    </div>
  );
};

// ============================================
// 例5: 複数ストアの使用
// ============================================

interface UserState {
  id: string | null;
  name: string;
  email: string;
}

interface SettingsState {
  theme: 'light' | 'dark';
  language: 'ja' | 'en';
  notifications: boolean;
}

const userStore = createStore<UserState>({
  id: null,
  name: '',
  email: '',
});

const settingsStore = createStore<SettingsState>({
  theme: 'light',
  language: 'ja',
  notifications: true,
});

const UserProfile: React.FC = () => {
  const user = useStore(userStore);
  const theme = useStore(
    settingsStore,
    useCallback((s) => s.theme, []),
  );

  return (
    <div style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      <h2>{user.name || 'Guest'}</h2>
      <p>{user.email}</p>
    </div>
  );
};

// ============================================
// 例6: ストアの初期化とクリーンアップ
// ============================================

const AppWithStore: React.FC = () => {
  React.useEffect(() => {
    // ローカルストレージから復元
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const todos = JSON.parse(savedTodos);
      todoStore.setState((prev) => ({ ...prev, todos }));
    }

    // コンポーネントのアンマウント時にクリーンアップ
    return () => {
      // 必要に応じてストアを破棄
      // todoStore.destroy();
    };
  }, []);

  return (
    <div>
      <TodoInput />
      <TodoFilters />
      <TodoList />
      <TodoWithActions />
      <TodoEffects />
    </div>
  );
};

// ============================================
// ベストプラクティス
// ============================================

/*
1. Selectorは必ずuseCallbackでメモ化する
   ❌ useStore(store, s => s.count)  // 毎回新しい関数
   ✅ useStore(store, useCallback(s => s.count, []))

2. 複雑な派生状態はselector内で計算する
   ✅ const filtered = useStore(store, useCallback(s => s.items.filter(...), []))

3. アクションは外部で定義し、再利用する
   ✅ const actions = { increment: () => store.setState(...) }

4. 大きな状態は分割して管理する
   ✅ const userStore = createStore(...)
   ✅ const settingsStore = createStore(...)

5. パフォーマンスのために必要な値だけを選択する
   ❌ const state = useStore(store)  // 全体を取得
   ✅ const count = useStore(store, s => s.count)  // 必要な値だけ

6. effectは副作用にのみ使用し、状態更新には使わない
   ❌ effect内でsetStateを呼ぶ（無限ループの危険）
   ✅ ログ、API呼び出し、localStorage保存など
*/

export { AppWithStore, Counter, TodoFilters, TodoInput, TodoList, UserProfile };
