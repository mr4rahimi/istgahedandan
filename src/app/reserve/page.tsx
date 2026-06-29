import type { Metadata } from "next";
import ReservePage from "./ReservePage";

export const metadata: Metadata = { title: "رزرو آنلاین نوبت دندانپزشکی | ایستگاه دندان" };

export default function Page() {
  return <ReservePage />;
}
