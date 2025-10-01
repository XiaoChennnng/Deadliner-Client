import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Task, Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initial state
const initialState: AppState = {
  user: null,
  tasks: [],
  categories: [],
  currentView: 'overview',
  currentFilter: 'all',
  selectedCategory: null,
  sortBy: 'deadline',
  searchQuery: '',
  isMultiSelectMode: false,
  selectedTasks: new Set(),
  sidebarCollapsed: false,
  loading: false,
  error: null,
};

// Action types
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VIEW'; payload: AppState['currentView'] }
  | { type: 'SET_FILTER'; payload: AppState['currentFilter'] }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'SET_SORT'; payload: AppState['sortBy'] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_MULTI_SELECT' }
  | { type: 'SELECT_TASK'; payload: string }
  | { type: 'DESELECT_TASK'; payload: string }
  | { type: 'CLEAR_SELECTED_TASKS' }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string }
  | { type: 'TOGGLE_TASK_STAR'; payload: string }
  | { type: 'ARCHIVE_TASK'; payload: string }
  | { type: 'UNARCHIVE_TASK'; payload: string }
  | { type: 'BATCH_COMPLETE_TASKS'; payload: string[] }
  | { type: 'BATCH_DELETE_TASKS'; payload: string[] }
  | { type: 'BATCH_ARCHIVE_TASKS'; payload: string[] }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string };

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_VIEW':
      return { ...state, currentView: action.payload };

    case 'SET_FILTER':
      return { ...state, currentFilter: action.payload };

    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    case 'SET_SORT':
      return { ...state, sortBy: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'TOGGLE_MULTI_SELECT':
      return {
        ...state,
        isMultiSelectMode: !state.isMultiSelectMode,
        selectedTasks: new Set(), // Clear selections when toggling
      };

    case 'SELECT_TASK':
      return {
        ...state,
        selectedTasks: new Set(Array.from(state.selectedTasks).concat(action.payload)),
      };

    case 'DESELECT_TASK':
      const newSelectedTasks = new Set(state.selectedTasks);
      newSelectedTasks.delete(action.payload);
      return {
        ...state,
        selectedTasks: newSelectedTasks,
      };

    case 'CLEAR_SELECTED_TASKS':
      return { ...state, selectedTasks: new Set() };

    case 'ADD_TASK':
      const newTask: Task = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };

    case 'TOGGLE_TASK_COMPLETION':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date() }
            : task
        ),
      };

    case 'TOGGLE_TASK_STAR':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, isStarred: !task.isStarred, updatedAt: new Date() }
            : task
        ),
      };

    case 'ARCHIVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, isArchived: true, updatedAt: new Date() }
            : task
        ),
      };

    case 'UNARCHIVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, isArchived: false, updatedAt: new Date() }
            : task
        ),
      };

    case 'BATCH_COMPLETE_TASKS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          action.payload.includes(task.id)
            ? { ...task, completed: true, updatedAt: new Date() }
            : task
        ),
        selectedTasks: new Set(),
        isMultiSelectMode: false,
      };

    case 'BATCH_DELETE_TASKS':
      return {
        ...state,
        tasks: state.tasks.filter(task => !action.payload.includes(task.id)),
        selectedTasks: new Set(),
        isMultiSelectMode: false,
      };

    case 'BATCH_ARCHIVE_TASKS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          action.payload.includes(task.id)
            ? { ...task, isArchived: true, updatedAt: new Date() }
            : task
        ),
        selectedTasks: new Set(),
        isMultiSelectMode: false,
      };

    case 'ADD_CATEGORY':
      const newCategory: Category = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        categories: [...state.categories, newCategory],
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id
            ? { ...category, ...action.payload.updates }
            : category
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
        // Also update tasks that have this category
        tasks: state.tasks.map(task =>
          task.category === action.payload
            ? { ...task, category: 'uncategorized', updatedAt: new Date() }
            : task
        ),
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};