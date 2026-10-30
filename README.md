# 🌐 AutoWeb

AutoWeb is an open-source AI web automation tool that runs in your browser. It's a free
alternative to hosted "computer use" agents, with flexible LLM options and a multi-agent system.

AutoWeb's multi-agent system can analyze a page in real time, with the Planner intelligently
self-correcting when it hits obstacles and dynamically instructing the Navigator to adjust its
approach — all running locally in your browser.

## 🔥 Why AutoWeb?

Looking for a powerful AI browser agent without a per-seat subscription? **AutoWeb**, as a Chrome
extension, delivers web automation capabilities while keeping you in complete control:

- **100% Free** - No subscription fees or hidden costs. Install it and use your own API keys; you
  only pay for what you use.
- **Privacy-Focused** - Everything runs in your local browser. Your credentials stay with you and
  are never shared with any cloud service other than the LLM provider you choose.
- **Flexible LLM Options** - Connect to your preferred LLM providers, including Google Gemini,
  OpenAI, Anthropic, and more, with the freedom to choose different models for different agents.
- **Fully Open Source** - Complete transparency in how your browser is automated. No black boxes
  or hidden processes.

> **Note:** AutoWeb currently supports OpenAI, Anthropic, Gemini, DeepSeek, Grok, Ollama, Groq,
> Cerebras, Llama, Azure OpenAI, OpenRouter, and custom OpenAI-compatible providers.

## 📊 Key Features

- **Multi-agent System**: Specialized AI agents collaborate to accomplish complex web workflows
- **Interactive Side Panel**: Intuitive chat interface with real-time status updates
- **Task Automation**: Seamlessly automate repetitive web automation tasks across websites
- **Follow-up Questions**: Ask contextual follow-up questions about completed tasks
- **Conversation History**: Easily access and manage your AI agent interaction history
- **Multiple LLM Support**: Connect your preferred LLM providers and assign different models to
  different agents

## 🌐 Browser Support

**Officially Supported:**
- **Chrome** - Full support with all features
- **Edge** - Full support with all features

**Not Officially Supported:**
- Firefox, Safari, and other Chromium variants (Opera, Arc, etc.)

> **Note**: While AutoWeb may function on other Chromium-based browsers, we recommend using Chrome
> or Edge for the best experience and guaranteed compatibility.

## 📁 Repository Layout

- `chrome-extension/` — Manifest, background service worker, browser automation, and agent logic
- `pages/side-panel/` — Main chat interface
- `pages/options/` — Extension settings
- `pages/content/` — Content script injected into web pages
- `packages/` — Shared UI, storage, schemas, localization, and build utilities

## 🛠️ Build From Source

AutoWeb is not currently distributed through a public app store or repository — build it from
this source and load it as an unpacked extension:

1. **Prerequisites**:
   - [Node.js](https://nodejs.org/) (v22.12.0 or higher)
   - [pnpm](https://pnpm.io/installation) (v9.15.1 or higher)

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Build the Extension**:
   ```bash
   pnpm build
   ```

4. **Load the Extension**:
   - The built extension will be in the `dist` directory
   - Open `chrome://extensions/` in Chrome
   - Enable `Developer mode` (top right)
   - Click `Load unpacked` (top left)
   - Select the `dist` folder

5. **Configure Agent Models**:
   - Click the AutoWeb icon in your toolbar to open the sidebar
   - Click the `Settings` icon (top right)
   - Add your LLM API key(s) — for example, a Google Gemini API key
   - Choose which model to use for each agent (Navigator, Planner)

6. **Development Mode** (optional):
   ```bash
   pnpm dev
   ```

## 🤖 Choosing Your Models

AutoWeb allows you to configure different LLM models for each agent to balance performance and
cost. Here are recommended configurations:

### Google Gemini
- **Planner**: `gemini-3.8-flash` or `gemini-3.1-pro-preview` for tougher reasoning
- **Navigator**: `gemini-3.1-flash-lite` for the best free-tier headroom, or `gemini-3.8-flash` for stronger navigation quality
- `gemini-3.1-flash-lite` has a far more generous free-tier daily quota than `gemini-3.8-flash`, so it's the default if you're hitting rate limits on the free tier. Get an API key from Google AI Studio and paste it into Settings → Models.

### Better Performance (Anthropic / OpenAI)
- **Planner**: A frontier reasoning model (e.g. a Claude Sonnet or GPT-5 class model)
  - Better reasoning and planning capabilities
- **Navigator**: A fast, efficient model (e.g. a Claude Haiku or GPT-4.1-mini class model)
  - Efficient for web navigation tasks
  - Good balance of performance and cost

### Local Models
- **Setup Options**:
  - Use Ollama or other custom OpenAI-compatible providers to run models locally
  - Zero API costs and complete privacy with no data leaving your machine
- **Prompt Engineering**:
  - Local models require more specific and cleaner prompts
  - Avoid high-level, ambiguous commands
  - Break complex tasks into clear, detailed steps
  - Provide explicit context and constraints

> **Note**: Smaller/cheaper models may produce less stable outputs and require more iterations for
> complex tasks.

## 💡 See It In Action

Here are some tasks you can accomplish with just a sentence:

1. **News Summary**:
   > "Go to a major news homepage and extract the top 10 headlines from the last 24 hours"

2. **Research**:
   > "Look for the trending open-source Python repositories with the most stars this week"

3. **Shopping Research**:
   > "Find a portable Bluetooth speaker on Amazon with a water-resistant design, under $50. It
   > should have a minimum battery life of 10 hours"

## 🤝 Contributing

Contributions of all kinds are welcome. Check out [CONTRIBUTING.md](CONTRIBUTING.md) for
guidelines on how to contribute code to the project.

## 🔒 Security

If you discover a security vulnerability, please see [SECURITY.md](SECURITY.md) for how to report
it responsibly rather than disclosing it publicly.

## 👏 Acknowledgments

AutoWeb builds on top of other open-source technology, including Chromium extension tooling,
LangChain, and the broader Node.js/TypeScript ecosystem. Huge thanks to those communities.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for
details.

## ⚠️ Disclaimer on Derivative Projects

We explicitly do **not** endorse, support, or participate in any projects involving
cryptocurrencies, tokens, NFTs, or other blockchain-related applications based on this codebase.

Any such derivative projects are not affiliated with, maintained by, or in any way connected to
the AutoWeb project or its maintainers. We assume no liability for any losses, damages, or issues
arising from the use of third-party derivative projects. We encourage open-source innovation but
urge users to be discerning and cautious before using software built on this codebase by
independent developers.
