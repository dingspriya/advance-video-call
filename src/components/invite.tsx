"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@base-ui/react";
import {
  ArrowLeft,
  CopyIcon,
  LinkIcon,
  SearchIcon,
  ShareIcon,
  Users,
  VideoIcon,
} from "lucide-react";
import { contacts } from "@/lib/contacts";

export default function Invite() {
  const contacts = [
    {
      id: 1,
      name: "Priya",
      email: "priya@gmail.com",
    },
    {
      id: 2,
      name: "Rahul",
      email: "rahul@gmail.com",
    },
    {
      id: 3,
      name: "Kumar",
      email: "kumar@gmail.com",
    },
    {
      id: 4,
      name: "Anitha",
      email: "anitha@gmail.com",
    },
  ];
  const [meetingCode, setMeetingCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [share, setShare] = useState(false);

  const [showContacts, setShowContacts] = useState(false);
  const [linkReady, setLinkReady] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  

  const searchBoxRef = useRef<HTMLDivElement>(null);
 

  async function handleShare() {
    const meetingCode = "MTG-AAVVF3";
    const inviteLink = `${window.location.origin}/invitepage?code=${encodeURIComponent(meetingCode)}`;

    if (navigator.share) {
      await navigator.share({
        title: "Join my call",
        url: inviteLink,
      });
    } else {
      await navigator.clipboard.writeText(inviteLink);
      alert("Meeting link copied!");
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

  function generateMeetingCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setMeetingCode(`MTG - ${code}`);
    setCopied(false);
  }

  // async function handleShare() {
  //   if (!meetingCode) return;

  //   const shareData = {
  //     title: "Meeting code",
  //     text: meetingCode,
  //   };

  //   try {
  //     if (navigator.canShare && navigator.canShare(shareData)) {
  //       await navigator.share(shareData);
  //       setShare(true);
  //     } else {
  //       await navigator.clipboard.writeText(meetingCode);
  //       setCopied(true);
  //       setTimeout(() => setShare(false), 1000);
  //     }
  //   } catch (error) {
  //     console.error("Failed to share meeting code:", error);
  //   }
  // }

  async function handleCopy() {
    if (!meetingCode) return;

    try {
      await navigator.clipboard.writeText(meetingCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to copy meeting code:", error);
    }
  }

  return (
    <div className="w-screen h-screen bg-gray-900 text-white">
      <div className="w-screen h-13 bg-black">
        <a href={"/"} className="font-bold fixed left-5 top-4">
          <ArrowLeft />
        </a>
        <h3 className="fixed left-15 top-4">Start a Call</h3>
      </div>
      <a href="./searchbar">
        <Button>
          <input
            type="text"
            placeholder="Search users..."
            className=" bg-gray-800 w-150 h-7 rounded-full fixed top-3 left-70 p-4 "
          />

          <SearchIcon size={15} className="fixed left-214 top-5.5" />
        </Button>
      </a>

      <div>
        <div>
          <Button
            onClick={() => {
              generateMeetingCode();
              setLinkReady(true);
            }}
            className="w-27 h-22 fixed left-110 top-30  rounded-lg bg-black flex flex-col items-center 
                    justify-center text-white transition duration-300 hover:bg-gray-800"
          >
            <LinkIcon className="relative right-1 bottom-1.5" />
            <span>Create link</span>
          </Button>
        </div>

        <a href="./searchbar">
          <button
            className="w-27 h-22 fixed left-150 top-30  rounded-lg bg-black flex flex-col items-center 
                    justify-center text-white transition duration-300 hover:bg-gray-800"
          >
            <Users className="w-8 h-8 mb-2" />
            <span>Group call</span>
          </button>
        </a>
      </div>

      {linkReady && (
        <div className="w-full h-40 fixed top-115 bottom-0 bg-black">
          <p className="relative left-112 top-8 font-bold">Meeting Code</p>
          <input
            className="border-b-2 bg-gray-800 border-black fixed left-140  w-40 h-10 text-center"
            value={meetingCode}
            readOnly
          />

          <Button onClick={handleCopy}>
            <CopyIcon size={20} className="relative top-3 left-185 " />
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
  );
}
