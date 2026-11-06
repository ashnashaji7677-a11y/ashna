import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Link as LinkIcon, Plus } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 5,
  label = 'Upload Images',
  helperText = 'Upload clear photos (JPG, PNG, WebP up to 5MB each). Multiple images allowed.',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange([...images, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
      setUrlInputOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider">
          {label} ({images.length}/{maxImages})
        </label>
        <button
          type="button"
          onClick={() => setUrlInputOpen(!urlInputOpen)}
          className="text-xs text-[#238B57] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          {urlInputOpen ? 'Cancel URL' : 'Add via Image URL'}
        </button>
      </div>

      {urlInputOpen && (
        <div className="flex gap-2 p-2 bg-[#F9FBF9] border border-[#E8F5EC] rounded-xl animate-in fade-in">
          <input
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#238B57]"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-[#238B57] text-white text-xs font-semibold rounded-lg hover:bg-[#1b6d44] cursor-pointer"
          >
            Add
          </button>
        </div>
      )}

      {/* Drag & Drop Area */}
      {images.length < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-[#238B57]/30 hover:border-[#238B57] hover:bg-[#E8F5EC]/40 rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#F9FBF9] flex flex-col items-center justify-center group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-[#E8F5EC] text-[#238B57] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#202B25]">
            Click to upload or drag & drop photos
          </p>
          <p className="text-xs text-[#78847D] mt-1 max-w-sm">{helperText}</p>
        </div>
      )}

      {/* Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden border border-[#E8F5EC] bg-white group shadow-xs"
            >
              <img
                src={img}
                alt={`Upload preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md cursor-pointer transition-transform hover:scale-110"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                #{idx + 1}
              </span>
            </div>
          ))}

          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video sm:aspect-square rounded-xl border border-dashed border-gray-300 hover:border-[#238B57] bg-white hover:bg-[#E8F5EC]/30 flex flex-col items-center justify-center text-[#78847D] hover:text-[#238B57] transition-all cursor-pointer"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Add More</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

