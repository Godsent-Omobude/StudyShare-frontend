import { useState } from "react";
import api from "../api/api";
import FlashcardList from "../components/FlashcardList";

export default function GenerateFlashcards() {
  const [title, setTitle] = useState("");
  const [document, setDocument] = useState(null);
  const [count, setCount] = useState("20");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [flashcards, setFlashcards] = useState([]);

  const generateFlashcards = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setFlashcards([]);

    if (!document) {
      setError("Please choose a PDF or DOCX document.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("document", document);
    formData.append("count", count);
    formData.append("difficulty", difficulty);

    try {
      setLoading(true);

      const response = await api.post("/ai/flashcards", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const generated =
        response.data?.flashcardSet?.flashcards ||
        response.data?.flashcards ||
        [];

      setFlashcards(generated);
      setMessage(
        response.data?.message ||
          "Flashcards generated and saved successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to generate flashcards. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-bold text-violet-600">AI STUDY TOOL</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            AI Flashcards
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload your study material and let AI turn it into revision cards.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900">
                Generate Flashcards
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose the number and difficulty before generating.
              </p>
            </div>

            <form onSubmit={generateFlashcards} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  1. Upload Document
                </label>
                <label className="mt-2 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/40 px-5 text-center transition hover:bg-violet-50">
                  <span className="text-4xl text-violet-600">↥</span>
                  <span className="mt-2 font-bold text-slate-800">
                    {document ? document.name : "Click to browse for a document"}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    PDF or DOCX
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => setDocument(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  2. Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Biochemistry Week 1"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    3. Number of Flashcards
                  </label>
                  <select
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    {[5, 10, 20, 30, 50, 75, 100].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    4. Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating..." : "✦ Generate Flashcards"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl bg-violet-50 p-5">
                <p className="text-2xl">📄</p>
                <h3 className="mt-3 font-black text-slate-900">
                  Upload
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Upload your PDF or DOCX study material.
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-2xl">✦</p>
                <h3 className="mt-3 font-black text-slate-900">
                  Generate
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Gemini analyses the extracted document text and creates cards.
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-2xl">▤</p>
                <h3 className="mt-3 font-black text-slate-900">
                  Study & Learn
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your generated set is saved and can be studied later.
                </p>
              </div>
            </div>
          </section>
        </div>

        <FlashcardList flashcards={flashcards} />
      </div>
    </main>
  );
}
