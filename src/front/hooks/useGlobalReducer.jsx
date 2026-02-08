import { useContext, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store";


const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());
  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export default function useGlobalReducer() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useGlobalReducer must be used inside StoreProvider");
  const { dispatch, store } = ctx;
  return { dispatch, store };
}
