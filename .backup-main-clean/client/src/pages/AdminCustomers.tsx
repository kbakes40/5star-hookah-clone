// Admin Customers Page - View and manage customers
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  LogOut,
  Shield,
  ChevronLeft,
  Search,
  Mail,
  Calendar,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function AdminCustomers() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: customers, isLoading, refetch } = trpc.admin.getCustomers.useQuery({
    page: 1,
    pageSize: 50,
  });

  const deleteCustomer = trpc.admin.deleteCustomer.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (customerId: number, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
      deleteCustomer.mutate({ customerId });
    }
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setLocation("/admin");
      } else if (user?.role !== "admin") {
        setLocation("/");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
    { icon: Users, label: "Customers", path: "/admin/customers" },
    { icon: Package, label: "Inventory", path: "/admin/inventory" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src="/favicon-96x96.png" alt="5 Star Hookah" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-lg">5 Star Hookah</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.path === "/admin/customers" ? "bg-gray-800" : "hover:bg-gray-800"
                }`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent border-gray-700 hover:bg-gray-800 text-white"
            onClick={() => setLocation("/")}
          >
            <LogOut className="w-4 h-4" />
            Back to Store
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/admin/dashboard">
              <a className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
              </a>
            </Link>
            <h2 className="text-3xl font-bold">Customer Management</h2>
            <p className="text-gray-600 mt-1">View and manage customer accounts</p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search customers by name or email..." className="pl-10" />
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Sign In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers && customers.length > 0 ? (
                    customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.name || "Guest"}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {customer.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {customer.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.role === "admin" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {customer.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(customer.lastSignedIn).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(customer.id, customer.name || "Guest")}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
