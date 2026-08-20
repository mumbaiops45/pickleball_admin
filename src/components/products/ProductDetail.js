"use client";

import { useState } from "react";
import Badge, { PRODUCT_STATUS_TONE, stockTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { EditIcon, ImageIcon } from "@/components/ui/Icons";
import Modal from "@/components/ui/Modal";
import {
  discountPercent,
  formatDateTime,
  formatNumber,
  formatPrice,
} from "@/lib/format";


export default function ProductDetail({ product, onClose, onEdit }) {
  const off = discountPercent(product.price, product.discountPrice);
  const optionLabel = product.optionLabel || "Options";

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={product.name}
      description={product.brand || undefined}
      footer={
        <>
          <Button tone="outline" onClick={onClose}>
            Close
          </Button>
          <Button icon={EditIcon} onClick={onEdit}>
            Edit
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={PRODUCT_STATUS_TONE[product.status]}>
            {product.status}
          </Badge>
          {product.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
          {product.isActive ? null : <Badge tone="bad">Inactive</Badge>}
        </div>

        <Gallery images={product.images} />

        <Section title="Identity">
          <Facts>
            <Fact label="SKU" value={product.sku} mono />
            <Fact label="Slug" value={product.slug} mono />
            <Fact label="Category" value={product.category?.name} />
          </Facts>
        </Section>

        <Section title="Pricing and stock">
          <Facts>
            <Fact
              label="Selling price"
              value={formatPrice(product.discountPrice ?? product.price)}
            />
            <Fact
              label="List price"
              value={off ? formatPrice(product.price) : "Not discounted"}
              hint={off ? `${off}% off` : undefined}
            />
            <Fact label="Stock">
              <Badge tone={stockTone(product.stock)}>
                {formatNumber(product.stock)}
              </Badge>
            </Fact>
          </Facts>
        </Section>

        {product.shortDescription || product.description ? (
          <Section title="Copy">
            {product.shortDescription ? (
              <p className="text-[13.5px] font-medium text-ink">
                {product.shortDescription}
              </p>
            ) : null}
            {product.description ? (
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-mist">
                {product.description}
              </p>
            ) : null}
          </Section>
        ) : null}

        <Section title="Merchandising">
          <Facts>
            <Fact label="Brand" value={product.brand} />
            <Fact label="Badge" value={product.badge} />
            <Fact label="Skill" value={product.skill} />
            <Fact label="Type" value={product.type} />
            <Fact
              label="Rating"
              value={product.rating ? `${product.rating} / 5` : "Not rated"}
              hint={
                product.reviewCount
                  ? `${formatNumber(product.reviewCount)} reviews`
                  : undefined
              }
            />
          </Facts>
        </Section>

        {product.colorways?.length ? (
          <Section title="Colourways">
            <ul className="flex flex-wrap gap-1.5">
              {product.colorways.map((colorway) => (
                <li
                  key={`${colorway.name}-${colorway.hex}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pl-1.5 pr-3 text-[12.5px] text-ink"
                >
                  <span
                    className="size-5 rounded-full border border-line-strong"
                    style={{ background: colorway.hex }}
                    aria-hidden="true"
                  />
                  {colorway.name}
                  <span className="font-mono text-[11.5px] text-faint">
                    {colorway.hex}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {product.options?.length ? (
          <Section title={optionLabel}>
            <ul className="flex flex-wrap gap-1.5">
              {product.options.map((option) => (
                <li
                  key={option}
                  className="rounded-full border border-line-strong bg-surface px-3 py-1 text-[12.5px] text-ink"
                >
                  {option}
                </li>
              ))}
            </ul>
            <p className="text-[12.5px] text-mist">
              Display only — every {optionLabel.toLowerCase()} shares the one
              stock pool above.
            </p>
          </Section>
        ) : null}

        {product.highlights?.length ? (
          <Section title="Highlights">
            <ul className="flex flex-col gap-1.5">
              {product.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex gap-2 text-[13px] leading-relaxed text-mist"
                >
                  <span
                    className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-volt-deep"
                    aria-hidden="true"
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {product.specs?.length ? (
          <Section title="Specifications">
            <dl className="divide-y divide-line rounded-lg border border-line">
              {product.specs.map((spec) => (
                <div
                  key={`${spec.label}-${spec.value}`}
                  className="flex flex-col gap-0.5 px-3.5 py-2.5 sm:flex-row sm:gap-4"
                >
                  <dt className="text-[12.5px] text-mist sm:w-44 sm:shrink-0">
                    {spec.label}
                  </dt>
                  <dd className="text-[13px] text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        <Section title="Record">
          <Facts>
            <Fact label="Created" value={formatDateTime(product.createdAt)} />
            <Fact label="Updated" value={formatDateTime(product.updatedAt)} />
          </Facts>
        </Section>
      </div>
    </Modal>
  );
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-[11.5px] font-semibold uppercase tracking-wider text-faint">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Facts({ children }) {
  return <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>;
}

function Fact({ label, value, hint, mono, children }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[12px] text-mist">{label}</dt>
      <dd
        className={`text-[13.5px] text-ink ${mono ? "font-mono text-[12.5px]" : ""}`}
      >
        {children ?? (value || <span className="text-faint">—</span>)}
        {hint ? <span className="ml-2 text-[12px] text-mist">{hint}</span> : null}
      </dd>
    </div>
  );
}


function Gallery({ images }) {
  if (!images?.length) {
    return (
      <div className="grid h-28 place-items-center rounded-lg border border-dashed border-line-strong bg-surface">
        <span className="flex items-center gap-2 text-[12.5px] text-mist">
          <ImageIcon className="size-4" aria-hidden="true" />
          No images
        </span>
      </div>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {images.map((src, index) => (
        <li key={`${src.slice(0, 32)}-${index}`}>
          <Tile src={src} index={index} />
        </li>
      ))}
    </ul>
  );
}

function Tile({ src, index }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span className="grid size-24 place-items-center rounded-lg border border-line bg-surface">
        <ImageIcon className="size-4 text-faint" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={index === 0 ? "Cover image" : `Image ${index + 1}`}
      onError={() => setBroken(true)}
      className="size-24 rounded-lg border border-line object-cover"
    />
  );
}
