import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
    ArrowRight, 
    LayoutTemplate, 
    Zap, 
    BarChart3, 
    CheckCircle2, 
    Shield, 
    Sparkles, 
    MousePointer2, 
    Layers, 
    Globe, 
    MessageSquare
} from "lucide-react";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={className}
    >
        {children}
    </motion.div>
);

export default function LandingPage() {
    useEffect(() => {
        // Remove dark mode class that might have been forced by previous versions
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-indigo-600 p-[1px] shadow-sm group-hover:scale-105 transition-transform">
                            <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center overflow-hidden">
                                <img src="/icon.png" alt="Boltfy" className="w-5 h-5 object-contain" />
                            </div>
                        </div>
                        <span className="font-bold text-lg tracking-tight">Boltfy</span>
                    </Link>
                    <div className="hidden md:flex items-center justify-center text-sm font-medium text-muted-foreground gap-8 flex-1 pl-12">
                         <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                         <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
                         <Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link>
                         <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                            Log in
                        </Link>
                        <Link to="/signup">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 gap-2 h-9 rounded-full px-5">
                                Get Started <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-20">
                {/* HERO SECTION */}
                <section className="px-6 relative mb-32">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary font-medium mb-8"
                        >
                            <Sparkles className="w-4 h-4" /> The New Standard for Form Building
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance text-foreground leading-[1.1]"
                        >
                            Create Beautiful Forms in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Minutes.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed text-balance"
                        >
                            Boltfy is the simple, powerful way to build forms, surveys, and contact lists. No coding required. Just drag, drop, and collect.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
                        >
                            <Link to="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 transition-transform hover:scale-105">
                                    Start Building for Free
                                </Button>
                            </Link>
                            <p className="text-sm text-muted-foreground sm:hidden mt-2">No credit card required.</p>
                        </motion.div>
                        <motion.p
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: 0.8 }}
                             className="text-sm text-muted-foreground hidden sm:block mt-6"
                        >
                             No credit card required • Free forever plan available • Cancel anytime
                        </motion.p>
                    </div>
                </section>

                {/* APP PREVIEW / MOCKUP */}
                <FadeIn delay={0.4} className="px-6 mb-32 max-w-6xl mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent blur-3xl -z-10 rounded-[3rem]" />
                    <div className="rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden shadow-primary/5 flex flex-col relative z-10">
                        {/* Fake browser header */}
                        <div className="h-12 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="mx-auto bg-background border border-border rounded-md w-1/2 h-7 text-[10px] flex items-center justify-center text-muted-foreground font-mono">
                                boltfy.io/builder
                            </div>
                        </div>
                        {/* Mockup content */}
                        <div className="w-full bg-background overflow-hidden relative">
                            <img 
                                src="/boltfy_dashboard_preview.png" 
                                alt="Boltfy Form Builder Dashboard Workspace" 
                                className="w-full h-auto object-cover object-top border-t border-border/20 shadow-inner"
                            />
                        </div>
                    </div>
                </FadeIn>

                {/* TRUST STRIP */}
                <FadeIn>
                    <section className="py-12 border-y border-border/50 bg-muted/20 mb-32">
                        <div className="max-w-6xl mx-auto px-6 text-center">
                            <p className="text-sm text-muted-foreground mb-8 font-medium">Trusted by thousands of creators and businesses</p>
                            <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                {/* Real brand references */}
                                <div className="flex items-center gap-2 font-semibold text-lg text-foreground/80"><Globe className="w-5 h-5 text-primary" /> Stripe</div>
                                <div className="flex items-center gap-2 font-semibold text-lg text-foreground/80"><Layers className="w-5 h-5 text-indigo-500" /> HubSpot</div>
                                <div className="flex items-center gap-2 font-semibold text-lg text-foreground/80"><Zap className="w-5 h-5 text-amber-500" /> Notion</div>
                                <div className="flex items-center gap-2 font-semibold text-lg text-foreground/80"><Shield className="w-5 h-5 text-emerald-500" /> Webflow</div>
                            </div>
                        </div>
                    </section>
                </FadeIn>

                {/* FEATURES */}
                <section id="features" className="py-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        <FadeIn className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to collect data</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Powerful tools wrapped in a beautiful, easy-to-use interface.
                            </p>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FadeIn delay={0.1}>
                                <div className="p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow h-full">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                                        <MousePointer2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">Drag & Drop Builder</h3>
                                    <p className="text-muted-foreground">Build complex forms visually. Need a text input? Just drag it in. It's incredibly intuitive.</p>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.2}>
                                <div className="p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow h-full">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-500">
                                        <LayoutTemplate className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">Pre-built Templates</h3>
                                    <p className="text-muted-foreground">Don't start from scratch. Choose from our library of beautiful, high-converting templates.</p>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.3}>
                                <div className="p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow h-full">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
                                    <p className="text-muted-foreground">Track responses instantly. See drop-offs, completion rates, and analyze data dynamically.</p>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.4}>
                                <div className="p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow h-full">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">Instant Integrations</h3>
                                    <p className="text-muted-foreground">Connect seamlessly with Supabase, Resend, and custom webhooks to automate your database flows.</p>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.5}>
                                <div className="p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow h-full">
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 text-violet-500">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">Logic & Branching</h3>
                                    <p className="text-muted-foreground">Build smart surveys and signups with conditional branching, skips, and custom redirect flows.</p>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.6}>
                                <div className="p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow h-full">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6 text-red-500">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">Secure Submissions</h3>
                                    <p className="text-muted-foreground">All form submissions are secured with server-side sanitation, CSRF checks, and rate limit protections.</p>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="py-24 px-6 bg-muted/30 border-y border-border/50 mt-16">
                    <div className="max-w-5xl mx-auto">
                        <FadeIn className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How it works</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                From idea to published form in three simple steps.
                            </p>
                        </FadeIn>

                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {/* Connecting Line */}
                            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 z-0" />

                            {[
                                { step: "01", title: "Choose a Template", desc: "Select a template or start from a blank canvas. We have designs for surveys, contact forms, and more." },
                                { step: "02", title: "Customize Design", desc: "Make it yours. Add your logo, tweak colors, and add questions with our drag-and-drop editor." },
                                { step: "03", title: "Share & Collect", desc: "Share via link, embed on your site, or send via email. Watch the responses roll in instantly." }
                            ].map((item, i) => (
                                <FadeIn key={i} delay={0.2 * i} className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-background border-4 border-muted/50 shadow-lg flex items-center justify-center mb-6 text-2xl font-bold text-primary relative">
                                        {item.step}
                                        {/* Inner glow */}
                                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.desc}</p>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section id="pricing" className="py-24 px-6 bg-background">
                    <div className="max-w-6xl mx-auto">
                        <FadeIn className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Start for free and scale as your response volume grows. No setup fees or hidden surprises.
                            </p>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Free Tier */}
                            <FadeIn delay={0.1}>
                                <div className="p-8 rounded-3xl border border-border bg-card hover:border-primary/30 transition-all flex flex-col justify-between h-full shadow-sm relative">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground mb-2">Free Plan</h3>
                                        <p className="text-muted-foreground text-sm mb-6">Perfect for creators getting started with forms.</p>
                                        <div className="flex items-baseline mb-6">
                                            <span className="text-5xl font-extrabold text-foreground">$0</span>
                                            <span className="text-muted-foreground ml-2">/ month</span>
                                        </div>
                                        <ul className="space-y-4 border-t border-border/50 pt-6">
                                            {[
                                                "Unlimited active forms",
                                                "Up to 100 submissions/month",
                                                "Basic drag & drop editor",
                                                "Standard templates library",
                                                "CSV response exports"
                                            ].map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <Link to="/signup" className="w-full">
                                            <Button variant="outline" className="w-full h-12 rounded-full font-semibold">
                                                Start for Free
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* Pro Tier */}
                            <FadeIn delay={0.2}>
                                <div className="p-8 rounded-3xl border-2 border-primary bg-card transition-all flex flex-col justify-between h-full shadow-lg relative">
                                    <div className="absolute -top-4 right-8 bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                                        POPULAR
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground mb-2">Pro Plan</h3>
                                        <p className="text-muted-foreground text-sm mb-6">For professional creators, teams, and high-growth sites.</p>
                                        <div className="flex items-baseline mb-6">
                                            <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">$19</span>
                                            <span className="text-muted-foreground ml-2">/ month</span>
                                        </div>
                                        <ul className="space-y-4 border-t border-border/50 pt-6">
                                            {[
                                                "Everything in Free Plan",
                                                "Unlimited submissions",
                                                "Custom domain support",
                                                "Advanced logic & branching",
                                                "Webhook & API integrations",
                                                "Priority email & chat support"
                                            ].map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <Link to="/signup" className="w-full">
                                            <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold shadow-md shadow-primary/20">
                                                Go Pro Now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>

                {/* FINAL CTA */}
                <section className="py-32 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <FadeIn>
                            <div className="p-12 md:p-16 rounded-[2.5rem] bg-card border border-border shadow-2xl relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10">
                                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                        Ready to create your first form?
                                    </h2>
                                    <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                                        Join thousands of users building forms the easy way. Start free, upgrade when you need to.
                                    </p>
                                    <Link to="/signup">
                                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/25 transition-transform hover:scale-105">
                                            Get Started for Free
                                        </Button>
                                    </Link>
                                    <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        No credit card required to start
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-border/50 bg-card pt-16 pb-8 px-6 text-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2 lg:col-span-2">
                            <Link to="/" className="flex items-center gap-2 mb-4">
                                <img src="/icon.png" alt="Boltfy" className="w-6 h-6 object-contain" />
                                <span className="font-bold text-lg tracking-tight">Boltfy</span>
                            </Link>
                            <p className="text-muted-foreground mb-6 max-w-sm">
                                The modern form building platform for creators, businesses, and everyone in between.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
                            <ul className="space-y-3">
                                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                                <li><Link to="/templates" className="text-muted-foreground hover:text-foreground transition-colors">Templates</Link></li>
                                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
                            <ul className="space-y-3">
                                <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
                            <ul className="space-y-3">
                                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-center md:text-left">
                        <p>© {new Date().getFullYear()} Boltfy. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <span>Made with ❤️ for form builders everywhere.</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
