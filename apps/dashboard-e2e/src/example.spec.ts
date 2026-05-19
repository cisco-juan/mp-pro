import { test, expect } from '@playwright/test';

test('login mock y navegación a clientes', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();

  await page.getByLabel('Email').fill('admin@mppro.local');
  await page.getByLabel('Contraseña').fill('demo1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('link', { name: 'Clientes' }).first().click();
  await expect(page).toHaveURL('/clientes');
  await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
});
