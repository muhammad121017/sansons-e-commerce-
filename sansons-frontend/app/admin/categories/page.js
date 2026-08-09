"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Eye, EyeOff, Edit, Upload, Check, X, Clock } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/context/AuthContext";
import api from "@/lib/api";

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [pendingCategories, setPendingCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approved"); // "approved" or "pending"
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [form, setForm] = useState({ name: "", slug: "", image: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", slug: "", image: "", description: "" });
  const { showToast } = useToast();

  const loadCategories = () => {
    setLoading(true);
    // Fetch approved categories
    api.get("products/categories/?status=approved")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setCategories(list.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          productCount: c.count || 0,
          status: c.status || 'active',
          approvalStatus: c.approval_status || 'approved',
          requestedBy: c.requested_by_email || 'System',
          visible: c.status !== 'hidden',
          image: c.image || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400',
          description: c.description || ''
        })));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setLoading(false);
      });

    // If Admin, fetch pending category requests
    if (user?.role === "admin") {
      api.get("products/categories/?status=pending")
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setPendingCategories(list.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c.count || 0,
            requestedBy: c.requested_by_email || 'Seller',
            image: c.image || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400',
            description: c.description || ''
          })));
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadCategories();
  }, [user]);

  const handleModerate = async (id, action, name) => {
    let reason = "";
    if (action === "reject") {
      reason = prompt(`Please enter a reason for rejecting category "${name}":`) || "Does not meet marketplace criteria";
    }
    try {
      await api.post(`products/categories/${id}/moderate/`, { action, reason });
      showToast(action === "approve" ? `Category "${name}" approved and live!` : `Category "${name}" rejected.`, action === "approve" ? "success" : "info");
      loadCategories();
    } catch (err) {
      showToast("Failed to moderate category", "danger");
    }
  };

  const handleImageFile = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditForm((f) => ({ ...f, image: reader.result }));
        } else {
          setForm((f) => ({ ...f, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const remove = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`products/categories/${id}/`);
      showToast(`Category "${name}" deleted from database`, "success");
      loadCategories();
    } catch (err) {
      showToast("Failed to delete category", "danger");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("products/categories/", {
        name: form.name,
        slug: form.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        image: form.image,
        description: form.description
      });
      showToast(`Category "${form.name}" created in database`, "success");
      setForm({ name: "", slug: "", image: "", description: "" });
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      const msg = err.response?.data?.slug?.[0] || err.response?.data?.name?.[0] || err.response?.data?.detail || "Failed to create category";
      showToast(msg, "danger");
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      description: cat.description
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`products/categories/${editingCategory.id}/`, {
        name: editForm.name,
        slug: editForm.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        image: editForm.image,
        description: editForm.description
      });
      showToast(`Category "${editForm.name}" updated successfully in database`, "success");
      setEditModalOpen(false);
      loadCategories();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update category";
      showToast(msg, "danger");
    }
  };

  return (
    <div>
      <AdminTopbar
        title="Categories"
        actions={
          <Button onClick={() => setModalOpen(true)} variant="primary" size="sm">
            <Plus size={15} /> {user?.role === "seller" ? "Request Category" : "Add Category"}
          </Button>
        }
      />
      <div className="p-8">
        {/* Admin Approval Tabs */}
        {user?.role === "admin" && (
          <div className="flex gap-4 border-b border-line mb-6">
            <button
              onClick={() => setActiveTab("approved")}
              className={`pb-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "approved"
                  ? "border-forest text-forest font-semibold"
                  : "border-transparent text-ink2 hover:text-ink"
              }`}
            >
              Active Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "pending"
                  ? "border-forest text-forest font-semibold"
                  : "border-transparent text-ink2 hover:text-ink"
              }`}
            >
              <Clock size={14} className={pendingCategories.length > 0 ? "text-amber-500" : ""} />
              Pending Seller Requests
              {pendingCategories.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-900 font-bold">
                  {pendingCategories.length}
                </span>
              )}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-ink2 text-sm">
            Loading categories from database...
          </div>
        ) : activeTab === "pending" && user?.role === "admin" ? (
          <div className="bg-paper border border-line rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink2 text-xs uppercase bg-canvas2">
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Requested By (Seller)</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingCategories.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-canvas2 shrink-0 border border-line">
                          <Image src={c.image} alt={c.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-ink">{c.name}</p>
                          {c.description && <p className="text-xs text-ink2 line-clamp-1">{c.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-xs text-zinc-700">{c.requestedBy}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-ink2">{c.slug}</td>
                    <td className="px-6 py-3.5 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleModerate(c.id, "approve", c.name)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleModerate(c.id, "reject", c.name)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <X size={14} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingCategories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-ink2">
                      No pending category requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-paper border border-line rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink2 text-xs uppercase bg-canvas2">
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Products Count</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-canvas2 shrink-0 border border-line">
                          <Image src={c.image} alt={c.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          {c.description && <p className="text-xs text-ink2 line-clamp-1">{c.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-ink2">{c.slug}</td>
                    <td className="px-6 py-3.5 font-mono">{c.productCount}</td>
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs">
                        {c.visible ? (
                          <><Eye size={14} className="text-forest" /> Active</>
                        ) : (
                          <><EyeOff size={14} className="text-ink2" /> Hidden</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right flex justify-end gap-2">
                      <button onClick={() => handleEditClick(c)} aria-label="Edit category" className="p-1.5 hover:text-forest text-ink2">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => remove(c.id, c.name)} aria-label="Delete category" className="p-1.5 hover:text-wine text-ink2">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-ink2">
                      No categories found. Click "{user?.role === "seller" ? "Request Category" : "Add Category"}" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE CATEGORY MODAL */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v, slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} required />
          <Field label="Slug" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} required />
          
          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Category Image (Upload or URL)</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest text-xs"
              />
              <label className="cursor-pointer bg-canvas2 border border-line hover:bg-line px-3 py-2 rounded-sm text-xs flex items-center gap-1.5">
                <Upload size={14} /> Browse
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, false)} />
              </label>
            </div>
          </label>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest text-sm"
              placeholder="Category description..."
            />
          </label>

          <Button type="submit" variant="primary" className="w-full">Create Category</Button>
        </form>
      </Modal>

      {/* EDIT CATEGORY MODAL */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Category: ${editingCategory?.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <Field label="Name" value={editForm.name} onChange={(v) => setEditForm((f) => ({ ...f, name: v }))} required />
          <Field label="Slug" value={editForm.slug} onChange={(v) => setEditForm((f) => ({ ...f, slug: v }))} required />
          
          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Category Image (Upload or URL)</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={editForm.image}
                onChange={(e) => setEditForm((f) => ({ ...f, image: e.target.value }))}
                className="flex-1 border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest text-xs"
              />
              <label className="cursor-pointer bg-canvas2 border border-line hover:bg-line px-3 py-2 rounded-sm text-xs flex items-center gap-1.5">
                <Upload size={14} /> Browse
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, true)} />
              </label>
            </div>
          </label>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Description</span>
            <textarea
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest text-sm"
            />
          </label>

          <Button type="submit" variant="primary" className="w-full">Save Category Changes</Button>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange, required = false }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
      />
    </label>
  );
}
