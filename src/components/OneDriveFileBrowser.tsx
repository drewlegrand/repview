import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  Folder, FileText, FileImage, FileSpreadsheet, File, Upload, Download,
  ChevronRight, ArrowLeft, Search, MoreVertical, Plus, FolderOpen, Link2, Unlink, Eye
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  ext?: string;
  size?: string;
  modified: string;
  modifiedBy: string;
}

const demoFileTree: Record<string, FileItem[]> = {
  root: [
    { id: 'f1', name: 'Bid Documents', type: 'folder', modified: '2026-03-15', modifiedBy: 'Sarah Chen' },
    { id: 'f2', name: 'Drawings', type: 'folder', modified: '2026-03-22', modifiedBy: 'Mike Torres' },
    { id: 'f3', name: 'Submittals', type: 'folder', modified: '2026-03-10', modifiedBy: 'Sarah Chen' },
    { id: 'f4', name: 'Contracts', type: 'folder', modified: '2026-02-28', modifiedBy: 'James Liu' },
    { id: 'f5', name: 'Photos', type: 'folder', modified: '2026-03-25', modifiedBy: 'Mike Torres' },
    { id: 'd1', name: 'Project Overview.docx', type: 'file', ext: 'docx', size: '2.4 MB', modified: '2026-03-20', modifiedBy: 'Sarah Chen' },
    { id: 'd2', name: 'Budget Summary.xlsx', type: 'file', ext: 'xlsx', size: '856 KB', modified: '2026-03-18', modifiedBy: 'James Liu' },
    { id: 'd3', name: 'Meeting Notes - 03-25.pdf', type: 'file', ext: 'pdf', size: '340 KB', modified: '2026-03-25', modifiedBy: 'Sarah Chen' },
  ],
  f1: [
    { id: 'b1', name: 'Carlisle SynTec Bid.pdf', type: 'file', ext: 'pdf', size: '4.2 MB', modified: '2026-03-14', modifiedBy: 'Mike Torres' },
    { id: 'b2', name: 'VELUX Skylights Proposal.pdf', type: 'file', ext: 'pdf', size: '3.1 MB', modified: '2026-03-12', modifiedBy: 'Sarah Chen' },
    { id: 'b3', name: 'Bid Comparison.xlsx', type: 'file', ext: 'xlsx', size: '1.2 MB', modified: '2026-03-15', modifiedBy: 'James Liu' },
    { id: 'b4', name: 'Scope of Work.docx', type: 'file', ext: 'docx', size: '890 KB', modified: '2026-03-10', modifiedBy: 'Sarah Chen' },
  ],
  f2: [
    { id: 'dr1', name: 'Roof Plan - Rev C.dwg', type: 'file', ext: 'dwg', size: '12.4 MB', modified: '2026-03-22', modifiedBy: 'Mike Torres' },
    { id: 'dr2', name: 'Detail Sections.pdf', type: 'file', ext: 'pdf', size: '8.7 MB', modified: '2026-03-20', modifiedBy: 'Mike Torres' },
    { id: 'dr3', name: 'Skylight Layout.pdf', type: 'file', ext: 'pdf', size: '5.3 MB', modified: '2026-03-18', modifiedBy: 'Sarah Chen' },
  ],
  f3: [
    { id: 's1', name: 'Membrane Submittal.pdf', type: 'file', ext: 'pdf', size: '6.8 MB', modified: '2026-03-10', modifiedBy: 'Mike Torres' },
    { id: 's2', name: 'Insulation Specs.pdf', type: 'file', ext: 'pdf', size: '2.1 MB', modified: '2026-03-08', modifiedBy: 'Sarah Chen' },
    { id: 's3', name: 'Submittal Log.xlsx', type: 'file', ext: 'xlsx', size: '420 KB', modified: '2026-03-10', modifiedBy: 'James Liu' },
  ],
  f4: [
    { id: 'c1', name: 'Subcontract Agreement.pdf', type: 'file', ext: 'pdf', size: '1.8 MB', modified: '2026-02-28', modifiedBy: 'James Liu' },
    { id: 'c2', name: 'Change Order #1.docx', type: 'file', ext: 'docx', size: '340 KB', modified: '2026-03-05', modifiedBy: 'James Liu' },
  ],
  f5: [
    { id: 'p1', name: 'Site Photo - East Elevation.jpg', type: 'file', ext: 'jpg', size: '3.4 MB', modified: '2026-03-25', modifiedBy: 'Mike Torres' },
    { id: 'p2', name: 'Roof Deck Prep.jpg', type: 'file', ext: 'jpg', size: '2.8 MB', modified: '2026-03-24', modifiedBy: 'Mike Torres' },
    { id: 'p3', name: 'Material Delivery.jpg', type: 'file', ext: 'jpg', size: '4.1 MB', modified: '2026-03-22', modifiedBy: 'Mike Torres' },
  ],
};

