import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.route("**/auth/v1/**", (route) => route.fulfill({ json: { user: null, access_token: null } }));
  await page.route("**/rest/v1/**", (route) => route.fulfill({ json: [] }));
  await page.goto("/");
});

test("inicia a experiência e apresenta a categoria inicial acessível", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /Brauza Skate Co/i })).toBeVisible();
  await page.getByRole("button", { name: "Confira" }).click();

  const tabs = page.getByRole("tablist", { name: "Categorias de manobras" });
  await expect(tabs).toBeVisible();
  await expect(tabs.getByRole("tab", { name: /Ollies/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#ollies")).toBeVisible();
  await expect(page.locator("#variais")).toHaveCount(0);
  await expect(page.locator("#flips")).toHaveCount(0);
});

test("apresenta os quatro fundamentos antes da trilha em grade mobile-first", async ({ page }) => {
  await page.getByRole("button", { name: "Confira" }).click();

  const fundamentos = page.locator("#fundamentos");
  const fundamentosToggle = fundamentos.getByRole("button", { name: "Expandir Fundamentos" });
  await expect(fundamentosToggle).toHaveAttribute("aria-expanded", "false");
  await expect(fundamentos.getByTestId("fundamentos-grid")).toBeHidden();
  await fundamentosToggle.click();
  await expect(fundamentos.getByRole("button", { name: "Recolher Fundamentos" })).toHaveAttribute("aria-expanded", "true");
  await expect(fundamentos.getByRole("heading", { level: 2, name: "Fundamentos" })).toBeVisible();

  for (const title of [
    "Base & stance",
    "Postura & equilíbrio",
    "Remada correta",
    "Curvas & frenagem básica",
  ]) {
    await expect(fundamentos.getByRole("heading", { level: 3, name: title })).toBeVisible();
  }

  const orderIsCorrect = await page.evaluate(() => {
    const fundamentosSection = document.querySelector("#fundamentos");
    const trailSection = document.querySelector("#trilha");
    return Boolean(
      fundamentosSection &&
        trailSection &&
        (fundamentosSection.compareDocumentPosition(trailSection) &
          Node.DOCUMENT_POSITION_FOLLOWING),
    );
  });
  expect(orderIsCorrect).toBe(true);

  const columns = await fundamentos
    .getByTestId("fundamentos-grid")
    .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length);
  expect(columns).toBe((page.viewportSize()?.width ?? 390) < 768 ? 1 : 2);

  await fundamentos.getByRole("link", { name: /Ir para a trilha de manobras/ }).click();
  await expect(page).toHaveURL(/#trilha$/);
  await expect(page.locator("#trilha")).toBeInViewport();
});

test("permite trocar categorias por clique e teclado", async ({ page }) => {
  await page.getByRole("button", { name: "Confira" }).click();
  await page.getByRole("button", { name: "Expandir Fundamentos" }).click();
  const tabs = page.getByRole("tablist", { name: "Categorias de manobras" });
  const variais = tabs.getByRole("tab", { name: /Variais/ });
  await variais.click();
  await expect(variais).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#variais")).toBeVisible();

  await variais.focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: /Flip/ })).toHaveAttribute("aria-selected", "true");
});

test("filtra por nível, mantém o filtro por categoria e expande a lista", async ({ page }) => {
  await page.getByRole("button", { name: "Confira" }).click();
  const content = page.locator("#ollies");
  const cards = content.locator(".grid").first().locator(":scope > button");
  await expect(cards).toHaveCount(5);

  await expect(content.getByRole("button", { name: /Ver mais/ })).toBeVisible();
  await content.getByRole("button", { name: /Ver mais/ }).click();
  await expect(cards).toHaveCount(8);
  await content.getByRole("button", { name: "Ver menos" }).click();
  await expect(cards).toHaveCount(5);

  await content.getByRole("button", { name: "Iniciante" }).click();
  const filteredCount = await cards.count();
  expect(filteredCount).toBeGreaterThan(0);
  await expect(content.getByText(`${filteredCount} manobras`)).toBeVisible();

  await page.getByRole("tab", { name: /Variais/ }).click();
  await page.getByRole("tab", { name: /Ollies/ }).click();
  await expect(content.getByRole("button", { name: "Iniciante" })).toHaveAttribute("aria-pressed", "true");
  await content.getByRole("button", { name: "Avançado" }).click();
  await expect(content.getByText("Nenhuma manobra nessa categoria ainda.")).toBeVisible();
  await expect(cards).toHaveCount(0);
});

