'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  Loader2, 
  Image as ImageIcon, 
  ExternalLink, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { Banner } from '@/lib/types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit / Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    image_url: '',
    target_url: '/shop',
    button_text: 'EXPLORE',
    display_order: 1,
    is_active: true
  });

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners?includeInactive=true');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBanners(data);
      }
    } catch {
      alert('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      id: `b-${Date.now()}`,
      title: 'Welcome to Dregital',
      subtitle: 'Discover curated collections across Tech, Food, Clothing, Kids, Home and more.',
      image_url: '',
      target_url: '/shop',
      button_text: 'EXPLORE',
      display_order: banners.length + 1,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({ ...banner });
    setIsModalOpen(true);
  };

  // Upload 16:9 Banner Photo from PC to Supabase image bucket
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append('folder', 'banners');
      body.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body
      });
      const data = await res.json();

      if (data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveBannersList = async (updatedList: Banner[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList)
      });
      if (res.ok) {
        const saved = await res.json();
        setBanners(saved);
        return true;
      } else {
        alert('Failed to save banners');
        return false;
      }
    } catch {
      alert('Network error while saving banners');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Banner title is required');
      return;
    }

    let updatedList: Banner[] = [];
    if (editingBanner) {
      updatedList = banners.map(b => 
        b.id === editingBanner.id ? ({ ...b, ...formData } as Banner) : b
      );
    } else {
      const newBanner: Banner = {
        id: formData.id || `b-${Date.now()}`,
        title: formData.title || 'Welcome to Dregital',
        subtitle: formData.subtitle || '',
        image_url: formData.image_url || '',
        target_url: formData.target_url || '/shop',
        button_text: formData.button_text || 'EXPLORE',
        display_order: Number(formData.display_order) || banners.length + 1,
        is_active: formData.is_active !== false
      };
      updatedList = [...banners, newBanner];
    }

    const ok = await saveBannersList(updatedList);
    if (ok) {
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    const filtered = banners.filter(b => b.id !== id);
    await saveBannersList(filtered);
  };

  const handleToggleActive = async (banner: Banner) => {
    const updated = banners.map(b => 
      b.id === banner.id ? { ...b, is_active: !b.is_active } : b
    );
    await saveBannersList(updated);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">Hero Banners (16:9)</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                Supabase: image/banners/
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Upload and manage wide 16:9 ratio promotional banners displayed on the homepage hero section.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Banner</span>
          </button>
        </div>

        {/* Banners List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs">Loading banners...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 border border-dashed border-neutral-800 rounded-2xl text-center bg-neutral-900/40">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No hero banners created yet</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
              Add your first 16:9 banner to showcase your brand, sales, or seasonal promotions on the Dregital homepage.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase rounded-lg hover:bg-neutral-200"
            >
              <Plus className="w-4 h-4" />
              <span>Create 16:9 Banner</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {banners.map((banner, index) => (
              <div 
                key={banner.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg"
              >
                {/* 16:9 Aspect Ratio Preview Container */}
                <div className="w-full aspect-[16/9] relative bg-neutral-950 overflow-hidden group">
                  {banner.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-600">
                      <ImageIcon className="w-10 h-10 mb-2 stroke-1" />
                      <span className="text-xs uppercase font-mono tracking-widest">No 16:9 Image Uploaded</span>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      banner.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {banner.is_active ? 'Active on Homepage' : 'Draft / Inactive'}
                    </span>
                  </div>
                </div>

                {/* Banner details & action bar */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-t border-neutral-800 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-neutral-200">
                      {banner.title || 'Untitled Banner'}
                    </div>
                    <div className="font-mono text-[11px] text-neutral-400">
                      Target: <span className="text-neutral-300">{banner.target_url || '/shop'}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Order: #{banner.display_order || index + 1}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                        banner.is_active 
                          ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' 
                          : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      title={banner.is_active ? 'Deactivate banner' : 'Activate banner'}
                    >
                      {banner.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEditModal(banner)}
                      className="p-2 rounded-lg border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Edit banner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      title="Delete banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Edit / Create 16:9 Banner Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 text-white shadow-2xl my-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
                <div>
                  <h2 className="text-base font-bold uppercase tracking-tight">
                    {editingBanner ? 'Edit 16:9 Banner' : 'Create 16:9 Banner'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Images uploaded from your PC will be saved to Supabase storage bucket: <span className="text-white font-mono">image/banners/</span>
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="space-y-5 text-xs">
                
                {/* 16:9 Live Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-300">16:9 Aspect Ratio Live Preview</span>
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">1600 x 900 px (16:9)</span>
                  </div>

                  <div className="w-full aspect-[16/9] bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 relative flex items-center justify-center">
                    {formData.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.image_url}
                        alt="Preview 16:9"
                        className="w-full h-full object-contain sm:object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-600 gap-1">
                        <ImageIcon className="w-8 h-8 stroke-1" />
                        <span className="text-[11px] font-mono uppercase tracking-wider">No Image Selected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload from PC to Supabase */}
                <div className="space-y-2">
                  <label className="block text-neutral-300 font-semibold">
                    Upload 16:9 Photo from PC *
                  </label>

                  <label className="border-2 border-dashed border-neutral-700 hover:border-neutral-400 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-950/60 hover:bg-neutral-950 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-neutral-300 py-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-xs font-medium">Uploading 16:9 banner to Supabase storage...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 py-1 text-center">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-white">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-neutral-200">
                          {formData.image_url ? 'Choose different 16:9 photo from PC' : 'Click to select 16:9 Banner Photo from PC'}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          Ideal resolution: 1920x1080 or 1600x900 (16:9 ratio). Uploaded directly to Supabase.
                        </span>
                      </div>
                    )}
                  </label>

                  {/* Fallback Direct URL */}
                  <div>
                    <input
                      type="url"
                      placeholder="Or enter direct 16:9 image URL (https://...)"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-[11px] placeholder-neutral-600 focus:border-neutral-500"
                    />
                  </div>
                </div>

                {/* Banner Text Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Banner Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                      placeholder="e.g. DREGITAL COLLECTION"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Button Text</label>
                    <input
                      type="text"
                      value={formData.button_text || ''}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                      placeholder="e.g. EXPLORE"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white resize-none"
                    placeholder="Short description underneath the banner title"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Target Link URL</label>
                    <input
                      type="text"
                      value={formData.target_url || ''}
                      onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono"
                      placeholder="/shop or /category/tech"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order || 1}
                      onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active !== false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded bg-neutral-950 border-neutral-700 text-white"
                    />
                    <span className="font-medium text-white">Active (Display in homepage hero banner)</span>
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-white text-black font-bold uppercase rounded-lg hover:bg-neutral-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save Banner</span>
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}