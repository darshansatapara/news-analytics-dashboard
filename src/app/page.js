import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default function HomePage() {
  return (
    <div className="flex h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">

      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto p-6">
          <DashboardContent />
        </main>
      </div>
    </div>
  );
}
