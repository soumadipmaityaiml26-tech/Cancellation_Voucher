import { useLocation } from "react-router-dom";
import VoucherPage from "./VoucherPage";
import type { CANCELLATION } from "@/types/cancellationTypes";

export default function InvoiceRoute() {
  const location = useLocation();

  const voucher = location.state?.cancellation as CANCELLATION | undefined;

  // 🚨 If user refreshes or opens URL directly
  if (!voucher) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Voucher data not available. Please open from dashboard.
        </p>
      </div>
    );
  }

  // ✅ PASS PROP PROPERLY
  return <VoucherPage cancellation={voucher} />;
}
