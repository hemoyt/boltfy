import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { emailService } from "@/lib/email";
import { Send, FileText, Clock, CheckCircle, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Campaign {
  id: string;
  subject: string;
  status: string;
  recipients_count: number | null;
  open_rate: number | null;
  sent_at: string | null;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  status: string;
}

const statusConfig: Record<string, { icon: typeof FileText; color: string }> = {
  draft: { icon: FileText, color: "bg-muted text-muted-foreground" },
  sent: { icon: CheckCircle, color: "bg-success/10 text-success" },
  scheduled: { icon: Clock, color: "bg-warning/10 text-warning" },
};

export default function Campaigns() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [campaignsRes, subscribersRes] = await Promise.all([
        supabase.from("campaigns").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("subscribers").select("id, email, status").eq("user_id", user.id),
      ]);

      if (campaignsRes.error) throw campaignsRes.error;
      if (subscribersRes.error) throw subscribersRes.error;

      setCampaigns(campaignsRes.data || []);
      setSubscribers(subscribersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error loading data",
        description: "Could not load campaigns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activeSubscribers = subscribers.filter((s) => s.status === "active");

  const handleSendCampaign = async () => {
    if (!subject || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in the subject and content.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    if (activeSubscribers.length === 0) {
      toast({
        title: "No active subscribers",
        description: "Add subscribers before sending a campaign.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const unsubscribeBaseUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/unsubscribe`;
      const results = await emailService.sendCampaign(
        activeSubscribers.map((s) => s.email),
        subject,
        content,
        `${unsubscribeBaseUrl}?owner=${user.id}`
      );
      const successCount = results.filter((r) => r.success).length;

      const { error } = await supabase.from("campaigns").insert([{
        subject,
        content,
        status: "sent",
        recipients_count: successCount,
        sent_at: new Date().toISOString(),
        user_id: user.id,
      }]);

      if (error) throw error;

      toast({
        title: successCount > 0 ? "Campaign sent!" : "Campaign could not be delivered",
        description: `Delivered to ${successCount} of ${activeSubscribers.length} subscribers.`,
        variant: successCount > 0 ? "default" : "destructive",
      });

      setSubject("");
      setContent("");
      fetchData();
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast({
        title: "Error sending campaign",
        description: "Could not send campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!subject) {
      toast({
        title: "Missing subject",
        description: "Please enter a subject for your campaign.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      const { error } = await supabase.from("campaigns").insert([{
        subject,
        content,
        status: "draft",
        user_id: user.id,
      }]);

      if (error) throw error;

      toast({
        title: "Draft saved",
        description: "Your campaign has been saved as a draft.",
      });

      setSubject("");
      setContent("");
      fetchData();
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error saving draft",
        description: "Could not save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your email campaigns.
          </p>
        </div>

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="compose" className="gap-2">
              <Mail className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
                <CardDescription>
                  Compose your email and send it to {activeSubscribers.length} active
                  subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    placeholder="Enter your email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your email content here..."
                    className="min-h-[300px] resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    This email will be sent to{" "}
                    <span className="font-semibold text-foreground">
                      {activeSubscribers.length}
                    </span>{" "}
                    active subscribers
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSaveDraft}>
                      Save Draft
                    </Button>
                    <Button variant="gradient" className="gap-2" onClick={handleSendCampaign} disabled={isSending}>
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Campaign
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 animate-fade-in">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : campaigns.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-accent p-4 mb-4">
                    <Mail className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    Create your first campaign to start reaching your subscribers.
                  </p>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign, index) => {
                const config = statusConfig[campaign.status] || statusConfig.draft;
                const StatusIcon = config.icon;
                return (
                  <Card
                    key={campaign.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-3 rounded-xl", config.color)}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {campaign.subject}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-muted-foreground">
                                {campaign.recipients_count?.toLocaleString() || 0} recipients
                              </span>
                              {campaign.open_rate && (
                                <span className="text-sm text-muted-foreground">
                                  • {campaign.open_rate}% open rate
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={cn("capitalize", config.color)}>
                            {campaign.status}
                          </Badge>
                          {campaign.sent_at && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(campaign.sent_at), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
