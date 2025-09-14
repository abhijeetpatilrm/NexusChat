import { useState } from "react";
import { 
  FileText, 
  File, 
  Download, 
  Eye, 
  X,
  FileImage,
  FileVideo,
  FileAudio,
  Archive
} from "lucide-react";

const FilePreview = ({ file, onRemove, isOwnMessage }) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!file) return null;

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FileImage className="w-8 h-8 text-blue-500" />;
    if (fileType.startsWith('video/')) return <FileVideo className="w-8 h-8 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="w-8 h-8 text-green-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-8 h-8 text-orange-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (fileType) => {
    if (fileType.startsWith('image/')) return 'border-blue-200 bg-blue-50';
    if (fileType.startsWith('video/')) return 'border-purple-200 bg-purple-50';
    if (fileType.startsWith('audio/')) return 'border-green-200 bg-green-50';
    if (fileType.includes('pdf')) return 'border-red-200 bg-red-50';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'border-orange-200 bg-orange-50';
    return 'border-gray-200 bg-gray-50';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (file.type.startsWith('image/') || file.type.includes('pdf')) {
      setShowPreview(true);
    } else {
      handleDownload();
    }
  };

  return (
    <>
      <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getFileTypeColor(file.type)} max-w-xs`}>
        <div className="flex-shrink-0">
          {getFileIcon(file.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {file.type.split('/')[1] || 'File'}
          </p>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={handlePreview}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={file.type.startsWith('image/') || file.type.includes('pdf') ? 'Preview' : 'Download'}
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={handleDownload}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 hover:bg-red-200 rounded transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{file.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[70vh] overflow-auto">
              {file.type.startsWith('image/') ? (
                <img 
                  src={file.url} 
                  alt={file.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : file.type.includes('pdf') ? (
                <iframe
                  src={file.url}
                  className="w-full h-96 border-0"
                  title={file.name}
                />
              ) : null}
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Download
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilePreview;