test("abre detalhes da manobra e fecha com Escape", async ({ page }) => {
  await page.getByRole("button", { name: "Confira" }).click();
  await page.locator("#ollies .grid").first().locator(":scope > button").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("permite criar identidade local pelo cabeçalho", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Criar meu perfil" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Sua identidade" })).toBeVisible();
  const nome = dialog.getByLabel("Nome");
  await expect(dialog.getByText("Avatar (URL)")).toHaveCount(0);
  await nome.fill("João123! Silva");
  await expect(nome).toHaveValue("João Silva");
  await nome.fill("abcdefghijklmnopqrstuvwxy");
  await expect(nome).toHaveValue("abcdefghijklmnopqrstuvw");
  await nome.fill("Skatista de teste");
  await dialog.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("button", { name: "Perfil" })).toBeVisible();
  await page.getByRole("button", { name: "Perfil" }).click();
  await expect(page.getByRole("menuitem", { name: /Entrar com Google/ })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("skate-do-zero:user"))).toContain("Skatista de teste");
});

test("não cria rolagem horizontal e mantém controles tocáveis no viewport", async ({ page }, testInfo) => {
  await page.getByRole("button", { name: "Confira" }).click();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(dimensions.page, `scrollWidth ${dimensions.page} exceeds viewport ${dimensions.viewport}`).toBeLessThanOrEqual(dimensions.viewport + 1);

  const tabs = page.getByRole("tablist", { name: "Categorias de manobras" });
  const box = await tabs.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(dimensions.viewport);

  const header = page.locator("header");
  for (const target of [
    header.getByRole("button", { name: /Notificações/ }),
    header.getByRole("button", { name: /Criar meu perfil/ }),
  ]) {
    const targetBox = await target.boundingBox();
    expect(targetBox).not.toBeNull();
    expect(targetBox!.width).toBeGreaterThanOrEqual(44);
    expect(targetBox!.height).toBeGreaterThanOrEqual(44);
  }

  for (const tab of await tabs.getByRole("tab").all()) {
    const tabBox = await tab.boundingBox();
    expect(tabBox).not.toBeNull();
    expect(tabBox!.width).toBeGreaterThanOrEqual(44);
    expect(tabBox!.height).toBeGreaterThanOrEqual(44);
  }

  if (testInfo.project.name === "desktop-chromium") {
    const card = page.locator("#ollies .grid").first().locator(":scope > button").first();
    await card.hover();
    await expect(page.getByText("Clique para ver o roadmap")).toBeVisible();
  }
});

test("filtra uma tentativa de script JavaScript no nome", async ({ page }) => {
  let alertaExecutado = false;
  page.on("dialog", async (dialog) => {
    alertaExecutado = true;
    await dialog.dismiss();
  });

  await page.getByRole("button", { name: "Criar meu perfil" }).click();
  const dialog = page.getByRole("dialog");
  const nome = dialog.getByLabel("Nome");
  await nome.fill("<script>alert(1)</script>");
  await expect(nome).toHaveValue("scriptalertscript");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("button", { name: "Perfil" })).toBeVisible();
  await page.getByRole("button", { name: "Perfil" }).click();
  await expect(page.getByRole("menuitem", { name: /Entrar com Google/ })).toHaveCount(0);
  await expect(page.getByText("scriptalertscript")).toBeVisible();
  expect(alertaExecutado).toBe(false);

  const identidade = await page.evaluate(() => localStorage.getItem("skate-do-zero:user"));
  expect(identidade).toContain("scriptalertscript");
  expect(identidade).not.toContain("<script>");
});


