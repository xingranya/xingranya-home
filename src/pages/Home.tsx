import React from 'react';
import { Container } from '../components/layout/Container';
import { PageShell } from '../components/layout/PageShell';
import { HomeHero } from '../components/home/HomeHero';

export const Home: React.FC = () => {
  return (
    <PageShell className="flex-1 w-full py-4 sm:py-8">
      <Container size="default" className="w-full">
        <HomeHero />
      </Container>
    </PageShell>
  );
};
