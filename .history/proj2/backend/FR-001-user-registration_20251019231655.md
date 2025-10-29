# FR-001 - 用户注册后端需求文档

版本: 1.0
优先级: Critical
负责人: backend team

## 目标
实现一个可靠、安全且可验证的用户注册后端 API，以满足前端 SignupField 组件的注册流程（Requirement: FR-001）。该功能必须提供用户数据模型、注册接口、验证规则、邮件验证流程、数据库迁移示例和测试用例映射（TC-001..TC-005）。

## 范围
- 新增用户模型（持久化）
- 实现 POST /api/auth/register 注册接口
- 输入验证（邮箱、用户名、密码复杂度）
- 邮件验证（verification token）发送与存储
- 基本速率限制、防刷机制
- CORS 配置以允许前端访问

不在本项范围：第三方 OAuth 登录、社交登录、复杂的多因素认证（MFA）

## 非功能性要求
- 安全：密码必须以 bcrypt 或 argon2 散列后存储
- 可用性：在高并发下不泄漏用户存在/不存在的信息
- 可测试性：提供可自动化的单元/集成测试用例
- 可运维性：详细环境变量与部署说明

## 交付物
- 文档（本文件）
- 数据库迁移 SQL（PostgreSQL 示例）
- 后端实现（路由、模型、验证、邮件发送）
- 单元/集成测试（TC-001..TC-005）

## 数据模型（User）
说明：建议使用 PostgreSQL + SQLAlchemy / Alembic 或者使用项目当前 ORM/迁移工具。

字段（推荐实现）：
- id: UUID, 主键, 非空
- email: string, 唯一, 按 RFC 5322 验证, 非空
- username: string, 唯一, 3-20 字符, 只允许字母、数字、下划线
- password_hash: string, 非空（使用 bcrypt/argon2 散列）
- created_at: timestamp with time zone, 默认 now()
- updated_at: timestamp with time zone, 自动更新
- email_verified: boolean, 默认 false
- verification_token: string, 可选（对 token 建议存储哈希值以防泄露）
- verification_token_expires: timestamp with time zone, 可选

示例 JSON（响应）：
{
  "id": "uuid-string",
  "username": "alice",
  "email": "alice@example.com",
  "message": "Verification email sent"
}

### PostgreSQL DDL 示例

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(320) NOT NULL UNIQUE,
  username VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

备注：RFC 5322 中邮箱最大长度通常限制为 254 字符，数据库字段建议 320 以兼容性为先。

## API 规范 - 注册

POST /api/auth/register

请求体 (application/json)：
- username: string (3-20 chars, regex: ^[A-Za-z0-9_]{3,20}$)
- email: string (RFC 5322 合法)
- password: string (须满足密码复杂度)

成功响应 (201 Created)：
- body:
  {
    "id": "string",
    "username": "string",
    "email": "string",
    "message": "Verification email sent"
  }

错误响应示例：
- 400 Bad Request - 输入校验失败
  { "error": "invalid_input", "message": "Password must be at least 8 characters" }
- 409 Conflict - 账号冲突（邮箱或用户名已存在）
  { "error": "conflict", "field": "email", "message": "Email already registered" }
- 429 Too Many Requests - 速率限制触发
  { "error": "rate_limited", "message": "Too many registration attempts, try later" }
- 500 Internal Server Error - 未知错误

安全说明：在响应中避免回显原始密码或敏感 token。对外返回的信息尽量模糊，以免暴露已注册用户的存在（可根据业务决定是否统一返回相同消息以防枚举）。

## 验证规则（详细）

邮箱：
- 使用成熟库校验 RFC 5322（例如 python 的 email-validator）
- 在 DB 上创建唯一索引，写入前做查询+事务/唯一约束处理并捕获冲突异常

用户名：
- 正则：^[A-Za-z0-9_]{3,20}$
- 唯一索引

