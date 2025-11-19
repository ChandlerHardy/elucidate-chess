# Brave Search MCP Setup Instructions

## 🔧 Configure Your API Key

Edit your MCP configuration file:
```bash
# Open your MCP config
open ~/.mcp.json
```

Replace `YOUR_API_KEY_HERE` with your actual Brave API key:
```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": [
        "@mauricio.wolff/mcp-obsidian@latest",
        "/Users/chandlerhardy/Library/Mobile Documents/iCloud~md~obsidian/Documents/Chronicle"
      ]
    },
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "YOUR_ACTUAL_BRAVE_API_KEY_HERE"
      }
    }
  }
}
```

## 🚀 Get Your Brave API Key

1. Visit [Brave Search API](https://brave.com/search/api/)
2. Create a free account
3. Generate your API key
4. Copy the key and replace the placeholder above

## 💰 Pricing (as of 2025)

**Free Tier:**
- 2,000 searches per month
- Perfect for development and testing

**Paid Tier:**
- $5/month for 10,000 searches
- $0.0005 per additional search

## 🎯 Usage Benefits for Chess Development

With Brave Search MCP enabled, your agents can:

- **Research chess algorithms** without web search limitations
- **Find chess engine integration patterns** from online resources
- **Debug chess-specific issues** by searching community solutions
- **Discover chess UI/UX best practices** from existing implementations
- **Research chess performance optimization** techniques

## 🔄 After Setup

Once you've added your API key:

1. **Restart Claude Code** to load the new MCP server
2. **Test web search** by asking agents to research chess topics
3. **Verify functionality** by using the web-research-specialist agent

The Brave Search integration will make your web-research-specialist agent much more effective!