"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { scentImageUrl } from "@/lib/format";
import { saveScent, deleteScent } from "./actions";

export type AdminScent = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

type ScentForm = {
  slug: string;
  name: string;
  description: string;
  image_url: string;
};

function blankForm(): ScentForm {
  return { slug: "", name: "", description: "", image_url: "" };
}

function scentToForm(scent: AdminScent): ScentForm {
  return {
    slug: scent.slug,
    name: scent.name,
    description: scent.description ?? "",
    image_url: scent.image_url ?? "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ScentsAdminClient({
  initialScents,
}: {
  initialScents: AdminScent[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [scents] = useState(initialScents);
  const [selectedId, setSelectedId] = useState(initialScents[0]?.id ?? "");
  const [form, setForm] = useState<ScentForm>(
    initialScents[0] ? scentToForm(initialScents[0]) : blankForm(),
  );
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [, startTransition] = useTransition();

  const selectedScent = scents.find((scent) => scent.id === selectedId);

  const filtered = scents.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      (s.description ?? "").toLowerCase().includes(q)
    );
  });

  function selectScent(scent: AdminScent) {
    setSelectedId(scent.id);
    setForm(scentToForm(scent));
    setMessage("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function newScent() {
    setSelectedId("");
    setForm(blankForm());
    setMessage("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function update<K extends keyof ScentForm>(key: K, value: ScentForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const fd = new FormData();
    if (selectedId) fd.set("id", selectedId);
    fd.set("name", form.name);
    fd.set("slug", form.slug);
    fd.set("description", form.description);
    fd.set("image_url", form.image_url);
    const file = fileRef.current?.files?.[0];
    if (file) fd.set("image_file", file);

    const result = await saveScent(fd);
    setIsSaving(false);

    if (!result.ok) {
      setMessage(result.error);
      return;
    }

    setMessage("Scent saved.");
    if (fileRef.current) fileRef.current.value = "";
    startTransition(() => router.refresh());
  }

  async function onDelete() {
    if (!selectedScent) return;
    const ok = window.confirm(`Delete the “${selectedScent.name}” scent?`);
    if (!ok) return;
    setIsSaving(true);
    setMessage("");
    const result = await deleteScent(selectedScent.id);
    setIsSaving(false);

    if (!result.ok) {
      setMessage(result.error);
      return;
    }

    setSelectedId("");
    setForm(blankForm());
    setMessage("Scent deleted.");
    startTransition(() => router.refresh());
  }

  const previewSrc =
    form.image_url.trim() || (form.slug ? scentImageUrl(form.slug) : null);

  return (
    <>
      <header className="adminPageHead">
        <div>
          <p className="eyebrow">Scents</p>
          <h1>Scent library.</h1>
          <p>Name, slug, description, and image — that&rsquo;s all you need.</p>
        </div>
        <div className="adminButtonRow">
          <button
            className="adminButton adminButtonPrimary"
            onClick={newScent}
            type="button"
          >
            + New scent
          </button>
        </div>
      </header>

      <section className="adminSplit">
        <div>
          <input
            aria-label="Search scents"
            className="adminInput"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or slug…"
            style={{ marginBottom: "0.6rem" }}
            type="search"
            value={search}
          />
          <div className="adminList">
            {filtered.length === 0 ? (
              <p className="adminEmpty">No scents found.</p>
            ) : (
              filtered.map((scent) => {
                const thumb =
                  scent.image_url ?? scentImageUrl(scent.slug);
                return (
                  <button
                    className={`adminListItem scentListItem${scent.id === selectedId ? " adminListItemActive" : ""}`}
                    key={scent.id}
                    onClick={() => selectScent(scent)}
                    type="button"
                  >
                    <span className="scentListThumb" aria-hidden>
                      {thumb ? (
                        <Image
                          alt=""
                          fill
                          sizes="36px"
                          src={thumb}
                        />
                      ) : (
                        <span className="scentListThumbFallback">
                          {scent.name.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="scentListMeta">
                      <span style={{ fontWeight: 500 }}>{scent.name}</span>
                      <small>{scent.slug}</small>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <form className="adminCard adminForm" onSubmit={onSubmit}>
          <div className="adminPanelHead">
            <h2>{selectedScent ? `Edit ${selectedScent.name}` : "New scent"}</h2>
          </div>

          <div className="scentEditLayout">
            <aside className="scentEditPreview" aria-label="Image preview">
              <div className="scentPreviewFrame">
                {previewSrc ? (
                  <Image
                    alt=""
                    fill
                    sizes="220px"
                    src={previewSrc}
                  />
                ) : (
                  <span className="scentPreviewEmpty">No image yet</span>
                )}
              </div>
              <p className="scentPreviewCaption">Preview</p>
            </aside>

            <div className="scentEditFields">
              <div className="adminFormGrid">
                <label className="adminFormRow">
                  <span className="adminFormLabel">Name</span>
                  <input
                    className="adminInput"
                    onChange={(e) => update("name", e.target.value)}
                    required
                    type="text"
                    value={form.name}
                  />
                </label>
                <label className="adminFormRow">
                  <span className="adminFormLabel">Slug</span>
                  <input
                    className="adminInput"
                    onBlur={() =>
                      update("slug", slugify(form.slug || form.name))
                    }
                    onChange={(e) => update("slug", e.target.value)}
                    placeholder="auto-from-name"
                    type="text"
                    value={form.slug}
                  />
                </label>
              </div>

              <label className="adminFormRow">
                <span className="adminFormLabel">Description</span>
                <textarea
                  className="adminTextarea"
                  onChange={(e) => update("description", e.target.value)}
                  value={form.description}
                />
              </label>

              <label className="adminFormRow">
                <span className="adminFormLabel">Image URL</span>
                <input
                  className="adminInput"
                  onChange={(e) => update("image_url", e.target.value)}
                  placeholder="https://… (or upload below)"
                  type="url"
                  value={form.image_url}
                />
              </label>

              <label className="adminFormRow">
                <span className="adminFormLabel">Or upload an image</span>
                <input
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="adminInput"
                  ref={fileRef}
                  type="file"
                />
              </label>
            </div>
          </div>

          {message && <div className="adminToast">{message}</div>}

          <div className="adminButtonRow">
            {selectedScent && (
              <button
                className="adminButton adminButtonDanger"
                disabled={isSaving}
                onClick={onDelete}
                type="button"
              >
                Delete
              </button>
            )}
            <button
              className="adminButton adminButtonPrimary"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving…" : selectedScent ? "Save changes" : "Create scent"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
