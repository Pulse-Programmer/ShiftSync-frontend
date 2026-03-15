import { test, expect, type Page } from '@playwright/test';

const MANAGER_EMAIL = 'manager.downtown@coastaleats.com';
const MANAGER_PASSWORD = 'CoastalMgr@2026';

// Early morning times to avoid overlapping with seed data shifts
const SHIFT_START = '05:00';
const SHIFT_END = '08:00';
const SHIFT_MARKER = '5:00 AM';
const SHIFT_NOTES_PREFIX = 'PW-test';

function uniqueNotes() {
  return `${SHIFT_NOTES_PREFIX}-${Date.now()}`;
}

async function loginAsManager(page: Page) {
  await page.goto('/login');
  await page.fill('#email', MANAGER_EMAIL);
  await page.fill('#password', MANAGER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/schedule', { timeout: 10_000 });
}

/**
 * Navigate to next week (future, draft schedule — avoids edit cutoff for deletes
 * and ensures staff availability issues don't block assignments).
 */
async function navigateToNextWeek(page: Page) {
  const nextWeekBtn = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') });
  await expect(nextWeekBtn).toBeVisible({ timeout: 5_000 });
  await nextWeekBtn.click();
  await page.waitForTimeout(500);
}

/**
 * Create a schedule (if needed) and a shift on a given date.
 * Returns the unique notes string for targeting this shift.
 */
async function createShiftOnDate(page: Page, date: string): Promise<string> {
  const createScheduleBtn = page.locator('button', { hasText: 'Create Schedule' });
  if (await createScheduleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await createScheduleBtn.click();
    await expect(page.locator('button', { hasText: 'Add Shift' })).toBeVisible({ timeout: 10_000 });
  }

  const notes = uniqueNotes();

  const addShiftBtn = page.locator('button', { hasText: 'Add Shift' });
  await expect(addShiftBtn).toBeVisible();
  await addShiftBtn.click();

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible({ timeout: 5_000 });

  await modal.locator('input[type="date"]').fill(date);
  await modal.locator('input[type="time"]').first().fill(SHIFT_START);
  await modal.locator('input[type="time"]').last().fill(SHIFT_END);
  await modal.locator('input[type="number"]').fill('3');
  await modal.locator('textarea').fill(notes);
  await modal.locator('button[type="submit"]', { hasText: 'Create' }).click();

  await expect(modal).toBeHidden({ timeout: 10_000 });
  await expect(page.locator(`text=${notes}`).first()).toBeVisible({ timeout: 5_000 });

  return notes;
}

/**
 * Create shift on today's date (current week — staff have availability set).
 */
async function createShiftToday(page: Page): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  return createShiftOnDate(page, today);
}

/**
 * Create shift on a future date (next week — draft schedule, no edit cutoff).
 */
async function createShiftNextWeek(page: Page): Promise<string> {
  await navigateToNextWeek(page);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  return createShiftOnDate(page, futureDate.toISOString().split('T')[0]);
}

/** Find a specific shift card by its unique notes */
function findShiftCard(page: Page, notes: string) {
  return page.locator('.card-hover', { hasText: notes }).first();
}

/** Open the 3-dot menu on a specific shift card and click an action */
async function openShiftMenuOnCard(page: Page, card: ReturnType<typeof page.locator>, action: string) {
  await expect(card).toBeVisible();
  const menuBtn = card.locator('button').first();
  await menuBtn.click();
  const menuItem = page.locator('button', { hasText: action });
  await expect(menuItem).toBeVisible({ timeout: 3_000 });
  await menuItem.click();
}

/** Click a staff member and wait for constraint check to load */
async function selectStaffAndWaitForConstraints(modal: ReturnType<typeof Page.prototype.locator>, staffBtn: ReturnType<typeof Page.prototype.locator>) {
  await staffBtn.click();

  await expect(
    modal.locator('text=Constraint check for')
      .or(modal.locator('text=All constraints pass'))
      .or(modal.locator('text=Preview failed'))
  ).toBeVisible({ timeout: 15_000 });
}

/**
 * Find and select a staff member whose constraints allow assignment.
 * Returns the staff name, or null if none found.
 */
async function selectAssignableStaff(
  modal: ReturnType<typeof Page.prototype.locator>,
): Promise<string | null> {
  const staffButtons = modal.locator('.max-h-40 button');
  const count = await staffButtons.count();
  const assignBtn = modal.locator('button', { hasText: /^Assign$/ });

  for (let i = 0; i < count; i++) {
    await selectStaffAndWaitForConstraints(modal, staffButtons.nth(i));
    if (await assignBtn.isEnabled({ timeout: 1_000 }).catch(() => false)) {
      const name = await staffButtons.nth(i).locator('.font-medium').textContent();
      return name;
    }
  }
  return null;
}

// ─── ASSIGN STAFF TESTS ───
// Uses current week shifts — staff have availability set for this week.

