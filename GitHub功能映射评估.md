# GitHub 功能映射与 MVP 方案

## 方案依据

本版以 [hackathon-platform Issue #24 评论](https://github.com/Ri0n72Y/hackathon-platform/issues/24#issuecomment-6465536139) 中的 MVP 约束为准。核心原则是：GitHub 作为现阶段的项目数据和协作载体，前端提供更贴近产品的展示与操作体验；先不建设全局发现广场和自有后端业务系统。

## MVP 范围

### 1. 项目与活动主页

- 一个 GitHub Repository 对应一个项目或一场活动，主页字段从 Repository metadata、README、Topics 等读取。
- Repository 是该项目/活动的主入口，不额外建立独立的“活动实体”后端模型。
- 项目成员展示读取仓库根目录的 `team-member.json`。该文件可补充头像、展示名、项目身份、简介和其他项目链接；GitHub Contributors 仅作为贡献记录，不直接视为正式成员名单。
- 当前没有独立的项目间关系服务。关联项目可先用仓库配置文件中的 URL 做只读链接。

### 2. 项目动态

- GitHub Issue 是项目动态的主要内容对象。
- Issue 标题、正文 Markdown、作者、标签、时间、状态、评论和 Reaction 映射到前端动态详情。
- 用 Issue Form / 模板固定字段，避免从自由文本猜内容类型。
- Pull Request 可作为代码协作动态补充显示，但不是普通动态发布的默认入口。

建议先采用下列标签约定：

```text
type:post
type:event
type:recruit
type:announcement
channel:daily
channel:feedback
```

### 3. 频道

- 频道由项目仓库的配置约定定义，名称以 `channel:*` 标签或配置清单表示。
- 频道消息由带有对应 `channel:*` 标签的 Issue 表示，回复使用该 Issue 的评论。
- 这能复用 Issue、评论、通知和权限，但它是“频道主题串”的近似实现，不等于实时聊天。
- 频道分类不构成独立权限边界；MVP 只支持仓库权限范围内的公开/私有访问。

### 4. 劳动记录

- 按参考评论提出的 Labour Record 规范，用结构化 Issue 评论记录劳动投入，并结合相关 Commit 形成贡献依据。
- 劳动记录字段、计量规则、修改/审核权限应以该规范为准；本评估不自行发明计量口径。
- 前端负责呈现记录和关联贡献，GitHub 评论/Commit 作为原始记录来源。
- 若规范要求防篡改审核、工时审批或跨仓库汇总，需要额外服务端校验；仅靠前端展示不能保证。

### 5. 仓库发现与搜索

- 本期不做发现广场、推荐流、跨项目混合内容流或平台自己的全局项目索引。
- 项目/活动候选通过 GitHub Repository Search 和 Topics 搜索获得，再由用户进入对应仓库主页。
- GitHub 搜索依赖仓库元数据和 Topic 标注，结果、排序、索引覆盖及 API 限流由 GitHub 决定；不能当作可控的站内推荐算法。
- 如后续需要稳定分类、精选排序或个性化推荐，再增加自有索引服务。

## 功能映射与可行性

| 前端能力 | GitHub 数据载体 | MVP 判断 | 限制 / 说明 |
|---|---|---|---|
| 项目/活动主页 | Repository、README、Topics | 可做 | Repository 是唯一主实体；字段展示需统一配置约定。 |
| 成员列表 | `team-member.json`、GitHub 用户资料 | 可做 | 身份信息由项目维护者配置，不是 GitHub 验证过的职务。 |
| 项目动态 | Issues、Issue comments、labels | 可做 | 适合可追踪内容；需要模板、分页及 Markdown 渲染。 |
| 频道列表与消息 | `channel:*` 标签 + Issue + comments | 可做，近似映射 | 一个 Issue 是一条讨论主题，不是实时消息流；标签权限跟随仓库权限。 |
| 帖子、公告、活动、招募 | Issue + 类型标签 | 可做 | 可以展示内容及外部报名链接；报名业务不在 GitHub Issue 本身内完成。 |
| 评论和回应 | Issue comments、Reactions | 可做 | 需要登录与仓库写权限；Reaction 类型受 GitHub 限定。 |
|  |
|  |
| 草稿 | 浏览器 localStorage | 可做，临时 | 仅本机浏览器保存，不跨设备同步。 |
| 图片展示 | Issue/README Markdown 图片 URL | 可展示 | GitHub 不是通用图片上传服务；大批图片建议外部对象存储。 |

## 明确不进入 MVP

| 功能 | 暂缓原因 | 后续达成方式 |
|---|---|---|
| 发现页面 / 全局发现广场 | 参考方案明确 MVP 不做平台级跨项目发现。 | 后续建立仓库索引、内容聚合及可控排序服务。 |
| 项目间全局搜索索引 | 当前通过 GitHub Topics/Search 找仓库，不维护自有索引。 | 定期同步仓库元数据到数据库/搜索引擎。 |
| 共建看板、任务状态 | 本阶段优先交付项目主页、动态、频道和劳动记录。 | 以后将 Issue 同步到 GitHub Projects v2 或自建看板。 |
| 内部频道的独立成员权限 | `channel:*` 标签和 Issue 不能提供单频道 ACL。 | 私有仓库/组织团队，或自有权限服务。 |
| 频道未读点与平台通知中心 | 需要用户级已读游标和产品事件存储。 | Webhook + 用户通知/已读数据库。 |
| 站内关注关系 | Star/Watch 与产品关注语义不同。 | 自有用户-仓库关系表，或明确采用 GitHub Star/Watch 的近似语义。 |
| 站内报名、名额、签到、候选人管理 | Issue 不能可靠完成去重、限额和状态流转。 | 外部报名表，或 Serverless API + 数据库。 |
| 原生投票 | Reaction 不支持完整投票生命周期、匿名和防重复规则。 | 自有投票数据模型与服务端校验。 |
| 简历上传与隐私访问 | 公开仓库不适合保存敏感个人资料。 | 对象存储 + 鉴权服务；或仅链接到外部简历。 |
| 跨设备草稿 | localStorage 是浏览器本地状态。 | 服务端草稿并关联登录账号。 |

## 建议实施顺序

### 阶段 1：只读数据接入

- 选定一个 Repository，建立前端项目与仓库的映射配置。
- 读取仓库主页资料、README、Topics、`team-member.json`。
- 读取 Issues、标签、评论和相关 Commits，验证动态、频道及劳动记录的数据约定。
- 接入 GitHub Repository Search / Topics 搜索作为临时找项目入口，不建设发现广场。
- 补齐分页、缓存、加载/空/错误状态和 Markdown 安全渲染。

### 阶段 2：登录与项目内写操作

- 通过 GitHub App 或 OAuth 完成身份授权。
- 支持按仓库权限创建 Issue、回复评论、添加 Reaction。
- 需要写入时经 Serverless API 处理授权，不能把 PAT、App 私钥或 OAuth secret 放入浏览器构建产物。
- 草稿继续暂存在 localStorage。

### 阶段 3：稳定同步

- 使用 GitHub App Webhook 接收 Issue、评论、PR、Push 等事件。
- 根据 Labour Record 规范验证字段、记录来源和权限要求；只有在规范确有需要时才添加数据库。
- 增加服务端缓存处理 API 限流和跨仓库查询，但不顺带实现发现、报名、投票等暂缓能力。

## 最小架构

```text
React/Vite 前端
  ├─ 公开读取：GitHub REST / GraphQL
  ├─ 仓库搜索：GitHub Repository Search + Topics
  ├─ 写操作：Serverless API + GitHub App/OAuth
  ├─ 项目配置：team-member.json、channel 配置、Issue 模板
  ├─ 原始内容：Issues、Comments、Reactions、Commits
  └─ 本地草稿：localStorage
```

公开数据可先由前端只读请求 GitHub API，但必须考虑分页和匿名速率限制。写操作令牌需由授权流程和服务端保护；`VITE_*` 环境变量会被打包为浏览器可读内容，不能用于存放密钥。

## MVP 验收口径

- 一个配置好的仓库可在前端打开为项目/活动主页。
- 成员列表从 `team-member.json` 生成，链接到 GitHub 用户资料。
- Issue 可按类型和 `channel:*` 标签显示为动态、帖子、招募、活动或频道主题。
- Issue 评论及关联 Commit 能按 Labour Record 约定展示。
- 用户可以通过 GitHub Topics/Search 找到仓库；不存在平台自建发现广场。
- 只读模式不泄露任何密钥；写入功能尚未接入时清晰提供 GitHub 原站链接或只读状态。
