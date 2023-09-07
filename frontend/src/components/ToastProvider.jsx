import { createContext, useContext, useEffect, useState } from "react";
import Toast from "./Toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [delTimeout, setDelTimeout] = useState(null);

  useEffect(() => {
    if (data) {
      setTimeout(() => setData(null), 3000);
    }
  }, [data]);

  function pushToast(status, message) {
    setData({ status, message });
  }

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {data && (
        <Toast message={data.message} status={data.status} setToast={setData} />
      )}
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
