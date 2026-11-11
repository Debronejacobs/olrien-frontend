aiclient2api  | �[Plugin Security] Trusted-plugin mode: administrator-approved plugins run with server privileges; no JavaScript sandbox is provided.
aiclient2api  | [2026-11-10 18:51:39.705] [INFO] ==================================================
aiclient2api  | [2026-11-10 18:51:39.706] [INFO] [Master] AIClient2API Master Process
aiclient2api  | [2026-11-10 18:51:39.706] [INFO] [Master] PID: 1
aiclient2api  | [2026-11-10 18:51:39.706] [INFO] [Master] Node version: v20.20.2
aiclient2api  | [2026-11-10 18:51:39.706] [INFO] [Master] Working directory: /app
aiclient2api  | [2026-11-10 18:51:39.706] [INFO] ==================================================
aiclient2api  | [2026-11-10 18:51:39.708] [INFO] [Master] Starting worker process...
aiclient2api  | [2026-11-10 18:51:39.708] [INFO] [Master] Worker script: /app/src/services/api-server.js
aiclient2api  | [2026-11-10 18:51:39.708] [INFO] [Master] Worker args: 
aiclient2api  | [2026-11-10 18:51:39.713] [INFO] [Master] Worker process started, PID: 24
aiclient2api  | [2026-11-10 18:51:39.714] [INFO] [Master] Management server listening on port 3100
aiclient2api  | [2026-11-10 18:51:39.714] [INFO] [Master] Available endpoints:
aiclient2api  | [2026-11-10 18:51:39.714] [INFO]   GET  /master/status  - Get master and worker status
aiclient2api  | [2026-11-10 18:51:39.714] [INFO]   GET  /master/health  - Health check
aiclient2api  | [2026-11-10 18:51:39.714] [INFO]   POST /master/restart - Restart worker process
aiclient2api  | [2026-11-10 18:51:39.714] [INFO]   POST /master/stop    - Stop worker process
aiclient2api  | [2026-11-10 18:51:39.714] [INFO]   POST /master/start   - Start worker process
aiclient2api  | �[Plugin Security] Trusted-plugin mode: administrator-approved plugins run with server privileges; no JavaScript sandbox is provided.
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: apimart
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: openai-custom
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: openaiResponses-custom
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: claude-custom
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: gemini-antigravity
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: claude-kiro-oauth
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: openai-codex-oauth
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: grok-cli-oauth
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: grok-web
aiclient2api  | [2026-11-10 18:51:40.137] [INFO] [Adapter] Registering adapter for provider: github-copilot
aiclient2api  | [2026-11-10 18:51:40.142] [INFO] [Config] configs/config.json not found, using default configuration.
aiclient2api  | [2026-11-10 18:51:40.146] [WARN] [System Prompt] Specified system prompt file not found: /app/configs/input_system_prompt.txt
aiclient2api  | �[2026-11-10 18:51:40.147] [ERROR] [Config Error] Failed to load provider pools from configs/provider_pools.json: ENOENT: no such file or directory, open 'configs/provider_pools.json'
aiclient2api  | [2026-11-10 18:51:40.507] [WARN] ============================================================
aiclient2api  | [2026-11-10 18:51:40.508] [WARN] [Auth] FIRST STARTUP: a random admin password was generated.
aiclient2api  | [2026-11-10 18:51:40.508] [WARN] [Auth] Save it now. It is only emitted during this initialization.
aiclient2api  | [2026-11-10 18:51:40.508] [WARN] [Auth] Initial admin password: hq-xy7QuVUWkqcv5ar2DEWBJt9LOhh7F
aiclient2api  | [2026-11-10 18:51:40.508] [WARN] ============================================================
aiclient2api  | [2026-11-10 18:51:40.509] [INFO] [Initialization] Discovering and initializing plugins...
aiclient2api  | [2026-11-10 18:51:40.512] [INFO] [PluginManager] Found plugin for default config: ai-monitor in /app/src/plugins
aiclient2api  | [2026-11-10 18:51:40.515] [INFO] [PluginManager] Found plugin for default config: api-potluck in /app/src/plugins
aiclient2api  | [2026-11-10 18:51:40.516] [INFO] [PluginManager] Found plugin for default config: default-auth in /app/src/plugins
aiclient2api  | [2026-11-10 18:51:40.518] [INFO] [PluginManager] Found plugin for default config: model-usage-stats in /app/src/plugins
aiclient2api  | [2026-11-10 18:51:40.521] [INFO] [PluginManager] Registered plugin: ai-monitor v1.0.0
aiclient2api  | [2026-11-10 18:51:40.521] [INFO] [PluginManager] Registered plugin: api-potluck v1.0.2
aiclient2api  | [2026-11-10 18:51:40.522] [INFO] [PluginManager] Registered plugin: default-auth v1.0.0
aiclient2api  | [2026-11-10 18:51:40.522] [INFO] [PluginManager] Registered plugin: model-usage-stats v1.0.0
aiclient2api  | [2026-11-10 18:51:40.522] [INFO] [PluginManager] Created user plugins directory: /app/src/plugins-user
aiclient2api  | [2026-11-10 18:51:40.523] [INFO] [PluginManager] Found plugin for default config: ai-monitor in /app/src/plugins
aiclient2api  | [2026-11-10 18:51:40.523] [INFO] [PluginManager] Found plugin for default config: api-potluck in /app/src/plugins
aiclient2api  | [2026-11-10 18:51:40.523] [INFO] [PluginManager] Found plugin for default config: default-auth in /app/src/plugins
aiclient2api  | [2026-11-10 18:51:40.523] [INFO] [PluginManager] Found plugin for default config: model-usage-stats in /app/src/plugins
aiclient2api  | [2026-11-10 18:51:40.525] [INFO] [PluginManager] Plugin "ai-monitor" is disabled, skipping init
aiclient2api  | [2026-11-10 18:51:40.525] [INFO] [PluginManager] Plugin "api-potluck" is disabled, skipping init
aiclient2api  | [2026-11-10 18:51:40.525] [INFO] [PluginManager] Plugin "model-usage-stats" is disabled, skipping init
aiclient2api  | [2026-11-10 18:51:40.526] [INFO] [Plugins] Loaded 4 plugin(s):
aiclient2api  | �[2026-11-10 18:51:40.526] [INFO]   ✗ ai-monitor v1.0.0 - AI 接口监控插件 - 捕获请求和响应参数（全链路协议转换监控，流式聚合输出，用于调试和分析）
aiclient2api  | [2026-11-10 18:51:40.526] [INFO]   ✗ api-potluck v1.0.2 - API 大锅饭 - Key 管理和用量统计插件<br>管理端：<a href="potluck.html" target="_blank">potluck.html</a><br>用户端：<a href="potluck-user.html" target="_blank">potluck-user.html</a>
aiclient2api  | Y[2026-11-10 18:51:40.526] [INFO]   ✓ default-auth v1.0.0 - 默认 API Key 认证插件
aiclient2api  | �[2026-11-10 18:51:40.526] [INFO]   ✗ model-usage-stats v1.0.0 - 模型用量统计插件<br>接口：<code>/api/model-usage-stats</code><br>页面：<a href="model-usage-stats.html" target="_blank">model-usage-stats.html</a>
aiclient2api  | [2026-11-10 18:51:40.526] [INFO] [ProviderPoolManager] Initialized provider statuses: ok (maxErrorCount: 10)
aiclient2api  | [2026-11-10 18:51:40.526] [INFO] [Initialization] ProviderPoolManager initialized.
aiclient2api  | [2026-11-10 18:51:40.526] [INFO] [Initialization] Provider pools are currently empty.
aiclient2api  | [2026-11-10 18:51:40.526] [INFO] [Initialization] No provider pools configured. Skipping node initialization.
aiclient2api  | [2026-11-10 18:51:40.528] [INFO] --- Unified API Server Configuration ---
aiclient2api  | [2026-11-10 18:51:40.529] [INFO]   Primary Model Provider: gemini-cli-oauth
aiclient2api  | [2026-11-10 18:51:40.529] [INFO]   System Prompt File: /app/configs/input_system_prompt.txt
aiclient2api  | [2026-11-10 18:51:40.529] [INFO]   System Prompt Mode: append
aiclient2api  | [2026-11-10 18:51:40.529] [INFO]   Host: 0.0.0.0
aiclient2api  | [2026-11-10 18:51:40.529] [INFO]   Port: 3000
aiclient2api  | [2026-11-10 18:51:40.529] [INFO]   Required API Key: 1234****
aiclient2api  | [2026-11-10 18:51:40.529] [INFO]   Prompt Logging: none
aiclient2api  | [2026-11-10 18:51:40.529] [INFO] ------------------------------------------
aiclient2api  | [2026-11-10 18:51:40.529] [INFO] 
aiclient2api  | Unified API Server running on http://0.0.0.0:3000
aiclient2api  | [2026-11-10 18:51:40.529] [INFO] Supports multiple API formats:
aiclient2api  | j[2026-11-10 18:51:40.529] [INFO]   • OpenAI-compatible: /v1/chat/completions, /v1/responses, /v1/models
aiclient2api  | q[2026-11-10 18:51:40.529] [INFO]   • Gemini-compatible: /v1beta/models, /v1beta/models/{model}:generateContent
aiclient2api  | G[2026-11-10 18:51:40.529] [INFO]   • Claude-compatible: /v1/messages
aiclient2api  | =[2026-11-10 18:51:40.530] [INFO]   • Health check: /health
aiclient2api  | S[2026-11-10 18:51:40.530] [INFO]   • UI Management Console: http://0.0.0.0:3000/
aiclient2api  | [2026-11-10 18:51:40.530] [INFO] [Initialization] Performing initial health checks for provider pools...
aiclient2api  | [2026-11-10 18:51:40.531] [INFO] [Master] Received message from worker: {
aiclient2api  |   "type": "ready",
aiclient2api  |   "pid": 24
aiclient2api  | }
aiclient2api  | [2026-11-10 18:51:40.531] [INFO] [Master] Worker is ready
aiclient2api  | [2026-11-10 18:51:43.538] [INFO] [UI] Opened login page in default browser
aiclient2api  | �[2026-11-10 18:51:45.973] [Req:10.89.1.3:f9f43262] [INFO] [Server] Received request: GET http://localhost:3000/_next/webpack-hmr?id=sbyard02-TOqmzpfmXsyy
aiclient2api  | [2026-11-10 18:51:45.974] [Req:10.89.1.3:f9f43262] [INFO] [Config] Ignoring invalid MODEL_PROVIDER in path segment: _next
aiclient2api  | �[2026-11-10 18:51:45.977] [Req:10.89.1.3:f9f43262] [INFO] [Default Auth] Unauthorized request. Headers: Authorization=N/A, x-api-key=N/A, x-goog-api-key=N/A
aiclient2api  | [2026-11-10 18:51:45.980] [Req:10.89.1.3:f9f43262] [ERROR] 
aiclient2api  | [Server] Request failed (401): Unauthorized: API key is invalid or missing.
aiclient2api  | [2026-11-10 18:51:45.980] [Req:10.89.1.3:f9f43262] [ERROR] [Server] Suggestions:
aiclient2api  | [2026-11-10 18:51:45.981] [Req:10.89.1.3:f9f43262] [ERROR]   1. Verify your OAuth credentials are valid
aiclient2api  | [2026-11-10 18:51:45.981] [Req:10.89.1.3:f9f43262] [ERROR]   2. Try re-authenticating by deleting the credentials file
aiclient2api  | �[2026-11-10 18:51:45.981] [Req:10.89.1.3:f9f43262] [ERROR]   3. Check if your Google Cloud project has the necessary permissions
aiclient2api  | [2026-11-10 18:51:45.981] [Req:10.89.1.3:f9f43262] [ERROR] [Server] Full error details: undefined
aiclient2api  | [2026-11-10 18:52:10.660] [Req:127.0.0.1:0029831f] [INFO] [Server] Received request: GET http://localhost:3000/health
aiclient2api  | [2026-11-10 18:52:41.636] [Req:127.0.0.1:0196eedc] [INFO] [Server] Received request: GET http://localhost:3000/health
aiclient2api  | [2026-11-10 18:53:12.621] [Req:127.0.0.1:1ffb4034] [INFO] [Server] Received request: GET http://localhost:3000/health
aiclient2api  | [2026-11-10 18:53:43.168] [Req:127.0.0.1:580c7345] [INFO] [Server] Received request: GET http://localhost:3000/health