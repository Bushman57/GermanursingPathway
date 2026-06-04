import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegisterInterestForm } from "@/components/register/RegisterInterestForm";
import { metaFromKeys } from "@/lib/pageMeta";

export const Route = createFileRoute("/register")({
  head: () => metaFromKeys("register"),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <RegisterInterestForm source="register" />
      </main>
      <Footer />
    </div>
  );
}