const getFileIcon = (item: FileItem) => {
  if (item.type === 'folder') return <Folder className="h-5 w-5 text-blue-500" />;
  switch (item.ext) {
    case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
    case 'docx': return <FileText className="h-5 w-5 text-blue-600" />;
    case 'xlsx': return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    case 'jpg': case 'png': return <FileImage className="h-5 w-5 text-purple-500" />;
    default: return <File className="h-5 w-5 text-muted-foreground" />;
  }
};

interface OneDriveFileBrowserProps {
  projectName: string;
}

export default function OneDriveFileBrowser({ projectName }: OneDriveFileBrowserProps) {
  const [linked, setLinked] = useState(false);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : 'root';
  const files = demoFileTree[currentFolderId] || [];
  const filteredFiles = searchQuery
    ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  const navigateToFolder = (folder: FileItem) => {
    setCurrentPath([...currentPath, { id: folder.id, name: folder.name }]);
    setSearchQuery('');
  };

  const navigateBack = () => {
    setCurrentPath(currentPath.slice(0, -1));
    setSearchQuery('');
  };

  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSearchQuery('');
  };

  if (!linked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <FolderOpen className="h-8 w-8 text-blue-500" />
        </div>
        <div className="text-center max-w-sm">
          <h3 className="text-sm font-semibold mb-1">Link OneDrive Folder</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Connect a OneDrive folder to this project to browse, upload, and manage files directly from the CRM.
          </p>
          <Button onClick={() => setFolderPickerOpen(true)}>
            <Link2 className="h-4 w-4 mr-1.5" />Select Folder
          </Button>
        </div>

        {/* Folder Picker Dialog */}
        <Dialog open={folderPickerOpen} onOpenChange={setFolderPickerOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select OneDrive Folder</DialogTitle>
              <DialogDescription>Choose a folder to link to "{projectName}"</DialogDescription>
            </DialogHeader>
            <div className="space-y-1 py-2 max-h-64 overflow-y-auto">
              {[
                { name: projectName, path: `My Files / Projects / ${projectName}` },
                { name: 'Projects', path: 'My Files / Projects' },
                { name: 'Shared Documents', path: 'Shared Documents' },
                { name: `${projectName} - Roofing`, path: `My Files / Active Jobs / ${projectName} - Roofing` },
              ].map((folder) => (
                <button
                  key={folder.path}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent text-left transition-colors"
                  onClick={() => { setLinked(true); setFolderPickerOpen(false); }}
                >
                  <Folder className="h-5 w-5 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{folder.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{folder.path}</p>
                  </div>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFolderPickerOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-3.5 w-3.5 mr-1" />Upload
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5 mr-1" />New Folder
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"><MoreVertical className="h-3.5 w-3.5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />Open in OneDrive
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setLinked(false)}>
                <Unlink className="h-4 w-4 mr-2" />Unlink Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto">
        <button
          onClick={() => setCurrentPath([])}
          className="hover:text-foreground transition-colors shrink-0 font-medium"
        >
          {projectName}
        </button>
        {currentPath.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="h-3 w-3" />
            <button
              onClick={() => navigateToBreadcrumb(i)}
              className="hover:text-foreground transition-colors font-medium"
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* File list */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_100px_140px_120px] gap-2 px-4 py-2 bg-muted/40 border-b text-xs font-medium text-muted-foreground">
          <span>Name</span>
          <span>Size</span>
          <span>Modified</span>
          <span>Modified By</span>
        </div>

        {/* Back button */}
        {currentPath.length > 0 && (
          <button
            onClick={navigateBack}
            className="w-full grid grid-cols-[1fr_100px_140px_120px] gap-2 px-4 py-2.5 hover:bg-accent/50 transition-colors border-b text-left"
          >
            <span className="flex items-center gap-3 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </span>
          </button>
        )}

        {/* Files */}
        {filteredFiles.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No files match your search.' : 'This folder is empty.'}
          </div>
        )}
        {filteredFiles.map(item => (
          <button
            key={item.id}
            className="w-full grid grid-cols-[1fr_100px_140px_120px] gap-2 px-4 py-2.5 hover:bg-accent/50 transition-colors border-b last:border-0 text-left group"
            onClick={() => item.type === 'folder' && navigateToFolder(item)}
            onDoubleClick={() => item.type === 'file' && alert(`Opening ${item.name}...`)}
          >
            <span className="flex items-center gap-3 min-w-0">
              {getFileIcon(item)}
              <span className="text-sm truncate group-hover:text-foreground">{item.name}</span>
            </span>
            <span className="text-xs text-muted-foreground self-center">{item.size || '—'}</span>
            <span className="text-xs text-muted-foreground self-center">{item.modified}</span>
            <span className="text-xs text-muted-foreground self-center truncate">{item.modifiedBy}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-1">
        Synced with OneDrive · Last sync: 2 minutes ago
      </p>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload to: {projectName}{currentPath.map(c => ` / ${c.name}`).join('')}
            </DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Drag & drop files here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            <Button variant="outline" size="sm" className="mt-3">Browse Files</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setUploadDialogOpen(false)}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
