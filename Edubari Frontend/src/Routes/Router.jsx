import { createBrowserRouter } from "react-router";
import MainLayout from "../Layouts/MainLayout";
import AdminLayout from "../Layouts/AdminLayout";
import Home from "../Pages/HomePage/Home";
import Blog from "../Pages/BlogPage/Blog";
import BlogDetail from "../Pages/BlogPage/BlogComponents/BlogDetail";
import ContactPage from "../Pages/ContactPage/ContactPage";
import WorkProofPage from "../Pages/WorkProofPage/WorkProofPage";
import PaymentPurchase from "../Pages/PaymentPurchasePage/PaymentPurchase";
import CheckoutPage from "../Pages/CheckoutPage/CheckoutPage";
import ConfirmationPage from "../Pages/CheckoutPage/ConfirmationPage";
import PaymentPlanDetails from "../Pages/PaymentPurchasePage/PaymentPlanDetails";
import Login from "../Pages/Admin/Auth/Login";
import LoginPage from "../Pages/LoginPage/LoginPage";
import ResetPass from "../Pages/Admin/Auth/ResetPass";
import Dashboard from "../Pages/Admin/Dashboard/Dashboard";
import Plans from "../Pages/Admin/Dashboard/Plans";
import WorkProofs from "../Pages/Admin/Dashboard/WorkProofs";
import Messages from "../Pages/Admin/Dashboard/Messages";
import Blogs from "../Pages/Admin/Dashboard/Blogs";
import Subscriptions from "../Pages/Admin/Dashboard/Subscriptions";
import Newsletter from "../Pages/Admin/Dashboard/Newsletter";
import Users from "../Pages/Admin/Dashboard/Users";
import HomeBanners from "../Pages/Admin/Dashboard/HomeBanners";
import CreateUser from "../Pages/Admin/Dashboard/CreateUser";
import Reviews from "../Pages/Admin/Dashboard/Reviews";
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
        element: <BlogDetail></BlogDetail>,
      },
      {
        path: "/contact",
        element: <ContactPage></ContactPage>,
      },
      {
        path: "/work-proof",
        element: <WorkProofPage></WorkProofPage>,
      },
      {
        path: "/pricing",
        element: <PaymentPurchase />,
      },
      {
        path: "/payment-plan-details",
        element: <PaymentPlanDetails />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/confirmation",
        element: <ConfirmationPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/admin/login",
    element: <Login></Login>,
  },
  {
    path: "/admin-reset-password",
    element: <ResetPass></ResetPass>,
  },
  {
    path: "/admin/dashboard",
    element: (
      <PrivateRouter>
        <AdminLayout></AdminLayout>
      </PrivateRouter>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "plans",
        element: <Plans />,
      },
      {
        path: "work-proof",
        element: <WorkProofs />,
      },
      {
        path: "home-banners",
        element: <HomeBanners />,
      },
      {
        path: "messages",
        element: <Messages />,
      },
      {
        path: "newsletter",
        element: <Newsletter />,
      },
      {
        path: "blogs",
        element: <Blogs />,
      },
      {
        path: "subscriptions",
        element: <Subscriptions />,
      },
      {
        path: "reviews",
        element: <Reviews />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "create-user",
        element: <CreateUser />,
      },
    ],
  },
]);

export default router;
