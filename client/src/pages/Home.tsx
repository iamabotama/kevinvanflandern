import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Linkedin, Award, Briefcase, Lightbulb, ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const container = heroRef.current;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const streams: any[] = [];
    let width = 0;
    let height = 0;

    const CONFIG = {
      MAX_STREAMS: 8,
      SPAWN_RATE: 0.012,
      MIN_STREAM_LENGTH_PERCENT: 0.4,
      CURVE_PROBABILITY: 1,
      HORIZONTAL_BIAS: 0.75,
      CURVE_INTENSITY_MIN: 0.15,
      CURVE_INTENSITY_MAX: 0.5,
      PARTICLES_PER_STREAM_MIN: 3,
      PARTICLES_PER_STREAM_MAX: 6,
      PARTICLE_SIZE_MIN: 1.5,
      PARTICLE_SIZE_MAX: 4,
      PARTICLE_GLOW_MIN: 12,
      PARTICLE_GLOW_MAX: 25,
      PARTICLE_SPEED_MIN: 0.0002,
      PARTICLE_SPEED_MAX: 0.0006,
      PARTICLE_SPACING: 0.18,
      LINE_WIDTH_MIN: 0.8,
      LINE_WIDTH_MAX: 2,
      LINE_OPACITY_MIN: 0.15,
      LINE_OPACITY_MAX: 0.4,
      LINE_GLOW_MIN: 4,
      LINE_GLOW_MAX: 12,
      FADE_IN_TIME: 1000,
      LIFETIME_MIN: 5000,
      LIFETIME_MAX: 10000,
      FADE_OUT_TIME: 1500,
      COLORS: {
        PURPLE: '134, 192, 224', // VF steel blue (#86C0E0)
        VIOLET: '69, 96, 255'    // electric blue from the VF cube art (#4560FF)
      }
    };

    function resizeCanvas() {
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function random(min: number, max: number) {
      return min + Math.random() * (max - min);
    }

    function randomInt(min: number, max: number) {
      return Math.floor(random(min, max + 1));
    }

    function createStream() {
      const isCurved = Math.random() < CONFIG.CURVE_PROBABILITY;
      const color = Math.random() > 0.5 ? CONFIG.COLORS.PURPLE : CONFIG.COLORS.VIOLET;
      
      let startX, startY, endX, endY;
      const minLength = width * CONFIG.MIN_STREAM_LENGTH_PERCENT;
      
      let attempts = 0;
      let distance = 0;
      
      do {
        if (Math.random() < CONFIG.HORIZONTAL_BIAS) {
          if (Math.random() > 0.5) {
            startX = random(-50, width * 0.1);
            endX = random(width * 0.9, width + 50);
          } else {
            startX = random(width * 0.9, width + 50);
            endX = random(-50, width * 0.1);
          }
          startY = random(height * 0.1, height * 0.9);
          endY = random(height * 0.1, height * 0.9);
        } else {
          startX = random(-50, width + 50);
          startY = random(-50, height + 50);
          endX = random(-50, width + 50);
          endY = random(-50, height + 50);
        }
        
        const dx = endX - startX;
        const dy = endY - startY;
        distance = Math.sqrt(dx * dx + dy * dy);
        
        attempts++;
        if (attempts > 20) break;
        
      } while (distance < minLength);

      const particleCount = randomInt(
        CONFIG.PARTICLES_PER_STREAM_MIN, 
        CONFIG.PARTICLES_PER_STREAM_MAX
      );

      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          progress: i * CONFIG.PARTICLE_SPACING,
          size: random(CONFIG.PARTICLE_SIZE_MIN, CONFIG.PARTICLE_SIZE_MAX),
          glow: random(CONFIG.PARTICLE_GLOW_MIN, CONFIG.PARTICLE_GLOW_MAX)
        });
      }

      const stream: any = {
        startX,
        startY,
        endX,
        endY,
        isCurved,
        color,
        lineWidth: random(CONFIG.LINE_WIDTH_MIN, CONFIG.LINE_WIDTH_MAX),
        lineOpacity: random(CONFIG.LINE_OPACITY_MIN, CONFIG.LINE_OPACITY_MAX),
        lineGlow: random(CONFIG.LINE_GLOW_MIN, CONFIG.LINE_GLOW_MAX),
        particles,
        particleSpeed: random(CONFIG.PARTICLE_SPEED_MIN, CONFIG.PARTICLE_SPEED_MAX),
        createdAt: Date.now(),
        fadeInTime: CONFIG.FADE_IN_TIME,
        lifetime: random(CONFIG.LIFETIME_MIN, CONFIG.LIFETIME_MAX),
        fadeOutTime: CONFIG.FADE_OUT_TIME,
        state: 'fadingIn',
        alpha: 0
      };

      if (isCurved) {
        const curvature = random(CONFIG.CURVE_INTENSITY_MIN, CONFIG.CURVE_INTENSITY_MAX);
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        const dx = endX - startX;
        const dy = endY - startY;
        const perpX = -dy * curvature;
        const perpY = dx * curvature;
        
        stream.cp1X = midX + perpX * (Math.random() - 0.5) * 2;
        stream.cp1Y = midY + perpY * (Math.random() - 0.5) * 2;
        stream.cp2X = midX - perpX * (Math.random() - 0.5) * 2;
        stream.cp2Y = midY - perpY * (Math.random() - 0.5) * 2;
      }

      return stream;
    }

    function getPointOnPath(stream: any, t: number) {
      if (stream.isCurved) {
        const t1 = 1 - t;
        return {
          x: Math.pow(t1, 3) * stream.startX + 
             3 * Math.pow(t1, 2) * t * stream.cp1X +
             3 * t1 * Math.pow(t, 2) * stream.cp2X +
             Math.pow(t, 3) * stream.endX,
          y: Math.pow(t1, 3) * stream.startY + 
             3 * Math.pow(t1, 2) * t * stream.cp1Y +
             3 * t1 * Math.pow(t, 2) * stream.cp2Y +
             Math.pow(t, 3) * stream.endY
        };
      } else {
        return {
          x: stream.startX + (stream.endX - stream.startX) * t,
          y: stream.startY + (stream.endY - stream.startY) * t
        };
      }
    }

    function updateStream(stream: any) {
      const now = Date.now();
      const age = now - stream.createdAt;

      if (stream.state === 'fadingIn') {
        stream.alpha = Math.min(1, age / stream.fadeInTime);
        if (age >= stream.fadeInTime) {
          stream.state = 'active';
        }
      } else if (stream.state === 'active') {
        stream.alpha = 1;
        if (age >= stream.fadeInTime + stream.lifetime) {
          stream.state = 'fadingOut';
          stream.fadeOutStartTime = now;
        }
      } else if (stream.state === 'fadingOut') {
        const fadeProgress = (now - stream.fadeOutStartTime) / stream.fadeOutTime;
        stream.alpha = Math.max(0, 1 - fadeProgress);
        if (fadeProgress >= 1) {
          stream.state = 'dead';
        }
      }

      for (let i = 0; i < stream.particles.length; i++) {
        stream.particles[i].progress += stream.particleSpeed;
        
        if (stream.particles[i].progress > 1 + CONFIG.PARTICLE_SPACING) {
          stream.particles[i].progress = -CONFIG.PARTICLE_SPACING;
        }
      }
    }

    function drawStream(stream: any) {
      if (!ctx || stream.alpha <= 0) return;

      ctx.globalAlpha = stream.alpha;

      ctx.beginPath();
      ctx.moveTo(stream.startX, stream.startY);
      
      if (stream.isCurved) {
        ctx.bezierCurveTo(
          stream.cp1X, stream.cp1Y,
          stream.cp2X, stream.cp2Y,
          stream.endX, stream.endY
        );
      } else {
        ctx.lineTo(stream.endX, stream.endY);
      }

      ctx.strokeStyle = `rgba(${stream.color}, ${stream.lineOpacity})`;
      ctx.lineWidth = stream.lineWidth;
      ctx.shadowBlur = stream.lineGlow;
      ctx.shadowColor = `rgba(${stream.color}, ${stream.lineOpacity})`;
      ctx.stroke();

      for (let i = 0; i < stream.particles.length; i++) {
        const particle = stream.particles[i];
        if (particle.progress >= 0 && particle.progress <= 1) {
          const pos = getPointOnPath(stream, particle.progress);
          
          ctx.shadowBlur = particle.glow;
          ctx.shadowColor = `rgba(${stream.color}, 1)`;
          
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${stream.color}, 1)`;
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      if (!ctx) return;
      for (let i = streams.length - 1; i >= 0; i--) {
        updateStream(streams[i]);
        
        if (streams[i].state === 'dead') {
          streams.splice(i, 1);
        } else {
          drawStream(streams[i]);
        }
      }

      if (streams.length < CONFIG.MAX_STREAMS && Math.random() < CONFIG.SPAWN_RATE) {
        streams.push(createStream());
      }

      requestAnimationFrame(animate);
    }

    for (let i = 0; i < Math.min(3, CONFIG.MAX_STREAMS); i++) {
      streams.push(createStream());
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ink/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-3 text-slate-100 hover:text-white transition-colors" aria-label="Kevin Van Flandern, top of page">
              <svg viewBox="-40 -40 1080 946" className="h-7 w-auto" fill="currentColor" aria-hidden="true"><path d="M0 0 175 0 405 398.37 405 0 1000 0 945.15 95 500 95 500 866.03ZM585 180 896.08 180 585 718.8 585 370 700.93 370 750 285 585 285Z"/></svg>
              <span className="text-lg font-semibold tracking-tight">Kevin Van Flandern</span>
            </a>
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-8">
                <a href="#about" className="text-slate-300 hover:text-vf-400 transition-colors">About</a>
                <a href="#experience" className="text-slate-300 hover:text-vf-400 transition-colors">Experience</a>
                <a href="#patents" className="text-slate-300 hover:text-vf-400 transition-colors">Patents</a>
                <a href="#contact" className="text-slate-300 hover:text-vf-400 transition-colors">Contact</a>
              </div>
              {/* Shown on every screen size, since the section links are desktop-only */}
              <a href="https://vftech.io" target="_blank" rel="noopener" className="text-vf-300 hover:text-vf-200 transition-colors">
                VFTech <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[url('/images/vf-hero-bg.webp')] bg-cover bg-[center_70%]" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink" aria-hidden="true"></div>
        
        <div className="container relative z-10 mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="border-vf-500/30 text-vf-400 bg-vf-950/30 backdrop-blur-sm px-4 py-1.5 text-sm font-medium rounded-full">
                TECHNOLOGY EXECUTIVE
              </Badge>
              
              <div>
                <h1 className="text-6xl md:text-7xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white via-vf-200 to-white bg-clip-text text-transparent">
                    Kevin
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-vf-300 via-vf-400 to-vf-300 bg-clip-text text-transparent">
                    Van Flandern
                  </span>
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-vf-500 to-vfx-500 rounded-full mb-6"></div>
                <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                  I modernize the systems companies run on, and the teams that build them. 25 years across Microsoft Office and Azure, a startup I co-founded as CTO, and a practice leading technology for VC/PE-backed companies.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="bg-vf-500/10 text-vf-300 border border-vf-500/30 hover:bg-vf-500/20 transition-all px-4 py-2 text-sm rounded-xl">
                  <Award className="w-4 h-4 mr-2" />
                  U.S. Patent Holder
                </Badge>
                <Badge className="bg-vfx-500/10 text-vf-300 border border-vfx-500/30 hover:bg-vfx-500/20 transition-all px-4 py-2 text-sm rounded-xl">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Microsoft Office &amp; Azure
                </Badge>
                <Badge className="bg-vf-500/10 text-vf-300 border border-vf-500/30 hover:bg-vf-500/20 transition-all px-4 py-2 text-sm rounded-xl">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Co-founder &amp; CTO
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-vf-600 to-vfx-600 hover:from-vf-500 hover:to-vfx-500 text-white shadow-lg shadow-vf-500/30 hover:shadow-vf-500/50 transition-all rounded-xl px-8"
                asChild
                >
                  <a href="mailto:KevinVF@hotmail.com">
                    <Mail className="w-5 h-5 mr-2" />
                    Get In Touch
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-vf-500/30 text-vf-300 hover:bg-vf-500/10 hover:border-vf-500/50 rounded-xl px-8"
                  asChild
                >
                  <a href="https://www.linkedin.com/in/kevin-van-flandern-1949aa4/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-5 h-5 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-vf-600 to-vfx-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative">
                  <img 
                    src="/images/kevin-headshot.webp"
                    width={800}
                    height={1000} 
                    alt="Kevin Van Flandern" 
                    className="relative rounded-3xl shadow-2xl shadow-vf-900/50 border border-vf-500/20 w-full max-w-md mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-sheet/70">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-white to-vf-200 bg-clip-text text-transparent">
            About
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <p className="text-lg text-slate-300 leading-relaxed">
                I’ve spent 25 years on both sides of technology: writing the code, and running the organizations that ship it. At Microsoft I started as an engineer on Office, where I co-invented the performance-marker system patented as <span className="text-vf-300 font-semibold">US 6,754,612</span>, and later standardized program management across <span className="text-vf-300 font-semibold">Azure’s 40,000-person organization</span>.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                Today I lead technology for VC/PE-backed companies through <a href="https://vftech.io" target="_blank" rel="noopener" className="text-vf-300 font-semibold underline decoration-vf-500/40 underline-offset-4 hover:decoration-vf-300">VF Associates</a>: modernizing aging platforms, restructuring IT organizations, and putting AI to work where it removes real effort. I stay hands-on, from an AI due-diligence platform for private equity to running a Layer 1 blockchain.
              </p>
            </div>

            <div className="grid gap-6">
              <Card className="bg-sheet/80 border-vf-500/20 hover:border-vf-500/40 transition-all backdrop-blur-sm shadow-lg hover:shadow-vf-500/10 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-vf-300">Scale</h3>
                  <p className="text-slate-300">
                    Standardized program management, work tracking and roadmap planning across Microsoft Azure’s 40,000-person organization.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-sheet/80 border-vfx-500/20 hover:border-vfx-500/40 transition-all backdrop-blur-sm shadow-lg hover:shadow-vfx-500/10 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-vf-300">Turnaround</h3>
                  <p className="text-slate-300">
                    Led Matrix Medical’s IT transformation, restructuring a 1,000-person organization to under 100 in 18 months.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-sheet/80 border-vf-500/20 hover:border-vf-500/40 transition-all backdrop-blur-sm shadow-lg hover:shadow-vf-500/10 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-vf-300">Builder</h3>
                  <p className="text-slate-300">
                    Co-founded Roundit and built the whole product as CTO: iOS, Android, desktop, backend, and Plaid and Stripe payments.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-white to-vf-200 bg-clip-text text-transparent">
            Experience
          </h2>

          <div className="space-y-8">
            {[
              {
                title: "Chief Executive Officer",
                company: "VF Associates, LLC",
                url: "https://vftech.io",
                period: "Present",
                description: "Executive technology leadership and fractional CTO work for VC/PE-backed companies. Led Matrix Medical’s IT transformation, restructuring a 1,000-person organization to under 100 in 18 months.",
                tags: ["Fractional CTO", "Modernization", "VC/PE"]
              },
              {
                title: "Technical Advisor",
                company: "Convergence Technology Solutions (CTS)",
                period: "Present",
                description: "Technical advisor on ARIA, an AI due-diligence platform for mid-market private equity built on GraphRAG (Neo4j, LangGraph, Supabase). Built the automation that turns product requirements into a structured delivery backlog.",
                tags: ["AI/LLM", "GraphRAG", "Private Equity"]
              },
              {
                title: "Owner & Operator",
                company: "Cookie Chain",
                url: "https://cookiechain.io",
                period: "2026 - Present",
                description: "Run Cookie Chain, a community-operated SVM Layer 1 blockchain: validator and RPC infrastructure, cross-chain bridging, an open app registry and developer documentation. Built on a simple principle: developer-owned, not just developer-friendly.",
                tags: ["Infrastructure", "Blockchain", "Developer Platform"]
              },
              {
                title: "Board and Advisory Roles",
                company: "Meta Research · Frogice Inc (Kentucky)",
                period: "Present",
                description: "Board of Directors at Meta Research and advisory board at Frogice Inc: technology strategy, AI adoption, governance, product development and scaling.",
                tags: ["Governance", "Technical Strategy"]
              },
              {
                title: "Principal Program Manager",
                company: "Microsoft (Azure)",
                period: "2018 - 2020",
                description: "Standardized program management across Azure’s 40,000-person organization: one framework for agility at scale, with unified work tracking, reporting and roadmap planning.",
                tags: ["Agile at Scale", "Azure DevOps", "Program Management"]
              },
              {
                title: "Co-Founder & CTO",
                company: "Roundit",
                period: "2016 - 2018",
                description: "Co-founded a fintech startup for charitable micro-donations and built the full product: iOS and Android apps, desktop, backend services, and Plaid and Stripe payments.",
                tags: ["Fintech", "CTO", "Full-Stack"]
              },
              {
                title: "Principal Lead Program Manager",
                company: "Microsoft (IT)",
                period: "2012 - 2016",
                description: "Led 10 program managers through an Agile transformation of a 150-person engineering organization. Ran the cross-company rewards system, and led an emergency deployment to Shanghai to recover a failing financial system.",
                tags: ["Agile Transformation", "Crisis Management", "Leadership"]
              },
              {
                title: "Software Development Engineer",
                company: "Microsoft (Office Shared Features)",
                period: "1996 - 2000",
                description: "Co-invented the performance-testing harness used across the Office suite (US 6,754,612), injecting performance markers into compiled code. Built a self-healing test lab of 100+ machines.",
                tags: ["Performance Engineering", "Patents", "Test Automation"]
              }
            ].map((job, index) => (
              <Card key={index} className="bg-slate-800/30 border-vf-500/20 hover:border-vf-500/40 transition-all backdrop-blur-sm hover:shadow-lg hover:shadow-vf-500/10 rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{job.title}</h3>
                      <p className="text-vf-300 font-medium">
                        {job.url ? (
                          <a href={job.url} target="_blank" rel="noopener" className="hover:text-vf-200 underline decoration-vf-500/40 underline-offset-4 hover:decoration-vf-300 transition-colors">
                            {job.company}
                          </a>
                        ) : job.company}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-vf-500/30 text-vf-300 self-start rounded-full px-4 py-1">
                      {job.period}
                    </Badge>
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed">{job.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} className="bg-vf-500/10 text-vf-300 border-0 rounded-lg px-3 py-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Patents Section */}
      <section id="patents" className="py-24 bg-sheet/70">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-vf-200 bg-clip-text text-transparent">
            Patents & Innovation
          </h2>
          <p className="text-slate-400 mb-12 text-lg">A utility patent from performance engineering on Microsoft Office, plus three hardware design patents.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                number: "US 6,754,612",
                title: "Performance Markers to Measure Benchmark Timing",
                date: "June 22, 2004"
              },
              {
                number: "US D446,522",
                title: "Outer Surface of a Button for a Computer Input Device",
                date: "August 14, 2001"
              },
              {
                number: "US D446,211",
                title: "Computer Input Device",
                date: "August 7, 2001"
              },
              {
                number: "US D446,521",
                title: "Moveable Control Device",
                date: "February 29, 2000"
              }
            ].map((patent, index) => (
              <Card key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-vf-500/20 hover:border-vf-500/50 transition-all backdrop-blur-sm hover:shadow-xl hover:shadow-vf-500/20 rounded-2xl group">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge className="bg-vf-500/20 text-vf-300 border-0 rounded-lg px-3 py-1 text-xs font-mono">
                      {patent.number}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-vf-300 transition-colors leading-snug">
                    {patent.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{patent.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-vf-200 bg-clip-text text-transparent">
            Let's Connect
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Open to CTO roles, full-time or fractional through VF Associates, with companies modernizing their platforms or putting AI to work.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-vf-600 to-vfx-600 hover:from-vf-500 hover:to-vfx-500 text-white shadow-lg shadow-vf-500/30 hover:shadow-vf-500/50 transition-all rounded-xl px-8"
              asChild
            >
              <a href="mailto:KevinVF@hotmail.com">
                <Mail className="w-5 h-5 mr-2" />
                KevinVF@hotmail.com
              </a>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-vf-500/30 text-vf-300 hover:bg-vf-500/10 hover:border-vf-500/50 rounded-xl px-8"
              asChild
            >
              <a href="https://www.linkedin.com/in/kevin-van-flandern-1949aa4/" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-5 h-5 mr-2" />
                Connect on LinkedIn
              </a>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-vf-500/30 text-vf-300 hover:bg-vf-500/10 hover:border-vf-500/50 rounded-xl px-8"
              asChild
            >
              <a href="https://vftech.io" target="_blank" rel="noopener">
                <ExternalLink className="w-5 h-5 mr-2" />
                VFTech, my firm
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="container mx-auto px-6 text-center text-slate-400 text-sm">
          <p>© 2026 Kevin Van Flandern. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
