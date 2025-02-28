import React, { createContext, useState, useContext } from "react";

// Créer un contexte
const AppContext = createContext();

// Créer un fournisseur de contexte
export const AppProvider = ({ children }) => {
  const [sharedState, setSharedState] = useState();

  return (
    <AppContext.Provider
      value={{
        sharedState,
        setSharedState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => {
  return useContext(AppContext);
};
