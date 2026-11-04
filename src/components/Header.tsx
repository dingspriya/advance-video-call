"use client";
import { Button } from "./ui/button";
import Link from "next/link";
import { Menu, Mic, Plus, SearchIcon, VideoIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";

type AppUser = {
  id: string;
  name: string;
  email: string;
};

type HeaderProps = {
  onMenuClick: () => void;
  user: AppUser | null;
  onUserChange: (user: AppUser | null) => void;
};

export default function Header({
  onMenuClick,
  user,
  onUserChange,
}: HeaderProps) {
  const [meetingCode, setMeetingCode] = useState("");

  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [SignupError, setSignupError] = useState("");
  const [LoginError, setLoginError] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    try {
      const response = await fetch("http://localhost:4000/api/Signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSignupError(result.error || "Login failed.");
        return;
      }

      onUserChange(result.user);
      setShowSignup(false);
      setEmail("");
      setPassword("");
    } catch {
      setSignupError("Could not connect to the server.");
    }
  };
  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoginError(result.error || "Could not sign in.");
        return;
      }
      localStorage.setItem("currentUser", JSON.stringify(result.user));

      onUserChange(result.user);
      setShowLogin(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setLoginError("Could not connect to the server.");
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowContacts(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) onUserChange(JSON.parse(saved));
  }, [onUserChange]);

  return (
    <header className="bg-h-screen">
      <div className="flex-1 h-20 bg-black">
        <Button
          onClick={onMenuClick}
          className="fixed top-6 left-6 z-100 bg-gray-900"
        >
          <Menu />
        </Button>

        <Link href={"/"}>
          <div className="flex-1 ">
            <svg
              className=" fixed right-230 bottom-125 w-124 h-22"
              viewBox="0 0 250 250"
            >
              <rect
                x="58"
                y="72"
                width="88"
                height="96"
                rx="10"
                fill="#877bb0"
              />
              <circle cx="78" cy="145" r="7" fill="white" />

              <path
                d="M145 105 L168 88 Q178 84 178 96 V145 Q178 157 168 153 L145 137 Z"
                fill="#c6c6e8"
              />
            </svg>
          </div>
          <span className="text-white font-medium text-2xl fixed left-35 top-7">
            Video call
          </span>
          <span className="text-white font-stretch-30% fixed left-48 top-10 ">
            advance
          </span>
        </Link>

        <form>
          <div className="bg-black w-150 h-10 rounded-full  border-b-2 border-t-2 text-white-2 fixed top-6.5 left-77 p-5 ">
            <a href="./searchbar">
              <input
                type="search"
                placeholder="Search"
                value={search}
                onFocus={() => setShowContacts(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowContacts(true);
                }}
                className="w-150 h-10 rounded-full  border-b-2 border-t-2 bg-black text-white outline-none fixed top-6.5 left-77 p-5"
              />
              <Button
                type="submit"
                variant="outline"
                className="rounded-r-4xl h-10 text-white border-white fixed left-219 top-7 "
              >
                <SearchIcon />
              </Button>
            </a>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="bg-black text-white fixed left-230 top-9 "
          >
            <Mic />
          </Button>
        </form>

        <div>
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8 text-b-center text-size fixed left-302 top-5">
                    <AvatarFallback>
                      {user.name?.[0] || user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
              </DropdownMenu>
              <div className="fixed top-6 left-270 border-none w-17 text-center text-white">
                <Button
                  type="button"
                  onClick={() => localStorage.removeItem("currentUser")}
                  // onClick={() => {
                  //   onUserChange(null);
                  //   setShowLogin(false);
                  //   setShowSignup(false);
                  // }}
                >
                  Log Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={() => setShowLogin(true)}
                className="fixed top-6 left-290 border-none w-20 text-center text-white"
              >
                Sign In
              </Button>
              {showLogin && (
                <div className="fixed inset-0 z-200 flex items-center justify-center text-white bg-black/70">
                  <div className="w-100 rounded-2xl bg-gray-900 p-8">
                    <div className="mb-6 flex justify-between">
                      <h2 className="text-2xl font-bold text-white">Sign In</h2>
                      <Button type="button" onClick={() => setShowLogin(false)}>
                        X
                      </Button>
                    </div>

                    <form onSubmit={handleSignin}>
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-90 h-10 "
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-90 h-10 "
                      />

                      {LoginError && (
                        <p className="text-red-500">{LoginError}</p>
                      )}

                      <Button
                        type="submit"
                        className="w-20 h-10 absolute left-180 top-85 "
                      >
                        Sign In
                      </Button>
                    </form>
                  </div>
                </div>
              )}
              <Button
                onClick={() => setShowSignup(true)}
                className="fixed top-6 left-260 border-none w-20 text-center text-white"
              >
                Sign Up
              </Button>
              {showSignup && (
                <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/70">
                  <div className="w-100 rounded-2xl bg-gray-900 p-8">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">Sign Up</h2>

                      <Button
                        type="button"
                        onClick={() => setShowSignup(false)}
                        className="text-white"
                      >
                        X
                      </Button>
                    </div>

                    <form onSubmit={handleSignup}>
                      {/* EMAIL */}
                      <div className="mb-4">
                        <label className="mb-2 block text-white">Email</label>

                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="
                               w-full  
                                                        rounded-lg
                                                        border
                                                        border-gray-600
                                                       bg-black
                                                         p-3
                                                        text-white
                                                       outline-none
                                                      "
                        />
                      </div>

                      {/* PASSWORD */}
                      <div className="mb-4">
                        <label className="mb-2 block  text-white">
                          Password
                        </label>

                        <input
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="              w-full
                                                            rounded-lg
                                                            border
                                                           border-gray-600
                                                           bg-black
                                                            p-3
                                                           text-white
                                                            outline-none                                                                "
                        />
                      </div>

                      {/* ERROR */}
                      {SignupError && (
                        <p className="mb-4 text-sm text-red-500">
                          {SignupError}
                        </p>
                      )}

                      {/* LOGIN */}
                      <Button type="submit" className="w-full">
                        Sign Up
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="fixed top-125 left-250">
          <Link href={"/invitepage"}>
            <Button className="w-25 h-12 b">
              <div>
                <Plus size={20} viewBox="5 5 18 18" />
              </div>
              <span className="border-none ">New</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
