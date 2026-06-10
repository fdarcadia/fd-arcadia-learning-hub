"use client";

import { ChangeEvent } from "react";

interface Props {
  onUpload: (url: string) => void;
}

export default function StickerUploader({
  onUpload,
}: Props) {

  const handleUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    onUpload(url);
  };

  return (
    <input
      type="file"
      accept="image/png"
      onChange={handleUpload}
    />
  );
}