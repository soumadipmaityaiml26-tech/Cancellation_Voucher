import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CancelInvoiceDialog from "./CancelInvoiceDialog";
import { useState } from "react";
import type { INVOICE } from "@/types/invoicsTypes";

interface Props {
  invoice: INVOICE;
  onRefresh: () => void;
  showPan?: boolean;
}

/* ================= Utils ================= */
const formatMoney = (n: number) =>
  `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function InvoiceCard({ invoice, onRefresh, showPan }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="shadow-md hover:shadow-xl transition rounded-xl">
        <CardHeader className="pb-2">
          <h2 className="font-semibold text-lg">{invoice.customer.name}</h2>

          <p className="text-sm text-muted-foreground">
            {invoice.customer.phone}
          </p>

          {showPan && (
            <p className="text-xs text-muted-foreground">
              PAN: {invoice.customer.PAN}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-medium">
              {formatMoney(invoice.totalAmount)}
            </span>
          </div>

          <div className="flex justify-between text-green-600">
            <span>Paid</span>
            <span className="font-medium">{formatMoney(invoice.advance)}</span>
          </div>

          <div className="flex justify-between text-red-600">
            <span>Remaining</span>
            <span className="font-medium">
              {formatMoney(invoice.remainingAmount)}
            </span>
          </div>

          <Button
            variant="destructive"
            className="w-full mt-4"
            onClick={() => setOpen(true)}
          >
            Cancel Invoice
          </Button>
        </CardContent>
      </Card>

      <CancelInvoiceDialog
        open={open}
        setOpen={setOpen}
        invoice={invoice}
        onRefresh={onRefresh}
      />
    </>
  );
}
