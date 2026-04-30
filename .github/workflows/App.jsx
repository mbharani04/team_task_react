import { useState, useEffect, useRef } from "react";

const STORAGE_KEYS = {
  USERS: "socialapp_users",
  CURRENT_USER: "socialapp_current_user",
  POSTS: "socialapp_posts",
};

const getStorage = (key) => JSON.parse(localStorage.getItem(key) || "null");
const setStorage = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─── ICONS ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "#e11d48" : "none"} stroke={filled ? "#e11d48" : "currentColor"} strokeWidth={2} className="w-5 h-5 transition-all duration-200">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round" />
  </svg>
);
const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const Avatar = ({ name = "", size = "md", color = "#6366f1" }) => {
  const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" }[size];
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ background: color }}>
      {name.charAt(0).toUpperCase() || "?"}
    </div>
  );
};

const AVATAR_COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#14b8a6"];
const getColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = () => {
    setError("");
    const users = getStorage(STORAGE_KEYS.USERS) || {};
    if (mode === "register") {
      if (!form.username || !form.email || !form.password) { setError("All fields are required."); triggerShake(); return; }
      if (form.password !== form.confirm) { setError("Passwords don't match."); triggerShake(); return; }
      if (users[form.email]) { setError("Email already registered."); triggerShake(); return; }
      const user = { username: form.username, email: form.email, password: form.password, bio: "", role: "", company: "", location: "", website: "", color: getColor(form.username) };
      users[form.email] = user;
      setStorage(STORAGE_KEYS.USERS, users);
      setStorage(STORAGE_KEYS.CURRENT_USER, user);
      onLogin(user);
    } else {
      if (!form.email || !form.password) { setError("Enter email and password."); triggerShake(); return; }
      const user = users[form.email];
      if (!user || user.password !== form.password) { setError("Invalid credentials."); triggerShake(); return; }
      setStorage(STORAGE_KEYS.CURRENT_USER, user);
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* animated bg */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-10 animate-pulse"
            style={{ width: `${200 + i * 80}px`, height: `${200 + i * 80}px`, background: `radial-gradient(circle, ${["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6"][i]}, transparent)`, top: `${[10,60,30,70,5,45][i]}%`, left: `${[5,70,40,20,80,55][i]}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${3 + i}s` }} />
        ))}
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <span className="text-4xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              login page
              
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Share your world</p>
        </div>

        {/* Card */}
        <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-8 ${shake ? "animate-bounce" : ""}`}>
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {mode === "register" && (
            <div className="mb-4">
              <label className="text-zinc-400 text-xs uppercase tracking-wider mb-1 block">Username</label>
              <input name="username" value={form.username} onChange={handle} placeholder="yourname"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          )}
          <div className="mb-4">
            <label className="text-zinc-400 text-xs uppercase tracking-wider mb-1 block">Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
          <div className="mb-4">
            <label className="text-zinc-400 text-xs uppercase tracking-wider mb-1 block">Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
          {mode === "register" && (
            <div className="mb-4">
              <label className="text-zinc-400 text-xs uppercase tracking-wider mb-1 block">Confirm Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handle} placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          )}

          <button onClick={submit}
            className="w-full mt-2 py-3 rounded-xl font-bold text-white text-sm tracking-wide bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 active:scale-95 transition-all duration-150">
            {mode === "login" ? "Log In" : "Create Account"}
          </button>

          <div className="mt-5 text-center text-sm text-zinc-500">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-purple-400 font-semibold hover:text-pink-400 transition-colors">
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CREATE POST MODAL ─────────────────────────────────────────────────────────
function CreatePostModal({ user, onPost, onClose }) {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target.result);
    reader.readAsDataURL(file);
    setPreviewError(false);
  };

  const submit = () => {
    if (!caption.trim() && !imageUrl) return;
    const post = {
      id: Date.now().toString(),
      userId: user.email,
      username: user.username,
      userColor: user.color,
      role: user.role || "",
      company: user.company || "",
      caption: caption.trim(),
      imageUrl,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    const posts = getStorage(STORAGE_KEYS.POSTS) || [];
    setStorage(STORAGE_KEYS.POSTS, [post, ...posts]);
    onPost(post);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm">Cancel</button>
          <span className="text-white font-semibold">Create post</span>
          <button onClick={submit} className="text-purple-400 font-bold text-sm hover:text-purple-300">Share</button>
        </div>

        <div className="p-5">
          <div className="flex gap-3 mb-4">
            <Avatar name={user.username} size="md" color={user.color} />
            <div>
              <p className="text-white font-semibold text-sm">{user.username}</p>
              {user.role && <p className="text-zinc-400 text-xs">{user.role}{user.company ? ` @ ${user.company}` : ""}</p>}
            </div>
          </div>

          <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-white placeholder-zinc-500 resize-none outline-none text-sm min-h-24 leading-relaxed" />

          {imageUrl && !previewError && (
            <div className="mt-3 rounded-xl overflow-hidden relative">
              <img src={imageUrl} alt="preview" className="w-full object-cover max-h-64 rounded-xl" onError={() => setPreviewError(true)} />
              <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black/80">✕</button>
            </div>
          )}
          {imageUrl && previewError && (
            <div className="mt-3 p-3 bg-zinc-800 rounded-xl text-zinc-400 text-xs">Image URL invalid.</div>
          )}
        </div>

        <div className="px-5 pb-5 flex items-center gap-3">
          <button onClick={() => fileRef.current.click()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
            <ImageIcon /> <span>Photo</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="flex-1" />
          <input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setPreviewError(false); }}
            placeholder="Or paste image URL…"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500" />
        </div>
      </div>
    </div>
  );
}

// ─── POST CARD ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onUpdate }) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const liked = post.likes.includes(currentUser.email);

  const toggleLike = () => {
    const posts = getStorage(STORAGE_KEYS.POSTS) || [];
    const updated = posts.map((p) => {
      if (p.id !== post.id) return p;
      const likes = liked ? p.likes.filter((e) => e !== currentUser.email) : [...p.likes, currentUser.email];
      return { ...p, likes };
    });
    setStorage(STORAGE_KEYS.POSTS, updated);
    onUpdate(updated.find((p) => p.id === post.id));
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const posts = getStorage(STORAGE_KEYS.POSTS) || [];
    const comment = { id: Date.now().toString(), userId: currentUser.email, username: currentUser.username, userColor: currentUser.color, text: commentText.trim(), createdAt: new Date().toISOString() };
    const updated = posts.map((p) => p.id !== post.id ? p : { ...p, comments: [...p.comments, comment] });
    setStorage(STORAGE_KEYS.POSTS, updated);
    onUpdate(updated.find((p) => p.id === post.id));
    setCommentText("");
  };

  const timeAgo = (iso) => {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4 hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative">
          <Avatar name={post.username} size="md" color={post.userColor} />
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-zinc-900" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-none">{post.username}</p>
          {(post.role || post.company) && (
            <p className="text-zinc-500 text-xs mt-0.5 flex items-center gap-1">
              <BriefcaseIcon />
              {post.role}{post.company ? ` · ${post.company}` : ""}
            </p>
          )}
        </div>
        <span className="text-zinc-600 text-xs flex-shrink-0">{timeAgo(post.createdAt)}</span>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3 text-white text-sm leading-relaxed">{post.caption}</div>
      )}

      {/* Image */}
      {post.imageUrl && (
        <div className="bg-zinc-950">
          <img src={post.imageUrl} alt="post" className="w-full object-cover max-h-96" onError={(e) => e.target.style.display = "none"} />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-4 py-1">
          <button onClick={toggleLike} className="flex items-center gap-1.5 group">
            <span className={`transition-transform ${liked ? "scale-125" : "group-hover:scale-110"}`}>
              <HeartIcon filled={liked} />
            </span>
            <span className={`text-xs font-medium ${liked ? "text-rose-500" : "text-zinc-400"}`}>
              {post.likes.length > 0 ? post.likes.length : ""}
            </span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
            <CommentIcon />
            <span className="text-xs font-medium">{post.comments.length > 0 ? post.comments.length : ""}</span>
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors ml-auto">
            <ShareIcon />
          </button>
        </div>

        {post.likes.length > 0 && (
          <p className="text-zinc-400 text-xs pb-1">
            {post.likes.length === 1 ? "1 like" : `${post.likes.length} likes`}
          </p>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-zinc-800 px-4 py-3">
          {post.comments.length > 0 && (
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {post.comments.map((c) => (
                <div key={c.id} className="flex gap-2 items-start">
                  <Avatar name={c.username} size="sm" color={c.userColor} />
                  <div className="bg-zinc-800 rounded-xl px-3 py-1.5 flex-1 min-w-0">
                    <span className="text-white text-xs font-semibold">{c.username} </span>
                    <span className="text-zinc-300 text-xs">{c.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <Avatar name={currentUser.username} size="sm" color={currentUser.color} />
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              placeholder="Add a comment…"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors" />
            <button onClick={addComment} disabled={!commentText.trim()}
              className="text-purple-400 text-xs font-bold hover:text-purple-300 disabled:text-zinc-600 transition-colors">
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROFILE CARD ──────────────────────────────────────────────────────────────
function ProfileCard({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: user.bio || "", role: user.role || "", company: user.company || "", location: user.location || "", website: user.website || "" });

  const save = () => {
    const users = getStorage(STORAGE_KEYS.USERS) || {};
    const updated = { ...user, ...form };
    users[user.email] = updated;
    setStorage(STORAGE_KEYS.USERS, users);
    setStorage(STORAGE_KEYS.CURRENT_USER, updated);
    onUpdate(updated);
    setEditing(false);
  };

  const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition-colors";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
      {/* Cover gradient */}
      <div className="h-16 rounded-xl mb-3 -mx-1" style={{ background: `linear-gradient(135deg, ${user.color}44, ${user.color}22, transparent)` }} />

      <div className="flex items-end gap-3 -mt-10 mb-3">
        <Avatar name={user.username} size="xl" color={user.color} />
        <div className="pb-1">
          <p className="text-white font-bold text-lg leading-tight">{user.username}</p>
          <p className="text-zinc-500 text-xs">{user.email}</p>
        </div>
      </div>

      {!editing ? (
        <div className="space-y-2">
          {user.bio && <p className="text-zinc-300 text-sm leading-relaxed">{user.bio}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {user.role && (
              <span className="text-zinc-400 text-xs flex items-center gap-1">
                <BriefcaseIcon /> {user.role}{user.company ? ` @ ${user.company}` : ""}
              </span>
            )}
            {user.location && (
              <span className="text-zinc-400 text-xs flex items-center gap-1"><LocationIcon /> {user.location}</span>
            )}
            {user.website && (
              <a href={user.website.startsWith("http") ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer"
                className="text-purple-400 text-xs flex items-center gap-1 hover:text-purple-300"><LinkIcon /> {user.website}</a>
            )}
          </div>
          <button onClick={() => setEditing(true)}
            className="mt-2 w-full border border-zinc-700 rounded-xl py-1.5 text-zinc-300 text-sm hover:border-zinc-500 hover:text-white transition-colors">
            Edit profile
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Write a bio…" className={`${inp} resize-none h-16`} />
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Job title / Role" className={inp} />
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company / Organization" className={inp} />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className={inp} />
          <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website URL" className={inp} />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditing(false)} className="flex-1 border border-zinc-700 rounded-xl py-1.5 text-zinc-400 text-sm hover:text-white transition-colors">Cancel</button>
            <button onClick={save} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl py-1.5 text-white text-sm font-semibold hover:opacity-90 transition-opacity">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage({ user, onLogout, onUserUpdate }) {
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setPosts(getStorage(STORAGE_KEYS.POSTS) || []);
  }, []);

  const handleNewPost = (post) => setPosts((prev) => [post, ...prev]);

  const handlePostUpdate = (updated) => {
    setPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  };

  const handleUserUpdate = (updated) => {
    setCurrentUser(updated);
    onUserUpdate(updated);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            socialgram
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold px-3 py-1.5 rounded-xl hover:opacity-90 active:scale-95 transition-all">
              <PlusIcon /> <span className="hidden sm:inline">New post</span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <Avatar name={currentUser.username} size="sm" color={currentUser.color} />
              <span className="text-zinc-300 text-sm hidden sm:block">{currentUser.username}</span>
            </div>
            <button onClick={onLogout} className="text-zinc-500 hover:text-white transition-colors p-1">
              <LogoutIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 order-1 lg:order-none">
          <ProfileCard user={currentUser} onUpdate={handleUserUpdate} />

          {/* Suggestions / Tips */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Quick tips</p>
            {["Share updates & achievements", "Connect with your network", "Like and comment on posts"].map((tip, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0" />
                <p className="text-zinc-400 text-xs">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="lg:col-span-2 order-2">
          {/* Story-style create row */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.username} size="md" color={currentUser.color} />
              <button onClick={() => setShowCreate(true)}
                className="flex-1 text-left bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-full px-4 py-2.5 text-zinc-500 text-sm transition-colors">
                What's on your mind, {currentUser.username.split(" ")[0]}?
              </button>
              <button onClick={() => setShowCreate(true)} className="text-zinc-400 hover:text-white transition-colors p-2">
                <ImageIcon />
              </button>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📸</div>
              <p className="text-zinc-400 font-medium">No posts yet</p>
              <p className="text-zinc-600 text-sm mt-1">Be the first to share something!</p>
              <button onClick={() => setShowCreate(true)}
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Create a post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} onUpdate={handlePostUpdate} />
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <CreatePostModal user={currentUser} onPost={handleNewPost} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => getStorage(STORAGE_KEYS.CURRENT_USER));

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { setStorage(STORAGE_KEYS.CURRENT_USER, null); setUser(null); };
  const handleUserUpdate = (u) => setUser(u);

  if (!user) return <AuthScreen onLogin={handleLogin} />;
  return <LandingPage user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
}