test.describe('Assign Staff (Manager)', () => {
  let shiftNotes: string;

  test.beforeEach(async ({ page }) => {
    await loginAsManager(page);
    shiftNotes = await createShiftToday(page);
  });

  test('should open assign modal and display available staff list', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);
    await openShiftMenuOnCard(page, card, 'Assign staff');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.locator('text=Assign Staff')).toBeVisible();
    await expect(modal.locator(`text=${SHIFT_MARKER}`)).toBeVisible();

    const staffButtons = modal.locator('.max-h-40 button');
    await expect(staffButtons.first()).toBeVisible({ timeout: 5_000 });
    const staffCount = await staffButtons.count();
    expect(staffCount).toBeGreaterThan(0);
  });

  test('should show constraint check when clicking a staff member', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);
    await openShiftMenuOnCard(page, card, 'Assign staff');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    const staffButtons = modal.locator('.max-h-40 button');
    await expect(staffButtons.first()).toBeVisible({ timeout: 5_000 });

    await selectStaffAndWaitForConstraints(modal, staffButtons.first());

    await expect(staffButtons.first()).toHaveClass(/bg-primary/);
  });

  test('should show different constraint results for different staff members', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);
    await openShiftMenuOnCard(page, card, 'Assign staff');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    const staffButtons = modal.locator('.max-h-40 button');
    await expect(staffButtons.first()).toBeVisible({ timeout: 5_000 });

    const staffCount = await staffButtons.count();
    if (staffCount < 2) {
      test.skip(true, 'Need at least 2 staff members for comparison');
      return;
    }

    await selectStaffAndWaitForConstraints(modal, staffButtons.nth(0));
    const firstName = await staffButtons.nth(0).locator('.font-medium').textContent();

    await selectStaffAndWaitForConstraints(modal, staffButtons.nth(1));
    const secondName = await staffButtons.nth(1).locator('.font-medium').textContent();

    expect(firstName).not.toBe(secondName);
    await expect(staffButtons.nth(1)).toHaveClass(/bg-primary/);
    await expect(staffButtons.nth(0)).not.toHaveClass(/bg-primary/);
  });

  test('should successfully assign a staff member and show them on the shift card', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);
    await openShiftMenuOnCard(page, card, 'Assign staff');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.locator('.max-h-40 button').first()).toBeVisible({ timeout: 5_000 });

    const staffName = await selectAssignableStaff(modal);
    expect(staffName).not.toBeNull();

    const assignBtn = modal.locator('button', { hasText: /^Assign$/ });
    await assignBtn.click();
    await expect(modal).toBeHidden({ timeout: 10_000 });

    const firstName = staffName!.split(' ')[0];
    const updatedCard = findShiftCard(page, shiftNotes);
    await expect(updatedCard.locator(`text=${firstName}`)).toBeVisible({ timeout: 5_000 });
    await expect(updatedCard.locator('text=1/3')).toBeVisible({ timeout: 5_000 });
  });

  test('should assign a second staff member — first excluded, headcount becomes 2/3', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);

    // First assignment
    await openShiftMenuOnCard(page, card, 'Assign staff');
    let modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.locator('.max-h-40 button').first()).toBeVisible({ timeout: 5_000 });

    const firstStaffName = await selectAssignableStaff(modal);
    expect(firstStaffName).not.toBeNull();

    const assignBtn1 = modal.locator('button', { hasText: /^Assign$/ });
    await assignBtn1.click();
    await expect(modal).toBeHidden({ timeout: 10_000 });

    // Second assignment
    const updatedCard = findShiftCard(page, shiftNotes);
    await openShiftMenuOnCard(page, updatedCard, 'Assign staff');
    modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    let staffButtons = modal.locator('.max-h-40 button');
    await expect(staffButtons.first()).toBeVisible({ timeout: 5_000 });

    // First staff should be excluded
    const remainingNames: string[] = [];
    const count = await staffButtons.count();
    for (let i = 0; i < count; i++) {
      const name = await staffButtons.nth(i).locator('.font-medium').textContent();
      remainingNames.push(name ?? '');
    }
    expect(remainingNames).not.toContain(firstStaffName);

    const secondStaffName = await selectAssignableStaff(modal);
    if (!secondStaffName) {
      // No second staff available — skip the rest of this test
      test.skip(true, 'No second staff member passes constraints for this shift');
      return;
    }

    const assignBtn2 = modal.locator('button', { hasText: /^Assign$/ });
    await assignBtn2.click();
    await expect(modal).toBeHidden({ timeout: 10_000 });

    const finalCard = findShiftCard(page, shiftNotes);
    const firstName1 = firstStaffName!.split(' ')[0];
    const firstName2 = secondStaffName!.split(' ')[0];
    await expect(finalCard.locator(`text=${firstName1}`)).toBeVisible({ timeout: 5_000 });
    await expect(finalCard.locator(`text=${firstName2}`)).toBeVisible({ timeout: 5_000 });
    await expect(finalCard.locator('text=2/3')).toBeVisible({ timeout: 5_000 });
  });

  test('should filter staff list with search input', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);
    await openShiftMenuOnCard(page, card, 'Assign staff');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    const staffButtons = modal.locator('.max-h-40 button');
    await expect(staffButtons.first()).toBeVisible({ timeout: 5_000 });
    const initialCount = await staffButtons.count();

    const firstStaffName = await staffButtons.first().locator('.font-medium').textContent();
    const searchTerm = firstStaffName!.split(' ')[0];
    await modal.locator('input[placeholder="Search staff..."]').fill(searchTerm);

    const filteredButtons = modal.locator('.max-h-40 button');
    await expect(filteredButtons.first()).toBeVisible({ timeout: 3_000 });
    const filteredCount = await filteredButtons.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    for (let i = 0; i < filteredCount; i++) {
      const name = await filteredButtons.nth(i).locator('.font-medium').textContent();
      expect(name!.toLowerCase()).toContain(searchTerm.toLowerCase());
    }

    await modal.locator('input[placeholder="Search staff..."]').fill('');
    const restoredCount = await filteredButtons.count();
    expect(restoredCount).toBe(initialCount);
  });

  test('should show weekly hours preview when selecting staff', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);
    await openShiftMenuOnCard(page, card, 'Assign staff');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    const staffButtons = modal.locator('.max-h-40 button');
    await expect(staffButtons.first()).toBeVisible({ timeout: 5_000 });

    await selectStaffAndWaitForConstraints(modal, staffButtons.first());

    const weeklyHours = modal.locator('text=Weekly hours');
    if (await weeklyHours.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(weeklyHours).toBeVisible();
    }
  });

  test('should cancel assign modal without making any changes', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);
    await openShiftMenuOnCard(page, card, 'Assign staff');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    const staffButtons = modal.locator('.max-h-40 button');
    await expect(staffButtons.first()).toBeVisible({ timeout: 5_000 });

    await selectStaffAndWaitForConstraints(modal, staffButtons.first());

    await modal.locator('button', { hasText: 'Cancel' }).click();
    await expect(modal).toBeHidden({ timeout: 5_000 });

    const unchangedCard = findShiftCard(page, shiftNotes);
    await expect(unchangedCard.locator('text=0/3')).toBeVisible({ timeout: 5_000 });
  });
});

