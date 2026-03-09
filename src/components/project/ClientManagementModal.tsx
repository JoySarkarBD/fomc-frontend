"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAccessToken } from "@/hooks/useAccessToken";
import { ProjectManagementService } from "@/api";

/* ─── Types ───────────────────────────────────────────────── */
interface Client {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ─── Helpers ─────────────────────────────────────────────── */
const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const COLUMNS = ["#", "CLIENT NAME", "ACTION"];

/* ─── Props ───────────────────────────────────────────────── */
interface ClientManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ─── Component ───────────────────────────────────────────── */
export function ClientManagementModal({
  open,
  onOpenChange,
}: ClientManagementModalProps) {
  const token = useAccessToken();

  // ── Data state ──────────────────────────────────────────
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Search / pagination ──────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Create form ──────────────────────────────────────────
  const [showCreateRow, setShowCreateRow] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);

  // ── Edit state ───────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [updating, setUpdating] = useState(false);

  // ── Delete state ─────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Fetch all clients ───────────────────────────────────── */
  const fetchClients = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await ProjectManagementService.projectControllerGetClients({
        authorization: token,
      });
      const data = (res as any)?.data;
      setClients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(
        err?.body?.message ?? "Failed to load clients. Please try again."
      );
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (open) {
      fetchClients();
      setSearchQuery("");
      setCurrentPage(1);
      setShowCreateRow(false);
      setCreateName("");
      setEditId(null);
    }
  }, [open, fetchClients]);

  /* ── Search filter ───────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, searchQuery]);

  /* ── Pagination ──────────────────────────────────────────── */
  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
  const paginated = filtered.slice(startIndex, endIndex);

  /* ── Create ──────────────────────────────────────────────── */
  const handleCreate = async () => {
    const name = createName.trim();
    if (!name || !token) return;
    setCreating(true);
    try {
      await ProjectManagementService.projectControllerCreateClient({
        authorization: token,
        requestBody: { name },
      });
      toast.success(`Client "${name}" created successfully.`);
      setCreateName("");
      setShowCreateRow(false);
      await fetchClients();
      setCurrentPage(1);
    } catch (err: any) {
      const msg =
        err?.body?.message ?? "Failed to create client. Please try again.";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateRow(false);
    setCreateName("");
  };

  /* ── Edit ────────────────────────────────────────────────── */
  const startEdit = (client: Client) => {
    setEditId(client._id);
    setEditName(client.name);
  };

  const handleUpdate = async () => {
    const name = editName.trim();
    if (!name || !editId || !token) return;
    setUpdating(true);
    try {
      await ProjectManagementService.projectControllerUpdateClient({
        id: editId,
        authorization: token,
        requestBody: { name },
      });
      toast.success(`Client updated to "${name}".`);
      setEditId(null);
      setEditName("");
      await fetchClients();
    } catch (err: any) {
      const msg =
        err?.body?.message ?? "Failed to update client. Please try again.";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  /* ── Delete ──────────────────────────────────────────────── */
  const handleDelete = async (client: Client) => {
    if (!token || deletingId) return;
    setDeletingId(client._id);
    try {
      await ProjectManagementService.projectControllerDeleteClient({
        id: client._id,
        authorization: token,
      });
      toast.success(`Client "${client.name}" deleted.`);
      setClients((prev) => prev.filter((c) => c._id !== client._id));
      const newTotal = clients.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / rowsPerPage));
      if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
    } catch (err: any) {
      const msg =
        err?.body?.message ?? "Failed to delete client. Please try again.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">Client Management</DialogTitle>
        <DialogDescription className="sr-only">
          Create, update, and delete project clients
        </DialogDescription>

        {/* ── Header ───────────────────────────────────────── */}
        <div className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Client Management
          </h2>
        </div>

        {/* ── Search + New button row ───────────────────────── */}
        <div className="shrink-0 border-b border-border/40 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full rounded-sm border-border/60 pl-9 pr-3 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
              />
            </div>
            {/* New Client button */}
            <Button
              onClick={() => {
                setShowCreateRow(true);
                setEditId(null);
                setCurrentPage(1);
              }}
              className="h-9 shrink-0 gap-1.5 rounded-sm bg-brand-navy px-3 text-sm font-semibold text-white hover:bg-brand-navy-dark sm:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Client</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-14">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading clients…
            </span>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 bg-[#E7EFFF] hover:bg-[#E7EFFF]">
                  {COLUMNS.map((col) => (
                    <TableHead
                      key={col}
                      className={`h-11 whitespace-nowrap font-semibold text-foreground/80 ${
                        col === "#" ? "w-14 pl-4 sm:pl-6" : ""
                      } ${col === "ACTION" ? "pr-4 text-center sm:pr-6" : ""}`}
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* ── Inline create row ─────────────────────── */}
                {showCreateRow && (
                  <TableRow className="border-b border-border/40 bg-blue-50/40">
                    <TableCell className="pl-4 py-2 text-sm font-medium text-muted-foreground sm:pl-6">
                      —
                    </TableCell>
                    <TableCell className="py-2 pr-2">
                      <Input
                        autoFocus
                        placeholder="Client name…"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreate();
                          if (e.key === "Escape") handleCancelCreate();
                        }}
                        className="h-8 rounded-sm border-border/60 text-sm focus-visible:ring-1 focus-visible:ring-brand-navy/60"
                        disabled={creating}
                      />
                    </TableCell>
                    <TableCell className="pr-4 text-center sm:pr-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={handleCreate}
                          disabled={creating || !createName.trim()}
                          className="h-7 rounded-sm bg-[#14804A] px-3 text-xs text-white hover:bg-[#14804A]/90 disabled:opacity-50"
                        >
                          {creating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelCreate}
                          disabled={creating}
                          className="h-7 rounded-sm px-2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* ── Client rows ───────────────────────────── */}
                {paginated.length === 0 && !showCreateRow ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      {searchQuery
                        ? "No clients match your search."
                        : "No clients found. Create one to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((client, idx) => {
                    const rowNum = startIndex + idx + 1;
                    const isEditing = editId === client._id;
                    const isDeleting = deletingId === client._id;
                    const anyAction = updating || !!deletingId;

                    return (
                      <TableRow
                        key={client._id}
                        className="border-b border-border/40 hover:bg-muted/30"
                      >
                        {/* # */}
                        <TableCell className="py-3 pl-4 text-sm font-medium text-foreground/70 sm:py-3.5 sm:pl-6">
                          {rowNum}
                        </TableCell>

                        {/* Name */}
                        <TableCell className="py-3 sm:py-3.5">
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleUpdate();
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                              className="h-8 max-w-xs rounded-sm border-border/60 text-sm focus-visible:ring-1 focus-visible:ring-brand-navy/60"
                              disabled={updating}
                            />
                          ) : (
                            <span className="text-sm font-medium text-foreground">
                              {client.name}
                            </span>
                          )}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="py-3 pr-4 text-center sm:py-3.5 sm:pr-6">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                onClick={handleUpdate}
                                disabled={updating || !editName.trim()}
                                className="h-7 rounded-sm bg-[#14804A] px-3 text-xs text-white hover:bg-[#14804A]/90 disabled:opacity-50"
                              >
                                {updating ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="mr-1 h-3.5 w-3.5" />
                                    Update
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                disabled={updating}
                                className="h-7 rounded-sm px-2 text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCreateRow(false);
                                  startEdit(client);
                                }}
                                disabled={anyAction}
                                title="Edit client"
                                className="flex h-7 w-7 items-center justify-center rounded-sm text-brand-navy transition-colors hover:bg-brand-navy/10 disabled:opacity-40"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDelete(client)}
                                disabled={anyAction}
                                title="Delete client"
                                className="flex h-7 w-7 items-center justify-center rounded-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────── */}
        {!loading && (
          <div className="shrink-0 flex items-center justify-between rounded-b-sm bg-[#E8EAEE] px-3 py-3 sm:px-5">
            {/* Record count */}
            <div className="text-xs text-foreground/70 sm:text-sm">
              {totalRecords === 0
                ? "0"
                : `${startIndex + 1}–${endIndex}`}{" "}
              of {totalRecords}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Rows per page */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="hidden text-sm text-foreground/70 sm:inline">
                  Rows per page:
                </span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(v) => {
                    setRowsPerPage(Number(v));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-14 rounded-sm border-border/60 bg-white text-xs sm:w-17.5 sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt.toString()}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 rounded-sm hover:bg-white/50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 rounded-sm hover:bg-white/50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