test("mantém textos dentro dos cartões e diálogos em todos os tamanhos de tela", async ({ page }) => {
  const findOverflowingText = () =>
    page.evaluate(() => {
      const selector =
        "main h1, main h2, main h3, main h4, main p, main li, main button, main a, main [role='tab'], main dt, main dd, [role='dialog'] h1, [role='dialog'] h2, [role='dialog'] h3, [role='dialog'] p, [role='dialog'] button, [role='dialog'] a";
      const offenders: Array<{
        tag: string;
        text: string;
        overflow: string;
      }> = [];

      for (const element of document.querySelectorAll<HTMLElement>(selector)) {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          rect.width < 1 ||
          rect.height < 1 ||
          style.overflowX === "auto" ||
          style.overflowX === "scroll"
        ) {
          continue;
        }

        const boundary =
          element.closest<HTMLElement>(
            "button, a, article, section, [role='dialog'], [class*='bg-card']",
          ) ?? element.parentElement;
        const boundaryRect = boundary?.getBoundingClientRect();
        const boundaryStyle = boundary ? getComputedStyle(boundary) : null;
        const contentLeft = boundaryRect && boundaryStyle
          ? boundaryRect.left +
            parseFloat(boundaryStyle.borderLeftWidth) +
            parseFloat(boundaryStyle.paddingLeft)
          : Number.NEGATIVE_INFINITY;
        const contentRight = boundaryRect && boundaryStyle
          ? boundaryRect.right -
            parseFloat(boundaryStyle.borderRightWidth) -
            parseFloat(boundaryStyle.paddingRight)
          : Number.POSITIVE_INFINITY;

        const range = document.createRange();
        range.selectNodeContents(element);
        const textOutsideBoundary = Array.from(range.getClientRects()).some(
          (textRect) =>
            textRect.left < contentLeft - 2 || textRect.right > contentRight + 2,
        );
        const elementHasOverflow = element.scrollWidth > element.clientWidth + 1;

        if (textOutsideBoundary || elementHasOverflow) {
          offenders.push({
            tag: element.tagName.toLowerCase(),
            text: (element.innerText || element.textContent || "")
              .trim()
              .replace(/\s+/g, " ")
              .slice(0, 90),
            overflow: textOutsideBoundary
              ? "texto ultrapassa o cartão"
              : "conteúdo ultrapassa o próprio componente",
          });
        }
      }

      return offenders;
    });

  await page.getByRole("button", { name: "Confira" }).click();
  const tabs = page.getByRole("tablist", { name: "Categorias de manobras" });
  for (const tab of await tabs.getByRole("tab").all()) {
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const overflows = await findOverflowingText();
    expect(overflows, JSON.stringify(overflows)).toEqual([]);
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const sectionOverflows = await findOverflowingText();
  expect(sectionOverflows, JSON.stringify(sectionOverflows)).toEqual([]);

  await page.getByRole("button", { name: "Criar meu perfil" }).click();
  const profileDialog = page.getByRole("dialog");
  await profileDialog.getByLabel("Nome").fill("WWWWWWWWWWWWWWWWWWWWWWW");
  await expect(profileDialog.getByLabel("Nome")).toHaveValue("WWWWWWWWWWWWWWWWWWWWWWW");
  const dialogOverflows = await findOverflowingText();
  expect(dialogOverflows, JSON.stringify(dialogOverflows)).toEqual([]);
  await profileDialog.getByRole("button", { name: "Salvar" }).click();
  const profileMenu = page.getByRole("button", { name: "Perfil" });
  await expect(profileMenu).toBeVisible();
  await profileMenu.click();
  await page.getByRole("menuitem", { name: "Perfil", exact: true }).click();
  await expect(page.getByRole("heading", { name: "WWWWWWWWWWWWWWWWWWWWWWW" })).toBeVisible();
  const profileOverflows = await findOverflowingText();
  expect(profileOverflows, JSON.stringify(profileOverflows)).toEqual([]);

  for (const path of ["/treinos", "/entrar"]) {
    await page.goto(path);
    const routeOverflows = await findOverflowingText();
    expect(routeOverflows, `${path}: ${JSON.stringify(routeOverflows)}`).toEqual([]);

    if (await page.evaluate(() => window.innerWidth) < 640) {
      const inputFontSizes = await page.locator("main input, main textarea").evaluateAll((fields) =>
        fields.map((field) => Number.parseFloat(getComputedStyle(field).fontSize)),
      );
      for (const fontSize of inputFontSizes) {
        expect(fontSize, `${path} input font size`).toBeGreaterThanOrEqual(16);
      }
    }
  }
});
