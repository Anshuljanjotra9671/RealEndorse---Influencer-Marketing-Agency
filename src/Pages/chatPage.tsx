import React, { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // framer-motion v11 import path
import { nanoid } from "nanoid";

type Sender = "brand" | "influencer";
type UploadState = "idle" | "uploading" | "error" | "done";

interface Message {
  id: string;
  sender: Sender;
  text?: string;
  createdAt: string;
  attachments?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string; // after successful upload
  progress?: number; // 0-100
  state: UploadState;
  previewDataUrl?: string; // for images
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

const MessageBubble: React.FC<{
  m: Message;
  isOwn: boolean;
  showAvatar: boolean;
}> = ({ m, isOwn, showAvatar }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {!isOwn && showAvatar && (
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 shrink-0" />
      )}
      <div className={`max-w-[76%] ${isOwn ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-3 py-2 text-sm shadow-sm ring-1 ${
            isOwn
              ? "bg-blue-600 text-white ring-blue-700/30"
              : "bg-white text-gray-900 ring-gray-200"
          }`}
        >
          {m.text && <p className="leading-relaxed">{m.text}</p>}

          {m.attachments && m.attachments.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {m.attachments.map((f) => (
                <div
                  key={f.id}
                  className={`group relative rounded-lg overflow-hidden ring-1 ${
                    isOwn ? "ring-white/20" : "ring-gray-200"
                  }`}
                >
                  {/* If it’s an image, show preview; otherwise show a file tile */}
                  {f.type.startsWith("image/") && f.url ? (
                    <img
                      src={f.url}
                      alt={f.name}
                      className="h-28 w-full object-cover"
                    />
                  ) : f.type.startsWith("image/") && f.previewDataUrl ? (
                    <img
                      src={f.previewDataUrl}
                      alt={f.name}
                      className="h-28 w-full object-cover"
                    />
                  ) : (
                    <div className="h-28 w-full flex items-center justify-center bg-gray-50 text-xs text-gray-600">
                      {f.name}
                    </div>
                  )}

                  {f.state === "uploading" && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-end">
                      <div className="w-full h-1.5 bg-white/30">
                        <div
                          className="h-1.5 bg-emerald-400 transition-[width]"
                          style={{ width: `${f.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className={`mt-1 text-[11px] ${
            isOwn ? "text-white/80" : "text-gray-500"
          }`}
        >
          {new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      {isOwn && showAvatar && (
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shrink-0" />
      )}
    </motion.div>
  );
};

const Dropzone: React.FC<{
  onFiles: (files: File[]) => void;
  busy?: boolean;
}> = ({ onFiles, busy }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onPick = () => inputRef.current?.click();

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (busy) return;
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) onFiles(files);
    },
    [busy, onFiles]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (busy) return;
      const files = Array.from(e.target.files || []);
      if (files.length) onFiles(files);
      if (inputRef.current) inputRef.current.value = "";
    },
    [busy, onFiles]
  );

  const prevent = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onDragOver={prevent}
      onDragEnter={prevent}
      onDragLeave={prevent}
      onDrop={onDrop}
      className="relative rounded-xl border border-dashed border-gray-300 bg-white/60 hover:bg-white transition-colors"
      aria-label="Drag and drop files here"
    >
      <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={onPick}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-3 py-2 text-xs font-semibold hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
              <path
                fill="currentColor"
                d="M19 13v8H5v-8H3v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8zM11 3h2v8h3l-4 4l-4-4h3z"
              />
            </svg>
            Upload
          </motion.button>
          <p className="text-xs text-gray-600">
            Drag & drop files or click Upload. PNG/JPG/WEBP/PDF up to 15MB.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          onChange={onChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
        {busy && (
          <div className="text-[11px] text-gray-500">Uploading…</div>
        )}
      </div>
    </div>
  );
};

const ChatComposer: React.FC<{
  onSend: (text: string, pendingUploads: UploadedFile[]) => void;
  onChooseFiles: (files: File[]) => void;
  uploads: UploadedFile[];
  setUploads: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}> = ({ onSend, onChooseFiles, uploads, setUploads }) => {
  const [text, setText] = useState("");

  const hasUploading = uploads.some((u) => u.state === "uploading");

  const removeUpload = (id: string) =>
    setUploads((prev) => prev.filter((u) => u.id !== id));

  const canSend = text.trim().length > 0 || uploads.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!canSend || hasUploading) return;
      onSend(text.trim(), uploads);
      setText("");
      setUploads([]);
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
      {uploads.length > 0 && (
        <div className="mb-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {uploads.map((f) => (
            <div
              key={f.id}
              className="relative rounded-lg overflow-hidden ring-1 ring-gray-200"
            >
              {f.type.startsWith("image/") && f.previewDataUrl ? (
                <img
                  src={f.previewDataUrl}
                  alt={f.name}
                  className="h-24 w-full object-cover"
                />
              ) : (
                <div className="h-24 w-full flex items-center justify-center bg-gray-50 text-[11px] text-gray-600 px-2 text-center">
                  {f.name}
                </div>
              )}
              {f.state === "uploading" && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-end">
                  <div className="w-full h-1.5 bg-white/30">
                    <div
                      className="h-1.5 bg-emerald-400 transition-[width]"
                      style={{ width: `${f.progress ?? 0}%` }}
                    />
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeUpload(f.id)}
                className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 hover:bg-black"
                aria-label={`Remove ${f.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="m12 10.586l4.95-4.95l1.414 1.414L13.414 12l4.95 4.95l-1.414 1.414L12 13.414l-4.95 4.95l-1.414-1.414L10.586 12l-4.95-4.95l1.414-1.414z"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <Dropzone onFiles={onChooseFiles} busy={hasUploading} />

      <div className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message…"
              rows={1}
              className="block w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                title="Emoji"
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              >
                😊
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                title="Attach"
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                onClick={() => {
                  const el = document.querySelector<HTMLInputElement>(".sr-only[type=file]");
                  el?.click();
                }}
              >
                📎
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={!canSend || hasUploading}
                onClick={() => {
                  if (!canSend || hasUploading) return;
                  onSend(text.trim(), uploads);
                  setText("");
                  setUploads([]);
                }}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  canSend && !hasUploading
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Send
              </motion.button>
            </div>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatHeader: React.FC<{
  title: string;
  subtitle?: string;
  presence?: "online" | "offline";
}> = ({ title, subtitle, presence = "online" }) => {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-rose-500" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                presence === "online" ? "bg-emerald-400" : "bg-gray-300"
              }`}
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="text-xs text-gray-500">{subtitle || "Secure chat"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            View Campaign
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-900 text-white hover:bg-black"
          >
            Call
          </motion.button>
        </div>
      </div>
    </div>
  );
};

const ThreadList: React.FC<{
  threads: { id: string; name: string; last: string; unread?: number }[];
  activeId: string | null;
  onOpen: (id: string) => void;
}> = ({ threads, activeId, onOpen }) => {
  return (
    <div className="h-full overflow-y-auto">
      {threads.map((t) => {
        const active = activeId === t.id;
        return (
          <motion.button
            key={t.id}
            layout
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => onOpen(t.id)}
            className={`w-full text-left px-3 py-3 border-b border-gray-100 flex items-center gap-3 transition-colors ${
              active ? "bg-blue-50/60" : "hover:bg-gray-50"
            }`}
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                {t.name}
              </div>
              <div className="text-xs text-gray-500 line-clamp-1">{t.last}</div>
            </div>
            {t.unread ? (
              <span className="ml-auto inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                {t.unread}
              </span>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
};

const ChatPage: React.FC = () => {
  const params = useParams(); // campaignId / conversationId
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nanoid(),
      sender: "influencer",
      text: "Hi! Thanks for selecting me. Should we confirm deliverables?",
      createdAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      sender: "brand",
      text: "Absolutely. One reel, two stories, and a static post over 2 weeks.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [threads] = useState([
    { id: "t1", name: "Alex Doe", last: "Great, sending the brief now.", unread: 2 },
    { id: "t2", name: "Sam K", last: "Thanks!", unread: 0 },
  ]);
  const [activeThread, setActiveThread] = useState<string | null>("t1");

  const grouped = useMemo(() => {
    const out: Array<{ sender: Sender; items: Message[] }> = [];
    for (const m of messages) {
      const last = out[out.length - 1];
      if (last && last.sender === m.sender) last.items.push(m);
      else out.push({ sender: m.sender, items: [m] });
    }
    return out;
  }, [messages]);

  const simulateUpload = async (files: File[]) => {
    // Validate and push pending files
    const toUpload: UploadedFile[] = [];
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE || !ALLOWED_TYPES.includes(f.type)) continue;

      const base: UploadedFile = {
        id: nanoid(),
        name: f.name,
        size: f.size,
        type: f.type,
        state: "uploading",
        progress: 0,
      };

      if (f.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setUploads((prev) =>
            prev.map((u) => (u.id === base.id ? { ...u, previewDataUrl: reader.result as string } : u))
          );
        };
        reader.readAsDataURL(f);
      }

      toUpload.push(base);
    }

    if (!toUpload.length) return;
    setUploads((prev) => [...prev, ...toUpload]);

    // Simulate progress, replace with actual API (e.g., Cloudinary or your server)
    await Promise.all(
      toUpload.map(
        (file) =>
          new Promise<void>((resolve) => {
            let p = 0;
            const iv = setInterval(() => {
              p += Math.random() * 18 + 6;
              if (p >= 100) {
                p = 100;
                clearInterval(iv);
                setUploads((prev) =>
                  prev.map((u) =>
                    u.id === file.id
                      ? {
                          ...u,
                          progress: 100,
                          state: "done",
                          url: file.previewDataUrl || URL.createObjectURL(new Blob()), // replace with returned URL
                        }
                      : u
                  )
                );
                resolve();
              } else {
                setUploads((prev) =>
                  prev.map((u) => (u.id === file.id ? { ...u, progress: Math.floor(p) } : u))
                );
              }
            }, 180);
          })
      )
    );
  };

  const handleSend = (text: string, pending: UploadedFile[]) => {
    const now = new Date().toISOString();
    const sent: Message = {
      id: nanoid(),
      sender: "brand",
      text: text || undefined,
      createdAt: now,
      attachments: pending.length ? pending.map((p) => ({ ...p })) : undefined,
    };
    setMessages((prev) => [...prev, sent]);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto h-full max-w-7xl grid grid-cols-12 gap-0">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-900">Conversations</div>
            <div className="text-xs text-gray-500">Campaign: {params.campaignId || params.conversationId}</div>
          </div>
          <ThreadList
            threads={threads}
            activeId={activeThread}
            onOpen={setActiveThread}
          />
        </aside>

        {/* Chat pane */}
        <main className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col">
          <ChatHeader title="Alex Doe" subtitle="Typically replies within 1 hr" presence="online" />

          <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3">
            <AnimatePresence initial={false}>
              {grouped.map((g, gi) => {
                const isOwn = g.sender === "brand";
                return (
                  <div key={gi} className="space-y-1.5">
                    {g.items.map((m, mi) => (
                      <MessageBubble
                        key={m.id}
                        m={m}
                        isOwn={isOwn}
                        showAvatar={mi === g.items.length - 1}
                      />
                    ))}
                  </div>
                );
              })}
            </AnimatePresence>
          </div>

          <ChatComposer
            onSend={handleSend}
            onChooseFiles={simulateUpload}
            uploads={uploads}
            setUploads={setUploads}
          />
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
