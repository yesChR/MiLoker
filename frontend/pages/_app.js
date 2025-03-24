import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import Layout from "@/components/Layout";

export default function App({ Component, pageProps }) {
  return (
    <HeroUIProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </HeroUIProvider>
  )
}
