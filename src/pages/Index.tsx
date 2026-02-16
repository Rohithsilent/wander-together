import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MessageCircle, Receipt, MapPin, UserPlus, Plane, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-travel.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: Users,
    title: "Find Travel Groups",
    description: "Discover like-minded travelers heading to your dream destination and join their adventure.",
  },
  {
    icon: MessageCircle,
    title: "Real-Time Chat",
    description: "Coordinate plans, share tips, and bond with your travel companions before and during your trip.",
  },
  {
    icon: Receipt,
    title: "Split Expenses Easily",
    description: "Track and split group expenses fairly so everyone knows exactly what they owe.",
  },
];

const steps = [
  { icon: UserPlus, title: "Create Your Profile", description: "Sign up and tell us about your travel style and preferences." },
  { icon: MapPin, title: "Find or Create a Group", description: "Browse available trips or create your own and invite others." },
  { icon: Plane, title: "Travel Together", description: "Chat, plan, and explore the world with your new companions." },
];

const testimonials = [
  { name: "Sarah M.", location: "Bali, Indonesia", text: "TravelMate helped me find the perfect group for my Bali trip. Made lifelong friends!", rating: 5 },
  { name: "James K.", location: "Swiss Alps", text: "The expense splitting feature saved us so many headaches. Everything was fair and transparent.", rating: 5 },
  { name: "Priya D.", location: "Japan", text: "As a solo traveler, this platform gave me the confidence to explore Japan with amazing people.", rating: 5 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Travelers on a beautiful beach" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-40">
          <motion.div
            className="max-w-2xl space-y-6"
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              custom={0}
              variants={fadeUp}
              className="text-4xl md:text-6xl font-extrabold leading-tight text-primary-foreground"
            >
              Find Your Perfect <br />
              <span className="text-accent">Travel Companion</span>
            </motion.h1>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="text-lg md:text-xl text-primary-foreground/80 max-w-lg"
            >
              Connect with like-minded travelers, plan trips together, chat in real-time, and split expenses effortlessly.
            </motion.p>
            <motion.div custom={2} variants={fadeUp} className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button variant="accent" size="lg" className="text-base px-8">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="hero-outline" size="lg" className="text-base px-8 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  Login
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to <span className="text-primary">Travel Together</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From finding companions to splitting the bill, TravelMate has you covered.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow duration-300 border"
              >
                <div className="gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Get started in three simple steps.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center space-y-4"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                  <s.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="text-sm font-bold text-accent">Step {i + 1}</div>
                <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by <span className="text-primary">Travelers</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-8 shadow-card border"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-card-foreground mb-4 leading-relaxed italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join thousands of travelers finding their perfect companions on TravelMate.
          </p>
          <Link to="/signup">
            <Button variant="accent" size="lg" className="text-base px-10">
              Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
