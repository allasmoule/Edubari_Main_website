import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../Firebase/AuthContext";

const PrivateRouter = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-dark font-semibold">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRouter;
