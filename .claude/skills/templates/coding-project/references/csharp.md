# C# Project Guide

## Contents

- Project Structure
- Configuration
- Build & Run
- Best Practices
- Common Patterns

## Project Structure

### Console Application

```
project/
├── src/
│   ├── Program.cs
│   ├── Models/
│   └── Services/
├── tests/
│   └── ProjectName.Tests/
├── ProjectName.csproj
├── ProjectName.sln
├── .gitignore
└── README.md
```

### Class Library

```
project/
├── src/
│   └── ProjectName/
│       ├── ProjectName.csproj
│       └── Class1.cs
├── tests/
│   └── ProjectName.Tests/
│       ├── ProjectName.Tests.csproj
│       └── UnitTest1.cs
├── ProjectName.sln
└── README.md
```

## Configuration

### .csproj (Console App)

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

</Project>
```

### .csproj (Class Library)

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

</Project>
```

### .csproj (Test Project)

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="xunit" Version="2.6.2" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.4" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\ProjectName\ProjectName.csproj" />
  </ItemGroup>

</Project>
```

## Build & Run

```bash
# Create new project
dotnet new console -n ProjectName
dotnet new classlib -n ProjectName
dotnet new xunit -n ProjectName.Tests

# Create solution
dotnet new sln -n ProjectName
dotnet sln add src/ProjectName/ProjectName.csproj
dotnet sln add tests/ProjectName.Tests/ProjectName.Tests.csproj

# Build
dotnet build

# Run
dotnet run --project src/ProjectName

# Test
dotnet test

# Publish
dotnet publish -c Release
```

## Best Practices

1. **Nullable reference types**: Always enable `<Nullable>enable</Nullable>`
2. **Top-level statements**: Use for simple console apps
3. **Dependency Injection**: Use Microsoft.Extensions.DependencyInjection
4. **Async/Await**: Prefer async methods for I/O operations

## Common Patterns

### Result Pattern

```csharp
public record Result<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }

    public static Result<T> Ok(T data) =>
        new() { Success = true, Data = data };

    public static Result<T> Fail(string error) =>
        new() { Success = false, Error = error };
}
```

### Dependency Injection

```csharp
public interface ILogger
{
    void Log(string message);
}

public class Service
{
    private readonly ILogger _logger;

    public Service(ILogger logger)
    {
        _logger = logger;
    }

    public void Execute()
    {
        _logger.Log("Executing...");
    }
}

// Registration
var services = new ServiceCollection();
services.AddSingleton<ILogger, ConsoleLogger>();
services.AddTransient<Service>();
var provider = services.BuildServiceProvider();
```

### Minimal API (ASP.NET Core)

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");
app.MapGet("/users/{id}", (int id) => $"User {id}");

app.Run();
```

### Entity Framework Core

```csharp
public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite("Data Source=app.db");
}

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
}
```
