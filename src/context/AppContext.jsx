import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useStorage } from '../hooks/useStorage';

const AppContext = createContext(null);

const POINTS_THRESHOLD = 1000;

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getInitialState(stored) {
  if (stored && Array.isArray(stored.users) && stored.users.length > 0) {
    return {
      users: stored.users,
      activeUserId: null,
      screen: 'home',
      courseMode: null,
      pendingRewardPatternId: null,
    };
  }
  return {
    users: [],
    activeUserId: null,
    screen: 'home',
    courseMode: null,
    pendingRewardPatternId: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_USER':
      return { ...state, activeUserId: action.userId };

    case 'ADD_USER': {
      const newUser = {
        id: generateId(),
        name: action.name.trim(),
        points: 0,
        createdAt: Date.now(),
      };
      return { ...state, users: [...state.users, newUser] };
    }

    case 'DELETE_USER': {
      const users = state.users.filter(u => u.id !== action.userId);
      const activeUserId = state.activeUserId === action.userId ? null : state.activeUserId;
      return { ...state, users, activeUserId };
    }

    case 'START_COURSE':
      return { ...state, screen: 'question', courseMode: action.courseMode };

    case 'AWARD_POINT': {
      const users = state.users.map(u => {
        if (u.id !== state.activeUserId) return u;
        const newPoints = u.points + 1;
        if (newPoints >= POINTS_THRESHOLD) {
          return { ...u, points: 0 };
        }
        return { ...u, points: newPoints };
      });
      const activeUser = state.users.find(u => u.id === state.activeUserId);
      const wouldReach = activeUser && (activeUser.points + 1) >= POINTS_THRESHOLD;
      if (wouldReach) {
        const patternId = Math.floor(Math.random() * 10);
        return { ...state, users, screen: 'reward', pendingRewardPatternId: patternId };
      }
      return { ...state, users };
    }

    case 'DISMISS_REWARD':
      return { ...state, screen: 'question', pendingRewardPatternId: null };

    case 'RETURN_HOME':
      return { ...state, screen: 'home', courseMode: null, activeUserId: null };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const { load, save } = useStorage();
  const stored = useRef(load()).current;
  const [state, dispatch] = useReducer(reducer, stored, getInitialState);

  useEffect(() => {
    save(state);
  }, [state.users, state.activeUserId]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
