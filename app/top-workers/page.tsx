import { TopWorkers } from "@/components/top-workers"

export default function TopWorkersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Top Workers</h1>
      <TopWorkers className="w-full" />
    </div>
  )
}

