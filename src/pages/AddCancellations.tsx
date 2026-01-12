import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import InvoiceCard from "@/components/InvoiceCard";
import type { INVOICE } from "@/types/invoicsTypes";
import { getAllInvoice } from "@/api/invoice";

export default function AddInvoice() {
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<INVOICE[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const fetchInvoices = async () => {
    if (!search || search.trim().length === 0) {
      setError("Enter phone, PAN or customer name");
      return;
    }

    setError("");
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await getAllInvoice(search.trim());
      setInvoices(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Invoice Search</h1>

      {/* 🔍 Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search by Phone, PAN or Customer Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchInvoices()}
        />

        <Button
          onClick={fetchInvoices}
          disabled={loading || search.trim().length === 0}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* ❌ Error */}
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* 🧾 No Results */}
      {!loading && hasSearched && invoices.length === 0 && (
        <p className="text-muted-foreground">
          No active invoices found for this search.
        </p>
      )}

      {/* 📜 Scrollable Invoice Section */}
      <ScrollArea className="h-[600px] rounded-xl border p-4 bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              showPan // 👈 tells card to display PAN
              onRefresh={fetchInvoices}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
