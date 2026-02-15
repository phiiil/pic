# AI Dashboard - Multi-Engine Comparison

A Next.js dashboard that sends prompts to multiple AI engines (OpenAI, Anthropic, and Google Gemini) asynchronously and displays results in real-time.

## Features

- 🚀 **Asynchronous Processing**: All three AI engines are queried in parallel
- ⚡ **Real-time Results**: Results appear as soon as each engine responds
- 🎨 **Modern UI**: Clean, responsive design with loading states
- 🛡️ **Error Handling**: Individual error handling per engine (one failure doesn't block others)
- 🔒 **Secure**: API keys stored in environment variables

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- API keys for:
  - [OpenAI](https://platform.openai.com/api-keys)
  - [Anthropic](https://console.anthropic.com/)
  - [Google Generative AI](https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd battery-maker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your API keys:
```
OPENAI_API_KEY=your_actual_openai_key
ANTHROPIC_API_KEY=your_actual_anthropic_key
GOOGLE_API_KEY=your_actual_google_key
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard.

## Usage

1. Enter your prompt in the input field
2. Click the "Submit" button
3. Watch as results from all three AI engines appear in real-time
4. Each engine's response is displayed in its own card with color-coded styling

## Project Structure

```
battery-maker/
├── app/
│   ├── api/
│   │   ├── openai/route.ts      # OpenAI API endpoint
│   │   ├── anthropic/route.ts   # Anthropic API endpoint
│   │   └── google/route.ts      # Google API endpoint
│   ├── components/
│   │   └── ResultCard.tsx       # Result display component
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main dashboard page
│   └── globals.css              # Global styles
├── .env.local.example           # Environment variables template
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |
| `GOOGLE_API_KEY` | Your Google Generative AI API key | Yes |

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OpenAI SDK** - OpenAI API integration
- **Anthropic SDK** - Anthropic API integration
- **Google Generative AI SDK** - Google Gemini API integration

## License

MIT

