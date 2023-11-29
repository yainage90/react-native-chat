import React, { useState, createContext } from 'react';

const UserContext = createContext({
  user: { uid: null, name: null, email: null, photoURL: null },
  dispatch: () => {},
});

const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const dispatch = ({ uid, name, email, photoURL }) => {
    setUser({ uid, name, email, photoURL });
  };
  const value = { user, dispatch };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
