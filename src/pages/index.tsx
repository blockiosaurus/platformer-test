import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    return (
        <>
            <Head>
                <title>Platformer Game Feel Tester</title>
                <meta name="description" content="An interactive tool for testing and tuning 2D platformer game feel parameters in real-time. Adjust movement, jumping, wall mechanics, dashing, and more." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Platformer Game Feel Tester" />
                <meta property="og:description" content="An interactive tool for testing and tuning 2D platformer game feel parameters in real-time." />
                <meta property="og:image" content="/og-image.png" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Platformer Game Feel Tester" />
                <meta name="twitter:description" content="An interactive tool for testing and tuning 2D platformer game feel parameters in real-time." />
                <meta name="twitter:image" content="/og-image.png" />

                {/* Theme color for browser UI */}
                <meta name="theme-color" content="#1a1a2e" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <AppWithoutSSR />
            </main>
        </>
    );
}
