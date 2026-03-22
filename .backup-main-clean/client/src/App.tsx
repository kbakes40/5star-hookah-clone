import { Toaster } from "@/components/ui/sonner";
import { SupabaseAuthProvider } from "@/lib/SupabaseAuthProvider";
import AuthCallback from "./pages/AuthCallback";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import CartDrawer from "./components/CartDrawer";
import AgeVerificationModal from "./components/AgeVerificationModal";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import ProductDetail from "./pages/ProductDetail";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import SignIn from "./pages/SignIn";
import CreateAccount from "./pages/CreateAccount";
import MyAccount from "./pages/MyAccount";
import OrderHistory from "./pages/OrderHistory";
import MemberPerks from "./pages/MemberPerks";
import BrandCollection from "./pages/BrandCollection";
import Terms from "./pages/Terms";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Military from "./pages/Military";
import Returns from "./pages/Returns";
import Wishlist from "./pages/Wishlist";
import AgeVerification from "./pages/AgeVerification";
import About from "./pages/About";
import SearchResults from "./pages/SearchResults";
import FloatingRewardsButton from "./components/FloatingRewardsButton";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers";
import AdminInventory from "./pages/AdminInventory";
import AdminStoreSettings from "./pages/AdminStoreSettings";
import ZelleCheckout from "./pages/ZelleCheckout";
function Router() {
  const [location] = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/collections/:category"} component={Collection} />
      <Route path={"/product/:id"} component={ProductDetail} />
      <Route path={"/checkout/success"} component={CheckoutSuccess} />
      <Route path={"/checkout/cancel"} component={CheckoutCancel} />
      <Route path={"/zelle-checkout"} component={ZelleCheckout} />
      <Route path={"/sign-in"} component={SignIn} />
      <Route path={"/auth/callback"} component={AuthCallback} />
      <Route path={"/create-account"} component={CreateAccount} />
      <Route path={"/account"} component={MyAccount} />
      <Route path={"/orders"} component={OrderHistory} />
      <Route path={"/rewards"} component={MemberPerks} />
      <Route path={"/hookahs"}>
        {() => <Collection />}
      </Route>
      <Route path={"/shisha/:brand"}>
        {() => <BrandCollection />}
      </Route>
      <Route path={"/shisha"}>
        {() => <Collection />}
      </Route>
      <Route path={"/charcoal/:brand"}>
        {() => <BrandCollection />}
      </Route>
      <Route path={"/charcoal"}>
        {() => <Collection />}
      </Route>
      <Route path={"/vapes/:brand"}>
        {() => <BrandCollection />}
      </Route>
      <Route path={"/vapes"}>
        {() => <Collection />}
      </Route>
      <Route path={"/accessories"}>
        {() => <Collection />}
      </Route>
      <Route path={"/bowls"}>
        {() => <Collection />}
      </Route>
      <Route path={"/bundles"}>
        {() => <Collection />}
      </Route>
      <Route path={"/deals"}>
        {() => <Collection />}
      </Route>
      <Route path={"/wholesale"}>
        {() => <Collection />}
      </Route>
      <Route path={"/terms"} component={Terms} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/military"} component={Military} />
      <Route path={"/returns"} component={Returns} />
      <Route path={"/wishlist"} component={Wishlist} />
      <Route path={"/age-verification"} component={AgeVerification} />
      <Route path={"/about"} component={About} />
      <Route path={"/search"} component={SearchResults} />
      <Route path={"/admin"} component={AdminLogin} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/orders"} component={AdminOrders} />
      <Route path={"/admin/customers"} component={AdminCustomers} />
      <Route path={"/admin/inventory"} component={AdminInventory} />
      <Route path={"/admin/store-settings"} component={AdminStoreSettings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <AgeVerificationModal />
            <Router />
            <CartDrawer />
            <FloatingRewardsButton />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
      </SupabaseAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
