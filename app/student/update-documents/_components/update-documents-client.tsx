"use client";

import {
  IconCamera,
  IconPencil,
  IconPhoto,
  IconUpload,
  IconLoader2,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateStudentDocument } from "../lib/action";

interface UpdateDocumentsClientProps {
  currentPhoto: string | null;
  currentSignature: string | null;
}

type DocType = "photo" | "signature";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function UpdateDocumentsClient({
  currentPhoto,
  currentSignature,
}: UpdateDocumentsClientProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Update Your Documents
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload a new photo or signature to replace your existing documents.
          Accepted formats: JPG, PNG, WebP. Max size: 2MB.
        </p>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentCard
          type="photo"
          label="Profile Photo"
          description="Upload a clear passport-size photo with a plain background."
          currentUrl={currentPhoto}
          icon={<IconCamera className="h-5 w-5" />}
        />
        <DocumentCard
          type="signature"
          label="Signature"
          description="Upload a scanned copy of your signature on white paper."
          currentUrl={currentSignature}
          icon={<IconPencil className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}

// ─── DOCUMENT CARD ──────────────────────────────────────────────────────────────

function DocumentCard({
  type,
  label,
  description,
  currentUrl,
  icon,
}: {
  type: DocType;
  label: string;
  description: string;
  currentUrl: string | null;
  icon: React.ReactNode;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [oldUrl] = useState<string | null>(currentUrl); // Track the original URL for deletion
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, or WebP images.");
      return;
    }

    // Validate file size (2MB)
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum size is 2MB.");
      return;
    }

    setSelectedFile(file);

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpdate = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading(`Updating ${label.toLowerCase()}...`);

    try {
      // Step 1: Upload new file to /api/upload
      const formData = new FormData();
      formData.append(type, selectedFile);

      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadRes.data?.success || !uploadRes.data?.urls?.[type]) {
        throw new Error(uploadRes.data?.message || "Upload failed");
      }

      const newUrl: string = uploadRes.data.urls[type];

      // Step 2: Delete old file from Cloudinary (if exists)
      if (oldUrl) {
        try {
          await axios.post("/api/upload/delete", { url: oldUrl });
        } catch (deleteErr) {
          // Don't block the update if deletion fails — log it
          console.warn("Failed to delete old file from Cloudinary:", deleteErr);
        }
      }

      // Step 3: Update database via server action
      const result = await updateStudentDocument({ type, newUrl });

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success(result.message, { id: toastId });
      setSelectedFile(null);

      // Refresh the page to get fresh server data
      router.refresh();
    } catch (error: any) {
      console.error(`Error updating ${type}:`, error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to update ${label.toLowerCase()}`,
        { id: toastId },
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="overflow-hidden py-0 gap-0">
      {/* Card Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground">{label}</h3>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {description}
          </p>
        </div>
      </div>

      {/* Preview Area */}
      <div className="px-5 py-5 flex flex-col items-center gap-4">
        <div
          className={`relative rounded-xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted/20 transition-all ${
            type === "photo" ? "h-40 w-40" : "h-28 w-56"
          }`}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground/50">
              <IconPhoto className="h-8 w-8" />
              <span className="text-[10px] font-medium">No document</span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {selectedFile && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full">
            <IconAlertTriangle className="h-3.5 w-3.5" />
            <span className="font-medium">
              New file selected — click Update to save
            </span>
          </div>
        )}

        {!selectedFile && currentUrl && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full">
            <IconCheck className="h-3.5 w-3.5" />
            <span className="font-medium">Current document uploaded</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUpdating}
        >
          <IconUpload className="h-4 w-4 mr-1.5" />
          Choose File
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleUpdate}
          disabled={!selectedFile || isUpdating}
        >
          {isUpdating ? (
            <IconLoader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <IconCheck className="h-4 w-4 mr-1.5" />
          )}
          Update
        </Button>
      </div>
    </Card>
  );
}
