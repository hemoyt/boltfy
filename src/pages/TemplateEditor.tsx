import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailTemplateEditor, EmailBlock } from "@/components/templates/EmailTemplateEditor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save } from "lucide-react";

export default function TemplateEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!templateName) {
      toast({
        title: "Missing template name",
        description: "Please enter a name for your template.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.from("email_templates").insert([{
        name: templateName,
        subject: subject || null,
        content: JSON.parse(JSON.stringify(blocks)),
        preview_text: blocks.find((b) => b.type === "text")?.content?.slice(0, 100) || null,
      }]);

      if (error) throw error;

      toast({
        title: "Template saved!",
        description: "Your email template has been saved successfully.",
      });

      navigate("/templates");
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error saving template",
        description: "There was an error saving your template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/templates")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Template Editor</h1>
              <p className="text-muted-foreground mt-1">
                Create beautiful email templates with drag-and-drop
              </p>
            </div>
          </div>
          <Button variant="gradient" className="gap-2" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </div>

        {/* Template Settings */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Set the name and default subject for your template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  placeholder="My Awesome Template"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Default Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Welcome to our newsletter!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <div className="animate-fade-in">
          <EmailTemplateEditor blocks={blocks} onBlocksChange={setBlocks} />
        </div>
      </div>
    </Layout>
  );
}
