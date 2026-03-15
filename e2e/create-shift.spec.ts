import { test, expect } from '@playwright/test';

const MANAGER_EMAIL = 'manager.downtown@coastaleats.com';
const MANAGER_PASSWORD = 'CoastalMgr@2026';

async function loginAsManager(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('#email', MANAGER_EMAIL);
  await page.fill('#password', MANAGER_PASSWORD);
  await page.click('button[type="submit"]');
  // Wait for redirect to schedule page
  await page.waitForURL('**/schedule', { timeout: 10_000 });
}

test.describe('Create Shift (Manager)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsManager(page);
  });

  test('should open the create shift modal and create a shift', async ({ page }) => {
    // Ensure schedule page is loaded
    await expect(page.locator('text=Published').or(page.locator('text=Draft')).or(page.locator('text=Create Schedule'))).toBeVisible({ timeout: 10_000 });

    // If no schedule exists yet, create one first
    const createScheduleBtn = page.locator('button', { hasText: 'Create Schedule' });
    if (await createScheduleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await createScheduleBtn.click();
      await expect(page.locator('button', { hasText: 'Add Shift' })).toBeVisible({ timeout: 10_000 });
    }

    // Click "Add Shift" button
    const addShiftBtn = page.locator('button', { hasText: 'Add Shift' });
    await expect(addShiftBtn).toBeVisible({ timeout: 5_000 });
    await addShiftBtn.click();

    // Modal should appear
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.locator('text=Create Shift')).toBeVisible();

    // Fill in the form
    // Date: use today's date within the current week
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    await modal.locator('input[type="date"]').fill(dateStr);

    // Start time
    await modal.locator('input[type="time"]').first().fill('10:00');

    // End time
    await modal.locator('input[type="time"]').last().fill('16:00');

    // Headcount
    await modal.locator('input[type="number"]').fill('2');

    // Notes
    await modal.locator('textarea').fill('Playwright test shift');

    // Submit
    await modal.locator('button[type="submit"]', { hasText: 'Create' }).click();

    // Modal should close after successful creation
    await expect(modal).toBeHidden({ timeout: 10_000 });

    // Verify the shift appears on the schedule grid
    // The shift should show the time range somewhere on the page
    await expect(page.locator('text=10:00').first()).toBeVisible({ timeout: 5_000 });
  });

  test('should show validation — modal stays open if date is missing', async ({ page }) => {
    // Wait for schedule to load
    await expect(page.locator('text=Published').or(page.locator('text=Draft')).or(page.locator('text=Create Schedule'))).toBeVisible({ timeout: 10_000 });

    // Create schedule if needed
    const createScheduleBtn = page.locator('button', { hasText: 'Create Schedule' });
    if (await createScheduleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await createScheduleBtn.click();
      await expect(page.locator('button', { hasText: 'Add Shift' })).toBeVisible({ timeout: 10_000 });
    }

    // Open modal
    await page.locator('button', { hasText: 'Add Shift' }).click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Clear the date field and try to submit
    await modal.locator('input[type="date"]').fill('');
    await modal.locator('button[type="submit"]', { hasText: 'Create' }).click();

    // Modal should remain open (HTML5 required validation prevents submit)
    await expect(modal).toBeVisible();
  });

  test('should cancel without creating a shift', async ({ page }) => {
    await expect(page.locator('text=Published').or(page.locator('text=Draft')).or(page.locator('text=Create Schedule'))).toBeVisible({ timeout: 10_000 });

    const createScheduleBtn = page.locator('button', { hasText: 'Create Schedule' });
    if (await createScheduleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await createScheduleBtn.click();
      await expect(page.locator('button', { hasText: 'Add Shift' })).toBeVisible({ timeout: 10_000 });
    }

    // Open modal
    await page.locator('button', { hasText: 'Add Shift' }).click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Click Cancel
    await modal.locator('button', { hasText: 'Cancel' }).click();

    // Modal should close
    await expect(modal).toBeHidden({ timeout: 5_000 });
  });
});
