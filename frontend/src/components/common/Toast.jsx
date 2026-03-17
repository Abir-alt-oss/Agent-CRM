import { useSelector, useDispatch } from "react-redux";
import { hideToast } from "../../store/slices/uiSlice";
import { useEffect } from "react";

function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => dispatch(hideToast()), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  return <div className={`toast toast-${toast.type}`}>{toast.message}</div>;
}

export default Toast;
