import Head from 'next/head';
import dynamic from 'next/dynamic';

import styles from './chat.module.css';

const AsyncAIChat = dynamic(() => import('@/packages/assistant-ui-chat').then(def => def.AIChat), {
  ssr: false,
  loading: () => <>loading...</>,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Assistant</title>
        <meta name="description" content="Generated by AI Assistant" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.ico" />
        <script async src="//g.alicdn.com/chatui/icons/0.3.0/index.js"></script>
      </Head>

      <main className={styles.main}>
        <AsyncAIChat />
      </main>
    </>
  );
}