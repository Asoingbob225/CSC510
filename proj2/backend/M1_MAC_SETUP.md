# M1 Mac (Apple Silicon) 开发环境配置指南

## 问题背景

M1 Mac 使用 ARM64 架构，而某些 Python 包可能默认安装 x86_64 版本，导致运行时出现以下错误：

```
ImportError: dlopen(.../_pydantic_core.cpython-39-darwin.so, 0x0002): 
mach-o file, but is an incompatible architecture (have 'x86_64', need 'arm64e' or 'arm64')
```

## 解决方案

### 方法1：使用 arch -arm64 命令（推荐）

这是最可靠的方法，确保所有依赖都安装为 ARM64 架构。

#### 1. 清理现有虚拟环境

```bash
cd /path/to/project/backend
rm -rf .venv
```

#### 2. 使用 arch -arm64 安装依赖

```bash
arch -arm64 /Users/joezhou/.local/bin/uv sync
```

#### 3. 验证架构

```bash
# 检查关键包的架构
file .venv/lib/python3.9/site-packages/pydantic_core/_pydantic_core.cpython-39-darwin.so

# 应该输出：Mach-O 64-bit dynamically linked shared library arm64
```

#### 4. 直接使用虚拟环境中的 Python

**推荐方式**：直接使用 `.venv/bin/python`，而不是 `uv run`

```bash
# ✅ 正确：直接使用虚拟环境的 Python
.venv/bin/python -m pytest tests/

# ✅ 正确：直接使用虚拟环境的工具
.venv/bin/python -m alembic upgrade head

# ❌ 错误：uv run 可能重新安装 x86_64 包
arch -arm64 /Users/joezhou/.local/bin/uv run pytest tests/
```

### 方法2：使用 ARCHFLAGS 环境变量

适用于某些特定的编译场景：

```bash
ARCHFLAGS="-arch arm64" /Users/joezhou/.local/bin/uv sync
```

**注意**：这个方法对于预编译的二进制包（如 pydantic_core）可能不够可靠。

## 常用命令清单

### 虚拟环境管理

```bash
# 删除并重建虚拟环境（ARM64）
rm -rf .venv && arch -arm64 /Users/joezhou/.local/bin/uv sync
```

### 测试运行

```bash
# 运行所有测试
.venv/bin/python -m pytest tests/ -v

# 运行特定测试文件
.venv/bin/python -m pytest tests/test_goal_service.py -v

# 运行测试并生成覆盖率报告
.venv/bin/python -m pytest tests/ --cov=src/eatsential --cov-report=term-missing -v

# 运行测试并生成 HTML 覆盖率报告
.venv/bin/python -m pytest tests/ --cov=src/eatsential --cov-report=html -v
```

### 数据库迁移

```bash
# 生成迁移
.venv/bin/python -m alembic revision --autogenerate -m "migration message"

# 应用迁移
.venv/bin/python -m alembic upgrade head

# 查看迁移历史
.venv/bin/python -m alembic history
```

### 代码质量检查

```bash
# 运行 ruff 格式化
.venv/bin/python -m ruff format src/ tests/

# 运行 ruff lint
.venv/bin/python -m ruff check src/ tests/ --fix
```

### 开发服务器

```bash
# 启动开发服务器
.venv/bin/python -m uvicorn src.eatsential.index:app --reload --port 8000
```

## 故障排查

### 问题：仍然出现架构错误

**原因**：可能使用了 `uv run`，它会重新安装依赖

**解决**：始终直接使用 `.venv/bin/python`

### 问题：某个包无法安装

**原因**：该包可能没有 ARM64 预编译版本

**解决方案**：
1. 查找 ARM64 兼容的替代包
2. 使用 Rosetta 2 运行整个项目（不推荐）
3. 等待包维护者发布 ARM64 版本

### 问题：虚拟环境损坏

**解决**：删除并重建

```bash
rm -rf .venv
arch -arm64 /Users/joezhou/.local/bin/uv sync
```

## 最佳实践

1. ✅ **始终使用 `arch -arm64` 创建虚拟环境**
2. ✅ **直接使用 `.venv/bin/python` 运行命令**
3. ✅ **避免使用 `uv run`**（它可能重新安装包）
4. ✅ **在项目文档中记录 M1 特定要求**
5. ✅ **验证关键二进制包的架构**

## 项目配置文件

可以在项目根目录创建 `Makefile` 来简化命令：

```makefile
# Makefile
.PHONY: test install migrate lint format

# 安装依赖（ARM64）
install:
	rm -rf .venv
	arch -arm64 /Users/joezhou/.local/bin/uv sync

# 运行测试
test:
	.venv/bin/python -m pytest tests/ -v

# 运行测试并生成覆盖率
test-cov:
	.venv/bin/python -m pytest tests/ --cov=src/eatsential --cov-report=term-missing --cov-report=html -v

# 运行数据库迁移
migrate:
	.venv/bin/python -m alembic upgrade head

# 代码格式化
format:
	.venv/bin/python -m ruff format src/ tests/

# 代码检查
lint:
	.venv/bin/python -m ruff check src/ tests/

# 启动开发服务器
dev:
	.venv/bin/python -m uvicorn src.eatsential.index:app --reload --port 8000
```

使用方式：

```bash
make install    # 安装依赖
make test       # 运行测试
make test-cov   # 测试+覆盖率
make dev        # 启动服务器
```

## 参考资料

- [Python on Apple Silicon](https://developer.apple.com/documentation/apple-silicon/about-the-rosetta-translation-environment)
- [uv Documentation](https://github.com/astral-sh/uv)
- [pydantic Installation](https://docs.pydantic.dev/latest/install/)

---

**最后更新**: 2025-10-26  
**适用版本**: Python 3.9.6, macOS (Apple Silicon)
