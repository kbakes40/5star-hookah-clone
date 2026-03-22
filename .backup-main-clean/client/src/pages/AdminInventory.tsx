// Admin Inventory Page - Manage product stock levels
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
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
  AlertTriangle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminInventory() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [editingStock, setEditingStock] = useState<{id: number, quantity: number} | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: "",
    productName: "",
    brand: "",
    category: "hookahs",
    stockQuantity: 0,
    lowStockThreshold: 10,
    price: 0,
    cost: 0,
    sku: "",
  });

  const { data: inventoryItems, isLoading, refetch } = trpc.admin.getInventory.useQuery({
    page: 1,
    pageSize: 100,
    category: categoryFilter,
  });

  const updateStock = trpc.admin.updateInventoryStock.useMutation({
    onSuccess: () => {
      toast.success("Stock updated");
      setEditingStock(null);
      refetch();
    },
    onError: () => {
      toast.error("Failed to update stock");
    },
  });

  const addItem = trpc.admin.addInventoryItem.useMutation({
    onSuccess: () => {
      toast.success("Item added to inventory");
      setAddDialogOpen(false);
      setNewItem({
        productId: "",
        productName: "",
        brand: "",
        category: "hookahs",
        stockQuantity: 0,
        lowStockThreshold: 10,
        price: 0,
        cost: 0,
        sku: "",
      });
      refetch();
    },
    onError: () => {
      toast.error("Failed to add item");
    },
  });

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

  const handleStockUpdate = (id: number) => {
    if (editingStock && editingStock.id === id) {
      updateStock.mutate({
        inventoryId: id,
        stockQuantity: editingStock.quantity,
      });
    }
  };

  const handleAddItem = () => {
    addItem.mutate(newItem);
  };

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
                  item.path === "/admin/inventory" ? "bg-gray-800" : "hover:bg-gray-800"
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Inventory Management</h2>
                <p className="text-gray-600 mt-1">Manage product stock levels and pricing</p>
              </div>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                      Add a new product to inventory tracking
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <Label htmlFor="productId">Product ID</Label>
                      <Input
                        id="productId"
                        value={newItem.productId}
                        onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                        placeholder="e.g., hookah-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        value={newItem.productName}
                        onChange={(e) => setNewItem({...newItem, productName: e.target.value})}
                        placeholder="e.g., Premium Hookah"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={newItem.brand}
                        onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                        placeholder="e.g., Khalil Mamoon"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hookahs">Hookahs</SelectItem>
                          <SelectItem value="shisha">Shisha</SelectItem>
                          <SelectItem value="vapes">Vapes</SelectItem>
                          <SelectItem value="charcoal">Charcoal</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="bowls">Bowls</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stockQuantity">Stock Quantity</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        value={newItem.stockQuantity}
                        onChange={(e) => setNewItem({...newItem, stockQuantity: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        value={newItem.lowStockThreshold}
                        onChange={(e) => setNewItem({...newItem, lowStockThreshold: parseInt(e.target.value) || 10})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost">Cost ($)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={newItem.cost}
                        onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="sku">SKU (Optional)</Label>
                      <Input
                        id="sku"
                        value={newItem.sku}
                        onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                        placeholder="e.g., KM-001"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem}>
                      Add Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hookahs">Hookahs</SelectItem>
                    <SelectItem value="shisha">Shisha</SelectItem>
                    <SelectItem value="vapes">Vapes</SelectItem>
                    <SelectItem value="charcoal">Charcoal</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="bowls">Bowls</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Product name, SKU..." className="pl-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryItems && inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.brand}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.sku || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {editingStock?.id === item.id ? (
                              <Input
                                type="number"
                                value={editingStock.quantity}
                                onChange={(e) => setEditingStock({id: item.id, quantity: parseInt(e.target.value) || 0})}
                                className="w-20"
                                onBlur={() => handleStockUpdate(item.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleStockUpdate(item.id);
                                  if (e.key === "Escape") setEditingStock(null);
                                }}
                                autoFocus
                              />
                            ) : (
                              <button
                                onClick={() => setEditingStock({id: item.id, quantity: item.stockQuantity})}
                                className="text-sm font-medium hover:underline"
                              >
                                {item.stockQuantity}
                              </button>
                            )}
                            {item.stockQuantity <= item.lowStockThreshold && (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(item.price / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No inventory items</p>
                        <p className="text-sm">Add your first product to start tracking inventory</p>
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
