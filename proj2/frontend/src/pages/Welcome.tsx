import heroIllustration from '@/assets/welcome-page.png';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Activity,
  Bot,
  HeartPulse,
  Leaf,
  LineChart,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'LLM-Powered Restaurant Recommendation',
    description:
      'Leverage our large language model to surface dining options aligned with nutrition goals, mood, and schedule in seconds.',
  },
  {
    icon: Activity,
    title: 'Dual-Dimension Health Profile',
    description:
      'Fuse biometric metrics with lifestyle cues to shape a living profile that adapts menus, supplements, and coaching in real time.',
  },
  {
    icon: LineChart,
    title: 'Visual Wellness Journey',
    description:
      'Reveal progress across energy, recovery, and mindset with immersive visual dashboards that make trends instantly actionable.',
  },
];

function Welcome() {
  return (
    <div className="flex min-h-screen flex-col bg-lime-50 text-foreground">
      <header className="sticky top-0 z-50 bg-white/90 shadow-xs backdrop-blur">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex">
            <a href="/" className="mr-8 text-2xl font-semibold tracking-tight text-emerald-600">
              Eatsential
            </a>
            <nav className="hidden text-gray-800 md:flex">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="rounded-md px-4 py-2 text-sm font-semibold"
                      href="#features"
                    >
                      Benefits
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="rounded-md px-4 py-2 text-sm font-semibold"
                      href="#offers"
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="rounded-md px-4 py-2 text-sm font-semibold"
                      href="#contact"
                    >
                      Contact
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white" asChild>
              <a href="/login">Log in</a>
            </Button>
            <Button className="bg-emerald-500 text-white shadow-md hover:bg-emerald-500/90" asChild>
              <a href="/signup">Join now</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section
          id="hero"
          className="container mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-6 pt-12 pb-16 lg:flex-row lg:items-start"
        >
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-emerald-600 sm:text-5xl lg:text-6xl">
              Crafted nutrition for vibrant living.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
              Eatsential blends culinary artistry with data-backed insights to power your goals,
              from metabolic balance to mindful energy. Discover restaurants that celebrate flavor,
              function, and sustainability in equal measure.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-emerald-500 px-6 text-white shadow-lg hover:bg-emerald-500/90"
                asChild
              >
                <a href="/signup">Join now</a>
              </Button>
              <Button size="lg" variant="outline" className="bg-white" asChild>
                <a href="https://github.com/Asoingbob225/CSC510/tree/main/proj2">
                  <img src="https://cdn.simpleicons.org/github" alt="github" className="h-5 w-5" />
                  Github Repo
                </a>
              </Button>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm">
                <Bot className="h-4 w-4 text-emerald-500" />
                AI-powered food recommendations tailored to your wellness journey
              </div>
              <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm">
                <Activity className="h-4 w-4 text-amber-500" />
                Physical and Mental health data integration for holistic insights
              </div>
              <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm">
                <LineChart className="h-4 w-4 text-sky-500" />
                Visual dashboards to track your progress and stay motivated
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-center lg:justify-end">
            <img
              src={heroIllustration}
              alt="Animated welcome illustration"
              className="w-full max-w-[420px] object-contain"
              draggable={false}
            />
          </div>
        </section>

        <section id="features" className="bg-white/70 py-16">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-10 flex flex-col gap-4 text-center">
              <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase">
                Why Eatsential
              </p>
              <h2 className="text-3xl font-semibold text-emerald-600 sm:text-4xl">
                Your well-being, thoughtfully curated
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600">
                Each layer of our experience is designed to keep you energized, focused, and
                grounded—with transparency you can taste.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-emerald-100 p-4 text-emerald-600 shadow-md">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-emerald-900">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
                  <div className="absolute right-6 bottom-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-500 opacity-0 transition group-hover:opacity-100">
                    Learn more
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="offers" className="py-14 text-slate-800">
          <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 text-center md:flex-row md:text-left">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.3em] text-white/70 uppercase">
                Limited-time offer
              </p>
              <h2 className="text-3xl font-semibold md:text-4xl">
                Unlock the Spring Wellness Passport
              </h2>
              <p className="max-w-xl text-sm md:text-base">
                Get two bespoke tasting sessions, early access to new elixirs, and concierge
                coaching when you join this month.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="outline"
                className="bg-emerald-500 px-6 text-white shadow-lg hover:bg-emerald-500/90 hover:text-white"
              >
                Redeem offer
              </Button>
              <Button size="lg" variant="outline" className="bg-white px-6 shadow-lg">
                View membership tiers
              </Button>
            </div>
          </div>
        </section>

        <section id="review" className="bg-white/70 py-16">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-10 shadow-lg">
                <h3 className="text-2xl font-semibold text-emerald-600">
                  Why guests return weekly
                </h3>
                <ul className="mt-6 space-y-4 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-5 w-5 text-amber-400" />
                    Elevated rituals with sommelier-paired adaptogens and botanical infusions.
                  </li>
                  <li className="flex items-start gap-3">
                    <Leaf className="mt-1 h-5 w-5 text-emerald-500" />
                    Rotating hyperlocal ingredients curated for micronutrient density and minimal
                    waste.
                  </li>
                  <li className="flex items-start gap-3">
                    <HeartPulse className="mt-1 h-5 w-5 text-rose-400" />
                    Metrics-driven personalization powered by biofeedback, stress scores, and sleep
                    data.
                  </li>
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-white p-[1px] shadow-lg">
                <div className="flex h-full flex-col justify-between rounded-3xl p-10 text-slate-700">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-emerald-500 uppercase">
                      Member spotlight
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold">
                      “My energy is stable and my team craves our weekly chef drops.”
                    </h3>
                    <p className="mt-4 text-sm text-gray-500">
                      — Avery Chen, Founder & Head Trainer at Studio Lift. Avery shares how
                      Eatsential fuels her coaching crew with vibrant meals designed around training
                      load.
                    </p>
                  </div>
                  <Button size="lg" variant="outline" className="mt-8 bg-white text-slate-700">
                    Explore member stories
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="relative overflow-hidden py-20">
          <div className="absolute inset-0 -z-10">
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80"
              alt="Abstract overhead of fresh ingredients"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-emerald-950/70" />
          </div>
          <div className="container mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl bg-white/90 p-10 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-2 text-center">
              <p className="text-xs font-semibold tracking-[0.3em] text-gray-500 uppercase">
                Book a tasting
              </p>
              <h2 className="text-3xl font-semibold text-emerald-600">
                Plan your next culinary wellness experience
              </h2>
              <p className="text-sm text-slate-600">
                Share your goals and our concierge team will design a bespoke tasting and
                consultation.
              </p>
            </div>
            <form className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-semibold text-slate-800">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Avery Chen"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:ring-2 focus:ring-gray-200 focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-800">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="avery@studiolift.com"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="guests" className="text-sm font-semibold text-slate-800">
                  Group size
                </label>
                <input
                  id="guests"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="8"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="date" className="text-sm font-semibold text-slate-800">
                  Preferred date
                </label>
                <input
                  id="date"
                  type="date"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="message" className="text-sm font-semibold text-slate-800">
                  Tell us more
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Share dietary preferences, vibe, or occasion details..."
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                />
              </div>
              <div className="flex justify-end md:col-span-2">
                <Button size="lg" className="bg-gray-600 px-6 text-white shadow-lg">
                  Submit inquiry
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-white/90 py-12 text-slate-800">
        <div className="container mx-auto grid gap-10 px-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <a href="#hero" className="text-2xl font-semibold tracking-tight text-emerald-600">
              Eatsential
            </a>
            <p className="text-sm text-slate-600">
              Elevated nourishment for people and teams pursuing a brighter, grounded way of living.
            </p>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Phone className="h-4 w-4 text-emerald-500" />
              <span>+1 (919) 555-0134</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Mail className="h-4 w-4 text-emerald-500" />
              <span>hello@eatsential.co</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span>204 Mint Street, Raleigh, NC</span>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <a href="#hero" className="hover:text-emerald-600">
                  About
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-emerald-600">
                  Our menu
                </a>
              </li>
              <li>
                <a href="#offers" className="hover:text-emerald-600">
                  Membership
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-emerald-600">
                  Book a tasting
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <a href="/guides" className="hover:text-emerald-600">
                  Wellness guides
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-emerald-600">
                  Events
                </a>
              </li>
              <li>
                <a href="/sourcing" className="hover:text-emerald-600">
                  Sourcing standards
                </a>
              </li>
              <li>
                <a href="/careers" className="hover:text-emerald-600">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-emerald-500 uppercase">
              Stay in the loop
            </h4>
            <p className="text-sm text-slate-600">
              Subscribe for chef drops, biohacking insights, and seasonal invites.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="you@example.com"
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
              />
              <Button className="bg-emerald-500 text-white shadow-lg hover:bg-emerald-500/90">
                Subscribe
              </Button>
            </form>
            <div className="flex items-center gap-4 pt-2 text-emerald-600">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="hover:text-emerald-500"
              >
                <img
                  src="https://cdn.simpleicons.org/instagram"
                  alt="Instagram"
                  className="h-5 w-5"
                />
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="hover:text-emerald-500"
              >
                <img
                  src="https://cdn.simpleicons.org/facebook"
                  alt="Facebook"
                  className="h-5 w-5"
                />
              </a>
              <a href="https://x.com" aria-label="x" className="hover:text-emerald-500">
                <img src="https://cdn.simpleicons.org/x" alt="x" className="h-5 w-5" />
              </a>
              <a href="https://github.com/Asoingbob225/CSC510/tree/main/proj2">
                <img src="https://cdn.simpleicons.org/github" alt="github" className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Eatsential. Crafted with vitality.
        </div>
      </footer>
    </div>
  );
}

export default Welcome;
