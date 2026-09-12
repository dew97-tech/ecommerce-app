"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export function ImageField({
  label,
  description,
  urlName,
  fileName,
  currentUrl,
  required = false,
}) {
  const [isUpload, setIsUpload] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef(null);

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={urlName}>{label}</Label>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium transition-colors",
              !isUpload ? "text-foreground" : "text-muted-foreground"
            )}
          >
            URL
          </span>
          <Switch
            checked={isUpload}
            onCheckedChange={setIsUpload}
            label={`Use upload instead of URL for ${label || "image"}`}
          />
          <span
            className={cn(
              "text-xs font-medium transition-colors",
              isUpload ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Upload
          </span>
        </div>
      </div>

      {!isUpload ? (
        <Input
          id={urlName}
          name={urlName}
          defaultValue={currentUrl ?? ""}
          placeholder="https://example.com/image.jpg or /banners/..."
          required={required}
          className="min-w-0"
        />
      ) : (
        <>
          <input type="hidden" name={urlName} value={currentUrl ?? ""} />
          <input
            ref={fileInputRef}
            type="file"
            name={fileName}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) =>
              setSelectedFileName(event.target.files?.[0]?.name ?? "")
            }
          />
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full min-w-0 justify-start gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span className="truncate font-normal">
              {selectedFileName || "Choose an image file"}
            </span>
          </Button>
          {required && !selectedFileName && currentUrl === null && (
            <p className="text-xs text-destructive">
              Choose a file to upload.
            </p>
          )}
        </>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {currentUrl && (
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded border border-border bg-white">
            <Image
              src={currentUrl}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <span className="truncate text-xs text-muted-foreground">
            {currentUrl}
          </span>
        </div>
      )}
    </div>
  );
}
