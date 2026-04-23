import { ReviewForm } from "@/components/ReviewForm";

export default function Home() {
  return (
    <main className="flex-1 flex items-start justify-center px-6 py-12">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <ReviewForm />
      </div>
    </main>
  );
}
