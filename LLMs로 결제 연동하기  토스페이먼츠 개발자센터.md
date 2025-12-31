---
tags:
  - "source"
url: "https://docs.tosspayments.com/guides/v2/get-started/llms-guide"
created: 2025-12-31
status: false
---
**Version 2**

새로 나온

## LLMs 로 결제 연동하기

대규모 언어 모델(LLM)을 기반으로한 AI 개발 도구를 활용하여 토스페이먼츠 결제 연동 과정에 도움을 받을 수 있습니다. 이 가이드는 그런 LLM 도구들을 어떻게 활용할 수 있는지 알려줍니다.

## llms.txt

AI 도구와 에이전트가 토스페이먼츠의 결제 연동 정보에 쉽게 접근할 수 있도록, [/llms.txt](https://docs.tosspayments.com/llms.txt) 파일을 제공하고 있습니다. 이 파일은 LLM이 웹사이트 정보를 더 효과적으로 탐색할 수 있도록 돕는 새로운 표준 형식입니다.

토스페이먼츠 llms.txt 파일을 AI 도구의 프롬프트에 포함하여 질의하면 보다 정확한 답변을 기대할 수 있습니다.

토스페이먼츠 연동 가이드 문서의 llms.txt 주소는 [https://docs.tosspayments.com/llms.txt](https://docs.tosspayments.com/llms.txt) 입니다.

llms.txt 파일에 대해 자세히 알아보고 싶으시다면 [llmstxt.org](https://llmstxt.org/) 를 방문하세요.

## 토스페이먼츠 연동 MCP(Model Context Protocol) 서버 활용하기

Model Context Protocol (이하 'MCP' 는) 인공지능 모델(LLM)이 다양한 상황과 맥락을 잘 이해할 수 있도록 돕기 위해 [Anthropic](https://www.anthropic.com/) 사가 정의한 표준입니다. 해결하고자 하는 문제 상황에 적합한 MCP 서버를 활용하면 AI 가 보다 정확한 답변을 제공하는데 도움을 줄 수 있습니다.

토스페이먼츠를 연동 하기 위해 AI 개발 도구를 활용할 때 사용하는 LLM이 토스페이먼츠의 연동 스펙을 보다 더 잘 이해한다면 좋은 코드를 생성해낼 가능성이 높아집니다.

Cursor나 Windsurf와 같은 AI 기반의 코드 에디터나 VS Code, Claude Desktop 과 같은 도구를 사용하는 경우 아래 가이드를 참고하여 토스페이먼츠의 MCP 서버를 활용해보세요.

아래 JSON 설정을 추가하면, AI 도구가 MCP 서버와 연결되어 문서를 검색하거나 결제 연동 관련 질문을 이해할 수 있게 됩니다.

mcp.json

```
{

  "mcpServers": {

    "tosspayments-integration-guide": {

      "command": "npx",

      "args": ["-y", "@tosspayments/integration-guide-mcp@latest"]

    }

  }

}
```

### 토스페이먼츠 MCP 서버가 LLM 에 제공하는 도구(Tools) 목록

| 도구 | 설명 |
| --- | --- |
| get-v2-documents | LLM 모델이 토스페이먼츠 v2 문서들을 조회하기 위한 도구를 제공합니다. LLM 모델은 유저가 명시적으로 버전과 관련된 질의를 하지 않는다면 이 도구를 사용합니다. |
| get-v1-documents | LLM 모델이 토스페이먼츠 v1 문서들을 조회하기 위한 도구를 제공합니다. 명시적으로 유저가 버전1을 질의하는 경우 이 도구를 사용합니다. |
| document-by-id | LLM 모델이 문서의 원본 ID 로 해당 문서의 전체 내용을 조회하기 위한 도구를 제공합니다. |

## 토스페이먼츠 연동 MCP(Model Context Protocol) 서버 개발도구와 연결하기

### Cursor

[여기](https://anysphere.cursor-deeplink/mcp/install?name=tosspayments-integration-guide&config=eyJjb21tYW5kIjoibnB4IC15IEB0b3NzcGF5bWVudHMvaW50ZWdyYXRpb24tZ3VpZGUtbWNwQGxhdGVzdCJ9) 를 클릭하면 Cursor가 실행되고, 토스페이먼츠 MCP와 자동으로 연결됩니다. 또는 mcp.json의 내용을 다음 경로에 추가하세요. `~/.cursor/mcp.json`

자세한 설명은 [Cursor의 공식 가이드](https://docs.cursor.com/context/model-context-protocol) 를 참고해주세요.

### VS Code

[여기](https://vscode.dev/redirect?url=vscode:mcp/install?%7B%22name%22%3A%22tosspayments-integration-guide%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40tosspayments%2Fintegration-guide-mcp%40latest%22%5D%7D) 를 클릭하면 VS Code가 실행되고, 토스페이먼츠 MCP와 자동으로 연결됩니다. 또는 mcp.json의 내용을 다음 경로에 추가하세요. `.vscode/mcp.json`

자세한 설명은 [VS Code의 공식 가이드](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) 를 참고해주세요.

### Windsurf

mcp.json의 내용을 다음 경로에 추가하세요. `~/.codeium/windsurf/mcp_config.json`

자세한 설명은 [Windsurf의 공식 가이드](https://docs.windsurf.com/windsurf/cascade/mcp) 를 참고해주세요.

### Claude Desktop

mcp.json의 내용을 다음 경로에 추가하세요. `claude_desktop_config.json`

자세한 설명은 [가이드](https://modelcontextprotocol.io/quickstart/user) 를 참고해주세요.

## LLM에 질문하기

MCP 서버와 연결한 뒤에, 아래와 같은 질문에 대한 답을 채팅을 통해 얻을 수 있습니다. LLM이 답변한 내용이 이해가 되지 않거나, 잘못되어있는 경우 [토스페이먼츠 개발자 커뮤니티](https://techchat.tosspayments.com/) 를 통해 알려주세요.

### 코드 작성을 위한 프롬프트 예시

- "V2 SDK로 주문서 내에 결제위젯을 삽입하는 코드를 작성해줘"
- "결제 승인 요청하는 코드를 작성해줘"

## 토스페이먼츠 연동 MCP 서버에 대해 더 알아보기

토스페이먼츠 연동 MCP 서버의 구현 세부사항은 토스 기술블로그 (toss tech) 의 [토스페이먼츠 결제 시스템 연동을 돕는 MCP 서버 구현기](https://toss.tech/article/tosspayments-mcp) 를 통해서 확인하실 수 있습니다.