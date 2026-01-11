import { useState, useEffect } from "react";
import type { INVOICE } from "@/types/invoicsTypes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { createCancellationFromInvoice } from "@/api/cancellation";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  invoice: INVOICE;
  onRefresh: () => void;
}

export default function CancelInvoiceDialog({
  open,
  setOpen,
  invoice,
  onRefresh,
}: Props) {
  const [cancellationCharge, setCancellationCharge] = useState<number>(0);
  const [netReturn, setNetReturn] = useState<number>(0);
  const [refund, setRefund] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [paymentMode, setPaymentMode] = useState<
    "Cash" | "UPI" | "Bank Transfer" | "Cheque" | "Others" | "Demand Draft"
  >("Cash");

  const [bankName, setBankName] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");

  /* ================= AUTO CALCULATION ================= */

  useEffect(() => {
    const calculatedNetReturn = invoice.advance - cancellationCharge;
    const safeNetReturn = calculatedNetReturn > 0 ? calculatedNetReturn : 0;

    const calculatedRemaining = safeNetReturn - refund;
    const safeRemaining = calculatedRemaining > 0 ? calculatedRemaining : 0;

    setNetReturn(safeNetReturn);
    setRemaining(safeRemaining);
  }, [cancellationCharge, refund, invoice.advance]);

  /* ================= SUBMIT ================= */

  const handleCancel = async () => {
    try {
      // ❌ REFUND VALIDATION
      if (refund > netReturn) {
        toast.error(
          "Refund amount should be less than or equal to Net Return"
        );
        return;
      }

      // ❌ CHEQUE VALIDATION
      if (paymentMode === "Cheque") {
        if (!bankName.trim()) {
          toast.error("Bank name is required for cheque payments");
          return;
        }

        const chequeRegex = /^\d{6}$/;
        if (!chequeRegex.test(chequeNumber)) {
          toast.error("Cheque number should be exactly 6 digits");
          return;
        }
      }

      setLoading(true);

      const payload = {
        cancellation_charge: cancellationCharge,
        net_return: netReturn,
        already_returned: refund,
        yetTB_returned: remaining,
        payment: {
          mode: paymentMode,
          bankName: paymentMode === "Cheque" ? bankName : null,
          chequeNumber: paymentMode === "Cheque" ? chequeNumber : null,
        },
      };

      const res = await createCancellationFromInvoice(invoice._id, payload);

      if (!res.success) {
        throw new Error(res.message || "Cancellation failed");
      }

      setOpen(false);
      setSuccessOpen(true);
      onRefresh();
    } catch (err: any) {
      console.error("Cancel Invoice Error:", err);
      toast.error(err.message || "Failed to cancel invoice");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invoice</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm">
              Invoice ID: <b>{invoice._id}</b>
            </p>

            <div>
              <label className="text-sm font-medium">Advance Paid</label>
              <Input
                value={invoice.advance}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Cancellation Charge</label>
              <Input
                type="number"
                value={cancellationCharge}
                onChange={(e) => setCancellationCharge(Number(e.target.value))}
                placeholder="Enter cancellation charge"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Net Return (Auto)</label>
              <Input
                value={netReturn}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Refund Amount</label>
              <Input
                type="number"
                value={refund}
                onChange={(e) => setRefund(Number(e.target.value))}
                placeholder="Amount being refunded now"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Remaining (Auto)</label>
              <Input
                value={remaining}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Refund Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full border rounded-md p-2 mt-1"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Demand Draft">Demand Draft</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {paymentMode === "Cheque" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bank Name</label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Cheque Number</label>
                  <Input
                    value={chequeNumber}
                    onChange={(e) =>
                      setChequeNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="6 digit cheque number"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            <Button
              variant="destructive"
              className="w-full"
              disabled={loading}
              onClick={handleCancel}
            >
              {loading ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="text-center space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          <DialogHeader>
            <DialogTitle>Cancellation Successful</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            New cancellation cheque has been created successfully.
          </p>

          <Button className="w-full" onClick={() => setSuccessOpen(false)}>
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
