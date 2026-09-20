import React from 'react';
import { Container } from '../components/layout/Container';
import { PageShell } from '../components/layout/PageShell';
import { HomeHero } from '../components/home/HomeHero';

export const Home: React.FC = () => {
  return (
    <PageShell className="!min-h-0 flex-1 flex flex-col items-center justify-center !pt-0 !pb-0 w-full">
      <Container size="default" className="w-full">
        <HomeHero />
      </Container>
    </PageShell>
  );
};
