import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Github, Linkedin, Youtube, Facebook, Mail, MapPin, ChevronRight, Code, Cpu, Zap, MessageCircle, ExternalLink, ArrowUpRight } from 'lucide-react';

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const canvasRef = useRef(null);

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'services', 'portfolio', 'testimonials', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  // Animated grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let cx, cy;
    const focalLength = 300;
    const cameraZ = -100;
    let cameraX = 0;
    let cameraY = -70;
    let targetCameraX = 0;
    let targetCameraY = -70;

    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      targetCameraX = mouseX * 600;
      targetCameraY = -70 + mouseY * 40;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      cx = width / 2;
      cy = height * 0.35;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const project = (x, y, z) => {
      const dz = z - cameraZ;
      if (dz <= 0) return null;
      const scale = focalLength / dz;
      return {
        x: cx + (x - cameraX) * scale,
        y: cy + (y - cameraY) * scale
      };
    };

    const gridZMin = 0;
    const gridZMax = 3000;
    const gridXMin = -4000;
    const gridXMax = 4000;
    const spacing = 90;
    let zOffset = 0;
    const speed = 2;

    const streams = [
      { x: -600, z: 500, length: 500, speed: 7, color: '#9ED8FF' },
      { x: -200, z: 1200, length: 350, speed: 10, color: '#B8C0CC' },
      { x: 300, z: 200, length: 600, speed: 12, color: '#9ED8FF' },
      { x: 700, z: 800, length: 450, speed: 8, color: '#7D8794' }
    ];

    const animate = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      cameraX += (targetCameraX - cameraX) * 0.03;
      cameraY += (targetCameraY - cameraY) * 0.03;

      zOffset = (zOffset + speed) % spacing;
      ctx.lineWidth = 1;

      for (let x = gridXMin; x <= gridXMax; x += spacing) {
        const p1 = project(x, 0, gridZMin);
        const p2 = project(x, 0, gridZMax);
        if (p1 && p2) {
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, 'rgba(158, 216, 255, 0.15)');
          grad.addColorStop(1, 'rgba(158, 216, 255, 0)');
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      for (let z = gridZMin; z <= gridZMax; z += spacing) {
        const actualZ = z - zOffset;
        if (actualZ < gridZMin) continue;

        const p1 = project(gridXMin, 0, actualZ);
        const p2 = project(gridXMax, 0, actualZ);

        if (p1 && p2) {
          const alpha = Math.max(0, 1 - (actualZ / gridZMax));
          ctx.strokeStyle = `rgba(158, 216, 255, ${0.15 * alpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      streams.forEach(s => {
        s.z -= s.speed;
        if (s.z < gridZMin - s.length) {
          s.z = gridZMax;
        }

        const startZ = Math.max(gridZMin, s.z);
        const endZ = Math.min(gridZMax, s.z + s.length);

        if (startZ < endZ) {
          const p1 = project(s.x, 0, startZ);
          const p2 = project(s.x, 0, endZ);

          if (p1 && p2) {
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, s.color);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 12;
            ctx.shadowColor = s.color;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' }
  ];

  const services = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'AI Automation',
      description: 'Building intelligent automation systems using n8n, Make, and custom AI agents for streamlined workflows.'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'SaaS Development',
      description: 'Full-stack development of scalable SaaS products with modern tech stack and best practices.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Agentic AI Systems',
      description: 'Developing autonomous AI agents using Claude, GPT-4, and custom frameworks for complex tasks.'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'GHL Integration',
      description: 'GoHighLevel automation, workflows, and custom integrations for marketing agencies.'
    }
  ];

  const projects = [
    {
      category: 'SaaS Platform',
      title: 'Superior Restaurant Management',
      description: 'Complete restaurant management system with booking, menu management, and customer reviews. Built with modern React and full backend integration.',
      tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      link: 'https://superior.lovable.app/',
      image: '🍽️'
    },
    {
      category: 'E-Commerce',
      title: 'Superior Book Store',
      description: 'Full-featured online bookstore with shopping cart, payment integration, and inventory management system.',
      tech: ['React', 'Supabase', 'Stripe', 'Tailwind CSS'],
      link: 'https://superior-book-store.lovable.app',
      image: '📚'
    },
    {
      category: 'AI Automation',
      title: 'Multi-Agent Workflow System',
      description: 'Built an autonomous agent system using n8n and Claude API for document processing and automated analysis.',
      tech: ['n8n', 'Claude API', 'Python', 'Webhooks'],
      image: '🤖'
    },
    {
      category: 'Integration',
      title: 'GHL Marketing Suite',
      description: 'Custom GoHighLevel integration suite for automated client onboarding, email campaigns, and CRM automation.',
      tech: ['GHL API', 'JavaScript', 'Webhooks', 'Automation'],
      image: '📊'
    },
    {
      category: 'AI Agent',
      title: 'Task Automation Platform',
      description: 'Intelligent automation platform using AI agents to streamline business operations and reduce manual tasks by 80%.',
      tech: ['Python', 'OpenAI', 'FastAPI', 'Redis'],
      image: '⚡'
    },
    {
      category: 'Integration',
      title: 'Custom CRM Pipeline',
      description: 'Built custom CRM pipeline automation connecting multiple platforms for seamless data synchronization.',
      tech: ['Zapier', 'n8n', 'APIs', 'Database'],
      image: '🔄'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      text: 'Zain transformed our workflow with intelligent automation. Our team productivity increased by 300%. His expertise in AI and automation is unmatched.'
    },
    {
      name: 'Michael Chen',
      role: 'Startup Founder',
      company: 'InnovateLabs',
      text: 'The AI agents Zain built have completely automated our customer support. Response time reduced from hours to seconds. Incredible work!'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Agency Owner',
      company: 'Digital Dynamics',
      text: 'Best GHL developer I have worked with. Delivered the Superior Restaurant platform ahead of schedule. Highly professional and skilled!'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Michroma&family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #9ED8FF 0%, #74C7FF 50%, #C8EAFF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-glow:hover {
          box-shadow: 0 0 20px rgba(158, 216, 255, 0.3);
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 px-4 sm:px-6 md:px-8 pt-4 transition-all duration-300 ${scrolled ? 'bg-[#050505]/95 backdrop-blur-lg' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between border border-[#171A1F]/80 bg-[#050505]/85 backdrop-blur-md px-4 sm:px-5 md:px-6 py-3">
            <button onClick={() => scrollToSection('home')} className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#9ED8FF] to-[#CFAE6E] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <span className="text-[#050505] font-bold text-lg" style={{ fontFamily: 'Michroma, sans-serif' }}>Z</span>
              </div>
              <span className="font-bold text-sm tracking-wider hidden sm:block" style={{ fontFamily: 'Michroma, sans-serif' }}>
                ZAIN
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center border border-[#171A1F]/80 bg-[#0C0D10]/90">
              {navItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-[10px] tracking-[0.18em] uppercase px-6 py-3 transition-all duration-300 ${
                    i < navItems.length - 1 ? 'border-r border-[#171A1F]/80' : ''
                  } ${activeSection === item.id ? 'text-[#CFAE6E]' : 'text-[#B8C0CC] hover:text-[#CFAE6E]'}`}
                  style={{ fontFamily: 'Michroma, sans-serif' }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Book Demo CTA */}
            <a
              href="https://wa.me/923187161551"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-3 border border-[#232833] bg-[#111318]/90 px-5 py-3 text-[10px] tracking-[0.18em] uppercase text-[#F5F7FA] transition-all duration-300 hover:border-[#CFAE6E]/60 hover:text-[#CFAE6E] btn-glow"
              style={{ fontFamily: 'Michroma, sans-serif' }}
            >
              <span className="w-1.5 h-1.5 bg-[#9ED8FF] animate-pulse"></span>
              <span>Book a Demo</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-[#F5F7FA] transition-transform duration-300 hover:scale-110"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-2 border border-[#171A1F]/80 bg-[#050505]/95 backdrop-blur-md animate-fadeInUp">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-[10px] tracking-[0.18em] uppercase text-[#B8C0CC] px-5 py-4 border-b border-[#171A1F]/80 hover:text-[#CFAE6E] transition-colors"
                  style={{ fontFamily: 'Michroma, sans-serif' }}
                >
                  {item.label}
                </button>
              ))}
              <div className="p-4">
                <a
                  href="https://wa.me/923187161551"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-3 border border-[#232833] bg-[#111318]/90 px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#F5F7FA]"
                  style={{ fontFamily: 'Michroma, sans-serif' }}
                >
                  <span className="w-1.5 h-1.5 bg-[#9ED8FF]"></span>
                  <span>Book a Demo</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center pt-24 pb-12 relative overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute bottom-0 left-0 w-full h-[65vh] flex justify-center items-end overflow-hidden pointer-events-none">
          <canvas ref={canvasRef} className="absolute bottom-0 left-0 w-full h-full" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#171A1F] to-transparent"></div>
          <div className="absolute left-1/2 bottom-[18%] -translate-x-1/2 h-[120px] w-[520px] bg-[#9ED8FF]/8 blur-[80px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-12 items-center">
          {/* Left Content */}
          <div className="xl:col-span-7 flex flex-col justify-center opacity-0 animate-fadeInUp">
            <div className="flex items-center gap-4 mb-7 md:mb-9">
              <span className="w-7 md:w-10 h-px bg-[#9ED8FF]"></span>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.16em] md:tracking-[0.18em] text-[#B8C0CC]" style={{ fontFamily: 'Michroma, sans-serif' }}>
                AI Automation Engineer & SaaS Developer
              </span>
            </div>

            <h1 className="uppercase leading-[0.9] tracking-[-0.065em] mb-7 md:mb-8" style={{ fontFamily: 'Michroma, sans-serif' }}>
              <span className="block text-[#DCE3EE] text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] opacity-0 animate-fadeInUp delay-100">
                Hi, I'm
              </span>
              <span className="block text-[3rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7rem] xl:text-[8rem] gradient-text opacity-0 animate-fadeInUp delay-200">
                Zain
              </span>
            </h1>

            <p className="text-[#AEB8C6] text-[0.95rem] sm:text-[1rem] md:text-base max-w-[42rem] font-light leading-relaxed mb-8 opacity-0 animate-fadeInUp delay-300">
              Building intelligent automation systems and agentic AI solutions. Specializing in n8n workflows, SaaS development, and GoHighLevel integrations that transform how businesses operate.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8 opacity-0 animate-fadeInUp delay-400">
              <div className="border-l-2 border-[#CFAE6E] pl-4">
                <div className="text-[#CFAE6E] text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Michroma, sans-serif' }}>5+</div>
                <div className="text-[#7D8794] text-xs uppercase tracking-wider">Years Exp</div>
              </div>
              <div className="border-l-2 border-[#9ED8FF] pl-4">
                <div className="text-[#9ED8FF] text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Michroma, sans-serif' }}>20+</div>
                <div className="text-[#7D8794] text-xs uppercase tracking-wider">Projects</div>
              </div>
              <div className="border-l-2 border-[#CFAE6E] pl-4">
                <div className="text-[#CFAE6E] text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Michroma, sans-serif' }}>500+</div>
                <div className="text-[#7D8794] text-xs uppercase tracking-wider">Connections</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fadeInUp delay-500">
              <button
                onClick={() => scrollToSection('portfolio')}
                className="inline-flex items-center justify-center gap-4 border border-[#232833] bg-[#0C0D10]/90 px-5 md:px-7 py-3.5 md:py-4 text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#F5F7FA] transition-all duration-300 hover:border-[#CFAE6E]/60 hover:text-[#CFAE6E] btn-glow hover-lift"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                <span className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-[#9ED8FF]"></span>
                  <span>View Work</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href="https://www.linkedin.com/in/aizain/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 border border-[#171A1F] bg-transparent px-5 md:px-7 py-3.5 md:py-4 text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#B8C0CC] transition-all duration-300 hover:border-[#9ED8FF]/40 hover:text-[#9ED8FF] hover-lift"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                <span>View LinkedIn</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right - Professional Photo */}
          <div className="xl:col-span-5 flex justify-center xl:justify-end opacity-0 animate-fadeIn delay-600">
            <div className="relative group">
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#9ED8FF]/20 to-[#CFAE6E]/20 blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="absolute inset-0 border border-[#171A1F]/50 -translate-x-4 -translate-y-4 group-hover:-translate-x-6 group-hover:-translate-y-6 transition-all duration-500"></div>
              <div className="absolute inset-0 border border-[#9ED8FF]/30 translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-all duration-500"></div>
              
              {/* Professional Photo */}
              <div className="relative w-[280px] h-[360px] sm:w-[320px] sm:h-[420px] md:w-[360px] md:h-[480px] overflow-hidden border border-[#171A1F] bg-gradient-to-br from-[#0C0D10] to-[#050505]">
                <img 
                  src="https://media.licdn.com/dms/image/v2/D4D03AQGAd7jwUMCzVw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1729680673422?e=1749600000&v=beta&t=U3txrkUPsRX7b7WvPHf0qLUMcPPmWkHLTwNwu70TBr4"
                  alt="Zain Irshad - AI Automation Engineer"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60"></div>
                
                {/* Status Badge */}
                <div className="absolute bottom-6 left-6 right-6 border border-[#171A1F]/80 bg-[#090B0E]/90 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#D7DEE8]" style={{ fontFamily: 'Michroma, sans-serif' }}>
                      Available for Projects
                    </span>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-[#7D8794]">
                    Multan, Pakistan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-28 md:py-32 border-t border-[#171A1F]">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-14">
            <div className="xl:col-span-3">
              <div className="flex items-center gap-4 xl:pt-2">
                <span className="w-8 h-px bg-[#CFAE6E]"></span>
                <span className="text-[10px] md:text-[11px] uppercase text-[#D6C29A] tracking-[0.18em]" style={{ fontFamily: 'Michroma, sans-serif' }}>
                  01 / About Me
                </span>
              </div>
            </div>

            <div className="xl:col-span-9">
              <h2 className="leading-[1.08] tracking-[-0.04em] text-[1.25rem] sm:text-[1.5rem] md:text-[1.8rem] lg:text-[2.2rem] text-[#F5F7FA] mb-8" style={{ fontFamily: 'Michroma, sans-serif' }}>
                Freelance AI Engineer specializing in{' '}
                <span className="text-[#9ED8FF]">building autonomous systems</span> that automate complex workflows and enhance business intelligence.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 max-w-5xl mb-10">
                <p className="text-[#9AA6B5] text-[1rem] md:text-[1.05rem] leading-[1.9] font-light">
                  Currently studying at Virtual University of Pakistan, I combine academic learning with real-world experience in AI automation. My expertise spans n8n workflow automation, SaaS development, and building intelligent agents using Claude and GPT-4.
                </p>
                <p className="text-[#9AA6B5] text-[1rem] md:text-[1.05rem] leading-[1.9] font-light">
                  With 500+ connections on LinkedIn and a growing portfolio of successful projects like Superior Restaurant Platform and Book Store, I help businesses transform their operations through intelligent automation and custom AI solutions.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {['Python', 'n8n', 'Claude API', 'GHL', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AI Agents', 'Automation'].map(skill => (
                  <span
                    key={skill}
                    className="border border-[#171A1F] bg-[#0C0D10]/50 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-[#9ED8FF] hover:bg-[#9ED8FF]/10 transition-all duration-300 hover-lift"
                    style={{ fontFamily: 'Michroma, sans-serif' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative z-10 py-28 md:py-32 bg-[#0C0D10] border-t border-[#171A1F]">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-px bg-[#CFAE6E]"></span>
            <span className="text-[10px] md:text-[11px] uppercase text-[#D6C29A] tracking-[0.18em]" style={{ fontFamily: 'Michroma, sans-serif' }}>
              02 / Services
            </span>
          </div>

          <h2 className="uppercase leading-[0.98] tracking-[-0.045em] text-[#F5F7FA] text-[2rem] sm:text-[2.5rem] md:text-[3.2rem] mb-12" style={{ fontFamily: 'Michroma, sans-serif' }}>
            What I <span className="text-[#9ED8FF]">Build</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <div
                key={i}
                className="group relative overflow-hidden bg-[#050505] border border-[#171A1F] p-6 transition-all duration-500 hover:border-[#9ED8FF]/30 hover-lift"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9ED8FF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="text-[#9ED8FF] mb-4 transition-transform duration-300 group-hover:scale-110">{service.icon}</div>
                <h3 className="text-lg uppercase tracking-tight text-[#F5F7FA] mb-3" style={{ fontFamily: 'Michroma, sans-serif' }}>
                  {service.title}
                </h3>
                <p className="text-sm text-[#7D8794] font-light leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="relative z-10 py-28 md:py-32 border-t border-[#171A1F]">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-px bg-[#CFAE6E]"></span>
            <span className="text-[10px] md:text-[11px] uppercase text-[#D6C29A] tracking-[0.18em]" style={{ fontFamily: 'Michroma, sans-serif' }}>
              03 / Portfolio
            </span>
          </div>

          <h2 className="uppercase leading-[0.98] tracking-[-0.045em] text-[#F5F7FA] text-[2rem] sm:text-[2.5rem] md:text-[3.2rem] mb-12" style={{ fontFamily: 'Michroma, sans-serif' }}>
            Selected <span className="text-[#9ED8FF]">Projects</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <div
                key={i}
                className="group relative overflow-hidden bg-[#050505] border border-[#171A1F] transition-all duration-500 hover:border-[#9ED8FF]/30 hover-lift"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="border border-[#9ED8FF]/30 bg-[#9ED8FF]/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-[#9ED8FF]" style={{ fontFamily: 'Michroma, sans-serif' }}>
                      {project.category}
                    </span>
                    <div className="text-4xl">{project.image}</div>
                  </div>
                  <h3 className="text-lg uppercase tracking-tight text-[#F5F7FA] mb-3" style={{ fontFamily: 'Michroma, sans-serif' }}>
                    {project.title}
                  </h3>
                  <p className="text-sm text-[#7D8794] font-light leading-relaxed mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map(tech => (
                      <span
                        key={tech}
                        className="text-[9px] uppercase tracking-wider text-[#9ED8FF] bg-[#9ED8FF]/5 px-2 py-1"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#CFAE6E] hover:text-[#9ED8FF] transition-colors group/link"
                    >
                      <span>View Live Project</span>
                      <ArrowUpRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-28 md:py-32 bg-[#0C0D10] border-t border-[#171A1F]">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-px bg-[#CFAE6E]"></span>
            <span className="text-[10px] md:text-[11px] uppercase text-[#D6C29A] tracking-[0.18em]" style={{ fontFamily: 'Michroma, sans-serif' }}>
              04 / Testimonials
            </span>
          </div>

          <h2 className="uppercase leading-[0.98] tracking-[-0.045em] text-[#F5F7FA] text-[2rem] sm:text-[2.5rem] md:text-[3.2rem] mb-12" style={{ fontFamily: 'Michroma, sans-serif' }}>
            Client <span className="text-[#9ED8FF]">Feedback</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="border border-[#171A1F]/80 bg-[#050505]/45 backdrop-blur-[2px] p-6 hover-lift transition-all duration-300 hover:border-[#9ED8FF]/20"
              >
                <div className="text-[#9ED8FF] text-4xl mb-4">"</div>
                <p className="text-[#B8C0CC] text-sm leading-relaxed mb-6">
                  {testimonial.text}
                </p>
                <div className="border-t border-[#171A1F]/70 pt-4">
                  <p className="text-[#F5F7FA] font-medium mb-1">{testimonial.name}</p>
                  <p className="text-[#7D8794] text-xs mb-1">{testimonial.role}</p>
                  <p className="text-[#9ED8FF] text-xs uppercase tracking-wider" style={{ fontFamily: 'Michroma, sans-serif' }}>
                    {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-28 md:py-32 border-t border-[#171A1F]">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="w-8 h-px bg-[#CFAE6E]"></span>
              <span className="text-[10px] md:text-[11px] uppercase text-[#D6C29A] tracking-[0.18em]" style={{ fontFamily: 'Michroma, sans-serif' }}>
                05 / Contact
              </span>
              <span className="w-8 h-px bg-[#CFAE6E]"></span>
            </div>

            <h2 className="uppercase leading-[0.96] tracking-[-0.045em] text-[#F5F7FA] text-[1.9rem] sm:text-[2.5rem] md:text-[3.2rem] mb-10" style={{ fontFamily: 'Michroma, sans-serif' }}>
              Let's Build <span className="text-[#9ED8FF]">Something</span> Amazing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <a
                href="mailto:zainirshad307@gmail.com"
                className="border border-[#171A1F]/80 bg-[#0C0D10]/50 p-6 hover:border-[#9ED8FF]/30 transition-all duration-300 hover-lift group"
              >
                <Mail className="w-6 h-6 text-[#9ED8FF] mx-auto mb-3 transition-transform group-hover:scale-110" />
                <p className="text-[10px] uppercase tracking-wider text-[#7D8794] mb-2" style={{ fontFamily: 'Michroma, sans-serif' }}>Email</p>
                <p className="text-[#F5F7FA] text-sm">zainirshad307@gmail.com</p>
              </a>

              <a
                href="https://www.linkedin.com/in/aizain/"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#171A1F]/80 bg-[#0C0D10]/50 p-6 hover:border-[#9ED8FF]/30 transition-all duration-300 hover-lift group"
              >
                <Linkedin className="w-6 h-6 text-[#9ED8FF] mx-auto mb-3 transition-transform group-hover:scale-110" />
                <p className="text-[10px] uppercase tracking-wider text-[#7D8794] mb-2" style={{ fontFamily: 'Michroma, sans-serif' }}>LinkedIn</p>
                <p className="text-[#F5F7FA] text-sm">500+ Connections</p>
              </a>

              <a
                href="https://github.com/M-Zain-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#171A1F]/80 bg-[#0C0D10]/50 p-6 hover:border-[#9ED8FF]/30 transition-all duration-300 hover-lift group"
              >
                <Github className="w-6 h-6 text-[#9ED8FF] mx-auto mb-3 transition-transform group-hover:scale-110" />
                <p className="text-[10px] uppercase tracking-wider text-[#7D8794] mb-2" style={{ fontFamily: 'Michroma, sans-serif' }}>GitHub</p>
                <p className="text-[#F5F7FA] text-sm">github.com/M-Zain-ai</p>
              </a>

              <a
                href="https://wa.me/923187161551"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#171A1F]/80 bg-[#0C0D10]/50 p-6 hover:border-[#9ED8FF]/30 transition-all duration-300 hover-lift group"
              >
                <MapPin className="w-6 h-6 text-[#9ED8FF] mx-auto mb-3 transition-transform group-hover:scale-110" />
                <p className="text-[10px] uppercase tracking-wider text-[#7D8794] mb-2" style={{ fontFamily: 'Michroma, sans-serif' }}>Location</p>
                <p className="text-[#F5F7FA] text-sm">Multan, Pakistan</p>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <a
                href="https://wa.me/923187161551"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 border border-[#232833] bg-[#0C0D10]/90 px-6 md:px-7 py-4 text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#F5F7FA] transition-all duration-300 hover:border-[#CFAE6E]/60 hover:text-[#CFAE6E] btn-glow hover-lift"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                <span className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-[#9ED8FF] animate-pulse"></span>
                  <span>Schedule Call</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <a
                href="https://www.linkedin.com/in/aizain/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border border-[#171A1F] bg-transparent px-6 md:px-7 py-4 text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[#B8C0CC] transition-all duration-300 hover:border-[#9ED8FF]/40 hover:text-[#9ED8FF] hover-lift"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                <span>View LinkedIn</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center justify-center gap-6">
              <a href="https://github.com/M-Zain-ai" target="_blank" rel="noopener noreferrer" className="text-[#7D8794] hover:text-[#9ED8FF] transition-all duration-300 hover:scale-110">
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/aizain/" target="_blank" rel="noopener noreferrer" className="text-[#7D8794] hover:text-[#9ED8FF] transition-all duration-300 hover:scale-110">
                <Linkedin size={20} />
              </a>
              <a href="https://www.youtube.com/@zainirshad9412" target="_blank" rel="noopener noreferrer" className="text-[#7D8794] hover:text-[#9ED8FF] transition-all duration-300 hover:scale-110">
                <Youtube size={20} />
              </a>
              <a href="https://www.facebook.com/muhammad.zain.955512" target="_blank" rel="noopener noreferrer" className="text-[#7D8794] hover:text-[#9ED8FF] transition-all duration-300 hover:scale-110">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#171A1F] bg-[#050505] py-8">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#4A505C]" style={{ fontFamily: 'Michroma, sans-serif' }}>
              © 2026 Zain. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[10px] uppercase tracking-[0.16em] text-[#4A505C] hover:text-[#9ED8FF] transition-colors">Privacy</a>
              <a href="#" className="text-[10px] uppercase tracking-[0.16em] text-[#4A505C] hover:text-[#9ED8FF] transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;