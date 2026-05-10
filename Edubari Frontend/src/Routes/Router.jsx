import { createBrowserRouter } from "react-router";
import MainLayout from "../Layouts/MainLayout";
import AdminLayout from "../Layouts/AdminLayout";
import Home from "../Pages/HomePage/Home";
import Blog from "../Pages/BlogPage/Blog";
import BlogDetail from "../Pages/BlogPage/BlogComponents/BlogDetail";
import ContactPage from "../Pages/ContactPage/ContactPage";
import WorkProofPage from "../Pages/WorkProofPage/WorkProofPage";
import PaymentPurchase from "../Pages/PaymentPurchasePage/PaymentPurchase";
import Login from "../Pages/Admin/Auth/Login";
import ResetPass from "../Pages/Admin/Auth/ResetPass";
import Dashboard from "../Pages/Admin/Dashboard/Dashboard";
import Plans from "../Pages/Admin/Dashboard/Plans";
import WorkProofs from "../Pages/Admin/Dashboard/WorkProofs";
import Messages from "../Pages/Admin/Dashboard/Messages";
import Blogs from "../Pages/Admin/Dashboard/Blogs";
import Subscriptions from "../Pages/Admin/Dashboard/Subscriptions";
import Users from "../Pages/Admin/Dashboard/Users";
import HomeBanners from "../Pages/Admin/Dashboard/HomeBanners";
import CreateUser from "../Pages/Admin/Dashboard/CreateUser";
import PrivateRouter from "./PrivateRouter";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/blog",
        element: <Blog></Blog>,
      },
      {
        path: "/blog/:slug",
        element: <BlogDetail />,
      },
      {
        path: "/about",
        element: <h1>About</h1>,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/work-proof",
        element: <WorkProofPage />,
      },
      {
        path: "/payment-purchase",
        element: <PaymentPurchase />,
      },
    ],
  },
  {
    path: "/admin/login",
    element: <Login />,
  },
  // {
  //   path: "/admin/reset-password",
  //   element: <ResetPass />,
  // },
  {
    path: "/admin/dashboard",
    element: (
      <PrivateRouter>
        <AdminLayout />
      </PrivateRouter>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "plans",
        element: <Plans />,
      },
      {
        path: "subscriptions",
        element: <Subscriptions />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "create-user",
        element: <CreateUser />,
      },
      {
        path: "work-proof",
        element: <WorkProofs />,
      },
      {
        path: "messages",
        element: <Messages />,
      },
      {
        path: "blogs",
        element: <Blogs />,
      },
      {
        path: "home-banners",
        element: <HomeBanners />,
      },
    ],
  },
]);

export default router;
