import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  size?: number;
  modified?: string;
}

const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeDirectory();
  }, []);

  const loadHomeDirectory = async () => {
    try {
      const homePath = await invoke<string>("get_home_directory");
      setCurrentPath(homePath);
      await loadDirectory(homePath);
    } catch (error) {
      console.error("Failed to get home directory:", error);
      setError("Failed to load home directory");
    }
  };

  const loadDirectory = async (path: string) => {
    setLoading(true);
    setError(null);

    try {
      const entries = await invoke<FileEntry[]>("list_directory", { path });
      setFiles(entries);
      setCurrentPath(path);
    } catch (error) {
      console.error("Failed to load directory:", error);
      setError("Failed to load directory");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: FileEntry) => {
    if (file.is_directory) {
      loadDirectory(file.path);
    } else {
      // For now, just log the file click
      // In the future, this could open files in an editor
      console.log("File clicked:", file.path);
    }
  };

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    loadDirectory(parentPath);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (file: FileEntry): string => {
    if (file.is_directory) {
      return "📁";
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return "🟨";
      case 'py':
        return "🐍";
      case 'rs':
        return "🦀";
      case 'json':
        return "📄";
      case 'md':
        return "📝";
      case 'txt':
        return "📄";
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return "🖼️";
      default:
        return "📄";
    }
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <button
          className="nav-btn"
          onClick={navigateUp}
          disabled={currentPath === '/'}
          title="Go up"
        >
          ⬆️
        </button>
        <button
          className="nav-btn"
          onClick={loadHomeDirectory}
          title="Go home"
        >
          🏠
        </button>
        <div className="current-path" title={currentPath}>
          {currentPath.split('/').pop() || '/'}
        </div>
      </div>

      <div className="file-list">
        {loading && <div className="loading">Loading...</div>}

        {error && <div className="error">{error}</div>}

        {!loading && !error && files.map((file, index) => (
          <div
            key={index}
            className={`file-item ${file.is_directory ? 'directory' : 'file'}`}
            onClick={() => handleFileClick(file)}
          >
            <span className="file-icon">{getFileIcon(file)}</span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">
              {file.is_directory ? "" : formatFileSize(file.size)}
            </span>
          </div>
        ))}

        {!loading && !error && files.length === 0 && (
          <div className="empty">Directory is empty</div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;