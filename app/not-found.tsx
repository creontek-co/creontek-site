import { Pill } from "@/components/ui/Buttons";

export default function NotFound() {
  return (
    <div className="page paper not-found">
      <span className="mono page-eyebrow">Sheet 404</span>
      <h1>This page isn&apos;t on the plan.</h1>
      <Pill href="/">Back to home</Pill>
    </div>
  );
}
