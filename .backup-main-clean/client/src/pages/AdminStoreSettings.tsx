// Admin Store Settings Page
// Manage store information for pickup orders

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Store, MapPin, Phone, Mail, Clock, FileText } from "lucide-react";

export default function AdminStoreSettings() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hours, setHours] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [zelleEmail, setZelleEmail] = useState("");
  const [zellePhone, setZellePhone] = useState("");

  const { data: settings, isLoading, refetch } = trpc.admin.getStoreSettings.useQuery();

  const updateSettings = trpc.admin.updateStoreSettings.useMutation({
    onSuccess: () => {
      toast.success("Store settings updated successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update store settings");
    },
  });

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || "");
      setAddress(settings.address || "");
      setCity(settings.city || "");
      setState(settings.state || "");
      setZipCode(settings.zipCode || "");
      setPhone(settings.phone || "");
      setEmail(settings.email || "");
      setHours(settings.hours || "");
      setPickupInstructions(settings.pickupInstructions || "");
      setZelleEmail(settings.zelleEmail || "");
      setZellePhone(settings.zellePhone || "");
    }
  }, [settings]);

  // Check authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Button onClick={() => setLocation("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      storeName,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      hours,
      pickupInstructions,
      zelleEmail,
      zellePhone,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Logo" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-lg">BossHookah</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <a
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 mb-2"
          >
            <Store className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a
            href="/admin/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 mb-2"
          >
            <FileText className="w-5 h-5" />
            <span>Orders</span>
          </a>
          <a
            href="/admin/customers"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 mb-2"
          >
            <span>👥</span>
            <span>Customers</span>
          </a>
          <a
            href="/admin/inventory"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 mb-2"
          >
            <span>📦</span>
            <span>Inventory</span>
          </a>
          <a
            href="/admin/store-settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600 text-white mb-2"
          >
            <Store className="w-5 h-5" />
            <span>Store Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Settings</h1>
            <p className="text-gray-600">Manage your store information for pickup orders</p>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
              <div className="p-6 space-y-6">
                {/* Store Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Store className="w-4 h-4" />
                    Store Name
                  </label>
                  <Input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="BossHookah"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Street Address
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                {/* City, State, Zip */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Detroit"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      placeholder="MI"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                    <Input
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="48201"
                      required
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(313) 555-0100"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@bosshookah.com"
                    />
                  </div>
                </div>

                {/* Store Hours */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    Store Hours
                  </label>
                  <Textarea
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Monday - Friday: 10:00 AM - 9:00 PM&#10;Saturday: 11:00 AM - 10:00 PM&#10;Sunday: 12:00 PM - 8:00 PM"
                    rows={5}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter each day on a new line</p>
                </div>

                {/* Pickup Instructions */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Pickup Instructions
                  </label>
                  <Textarea
                    value={pickupInstructions}
                    onChange={(e) => setPickupInstructions(e.target.value)}
                    placeholder="Please bring your order confirmation email and a valid ID. Park in the designated pickup area and call us when you arrive."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Instructions shown to customers who select in-store pickup
                  </p>
                </div>

                {/* Zelle Payment Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Zelle Payment Information</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure Zelle payment details for customers who choose to pay via Zelle
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4" />
                        Zelle Email
                      </label>
                      <Input
                        type="email"
                        value={zelleEmail}
                        onChange={(e) => setZelleEmail(e.target.value)}
                        placeholder="payments@bosshookah.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email address for receiving Zelle payments</p>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4" />
                        Zelle Phone
                      </label>
                      <Input
                        value={zellePhone}
                        onChange={(e) => setZellePhone(e.target.value)}
                        placeholder="(313) 406-6589"
                      />
                      <p className="text-xs text-gray-500 mt-1">Phone number for receiving Zelle payments</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setLocation("/admin")}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateSettings.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {updateSettings.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