密码复杂度（建议，与前端保持一致）：
- 最小长度：8
- 必须包含：大写字母、小写字母、数字
- 推荐至少一个特殊字符 (!@#$%^&*()_+-=)
- 禁止常见弱密码（可选：使用有弱口令黑名单或 zxcvbn 库）

其他：
- 所有输入在入库前执行严格校验并清理（去除不可见字符等）
- 限制字段长度，防止超长输入导致 DoS

## 邮件验证流程

1. 用户提交注册请求 -> 后端验证输入合法性
2. 创建用户记录：password_hash，email_verified=false
3. 生成随机 verification token（推荐使用安全随机 32+ 字节，然后 base64/urlsafe 或 hex 编码）
   - 推荐做法：只在邮件中发送 token，数据库存储 token 的哈希值（例如使用 HMAC 或 bcrypt），防止 DB 泄露导致可用 token
4. 设置 verification_token_expires（例如 24 小时后）
5. 通过邮件服务发送一封包含验证链接的邮件：
   - 链接示例：https://frontend.example.com/verify?token=<token>&uid=<id>
6. 返回 201 给客户端并给出通用消息“Verification email sent”
7. 提供验证端点（GET /api/auth/verify?token=... 或 POST）来完成邮箱验证

邮件内容需包含简单的说明、过期时间、如果非本人操作则忽略链接的说明和客服联系方式。

## 邮件服务集成

推荐服务：SendGrid、AWS SES（Simple Email Service）。可先使用 SMTP 测试或本地邮件捕获用于开发。

环境变量示例：
- EMAIL_PROVIDER=sendgrid
- SENDGRID_API_KEY=...
- SMTP_HOST=...
- SMTP_PORT=587
- SMTP_USER=...
- SMTP_PASSWORD=...
- EMAIL_FROM=\"YourApp <no-reply@yourdomain.com>\"

建议实现：
- 发送异步化（任务队列如 Celery / RQ / BackgroundTasks）
- 失败重试策略（指数退避）
- 记录邮件事件以便排查

## 速率限制和反滥用

要求：对注册接口进行速率限制，既防止同一 IP 或同一邮箱短时间内大量请求。

建议策略：
- 每 IP：如 10 requests / 10 minutes
- 每邮箱/用户名：如 3 attempts / hour

实现方案：
- 使用 Redis + 限流中间件（Flask-Limiter、slowapi for FastAPI）、或云厂商的 WAF 限流
- 在触发频率限制时返回 429

## CORS 与前端集成

- 允许来自前端应用的源（ENV: FRONTEND_ORIGIN），例如 https://localhost:5173 或生产域名
- 允许的方法：POST, GET, OPTIONS
- 允许头：Content-Type, Authorization, X-Requested-With

## 日志与审计

- 记录关键事件：注册尝试（成功/失败），发送邮件，验证成功/失败，速率限制触发
- 日志中不要包含敏感信息（密码、完整 token）。若记录 token，仅记录哈希或部分掩码

## 环境变量清单

- DATABASE_URL (例如 postgres://...)
- FRONTEND_ORIGIN (允许的 CORS 源)
- SECRET_KEY / APP_SECRET（用于生成 HMAC 等）
- EMAIL_PROVIDER (sendgrid|ses|smtp)
- SENDGRID_API_KEY 或 SMTP_*
- RATE_LIMIT_CONFIG（可选，或在配置文件中）
- TOKEN_EXPIRATION_HOURS (默认 24)

## 数据库迁移说明

- 使用 Alembic 或项目现有迁移工具创建 users 表（参考上文 DDL）
- 在迁移中增加 UNIQUE CONSTRAINTS 与必要索引
- 确保在高并发注册场景下捕获唯一约束冲突并返回 409

## 测试用例 & 验收标准（对应 TC-001..TC-005）

TC-001: 成功注册
- 输入：合法的 username/email/password
- 期望：返回 201, body 包含 id/username/email/message, 数据库中新建用户记录，email_verified=false，发送邮件任务被触发

TC-002: 邮箱格式无效
- 输入：邮箱不符合 RFC 的字符串
- 期望：返回 400, error invalid_input（详细 message），不创建用户，不发送邮件

TC-003: 邮箱或用户名已存在
- 输入：已被注册的 email 或 username
- 期望：返回 409, error conflict, 指示字段（email 或 username）

TC-004: 密码不满足复杂度
- 输入：弱密码（例如 "password"）
- 期望：返回 400, error invalid_input，包含密码复杂度提示

TC-005: 速率限制
- 输入：短时间多次重复提交注册（超过阈值）
- 期望：返回 429, error rate_limited

验收通过条件：以上 5 个测试均通过且自动化（单元或集成测试）可在 CI 中运行。

## 错误码与响应规范（建议）

- invalid_input (400)
- conflict (409)
- rate_limited (429)
- server_error (500)

响应格式统一：
{
  "error": "<error_code>",
  "message": "<human readable message>",
  "field": "<optional field name>"
}

## 实现建议（技术栈 & 第三方库）

项目当前为 Python（存在 backend/index.py），推荐方案：FastAPI + SQLAlchemy/Databases + Alembic。若项目已用 Flask，则按 Flask 实现也可。

建议库（Python）：
- FastAPI 或 Flask
- SQLAlchemy (ORM)
- Alembic (迁移)
- passlib 或 argon2-cffi/bcrypt（用于密码哈希）
- email-validator（邮箱校验）
- python-dotenv（管理环境变量）
- sendgrid 或 boto3 (SES) 或 aiosmtplib
- redis + slowapi / flask-limiter（速率限制）

示例依赖（pyproject/requirements）：
- fastapi
- uvicorn
- sqlalchemy
- alembic
- passlib[bcrypt] 或 argon2-cffi
- email-validator
- python-dotenv
- sendgrid
- redis
- slowapi

## 安全实现要点

- 使用 argon2id 优先（若不可用可用 bcrypt），并把参数（内存/迭代）设置为安全级别
- verification token 建议存储哈希并在验证时比对哈希
- 防止枚举：在注册接口返回通用消息并通过邮件告诉用户下一步；在冲突时可考虑明确告知字段但这可能泄露信息，根据安全政策选择
- 对关键失败路径（DB、邮件）进行重试与告警

## 开发任务清单（建议）
1. 添加 users 表的迁移（参考 DDL）
2. 在 `backend/index.py` 中新增 auth 路由模块（/api/auth/register、/api/auth/verify）
3. 实现输入校验（pydantic 或 marshmallow）
4. 集成密码哈希（argon2 或 bcrypt）
5. 集成邮件发送（开发环境使用本地捕获）并异步处理
6. 添加速率限制中间件（Redis backing）
7. 编写单元/集成测试（覆盖 TC-001..TC-005）
8. 在 README 或 INSTALL 文档中补充环境变量与部署步骤

## 示例使用流程（简短）
1. 前端提交 POST /api/auth/register
2. 后端返回 201
3. 用户在邮件点击验证链接 -> 前端调用验证端点 -> 后端将用户 email_verified 置 true

## 备注与进一步工作
- 若需要 GDPR 合规、隐私保留策略、邮箱退订等，请额外定义数据保留与删除策略
- 若需要支持社交注册或密码重置，可在后续 FRs 中扩展

---

文件生成时间: 2025-10-19

如需我把此文档移到仓库根目录的 `docs/` 或自动生成对应 migration / 示例代码，我可以继续实现。