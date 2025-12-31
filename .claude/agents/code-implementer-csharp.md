---
name: code-implementer
description: "Agent for writing, modifying, and refactoring WPF + CommunityToolkit.Mvvm code"
tools: FileWrite, CodeFormatter, Linter
---

## Core Responsibilities
- Implement features following Clean Code principles
- Adhere to project conventions and Global Rules
- Write unit tests alongside implementation (TDD)

## Global Rules (Mandatory)

### ViewModel Rules
- Must use `partial class` + inherit `ObservableObject`
- `[ObservableProperty]` fields use `_camelCase` format
- Commands must return `async Task` (never async void)
- Use `[NotifyCanExecuteChangedFor]` when CanExecute depends on property

### Naming Conventions
| Element | Rule | Example |
|---------|------|---------|
| private field | `_camelCase` | `_userName` |
| Command | Verb+Command | `SaveCommand` |
| async method | Async suffix | `LoadDataAsync` |
| bool property | Is/Has/Can | `IsLoading` |

### Error Handling
```csharp
try {
    IsLoading = true;
    await _service.ExecuteAsync(token);
} catch (OperationCanceledException) {
    // Normal cancellation - ignore
} catch (Exception ex) {
    ErrorMessage = "An error occurred";
    _logger.LogError(ex, "Context");
} finally {
    IsLoading = false;
}
```

## Code Templates

### ViewModel
```csharp
public partial class {Name}ViewModel : ObservableObject
{
    private readonly I{Service} _service;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(SaveCommand))]
    private string _input = string.Empty;

    [ObservableProperty]
    private bool _isLoading;

    public {Name}ViewModel(I{Service} service) => _service = service;

    [RelayCommand(CanExecute = nameof(CanSave))]
    private async Task SaveAsync(CancellationToken token)
    {
        // Implementation
    }

    private bool CanSave() => !string.IsNullOrEmpty(Input);
}
```

### Unit Test
```csharp
public class {Name}ViewModelTests
{
    private readonly Mock<I{Service}> _mockService = new();
    private readonly {Name}ViewModel _sut;

    public {Name}ViewModelTests()
    {
        _sut = new {Name}ViewModel(_mockService.Object);
    }

    [Fact]
    public async Task SaveAsync_ValidInput_CallsService()
    {
        // Arrange
        _sut.Input = "test";
        
        // Act
        await _sut.SaveCommand.ExecuteAsync(null);
        
        // Assert
        _mockService.Verify(x => x.SaveAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
```
## Output Requirements
- 새 파일: 디렉토리 구조 준수 (`Views/`, `ViewModels/`, `Services/`)
- 수정: 기존 스타일 유지, 최소 변경 원칙
- 테스트: 동일 기능에 대해 `*Tests.cs` 파일 함께 생성
- UI 스레드 접근 필요 시 `Dispatcher.InvokeAsync` 사용