import type { Metadata } from "next";
import JSConfetti from "js-confetti";
import ScheduleCallForm from "@/components/auth/components/schedule-call-form";

export const metadata: Metadata = {
  title: "Schedule a Call | Flex AI",
};

export default function ScheduleCall() {
  return <ScheduleCallForm />;
}
