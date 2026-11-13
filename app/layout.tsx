import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from "next";
import { tiposka, spaceMono } from '@/app/ui/fonts';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import PageTransition from '@/app/components/PageTransition';
import MotionProvider from '@/app/components/motion/MotionProvider';
import { CanvasSettingsProvider } from '@/app/components/CanvasSettingsContext';
import CanvasDebugPanel from '@/app/components/CanvasDebugPanelLazy';
import "./globals.css";


export const metadata: Metadata = {
  title: "SDx — San Diego's builder-first technology community",
  description: "SDx is where San Diego's builders come to build. Hackathons, Paper Club, AI Coffee, and more. Join 3000+ builders shipping real things.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <GoogleAnalytics gaId="G-M1FV7BZY8T"/>
      <body className={`${tiposka.variable} ${spaceMono.variable} font-mono bg-background text-foreground`}>
        <CanvasSettingsProvider>
          <MotionProvider>
            <Navigation />
            <PageTransition>
              {children}
            </PageTransition>
            <Footer />
          </MotionProvider>
          <CanvasDebugPanel />
        </CanvasSettingsProvider>
      </body>
    </html>
  );
}
