"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/sidebar";

type AppUser = {
  id: string;
  name: string;
  email: string;
};

export default function Page() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Header
        user={user}
        onUserChange={setUser}
        onMenuClick={() => setIsSidebarOpen((open) => !open)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        user={user}
        onLogout={() => setUser(null)}
      />
    </>
  );
}