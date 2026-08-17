import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import FlashcardSetCard from "../components/FlashcardSetCard";

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
      setFlashcardSets(
        Array.isArray(response.data) ? response.data.slice(0, 4) : []
      );
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
    const term = search.toLowerCase();

    return files.filter((file) => {
      const title = String(file.title || "").toLowerCase();
      const courseCode = String(file.courseCode || "").toLowerCase();

      const matchesSearch =
        title.includes(term) || courseCode.includes(term);

      const matchesFilter =
        filterType === "All" || file.type === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [files, search, filterType]);

  const totalDownloads = useMemo(
    () => files.reduce((total, file) => total + Number(file.downloads || 0), 0),
    [files]
  );

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#07152f] via-[#122d68] to-violet-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                Welcome back
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Welcome, {userName} 👋
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Your academic workspace for sharing materials, generating
                flashcards and studying smarter.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/generate-flashcards"
                className="inline-flex w-fit items-center rounded-xl bg-white px-5 py-3 text-sm font-black text-violet-700 shadow-lg transition hover:bg-blue-50 active:scale-[0.98]"
              >
                ✦ Generate Flashcards
              </Link>
              <Link
                to="/my-flashcards"
                className="inline-flex w-fit items-center rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                My Flashcards
              </Link>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/20">
              <div className="px-3 py-4 text-center sm:px-5">
                <p className="text-2xl font-black sm:text-3xl">{files.length}</p>
                <p className="mt-1 text-[11px] font-semibold text-blue-100 sm:text-xs">
                  Uploads
                </p>
              </div>
              <div className="px-3 py-4 text-center sm:px-5">
                <p className="text-2xl font-black sm:text-3xl">{totalDownloads}</p>
                <p className="mt-1 text-[11px] font-semibold text-blue-100 sm:text-xs">
                  Downloads
                </p>
              </div>
              <div className="px-3 py-4 text-center sm:px-5">
                <p className="text-2xl font-black sm:text-3xl">{flashcardSets.length}</p>
                <p className="mt-1 text-[11px] font-semibold text-blue-100 sm:text-xs">
                  Flashcard Sets
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">
              Upload Material
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a resource to the StudyShare repository.
            </p>

            {uploadMsg.text && (
              <div
                className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
                  uploadMsg.isError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {uploadMsg.text}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="mt-5 space-y-4">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resource title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white"
              />

              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="Course code e.g. MBC201"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white"
              >
                <option value="Material">Lecture Material</option>
                <option value="Past Question">Past Question Paper</option>
              </select>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Short description"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white"
              />

              <input
                id="material-file"
                type="file"
                required
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:font-bold file:text-violet-700"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-violet-600 py-3 text-sm font-black text-white shadow-lg shadow-violet-100 hover:bg-violet-700"
              >
                Publish Document
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  My Flashcard Sets
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest saved AI-generated sets.
                </p>
              </div>
              <Link
                to="/my-flashcards"
                className="whitespace-nowrap rounded-xl border border-violet-200 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50"
              >
                View All →
              </Link>
            </div>

            {flashcardSets.length ? (
              <div className="space-y-3">
                {flashcardSets.map((set) => (
                  <FlashcardSetCard
                    key={set.id}
                    set={set}
                    onDelete={async (id) => {
                      try {
                        await api.delete(`/flashcards/${id}`);
                        fetchFlashcards();
                      } catch (error) {
                        window.alert(
                          error.response?.data?.message ||
                            "Unable to delete flashcard set."
                        );
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <p className="font-bold text-slate-700">
                  No flashcard sets yet.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Generate one from your study material.
                </p>
                <Link
                  to="/generate-flashcards"
                  className="mt-4 inline-block rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white"
                >
                  Generate Now
                </Link>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Academic Materials
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and download resources shared in your repository.
              </p>
            </div>

            <input
              type="text"
              placeholder="Search title or course code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 lg:max-w-sm"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["All", "Material", "Past Question"].map((value) => (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${
                  filterType === value
                    ? "bg-violet-600 text-white"
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
                    className="rounded-2xl border border-slate-200 p-5 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-md bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase text-violet-700">
                        {file.type || "Material"}
                      </span>
                      {file.courseCode && (
                        <span className="rounded bg-slate-50 px-2 py-1 text-xs font-bold text-slate-400">
                          {file.courseCode}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-bold text-slate-900">
                      {file.title || filename}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {file.description || "No description provided."}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-400">
                        Downloads: {file.downloads ?? 0}
                      </span>

                      <button
                        onClick={() => handleDownload(fileId, filename)}
                        className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100"
                      >
                        ↓ Download
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm font-medium text-slate-400">
                No matching academic materials found.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
