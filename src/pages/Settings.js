import { useEffect, useRef, useState } from "react";
import api from "../api/api";

const themes = ["light", "dark", "system"];
const accents = [
  { id: "blue", label: "Blue", symbol: "🔵" },
  { id: "red", label: "Red", symbol: "🔴" },
  { id: "purple", label: "Purple", symbol: "🟣" },
  { id: "green", label: "Green", symbol: "🟢" },
  { id: "yellow", label: "Yellow", symbol: "🟡" },
];

const applyAppearance = (theme, accentColor) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.accent = accentColor;
  localStorage.setItem("theme", theme);
  localStorage.setItem("accentColor", accentColor);
  window.dispatchEvent(new Event("studyshare-appearance-change"));
};

const Spinner = ({ className = "h-4 w-4" }) => (
  <span
    className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    aria-hidden="true"
  />
);

const LoadingButtonContent = ({ loading, children }) => (
  <span className="inline-flex items-center justify-center gap-2">
    {loading && <Spinner />}
    {loading ? "Saving..." : children}
  </span>
);

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [fullName, setFullName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profilePictureUploading, setProfilePictureUploading] = useState(false);
  const [profilePictureRemoving, setProfilePictureRemoving] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [appearanceSaving, setAppearanceSaving] = useState(false);
  const [appearanceLoading, setAppearanceLoading] = useState("");
  const [accountDeleting, setAccountDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const showMessage = (text) => {
    setError("");
    setMessage(text);
  };

  const showError = (text) => {
    setMessage("");
    setError(text);
  };

  const syncLocalStorage = (user) => {
    localStorage.setItem("fullName", user.fullName || "");
    localStorage.setItem("username", user.username || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("matricNumber", user.matricNumber || "");
    localStorage.setItem("profilePicture", user.profilePicture || "");
    localStorage.setItem("theme", user.theme || "system");
    localStorage.setItem("accentColor", user.accentColor || "blue");
  };

  const loadProfilePicture = async () => {
    try {
      const response = await api.get("/settings/profile-picture", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      setProfilePictureUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
    } catch {
      setProfilePictureUrl("");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/settings");
        const user = response.data;
        setSettings(user);
        setFullName(user.fullName || "");
        setMatricNumber(user.matricNumber || "");
        syncLocalStorage(user);
        applyAppearance(user.theme || "system", user.accentColor || "blue");
        if (user.profilePicture) await loadProfilePicture();
      } catch (err) {
        showError(err.response?.data?.message || "Unable to load settings.");
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    try {
      const response = await api.patch("/settings/profile", {
        fullName,
        matricNumber,
      });
      setSettings(response.data);
      syncLocalStorage(response.data);
      showMessage("Profile details saved.");
    } catch (err) {
      showError(err.response?.data?.message || "Unable to save profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const uploadProfilePicture = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setProfilePictureUploading(true);
      const response = await api.post("/settings/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSettings(response.data);
      syncLocalStorage(response.data);
      await loadProfilePicture();
      showMessage("Profile picture updated.");
    } catch (err) {
      showError(err.response?.data?.message || "Unable to update profile picture.");
    } finally {
      setProfilePictureUploading(false);
      event.target.value = "";
    }
  };

  const removeProfilePicture = async () => {
    try {
      setProfilePictureRemoving(true);
      const response = await api.delete("/settings/profile-picture");
      setSettings(response.data);
      syncLocalStorage(response.data);
      setProfilePictureUrl("");
      showMessage("Profile picture removed.");
    } catch (err) {
      showError(err.response?.data?.message || "Unable to remove profile picture.");
    } finally {
      setProfilePictureRemoving(false);
    }
  };

  const saveAppearance = async (field, value) => {
    const loadingKey = `${field}:${value}`;
    try {
      setAppearanceSaving(true);
      setAppearanceLoading(loadingKey);
      const response = await api.patch("/settings/appearance", { [field]: value });
      setSettings(response.data);
      syncLocalStorage(response.data);
      applyAppearance(response.data.theme, response.data.accentColor);
      showMessage("Appearance updated.");
    } catch (err) {
      showError(err.response?.data?.message || "Unable to save appearance.");
    } finally {
      setAppearanceSaving(false);
      setAppearanceLoading("");
    }
  };

  const savePrivacy = async (value) => {
    try {
      setPrivacySaving(true);
      const response = await api.patch("/settings/privacy", {
        showUsernameOnMaterials: value,
      });
      setSettings(response.data);
      syncLocalStorage(response.data);
      showMessage("Privacy setting updated.");
    } catch (err) {
      showError(err.response?.data?.message || "Unable to save privacy setting.");
    } finally {
      setPrivacySaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    try {
      setPasswordChanging(true);
      await api.patch("/settings/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      showMessage("Password changed successfully.");
    } catch (err) {
      showError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setPasswordChanging(false);
    }
  };

  const deleteAccount = async (event) => {
    event.preventDefault();

    if (deleteConfirmation !== "I agree to delete my account") {
      showError('Type exactly "I agree to delete my account".');
      return;
    }

    if (!window.confirm("This permanently deletes your StudyShare account. Continue?")) {
      return;
    }

    try {
      setAccountDeleting(true);
      await api.delete("/settings/account", {
        data: {
          confirmation: deleteConfirmation,
          password: deletePassword,
        },
      });

      localStorage.clear();
      window.location.href = "/register";
    } catch (err) {
      showError(err.response?.data?.message || "Unable to delete account.");
      setAccountDeleting(false);
    }
  };

  if (!settings) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 rounded-3xl bg-white p-8 shadow-sm">
          <Spinner className="h-5 w-5 text-[var(--accent)]" />
          <span className="font-semibold text-slate-600">Loading settings...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your StudyShare account and preferences.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Profile picture</h2>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt="Profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-[var(--accent-soft)]" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--accent)] text-3xl font-black text-white">
                {(settings.fullName?.[0] || "S").toUpperCase()}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={uploadProfilePicture}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={profilePictureUploading || profilePictureRemoving}
                className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profilePictureUploading ? (
                  <LoadingButtonContent loading>Upload</LoadingButtonContent>
                ) : settings.profilePicture ? "Change" : "Upload"}
              </button>
              {settings.profilePicture && (
                <button
                  onClick={removeProfilePicture}
                  disabled={profilePictureUploading || profilePictureRemoving}
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profilePictureRemoving ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner />
                      Removing...
                    </span>
                  ) : "Remove"}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Account</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-slate-700">Email address</label>
              <input value={settings.email || ""} readOnly className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600" />
              <p className="mt-1 text-xs text-slate-400">Email is view-only.</p>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Username</label>
              <input value={settings.username || ""} readOnly className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600" />
            </div>
          </div>

          <form onSubmit={saveProfile} className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-slate-700">Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">
                Matriculation number <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <input value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <button
              disabled={profileSaving}
              className="w-fit rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LoadingButtonContent loading={profileSaving}>Save profile</LoadingButtonContent>
            </button>
          </form>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Password</h2>
          <form onSubmit={changePassword} className="mt-5 grid gap-4 sm:grid-cols-2">
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            <button
              disabled={passwordChanging}
              className="w-fit rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LoadingButtonContent loading={passwordChanging}>Change password</LoadingButtonContent>
            </button>
          </form>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Privacy</h2>
          <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="font-bold text-slate-800">Show username on uploaded materials</p>
              <p className="mt-1 text-xs text-slate-500">
                When disabled, your username is hidden from material listings.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.showUsernameOnMaterials}
              onChange={(e) => savePrivacy(e.target.checked)}
              disabled={privacySaving}
              className="h-5 w-5 accent-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
            />
            {privacySaving && <Spinner className="h-4 w-4 text-[var(--accent)]" />}
          </label>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Appearance</h2>

          <div className="mt-5">
            <p className="mb-3 text-sm font-bold text-slate-700">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => saveAppearance("theme", theme)}
                  disabled={appearanceSaving}
                  className={`rounded-xl border px-3 py-3 text-sm font-bold capitalize disabled:cursor-not-allowed disabled:opacity-60 ${
                    settings.theme === theme
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {appearanceLoading === `theme:${theme}` && <Spinner />}
                    {theme === "system" ? "System default" : theme}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-bold text-slate-700">Accent colour</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {accents.map((accent) => (
                <button
                  key={accent.id}
                  onClick={() => saveAppearance("accentColor", accent.id)}
                  disabled={appearanceSaving}
                  className={`rounded-xl border px-3 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                    settings.accentColor === accent.id
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-1">
                    {appearanceLoading === `accentColor:${accent.id}` && <Spinner />}
                    <span className="mr-1">{accent.symbol}</span>{accent.label}
                    {accent.id === "blue" && <span className="ml-1 text-xs text-slate-400">(default)</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-black text-red-800">Account deletion</h2>
          <p className="mt-2 text-sm leading-6 text-red-700">
            This permanently deletes your account, flashcards, uploaded-material records and stored profile picture.
          </p>
          <form onSubmit={deleteAccount} className="mt-5 space-y-4">
            <input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="I agree to delete my account"
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500"
            />
            <input
              type="password"
              required
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500"
            />
            <button
              disabled={accountDeleting}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                {accountDeleting && <Spinner />}
                {accountDeleting ? "Deleting account..." : "Confirm deletion"}
              </span>
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
