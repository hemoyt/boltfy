import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Mail, Calendar, FileText, Loader2, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Submission {
  id: string;
  created_at: string;
  form_name: string;
  metadata: Record<string, any>;
}

export default function Subscribers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("form_submissions")
        .select("id, created_at, form_name, metadata")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data as unknown as Submission[]);
    } catch (error: any) {
      toast({
        title: "Error fetching leads",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmailFromMetadata = (metadata: Record<string, any>) => {
    // First, look for common email field names
    const emailKey = Object.keys(metadata).find(key =>
      key.toLowerCase().includes("email") ||
      key.toLowerCase() === "mail" ||
      key.toLowerCase().includes("e-mail")
    );
    if (emailKey && metadata[emailKey]) return metadata[emailKey];

    // If not found by key name, look for values that look like emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === "string" && emailRegex.test(value)) {
        return value;
      }
    }

    return "N/A";
  };

  // Format field labels to be more readable
  const formatFieldLabel = (key: string) => {
    // If it's a timestamp-based field ID, return a generic label
    if (/^field[-_]?\d+[-_]?\d*$/i.test(key.replace(/\s/g, ""))) {
      const match = key.match(/(\d+)$/);
      if (match) {
        const fieldNum = key.split(/[-_\s]/).filter(p => /^\d+$/.test(p)).length;
        return `Field ${fieldNum || 1}`;
      }
      return "Field";
    }
    // Otherwise, format the key nicely
    return key
      .replace(/[-_]/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredSubmissions = submissions.filter(sub => {
    const email = getEmailFromMetadata(sub.metadata).toLowerCase();
    const formName = sub.form_name.toLowerCase();
    const search = searchTerm.toLowerCase();
    return email.includes(search) || formName.includes(search);
  });

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) return;

    setExporting(true);
    try {
      const headers = ["Date", "Form", "Email", "All Data"];
      const rows = filteredSubmissions.map(sub => [
        format(new Date(sub.created_at), "yyyy-MM-dd HH:mm"),
        sub.form_name,
        getEmailFromMetadata(sub.metadata),
        JSON.stringify(sub.metadata).replace(/"/g, '""')
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `boltfy-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "CSV Exported", description: "Your leads have been downloaded." });
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    if (filteredSubmissions.length === 0) return;

    setExporting(true);
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(99, 102, 241); // Boltfy Primary
      doc.text("Boltfy Form Leads Report", 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on ${format(new Date(), "PPpp")}`, 14, 30);

      const tableData = filteredSubmissions.map(sub => [
        format(new Date(sub.created_at), "MMM d, yyyy"),
        sub.form_name,
        getEmailFromMetadata(sub.metadata),
      ]);

      // Use autoTable as a function (jspdf-autotable v3+)
      autoTable(doc, {
        startY: 40,
        head: [["Date", "Form Name", "Email Address"]],
        body: tableData,
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });

      doc.save(`boltfy-leads-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "PDF Exported", description: "Your report is ready." });
    } catch (error) {
      console.error("PDF Export error:", error);
      toast({ title: "Export failed", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Subscribers</h1>
            <p className="text-muted-foreground mt-1">
              View and manage leads collected through your forms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={loading || filteredSubmissions.length === 0}
              className="gap-2 border-border hover:bg-muted"
            >
              <FileText className="h-4 w-4" /> Export CSV
            </Button>
            <Button
              variant="gradient"
              onClick={exportToPDF}
              disabled={loading || filteredSubmissions.length === 0}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or form..."
                  className="pl-10 bg-background border-border"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Badge variant="outline" className="ml-4 h-10 px-4 border-border bg-background/50">
                {filteredSubmissions.length} Total Leads
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Loading your leads...</p>
              </div>
            ) : filteredSubmissions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/50">
                      <TableHead className="w-[140px]">Date</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((sub) => (
                      <TableRow key={sub.id} className="border-border/50 group hover:bg-muted/20">
                        <TableCell className="font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(sub.created_at), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <Mail className="h-4 w-4 text-primary" />
                            {getEmailFromMetadata(sub.metadata)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-muted text-muted-foreground border-border/50 font-normal">
                            {sub.form_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedSubmission(sub)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                <div className="p-4 rounded-full bg-muted/50 border border-border/50">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No leads found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {searchTerm
                      ? `No results for "${searchTerm}". Try a different search.`
                      : "When users submit your forms, their emails will appear here."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Submission Details
              </DialogTitle>
              <DialogDescription>
                From {selectedSubmission?.form_name} • {selectedSubmission && format(new Date(selectedSubmission.created_at), "PPP p")}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedSubmission && Object.entries(selectedSubmission.metadata).map(([key, value], index) => {
                const isEmail = typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                return (
                  <div key={key} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      {isEmail ? "Email Address" : formatFieldLabel(key) || `Response ${index + 1}`}
                    </Label>
                    <p className="text-foreground font-medium mt-1.5 flex items-center gap-2">
                      {isEmail && <Mail className="h-4 w-4 text-primary" />}
                      {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
