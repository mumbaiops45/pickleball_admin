"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { FormError } from "@/components/ui/DataState";
import { Select, TextInput, Textarea } from "@/components/ui/Field";
import ImageGallery from "@/components/ui/ImageGallery";
import Modal from "@/components/ui/Modal";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { slugify } from "@/services/product.service";

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const SKILLS = ["Beginner", "Intermediate", "Advanced", "All levels"];
const TYPES = ["Men's", "Kid's"];

// The five option labels the storefront already uses. Free text, because a
// new category will want its own.
const OPTION_LABELS = [
  "Grip size",
  "US size",
  "Size",
  "Pack size",
  "Capacity",
];

const EMPTY = {
  name: "",
  slug: "",
  sku: "",
  category: "",
  shortDescription: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "",
  images: [],
  brand: "",
  status: "DRAFT",
  isFeatured: false,
  isActive: true,
  badge: "",
  skill: "",
  type: "",
  rating: "",
  reviewCount: "",
  optionLabel: "",
  options: [],
  colorways: [],
  highlights: [],
  specs: [],
};

/**
 * Create/edit, against POST and PUT /api/products.
 *
 * Every field on the Product model is here — the API drops unknown keys
 * silently and has no validation layer (API-REVIEW.md §3.4), so anything the
 * form omits is a field nobody can ever set. The numeric fields stay strings
 * in state and are coerced by `normalise` in the service, which is also where
 * the empty-string-to-null rules live.
 *
 * `slug` and `sku` are unique on the server. Slug is derived from the name
 * while untouched, then left alone the moment it is edited — renaming a live
 * product should not silently change the URL the storefront already links to.
 */
