import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import type {
  CANCELLATION,
  IGetLatestCancellationResponse,
} from "@/types/cancellationTypes";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getCancellationHistory,
  updateVoucher,
  getLatestCancellationsPerUser,
} from "@/api/cancellation";

/* ================= UTILS ================= */
const getDate = (iso: string) => iso.split("T")[0];
const getTime = (iso: string) => iso.split("T")[1].slice(0, 5);

/* ================= COMPONENT ================= */
export default function UserVouchers() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [vouchers, setVouchers] = useState<CANCELLATION[]>([]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCancellations, setHistoryCancellations] = useState<
    CANCELLATION[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* ===== Edit Payment ===== */
  const [open, setOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CANCELLATION | null>(
    null
  );
  const [payment, setPayment] = useState<number | null>(null);
  const [paymentMode, setPaymentMode] = useState<
    "Bank Transfer" | "Cheque" | "UPI" | "Cash" | "Demand Draft" | "Others"
  >("Bank Transfer");
  const [chequeNumber, setChequeNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [loading, setLoading] = useState(false);

  const [chequeError, setChequeError] = useState("");
  const [bankError, setBankError] = useState("");

  /* ================= FETCH ================= */
  const fetchVouchers = async () => {
    const data: IGetLatestCancellationResponse =
      await getLatestCancellationsPerUser();
    setVouchers(data.data);
  };
  const fetchHistory = async (id: string) => {
    const data: IGetLatestCancellationResponse = await getCancellationHistory(
      id
    );
    setHistoryCancellations(data.data);
  };
  useEffect(() => {
    fetchVouchers();
  }, []);
  const clearSearch = () => {
    setSearch("");
  };

  /* ================= FILTER ================= */
  const filteredInvoices = vouchers.filter(
    (inv) =>
      inv._id.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.phone.includes(search) ||
      inv.company.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= HANDLERS ================= */

  const handleEditClick = (cancellation: CANCELLATION) => {
    setSelectedInvoice(cancellation);
    setPayment(null);
    setPaymentMode("Bank Transfer");
    setChequeNumber("");
    setBankName("");
    setOpen(true);
  };

  const handleHistoryClick = async (cancellation: CANCELLATION) => {
    try {
      setHistoryLoading(true);
      setHistoryOpen(true);

      await fetchHistory(cancellation.inv_id);
    } catch (err) {
      toast.error("Failed to load invoice history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedInvoice || payment === null) {
      toast.error("Please enter payment amount");
      return;
    }

    // if (payment <= 0 || payment > selectedInvoice.remainingAmount) {
    //   toast.error("Invalid payment amount");
    //   return;
    // }

    // CHEQUE VALIDATION
    if (paymentMode === "Cheque") {
      if (chequeNumber.length !== 6) {
        toast.error("Cheque number must be 6 digits");
        return;
      }

      if (!bankName.trim()) {
        toast.error("Bank name is required");
        return;
      }
    }

    try {
      setLoading(true);

      const summary = {
        mode: paymentMode,
        chequeNumber: paymentMode === "Cheque" ? chequeNumber : undefined,
        bankName: paymentMode === "Cheque" ? bankName : undefined,
      };

      await updateVoucher(selectedInvoice.inv_id, payment, summary);

      toast.success("Payment added successfully");
      setOpen(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err?.message || "Payment update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* SEARCH */}
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Search invoice / customer / phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <Button
            variant="outline"
            onClick={clearSearch}
            className="text-sm px-3"
          >
            Clear
          </Button>
        )}

        <Button>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:block rounded-xl border bg-white p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cancellation</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredInvoices.map((can) => (
              <TableRow key={can._id}>
                <TableCell>{can._id}</TableCell>
                <TableCell>{can.inv_id}</TableCell>
                <TableCell>{can.customer.name}</TableCell>
                <TableCell>{can.customer.phone}</TableCell>
                <TableCell>₹{can.advance - can.cancellation_charge}</TableCell>
                <TableCell>₹{can.already_returned}</TableCell>
                <TableCell>₹{can.yetTB_returned}</TableCell>
                <TableCell>{getDate(can.createdAt)}</TableCell>
                <TableCell>{getTime(can.createdAt)}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleHistoryClick(can)}
                  >
                    History
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/voucher/${can._id}`, {
                        state: { cancellation: can },
                      })
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button size="sm" onClick={() => handleEditClick(can)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="space-y-4 md:hidden">
        {filteredInvoices.map((can) => (
          <div
            key={can._id}
            className="rounded-xl border bg-white p-4 shadow-sm space-y-3"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-base">{can.customer.name}</p>
                <p className="text-xs text-muted-foreground">{can._id}</p>
                <p className="text-xs text-muted-foreground">
                  {can.customer.phone}
                </p>
              </div>

              <span
                className={`font-semibold text-sm ${
                  can.yetTB_returned === 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ₹{can.yetTB_returned}
              </span>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <p className="text-muted-foreground">Total</p>
              <p>₹{can.advance - can.cancellation_charge}</p>

              <p className="text-muted-foreground">Paid</p>
              <p className="text-green-700">₹{can.already_returned}</p>

              <p className="text-muted-foreground">Due</p>
              <p className="text-red-600 font-semibold">
                ₹{can.yetTB_returned}
              </p>

              <p className="text-muted-foreground">Date</p>
              <p>
                {getDate(can.createdAt)} {getTime(can.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleHistoryClick(can)}
              >
                History
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigate(`/voucher/${can._id}`, {
                    state: { cancellation: can },
                  })
                }
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button size="sm" onClick={() => handleEditClick(can)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= EDIT PAYMENT MODAL ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Label>Amount</Label>
            <Input
              type="number"
              value={payment ?? ""}
              onChange={(e) =>
                setPayment(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Mode</Label>
            <select
              className="w-full border rounded-md h-10 px-3"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as any)}
            >
              <option>Bank Transfer</option>
              <option>Cheque</option>
              <option>UPI</option>
              <option>Cash</option>
              <option>Demand Draft</option>
              <option>Others</option>
            </select>
          </div>

          {paymentMode === "Cheque" && (
            <>
              {/* CHEQUE NUMBER */}
              <Input
                placeholder="Enter 6 digit cheque number"
                value={chequeNumber}
                maxLength={6}
                onChange={(e) => {
                  const value = e.target.value;

                  // Only digits allowed
                  if (!/^\d*$/.test(value)) return;

                  setChequeNumber(value);

                  if (value.length != 6) {
                    setChequeError("Cheque number must be 6 digits");
                  } else {
                    setChequeError("");
                  }
                }}
                className={chequeError ? "border-red-500" : ""}
              />

              {/* BANK NAME */}
              <Input
                placeholder="Bank Name"
                value={bankName}
                onChange={(e) => {
                  setBankName(e.target.value);

                  if (!e.target.value.trim()) {
                    setBankError("Bank name is required");
                  } else {
                    setBankError("");
                  }
                }}
                className={bankError ? "border-red-500" : ""}
              />
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Saving..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[95vw] md:max-w-[900px] lg:max-w-[1000px] xl:max-w-[1200px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Invoice History</DialogTitle>
          </DialogHeader>

          {historyLoading ? (
            <p>Loading history...</p>
          ) : historyCancellations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No previous versions found.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cancellation</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Download</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {historyCancellations.map((can) => (
                    <TableRow key={can._id}>
                      <TableCell className="font-medium">{can._id}</TableCell>
                      <TableCell>{can.inv_id}</TableCell>

                      <TableCell>
                        ₹{can.advance - can.cancellation_charge}
                      </TableCell>

                      <TableCell className="text-green-700">
                        ₹{can.already_returned}
                      </TableCell>

                      <TableCell className="text-red-600 font-semibold">
                        ₹{can.yetTB_returned}
                      </TableCell>

                      <TableCell>{getDate(can.createdAt)}</TableCell>

                      <TableCell>{getTime(can.createdAt)}</TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/voucher/${can._id}`, {
                              state: { cancellation: can },
                            })
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
