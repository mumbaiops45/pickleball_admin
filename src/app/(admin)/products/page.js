"use client";

import { useState } from "react";
import Badge, { PRODUCT_STATUS_TONE, stockTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataState, { FormError } from "@/components/ui/DataState";
import { Select, TextInput } from "@/components/ui/Field";
import {
  EditIcon,
  EyeIcon,
  ImageIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/Icons";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import ProductDetail from "@/components/products/ProductDetail";
import ProductForm from "@/components/products/ProductForm";
import {
  Record,
  RecordField,
  Records,
  TableOrCards,
  Td,
  Th,
  Tr,
} from "@/components/ui/Table";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import { discountPercent, formatDate, formatPrice } from "@/lib/format";

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];


export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(undefined); // undefined = closed

  const { filtered, products, loading, error, refetch } = useProducts({
    search,
    category,
    status,
  });
  const categories = useCategories();
  const remove = useDeleteProduct();


  const confirmDelete = async () => {
    const result = await remove.mutate(pendingDelete?._id);
    if (result === null) return; 

    setPendingDelete(null);
    refetch();
  };

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        // eyebrow="Catalogue"
        title="Products"
        copy="Everything the storefront can show. Prices are stored in whole rupees."
        action={
          <>
            <Button tone="outline" icon={RefreshIcon} onClick={refetch}>
              Refresh
            </Button>
            <Button icon={PlusIcon} onClick={() => setEditing(null)}>
              New product
            </Button>
          </>
        }
      />

      <Card padded={false}>
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 md:flex md:flex-row md:items-end">
          <div className="relative sm:col-span-2 md:flex-1">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-[2.85rem] size-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <TextInput
              label="Search"
              type="search"
              placeholder="Name, SKU, brand or slug"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="md:w-52"
          >
            <option value="">All categories</option>
            {categories.categories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </Select>

          <Select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="md:w-44"
          >
            <option value="">Any status</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>

        <div className="p-4 sm:p-5">
          <DataState
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filtered.length === 0}
            emptyTitle={
              products.length === 0
                ? "No products yet"
                : "Nothing matches those filters"
            }
            emptyBody={
              products.length === 0
                ? "Use New product to create the first one."
                : "Clear the search or pick a different category."
            }
            emptyAction={
              products.length === 0 ? (
                <Button
                  tone="outline"
                  size="sm"
                  icon={PlusIcon}
                  onClick={() => setEditing(null)}
                >
                  New product
                </Button>
              ) : null
            }
            rows={6}
          >
            <>
              <TableOrCards
                minWidth="52rem"
                cards={
                  <Records>
                    {filtered.map((product) => {
                      const off = discountPercent(
                        product.price,
                        product.discountPrice,
                      );

                      return (
                        <Record
                          key={product._id}
                          media={<Thumb src={product.images?.[0]} />}
                          title={product.name}
                          subtitle={`${product.sku}${
                            product.brand ? ` · ${product.brand}` : ""
                          }`}
                          badges={
                            <>
                              <Badge tone={PRODUCT_STATUS_TONE[product.status]}>
                                {product.status}
                              </Badge>
                              {product.isFeatured ? (
                                <Badge tone="accent">Featured</Badge>
                              ) : null}
                            </>
                          }
                          actions={
                            <>
                              <Button
                                tone="outline"
                                size="sm"
                                icon={EyeIcon}
                                aria-label={`View ${product.name}`}
                                onClick={() => setViewing(product)}
                              >
                                View
                              </Button>
                              <Button
                                tone="outline"
                                size="sm"
                                icon={EditIcon}
                                aria-label={`Edit ${product.name}`}
                                onClick={() => setEditing(product)}
                              >
                                Edit
                              </Button>
                              <Button
                                tone="ghost"
                                size="sm"
                                icon={TrashIcon}
                                aria-label={`Delete ${product.name}`}
                                onClick={() => {
                                  remove.reset();
                                  setPendingDelete(product);
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          }
                        >
                          <RecordField label="Price">
                            <span className="tnum font-medium">
                              {formatPrice(
                                product.discountPrice ?? product.price,
                              )}
                            </span>
                            {off ? (
                              <span className="tnum ml-1.5 text-[12px] text-mist line-through">
                                {formatPrice(product.price)}
                              </span>
                            ) : null}
                          </RecordField>

                          <RecordField label="Stock">
                            <Badge tone={stockTone(product.stock)}>
                              {product.stock ?? 0}
                            </Badge>
                          </RecordField>

                          <RecordField label="Category">
                            {product.category?.name ?? "—"}
                          </RecordField>

                          <RecordField label="Added">
                            <span className="tnum">
                              {formatDate(product.createdAt)}
                            </span>
                          </RecordField>
                        </Record>
                      );
                    })}
                  </Records>
                }
              >
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Category</Th>
                    <Th align="right">Price</Th>
                    <Th align="right">Stock</Th>
                    <Th>Status</Th>
                    <Th>Added</Th>
                    <Th align="right">
                      <span className="sr-only">Actions</span>
                    </Th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((product) => {
                    const off = discountPercent(
                      product.price,
                      product.discountPrice,
                    );

                    return (
                      <Tr key={product._id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Thumb src={product.images?.[0]} />
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1.5 font-medium text-ink">
                                {product.name}
                                {product.badge ? (
                                  <Badge tone="info">{product.badge}</Badge>
                                ) : null}
                              </span>
                              <span className="font-mono text-[11.5px] text-mist">
                                {product.sku}
                                {product.brand ? ` · ${product.brand}` : ""}
                              </span>
                            </div>
                          </div>
                        </Td>

                        <Td className="text-mist">
                          {product.category?.name ?? "—"}
                        </Td>

                        <Td align="right">
                          <span className="tnum font-medium text-ink">
                            {formatPrice(product.discountPrice ?? product.price)}
                          </span>
                          {off ? (
                            <span className="tnum ml-2 text-[12px] text-mist line-through">
                              {formatPrice(product.price)}
                            </span>
                          ) : null}
                        </Td>

                        <Td align="right">
                          <Badge tone={stockTone(product.stock)}>
                            {product.stock ?? 0}
                          </Badge>
                        </Td>

                        <Td>
                          <Badge tone={PRODUCT_STATUS_TONE[product.status]}>
                            {product.status}
                          </Badge>
                          {product.isFeatured ? (
                            <Badge tone="accent" className="ml-1.5">
                              Featured
                            </Badge>
                          ) : null}
                        </Td>

                        <Td className="tnum whitespace-nowrap text-mist">
                          {formatDate(product.createdAt)}
                        </Td>

                        <Td align="right">
                          <div className="flex justify-end gap-1">
                            <Button
                              tone="ghost"
                              size="sm"
                              icon={EyeIcon}
                              aria-label={`View ${product.name}`}
                              onClick={() => setViewing(product)}
                            />
                            <Button
                              tone="ghost"
                              size="sm"
                              icon={EditIcon}
                              aria-label={`Edit ${product.name}`}
                              onClick={() => setEditing(product)}
                            />
                            <Button
                              tone="ghost"
                              size="sm"
                              icon={TrashIcon}
                              aria-label={`Delete ${product.name}`}
                              onClick={() => {
                                remove.reset();
                                setPendingDelete(product);
                              }}
                            />
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </TableOrCards>

              <p className="pt-4 text-[12.5px] text-mist">
                Showing {filtered.length} of {products.length} products.
              </p>
            </>
          </DataState>
        </div>
      </Card>

      {viewing ? (
        <ProductDetail
          product={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing);
            setViewing(null);
          }}
        />
      ) : null}

      {editing !== undefined ? (
        <ProductForm
          product={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            refetch();
          }}
        />
      ) : null}

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this product?"
        description="The product is removed outright — there is no undo, and no way to restore it afterwards."
        footer={
          <>
            <Button tone="outline" onClick={() => setPendingDelete(null)}>
              Keep it
            </Button>
            <Button
              tone="danger"
              icon={TrashIcon}
              loading={remove.loading}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-mist">
            <strong className="font-medium text-ink">
              {pendingDelete?.name}
            </strong>{" "}
            ({pendingDelete?.sku}) will disappear from the storefront
            immediately.
          </p>
          <FormError error={remove.error} />
        </div>
      </Modal>
    </div>
  );
}


function Thumb({ src }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <span
        className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-surface"
        aria-hidden="true"
      >
        <ImageIcon className="size-4 text-faint" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="size-9 shrink-0 rounded-md border border-line object-cover"
    />
  );
}
