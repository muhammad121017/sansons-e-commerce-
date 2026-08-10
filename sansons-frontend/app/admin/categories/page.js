"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Eye, EyeOff, Edit, Upload, Check, X, Clock, FolderPlus, PackagePlus, ChevronRight, ChevronDown, Layers, ArrowRight } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/context/AuthContext";
import api from "@/lib/api";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [pendingCategories, setPendingCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approved"); // "approved" or "pending"

  // Selected Category Action Drawer State
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modals
  const [addMainModalOpen, setAddMainModalOpen] = useState(false);
  const [addSubModalOpen, setAddSubModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form States
  const [mainForm, setMainForm] = useState({ name: "", slug: "", image: "", description: "" });
  const [subForm, setSubForm] = useState({ name: "", slug: "", image: "", description: "", parentId: "" });
  const [editForm, setEditForm] = useState({ name: "", slug: "", image: "", description: "", parentId: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    api.get("products/categories/?status=approved")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setCategories(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setLoading(false);
      });

    if (user?.role === "admin") {
      api.get("products/categories/?status=pending")
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setPendingCategories(list);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadCategories();
  }, [user]);

  // Main Categories (parent is null)
  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parent && !c.parent_id);
  }, [categories]);

  // Get subcategories for a given parent ID
  const getSubcategories = (parentId) => {
    return categories.filter((c) => c.parent === parentId || c.parent_id === parentId);
  };

  // Auto-generate slug from name
  const handleNameChange = (name, setFormFn) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormFn((f) => ({ ...f, name, slug }));
  };

  const handleImageFile = (e, setFormFn) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormFn((f) => ({ ...f, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit New Main Category
  const handleAddMainCategory = async (e) => {
    e.preventDefault();
    if (!mainForm.name) return;
    setSubmitting(true);
    try {
      await api.post("products/categories/", {
        name: mainForm.name,
        slug: mainForm.slug || mainForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        image: mainForm.image || undefined,
        description: mainForm.description || undefined,
      });
      showToast(`Main Category "${mainForm.name}" created successfully!`, "success");
      setMainForm({ name: "", slug: "", image: "", description: "" });
      setAddMainModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to create category", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit New Sub-Category
  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    if (!subForm.name || !subForm.parentId) return;
    setSubmitting(true);
    try {
      await api.post("products/categories/", {
        name: subForm.name,
        slug: subForm.slug || subForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        image: subForm.image || undefined,
        description: subForm.description || undefined,
        parent: subForm.parentId,
      });
      showToast(`Sub-Category "${subForm.name}" added successfully!`, "success");
      setSubForm({ name: "", slug: "", image: "", description: "", parentId: "" });
      setAddSubModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to add sub-category", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      image: cat.image || "",
      description: cat.description || "",
      parentId: cat.parent || cat.parent_id || "",
    });
    setEditModalOpen(true);
  };

  // Submit Category Edit
  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSubmitting(true);
    try {
      await api.put(`products/categories/${editingCategory.id}/`, {
        name: editForm.name,
        slug: editForm.slug,
        image: editForm.image || undefined,
        description: editForm.description || undefined,
        parent: editForm.parentId || null,
      });
      showToast(`Category "${editForm.name}" updated successfully!`, "success");
      setEditModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast("Failed to update category", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await api.delete(`products/categories/${id}/`);
      showToast(`Category "${name}" deleted.`, "info");
      loadCategories();
      if (selectedCategory?.id === id) setSelectedCategory(null);
    } catch (err) {
      showToast("Failed to delete category", "danger");
    }
  };

  // Moderate pending category request
  const handleModerate = async (id, action, name) => {
    let reason = "";
    if (action === "reject") {
      reason = prompt(`Reason for rejecting "${name}":`) || "Does not meet criteria";
    }
    try {
      await api.post(`products/categories/${id}/moderate/`, { action, reason });
      showToast(action === "approve" ? `Category "${name}" approved!` : `Category "${name}" rejected.`, "success");
      loadCategories();
    } catch (err) {
      showToast("Failed to moderate category", "danger");
    }
  };

  // Trigger Add Product with Pre-selected Category
  const handleAddProductToCategory = (mainCat, subCat = null) => {
    const url = `/admin/products/new?category=${mainCat.slug}${subCat ? `&subcategory=${subCat.slug}` : ""}`;
    router.push(url);
  };

  return (
    <div>
      <AdminTopbar title="Categories &amp; Sub-Categories Manager" />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-paper border border-line p-6 rounded-xl">
          <div>
            <h1 className="text-xl font-bold text-ink font-display">Store Category Hierarchy</h1>
            <p className="text-xs text-ink2 mt-1">Manage main categories, create nested sub-categories, and add products directly.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setAddMainModalOpen(true)}
              variant="primary"
              size="sm"
            >
              <Plus size={16} /> Add Main Category
            </Button>
          </div>
        </div>

        {/* Tab Toggle for Admin Approval Requests */}
        {user?.role === "admin" && pendingCategories.length > 0 && (
          <div className="flex gap-2 border-b border-line pb-2">
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "approved" ? "bg-forest text-canvas" : "bg-paper border border-line text-ink"
              }`}
            >
              Live Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === "pending" ? "bg-wine text-canvas" : "bg-paper border border-line text-ink"
              }`}
            >
              <Clock size={14} /> Pending Requests ({pendingCategories.length})
            </button>
          </div>
        )}

        {/* Categories List & Action Drawer Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-ink2">Loading categories database...</div>
        ) : activeTab === "pending" ? (
          /* Pending Requests Table */
          <div className="bg-paper border border-line rounded-xl overflow-hidden shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas border-b border-line text-xs uppercase tracking-wider text-ink2">
                <tr>
                  <th className="p-4">Category</th>
                  <th className="p-4">Requested By</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pendingCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="p-4 font-semibold text-ink">{cat.name}</td>
                    <td className="p-4 text-ink font-medium text-xs font-mono">
                      {cat.requested_by_email || cat.requestedBy || "Seller"}
                    </td>
                    <td className="p-4 text-ink2 text-xs">{cat.description || "No description provided"}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleModerate(cat.id, "approve", cat.name)}
                          className="px-3 py-1 bg-forest text-canvas text-xs font-semibold rounded hover:bg-forest/90 flex items-center gap-1"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleModerate(cat.id, "reject", cat.name)}
                          className="px-3 py-1 bg-wine text-canvas text-xs font-semibold rounded hover:bg-wine/90 flex items-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Live Categories Tree View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Main Categories Accordion Cards */}
            <div className="lg:col-span-2 space-y-4">
              {mainCategories.length === 0 ? (
                <div className="p-12 text-center text-sm text-ink2 bg-paper border border-line rounded-xl">
                  No main categories created yet. Click <strong>+ Add Main Category</strong> to create one.
                </div>
              ) : (
                mainCategories.map((mainCat) => {
                  const subs = getSubcategories(mainCat.id);
                  const isSelected = selectedCategory?.id === mainCat.id;

                  return (
                    <div
                      key={mainCat.id}
                      className={`bg-paper border rounded-xl overflow-hidden transition-all shadow-soft ${
                        isSelected ? "border-forest ring-1 ring-forest/30" : "border-line"
                      }`}
                    >
                      {/* Main Category Header Card */}
                      <div className="p-4 bg-canvas/80 flex items-center justify-between gap-4 border-b border-line">
                        <div
                          onClick={() => setSelectedCategory(mainCat)}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        >
                          {mainCat.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={mainCat.image} alt={mainCat.name} className="w-10 h-10 rounded-lg object-cover border border-line shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-sm shrink-0">
                              {mainCat.name.substring(0, 1)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                              {mainCat.name}
                              <span className="text-[10px] bg-paper border border-line px-2 py-0.5 rounded-full text-ink2 font-mono font-normal">
                                {subs.length} sub-categories
                              </span>
                            </h3>
                            <p className="text-xs text-ink2 truncate mt-0.5">{mainCat.description || `Slug: ${mainCat.slug}`}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            onClick={() => {
                              setSubForm({ name: "", slug: "", image: "", description: "", parentId: mainCat.id });
                              setAddSubModalOpen(true);
                            }}
                            variant="ghost"
                            size="xs"
                            className="text-forest hover:bg-forest/10"
                            title="Add Sub-Category"
                          >
                            <FolderPlus size={14} /> Sub-Cat
                          </Button>

                          <Button
                            onClick={() => handleAddProductToCategory(mainCat)}
                            variant="ghost"
                            size="xs"
                            className="text-brass hover:bg-brass/10"
                            title="Add Product to Category"
                          >
                            <PackagePlus size={14} /> Product
                          </Button>

                          <button
                            onClick={() => openEditModal(mainCat)}
                            className="p-1.5 rounded hover:bg-paper text-ink2 hover:text-ink border border-line"
                            title="Edit Category"
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(mainCat.id, mainCat.name)}
                            className="p-1.5 rounded hover:bg-wine/10 text-wine border border-line"
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Sub-Categories Accordion List */}
                      <div className="p-4 bg-paper space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink2 mb-1">
                          <span>Sub-Categories ({subs.length})</span>
                          <button
                            onClick={() => {
                              setSubForm({ name: "", slug: "", image: "", description: "", parentId: mainCat.id });
                              setAddSubModalOpen(true);
                            }}
                            className="text-forest hover:underline font-semibold text-xs flex items-center gap-1"
                          >
                            <Plus size={12} /> Add Sub-Category
                          </button>
                        </div>

                        {subs.length === 0 ? (
                          <div className="p-4 text-center text-xs text-ink2 border border-dashed border-line rounded-lg bg-canvas/30">
                            No sub-categories added yet under <strong>{mainCat.name}</strong>.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {subs.map((sub) => (
                              <div
                                key={sub.id}
                                className="p-2.5 rounded-lg border border-line bg-canvas flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-forest shrink-0" />
                                  <span className="font-semibold text-ink truncate">{sub.name}</span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleAddProductToCategory(mainCat, sub)}
                                    className="p-1 hover:text-forest text-ink2"
                                    title={`Add Product to ${sub.name}`}
                                  >
                                    <PackagePlus size={13} />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(sub)}
                                    className="p-1 hover:text-ink text-ink2"
                                    title="Edit Sub-Category"
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(sub.id, sub.name)}
                                    className="p-1 hover:text-wine text-ink2"
                                    title="Delete Sub-Category"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Selected Category Details & Quick Action Panel */}
            <div className="space-y-4">
              <div className="bg-paper border border-line rounded-xl p-6 shadow-soft space-y-5 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                    <Layers size={16} className="text-forest" /> Category Quick Actions
                  </h3>
                  {selectedCategory && (
                    <span className="text-[10px] bg-forest/10 text-forest border border-forest/20 px-2 py-0.5 rounded font-semibold">
                      Active
                    </span>
                  )}
                </div>

                {selectedCategory ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-canvas p-3 rounded-lg border border-line">
                      {selectedCategory.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedCategory.image} alt={selectedCategory.name} className="w-12 h-12 rounded-lg object-cover border border-line shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-base shrink-0">
                          {selectedCategory.name.substring(0, 1)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-ink text-sm">{selectedCategory.name}</h4>
                        <p className="text-xs text-ink2">Slug: {selectedCategory.slug}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          setSubForm({ name: "", slug: "", image: "", description: "", parentId: selectedCategory.id });
                          setAddSubModalOpen(true);
                        }}
                        variant="primary"
                        className="w-full justify-center"
                      >
                        <FolderPlus size={16} /> Add Sub-Category under {selectedCategory.name}
                      </Button>

                      <Button
                        onClick={() => handleAddProductToCategory(selectedCategory)}
                        variant="outline"
                        className="w-full justify-center"
                      >
                        <PackagePlus size={16} /> Add Product to {selectedCategory.name}
                      </Button>
                    </div>

                    <div className="pt-3 border-t border-line text-xs text-ink2 space-y-1">
                      <p><strong>Sub-Categories Count:</strong> {getSubcategories(selectedCategory.id).length}</p>
                      <p><strong>Status:</strong> Approved &amp; Active</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-ink2 space-y-3">
                    <p>Click any Main Category on the left to activate quick management actions.</p>
                    <Button
                      onClick={() => setAddMainModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="mx-auto"
                    >
                      <Plus size={14} /> Add Main Category
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Add Main Category */}
      <Modal open={addMainModalOpen} onClose={() => setAddMainModalOpen(false)} title="Create Main Category">
        <form onSubmit={handleAddMainCategory} className="space-y-4">
          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Category Name *</span>
            <input
              type="text"
              required
              value={mainForm.name}
              onChange={(e) => handleNameChange(e.target.value, setMainForm)}
              placeholder="e.g., Luxury Watches"
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
            />
          </label>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">URL Slug</span>
            <input
              type="text"
              value={mainForm.slug}
              onChange={(e) => setMainForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="e.g., luxury-watches"
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest font-mono text-xs"
            />
          </label>

          <div className="space-y-2 border border-line rounded-lg p-3 bg-canvas/30">
            <span className="block text-xs uppercase tracking-wider text-ink2 font-semibold">Category Image (File or URL)</span>
            
            <div className="grid gap-2">
              <input
                type="text"
                value={mainForm.image}
                onChange={(e) => setMainForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="Paste Image URL (https://...)"
                className="w-full border border-line rounded-sm px-3 py-2 text-xs bg-paper outline-none focus:border-forest"
              />
              
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-ink2 uppercase font-semibold">Or upload file:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e, setMainForm)}
                  className="text-xs text-ink2 flex-1"
                />
              </div>
            </div>

            {mainForm.image && (
              <div className="pt-2 flex items-center gap-3 border-t border-line mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mainForm.image} alt="Preview" className="w-12 h-12 rounded object-cover border border-line shrink-0" />
                <span className="text-[11px] text-forest font-semibold">Image Ready</span>
              </div>
            )}
          </div>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Description</span>
            <textarea
              value={mainForm.description}
              onChange={(e) => setMainForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest text-xs"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAddMainModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create Main Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Sub-Category */}
      <Modal open={addSubModalOpen} onClose={() => setAddSubModalOpen(false)} title="Add Sub-Category">
        <form onSubmit={handleAddSubCategory} className="space-y-4">
          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Parent Main Category *</span>
            <select
              value={subForm.parentId}
              onChange={(e) => setSubForm((f) => ({ ...f, parentId: e.target.value }))}
              required
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
            >
              <option value="">-- Select Main Category --</option>
              {mainCategories.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Sub-Category Name *</span>
            <input
              type="text"
              required
              value={subForm.name}
              onChange={(e) => handleNameChange(e.target.value, setSubForm)}
              placeholder="e.g., Chronograph Watches"
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
            />
          </label>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">URL Slug</span>
            <input
              type="text"
              value={subForm.slug}
              onChange={(e) => setSubForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="e.g., chronograph-watches"
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest font-mono text-xs"
            />
          </label>

          <div className="space-y-2 border border-line rounded-lg p-3 bg-canvas/30">
            <span className="block text-xs uppercase tracking-wider text-ink2 font-semibold">Sub-Category Image (File or URL)</span>
            
            <div className="grid gap-2">
              <input
                type="text"
                value={subForm.image}
                onChange={(e) => setSubForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="Paste Image URL (https://...)"
                className="w-full border border-line rounded-sm px-3 py-2 text-xs bg-paper outline-none focus:border-forest"
              />
              
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-ink2 uppercase font-semibold">Or upload file:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e, setSubForm)}
                  className="text-xs text-ink2 flex-1"
                />
              </div>
            </div>

            {subForm.image && (
              <div className="pt-2 flex items-center gap-3 border-t border-line mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={subForm.image} alt="Preview" className="w-12 h-12 rounded object-cover border border-line shrink-0" />
                <span className="text-[11px] text-forest font-semibold">Image Ready</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAddSubModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Add Sub-Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Edit Category */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Category">
        <form onSubmit={handleEditCategory} className="space-y-4">
          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Category Name *</span>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => handleNameChange(e.target.value, setEditForm)}
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
            />
          </label>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Parent Category (Leave blank if Main)</span>
            <select
              value={editForm.parentId}
              onChange={(e) => setEditForm((f) => ({ ...f, parentId: e.target.value }))}
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
            >
              <option value="">(None - Main Category)</option>
              {mainCategories.filter(m => m.id !== editingCategory?.id).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Description</span>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest text-xs"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
