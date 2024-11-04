"use client"; // Mark this as a client component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use from next/navigation

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/login'); 
  }, [router]);

  return null; 
};

export default Home;
