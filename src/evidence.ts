import type { Page, TestInfo } from '@playwright/test';

/**
 * Playwright keeps screenshots only of unexpected failures, so the test of a known bug, which fails
 * as expected, would leave none, and each issue's evidence would end with the run it cites. This
 * keeps one in every run's report instead: each known bug as it looks that day. Used as
 * `test.afterEach(keepKnownBugScreenshot)` in the UI test files. A screenshot that can't be taken
 * (a closed page) is left out rather than adding an error of its own.
 */
export async function keepKnownBugScreenshot({ page }: { page: Page }, testInfo: TestInfo): Promise<void> {
  if (testInfo.expectedStatus !== 'failed' || page.isClosed()) return;
  const shot = await page.screenshot({ fullPage: true, type: 'jpeg', quality: 60 }).catch(() => undefined);
  if (shot) await testInfo.attach('known bug, as it looks', { body: shot, contentType: 'image/jpeg' });
}