export default function ProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name ?? "",
          slug: product.slug ?? "",
          sku: product.sku ?? "",
          category: product.category?._id ?? product.category ?? "",
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          price: product.price ?? "",
          discountPrice: product.discountPrice ?? "",
          stock: product.stock ?? "",
          images: product.images ?? [],
          brand: product.brand ?? "",
          status: product.status ?? "DRAFT",
          isFeatured: product.isFeatured ?? false,
          isActive: product.isActive ?? true,
          badge: product.badge ?? "",
          skill: product.skill ?? "",
          type: product.type ?? "",
          rating: product.rating ?? "",
          reviewCount: product.reviewCount ?? "",
          optionLabel: product.optionLabel ?? "",
          options: product.options ?? [],
          colorways: product.colorways ?? [],
          highlights: product.highlights ?? [],
          specs: product.specs ?? [],
        }
      : EMPTY,
  );

  // Editing an existing product means its slug is already published.
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  const { categories, loading: loadingCategories } = useCategories();
  const create = useCreateProduct();
  const update = useUpdateProduct();

  const editing = Boolean(product);
  const busy = create.loading || update.loading;
  const error = create.error ?? update.error;

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const setName = (event) => {
    const name = event.target.value;
    setForm((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : slugify(name),
    }));
  };

  const toggle = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.checked }));

  // Repeatable rows (options, highlights, colorways, specs) all mutate the
  // same way: replace the whole array with the edited copy.
  const setList = (key) => (rows) =>
    setForm((current) => ({ ...current, [key]: rows }));

  const discount =
    Number(form.discountPrice) > 0 && Number(form.price) > 0
      ? Math.round(
          (1 - Number(form.discountPrice) / Number(form.price)) * 100,
        )
      : null;

  const onSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      sku: form.sku.trim(),
      category: form.category,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      price: form.price,
      discountPrice: form.discountPrice,
      stock: form.stock,
      images: form.images,
      brand: form.brand.trim(),
      status: form.status,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      badge: form.badge.trim(),
      skill: form.skill,
      type: form.type,
      rating: form.rating,
      reviewCount: form.reviewCount,
      optionLabel: form.optionLabel.trim(),
      options: form.options,
      colorways: form.colorways,
      highlights: form.highlights,
      specs: form.specs,
    };

    const saved = editing
      ? await update.mutate(product._id, payload)
      : await create.mutate(payload);

    if (saved) onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={editing ? `Edit ${product.name}` : "New product"}
      description={
        editing
          ? "PUT /api/products/:id"
          : "POST /api/products — the slug and SKU both have to be unique."
      }
      footer={
        <>
          <Button tone="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" tone="primary" loading={busy}>
            {editing ? "Save changes" : "Create product"}
          </Button>
        </>
      }
    >
      <form
        id="product-form"
        onSubmit={onSubmit}
        className="flex flex-col gap-5"
        noValidate
      >
        <Section title="Identity">
          <TextInput
            label="Name"
            required
            value={form.name}
            onChange={setName}
            placeholder="Carbon Fiber Pickleball Paddle"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Slug"
              required
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                set("slug")(event);
              }}
              placeholder="carbon-fiber-pickleball-paddle"
              hint={
                slugTouched ? "Unique across the catalogue." : "Following the name."
              }
            />

            <TextInput
              label="SKU"
              required
              value={form.sku}
              onChange={set("sku")}
              placeholder="PBP-CARBON-001"
              hint="Stored uppercase, and unique."
              className="font-mono"
            />
          </div>

          <Select
            label="Category"
            required
            value={form.category}
            onChange={set("category")}
            disabled={loadingCategories}
            hint={
              loadingCategories
                ? "Loading categories…"
                : categories.length
                  ? undefined
                  : "No categories exist yet — create one first."
            }
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Section>

        <Section title="Pricing and stock">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="Price"
              required
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={set("price")}
              placeholder="2499"
              hint="Whole rupees."
            />

            <TextInput
              label="Discount price"
              type="number"
              min="0"
              step="1"
              value={form.discountPrice}
              onChange={set("discountPrice")}
              placeholder="2199"
              hint={discount ? `${discount}% off` : "Optional."}
              error={
                discount !== null && discount <= 0
                  ? "Not below the price."
                  : undefined
              }
            />

            <TextInput
              label="Stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={set("stock")}
              placeholder="50"
              hint="Blank counts as zero."
            />
          </div>
        </Section>

        <Section title="Copy">
          <TextInput
            label="Short description"
            value={form.shortDescription}
            onChange={set("shortDescription")}
            placeholder="Premium carbon fiber pickleball paddle."
            hint="The one-liner on the product card."
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={set("description")}
            rows={4}
            placeholder="Thermoformed raw carbon face with a polypropylene core…"
          />
        </Section>

        <Section title="Media">
          <ImageGallery
            value={form.images}
            onChange={(images) =>
              setForm((current) => ({ ...current, images }))
            }
            disabled={busy}
            hint="Uploads are downscaled and stored inline; the API has no upload route, so they share one request budget."
          />
        </Section>

        <Section title="Merchandising">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextInput
              label="Brand"
              value={form.brand}
              onChange={set("brand")}
              placeholder="PADDLEHAUS"
            />

            <TextInput
              label="Badge"
              value={form.badge}
              onChange={set("badge")}
              placeholder="Best seller"
              hint="Corner flag on the card."
            />

            <Select label="Skill" value={form.skill} onChange={set("skill")}>
              <option value="">Not set</option>
              {SKILLS.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </Select>

            <Select label="Type" value={form.type} onChange={set("type")}>
              <option value="">Not set</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={set("rating")}
              placeholder="4.7"
              hint="Out of 5. Blank counts as zero."
              error={
                form.rating !== "" && Number(form.rating) > 5
                  ? "Cannot exceed 5."
                  : undefined
              }
            />

            <TextInput
              label="Review count"
              type="number"
              min="0"
              step="1"
              value={form.reviewCount}
              onChange={set("reviewCount")}
              placeholder="516"
              hint="Shown next to the stars."
            />
          </div>
        </Section>

        <Section title="Options shoppers pick">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Option label"
              list="option-label-suggestions"
              value={form.optionLabel}
              onChange={set("optionLabel")}
              placeholder="Grip size"
              hint="What the row of buttons is called."
            />
            <datalist id="option-label-suggestions">
              {OPTION_LABELS.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>

            <TagInput
              label="Options"
              value={form.options}
              onChange={setList("options")}
              placeholder="4 1/8in"
              hint="Enter or comma adds one. These share a single stock pool."
            />
          </div>

          <RowList
            label="Colourways"
            value={form.colorways}
            onChange={setList("colorways")}
            blank={{ name: "", hex: "#d4ff3f" }}
            addLabel="Add colourway"
            empty="No colourways — the product page shows no swatches."
            render={(row, update) => (
              <>
                <input
                  type="color"
                  aria-label="Swatch colour"
                  value={/^#[0-9a-fA-F]{6}$/.test(row.hex) ? row.hex : "#d4ff3f"}
                  onChange={(event) => update({ hex: event.target.value })}
                  className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-line-strong bg-paper p-1"
                />
                <input
                  value={row.name}
                  onChange={(event) => update({ name: event.target.value })}
                  placeholder="Clay"
                  aria-label="Colourway name"
                  className={ROW_INPUT}
                />
                <input
                  value={row.hex}
                  onChange={(event) => update({ hex: event.target.value })}
                  placeholder="#ff5c2b"
                  aria-label="Hex value"
                  className={`${ROW_INPUT} font-mono sm:max-w-[9rem]`}
                />
              </>
            )}
          />
        </Section>

        <Section title="Selling points and specs">
          <TagInput
            label="Highlights"
            value={form.highlights}
            onChange={setList("highlights")}
            placeholder="Foam-injected perimeter widens the sweet spot"
            hint="One bullet each, listed under the description."
          />

          <RowList
            label="Specifications"
            value={form.specs}
            onChange={setList("specs")}
            blank={{ label: "", value: "" }}
            addLabel="Add specification"
            empty="No specs — the product page hides the table."
            render={(row, update) => (
              <>
                <input
                  value={row.label}
                  onChange={(event) => update({ label: event.target.value })}
                  placeholder="Face"
                  aria-label="Specification label"
                  className={`${ROW_INPUT} sm:max-w-[14rem]`}
                />
                <input
                  value={row.value}
                  onChange={(event) => update({ value: event.target.value })}
                  placeholder="Gritted carbon"
                  aria-label="Specification value"
                  className={ROW_INPUT}
                />
              </>
            )}
          />
        </Section>

        <Section title="Visibility">
          <Select label="Status" value={form.status} onChange={set("status")}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>

          <Checkbox
            checked={form.isFeatured}
            onChange={toggle("isFeatured")}
            title="Featured"
            body="Surfaced on the storefront home page."
          />

          <Checkbox
            checked={form.isActive}
            onChange={toggle("isActive")}
            title="Active"
            body="Inactive products stay in the database but should be hidden by the storefront."
          />
        </Section>

        <FormError error={error} />
      </form>
    </Modal>
  );
}

function Section({ title, children }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-[11.5px] font-semibold uppercase tracking-wider text-faint">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

const ROW_INPUT =
  "h-11 w-full min-w-0 rounded-lg border border-line-strong bg-paper px-3.5 text-sm " +
  "text-ink placeholder:text-faint transition-colors focus:border-volt-deep " +
  "focus:outline-none focus:ring-2 focus:ring-volt-deep/25";

/**
 * A list of short strings — options and highlights.
 *
 * Typing commits on Enter or comma rather than on every keystroke, so the
 * array never fills with half-typed entries. Backspace on an empty box pulls
 * the last chip back for editing instead of silently deleting it.
 */
function TagInput({ label, value, onChange, placeholder, hint }) {
  const [draft, setDraft] = useState("");

  const commit = (text) => {
    const entry = text.trim();
    if (!entry || value.includes(entry)) return setDraft("");
    onChange([...value, entry]);
    setDraft("");
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
      return;
    }

    if (event.key === "Backspace" && !draft && value.length) {
      event.preventDefault();
      setDraft(value[value.length - 1]);
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink">{label}</span>

      {value.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((entry, index) => (
            <li
              key={`${entry}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface py-1 pl-3 pr-1.5 text-[12.5px] text-ink"
            >
              {entry}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={`Remove ${entry}`}
                className="grid size-5 place-items-center rounded-full text-mist transition-colors hover:bg-paper hover:text-bad"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => commit(draft)}
        placeholder={placeholder}
        className={ROW_INPUT}
      />

      {hint ? <p className="text-[12.5px] text-mist">{hint}</p> : null}
    </div>
  );
}

/**
 * Repeatable object rows — colourways and specs. The caller renders the
 * inputs for one row and receives a patch function; add, remove and reorder
 * live here so both lists behave identically.
 */
function RowList({ label, value, onChange, blank, render, addLabel, empty }) {
  const patch = (index) => (changes) =>
    onChange(
      value.map((row, i) => (i === index ? { ...row, ...changes } : row)),
    );

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-ink">{label}</span>

      {value.length ? (
        <ul className="flex flex-col gap-2">
          {value.map((row, index) => (
            <li key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {render(row, patch(index))}

              <span className="flex shrink-0 gap-1">
                <RowButton
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  label={`Move ${label} row ${index + 1} up`}
                >
                  &uarr;
                </RowButton>
                <RowButton
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  label={`Move ${label} row ${index + 1} down`}
                >
                  &darr;
                </RowButton>
                <RowButton
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  label={`Remove ${label} row ${index + 1}`}
                  danger
                >
                  &times;
                </RowButton>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12.5px] text-mist">{empty}</p>
      )}

      <button
        type="button"
        onClick={() => onChange([...value, { ...blank }])}
        className="self-start rounded-lg border border-dashed border-line-strong px-3 py-2 text-[12.5px] font-medium text-mist transition-colors hover:border-volt-deep hover:text-ink"
      >
        + {addLabel}
      </button>
    </div>
  );
}

function RowButton({ onClick, disabled, label, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid size-9 place-items-center rounded-lg border border-line-strong bg-surface text-mist transition-colors disabled:opacity-40 ${
        danger ? "hover:border-bad hover:text-bad" : "hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Checkbox({ checked, onChange, title, body }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-line bg-surface p-3.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 accent-volt-deep"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[13.5px] font-medium text-ink">{title}</span>
        <span className="text-[12.5px] text-mist">{body}</span>
      </span>
    </label>
  );
}
