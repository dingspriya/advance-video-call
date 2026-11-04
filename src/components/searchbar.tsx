"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@base-ui/react";
import {
  ArrowLeft,
  CopyIcon,
  LinkIcon,
  Radio,
  Ratio,
  SearchIcon,
  ShareIcon,
  Users,
  VideoIcon,
} from "lucide-react";
import Link from "next/link";

type ContactUser = {
  id: string;
  name: string;
  email: string;
};
type AppUser = {
  id: string;
  name: string;
  email: string;
};
type SearchbarProps = {
  currentUser: AppUser | null;
};

export default function Searchbar({ currentUser }: SearchbarProps) {
  const [savedContacts, setSavedContacts] = useState<ContactUser[]>([]);
  const [meetingCode, setMeetingCode] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [share, setShare] = useState(false);
  const [linkReady, setLinkReady] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [foundUsers, setFoundUsers] = useState<ContactUser[]>([]);
  const [message, setMessage] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<ContactUser[]>([]);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  async function saveContact(contactUserId: string) {
    if (!currentUser?.id) {
      setMessage("Sign in before saving contacts.");
      return;
    }

    const response = await fetch("http://localhost:4000/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerId: currentUser.id,
        contactUserId,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      setSavedContacts((previous) => {
        const person = foundUsers.find((user) => user.id === contactUserId);

        if (!person || previous.some((user) => user.id === contactUserId)) {
          return previous;
        }

        return [...previous, person];
      });
    }
    setMessage(
      response.ok
        ? "Contact saved."
        : result.error || "Could not save contact.",
    );
  }

  async function searchUsers(value: string) {
    setSearch(value);

    if (!value.trim()) {
      setFoundUsers([]);
      return;
    }

    const response = await fetch(
      `http://localhost:4000/api/users?search=${encodeURIComponent(value)}`,
    );
    const result = await response.json();

    if (response.ok) {
      setFoundUsers(result.users);
    } else {
      console.error(result.error);
    }
  }

  const callUrl =
    `/callpage?room=${encodeURIComponent(roomId)}` +
    `&userId=${encodeURIComponent(currentUser?.id ?? "")}` +
    `&name=${encodeURIComponent(currentUser?.name ?? "Guest")}` +
    `&users=${encodeURIComponent(
      selectedContacts.map((contact) => contact.id).join(","),
    )}`;

  useEffect(() => {
    if (!currentUser?.id) {
      setSavedContacts([]);
      return;
    }

    fetch(
      `http://localhost:4000/api/contacts?ownerId=${encodeURIComponent(currentUser.id)}`,
    )
      .then((response) => response.json())
      .then((result) => setSavedContacts(result.contacts || []))
      .catch((error) => console.error("Could not load contacts:", error));
  }, [currentUser?.id]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function generateMeetingCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const newRoomId = `MTG-${code}`;
    setMeetingCode(newRoomId);
    setRoomId(newRoomId);
    setCopied(false);
  }

  async function handleShare() {
    if (!meetingCode) return;

    const shareData = {
      title: "Meeting code",
      text: meetingCode,
    };

    try {
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShare(true);
      } else {
        await navigator.clipboard.writeText(meetingCode);
        setCopied(true);
        setTimeout(() => setShare(false), 1000);
      }
    } catch (error) {
      console.error("Failed to share meeting code:", error);
    }
  }

  async function handleCopy() {
    if (!roomId) return;

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${callUrl}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error("Could not copy call link:", error);
    }
  }

  return (
    <header>
      <div className="fixed top-70 left-130 text-gray-500">
        <h1>Search for your contacts here</h1>
      </div>
      <div className="w-screen h-15 bg-black">
        <a href="/" className="font-bold fixed left-10 top-4 text-white">
          <ArrowLeft size={30} />
        </a>

        <p className="text-white font-bold fixed left-20 top-5">Start a Call</p>
        <div className="absolute left-70 top-3 w-150 ">
          <div className="flex items-center bg-black w-full h-10 rounded-full px-4">
            <SearchIcon size={18} className="text-gray-300 mr-3" />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onClick={() => {}}
              onFocus={() => setShowContacts(true)}
              onChange={(event) => searchUsers(event.target.value)}
              className="w-full bg-transparent text-white outline-none"
            />
          </div>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
            {selectedContacts.map((contact) => (
              <div
                key={contact.id}
                className="w-45 flex  items-center gap-4 rounded-full bg-gray-300 p-3 px-3  py-2"
              >
                <span className="items-center">{contact.name}</span>
                <button
                  type="button"
                  className=""
                  aria-label={`Remove ${contact.name}`}
                  onClick={() =>
                    setSelectedContacts((current) =>
                      current.filter((selected) => selected.id !== contact.id),
                    )
                  }
                >
                  ×
                </button>

                {selectedContacts.length > 0 && (
                  <Link
                    href={callUrl}
                    aria-disabled={!roomId || selectedContacts.length === 0}
                    className={`rounded-lg bg-black px-6 py-3 fixed left-250 top-80  text-white ${
                      !roomId || selectedContacts.length === 0
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    Join
                  </Link>
                )}

                <div className="w-screen h-35 bg-black fixed top-112 left-0  text-white ">
                  <button
                    onClick={() => {
                      generateMeetingCode();
                      setLinkReady(true);
                    }}
                    className="bg-gray-800 w-60 h-10 fixed left-130 top-122 rounded-full"
                  >
                    Create and Share a Link
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Contacts and search results */}
          {showContacts && (
            <div
              ref={searchBoxRef}
              className="absolute top-20 left-0 w-full overflow-hidden rounded-xl bg-white shadow-xl z-50"
            >
              {search.trim() ? (
                foundUsers.length > 0 ? (
                  foundUsers.map((person) => (
                    <label
                      key={person.id}
                      className="flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        className="rounded-full"
                        checked={selectedContacts.some(
                          (contact) => contact.id === person.id,
                        )}
                        onChange={(event) => {
                          setSelectedContacts((current) =>
                            event.target.checked
                              ? current.some(
                                  (contact) => contact.id === person.id,
                                )
                                ? current
                                : [...current, person]
                              : current.filter(
                                  (contact) => contact.id !== person.id,
                                ),
                          );
                        }}
                      />
                      <span>
                        <span className="block font-semibold text-black">
                          {person.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {person.email}
                        </span>
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-gray-500">No user found</div>
                )
              ) : savedContacts.length > 0 ? (
                savedContacts.map((person) => (
                  <label
                    key={person.id}
                    className="flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      className="rounded-full"
                      checked={selectedContacts.some(
                        (contact) => contact.id === person.id,
                      )}
                      onChange={(event) => {
                        setSelectedContacts((current) =>
                          event.target.checked
                            ? current.some(
                                (contact) => contact.id === person.id,
                              )
                              ? current
                              : [...current, person]
                            : current.filter(
                                (contact) => contact.id !== person.id,
                              ),
                        );
                      }}
                    />
                    <span>
                      <span className="block font-semibold text-black">
                        {person.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {person.email}
                      </span>
                    </span>
                  </label>
                ))
              ) : (
                <div className="p-4 text-gray-500">No saved contacts yet</div>
              )}
            </div>
          )}
        </div>

        {linkReady && (
          <div className="w-full h-40 fixed  top-107 right-0 left-0 text-white bg-black">
            <Button
              onClick={() => generateMeetingCode()}
              className="relative left-112 top-8 font-bold"
            >
              Meeting Code
            </Button>
            <input
              className="border-b-2 bg-gray-800 border-black fixed left-140 top-114 w-40 h-10 text-center"
              value={meetingCode}
              readOnly
            />

            <Button onClick={handleCopy}>
              <CopyIcon size={20} className="relative top-10 left-160 " />
              {copied && <div className="fixed left-195 top-118">copied</div>}
            </Button>

            <Button
              onClick={handleShare}
              className="w-25 h-10  fixed top-127 left-145"
            >
              <ShareIcon size={15} className="relative top-8.5 left-4" />
              <p className="relative top-4 left-1">Share</p>
            </Button>
            {share && <div className="fixed left-155 top-140">shared!</div>}
          </div>
        )}
      </div>
    </header>
  );
}
