"use client";

import { useEffect, useRef } from "react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Hand, X } from "lucide-react";
import {
  SwitchCamera,
  Mic,
  MicOff,
  VideoOff,
  Video,
  Users,
  Phone,
  MessageCircle,
  Paperclip,
  Smile,
  Send,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import React from "react";
import { useSearchParams } from "next/navigation";
import { RecordIcon } from "@hugeicons/core-free-icons";
import { MoreVertical, Monitor, Circle, Square } from "lucide-react";

type contacts = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  micOn: boolean;
  cameraOn: boolean;
};

export default function Callpage() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const searchParams = useSearchParams();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const screenStreamRef = useRef<MediaStream | null>(null);

  const meetingCode = searchParams.get("meeting");

  const selectedUserIds = searchParams.get("users")?.split(",") || [];

  const roomId = searchParams.get("room") || "default-room";
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = searchParams.get("userId") || "";
  const userName = searchParams.get("name") || "Guest";
  const recordingDisplayRef = useRef<MediaStream | null>(null);
  const screenShareRef = useRef<MediaStream | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [showRecordingPreview, setShowRecordingPreview] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [joined, setJoined] = useState(false);
  const [roomFull, setRoomFull] = useState(false);
  const recordingCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawFrameRef = useRef<number | null>(null);

  const [participants, setParticipants] = useState<contacts[]>([]);

  const remoteParticipants = participants.filter(
    (participant) => participant.id !== userId,
  );
  const userEmail = searchParams.get("email") || "";

  const participant = {
    id: userId,
    name: userName,
    email: userEmail,
    avatar: "",
    micOn,
    cameraOn,
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowUsers(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //   const participantRef = ref(
  //     database,
  //     `rooms/${roomId}/participants/${userId}`,
  //   );

  //   void set(participantRef, {
  //     id: userId,
  //     name: userEmail ? userEmail.split("@")[0] : "Guest",
  //     email: userEmail,
  //     avatar: "",
  //     micOn: true,
  //     cameraOn: true,
  //   });

  //   void onDisconnect(participantRef).remove();

  //   return () => {
  //     void remove(participantRef);
  //   };
  // }, [roomId, userId, userEmail]);

  // useEffect(() => {
  //   const participantsRef = ref(database, `rooms/${roomId}/participants`);

  //   const unsubscribe = onValue(
  //     participantsRef,
  //     (snapshot) => {
  //       const data = snapshot.val() ?? {};

  //       const list = Object.entries(data).map(([id, participant]) => ({
  //         ...(participant as Omit<contacts, "id">),
  //         id, // Firebase child key is the unique participant ID
  //       }));

  //       setParticipants(list);
  //     },
  //     (error) => {
  //       console.error("Could not load participants:", error);
  //     },
  //   );
  //   return unsubscribe;
  // }, [roomId]);

  // useEffect(() => {
  //   if (!joined) return;

  //   const participantRef = ref(
  //     database,
  //     `rooms/${roomId}/participants/${userId}`,
  //   );

  //   void update(participantRef, { micOn, cameraOn });
  // }, [roomId, userId, micOn, cameraOn, joined]);

  const [messages, setMessages] = useState<
    {
      id: number;
      sender: string;
      text?: string;
      file?: string;
    }[]
  >([]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "You",
        text: message,
      },
    ]);

    setMessage("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "You",
        file: file.name,
      },
    ]);

    e.target.value = "";
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 3840 },
            height: { ideal: 2160 },
            frameRate: { ideal: 30 },
            facingMode: { ideal: "user" },
          },
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const track = stream.getVideoTracks()[0];
        console.log("Camera settings actually granted:", track.getSettings());

        setCameraOn(true);
      } catch (error) {
        console.error("Camera error:", error);
      }
    };
    startCamera();
  }, []);

  useEffect(() => {
    if (!joined) {
      setCallSeconds(0);
      return;
    }

    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      setCallSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [joined]);

  const minutes = String(Math.floor(callSeconds / 60)).padStart(2, "0");
  const seconds = String(callSeconds % 60).padStart(2, "0");

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [participants, cameraOn]);

  const toggleCamera = () => {
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    const cameratracks = stream.getVideoTracks()[0];
    cameratracks.enabled = !cameratracks.enabled;
    console.log(cameratracks.getSettings());

    const settings = cameratracks.getSettings();

    console.log("Camera Width:", settings.width);
    console.log("Camera Height:", settings.height);
    console.log("Camera FPS:", settings.frameRate);
    console.log("Full Camera Settings:", settings);

    setCameraOn(cameratracks.enabled);
  };

  const toggleMic = () => {
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    const audioTracks = stream.getAudioTracks();

    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;

      setMicOn(track.enabled);
    });
  };

  const startRecording = () => {
    const canvas = recordingCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      context.fillStyle = "#111827";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const videos = Array.from(
        document.querySelectorAll<HTMLVideoElement>("video[data-call-video]"),
      ).filter((video) => video.readyState >= 2);

      const columns = videos.length > 1 ? 2 : 1;
      const rows = Math.max(1, Math.ceil(videos.length / columns));
      const tileWidth = canvas.width / columns;
      const tileHeight = canvas.height / rows;

      videos.forEach((video, index) => {
        const x = (index % columns) * tileWidth;
        const y = Math.floor(index / columns) * tileHeight;
        context.drawImage(video, x, y, tileWidth, tileHeight);
      });

      drawFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const canvasStream = canvas.captureStream(30);
    const micTrack = streamRef.current?.getAudioTracks()[0];
    const recordingStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...(micTrack ? [micTrack] : []),
    ]);

    const recorder = new MediaRecorder(recordingStream);
    recordingChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordingChunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordingChunksRef.current, {
        type: recorder.mimeType || "video/webm",
      });
      setRecordingUrl(URL.createObjectURL(blob));
      setShowRecordingPreview(true);
      canvasStream.getTracks().forEach((track) => track.stop());

      if (drawFrameRef.current !== null) {
        cancelAnimationFrame(drawFrameRef.current);
        drawFrameRef.current = null;
      }
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  };
  const stopRecording = () => {
    const recorder = recorderRef.current;

    if (recorder?.state === "recording") {
      recorder.stop();
    }

    setIsRecording(false);
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenShareRef.current = stream;
      setIsScreenSharing(true);

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        screenShareRef.current = null;
        setIsScreenSharing(false);
      });
    } catch (error) {
      // Canceling the browser's share picker is okay.
      if (error instanceof DOMException && error.name === "NotAllowedError")
        return;
      console.error("Could not share screen:", error);
    }
  };

  const stopScreenShare = () => {
    screenShareRef.current?.getTracks().forEach((track) => track.stop());
    screenShareRef.current = null;
    setIsScreenSharing(false);
  };

  const endCall = async () => {
    setJoined(false); // stops the call timer

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    await fetch(`${participantsUrl}/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });

    setCameraOn(false);
    setMicOn(false);
  };
  const participantsUrl = `http://localhost:4000/api/rooms/${encodeURIComponent(roomId)}/participants`;

  useEffect(() => {
    if (!joined || !roomId || !userId) return;

    const participant = {
      id: userId,
      name: userName,
      email: userEmail,
      avatar: "",
      micOn,
      cameraOn,
    };

    let active = true;

    async function joinRoom() {
      try {
        const response = await fetch(participantsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participant }),
        });

        if (!response.ok) {
          const details = await response.text();
          throw new Error(`Join failed (${response.status}): ${details}`);
        }
        if (active) await loadParticipants();
      } catch (error) {
        console.error(error);
      }
    }

    void joinRoom();

    // MongoDB does not push live updates like Firebase's onValue.
    const interval = window.setInterval(() => {
      void loadParticipants();
    }, 2000);

    return () => {
      active = false;
      window.clearInterval(interval);

      void fetch(`${participantsUrl}/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
    };
  }, [joined, roomId, userId, userEmail]);

  async function loadParticipants() {
    try {
      const response = await fetch(participantsUrl);
      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Load failed (${response.status}): ${details}`);
      }

      const result = await response.json();
      setParticipants(result.participants ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!joined || !roomId || !userId) return;

    void fetch(`${participantsUrl}/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ micOn, cameraOn }),
    });
  }, [joined, roomId, userId, micOn, cameraOn]);

  return (
    <main className="flex-1 bg-gray-900 text-white">
      <div className="w-full h-screen p-2 bg-black">
        {roomFull && (
          <p className="text-white">This call is full (maximum 6 people).</p>
        )}
        <div
          className={`grid h-full gap-2 p-2 ${
            remoteParticipants.length <= 1
              ? "grid-cols-1"
              : remoteParticipants.length <= 3
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="relative bg-gray-800 rounded-lg overflow-hidden"
            >
              {participant.id === userId && cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className=" w-full h-full -contain absolute align-center top-0 left-7 right-0 bottom-0 p-2 rounded-lg "
                />
              ) : (
                <div className=" absolute bottom-30 left-70 justify-center px-3 py-1 rounded">
                  <Avatar className="">
                    <AvatarFallback className=" bg-black text-white">
                      {participant.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <canvas
        ref={recordingCanvasRef}
        width={1280}
        height={720}
        className="hidden"
      />
      <Button className="fixed left-250 top-5  w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
        <SwitchCamera size={24} />
      </Button>
      <footer>
        <button
          onClick={toggleMic}
          className=" w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 fixed top-120 left-75"
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          onClick={toggleCamera}
          className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 fixed top-120 left-110"
        >
          {cameraOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        <button
          onClick={endCall}
          className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 fixed top-120 left-145"
        >
          <Phone size={22} />
        </button>

        <button
          onClick={() => setShowUsers((prev) => !prev)}
          className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 fixed top-120 left-180"
        >
          <Users size={22} />
          {showUsers && (
            <div className="fixed right-5 top-18 w-70  bg-black text-white rounded-lg shadow-lg p-4 z-50">
              <h2 className="text-lg font-bold mb-4">
                Participants ({participants.length})
              </h2>

              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="border rounded-lg p-3">
                    <div className="relative left-23 font-semibold w-8 h-8  rounded-full p-1 flex-center bg-white text-black ">
                      <Avatar>
                        <AvatarFallback>{participant.avatar}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="font-semibold  ">{participant.name}</div>

                    <div className="text-sm text-gray-500">
                      {participant.email}
                    </div>

                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="">
                        {participant.micOn ? <Mic /> : <MicOff />}
                      </span>

                      <span>
                        {participant.cameraOn ? <Video /> : <VideoOff />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </button>

        {/* CHAT BUTTON */}
        <div
          ref={searchBoxRef}
          className="fixed top-120 left-215 w-12 h-12 rounded-full 
             bg-gray-700 flex items-center justify-center 
             hover:bg-gray-600 cursor-pointer transition duration-300"
          onClick={() => setShowChat((prev) => !prev)}
        >
          <MessageCircle size={22} />
        </div>
        {/* <div>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            title={isRecording ? "Stop recording" : "Start recording"}
            className="fixed right-6 bottom-24 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white"
          >
            {isRecording ? <Square size={20} /> : <Circle size={20} />}
          </button>
          {recordingUrl && (
            <a
              href={recordingUrl}
              download="call-recording.webm"
              className="fixed right-6 bottom-12 rounded bg-blue-600 px-4 py-2 text-white"
            >
              Download recording
            </a>
          )}
        </div> */}

        <div className="fixed top-120 left-250 rounded-full  bg-gray-700 flex items-center justify-center  hover:bg-gray-600 cursor-pointer transition duration-300">
          <button
            type="button"
            onClick={() => setShowMoreMenu((open) => !open)}
            aria-label="More call options"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-white"
          >
            <MoreVertical />
          </button>

          {showMoreMenu && (
            <div className="absolute bottom-14 right-0 w-52 rounded-lg bg-gray-800 p-2 text-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  isRecording ? stopRecording() : startRecording();
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-3 rounded p-3 hover:bg-gray-700"
              >
                {isRecording ? <Square size={18} /> : <Circle size={18} />}
                {isRecording ? "Stop recording" : "Start recording"}
              </button>

              <button
                type="button"
                onClick={() => {
                  void startScreenShare();
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-3 rounded p-3 hover:bg-gray-700"
              >
                <Monitor size={18} />
                {isScreenSharing ? "Stop screen share" : "Share screen"}
              </button>
            </div>
          )}
          {isRecording && (
            <div className="fixed left-5 top-5 z-50 rounded bg-red-600 px-3 py-2 text-white">
              ● REC
            </div>
          )}

          {recordingUrl && showRecordingPreview && (
            <div className="fixed right-5 top-5 z-50 w-80 rounded bg-gray-900 p-3">
              <button
                type="button"
                onClick={() => setShowRecordingPreview(false)}
                aria-label="Close recording preview"
                className="absolute right-2 top-2 text-white"
              >
                <X size={20} />
              </button>

              <video src={recordingUrl} controls className="w-full rounded" />

              <a
                href={recordingUrl}
                download="call-recording.webm"
                className="mt-2 block text-blue-300"
              >
                Download recording
              </a>
            </div>
          )}
        </div>

        {/* CHAT PANEL */}
        {showChat && (
          <div
            className="fixed right-8 top-20 bottom-30 w-80 
               bg-white text-black rounded-lg shadow-xl 
               z-50 flex flex-col transition duration-300 ease-in-out"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">Chat</h2>

              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 transition duration-300 ease-in-out">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 mt-10">
                  No messages yet
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="bg-gray-100 rounded-lg p-2">
                    <p className="text-sm font-semibold">{msg.sender}</p>

                    {/* TEXT MESSAGE */}
                    {msg.text && <p className="wrap-break-word">{msg.text}</p>}

                    {/* FILE */}
                    {msg.file && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Paperclip size={16} />

                        <span className="break-all">{msg.file}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* MESSAGE INPUT AREA */}
            <div className="relative border-t p-2">
              {/* EMOJI PICKER */}
              {showEmoji && (
                <div className="absolute bottom-full right-2 mb-2 z-50 transition duration-300 ease-in-out">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setMessage((prev) => prev + emojiObject.emoji);
                    }}
                  />
                </div>
              )}

              {/* FILE INPUT */}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFile}
              />

              {/* INPUT ROW */}
              <div className="flex items-center gap-2">
                {/* FILE BUTTON */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 hover:bg-gray-100 rounded-full transition duration-100 ease-in-out"
                >
                  <Paperclip size={20} />
                </button>

                {/* EMOJI BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowEmoji((prev) => !prev)}
                  className="p-1 hover:bg-gray-100 rounded-full transition duration-100 ease-in-out"
                >
                  <Smile size={20} />
                </button>

                {/* HAND RAISE */}
                <button
                  type="button"
                  onClick={() => setHandRaised((prev) => !prev)}
                  className={`p-1 rounded-full transition duration-300 ${
                    handRaised
                      ? "bg-yellow-400 text-black"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  title={handRaised ? "Lower hand" : "Raise hand"}
                >
                  <Hand size={20} />
                </button>

                {/* MESSAGE INPUT */}
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="p-1 flex-1 border rounded-full px-1 py-2 outline-none transition duration-100 ease-in-out"
                />

                {/* SEND BUTTON */}
                <button
                  type="button"
                  onClick={sendMessage}
                  className="p-2 bg-blue-600 text-white rounded-full transition duration-100 ease-in-out"
                >
                  <Send size={17} />
                </button>
              </div>
            </div>
          </div>
        )}
        {!joined && (
          <button
            type="button"
            onClick={() => setJoined(true)}
            className="fixed bottom-30 left-155 z-50 rounded bg-blue-600 px-4 py-2 text-white"
          >
            Join call
          </button>
        )}
        {joined && (
          <div className="fixed top-5 left-150 z-50 rounded bg-black px-3 py-2 text-white">
            {minutes}:{seconds}
          </div>
        )}
      </footer>
    </main>
  );
}
