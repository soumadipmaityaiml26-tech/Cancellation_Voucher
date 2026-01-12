import api from "./axios";
import type { IGetAllInvoiceResponse } from "@/types/invoicsTypes.ts";

// export const getAllInvoice = async (phone: number) => {
//   const token = localStorage.getItem("authToken");

//   const res = await api.get<IGetAllInvoiceResponse>(
//     `/cancellation/invoice/${phone}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   return res.data;
// };
export const getAllInvoice = async (query: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<IGetAllInvoiceResponse>(
    `/cancellation/invoice/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
