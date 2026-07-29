import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadTab } from '@/components/commissions/UploadTab';
import { OutstandingTab } from '@/components/commissions/OutstandingTab';
import { OrdersTab } from '@/components/commissions/OrdersTab';
import { HistoryTab } from '@/components/commissions/HistoryTab';

export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Commissions</h1>
        <p className="text-sm text-muted-foreground">
          Import manufacturer POS reports, reconcile them against your order tracking, and see what you're still owed.
        </p>
      </div>
      <Tabs defaultValue="outstanding">
        <TabsList>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          <TabsTrigger value="upload">Import report</TabsTrigger>
          <TabsTrigger value="orders">Order tracking</TabsTrigger>
          <TabsTrigger value="history">History &amp; audit</TabsTrigger>
        </TabsList>
        <TabsContent value="outstanding" className="mt-6"><OutstandingTab /></TabsContent>
        <TabsContent value="upload" className="mt-6"><UploadTab /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
        <TabsContent value="history" className="mt-6"><HistoryTab /></TabsContent>
      </Tabs>
    </div>
  );
}