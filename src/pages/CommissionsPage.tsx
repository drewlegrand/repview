import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadTab } from '@/components/commissions/UploadTab';
import { ImportedDataTab } from '@/components/commissions/ImportedDataTab';
import { HistoryTab } from '@/components/commissions/HistoryTab';

export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Commission Imports</h1>
        <p className="text-sm text-muted-foreground">
          Automate data entry from manufacturer commission reports — upload a file, let AI map the layout, and store the
          invoices in your database with a full audit trail.
        </p>
      </div>
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Import report</TabsTrigger>
          <TabsTrigger value="data">Imported data</TabsTrigger>
          <TabsTrigger value="history">History &amp; audit</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-6"><UploadTab /></TabsContent>
        <TabsContent value="data" className="mt-6"><ImportedDataTab /></TabsContent>
        <TabsContent value="history" className="mt-6"><HistoryTab /></TabsContent>
      </Tabs>
    </div>
  );
}