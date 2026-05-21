import { useRef } from 'react';
import { useHomeData } from '../../hooks/useHomeData';
import { useIntroAnimation } from '../../hooks/useIntroAnimation';
import { useHomeGsap } from '../../hooks/useHomeGsap';
import HomeIntro from './HomeIntro';
import HomeMarquee from './HomeMarquee';
import HomeAbout from './HomeAbout';
import HomeStats from './HomeStats';
import HomePillars from './HomePillars';
import HomeGallery from './HomeGallery';
import HomeCta from './HomeCta';

export default function Home() {
  const introRef = useRef(null);
  const pageRef = useRef(null);
  const introDone = useIntroAnimation(introRef);
  const { featured, categories, loading } = useHomeData();

  useHomeGsap(pageRef, loading);

  return (
    <div className="home" ref={pageRef}>
      <HomeIntro introRef={introRef} introDone={introDone} />
      <HomeMarquee categories={categories} />
      <HomeAbout featured={featured} />
      <HomeStats />
      <HomePillars />
      <HomeGallery featured={featured} loading={loading} />
      <HomeCta />
    </div>
  );
}
