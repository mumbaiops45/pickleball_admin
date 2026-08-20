"use client";

import { useState } from "react";
import CategoryForm from "@/components/categories/CategoryForm";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataState, { FormError } from "@/components/ui/DataState";
import { TextInput } from "@/components/ui/Field";
import {
  EditIcon,
  ImageIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/Icons";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import {
  Record,
  RecordField,
  Records,
  TableOrCards,
  Td,
  Th,
  Tr,
} from "@/components/ui/Table";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { formatDate } from "@/lib/format";


export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(undefined); // undefined = closed
  const [pendingDelete, setPendingDelete] = useState(null);

  const { filtered, categories, loading, error, refetch } = useCategories({
    search,
  });
  const remove = useDeleteCategory();

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
        title="Categories"
        copy="How products are grouped on the storefront. Names are unique."
        action={
          <>
            <Button tone="outline" icon={RefreshIcon} onClick={refetch}>
              Refresh
            </Button>
            <Button icon={PlusIcon} onClick={() => setEditing(null)}>
              New category
            </Button>
          </>
        }
      />

      <Card padded={false}>
        <div className="border-b border-line p-4">
          <div className="relative max-w-sm">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-[2.85rem] size-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <TextInput
              label="Search"
              type="search"
              placeholder="Category name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <DataState
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filtered.length === 0}
            emptyTitle={
              categories.length === 0
                ? "No categories yet"
                : "Nothing matches that search"
            }
            emptyBody={
              categories.length === 0
                ? "A product cannot be created without one, so start here."
                : "Try a shorter search term."
            }
            emptyAction={
              categories.length === 0 ? (
                <Button size="sm" icon={PlusIcon} onClick={() => setEditing(null)}>
                  New category
                </Button>
              ) : null
            }
            rows={5}
          >
            <TableOrCards
              minWidth="38rem"
              cards={
                <Records>
                  {filtered.map((category) => (
                    <Record
                      key={category._id}
                      media={<Thumb src={category.image} alt="" />}
                      title={category.name}
                      subtitle={category.description || undefined}
                      badges={
                        <Badge tone={category.isActive ? "good" : "neutral"} dot>
                          {category.isActive ? "Active" : "Hidden"}
                        </Badge>
                      }
                      actions={
                        <>
                          <Button
                            tone="outline"
                            size="sm"
                            icon={EditIcon}
                            aria-label={`Edit ${category.name}`}
                            onClick={() => setEditing(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            tone="ghost"
                            size="sm"
                            icon={TrashIcon}
                            aria-label={`Delete ${category.name}`}
                            onClick={() => {
                              remove.reset();
                              setPendingDelete(category);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      }
                    >
                      <RecordField label="Created">
                        <span className="tnum">
                          {formatDate(category.createdAt)}
                        </span>
                      </RecordField>
                    </Record>
                  ))}
                </Records>
              }
            >
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th>Description</Th>
                  <Th>State</Th>
                  <Th>Created</Th>
                  <Th align="right">
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((category) => (
                  <Tr key={category._id}>
                    <Td>
                      <span className="flex items-center gap-3">
                        <Thumb src={category.image} alt="" />
                        <span className="font-medium text-ink">
                          {category.name}
                        </span>
                      </span>
                    </Td>

                    <Td className="max-w-sm text-mist">
                      <span className="line-clamp-2">
                        {category.description || "—"}
                      </span>
                    </Td>

                    <Td>
                      <Badge tone={category.isActive ? "good" : "neutral"} dot>
                        {category.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </Td>

                    <Td className="tnum whitespace-nowrap text-mist">
                      {formatDate(category.createdAt)}
                    </Td>

                    <Td align="right">
                      <div className="flex justify-end gap-1">
                        <Button
                          tone="ghost"
                          size="sm"
                          icon={EditIcon}
                          aria-label={`Edit ${category.name}`}
                          onClick={() => setEditing(category)}
                        />
                        <Button
                          tone="ghost"
                          size="sm"
                          icon={TrashIcon}
                          aria-label={`Delete ${category.name}`}
                          onClick={() => {
                            remove.reset();
                            setPendingDelete(category);
                          }}
                        />
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableOrCards>
          </DataState>
        </div>
      </Card>

      {editing !== undefined ? (
        <CategoryForm
          category={editing}
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
        title="Delete this category?"
        description="Products already pointing at it keep the reference, which will no longer resolve."
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
            will be removed. The API does not check for products in the
            category first.
          </p>
          <FormError error={remove.error} />
        </div>
      </Modal>
    </div>
  );
}


function Thumb({ src, alt }) {
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className="size-9 shrink-0 rounded-md border border-line object-cover"
    />
  );
}
