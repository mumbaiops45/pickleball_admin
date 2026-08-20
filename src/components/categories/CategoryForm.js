"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { FormError } from "@/components/ui/DataState";
import { TextInput, Textarea } from "@/components/ui/Field";
import ImagePicker from "@/components/ui/ImagePicker";
import Modal from "@/components/ui/Modal";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";

const EMPTY = { name: "", description: "", image: "", isActive: true };

export default function CategoryForm({ category, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    category
      ? {
          name: category.name ?? "",
          description: category.description ?? "",
          image: category.image ?? "",
          isActive: category.isActive ?? true,
        }
      : EMPTY,
  );

  const create = useCreateCategory();
  const update = useUpdateCategory();

  const editing = Boolean(category);
  const busy = create.loading || update.loading;
  const error = create.error ?? update.error;

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      // the model defaults `image` to null, so an empty box must send null
      image: form.image.trim() || null,
      isActive: form.isActive,
    };

    const saved = editing
      ? await update.mutate(category._id, payload)
      : await create.mutate(payload);

    if (saved) onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={editing ? `Edit ${category.name}` : "New category"}
      description={
        editing
          ? "Change the details of this category."
          : "Add a category to the storefront. The name has to be unique."
      }
      footer={
        <>
          <Button tone="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="category-form"
            tone="primary"
            loading={busy}
          >
            {editing ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <TextInput
          label="Name"
          required
          value={form.name}
          onChange={set("name")}
          placeholder="Paddles"
          hint="Shown on the storefront category grid."
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={set("description")}
          placeholder="Thermoformed raw carbon paddles for control and power."
          rows={3}
        />

        <ImagePicker
          label="Image"
          value={form.image}
          disabled={busy}
          onChange={(image) => setForm((current) => ({ ...current, image }))}
          hint="A chosen file is downscaled and stored inline — the API has no upload route, so it travels in the JSON body."
        />

        <label className="flex items-start gap-3 rounded-lg border border-line bg-surface p-3.5">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
            className="mt-0.5 size-4 accent-volt-deep"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-[13.5px] font-medium text-ink">Active</span>
            <span className="text-[12.5px] text-mist">
              Inactive categories stay in the database but should be hidden by
              the storefront.
            </span>
          </span>
        </label>

        <FormError error={error} />
      </form>
    </Modal>
  );
}
