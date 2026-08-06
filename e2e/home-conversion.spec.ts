import { expect, test } from '@playwright/test';

test.describe('Home de conversão', () => {
  test('apresenta a proposta principal e encontra ferramenta por intenção', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crie, calcule e envie. Resolva já.');
    await expect(page.getByRole('link', { name: /Criar orçamento grátis/i })).toBeVisible();

    const intent = page.getByLabel('O que você precisa resolver hoje?');
    await intent.fill('abnt');

    const results = page.getByRole('list', { name: 'Ferramentas encontradas' });
    await expect(results.getByRole('link', { name: /Gerar referências ABNT/i })).toBeVisible();
    await expect(results.getByRole('link')).toHaveCount(1);
  });

  test('não cria rolagem horizontal no mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth
    }));

    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
