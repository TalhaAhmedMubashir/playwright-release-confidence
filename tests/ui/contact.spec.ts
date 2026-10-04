import { issue } from '../../src/config.ts';
import { MESSAGE } from '../../src/data.ts';
import { expect, test } from '../../src/fixtures.ts';
import { HomePage } from '../../src/pages/home.ts';

// What the form showed when sent empty while exploring (docs/exploration/2026-10-04/flows.md, step 2).
const EMPTY_FORM_ERRORS = [
  'Name may not be blank',
  'Email may not be blank',
  'Phone may not be blank',
  'Phone must be between 11 and 21 characters.',
  'Subject may not be blank',
  'Subject must be between 5 and 100 characters.',
  'Message may not be blank',
  'Message must be between 20 and 2000 characters.',
];

test('UI-07 a valid message is thanked by name, and its subject repeated', { tag: ['@ui', '@smoke'] }, async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.sendMessage(MESSAGE);
  await expect(page.getByRole('heading', { name: `Thanks for getting in touch ${MESSAGE.name}!` })).toBeVisible();
  await expect(page.getByText(MESSAGE.subject, { exact: true })).toBeVisible();
});

test('UI-08 sending the empty form lists a problem for every field', { tag: '@ui' }, async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.contactForm.getByRole('button', { name: 'Submit' }).click();
  for (const error of EMPTY_FORM_ERRORS) await expect(page.getByText(error, { exact: true })).toBeVisible();
});

test.fail("UI-09 the form's errors are announced to screen-reader users", { tag: ['@ui', '@a11y', '@known-bug'], annotation: issue(14) }, async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.contactForm.getByRole('button', { name: 'Submit' }).click();
  // Announced means inside a live region: role="alert" or an aria-live area.
  const announced = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
  await expect(announced.getByText('Name may not be blank', { exact: true })).toBeVisible();
});
