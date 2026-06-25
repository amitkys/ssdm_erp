import { useQuery } from "@tanstack/react-query";
import {
  getMiscPayments,
  searchMiscPaymentByInvoice,
} from "../lib/actions";

export function useGetMiscPayments(searchInvoice?: string) {
  return useQuery({
    queryKey: ["misc-payments", searchInvoice ?? ""],
    queryFn: async () => {
      const res = searchInvoice
        ? await searchMiscPaymentByInvoice(searchInvoice)
        : await getMiscPayments();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}
