import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "spark") return <svg {...common}><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" /></svg>;
  if (name === "folder") return <svg {...common}><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" /><path d="M3.5 9h17" /></svg>;
  if (name === "upload") return <svg {...common}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></svg>;
  if (name === "cards") return <svg {...common}><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
  if (name === "download") return <svg {...common}><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></svg>;
  if (name === "book") return <svg {...common}><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21z" /><path d="M5 4.5v16" /><path d="M9 6h6M9 10h6" /></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
  if (name === "filter") return <svg {...common}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
  if (name === "chevron") return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>;
  if (name === "trend") return <svg {...common}><path d="m4 16 5-5 4 3 7-8" /><path d="M15 6h5v5" /></svg>;
  if (name === "bookmark") return <svg {...common}><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3-6 3z" /></svg>;
  return null;
}

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [type, setType] = useState("Material");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState({ text: "", isError: false });

  const userName = localStorage.getItem("fullName") || "Student";

  const fetchFiles = async () => {
    try {
      const response = await api.get("/files");
      setFiles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Unable to fetch files.", error);
    }
  };

  const fetchFlashcards = async () => {
    try {
      const response = await api.get("/flashcards");
      setFlashcardSets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Unable to fetch flashcard sets.", error);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchFlashcards();
  }, []);

  const handleUploadSubmit = async (event) => {
    event.preventDefault();
    setUploadMsg({ text: "", isError: false });

    if (!selectedFile) {
      setUploadMsg({
        text: "Please choose a file to upload.",
        isError: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("courseCode", courseCode);
    formData.append("type", type);
    formData.append("file", selectedFile);

    try {
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadMsg({
        text: "Resource uploaded successfully.",
        isError: false,
      });

      setTitle("");
      setDescription("");
      setCourseCode("");
      setSelectedFile(null);

      const input = document.getElementById("material-file");
      if (input) input.value = "";

      fetchFiles();
    } catch (error) {
      setUploadMsg({
        text: error.response?.data?.message || "Upload failed.",
        isError: true,
      });
    }
  };

  const handleDownload = async (fileId, originalName) => {
    try {
      const response = await api.get(`/files/download/${fileId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = originalName || "study-material";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      fetchFiles();
    } catch (error) {
      window.alert(
        error.response?.data?.message || "Unable to download this file."
      );
    }
  };

  const filteredFiles = useMemo(() => {
    const term = search.toLowerCase().trim();

    return files.filter((file) => {
      const fileTitle = String(file.title || "").toLowerCase();
      const fileCourse = String(file.courseCode || "").toLowerCase();

      const matchesSearch =
        !term || fileTitle.includes(term) || fileCourse.includes(term);

      const matchesFilter =
        filterType === "All" || file.type === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [files, search, filterType]);

  const totalDownloads = useMemo(
    () =>
      files.reduce(
        (total, file) => total + Number(file.downloads || 0),
        0
      ),
    [files]
  );

  const recentFiles = files.slice(0, 3);
  const recentFlashcards = flashcardSets.slice(0, 3);

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#f7f9fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* KEEPING THE WELCOME BAR EXACTLY AS REQUESTED */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#07152f] via-[#122d68] to-brand-accent p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                Welcome back
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Welcome, {userName} 👋
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Ready to learn something new today?
              </p>
            </div>

            <Link
              to="/generate-flashcards"
              className="inline-flex w-fit items-center rounded-xl bg-white px-5 py-3 text-sm font-black text-brand-blue shadow-lg transition hover:bg-blue-50 active:scale-[0.98]"
            >
              ✦ Generate Flashcards
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/20">
            <div className="px-3 py-4 text-center sm:px-5">
              <p className="text-2xl font-black sm:text-3xl">{files.length}</p>
              <p className="mt-1 text-[11px] font-semibold text-blue-100 sm:text-xs">
                Materials
              </p>
            </div>
            <div className="px-3 py-4 text-center sm:px-5">
              <p className="text-2xl font-black sm:text-3xl">{totalDownloads}</p>
              <p className="mt-1 text-[11px] font-semibold text-blue-100 sm:text-xs">
                Downloads
              </p>
            </div>
            <div className="px-3 py-4 text-center sm:px-5">
              <p className="text-2xl font-black sm:text-3xl">
                {flashcardSets.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-blue-100 sm:text-xs">
                Saved Sets
              </p>
            </div>
          </div>
        </section>

        {/* Quick actions — intentionally kept as a 3-column row on desktop */}
        <section id="features" className="mb-8">
          <div className="mb-5 flex items-center justify-between gap-4 px-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-[26px]">
              Quick Actions
            </h2>
            <a
              href="#study-hub"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-brand-accent transition hover:text-brand-blue"
            >
              View all features
              <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Link
              to="/generate-flashcards"
              className="group flex min-h-[285px] flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-brand-accent">
                <Icon name="spark" className="h-7 w-7" />
              </span>
              <h3 className="mt-6 text-xl font-black text-slate-900">AI Flashcards</h3>
              <p className="mt-2 max-w-xs text-[15px] leading-6 text-slate-500">
                Turn your study materials into smart revision cards.
              </p>
              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-brand-accent transition group-hover:bg-blue-100">
                Generate Flashcards
                <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              to="/my-flashcards"
              className="group flex min-h-[285px] flex-col rounded-3xl border border-emerald-100 bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Icon name="cards" className="h-7 w-7" />
              </span>
              <h3 className="mt-6 text-xl font-black text-slate-900">Save &amp; Study</h3>
              <p className="mt-2 max-w-xs text-[15px] leading-6 text-slate-500">
                Save your generated sets and study them anytime, anywhere.
              </p>
              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-600 transition group-hover:bg-emerald-100">
                View Saved Sets
                <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              to="/my-flashcards"
              className="group flex min-h-[285px] flex-col rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <Icon name="trend" className="h-7 w-7" />
              </span>
              <h3 className="mt-6 text-xl font-black text-slate-900">Better Learning</h3>
              <p className="mt-2 max-w-xs text-[15px] leading-6 text-slate-500">
                Revise more actively and improve retention from your materials.
              </p>
              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-2xl bg-violet-50 px-4 py-3 text-sm font-black text-violet-600 transition group-hover:bg-violet-100">
                Learn More
                <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </section>

        {/* Study hub — intentionally kept as a 2-column row on desktop */}
        <section id="study-hub" className="mb-8">
          <div className="mb-5 px-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-[26px]">
              Your Study Hub
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <a
              href="#materials"
              className="group relative min-h-[245px] overflow-hidden rounded-3xl border border-blue-100 bg-blue-50/70 p-6 transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-white/45 transition group-hover:scale-110" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent text-white shadow-sm">
                    <Icon name="folder" className="h-7 w-7" />
                  </span>
                  <Icon name="chevron" className="h-6 w-6 text-brand-blue" />
                </div>
                <h3 className="mt-6 text-xl font-black text-slate-900">My Materials</h3>
                <p className="mt-2 max-w-xs text-[15px] leading-6 text-slate-500">
                  Upload, manage and access your study materials.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-brand-blue">
                  Go to My Materials
                  <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </a>

            <Link
              to="/my-flashcards"
              className="group relative min-h-[245px] overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-white/45 transition group-hover:scale-110" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                    <Icon name="bookmark" className="h-7 w-7" />
                  </span>
                  <Icon name="chevron" className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="mt-6 text-xl font-black text-slate-900">My Flashcard Sets</h3>
                <p className="mt-2 max-w-xs text-[15px] leading-6 text-slate-500">
                  Browse your saved flashcard sets and keep revising.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-emerald-700">
                  Go to Saved Sets
                  <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Study tip */}
        <section className="mb-8 flex items-center gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)] sm:px-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xl">
            💡
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
              <p className="text-sm font-black text-slate-900">Study tip</p>
              <p className="text-sm text-slate-500">
                Short daily revision leads to long-term retention.
              </p>
            </div>
          </div>
          <a href="#features" className="hidden shrink-0 text-sm font-black text-brand-accent hover:text-brand-blue sm:inline-flex sm:items-center sm:gap-1">
            See more tips
            <Icon name="arrow" className="h-4 w-4" />
          </a>
        </section>

        {/* Upload workspace */}
        <section
          id="upload"
          className="mb-8 scroll-mt-24 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white px-5 py-5 sm:px-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-accent">
                  Contribute
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Upload a study material
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Help the next student by sharing something useful.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">
                PDF, DOCX and supported files
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {uploadMsg.text && (
              <div
                className={`mb-5 rounded-2xl border p-3 text-sm font-semibold ${
                  uploadMsg.isError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {uploadMsg.text}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="grid gap-4 lg:grid-cols-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resource title"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="Course code e.g. MBC201"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="Material">Lecture Material</option>
                <option value="Past Question">Past Question Paper</option>
              </select>

              <input
                id="material-file"
                type="file"
                required
                onChange={(e) =>
                  setSelectedFile(e.target.files?.[0] || null)
                }
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-bold file:text-brand-blue"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Short description (optional)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-blue-50 lg:col-span-2"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-accent py-3.5 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-brand-blue active:scale-[0.99] lg:col-span-2"
              >
                <Icon name="upload" className="h-5 w-5" />
                Publish Material
              </button>
            </form>
          </div>
        </section>

        {/* Full repository */}
        <section
          id="materials"
          className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Study repository
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Academic materials
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Find and download resources shared on StudyShare.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon name="search" className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search title or course code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1 text-xs font-bold text-slate-400">
              <Icon name="filter" className="h-4 w-4" />
              Filter
            </span>
            {["All", "Material", "Past Question"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilterType(value)}
                className={`rounded-xl px-3.5 py-2 text-xs font-black transition ${
                  filterType === value
                    ? "bg-brand-accent text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {value === "All" ? "All Files" : value}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {filteredFiles.length ? (
              filteredFiles.map((file) => {
                const fileId = file.id ?? file._id;
                const filename =
                  file.filename || file.originalname || file.title;

                return (
                  <article
                    key={fileId}
                    className="group rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                        <Icon name="book" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-500">
                        {file.type || "Material"}
                      </span>
                    </div>

                    <h3 className="mt-4 font-black text-slate-900">
                      {file.title || filename}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {file.courseCode && (
                        <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-brand-blue">
                          {file.courseCode}
                        </span>
                      )}
                      <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400">
                        {file.downloads ?? 0} downloads
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                      {file.description || "No description provided."}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="truncate pr-3 text-[11px] text-slate-400">
                        {filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownload(fileId, filename)}
                        className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-brand-blue transition hover:bg-brand-accent hover:text-white"
                      >
                        Download
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <p className="text-sm font-black text-slate-700">
                  No matching academic materials
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try another search term or change the filter.
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
