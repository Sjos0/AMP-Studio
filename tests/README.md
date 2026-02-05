# Testes Playwright - Chat Application

Este diretório contém testes E2E (End-to-End) para o aplicativo de chat usando Playwright.

## Estrutura dos Testes

- `chat.spec.ts` - Testes principais do componente de chat

## Como Executar os Testes

### 1. Instalar dependências do projeto

```bash
npm install
```

### 2. Instalar dependências do sistema para Playwright

```bash
# Para Ubuntu/Debian
sudo apt-get install libglib2.0-0 libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 libxkbcommon0 libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2

# Para Fedora/RHEL
sudo dnf install glib2 nss nspr atk at-spi2-atk cups libdrm dbus libxkbcommon libX11 libXcomposite libXdamage libXext libXfixes libXrandr gbm pango cairo alsa-lib

# Para macOS
brew install playwright
```

### 3. Instalar browsers do Playwright

```bash
npx playwright install
```

### 4. Executar os testes

```bash
# Executar todos os testes
npm test

# Executar testes com interface UI
npm run test:ui

# Ver relatório de testes
npm run test:report
```

## Cobertura de Testes

Os testes cobrem os seguintes cenários:

1. **Carregamento da página** - Verifica se o chat carrega corretamente
2. **Envio de mensagens** - Testa envio por botão e por Enter
3. **Indicador de digitação** - Verifica se aparece durante resposta do bot
4. **Validação de entrada** - Não permite mensagens vazias
5. **Foco no input** - Mantém foco após enviar mensagem
6. **Elementos de UI** - Header, status online, botões
7. **Formatação de timestamp** - Verifica formato correto
8. **Scroll automático** - Para novas mensagens
9. **Diferenciação visual** - Mensagens do usuário vs bot

## Configuração

O arquivo `playwright.config.ts` contém a configuração dos testes, incluindo:
- Projetos para diferentes browsers (Chrome, Firefox, Safari)
- Configuração do servidor web para testes
- Opções de retry e paralelismo
- Relatório HTML
