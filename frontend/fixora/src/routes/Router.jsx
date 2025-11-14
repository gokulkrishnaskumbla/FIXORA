import { createBrowserRouter } from "react-router-dom";

import About from "../pages/About";
import Home from "../pages/Home";
import Services from "../pages/services/Services";
import ServiceDetails from "../pages/services/ServiceDetails";
import CategoryServices from "../pages/services/CategoryServices";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import CheckoutSuccessPage from "../pages/CheckoutSuccessPage";
import CheckoutCancelPage from "../pages/CheckoutCancelPage";
import Bookings from "../pages/Bookings";
import Profile from "../pages/Profile";
import Conversations from "../pages/messages/Conversations";
import ConversationView from "../pages/messages/ConversationView";

// Provider Pages
import ProviderRegistration from "../pages/provider/ProviderRegistration";
import ProviderDashboard from "../pages/provider/Dashboard";
import ProviderRequests from "../pages/provider/Requests";
import ProviderAvailability from "../pages/provider/Availability";
import ProviderServices from "../pages/provider/ServicesList";
import AddService from "../pages/provider/AddService";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import ServicesManagement from "../pages/admin/ServicesManagement";
import BookingsManagement from "../pages/admin/BookingsManagement";
import UsersManagement from "../pages/admin/UsersManagement";
import ContactManagement from "../pages/admin/ContactManagement";
import ReviewsManagement from "../pages/admin/ReviewsManagement";
import ProvidersManagement from "../pages/admin/ProvidersManagement";

// Layouts & Misc
import UserLayout from "../layout/UserLayout";
import AdminLayout from "../layout/AdminLayout";
import ProviderLayout from "../layout/ProviderLayout";
import ErrorPage from "../pages/ErrorPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <UserLayout />,
        errorElement: <ErrorPage />,
        children: [
            { path: "/", element: <Home /> },
            { path: "about", element: <About /> },
            { path: "services", element: <Services /> },
            { path: "services/category/:category", element: <CategoryServices /> },
            { path: "services/:serviceId", element: <ServiceDetails /> },
            { path: "cart", element: <CartPage /> },
            { path: "checkout", element: <CheckoutPage /> },
            { path: "checkout/success", element: <CheckoutSuccessPage /> },
            { path: "checkout/cancel", element: <CheckoutCancelPage /> },
            { path: "bookings", element: <Bookings /> },
            { path: "profile", element: <Profile /> },
            { path: "messages", element: <Conversations /> },
            { path: "messages/:requestId", element: <ConversationView /> },
            { path: "provider/register", element: <ProviderRegistration /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
        ],
    },

    // Admin Routes
    {
        path: "/admin",
        element: <AdminLayout />,
        errorElement: <ErrorPage />,
        children: [
            { path: "dashboard", element: <AdminDashboard /> },
            { path: "services", element: <ServicesManagement /> },
            { path: "bookings", element: <BookingsManagement /> },
            { path: "users", element: <UsersManagement /> },
            { path: "contacts", element: <ContactManagement /> },
            { path: "reviews", element: <ReviewsManagement /> },
            { path: "providers", element: <ProvidersManagement /> },
        ],
    },

    // Provider Routes
    {
        path: "/provider",
        element: <ProviderLayout />,
        errorElement: <ErrorPage />,
        children: [
            { path: "dashboard", element: <ProviderDashboard /> },
            { path: "requests", element: <ProviderRequests /> },
            { path: "services", element: <ProviderServices /> },
            { path: "services/add", element: <AddService /> },
            { path: "availability", element: <ProviderAvailability /> },
        ],
    },
]);
