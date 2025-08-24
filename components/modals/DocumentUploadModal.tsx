import React, { useState } from 'react';
import Modal from '../Modal';
import { UploadIcon, TrashIcon, EyeIcon, DownloadIcon, FileIcon } from '../icons/Icons';
import { UploadedFile, DocumentVisibility } from '../../types';
import CustomSelect from '../CustomSelect';

const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) {
        return <i className="fa-solid fa-file-pdf text-red-500 text-2xl w-6 text-center"></i>;
    }
    if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
        return <i className="fa-solid fa-file-image text-sky-500 text-2xl w-6 text-center"></i>;
    }
    if (['doc', 'docx'].includes(type)) {
        return <i className="fa-solid fa-file-word text-blue-600 text-2xl w-6 text-center"></i>;
    }
    return <FileIcon className="text-slate-500 dark:text-slate-400" />;
};

const visibilityOptions: {value: DocumentVisibility, label: string}[] = [
    { value: 'public', label: 'Public' },
    { value: 'gated', label: 'Gated' },
    { value: 'private', label: 'Private' },
];

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: UploadedFile[];
  onUpload: (file: File) => Promise<UploadedFile | null>;
  onDelete: (fileId: string) => Promise<void>;
  onSetVisibility: (fileId: string, visibility: DocumentVisibility) => Promise<void>;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose, documents, onUpload, onDelete, onSetVisibility }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (selectedFiles: FileList) => {
    setIsUploading(true);
    await Promise.all(Array.from(selectedFiles).map(file => onUpload(file)));
    setIsUploading(false);
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if(e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(e.target.files); };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Documents">
      <div className="space-y-6">
        <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${isDragging ? 'border-primary bg-primary/10 dark:bg-primary/20 scale-105' : 'border-border dark:border-dark-border hover:border-primary/70'}`}
        >
          <input type="file" multiple className="hidden" id="file-upload" onChange={onFileSelect} disabled={isUploading} />
          <label htmlFor="file-upload" className={`cursor-pointer flex flex-col items-center justify-center ${isUploading ? 'cursor-not-allowed' : ''}`}>
              {isUploading ? (
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
              ) : (
                  <UploadIcon className="text-primary/80" />
              )}
              <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                {isUploading ? 'Uploading...' : <><span className="font-semibold text-primary">Click to upload</span> or drag and drop</>}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isUploading ? 'Please wait.' : 'Add new documents to your profile'}</p>
          </label>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 -mr-3">
            {documents.length > 0 ? documents.map((file) => (
                <div key={file.id} className="bg-background dark:bg-dark-surface p-3 rounded-lg flex items-center justify-between animate-fade-in-up border border-border dark:border-dark-border hover:shadow-md hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary truncate">{file.name}</p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <CustomSelect<DocumentVisibility>
                            value={file.visibility} 
                            onChange={(v) => onSetVisibility(file.id, v)} 
                            options={visibilityOptions}
                            containerClassName="w-32"
                        />
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 hover:text-primary dark:hover:text-primary-light transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title="View"><EyeIcon /></a>
                        <a href={file.url} download={file.name} className="p-1.5 text-slate-500 hover:text-green-500 dark:hover:text-green-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title="Download"><DownloadIcon /></a>
                        <button onClick={() => onDelete(file.id)} className="p-1.5 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title="Delete"><TrashIcon /></button>
                    </div>
                </div>
            )) : (
                 <p className="text-sm text-center text-text-secondary dark:text-dark-text-secondary py-4">No documents uploaded yet. Drag a file or click above to start.</p>
            )}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-500/30 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentUploadModal;