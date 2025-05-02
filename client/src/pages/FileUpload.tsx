import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { File as FileType } from "@shared/schema";
import { useDropzone } from "react-dropzone";
import { 
  FileText, 
  Table, 
  FileJson, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  Trash2, 
  Clock 
} from "lucide-react";

export default function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch all files
  const { data: files, isLoading, isError } = useQuery<FileType[]>({
    queryKey: ['/api/files'],
  });
  
  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return apiRequest('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "File uploaded successfully!",
        description: "Your file has been uploaded and is now available in the list.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      setIsUploading(false);
    },
    onError: (error) => {
      let message = "Something went wrong. Please try again.";
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  });
  
  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: (fileId: number) => {
      return apiRequest(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "The file has been removed.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Could not delete the file. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle file upload through the input element
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };
  
  // Handle file upload
  const handleUpload = (file: Blob) => {
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    uploadMutation.mutate(formData);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file deletion
  const handleDelete = (fileId: number) => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteMutation.mutate(fileId);
    }
  };
  
  // File icon mapping
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'csv':
        return <Table className="h-10 w-10 text-green-500" />;
      case 'json':
        return <FileJson className="h-10 w-10 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />;
      default:
        return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format timestamp
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0]);
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <main className="flex-grow flex flex-col p-6 bg-[#F5F5F5]">
      <div className="max-w-7xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-neutral-dark mb-6">File Upload</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Upload CSV, JSON, or PDF files to the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors ${
                    isDragActive 
                      ? 'border-primary bg-blue-50 text-primary' 
                      : 'border-gray-300 hover:border-primary hover:bg-blue-50'
                  }`}
                >
                  <input {...getInputProps()} ref={fileInputRef} onChange={handleFileChange} />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  
                  {isDragActive ? (
                    <p className="text-lg font-medium">Drop your file here...</p>
                  ) : (
                    <>
                      <p className="text-lg font-medium mb-2">Drag & drop a file here, or click to select</p>
                      <p className="text-sm text-gray-500 mb-2">Supported file types: CSV, JSON, PDF</p>
                      <p className="text-xs text-gray-400">Maximum file size: 5MB</p>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Select File'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Files list section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>
                  View and manage your uploaded files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                    <p className="text-gray-500">Loading files...</p>
                  </div>
                ) : isError ? (
                  <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <p className="text-gray-700">Failed to load files. Please try again.</p>
                  </div>
                ) : files && files.length > 0 ? (
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center border rounded-lg p-4 transition-colors hover:bg-gray-50">
                        <div className="flex-shrink-0 mr-4">
                          {getFileIcon(file.fileType)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-lg font-medium text-gray-900 truncate">{file.originalName}</h4>
                          <div className="flex flex-wrap items-center mt-1 gap-2">
                            <Badge variant="outline" className="text-xs bg-gray-100">
                              {file.fileType.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(file.uploadedAt)}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="flex-shrink-0 text-gray-500 hover:text-red-500"
                          onClick={() => handleDelete(file.id)}
                          title="Delete file"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-700 mb-2">No files uploaded yet</p>
                    <p className="text-sm text-gray-500">Upload a file to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}