import { test, expect } from '@playwright/test';

test.describe('Chat Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve carregar a página inicial com o chat', async ({ page }) => {
    // Verificar que o título ou header está presente
    await expect(page.locator('h1')).toContainText('Chat');
    
    // Verificar que a mensagem de boas-vindas do bot está presente
    await expect(page.getByText('Olá! Como posso ajudar você hoje?')).toBeVisible();
    
    // Verificar que o input está presente
    await expect(page.locator('input[placeholder="Digite uma mensagem..."]')).toBeVisible();
  });

  test('deve enviar uma mensagem com sucesso', async ({ page }) => {
    const input = page.locator('input[placeholder="Digite uma mensagem..."]');
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    // Digitar uma mensagem
    await input.fill('Olá, este é um teste!');
    
    // Clicar no botão de enviar
    await sendButton.click();
    
    // Verificar que a mensagem do usuário aparece
    await expect(page.getByText('Olá, este é um teste!')).toBeVisible();
    
    // Verificar que a mensagem está alinhada à direita (classe do usuário)
    const userMessage = page.getByText('Olá, este é um teste!').locator('..');
    await expect(userMessage).toHaveClass(/justify-end/);
  });

  test('deve enviar mensagem ao pressionar Enter', async ({ page }) => {
    const input = page.locator('input[placeholder="Digite uma mensagem..."]');
    
    // Digitar uma mensagem e pressionar Enter
    await input.fill('Teste de Enter');
    await input.press('Enter');
    
    // Verificar que a mensagem foi enviada
    await expect(page.getByText('Teste de Enter')).toBeVisible();
  });

  test('deve mostrar indicador de digitação durante resposta do bot', async ({ page }) => {
    const input = page.locator('input[placeholder="Digite uma mensagem..."]');
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    // Enviar uma mensagem
    await input.fill('Teste typing indicator');
    await sendButton.click();
    
    // Verificar que o indicador de digitação aparece (bolinhas animadas)
    await expect(page.locator('.animate-bounce').first()).toBeVisible();
    
    // Aguardar a resposta do bot (1.5s de delay)
    await page.waitForTimeout(2000);
    
    // Verificar que a resposta do bot aparece
    await expect(page.getByText('Mensagem recebida!')).toBeVisible();
  });

  test('não deve enviar mensagem vazia', async ({ page }) => {
    const input = page.locator('input[placeholder="Digite uma mensagem..."]');
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    // Tentar enviar com input vazio
    await input.fill('');
    await sendButton.click();
    
    // Verificar que nenhuma mensagem foi adicionada
    const messages = page.locator('.space-y-4').locator('> div');
    await expect(messages).toHaveCount(1); // Apenas a mensagem inicial
  });

  test('deve manter foco no input após enviar mensagem', async ({ page }) => {
    const input = page.locator('input[placeholder="Digite uma mensagem..."]');
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    // Enviar uma mensagem
    await input.fill('Teste de foco');
    await sendButton.click();
    
    // Verificar que o input ainda está em foco
    await expect(input).toBeFocused();
  });

  test('deve mostrar status online no header', async ({ page }) => {
    // Verificar que o status "Online" está presente
    await expect(page.getByText('Online')).toBeVisible();
  });

  test('deve ter ícone de menu no header', async ({ page }) => {
    // Verificar que o botão de menu está presente
    const menuButton = page.locator('header button').last();
    await expect(menuButton).toBeVisible();
  });

  test('deve ter botão de anexo no input area', async ({ page }) => {
    // Verificar que o botão de anexo está presente
    const attachButton = page.locator('input').locator('..').locator('..').locator('button').first();
    await expect(attachButton).toBeVisible();
  });

  test('deve desabilitar botão de envio quando input está vazio', async ({ page }) => {
    const input = page.locator('input[placeholder="Digite uma mensagem..."]');
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    // Verificar que o botão está desabilitado quando input está vazio
    await expect(sendButton).toBeDisabled();
    
    // Digitar algo
    await input.fill('Teste');
    
    // Verificar que o botão está habilitado
    await expect(sendButton).toBeEnabled();
  });

  test('deve formatar timestamp corretamente', async ({ page }) => {
    // A mensagem inicial deve ter um timestamp
    const timestamp = page.locator('text=/^\\d{2}:\\d{2}$/');
    await expect(timestamp.first()).toBeVisible();
  });

  test('deve fazer scroll automático para novas mensagens', async ({ page }) => {
    const input = page.locator('input[placeholder="Digite uma mensagem..."]');
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    // Enviar várias mensagens
    for (let i = 1; i <= 5; i++) {
      await input.fill(`Mensagem ${i}`);
      await sendButton.click();
      await page.waitForTimeout(2000); // Aguardar resposta do bot
    }
    
    // Verificar que todas as mensagens do usuário estão visíveis
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Mensagem ${i}`)).toBeVisible();
    }
  });

  test('deve diferenciar visualmente mensagens do usuário e do bot', async ({ page }) => {
    const input = page.locator('input[placeholder="Digite uma mensagem..."]');
    const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    // Enviar uma mensagem
    await input.fill('Teste de cores');
    await sendButton.click();
    await page.waitForTimeout(2000);
    
    // Mensagem do usuário deve ter fundo azul
    const userMessage = page.getByText('Teste de cores').locator('..');
    await expect(userMessage.locator('.bg-blue-500')).toBeVisible();
    
    // Mensagem do bot deve ter fundo branco
    const botMessage = page.getByText('Mensagem recebida!').locator('..');
    await expect(botMessage.locator('.bg-white')).toBeVisible();
  });
});
