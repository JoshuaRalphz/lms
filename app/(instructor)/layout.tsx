import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isTeacher } from '@/lib/instructor';

import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";

const InstructorLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth()

  if (!userId) {
    return redirect("/sign-in")
  }

  if (!isTeacher(userId)) {
    return redirect("/");
  }

  return (
    <div className="h-full flex flex-col">
      <Topbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InstructorLayout;
