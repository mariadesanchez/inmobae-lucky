import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import { getDictionary } from '@/lib/dictionaries';

export default async function Home() {
  const dict = await getDictionary();

  return (
    <>
      <Navbar dict={dict.navbar} />
      <main>
        <Hero dict={dict.hero} />
      </main>
    </>
  );
}
