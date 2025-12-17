// components/simple-editor.tsx
"use client";
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      ["link", "image"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      className="min-h-64"
    />
  );
};

export default SimpleEditor;