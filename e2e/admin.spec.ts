import { test, expect } from '@playwright/test';

test.describe('CrunchyPaws Admin', () => {
  test('página de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });
});
