export const lessons = [
  {
    id: 1,
    title: "Data Modeling",
    desc: "Embedding vs Referencing - Khi nào dùng cái nào?",
    content: `
## Nguyên tắc vàng

Với SQL, bạn quen **chuẩn hóa** (normalize) - tách data ra nhiều bảng rồi JOIN.

Với MongoDB, tư duy khác: **"Data được đọc cùng nhau thì lưu cùng nhau"**

## Embedding vs Referencing

| Pattern | Khi nào dùng | Ví dụ |
|---------|--------------|-------|
| **Embedding** | Data có lifecycle giống nhau, read cùng lúc, **bounded** (có giới hạn) | User settings, passkeys (max 10) |
| **Referencing** | Data tăng không giới hạn, read riêng lẻ, write độc lập | Transactions (millions/user) |

## Tại sao KHÔNG embed transactions vào user?

\`\`\`javascript
// ❌ SQL Brain - Chuẩn hóa quá mức
users -> user_wallets -> wallet_transactions

// ❌ MongoDB Newbie - Embed tất cả
{ user: { transactions: [ /* 1 triệu records */ ] } }
// Document size limit = 16MB -> BOOM!

// ✅ Hybrid Pattern cho Wallet
users: { passkeys: [embedded], settings: embedded }
transactions: { userId: reference }
\`\`\`

## Lý do kỹ thuật

- **Document size limit = 16MB**
- 1 transaction ~500 bytes → chỉ chứa được ~32K transactions
- **Write amplification**: mỗi lần add tx phải rewrite CẢ document

## Schema cho Wallet App

\`\`\`javascript
// Users Collection - Embedded pattern
{
  _id: ObjectId("..."),
  publicKey: "0x742d35Cc...",
  displayName: "CryptoWhale",

  // EMBEDDED: bounded, read together
  passkeys: [
    { credentialId: "cred_1", deviceName: "iPhone 15" },
    { credentialId: "cred_2", deviceName: "MacBook" }
  ],

  // EMBEDDED: 1:1 relationship
  settings: {
    notificationsEnabled: true,
    defaultNetwork: "ethereum"
  }
}

// Transactions Collection - Referenced pattern
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),  // Reference to User
  txHash: "0x123...",
  network: "ethereum",
  type: "send",
  status: "confirmed",
  value: Decimal128("1.5"),
  createdAt: ISODate()
}
\`\`\`
    `
  },
  {
    id: 2,
    title: "Indexes",
    desc: "ESR Rule, Compound Index, Covered Queries",
    content: `
## Index trong MongoDB vs SQL

Về cơ bản giống nhau: B-tree, tăng tốc query. Nhưng có vài điểm khác biệt quan trọng.

## ESR Rule - Thứ tự Compound Index

**E**quality → **S**ort → **R**ange

\`\`\`javascript
// Query: userId = X AND status = Y AND createdAt > Z ORDER BY createdAt

// ✅ GOOD Index
{ userId: 1, status: 1, createdAt: -1 }
//    E          E           S+R

// ❌ BAD Index
{ createdAt: -1, userId: 1, status: 1 }
//    R             E          E
// Range field trước -> phải scan toàn bộ range
\`\`\`

## Đánh giá Index Performance

\`\`\`javascript
db.transactions.find({ userId: X, status: "pending" })
  .explain("executionStats")

// Metrics quan trọng:
// - totalKeysExamined: số index entries đã scan
// - totalDocsExamined: số documents đã fetch
// - nReturned: số documents trả về

// Ratio tốt: docsExamined / nReturned ≈ 1.0
// Ratio xấu: > 2.0 -> index không selective
\`\`\`

## Các loại Index

| Type | Use case | Ví dụ |
|------|----------|-------|
| Single Field | Query 1 field | \`{ publicKey: 1 }\` |
| Compound | Query nhiều fields | \`{ userId: 1, createdAt: -1 }\` |
| Multikey | Index trên array | \`{ "passkeys.credentialId": 1 }\` |
| Wildcard | Dynamic fields | \`{ "metadata.$**": 1 }\` |
| Text | Full-text search | \`{ displayName: "text" }\` |

## Covered Query - Không cần đọc Document

\`\`\`javascript
// Index: { userId: 1, txHash: 1, status: 1 }

// Query chỉ lấy fields trong index
db.transactions.find(
  { userId: X },
  { txHash: 1, status: 1, _id: 0 }
)

// totalDocsExamined = 0
// Chỉ đọc index, không cần fetch document!
\`\`\`
    `
  },
  {
    id: 3,
    title: "Aggregation Pipeline",
    desc: "$match, $group, $lookup, $facet và các operators",
    content: `
## Tư duy Pipeline

\`\`\`
SQL:     Viết 1 câu query, DB tự optimize
MongoDB: Bạn thiết kế từng bước, data chảy qua như ống nước

┌──────┐    ┌─────────┐    ┌────────┐    ┌───────┐
│ Data │ →  │ $match  │ →  │ $group │ →  │ Result│
└──────┘    └─────────┘    └────────┘    └───────┘
              WHERE         GROUP BY
\`\`\`

## Operators phổ biến

| Stage | SQL Equivalent | Mô tả |
|-------|---------------|-------|
| \`$match\` | WHERE | Filter documents |
| \`$group\` | GROUP BY | Aggregate theo key |
| \`$sort\` | ORDER BY | Sắp xếp |
| \`$project\` | SELECT | Chọn/transform fields |
| \`$lookup\` | LEFT JOIN | Join collections |
| \`$unwind\` | - | Tách array thành nhiều docs |
| \`$facet\` | - | Nhiều pipelines song song |

## Ví dụ: Transaction Summary

\`\`\`javascript
db.transactions.aggregate([
  // Stage 1: Filter
  { $match: { userId: ObjectId("...") } },

  // Stage 2: Group by type
  { $group: {
    _id: "$type",
    count: { $sum: 1 },
    totalValue: { $sum: "$value" }
  }},

  // Stage 3: Sort
  { $sort: { totalValue: -1 } }
])

// Result:
// { _id: "send", count: 150, totalValue: 1250.5 }
// { _id: "receive", count: 120, totalValue: 980.2 }
\`\`\`

## $facet - Nhiều aggregations trong 1 query

\`\`\`javascript
db.transactions.aggregate([
  { $match: { userId: X } },
  { $facet: {
    "byStatus": [
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ],
    "byNetwork": [
      { $group: { _id: "$network", count: { $sum: 1 } } }
    ],
    "dailyVolume": [
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        volume: { $sum: "$value" }
      }},
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]
  }}
])

// SQL cần 3 queries riêng, MongoDB chỉ 1!
\`\`\`

## $lookup = JOIN

\`\`\`javascript
db.users.aggregate([
  { $match: { publicKey: "0x123..." } },
  { $lookup: {
    from: "transactions",
    localField: "_id",
    foreignField: "userId",
    as: "recentTxs"
  }},
  { $project: {
    displayName: 1,
    txCount: { $size: "$recentTxs" }
  }}
])
\`\`\`

> ⚠️ **Lưu ý**: $lookup expensive! Cân nhắc denormalize hoặc 2 queries riêng.
    `
  },
  {
    id: 4,
    title: "Transactions",
    desc: "Multi-document ACID, @Transactional, Optimistic Lock",
    content: `
## Khi nào cần Transaction?

\`\`\`
Single Document: ✅ Luôn atomic, KHÔNG cần transaction
Multi Document:  ⚠️ Cần transaction nếu muốn all-or-nothing
\`\`\`

## Vấn đề không có Transaction

\`\`\`
Scenario: Alice (100 ETH) chuyển 30 ETH cho Bob (50 ETH)

KHÔNG CÓ TRANSACTION:
Step 1: Trừ Alice 30 ETH     → Alice: 70 ETH ✅
Step 2: Cộng Bob 30 ETH      → ❌ Server crash!

Kết quả: Alice mất 30 ETH, Bob không nhận được gì!
         30 ETH "biến mất" khỏi hệ thống 💀

CÓ TRANSACTION:
START TRANSACTION
Step 1: Trừ Alice 30 ETH     → (pending)
Step 2: Cộng Bob 30 ETH      → ❌ Crash
ROLLBACK                     → Alice vẫn 100 ETH ✅
\`\`\`

## @Transactional trong Spring

\`\`\`java
@Transactional  // Spring auto: start → commit/rollback
public TransferResult transfer(String from, String to, BigDecimal amount) {

    // 1. Trừ tiền sender (với balance check)
    var deductResult = mongoTemplate.updateFirst(
        Query.query(Criteria.where("publicKey").is(from)
                           .and("balance").gte(amount)), // Optimistic lock
        new Update().inc("balance", amount.negate()),
        "users"
    );

    if (deductResult.getModifiedCount() == 0) {
        throw new InsufficientBalanceException(); // → Rollback
    }

    // 2. Cộng tiền receiver
    mongoTemplate.updateFirst(
        Query.query(Criteria.where("publicKey").is(to)),
        new Update().inc("balance", amount),
        "users"
    );

    // 3. Ghi log transaction
    mongoTemplate.save(transaction);

    // Tự động COMMIT nếu không có exception
}
\`\`\`

## Optimistic Lock

\`\`\`javascript
// ❌ Race condition
user = findOne({ publicKey: "Alice" })
if (user.balance >= 80) {
    updateOne({ publicKey: "Alice" }, { $inc: { balance: -80 } })
}
// 2 requests đồng thời → cả 2 đều thấy balance = 100 → trừ 2 lần!

// ✅ Check trong query condition
updateOne(
    { publicKey: "Alice", balance: { $gte: 80 } },  // Check ở đây!
    { $inc: { balance: -80 } }
)
// modifiedCount = 0 nếu balance không đủ
\`\`\`

> ⚠️ **Lưu ý**: Transaction yêu cầu **Replica Set**, không work với standalone MongoDB.
    `
  },
  {
    id: 5,
    title: "Schema Evolution",
    desc: "Migration strategies, schemaVersion, Lazy migration",
    content: `
## Vấn đề

Ứng dụng phát triển → cần thay đổi cấu trúc data:
- Thêm field mới
- Xóa field cũ
- Đổi tên field
- Đổi kiểu dữ liệu

## SQL vs MongoDB

\`\`\`sql
-- SQL: ALTER TABLE (có thể lock table, downtime)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users RENAME COLUMN public_key TO wallet_address;
\`\`\`

\`\`\`javascript
// MongoDB: Schema-less, just insert với field mới!
// Tuần 1
{ publicKey: "0x123", displayName: "Alice" }

// Tuần 5: Thêm phone
{ publicKey: "0x456", displayName: "Bob", phone: "+84123456789" }

// Cả 2 documents cùng tồn tại! Không cần ALTER.
\`\`\`

## Vấn đề: Mixed Schema Versions

\`\`\`javascript
// Query trả về mixed schemas
users.forEach(user => {
    console.log(user.phone)     // undefined cho user cũ
    console.log(user.settings)  // undefined cho user cũ
})

// Code phải handle NULL!
\`\`\`

## Strategy 1: Handle NULL trong Code

\`\`\`java
public String getPhone() {
    return phone != null ? phone : "";  // Default value
}

public UserSettings getSettings() {
    return settings != null ? settings : new UserSettings();
}
\`\`\`

## Strategy 2: Lazy Migration (On-Read)

\`\`\`java
public User findByPublicKey(String key) {
    User user = repository.findByPublicKey(key);

    if (user.getSchemaVersion() < CURRENT_VERSION) {
        migrateUser(user);  // Add missing fields
    }

    return user;
}

private void migrateUser(User user) {
    Update update = new Update();

    if (user.getPhone() == null) {
        update.set("phone", "");
    }
    if (user.getSettings() == null) {
        update.set("settings", defaultSettings);
    }
    update.set("schemaVersion", CURRENT_VERSION);

    mongoTemplate.updateFirst(query, update, User.class);
}
\`\`\`

## Strategy 3: Batch Migration

\`\`\`javascript
// Chạy job migrate tất cả
db.users.updateMany(
    { schemaVersion: { $lt: 3 } },
    [{
        $set: {
            phone: { $ifNull: ["$phone", ""] },
            settings: { $ifNull: ["$settings", defaultSettings] },
            schemaVersion: 3
        }
    }]
)
\`\`\`

## Tóm lại

**MongoDB Schema Migration = Migrate bằng Code**

- Thêm \`schemaVersion\` field vào document
- Check version khi đọc → migrate nếu cần
- Zero downtime, gradual migration
    `
  },
  {
    id: 6,
    title: "Performance Tuning",
    desc: "Projection, Limit sớm, Batch Operations",
    content: `
## 1. Projection - Chỉ lấy fields cần thiết

\`\`\`javascript
// ❌ Bad: Lấy tất cả fields (document 500+ bytes)
db.transactions.find({ userId: X })

// ✅ Good: Chỉ lấy 3 fields cần thiết
db.transactions.find(
    { userId: X },
    { txHash: 1, status: 1, value: 1, _id: 0 }
)

// Kết quả: Giảm 95% data transfer, 75% faster
\`\`\`

## 2. $limit sớm trong Aggregation

\`\`\`javascript
// ❌ Bad: $limit cuối pipeline
$match → $lookup → $unwind → $sort → $limit 5
// $lookup chạy trên TẤT CẢ 1000 documents, rồi mới limit!

// ✅ Good: $limit sớm
$match → $sort → $limit 5 → $lookup
// $lookup chỉ chạy trên 5 documents

// Kết quả: 88% faster!
\`\`\`

\`\`\`
╔═══════════════════════════════════════════════════════════════╗
║ BAD: $limit CUỐI                                              ║
║                                                               ║
║  1005 docs → $lookup (1005 lần) → $limit 5                   ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║ GOOD: $limit SỚM                                              ║
║                                                               ║
║  1005 docs → $limit 5 → $lookup (5 lần)                      ║
╚═══════════════════════════════════════════════════════════════╝
\`\`\`

## 3. Batch Operations

\`\`\`javascript
// ❌ Bad: Insert từng cái một (500 round-trips)
for (doc of docs) {
    db.collection.insertOne(doc)
}
// Time: 287ms

// ✅ Good: Batch insert (1 round-trip)
db.collection.insertMany(docs)
// Time: 17ms → 17x faster!

// ✅ bulkWrite cho mixed operations
db.collection.bulkWrite([
    { insertOne: { document: {...} } },
    { updateOne: { filter: {...}, update: {...} } },
    { deleteOne: { filter: {...} } }
])
\`\`\`

## Tại sao quan trọng?

\`\`\`
Network latency ~1ms per round-trip

500 operations × 1ms = 500ms overhead
Với batch: 1 round-trip = 1ms overhead

→ Batch có thể cải thiện 100x+ cho bulk operations
\`\`\`

## Checklist

- ☐ Projection: Chỉ select fields cần thiết
- ☐ $limit sớm nhất có thể trong pipeline
- ☐ Batch operations: insertMany, bulkWrite
- ☐ allowDiskUse: true cho large aggregations
    `
  },
  {
    id: 7,
    title: "Sharding",
    desc: "Horizontal Scaling, Shard Key Selection",
    content: `
## Khi nào cần Sharding?

\`\`\`
Single Server Limits:
• Storage: Disk đầy
• RAM: Working set không fit memory
• CPU: Write throughput bottleneck

Giải pháp:
• Vertical scaling: Nâng cấp server (có giới hạn)
• Horizontal scaling: SHARDING
\`\`\`

## Architecture

\`\`\`
                    ┌─────────────┐
                    │ Application │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   mongos    │  ← Router
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
  │  Shard 1  │     │  Shard 2  │     │  Shard 3  │
  │ userId A-M│     │ userId N-T│     │ userId U-Z│
  └───────────┘     └───────────┘     └───────────┘
\`\`\`

## Chọn Shard Key - Quyết định quan trọng nhất!

| Option | Pros | Cons |
|--------|------|------|
| \`{ userId: 1 }\` | Query by userId → 1 shard | Hot shard nếu whale users |
| \`{ txHash: "hashed" }\` | Perfect distribution | Query by userId → ALL shards |
| \`{ userId: 1, createdAt: 1 }\` | Best of both | Phức tạp hơn |

## Targeted vs Scatter-Gather

\`\`\`javascript
// Shard Key: { userId: 1 }

// ✅ Targeted Query (GOOD)
db.transactions.find({ userId: "0x123" })
// → Router biết data ở shard nào → chỉ query 1 shard

// ❌ Scatter-Gather Query (SLOW)
db.transactions.find({ network: "ethereum" })
// → Query KHÔNG có shard key → phải hỏi TẤT CẢ shards
\`\`\`

## Lưu ý quan trọng

⚠️ **Shard key KHÔNG THỂ thay đổi sau khi tạo!**

⚠️ **Sharding phức tạp - chỉ dùng khi thực sự cần**

⚠️ **Trước khi shard: Optimize queries, indexes, hardware**
    `
  },
  {
    id: 8,
    title: "Replica Set",
    desc: "High Availability, Write Concern, Read Preference",
    content: `
## Replica Set là gì?

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                     REPLICA SET                         │
│                                                         │
│    ┌─────────────┐                                     │
│    │   PRIMARY   │  ← Nhận tất cả WRITE                │
│    └──────┬──────┘  ← Nhận READ (mặc định)             │
│           │                                             │
│           │ Replication (async)                        │
│           │                                             │
│    ┌──────┴──────┬─────────────┐                       │
│    ▼             ▼             ▼                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│ │SECONDARY│ │SECONDARY│ │ ARBITER │                   │
│ └─────────┘ └─────────┘ └─────────┘                   │
│                                                         │
│  Khi PRIMARY chết → SECONDARY được bầu làm PRIMARY mới │
│  → Automatic failover, zero downtime                   │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Tại sao cần Replica Set?

1. **High Availability**: Primary chết → Secondary lên thay
2. **Data Redundancy**: Data được copy sang nhiều servers
3. **Read Scaling**: Có thể đọc từ Secondary
4. **Transactions**: Multi-doc transactions CHỈ work với Replica Set

## Write Concern

\`\`\`javascript
// w: 1 (default)
// → Chỉ cần Primary acknowledge
// → Nhanh nhưng có thể mất data nếu Primary chết

// w: "majority" (recommended cho financial data)
// → Phải có đa số servers acknowledge
// → Chậm hơn nhưng data an toàn

// j: true
// → Đợi ghi xuống disk trước khi acknowledge
\`\`\`

## Read Preference

| Mode | Đọc từ | Use case |
|------|--------|----------|
| primary | Primary only | Default, consistent |
| primaryPreferred | Primary, fallback Secondary | HA |
| secondary | Secondary only | Analytics |
| secondaryPreferred | Secondary first | Read scaling |
| nearest | Lowest latency | Geo-distributed |

> ⚠️ Đọc từ Secondary có thể thấy **stale data** (replication lag)
    `
  },
  {
    id: 9,
    title: "Change Streams",
    desc: "Real-time Updates, Event-driven Architecture",
    content: `
## Change Streams là gì?

"Watch" collection và nhận notification khi data thay đổi.

Giống database triggers nhưng ở application level.

\`\`\`
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │ insert  │   MongoDB   │  event  │   Watcher   │
│  (write)    │ ──────► │  Collection │ ──────► │ (listener)  │
└─────────────┘         └─────────────┘         └─────────────┘
\`\`\`

## Use cases cho Wallet

- Notify user khi transaction confirmed
- Update UI real-time khi balance thay đổi
- Sync data với external systems
- Audit logging

## Event Types

| Operation | Trigger when |
|-----------|--------------|
| insert | Document được insert |
| update | Document được update |
| replace | Document được replace |
| delete | Document bị delete |

## Java Implementation

\`\`\`java
public void watchTransactions() {
    var collection = mongoTemplate.getCollection("transactions");

    var pipeline = List.of(
        Aggregates.match(Filters.in("operationType",
            List.of("insert", "update")))
    );

    for (var change : collection.watch(pipeline)) {
        var doc = change.getFullDocument();
        var status = doc.getString("status");

        if ("confirmed".equals(status)) {
            sendNotification(doc);
        }
    }
}
\`\`\`

## Resume Token

\`\`\`java
// Save resume token để continue sau restart
BsonDocument resumeToken = change.getResumeToken();

// Resume từ token
collection.watch(pipeline)
    .resumeAfter(resumeToken)
\`\`\`

> ⚠️ **Yêu cầu**: Replica Set (không work với standalone)
    `
  },
  {
    id: 10,
    title: "Production Checklist",
    desc: "Best Practices, Security, Monitoring, Backup",
    content: `
## Infrastructure

- ☐ Replica Set (minimum 3 nodes)
- ☐ Dedicated servers (không share với app)
- ☐ SSD storage
- ☐ Đủ RAM cho working set
- ☐ Network: low latency giữa nodes

## Security

- ☐ Authentication enabled
- ☐ Role-based access control
- ☐ TLS/SSL encryption
- ☐ Network: bind to private IP only
- ☐ Firewall: chỉ allow từ app servers

## Indexes

- ☐ Index cho tất cả query patterns
- ☐ Compound index theo ESR rule
- ☐ Không có COLLSCAN trong production
- ☐ Monitor index usage, drop unused indexes

## Monitoring

- ☐ Profiler enabled (slowms: 100)
- ☐ Metrics: connections, ops/sec, replication lag
- ☐ Alerts: disk space, memory, slow queries
- ☐ Log aggregation (ELK, CloudWatch, etc.)

## Backup

- ☐ Regular backups (mongodump hoặc cloud backup)
- ☐ Test restore procedure
- ☐ Point-in-time recovery enabled (oplog)
- ☐ Backup offsite/different region

## Connection String Best Practices

\`\`\`yaml
spring:
  data:
    mongodb:
      uri: >-
        mongodb://user:pass@host1,host2,host3/wallet_db?
        replicaSet=rs0&
        readPreference=primaryPreferred&
        w=majority&
        journal=true&
        connectTimeoutMS=10000&
        maxPoolSize=100&
        retryWrites=true
\`\`\`

## Summary

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  MONGODB FOUNDATION - KEY TAKEAWAYS                     │
├─────────────────────────────────────────────────────────┤
│  1. Data Modeling: Embed bounded, Reference unbounded  │
│  2. Indexes: ESR Rule, ratio ≈ 1.0                     │
│  3. Aggregation: Pipeline thinking, $match first       │
│  4. Transactions: Replica Set + @Transactional         │
│  5. Schema: schemaVersion + lazy migration             │
│  6. Performance: Projection, limit sớm, batch          │
│  7. Sharding: Shard key = destiny                      │
│  8. Replica Set: HA, Write Concern majority            │
│  9. Change Streams: Real-time với resume token         │
│ 10. Production: Security, monitoring, backup           │
└─────────────────────────────────────────────────────────┘
\`\`\`
    `
  },
  {
    id: 11,
    title: "Text Search",
    desc: "Full-text Search, $text, Atlas Search, Autocomplete",
    content: `
## Text Search trong MongoDB

Tìm kiếm text như Google - không chỉ exact match.

\`\`\`javascript
// Exact match (chỉ tìm chính xác)
db.transactions.find({ memo: "ETH transfer" })

// Text search (tìm "ETH" hoặc "transfer")
db.transactions.find({ $text: { $search: "ETH transfer" } })
\`\`\`

## Tạo Text Index

\`\`\`javascript
// Single field
db.transactions.createIndex({ memo: "text" })

// Multiple fields
db.transactions.createIndex({
  memo: "text",
  "metadata.notes": "text"
})

// Weights (ưu tiên field nào)
db.transactions.createIndex(
  { memo: "text", tags: "text" },
  { weights: { memo: 10, tags: 5 } }
)
\`\`\`

## Text Search Operators

\`\`\`javascript
// Tìm "ethereum" HOẶC "polygon"
{ $text: { $search: "ethereum polygon" } }

// Tìm exact phrase
{ $text: { $search: '"ETH to USDC"' } }

// Exclude word (có ethereum, không có scam)
{ $text: { $search: "ethereum -scam" } }

// Score ranking
db.transactions.find(
  { $text: { $search: "swap" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
\`\`\`

## Language Support

\`\`\`javascript
// Default: English stemming
// "running" matches "run", "runs", "running"

// Vietnamese (limited support)
db.transactions.createIndex(
  { memo: "text" },
  { default_language: "none" }  // Disable stemming
)
\`\`\`

## Atlas Search (Full Lucene)

\`\`\`javascript
// Fuzzy search (chấp nhận typo)
db.transactions.aggregate([
  {
    $search: {
      text: {
        query: "etherem",  // typo
        path: "memo",
        fuzzy: { maxEdits: 2 }
      }
    }
  }
])

// Autocomplete
db.users.aggregate([
  {
    $search: {
      autocomplete: {
        query: "cry",
        path: "displayName"
      }
    }
  }
])
// → "CryptoWhale", "CryptoKing", ...
\`\`\`

## So sánh

| Feature | Native $text | Atlas Search |
|---------|--------------|--------------|
| Fuzzy search | ❌ | ✅ |
| Autocomplete | ❌ | ✅ |
| Synonyms | ❌ | ✅ |
| Facets | ❌ | ✅ |
| Highlight | ❌ | ✅ |
| Cost | Free | Atlas only |

> ⚠️ Chỉ có 1 text index per collection!
    `
  },
  {
    id: 12,
    title: "Time Series",
    desc: "Time Series Collections, IoT, Metrics, Price History",
    content: `
## Time Series Collections (MongoDB 5.0+)

Tối ưu cho data theo thời gian: metrics, logs, sensor data, price history.

\`\`\`javascript
db.createCollection("price_history", {
  timeseries: {
    timeField: "timestamp",
    metaField: "token",
    granularity: "minutes"
  },
  expireAfterSeconds: 2592000  // 30 days TTL
})
\`\`\`

## Use case: Token Price History

\`\`\`javascript
// Insert price data
db.price_history.insertMany([
  { timestamp: ISODate(), token: "ETH", price: 3500.50, volume: 1000000 },
  { timestamp: ISODate(), token: "ETH", price: 3502.30, volume: 1200000 },
  { timestamp: ISODate(), token: "BTC", price: 67000.00, volume: 5000000 }
])
\`\`\`

## Tại sao cần Time Series Collection?

\`\`\`
Regular Collection:
┌─────────────────────────────────────────────┐
│ Doc1 │ Doc2 │ Doc3 │ Doc4 │ Doc5 │ ... │
└─────────────────────────────────────────────┘
  ETH    BTC    ETH    SOL    ETH   (scattered)

Time Series Collection:
┌─────────────────────────────────────────────┐
│ ETH: [Doc1, Doc3, Doc5, ...]  ← Bucketed   │
│ BTC: [Doc2, ...]                            │
│ SOL: [Doc4, ...]                            │
└─────────────────────────────────────────────┘
  → Nén tốt hơn, query nhanh hơn
\`\`\`

## Query Examples

\`\`\`javascript
// Giá ETH trong 24h qua
db.price_history.find({
  token: "ETH",
  timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) }
})

// Aggregate: Average price per hour
db.price_history.aggregate([
  { $match: { token: "ETH" } },
  { $group: {
    _id: {
      $dateTrunc: { date: "$timestamp", unit: "hour" }
    },
    avgPrice: { $avg: "$price" },
    maxPrice: { $max: "$price" },
    minPrice: { $min: "$price" },
    totalVolume: { $sum: "$volume" }
  }},
  { $sort: { _id: -1 } },
  { $limit: 24 }
])
\`\`\`

## Window Functions (MongoDB 5.0+)

\`\`\`javascript
// Moving average (SMA)
db.price_history.aggregate([
  { $match: { token: "ETH" } },
  { $setWindowFields: {
    partitionBy: "$token",
    sortBy: { timestamp: 1 },
    output: {
      movingAvg: {
        $avg: "$price",
        window: { documents: [-6, 0] }  // 7-period SMA
      }
    }
  }}
])
\`\`\`

## Lợi ích

| Feature | Improvement |
|---------|-------------|
| Storage | 90% less với compression |
| Query Speed | 10x faster cho time range |
| Auto Bucketing | Không cần manual partitioning |
| TTL | Auto delete old data |
    `
  },
  {
    id: 13,
    title: "Geospatial",
    desc: "Location Queries, 2dsphere, $near, $geoWithin",
    content: `
## Geospatial Queries

Tìm kiếm dựa trên vị trí địa lý - nearby merchants, ATMs, users.

## GeoJSON Format

\`\`\`javascript
// Point (vị trí đơn)
{
  type: "Point",
  coordinates: [longitude, latitude]  // [lng, lat] - KHÔNG phải [lat, lng]!
}

// Polygon (khu vực)
{
  type: "Polygon",
  coordinates: [[
    [106.6, 10.7], [106.8, 10.7],
    [106.8, 10.9], [106.6, 10.9],
    [106.6, 10.7]  // Đóng polygon
  ]]
}
\`\`\`

## Schema Example: Merchants

\`\`\`javascript
db.merchants.insertOne({
  name: "Crypto ATM Saigon",
  location: {
    type: "Point",
    coordinates: [106.6953, 10.7769]  // Ho Chi Minh City
  },
  acceptedTokens: ["ETH", "BTC", "USDT"],
  rating: 4.5
})

// Create 2dsphere index
db.merchants.createIndex({ location: "2dsphere" })
\`\`\`

## Query: Find Nearby

\`\`\`javascript
// Tìm merchants trong bán kính 5km
db.merchants.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [106.7, 10.78]  // User location
      },
      $maxDistance: 5000  // meters
    }
  }
})
// Kết quả: Sorted by distance (gần nhất trước)
\`\`\`

## Query: Within Area

\`\`\`javascript
// Tìm merchants trong khu vực (polygon)
db.merchants.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [[
          [106.65, 10.75], [106.75, 10.75],
          [106.75, 10.82], [106.65, 10.82],
          [106.65, 10.75]
        ]]
      }
    }
  }
})
\`\`\`

## Aggregation: Distance Calculation

\`\`\`javascript
db.merchants.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [106.7, 10.78] },
      distanceField: "distance",  // meters
      maxDistance: 10000,
      spherical: true
    }
  },
  { $project: {
    name: 1,
    distanceKm: { $divide: ["$distance", 1000] },
    acceptedTokens: 1
  }}
])

// Result:
// { name: "Crypto ATM Saigon", distanceKm: 0.8, acceptedTokens: [...] }
\`\`\`

## Index Types

| Index | Use case |
|-------|----------|
| \`2dsphere\` | Earth surface (GPS coordinates) |
| \`2d\` | Flat plane (game maps, floor plans) |

## Common Mistakes

\`\`\`javascript
// ❌ Sai thứ tự: [latitude, longitude]
coordinates: [10.7769, 106.6953]

// ✅ Đúng: [longitude, latitude]
coordinates: [106.6953, 10.7769]

// Nhớ: longitude = X, latitude = Y
\`\`\`

> ⚠️ GeoJSON dùng [longitude, latitude] - ngược với Google Maps!
    `
  },
  {
    id: 14,
    title: "Encryption",
    desc: "Field-Level Encryption, Queryable Encryption, Security",
    content: `
## Tại sao cần Field-Level Encryption?

\`\`\`
Database encryption at rest: ✅ Bảo vệ khi disk bị đánh cắp
TLS in transit: ✅ Bảo vệ khi truyền qua network

Nhưng: DBA vẫn thấy data plaintext!
      Attacker có access vào DB vẫn đọc được!

Field-Level Encryption: Data encrypted TRƯỚC KHI gửi đến MongoDB
                        → Ngay cả DBA cũng không đọc được!
\`\`\`

## Client-Side Field Level Encryption (CSFLE)

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  Application                                            │
│  ┌─────────────┐    ┌─────────────┐                    │
│  │   Data      │ →  │  Encrypt    │ →  Encrypted Data  │
│  │ privateKey  │    │  (AES-256)  │    to MongoDB      │
│  └─────────────┘    └─────────────┘                    │
│                           ↑                             │
│                     Master Key                          │
│                    (AWS KMS, etc)                       │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Schema với Encryption

\`\`\`javascript
// Fields cần encrypt cho Wallet
{
  userId: ObjectId("..."),
  publicKey: "0x742d35Cc...",        // Public - không cần encrypt

  // ⚠️ Sensitive - PHẢI encrypt
  privateKey: "encrypted_blob...",    // CSFLE encrypted
  seedPhrase: "encrypted_blob...",    // CSFLE encrypted
  pin: "encrypted_blob..."            // CSFLE encrypted
}
\`\`\`

## Java Implementation

\`\`\`java
// 1. Setup encryption
var kmsProviders = Map.of("local", Map.of(
    "key", localMasterKey  // 96 bytes
));

var encryptionSettings = AutoEncryptionSettings.builder()
    .keyVaultNamespace("wallet_db.dataKeys")
    .kmsProviders(kmsProviders)
    .schemaMap(jsonSchemaMap)
    .build();

var clientSettings = MongoClientSettings.builder()
    .autoEncryptionSettings(encryptionSettings)
    .build();

// 2. Auto encrypt/decrypt
mongoClient.getDatabase("wallet_db")
    .getCollection("users")
    .insertOne(new Document()
        .append("publicKey", "0x123...")
        .append("privateKey", "sensitive_value")  // Auto encrypted!
    );
\`\`\`

## Queryable Encryption (MongoDB 7.0+)

\`\`\`javascript
// CSFLE: Có thể encrypt nhưng KHÔNG thể query
db.users.find({ ssn: "123-45-6789" })  // ❌ Không work

// Queryable Encryption: Encrypt VÀ vẫn query được!
db.users.find({ ssn: "123-45-6789" })  // ✅ Work!
// Server không bao giờ thấy giá trị plaintext
\`\`\`

## Supported Query Types (Queryable Encryption)

| Query | Supported |
|-------|-----------|
| Equality (\`$eq\`) | ✅ |
| Range (\`$gt\`, \`$lt\`) | ✅ (7.0+) |
| Prefix | ✅ |
| Regex | ❌ |
| Full-text | ❌ |

## Best Practices

\`\`\`
1. ENCRYPT:
   - Private keys, seed phrases
   - PINs, passwords
   - Personal info (SSN, phone, address)

2. DON'T ENCRYPT:
   - Public keys (cần search)
   - Timestamps (cần sort)
   - Transaction hashes (public on blockchain)

3. Key Management:
   - Use KMS (AWS, GCP, Azure)
   - Rotate keys regularly
   - Separate keys per environment
\`\`\`

> ⚠️ Mất key = Mất data vĩnh viễn! Backup keys cẩn thận.
    `
  }
];
