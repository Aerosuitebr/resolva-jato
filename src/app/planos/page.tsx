import { TopEnvBanner } from '@/components/layout/top-env-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { PricingPage } from '@/components/marketing/pricing-page';

export default function PlanosPage() {
  return (
    <>
      <TopEnvBanner />
      <div className="pt-8">
        <SiteHeader />
        <main>
          <PricingPage />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
