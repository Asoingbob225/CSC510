import { useState, useRef } from 'react';
import { Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminApi, type AllergenBulkImportItem } from '@/lib/api';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: AllergenBulkImportItem[]) => void;
  isImporting: boolean;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onImport,
  isImporting,
}: BulkImportDialogProps) {
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setJsonText(text);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      const items = JSON.parse(jsonText) as AllergenBulkImportItem[];
      if (!Array.isArray(items)) {
        throw new Error('Data must be an array');
      }
      onImport(items);
      setJsonText('');
      onOpenChange(false);
    } catch {
      alert('Invalid JSON format. Please check your data.');
    }
  };

  const handleLoadSample = () => {
    const sample: AllergenBulkImportItem[] = [
      {
        name: 'peanuts',
        category: 'legumes',
        is_major_allergen: true,
        description: 'Common legume allergen',
      },
      {
        name: 'almonds',
        category: 'tree nuts',
        is_major_allergen: true,
        description: 'Tree nut allergen',
      },
    ];
    setJsonText(JSON.stringify(sample, null, 2));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Allergens</DialogTitle>
          <DialogDescription>
            Upload a JSON file or paste JSON data to import multiple allergens at once. Maximum 100
            items per import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload JSON File</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="mr-2 size-4" />
                Choose File
              </Button>
              <Button variant="outline" onClick={handleLoadSample}>
                Load Sample
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Or Paste JSON Data</Label>
            <Textarea
              placeholder='[{"name": "peanuts", "category": "legumes", "is_major_allergen": true, "description": "..."}]'
              value={jsonText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonText(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!jsonText.trim() || isImporting}>
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allergenCount: number;
}

export function ExportDialog({ open, onOpenChange, allergenCount }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const blob = await adminApi.exportAllergens(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `allergens_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onOpenChange(false);
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Allergens</DialogTitle>
          <DialogDescription>
            Export all {allergenCount} allergen(s) from the database in your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="w-full justify-start"
          >
            <FileJson className="mr-2 size-4" />
            Export as JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="w-full justify-start"
          >
            <FileSpreadsheet className="mr-2 size-4" />
            Export as CSV
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
