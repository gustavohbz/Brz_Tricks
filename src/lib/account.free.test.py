"""Regression: a signed-in account saves setup and schedule without billing.

Run with: python3 src/lib/account.free.test.py
Uses the preview's managed session; never prints credentials.
"""
import asyncio
import json
import os
import unittest
from pathlib import Path
from playwright.async_api import async_playwright


class FreeAccountTest(unittest.TestCase):
    def test_setup_and_schedule_save_without_subscription(self):
        asyncio.run(self.check_free_account())

    async def check_free_account(self):
        if os.environ.get("LOVABLE_BROWSER_AUTH_STATUS") == "injected":
            key = os.environ["LOVABLE_BROWSER_SUPABASE_STORAGE_KEY"]
            session = os.environ["LOVABLE_BROWSER_SUPABASE_SESSION_JSON"]
            cookies = json.loads(os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON") or "[]")
        else:
            with open(os.path.expanduser("~/.cache/lovable-auth/session.json")) as file:
                minted = json.load(file)
            key = minted["storage_key"]
            session = json.dumps(minted["session"])
            cookies = minted.get("cookies") or []

        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1280, "height": 1800})
            if cookies:
                await context.add_cookies([{**c, "url": "http://localhost:8080"} for c in cookies])
            page = await context.new_page()
            await page.goto("http://localhost:8080")
            await page.evaluate("([k,v]) => localStorage.setItem(k,v)", [key, session])
            await page.goto("http://localhost:8080/perfil")
            save = page.get_by_role("button", name="Salvar perfil", exact=True)
            await save.wait_for()
            await page.wait_for_function("() => !document.querySelector('button:disabled') || [...document.querySelectorAll('button')].some(b => b.textContent.includes('Salvar perfil') && !b.disabled)")
            await page.wait_for_timeout(1500)
            truck = page.get_by_label("Truck", exact=True)
            original = await truck.input_value()
            remove = page.get_by_role("button", name="Remover Ollie de Segunda", exact=True)
            had_ollie = await remove.count() > 0
            try:
                await truck.fill("139mm QA free")
                if not had_ollie:
                    await page.get_by_placeholder("Buscar manobra...").fill("Ollie")
                    await page.get_by_role("button", name="Ollie Ollies", exact=True).click()
                await save.click()
                await page.get_by_text("Perfil salvo na sua conta!", exact=True).wait_for()
                # Eliminate local copies so reload must read the account's data.
                await page.evaluate("() => {localStorage.removeItem('cronograma-treinos'); localStorage.removeItem('skate-setup');}")
                await page.reload()
                await page.wait_for_timeout(2000)
                self.assertEqual(await truck.input_value(), "139mm QA free")
                self.assertEqual(await remove.count(), 1)
                shots = Path("/tmp/browser/free-account")
                shots.mkdir(parents=True, exist_ok=True)
                await page.get_by_role("main").screenshot(path=str(shots / "saved.png"))
            finally:
                await truck.fill(original)
                if not had_ollie and await remove.count():
                    await remove.click()
                await save.click()
                await page.get_by_text("Perfil salvo na sua conta!", exact=True).wait_for()
                await browser.close()


if __name__ == "__main__":
    unittest.main()