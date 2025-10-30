# FR-001 用户注册后端 API 需求文档

版本: 1.0
优先级: Critical
负责人: Backend Team

## 1. 问题描述

前端的 SignupField 组件已经完成，但缺少对应的后端注册 API，导致无法完成用户注册流程。目前 `backend/index.py` 只有基础的 `/api` 端点，缺少用户注册相关的端点、模型和数据库结构。

## 2. 当前状态

- 前端注册表单已就绪，等待后端连接
- 后端仅有基础的 `/api` 端点
- 缺少注册端点
- 缺少用户模型和数据库结构

## 3. 所需实现

### 3.1 用户模型（User）

```python
class User:
    id: str                                     # 唯一标识
    email: str                                  # 唯一，需验证格式
    username: str                               # 唯一，3-20字符
    password_hash: str                          # bcrypt/argon2哈希
    created_at: datetime                        # 创建时间
    updated_at: datetime                        # 更新时间
    email_verified: bool = False                # 邮箱验证状态
    verification_token: Optional[str]           # 验证token
    verification_token_expires: Optional[datetime] # token过期时间
```

### 3.2 注册端点

```
POST /api/auth/register

请求体：
{
    "username": "string",
    "email": "string",
    "password": "string"
}

响应体：
{
    "id": "string",
    "username": "string",
    "email": "string",
    "message": "Verification email sent"
}
```

### 3.3 验证要求

1. 邮箱格式（RFC 5322标准）
2. 邮箱唯一性
3. 用户名格式与唯一性
4. 密码复杂度（与前端验证一致）

### 3.4 安全要求

1. 密码哈希（使用 bcrypt 或 argon2）
2. 注册端点速率限制
3. 输入数据清理
4. 前端 CORS 配置

## 4. 受影响组件

1. `backend/index.py` - 需要添加认证路由
2. 数据库模式需要创建
3. 需要集成邮件服务

## 5. 相关文档

- 需求：FR-001（用户注册）
- 用例：UC-001
- 测试用例：TC-001 至 TC-005

## 6. 测试用例

### TC-001: 成功注册

- 输入：合法的用户名/邮箱/密码
- 预期：创建用户，发送验证邮件，返回 201

### TC-002: 邮箱无效

- 输入：格式错误的邮箱
- 预期：返回 400，不创建用户

### TC-003: 邮箱或用户名重复

- 输入：已存在的邮箱或用户名
- 预期：返回 409，不创建用户

### TC-004: 密码强度不足

- 输入：简单密码
- 预期：返回 400，包含密码要求说明

### TC-005: 访问频率限制

- 输入：短时间内多次注册请求
- 预期：返回 429，包含限制说明

## 7. 技术依赖

1. 数据库：PostgreSQL/MySQL
2. 邮件服务：SendGrid/AWS SES
3. 环境配置
4. Python 依赖：
   - FastAPI
   - SQLModel/SQLAlchemy
   - passlib[bcrypt]/argon2-cffi
   - python-email-validator
   - python-jose[cryptography]
   - redis（用于速率限制）

## 8. 环境变量需求

```bash
# 数据库配置
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# 邮件服务配置
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_key
# 或
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass

# 应用配置
SECRET_KEY=your_secret_key
FRONTEND_ORIGIN=http://localhost:5173
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_MINUTES=10
```

## 9. API 规范详细说明

### 成功响应 (201 Created)

```json
{
  "id": "user-uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "message": "Verification email sent"
}
```

### 错误响应

1. 验证错误 (400 Bad Request)

```json
{
  "error": "validation_error",
  "message": "Invalid email format",
  "field": "email"
}
```

2. 冲突 (409 Conflict)

```json
{
  "error": "conflict",
  "message": "Email already registered",
  "field": "email"
}
```

3. 速率限制 (429 Too Many Requests)

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many registration attempts",
  "retry_after": 600
}
```

## 10. 安全实现细节

1. 密码哈希配置

   ```python
   from passlib.hash import argon2
   password_hash = argon2.hash(password)
   ```

2. 验证 Token 生成

   ```python
   from secrets import token_urlsafe
   verification_token = token_urlsafe(32)
   ```

3. CORS 配置
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   origins = [os.getenv("FRONTEND_ORIGIN")]
   ```

## 11. 数据库迁移说明

使用 SQLModel/Alembic 进行数据库迁移：

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(64),
    verification_token_expires TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

## 优先级与时间线

- 优先级：Critical
- 阻塞：整个注册流程
- 建议实施时间：1-2 个工作日

## 后续工作

1. 实现邮箱验证端点
2. 集成密码重置功能
3. 添加 OAuth 集成
4. 实现会话管理

---

_文档生成时间：2025-10-19_