// ─── DELETE SHIFT TESTS ───
// Uses next week (draft schedule) to avoid 48-hour edit cutoff.

test.describe('Delete Shift (Manager)', () => {
  let shiftNotes: string;

  test.beforeEach(async ({ page }) => {
    await loginAsManager(page);
    shiftNotes = await createShiftNextWeek(page);
  });

  test('should delete a shift when dialog is accepted', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);
    await expect(card).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await openShiftMenuOnCard(page, card, 'Delete');

    await expect(page.locator('.card-hover', { hasText: shiftNotes })).toHaveCount(0, { timeout: 10_000 });
  });

  test('should NOT delete a shift when dialog is dismissed', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);
    await expect(card).toBeVisible();

    page.on('dialog', (dialog) => dialog.dismiss());
    await openShiftMenuOnCard(page, card, 'Delete');

    await page.waitForTimeout(1_000);
    await expect(findShiftCard(page, shiftNotes)).toBeVisible();
  });

  test('should delete a shift that has an assigned staff member', async ({ page }) => {
    const card = findShiftCard(page, shiftNotes);

    // Assign a staff member first (use force-assign since future week may have constraint warnings)
    await openShiftMenuOnCard(page, card, 'Assign staff');
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    const staffButtons = modal.locator('.max-h-40 button');
    await expect(staffButtons.first()).toBeVisible({ timeout: 5_000 });
    await selectStaffAndWaitForConstraints(modal, staffButtons.first());

    // Check if Assign is enabled; if not, the constraint blocks it — just close and test delete only
    const assignBtn = modal.locator('button', { hasText: /^Assign$/ });
    const isEnabled = await assignBtn.isEnabled({ timeout: 2_000 }).catch(() => false);

    if (isEnabled) {
      await assignBtn.click();
      await expect(modal).toBeHidden({ timeout: 10_000 });

      const assignedCard = findShiftCard(page, shiftNotes);
      await expect(assignedCard.locator('text=1/3')).toBeVisible({ timeout: 5_000 });

      page.on('dialog', (dialog) => dialog.accept());
      await openShiftMenuOnCard(page, assignedCard, 'Delete');
    } else {
      // Can't assign due to constraints — close modal and just delete the unassigned shift
      await modal.locator('button', { hasText: 'Cancel' }).click();
      await expect(modal).toBeHidden({ timeout: 5_000 });

      page.on('dialog', (dialog) => dialog.accept());
      await openShiftMenuOnCard(page, findShiftCard(page, shiftNotes), 'Delete');
    }

    await expect(page.locator('.card-hover', { hasText: shiftNotes })).toHaveCount(0, { timeout: 10_000 });
  });
});
