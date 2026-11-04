import { Button } from "@base-ui/react";
import Link from "next/link";
import { Home, Settings, HelpCircle } from "lucide-react";
import { useState } from "react";

type AppUser = {
  id: string;
  name: string;
  email: string;
};

type SidebarProps = {
  isOpen: boolean;
  user: AppUser | null;
  onLogout: () => void;
};

export default function Sidebar({ isOpen, user, onLogout }: SidebarProps) {
  if (!isOpen) {
    return null;
  }

  //    const user = {
  //      id: "1",
  //      name: "priya",
  //      email: "priya@gmail.com",
  //      image: "./app/image.jpg",
  //   };

  //  const handleLogout = () => {
  //   setUser(null);
  //   setEmail("");
  //   setPassword("");
  //   setLoginError("");
  //   setShowLogin(true); // opens the login form after logout
  // };

  return (
    <aside className="h-60 w-40 bg-gray-900 text-white p-4  hover:border-white-900 ">
      <nav className="flex flex-col">
        <Link href="/">
          <Button className="hover-white-900">
            <Home size={20} className="fixed top-25 left-6 justify-start" />
            <span className="fixed top-25 left-16">Home</span>
          </Button>
        </Link>
        <Link href="/settingspage">
          <Button>
            <Settings size={20} className="fixed left-6 top-39 justify-start" />
            <span className="fixed top-39 left-16">Settings</span>
          </Button>
        </Link>
        <Link href="/helppage">
          <Button>
            <HelpCircle
              size={20}
              className="fixed left-6 top-53 justify-start "
            />
            <span className="fixed top-53 left-16">Help</span>
          </Button>
        </Link>

        {user ? (
          <>
            <Button type="button" className="fixed top-65 left-10 text-white">
              Log out
            </Button>
          </>
        ) : (
          <> </>
        )}
      </nav>
    </aside>
  );
}
