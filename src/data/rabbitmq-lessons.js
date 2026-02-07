export const rabbitmqLessons = [
  {
    id: 1,
    title: "RabbitMQ la gi?",
    desc: "Message Broker - Tai sao RabbitMQ la lua chon hang dau cho messaging",
    content: `
## RabbitMQ la gi?

RabbitMQ la mot **open-source message broker** - phan mem trung gian giup cac ung dung giao tiep voi nhau thong qua **messages**.

RabbitMQ implement chuan **AMQP 0-9-1** (Advanced Message Queuing Protocol) - giao thuc nhan tin hang doi nang cao.

\`\`\`mermaid
graph LR
    P1[Producer 1] --> E[Exchange]
    P2[Producer 2] --> E
    E --> Q1[Queue 1]
    E --> Q2[Queue 2]
    Q1 --> C1[Consumer 1]
    Q2 --> C2[Consumer 2]
    Q2 --> C3[Consumer 3]
    style E fill:#7c3aed,stroke:#6d28d9,color:#fff
    style Q1 fill:#0ea5e9,stroke:#0284c7,color:#fff
    style Q2 fill:#0ea5e9,stroke:#0284c7,color:#fff
\`\`\`

## Tai sao can Message Broker?

**Van de**: Cac service giao tiep truc tiep (synchronous) gay ra:

- **Tight coupling** - thay doi 1 service anh huong nhieu service khac
- **Mat data** khi receiver chet
- **Khong scale** duoc khi traffic tang dot bien
- **Blocking** - sender phai cho response

\`\`\`mermaid
graph TD
    subgraph "Khong co Broker - Coupling chat"
        A1[Order Service] -->|HTTP| B1[Payment Service]
        A1 -->|HTTP| C1[Inventory Service]
        A1 -->|HTTP| D1[Email Service]
        B1 -->|HTTP| C1
    end
\`\`\`

\`\`\`mermaid
graph TD
    subgraph "Co RabbitMQ - Decoupled"
        A2[Order Service] --> R2[RabbitMQ]
        R2 --> B2[Payment Service]
        R2 --> C2[Inventory Service]
        R2 --> D2[Email Service]
    end
    style R2 fill:#7c3aed,stroke:#6d28d9,color:#fff
\`\`\`

## RabbitMQ vs Kafka

| Tieu chi | RabbitMQ | Kafka |
|----------|----------|-------|
| Mo hinh | Message Queue / Pub-Sub | Distributed Commit Log |
| Message | Xoa sau khi consumed | Luu tru theo retention |
| Ordering | Per-queue FIFO | Per-partition ordering |
| Routing | Phuc tap (exchanges, bindings) | Don gian (topic + partition) |
| Throughput | ~50K msg/s | ~1M msg/s |
| Use case | Task queue, RPC, routing phuc tap | Event streaming, log aggregation |
| Protocol | AMQP 0-9-1, MQTT, STOMP | Custom protocol |
| Consumer | Push-based (broker push to consumer) | Pull-based (consumer pull from broker) |

## Kien truc AMQP 0-9-1

\`\`\`mermaid
graph LR
    subgraph "Producer"
        P[Application]
    end
    subgraph "RabbitMQ Broker"
        E[Exchange] -->|Binding| Q1[Queue 1]
        E -->|Binding| Q2[Queue 2]
        E -->|Binding| Q3[Queue 3]
    end
    subgraph "Consumers"
        C1[Consumer 1]
        C2[Consumer 2]
    end
    P -->|Publish| E
    Q1 --> C1
    Q2 --> C2
    Q3 --> C2
    style E fill:#7c3aed,stroke:#6d28d9,color:#fff
\`\`\`

### Cac thanh phan chinh:

- **Producer**: Gui message den Exchange
- **Exchange**: Nhan message va route den Queue(s) dua tren **routing rules**
- **Binding**: Lien ket giua Exchange va Queue, co the co **binding key**
- **Queue**: Luu tru message cho den khi Consumer nhan
- **Consumer**: Nhan va xu ly message tu Queue

### Connection va Channel:

\`\`\`mermaid
graph TD
    subgraph "Application"
        subgraph "Connection TCP"
            CH1[Channel 1 - Publish]
            CH2[Channel 2 - Consume]
            CH3[Channel 3 - Admin]
        end
    end
    subgraph "RabbitMQ Broker"
        B[Broker]
    end
    CH1 --> B
    CH2 --> B
    CH3 --> B
\`\`\`

- **Connection**: 1 TCP connection den broker (resource nang)
- **Channel**: Lightweight virtual connection ben trong 1 Connection (multiplexing)

> ⚠️ Luon su dung nhieu Channel thay vi nhieu Connection. 1 Connection co the co hang ngan Channel.

## Hello World - First Message

\`\`\`java
// Producer - Gui message
ConnectionFactory factory = new ConnectionFactory();
factory.setHost("localhost");

try (Connection connection = factory.newConnection();
     Channel channel = connection.createChannel()) {

    // Khai bao queue
    channel.queueDeclare("hello", false, false, false, null);

    String message = "Hello RabbitMQ!";
    channel.basicPublish("", "hello", null, message.getBytes("UTF-8"));

    System.out.println(" [x] Sent '" + message + "'");
}
\`\`\`

\`\`\`java
// Consumer - Nhan message
ConnectionFactory factory = new ConnectionFactory();
factory.setHost("localhost");
Connection connection = factory.newConnection();
Channel channel = connection.createChannel();

channel.queueDeclare("hello", false, false, false, null);
System.out.println(" [*] Waiting for messages...");

DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    String message = new String(delivery.getBody(), "UTF-8");
    System.out.println(" [x] Received '" + message + "'");
};

channel.basicConsume("hello", true, deliverCallback, consumerTag -> { });
\`\`\`

## Khi nao dung RabbitMQ?

- **Task queues**: Phan phoi cong viec cho workers (resize image, send email)
- **RPC pattern**: Request/Reply qua message
- **Routing phuc tap**: Route message dua tren nhieu tieu chi
- **Priority messages**: Xu ly message theo do uu tien
- **Delayed messages**: Gui message sau mot khoang thoi gian
- **Microservices communication**: Giao tiep async giua cac service
`
  },
  {
    id: 2,
    title: "Exchanges & Routing",
    desc: "4 loai Exchange - Trai tim cua RabbitMQ routing system",
    content: `
## Exchange la gi?

Exchange la thanh phan **nhan message tu Producer** va **route den Queue(s)** dua tren **type** va **binding rules**.

Producer KHONG BAO GIO gui message truc tiep den Queue. Luon gui den Exchange.

\`\`\`mermaid
graph LR
    P[Producer] -->|routing_key| E{Exchange}
    E -->|binding_key match| Q1[Queue 1]
    E -->|binding_key match| Q2[Queue 2]
    E -->|no match| X[Message dropped]
    style E fill:#7c3aed,stroke:#6d28d9,color:#fff
    style X fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

## 4 Loai Exchange

### 1. Direct Exchange

Route message den queue co **binding key KHOP CHINH XAC** voi routing key.

\`\`\`mermaid
graph LR
    P[Producer] -->|routing_key=error| DE{Direct Exchange}
    DE -->|binding_key=error| Q1[Error Queue]
    DE -->|binding_key=info| Q2[Info Queue]
    DE -->|binding_key=warning| Q3[Warning Queue]
    style DE fill:#7c3aed,stroke:#6d28d9,color:#fff
\`\`\`

**Message voi routing_key=error** → chi den Error Queue

\`\`\`java
// Declare direct exchange
channel.exchangeDeclare("logs_direct", "direct");

// Bind queues voi routing keys
channel.queueBind("error_queue", "logs_direct", "error");
channel.queueBind("info_queue", "logs_direct", "info");
channel.queueBind("warning_queue", "logs_direct", "warning");

// Publish voi routing key
String severity = "error";
channel.basicPublish("logs_direct", severity, null, message.getBytes("UTF-8"));
\`\`\`

### 2. Fanout Exchange

**Broadcast** message den TAT CA queue duoc bind, **bo qua routing key**.

\`\`\`mermaid
graph LR
    P[Producer] -->|any key| FE{Fanout Exchange}
    FE --> Q1[Queue 1 - Email]
    FE --> Q2[Queue 2 - SMS]
    FE --> Q3[Queue 3 - Push]
    FE --> Q4[Queue 4 - Log]
    style FE fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

**Moi message** duoc copy den TAT CA 4 queue.

\`\`\`java
// Declare fanout exchange
channel.exchangeDeclare("notifications", "fanout");

// Bind queues (routing key bi bo qua)
channel.queueBind("email_queue", "notifications", "");
channel.queueBind("sms_queue", "notifications", "");
channel.queueBind("push_queue", "notifications", "");

// Publish (routing key khong quan trong)
channel.basicPublish("notifications", "", null, message.getBytes("UTF-8"));
\`\`\`

### 3. Topic Exchange

Route dua tren **pattern matching** voi routing key. Routing key la cac tu cach boi dau cham.

**Wildcards:**
- \`*\` (star) - khop chinh xac **1 tu**
- \`#\` (hash) - khop **0 hoac nhieu tu**

\`\`\`mermaid
graph LR
    P[Producer] -->|order.created.vn| TE{Topic Exchange}
    TE -->|"order.*.vn"| Q1[VN Orders]
    TE -->|"order.created.*"| Q2[All Created Orders]
    TE -->|"order.#"| Q3[All Order Events]
    TE -->|"payment.#"| Q4[Payment Events ❌]
    style TE fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

| Routing Key | order.*.vn | order.created.* | order.# |
|-------------|-----------|-----------------|---------|
| order.created.vn | ✅ | ✅ | ✅ |
| order.created.us | ❌ | ✅ | ✅ |
| order.shipped.vn | ✅ | ❌ | ✅ |
| order.created.vn.hcm | ❌ | ❌ | ✅ |

\`\`\`java
// Declare topic exchange
channel.exchangeDeclare("events", "topic");

// Bind voi pattern
channel.queueBind("vn_orders", "events", "order.*.vn");
channel.queueBind("all_created", "events", "order.created.*");
channel.queueBind("all_orders", "events", "order.#");

// Publish
channel.basicPublish("events", "order.created.vn", null, msg.getBytes("UTF-8"));
\`\`\`

### 4. Headers Exchange

Route dua tren **message headers** thay vi routing key. Flexible nhat nhung it dung nhat.

\`\`\`java
// Bind voi headers
Map<String, Object> headers = new HashMap<>();
headers.put("x-match", "all"); // "all" = AND, "any" = OR
headers.put("format", "pdf");
headers.put("type", "report");
channel.queueBind("pdf_reports", "docs", "", headers);

// Publish voi headers
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .headers(Map.of("format", "pdf", "type", "report"))
    .build();
channel.basicPublish("docs", "", props, data);
\`\`\`

## Default Exchange

Moi RabbitMQ broker co 1 **default exchange** (nameless exchange, ten rong "").

- Type: Direct
- Moi queue tu dong duoc bind voi **routing key = ten queue**

\`\`\`java
// Gui truc tiep den queue "hello" thong qua default exchange
channel.basicPublish("", "hello", null, message.getBytes("UTF-8"));
//                    ^^ exchange rong = default
//                        ^^^^^ routing key = ten queue
\`\`\`

## Exchange-to-Exchange Binding

Exchange co the bind den exchange khac, tao routing phuc tap:

\`\`\`mermaid
graph LR
    P[Producer] --> E1{Exchange 1}
    E1 --> E2{Exchange 2}
    E1 --> Q1[Queue 1]
    E2 --> Q2[Queue 2]
    E2 --> Q3[Queue 3]
    style E1 fill:#7c3aed,stroke:#6d28d9,color:#fff
    style E2 fill:#0ea5e9,stroke:#0284c7,color:#fff
\`\`\`

> ⚠️ Exchange-to-Exchange binding la tinh nang manh me nhung de gay routing phuc tap. Dung can than va document ro rang.

## So sanh Exchange Types

| Feature | Direct | Fanout | Topic | Headers |
|---------|--------|--------|-------|---------|
| Routing | Exact match | Broadcast | Pattern match | Header match |
| Performance | Nhanh nhat | Nhanh | Trung binh | Cham nhat |
| Flexibility | Thap | Thap | Cao | Cao nhat |
| Use case | Log levels | Notifications | Event routing | Complex filtering |
`
  },
  {
    id: 3,
    title: "Queues & Bindings",
    desc: "Queue types, properties, va binding strategies",
    content: `
## Queue la gi?

Queue la noi **luu tru message** cho den khi Consumer nhan va xu ly. Queue hoat dong theo mo hinh **FIFO** (First In, First Out).

\`\`\`mermaid
graph LR
    E{Exchange} -->|Binding| Q[Queue]
    Q --> M1[Message 1 - oldest]
    Q --> M2[Message 2]
    Q --> M3[Message 3]
    Q --> M4[Message 4 - newest]
    M1 --> C[Consumer]
    style Q fill:#0ea5e9,stroke:#0284c7,color:#fff
\`\`\`

## Queue Properties

\`\`\`java
// queueDeclare(name, durable, exclusive, autoDelete, arguments)
channel.queueDeclare("my_queue", true, false, false, null);
\`\`\`

| Property | Description | Default |
|----------|-------------|---------|
| \`name\` | Ten queue (rong = server generate) | Required |
| \`durable\` | Queue ton tai sau khi broker restart | false |
| \`exclusive\` | Chi connection hien tai duoc dung | false |
| \`autoDelete\` | Xoa khi consumer cuoi cung disconnect | false |
| \`arguments\` | Optional arguments (TTL, max-length...) | null |

## Cac loai Queue

### 1. Classic Queue (default)

Queue truyen thong, luu tren 1 node duy nhat.

\`\`\`java
channel.queueDeclare("classic_queue", true, false, false, null);
\`\`\`

### 2. Quorum Queue (recommended cho production)

**Replicated queue** dua tren Raft consensus. Data duoc replicate tren nhieu node.

\`\`\`mermaid
graph TD
    subgraph "Quorum Queue - 3 replicas"
        L[Leader - Node 1] -->|replicate| F1[Follower - Node 2]
        L -->|replicate| F2[Follower - Node 3]
    end
    P[Producer] --> L
    L --> C[Consumer]
    style L fill:#22c55e,stroke:#16a34a,color:#fff
    style F1 fill:#0ea5e9,stroke:#0284c7,color:#fff
    style F2 fill:#0ea5e9,stroke:#0284c7,color:#fff
\`\`\`

\`\`\`java
Map<String, Object> args = new HashMap<>();
args.put("x-queue-type", "quorum");
channel.queueDeclare("quorum_queue", true, false, false, args);
\`\`\`

**Uu diem Quorum Queue:**
- **Data safety**: Message duoc replicate tren nhieu node
- **Automatic leader election**: Khi leader chet, follower len thay
- **Poison message handling**: Tu dong xu ly message bi reject nhieu lan

### 3. Stream Queue

Append-only log, tuong tu Kafka. Consumer co the doc lai message tu bat ky vi tri nao.

\`\`\`java
Map<String, Object> args = new HashMap<>();
args.put("x-queue-type", "stream");
channel.queueDeclare("my_stream", true, false, false, args);
\`\`\`

| Feature | Classic | Quorum | Stream |
|---------|---------|--------|--------|
| Replication | Khong | Raft consensus | Raft consensus |
| Ordering | FIFO | FIFO | FIFO |
| Message xoa sau consume | Co | Co | Khong (append-only) |
| Re-read message | Khong | Khong | Co |
| Performance | Nhanh | Trung binh | Nhanh (sequential) |
| Use case | Dev, temp | Production | Event sourcing, replay |

## Queue Arguments

\`\`\`java
Map<String, Object> args = new HashMap<>();

// Message TTL - message het han sau 60 giay
args.put("x-message-ttl", 60000);

// Queue max length - toi da 10000 message
args.put("x-max-length", 10000);

// Max length bytes - toi da 100MB
args.put("x-max-length-bytes", 104857600);

// Overflow behavior: drop-head (default), reject-publish
args.put("x-overflow", "reject-publish");

// Dead Letter Exchange
args.put("x-dead-letter-exchange", "dlx_exchange");
args.put("x-dead-letter-routing-key", "dead_letter");

// Queue expiry - xoa queue neu khong dung trong 30 phut
args.put("x-expires", 1800000);

// Single active consumer
args.put("x-single-active-consumer", true);

channel.queueDeclare("configured_queue", true, false, false, args);
\`\`\`

## Binding la gi?

Binding la **lien ket** giua Exchange va Queue, xac dinh cach route message.

\`\`\`mermaid
graph LR
    E{Exchange} -->|"binding_key=order.created"| Q1[Order Queue]
    E -->|"binding_key=payment.*"| Q2[Payment Queue]
    E -->|"binding_key=#"| Q3[All Events Queue]
    style E fill:#7c3aed,stroke:#6d28d9,color:#fff
\`\`\`

\`\`\`java
// Basic binding
channel.queueBind("order_queue", "events", "order.created");

// Binding voi arguments (cho headers exchange)
Map<String, Object> bindArgs = new HashMap<>();
bindArgs.put("x-match", "any");
bindArgs.put("format", "json");
channel.queueBind("json_queue", "docs_exchange", "", bindArgs);

// Unbind
channel.queueUnbind("order_queue", "events", "order.created");
\`\`\`

## Temporary Queues

\`\`\`java
// Server-named queue (ten random nhu amq.gen-Xs1...)
// Non-durable, exclusive, auto-delete
String queueName = channel.queueDeclare().getQueue();
System.out.println("Temp queue: " + queueName);

// Bind den exchange
channel.queueBind(queueName, "logs", "");
\`\`\`

## Queue Purge va Delete

\`\`\`java
// Xoa het message trong queue (khong xoa queue)
channel.queuePurge("my_queue");

// Xoa queue
channel.queueDelete("my_queue");

// Xoa queue chi khi khong co consumer va khong co message
channel.queueDelete("my_queue", true, true);
//                               ifUnused  ifEmpty
\`\`\`

> ⚠️ Trong production, LUON dung Quorum Queue. Classic Queue chi nen dung cho development hoac temporary data.
`
  },
  {
    id: 4,
    title: "Message Acknowledgment",
    desc: "Dam bao message khong bi mat - ack, nack, reject, prefetch",
    content: `
## Van de mat message

Khi consumer nhan message roi crash truoc khi xu ly xong, message se bi **MAT** neu khong co acknowledgment.

\`\`\`mermaid
sequenceDiagram
    participant Q as Queue
    participant C as Consumer
    Q->>C: Deliver message
    Note over C: Processing...
    Note over C: 💥 CRASH!
    Note over Q: Message DA BI XOA<br/>khoi queue = MAT DATA
\`\`\`

## Message Acknowledgment

Acknowledgment (ack) la co che Consumer **bao cho broker biet** da xu ly xong message.

\`\`\`mermaid
sequenceDiagram
    participant Q as Queue
    participant C as Consumer
    Q->>C: Deliver message
    Note over C: Processing...
    C->>Q: basicAck ✅
    Note over Q: Xoa message<br/>khoi queue
\`\`\`

### 3 Cach ack:

### 1. Auto Ack (autoAck = true)

Message bi xoa ngay khi gui den consumer. **KHONG AN TOAN**.

\`\`\`java
// KHONG NEN DUNG trong production!
boolean autoAck = true;
channel.basicConsume("my_queue", autoAck, deliverCallback, cancelCallback);
\`\`\`

### 2. Manual Ack (Recommended)

Consumer tu quyet dinh khi nao ack.

\`\`\`java
boolean autoAck = false; // TAT auto ack
channel.basicConsume("my_queue", autoAck, deliverCallback, cancelCallback);

DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    try {
        String message = new String(delivery.getBody(), "UTF-8");
        processMessage(message);

        // Ack SAU KHI xu ly xong
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
        //                                                         ^^^^^ multiple=false: chi ack message nay
    } catch (Exception e) {
        // Reject va requeue
        channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
        //                                                          ^^^^  ^^^^
        //                                                       multiple  requeue
    }
};
\`\`\`

### 3. Batch Ack (multiple = true)

Ack nhieu message cung luc de tang performance.

\`\`\`java
int count = 0;
DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    processMessage(delivery);
    count++;

    if (count >= 10) {
        // Ack tat ca message co deliveryTag <= delivery tag hien tai
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), true);
        //                                                         ^^^^ multiple=true
        count = 0;
    }
};
\`\`\`

## Reject va Nack

\`\`\`mermaid
graph TD
    M[Message received] --> P{Xu ly thanh cong?}
    P -->|Yes| ACK[basicAck - Xoa message]
    P -->|No| R{Co the retry?}
    R -->|Yes| NACK[basicNack requeue=true]
    R -->|No| DLX[basicNack requeue=false<br/>→ Dead Letter Exchange]
    NACK --> Q[Quay lai Queue]
    style ACK fill:#22c55e,stroke:#16a34a,color:#fff
    style NACK fill:#f59e0b,stroke:#d97706,color:#fff
    style DLX fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

\`\`\`java
// Reject 1 message (khong requeue → den DLX neu co)
channel.basicReject(deliveryTag, false);

// Reject 1 message (requeue → quay lai queue)
channel.basicReject(deliveryTag, true);

// Nack (giong reject nhung ho tro multiple)
channel.basicNack(deliveryTag, false, false); // reject 1, khong requeue
channel.basicNack(deliveryTag, true, true);   // reject nhieu, requeue
\`\`\`

## Prefetch Count (QoS)

Prefetch gioi han so luong **unacknowledged messages** ma consumer nhan cung luc.

\`\`\`mermaid
sequenceDiagram
    participant Q as Queue (100 msgs)
    participant C1 as Consumer 1<br/>prefetch=2
    participant C2 as Consumer 2<br/>prefetch=2

    Q->>C1: Message 1
    Q->>C1: Message 2
    Q->>C2: Message 3
    Q->>C2: Message 4
    Note over Q: Cho doi ack<br/>truoc khi gui tiep
    C1->>Q: Ack message 1
    Q->>C1: Message 5
\`\`\`

\`\`\`java
// Prefetch = 1: Fair dispatch, moi consumer chi nhan 1 message tai mot thoi diem
channel.basicQos(1);

// Prefetch = 10: Moi consumer nhan toi da 10 unacked messages
channel.basicQos(10);

// Prefetch = 0: UNLIMITED (khong nen dung!)
channel.basicQos(0);

// Global prefetch: ap dung cho toan bo channel
channel.basicQos(10, true);
//                    ^^^^ global=true: gioi han tren toan channel
//                          global=false (default): gioi han per consumer
\`\`\`

### Chon prefetch phu hop:

| Prefetch | Use case | Trade-off |
|----------|----------|-----------|
| 1 | Task nang, can fair dispatch | Throughput thap |
| 10-50 | Task trung binh | Can bang tot |
| 100-300 | Task nhe, can throughput | Memory cao hon |
| 0 (unlimited) | KHONG NEN DUNG | Consumer bi overload |

> ⚠️ Prefetch qua cao → consumer bi overload, message timeout. Prefetch qua thap → throughput kem. Bat dau voi 10-50 va dieu chinh dan.

## Acknowledgment Timeout

Tu RabbitMQ 3.8+, neu consumer khong ack trong **30 phut** (default), connection bi dong.

\`\`\`java
// Tang timeout trong rabbitmq.conf
// consumer_timeout = 3600000  (1 gio)
\`\`\`

## Best Practices

- **LUON** dung manual ack trong production
- **Ack SAU KHI** xu ly xong, khong phai truoc
- Set prefetch phu hop voi loai task
- Handle exception → nack + requeue hoac → DLX
- Monitor unacked message count
- Tranh infinite requeue loop (dung DLX)
`
  },
  {
    id: 5,
    title: "Work Queues & Patterns",
    desc: "Competing consumers, Round-robin, Fair dispatch, Priority Queue",
    content: `
## Work Queue Pattern

Work Queue (Task Queue) phan phoi **tasks** cho nhieu **workers** (consumers). Moi message chi duoc xu ly boi **1 worker**.

\`\`\`mermaid
graph LR
    P[Producer] --> Q[Task Queue]
    Q --> W1[Worker 1]
    Q --> W2[Worker 2]
    Q --> W3[Worker 3]
    style Q fill:#0ea5e9,stroke:#0284c7,color:#fff
\`\`\`

## Round-Robin Dispatch (Default)

Mac dinh, RabbitMQ gui message **luan phien** (round-robin) cho cac consumer.

\`\`\`mermaid
sequenceDiagram
    participant Q as Queue
    participant W1 as Worker 1
    participant W2 as Worker 2
    participant W3 as Worker 3

    Q->>W1: Message 1
    Q->>W2: Message 2
    Q->>W3: Message 3
    Q->>W1: Message 4
    Q->>W2: Message 5
    Q->>W3: Message 6
\`\`\`

**Van de**: Worker 1 co the dang xu ly task nang (10s), trong khi Worker 2 ranh. Nhung message van duoc phan deu → **khong hieu qua**.

## Fair Dispatch (prefetch = 1)

Giai phap: Set \`prefetch = 1\`, RabbitMQ chi gui message moi cho worker da **ack xong** message truoc.

\`\`\`mermaid
sequenceDiagram
    participant Q as Queue
    participant W1 as Worker 1 - Nhanh
    participant W2 as Worker 2 - Cham

    Q->>W1: Task 1 (2s)
    Q->>W2: Task 2 (10s)
    Note over W1: Done in 2s
    W1->>Q: Ack
    Q->>W1: Task 3 (2s)
    Note over W1: Done in 2s
    W1->>Q: Ack
    Q->>W1: Task 4 (2s)
    Note over W2: Still working on Task 2...
\`\`\`

\`\`\`java
// Fair dispatch
channel.basicQos(1);

boolean autoAck = false;
channel.basicConsume("task_queue", autoAck, (consumerTag, delivery) -> {
    String task = new String(delivery.getBody(), "UTF-8");
    try {
        doWork(task);
    } finally {
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
    }
}, consumerTag -> { });
\`\`\`

## Message Durability

De message khong bi mat khi RabbitMQ restart:

\`\`\`java
// 1. Queue phai durable
channel.queueDeclare("task_queue", true, false, false, null);
//                                  ^^^^ durable=true

// 2. Message phai persistent
AMQP.BasicProperties props = MessageProperties.PERSISTENT_TEXT_PLAIN;
channel.basicPublish("", "task_queue", props, message.getBytes("UTF-8"));
\`\`\`

\`\`\`mermaid
graph TD
    M[Message Durability] --> Q{Queue durable?}
    Q -->|No| L1[Mat queue + messages khi restart]
    Q -->|Yes| P{Message persistent?}
    P -->|No| L2[Mat message khi restart]
    P -->|Yes| S[An toan ✅]
    style S fill:#22c55e,stroke:#16a34a,color:#fff
    style L1 fill:#ef4444,stroke:#dc2626,color:#fff
    style L2 fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

> ⚠️ Persistent message van chua dam bao 100%. Message co the nam trong OS cache chua duoc fsync. Dung Publisher Confirms de dam bao.

## Priority Queue

Queue co the xu ly message theo **do uu tien**.

\`\`\`java
// Declare priority queue (max priority = 10)
Map<String, Object> args = new HashMap<>();
args.put("x-max-priority", 10);
channel.queueDeclare("priority_queue", true, false, false, args);

// Publish voi priority
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .priority(5)   // priority 0-10, cao hon = uu tien hon
    .build();
channel.basicPublish("", "priority_queue", props, message.getBytes("UTF-8"));

// Publish message khac voi priority cao hon
AMQP.BasicProperties highPriority = new AMQP.BasicProperties.Builder()
    .priority(10)  // se duoc xu ly truoc
    .build();
channel.basicPublish("", "priority_queue", highPriority, urgentMsg.getBytes("UTF-8"));
\`\`\`

## Single Active Consumer

Chi cho phep **1 consumer active** tai mot thoi diem. Khi consumer chet, consumer khac len thay.

\`\`\`mermaid
graph LR
    Q[Queue] --> C1[Consumer 1 - ACTIVE ✅]
    Q -.->|standby| C2[Consumer 2 - WAITING]
    Q -.->|standby| C3[Consumer 3 - WAITING]
    style C1 fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

\`\`\`java
Map<String, Object> args = new HashMap<>();
args.put("x-single-active-consumer", true);
channel.queueDeclare("ordered_queue", true, false, false, args);
\`\`\`

**Use case**: Khi can **strict ordering** - chi 1 consumer xu ly de dam bao thu tu.

## Pub/Sub Pattern

Khac voi Work Queue (moi message 1 consumer), Pub/Sub gui message den **TAT CA** consumer.

\`\`\`mermaid
graph LR
    P[Producer] --> FE{Fanout Exchange}
    FE --> Q1[Queue 1] --> C1[Consumer 1]
    FE --> Q2[Queue 2] --> C2[Consumer 2]
    FE --> Q3[Queue 3] --> C3[Consumer 3]
    style FE fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

\`\`\`java
// Publisher
channel.exchangeDeclare("events", "fanout");
channel.basicPublish("events", "", null, message.getBytes("UTF-8"));

// Subscriber 1
String q1 = channel.queueDeclare().getQueue();
channel.queueBind(q1, "events", "");
channel.basicConsume(q1, true, deliverCallback, cancelCallback);

// Subscriber 2
String q2 = channel.queueDeclare().getQueue();
channel.queueBind(q2, "events", "");
channel.basicConsume(q2, true, deliverCallback, cancelCallback);
\`\`\`

## So sanh Patterns

| Pattern | Exchange | Message | Consumers |
|---------|----------|---------|-----------|
| Work Queue | Default/Direct | 1 message → 1 consumer | Competing |
| Pub/Sub | Fanout | 1 message → all consumers | Independent |
| Routing | Direct | 1 message → matched consumers | Selective |
| Topics | Topic | 1 message → pattern-matched | Flexible |
`
  },
  {
    id: 6,
    title: "Publisher Confirms & Reliability",
    desc: "Dam bao message KHONG BAO GIO bi mat - tu Producer den Consumer",
    content: `
## Van de: Message co that su den Broker?

Khi Producer gui message, lam sao biet message da den broker thanh cong?

\`\`\`mermaid
graph LR
    P[Producer] -->|"Message gui roi..."| B{RabbitMQ}
    B -->|"Network fail?"| X[MAT ❌]
    B -->|"Broker crash?"| Y[MAT ❌]
    B -->|"Queue khong ton tai?"| Z[MAT ❌]
    style X fill:#ef4444,stroke:#dc2626,color:#fff
    style Y fill:#ef4444,stroke:#dc2626,color:#fff
    style Z fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

## Publisher Confirms

Publisher Confirms la co che broker **bao cho producer biet** message da duoc luu thanh cong.

\`\`\`mermaid
sequenceDiagram
    participant P as Producer
    participant B as RabbitMQ Broker
    participant Q as Queue

    P->>B: Publish message (seq=1)
    B->>Q: Route & persist
    B->>P: Confirm (ack seq=1) ✅
    P->>B: Publish message (seq=2)
    Note over B: Exchange not found
    B->>P: Nack (seq=2) ❌
\`\`\`

### Strategy 1: Individual Confirms (don gian, cham)

\`\`\`java
channel.confirmSelect(); // Bat confirm mode

channel.basicPublish("", "my_queue", null, message.getBytes("UTF-8"));

if (channel.waitForConfirms(5000)) {
    System.out.println("Message confirmed!");
} else {
    System.out.println("Message nacked!");
    // Retry logic
}
\`\`\`

### Strategy 2: Batch Confirms (nhanh hon)

\`\`\`java
channel.confirmSelect();

int batchSize = 100;
int outstandingCount = 0;

for (String msg : messages) {
    channel.basicPublish("", "my_queue", null, msg.getBytes("UTF-8"));
    outstandingCount++;

    if (outstandingCount >= batchSize) {
        channel.waitForConfirmsOrDie(5000); // throw exception neu co nack
        outstandingCount = 0;
    }
}

// Confirm cac message con lai
if (outstandingCount > 0) {
    channel.waitForConfirmsOrDie(5000);
}
\`\`\`

### Strategy 3: Async Confirms (recommended - nhanh nhat)

\`\`\`java
channel.confirmSelect();

ConcurrentNavigableMap<Long, String> outstandingConfirms =
    new ConcurrentSkipListMap<>();

// Callback khi duoc confirm
ConfirmCallback ackCallback = (sequenceNumber, multiple) -> {
    if (multiple) {
        // Xoa tat ca message co seq <= sequenceNumber
        outstandingConfirms.headMap(sequenceNumber + 1).clear();
    } else {
        outstandingConfirms.remove(sequenceNumber);
    }
};

// Callback khi bi nack
ConfirmCallback nackCallback = (sequenceNumber, multiple) -> {
    String body = outstandingConfirms.get(sequenceNumber);
    System.err.println("Message nacked: " + body);
    // RETRY LOGIC HERE
    if (multiple) {
        outstandingConfirms.headMap(sequenceNumber + 1).clear();
    } else {
        outstandingConfirms.remove(sequenceNumber);
    }
};

channel.addConfirmListener(ackCallback, nackCallback);

// Publish
for (String msg : messages) {
    long seqNo = channel.getNextPublishSeqNo();
    outstandingConfirms.put(seqNo, msg);
    channel.basicPublish("", "my_queue", null, msg.getBytes("UTF-8"));
}
\`\`\`

## So sanh Confirm Strategies

| Strategy | Throughput | Complexity | Safety |
|----------|-----------|-----------|--------|
| Individual | Cham (1 msg/round-trip) | Thap | Cao |
| Batch | Trung binh | Trung binh | Cao |
| Async | Nhanh nhat | Cao | Cao |

## Mandatory Flag & Return

\`mandatory=true\`: Broker TRA LAI message neu khong route duoc den bat ky queue nao.

\`\`\`java
// Listener cho returned messages
channel.addReturnListener((replyCode, replyText, exchange, routingKey, props, body) -> {
    System.err.println("Message returned: " + new String(body));
    System.err.println("Reason: " + replyText);
    // Handle: log, retry with different routing key, alert
});

// Publish voi mandatory=true
channel.basicPublish("my_exchange", "unknown_key", true, false,
    MessageProperties.PERSISTENT_TEXT_PLAIN, message.getBytes("UTF-8"));
//                                           ^^^^ mandatory=true
\`\`\`

## Alternate Exchange

Backup exchange nhan message khong route duoc.

\`\`\`mermaid
graph LR
    P[Producer] --> ME{Main Exchange}
    ME -->|match| Q1[Queue 1]
    ME -->|no match| AE{Alternate Exchange}
    AE --> UQ[Unrouted Queue]
    style ME fill:#7c3aed,stroke:#6d28d9,color:#fff
    style AE fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

\`\`\`java
// Declare alternate exchange
channel.exchangeDeclare("alt_exchange", "fanout");
channel.queueDeclare("unrouted_queue", true, false, false, null);
channel.queueBind("unrouted_queue", "alt_exchange", "");

// Main exchange voi alternate exchange
Map<String, Object> args = new HashMap<>();
args.put("alternate-exchange", "alt_exchange");
channel.exchangeDeclare("main_exchange", "direct", true, false, args);
\`\`\`

## Full Reliability Pipeline

\`\`\`mermaid
graph TD
    P[Producer] -->|1. Publish + Confirm| E{Exchange}
    E -->|2. Route| Q[Durable Queue]
    E -->|No route + mandatory| R[Return to Producer]
    E -->|No route + AE| AE[Alternate Exchange]
    Q -->|3. Deliver| C[Consumer]
    C -->|4. Manual Ack| Q
    C -->|5. Nack + requeue| Q
    C -->|6. Nack + no requeue| DLX[Dead Letter Exchange]
    style Q fill:#0ea5e9,stroke:#0284c7,color:#fff
    style DLX fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

### Checklist Reliability:

- ✅ Publisher Confirms (async)
- ✅ Mandatory flag hoac Alternate Exchange
- ✅ Durable queue + Persistent messages
- ✅ Quorum queue (replicated)
- ✅ Manual ack (autoAck=false)
- ✅ Prefetch limit
- ✅ Dead Letter Exchange cho failed messages
- ✅ Connection recovery (auto-reconnect)

> ⚠️ RabbitMQ KHONG dam bao exactly-once delivery. No dam bao at-least-once. Ung dung can xu ly idempotency.
`
  },
  {
    id: 7,
    title: "Dead Letter Exchange (DLX)",
    desc: "Xu ly message that bai - retry, poison message, delay pattern",
    content: `
## Dead Letter la gi?

Dead Letter la message bi **"chet"** - khong the xu ly duoc. DLX la exchange nhan cac message nay.

\`\`\`mermaid
graph LR
    Q[Main Queue] -->|Message "chet"| DLX{Dead Letter Exchange}
    DLX --> DLQ[Dead Letter Queue]
    DLQ --> C[Consumer xu ly hoac log]
    style DLX fill:#ef4444,stroke:#dc2626,color:#fff
    style DLQ fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

## Khi nao message tro thanh Dead Letter?

1. **Consumer reject** (basicReject/basicNack voi requeue=false)
2. **Message TTL het han** (message qua cu)
3. **Queue qua day** (vuot x-max-length hoac x-max-length-bytes)
4. **Queue TTL het han** (x-message-ttl)

\`\`\`mermaid
graph TD
    M[Message] --> Q[Main Queue]
    Q --> C{Consumer xu ly}
    C -->|Thanh cong| ACK[Ack ✅]
    C -->|That bai| REJ[Reject requeue=false]
    Q -->|TTL het han| TTL[Expired]
    Q -->|Queue day| OVF[Overflow]
    REJ --> DLX{Dead Letter Exchange}
    TTL --> DLX
    OVF --> DLX
    DLX --> DLQ[Dead Letter Queue]
    style ACK fill:#22c55e,stroke:#16a34a,color:#fff
    style DLX fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

## Setup DLX

\`\`\`java
// 1. Declare DLX va DLQ
channel.exchangeDeclare("dlx_exchange", "direct");
channel.queueDeclare("dead_letter_queue", true, false, false, null);
channel.queueBind("dead_letter_queue", "dlx_exchange", "dead");

// 2. Declare main queue voi DLX
Map<String, Object> args = new HashMap<>();
args.put("x-dead-letter-exchange", "dlx_exchange");
args.put("x-dead-letter-routing-key", "dead");
channel.queueDeclare("main_queue", true, false, false, args);

// 3. Consumer reject → message tu dong den DLQ
DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    try {
        processMessage(delivery);
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
    } catch (Exception e) {
        // requeue=false → message den DLX
        channel.basicReject(delivery.getEnvelope().getDeliveryTag(), false);
    }
};
\`\`\`

## Retry Pattern voi DLX

Su dung DLX + TTL de tao **automatic retry** sau mot khoang thoi gian.

\`\`\`mermaid
graph LR
    MQ[Main Queue] -->|Reject| WQ[Wait Queue<br/>TTL=30s]
    WQ -->|TTL het| DLX{DLX → Main Exchange}
    DLX --> MQ
    style WQ fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

\`\`\`java
// Wait queue (retry sau 30s)
Map<String, Object> waitArgs = new HashMap<>();
waitArgs.put("x-dead-letter-exchange", "main_exchange");
waitArgs.put("x-dead-letter-routing-key", "main");
waitArgs.put("x-message-ttl", 30000); // 30 giay
channel.queueDeclare("wait_queue", true, false, false, waitArgs);

// Main queue → reject gui den wait exchange
Map<String, Object> mainArgs = new HashMap<>();
mainArgs.put("x-dead-letter-exchange", "wait_exchange");
mainArgs.put("x-dead-letter-routing-key", "wait");
channel.queueDeclare("main_queue", true, false, false, mainArgs);
\`\`\`

## Exponential Backoff Retry

Retry voi thoi gian tang dan: 1s → 5s → 30s → DLQ

\`\`\`mermaid
graph LR
    MQ[Main Queue] -->|Fail 1| W1[Wait 1s]
    W1 --> MQ
    MQ -->|Fail 2| W2[Wait 5s]
    W2 --> MQ
    MQ -->|Fail 3| W3[Wait 30s]
    W3 --> MQ
    MQ -->|Fail 4+| DLQ[Dead Letter Queue<br/>Manual review]
    style DLQ fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

\`\`\`java
DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    Map<String, Object> headers = delivery.getProperties().getHeaders();
    int retryCount = 0;

    if (headers != null && headers.containsKey("x-retry-count")) {
        retryCount = (int) headers.get("x-retry-count");
    }

    try {
        processMessage(delivery);
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
    } catch (Exception e) {
        if (retryCount >= 3) {
            // Qua 3 lan retry → gui den DLQ
            channel.basicReject(delivery.getEnvelope().getDeliveryTag(), false);
        } else {
            // Retry voi delay tang dan
            int delay = getDelay(retryCount); // 1000, 5000, 30000
            AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
                .headers(Map.of(
                    "x-retry-count", retryCount + 1,
                    "x-delay", delay
                ))
                .expiration(String.valueOf(delay))
                .build();
            channel.basicPublish("retry_exchange", "retry", props,
                delivery.getBody());
            channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
        }
    }
};

int getDelay(int retryCount) {
    int[] delays = {1000, 5000, 30000};
    return delays[Math.min(retryCount, delays.length - 1)];
}
\`\`\`

## DLX Headers

Khi message den DLQ, RabbitMQ tu dong them **x-death header** chua thong tin:

| Header | Description |
|--------|-------------|
| \`queue\` | Queue goc cua message |
| \`reason\` | Ly do: rejected, expired, maxlen |
| \`count\` | So lan bi dead-lettered |
| \`time\` | Thoi gian bi dead-lettered |
| \`exchange\` | Exchange goc |
| \`routing-keys\` | Routing key goc |

\`\`\`java
// Doc x-death header trong DLQ consumer
DeliverCallback dlqCallback = (consumerTag, delivery) -> {
    Map<String, Object> headers = delivery.getProperties().getHeaders();
    if (headers != null && headers.containsKey("x-death")) {
        List<Map<String, Object>> deaths =
            (List<Map<String, Object>>) headers.get("x-death");
        for (Map<String, Object> death : deaths) {
            System.out.println("Queue: " + death.get("queue"));
            System.out.println("Reason: " + death.get("reason"));
            System.out.println("Count: " + death.get("count"));
        }
    }
    // Log hoac alert
    logFailedMessage(delivery);
    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
};
\`\`\`

> ⚠️ Luon monitor DLQ. Message trong DLQ thuong chi ra bug trong code hoac van de voi external service.
`
  },
  {
    id: 8,
    title: "RPC Pattern",
    desc: "Request/Reply over RabbitMQ - Synchronous communication qua message",
    content: `
## RPC Pattern la gi?

RPC (Remote Procedure Call) cho phep gui request va **doi response** qua RabbitMQ. Day la cach lam **synchronous communication** tren async infrastructure.

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant RQ as Request Queue
    participant S as Server
    participant RQ2 as Reply Queue

    C->>RQ: Request (correlationId=abc, replyTo=reply_queue)
    RQ->>S: Deliver request
    Note over S: Xu ly request
    S->>RQ2: Response (correlationId=abc)
    RQ2->>C: Deliver response
    Note over C: Match correlationId=abc
\`\`\`

## Cach hoat dong

1. Client tao **exclusive reply queue** (hoac dung Direct Reply-to)
2. Client publish message voi **replyTo** (ten reply queue) va **correlationId** (unique ID)
3. Server nhan request, xu ly, gui response den **replyTo** queue voi cung **correlationId**
4. Client match response theo **correlationId**

## Implementation

### RPC Server

\`\`\`java
public class RPCServer {
    private static final String RPC_QUEUE = "rpc_queue";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.queueDeclare(RPC_QUEUE, false, false, false, null);
        channel.basicQos(1); // Fair dispatch

        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            // Lay correlationId va replyTo
            String correlationId = delivery.getProperties().getCorrelationId();
            String replyTo = delivery.getProperties().getReplyTo();

            // Xu ly request
            String request = new String(delivery.getBody(), "UTF-8");
            String response = processRequest(request);

            // Gui response ve reply queue
            AMQP.BasicProperties replyProps = new AMQP.BasicProperties.Builder()
                .correlationId(correlationId)
                .build();

            channel.basicPublish("", replyTo, replyProps,
                response.getBytes("UTF-8"));
            channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
        };

        channel.basicConsume(RPC_QUEUE, false, deliverCallback, tag -> {});
        System.out.println(" [x] Awaiting RPC requests");
    }

    private static String processRequest(String request) {
        int n = Integer.parseInt(request);
        return String.valueOf(fibonacci(n));
    }

    private static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}
\`\`\`

### RPC Client

\`\`\`java
public class RPCClient implements AutoCloseable {
    private Connection connection;
    private Channel channel;
    private String replyQueue;

    public RPCClient() throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        connection = factory.newConnection();
        channel = connection.createChannel();

        // Tao exclusive reply queue
        replyQueue = channel.queueDeclare().getQueue();
    }

    public String call(String message) throws Exception {
        String correlationId = UUID.randomUUID().toString();

        AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
            .correlationId(correlationId)
            .replyTo(replyQueue)
            .build();

        channel.basicPublish("", "rpc_queue", props,
            message.getBytes("UTF-8"));

        // Doi response
        CompletableFuture<String> response = new CompletableFuture<>();

        String ctag = channel.basicConsume(replyQueue, true,
            (consumerTag, delivery) -> {
                if (delivery.getProperties().getCorrelationId()
                    .equals(correlationId)) {
                    response.complete(
                        new String(delivery.getBody(), "UTF-8"));
                }
            }, consumerTag -> {});

        String result = response.get(10, TimeUnit.SECONDS); // timeout 10s
        channel.basicCancel(ctag);
        return result;
    }

    @Override
    public void close() throws Exception {
        connection.close();
    }
}

// Su dung
try (RPCClient client = new RPCClient()) {
    String result = client.call("30"); // fibonacci(30)
    System.out.println("Result: " + result);
}
\`\`\`

## Direct Reply-to (Optimized)

Thay vi tao reply queue rieng, dung **amq.rabbitmq.reply-to** pseudo-queue.

\`\`\`java
// Client khong can declare reply queue
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .correlationId(UUID.randomUUID().toString())
    .replyTo("amq.rabbitmq.reply-to")  // Pseudo-queue, nhanh hon
    .build();

channel.basicPublish("", "rpc_queue", props, request.getBytes("UTF-8"));
\`\`\`

**Uu diem**: Nhanh hon vi khong can declare/bind queue. Broker xu ly noi bo.

## RPC Timeout Pattern

\`\`\`mermaid
graph TD
    C[Client] -->|Request| Q[RPC Queue]
    Q --> S{Server xu ly}
    S -->|Response trong 10s| R[Reply Queue → Client ✅]
    S -->|Qua 10s| T[Timeout → Client handle error]
    style R fill:#22c55e,stroke:#16a34a,color:#fff
    style T fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

## Khi nao dung RPC?

| Use case | RPC qua RabbitMQ | HTTP truc tiep |
|----------|-----------------|----------------|
| Service co the down | ✅ Queue buffer | ❌ Connection refused |
| Can load balancing | ✅ Work queue | Cần LB rieng |
| Can retry tu dong | ✅ Requeue | Can implement retry |
| Can low latency | ❌ Overhead cao hon | ✅ Truc tiep |
| Simple request/response | ❌ Overkill | ✅ Don gian |

> ⚠️ Tranh RPC khi co the dung async message. RPC tao coupling va tang latency. Chi dung khi THAT SU can synchronous response.
`
  },
  {
    id: 9,
    title: "Connection Management",
    desc: "Connection, Channel, Recovery - Best practices cho production",
    content: `
## Connection Architecture

\`\`\`mermaid
graph TD
    subgraph "Application"
        subgraph "Connection 1 (TCP)"
            C1[Channel 1 - Publisher]
            C2[Channel 2 - Consumer A]
            C3[Channel 3 - Consumer B]
        end
    end
    subgraph "RabbitMQ"
        B[Broker]
    end
    C1 --> B
    C2 --> B
    C3 --> B
\`\`\`

### Connection vs Channel

| Feature | Connection | Channel |
|---------|-----------|---------|
| Protocol | TCP connection | Virtual connection trong Connection |
| Resource | Nang (socket, auth, TLS) | Nhe (multiplexed) |
| So luong | 1-2 per application | Nhieu (1 per thread) |
| Thread-safe | Co | **KHONG** |
| Khi nao tao | Khoi dong app | Moi thread/task |

## Connection Factory

\`\`\`java
ConnectionFactory factory = new ConnectionFactory();

// Basic
factory.setHost("rabbitmq.example.com");
factory.setPort(5672);
factory.setVirtualHost("/production");
factory.setUsername("app_user");
factory.setPassword("secret");

// Connection timeout
factory.setConnectionTimeout(10000);  // 10s
factory.setHandshakeTimeout(10000);   // 10s

// Heartbeat - detect dead connections
factory.setRequestedHeartbeat(30);    // 30s

// Channel max
factory.setRequestedChannelMax(100);

// Connection name (hien thi trong Management UI)
Connection conn = factory.newConnection("order-service-publisher");
\`\`\`

## URI Connection

\`\`\`java
ConnectionFactory factory = new ConnectionFactory();
factory.setUri("amqp://user:pass@host:5672/vhost");

// Voi TLS
factory.setUri("amqps://user:pass@host:5671/vhost");
\`\`\`

## Multiple Hosts (Failover)

\`\`\`java
// Danh sach broker de failover
Address[] addresses = {
    new Address("rabbit1.example.com", 5672),
    new Address("rabbit2.example.com", 5672),
    new Address("rabbit3.example.com", 5672)
};

// Thu ket noi lan luot, dung lai khi thanh cong
Connection connection = factory.newConnection(addresses, "my-app");
\`\`\`

## Automatic Recovery

RabbitMQ Java client co **automatic connection recovery** built-in.

\`\`\`mermaid
sequenceDiagram
    participant App as Application
    participant RMQ as RabbitMQ

    App->>RMQ: Connect ✅
    Note over App,RMQ: Hoat dong binh thuong
    RMQ--xApp: Connection lost ❌
    Note over App: Detect via heartbeat
    App->>RMQ: Reconnect attempt 1
    Note over RMQ: Node chua san sang
    App--xRMQ: Failed
    Note over App: Wait 5s
    App->>RMQ: Reconnect attempt 2 ✅
    Note over App: Recover channels,<br/>queues, consumers
\`\`\`

\`\`\`java
ConnectionFactory factory = new ConnectionFactory();

// Bat automatic recovery (default = true)
factory.setAutomaticRecoveryEnabled(true);

// Thoi gian cho giua cac lan retry
factory.setNetworkRecoveryInterval(5000); // 5s

// Topology recovery: tu dong re-declare queues, exchanges, bindings
factory.setTopologyRecoveryEnabled(true);

// Recovery listener
Connection connection = factory.newConnection();
((Recoverable) connection).addRecoveryListener(new RecoveryListener() {
    @Override
    public void handleRecovery(Recoverable recoverable) {
        System.out.println("Connection recovered!");
    }

    @Override
    public void handleRecoveryStarted(Recoverable recoverable) {
        System.out.println("Recovery started...");
    }
});
\`\`\`

## Channel Best Practices

\`\`\`java
// ❌ SAI: Chia se channel giua cac thread
Channel sharedChannel = connection.createChannel();
// Thread 1 dung sharedChannel → RACE CONDITION
// Thread 2 dung sharedChannel → RACE CONDITION

// ✅ DUNG: Moi thread 1 channel
ExecutorService executor = Executors.newFixedThreadPool(10);
for (int i = 0; i < 10; i++) {
    executor.submit(() -> {
        Channel channel = connection.createChannel();
        // Dung channel trong thread nay
        channel.basicPublish(...);
    });
}
\`\`\`

## Channel Pool Pattern

\`\`\`java
public class ChannelPool {
    private final Connection connection;
    private final BlockingQueue<Channel> pool;

    public ChannelPool(Connection connection, int size) throws Exception {
        this.connection = connection;
        this.pool = new ArrayBlockingQueue<>(size);
        for (int i = 0; i < size; i++) {
            pool.offer(connection.createChannel());
        }
    }

    public Channel borrowChannel() throws InterruptedException {
        return pool.take();
    }

    public void returnChannel(Channel channel) {
        if (channel.isOpen()) {
            pool.offer(channel);
        } else {
            try {
                pool.offer(connection.createChannel());
            } catch (Exception e) {
                // Handle error
            }
        }
    }
}

// Su dung
ChannelPool pool = new ChannelPool(connection, 20);
Channel ch = pool.borrowChannel();
try {
    ch.basicPublish("", "queue", null, msg.getBytes());
} finally {
    pool.returnChannel(ch);
}
\`\`\`

## Heartbeat va Blocked Connection

\`\`\`java
// Heartbeat: Detect dead connections
factory.setRequestedHeartbeat(30); // Client va server gui heartbeat moi 30s
// Neu miss 2 heartbeat lien tiep → connection coi nhu dead

// Blocked connection notification
// Khi broker het memory/disk → block publishers
connection.addBlockedListener(
    reason -> System.out.println("Connection blocked: " + reason),
    () -> System.out.println("Connection unblocked")
);
\`\`\`

## Production Checklist

- ✅ 1 Connection cho publish, 1 cho consume
- ✅ 1 Channel per thread (khong share)
- ✅ Automatic recovery enabled
- ✅ Heartbeat = 30-60s
- ✅ Connection name (de debug)
- ✅ Multiple broker addresses (failover)
- ✅ Blocked connection listener
- ✅ Channel pool cho high-throughput
`
  },
  {
    id: 10,
    title: "Virtual Hosts & Security",
    desc: "Multi-tenancy, Permissions, TLS, Authentication",
    content: `
## Virtual Host (vhost)

Virtual Host la co che **multi-tenancy** cua RabbitMQ. Moi vhost la mot **logical group** doc lap chua exchanges, queues, bindings, users, permissions.

\`\`\`mermaid
graph TD
    subgraph "RabbitMQ Broker"
        subgraph "vhost: /production"
            E1[orders_exchange] --> Q1[order_queue]
            E2[payment_exchange] --> Q2[payment_queue]
        end
        subgraph "vhost: /staging"
            E3[orders_exchange] --> Q3[order_queue]
        end
        subgraph "vhost: /testing"
            E4[test_exchange] --> Q4[test_queue]
        end
    end
\`\`\`

### Dac diem Vhost:
- Moi vhost la mot **namespace doc lap**
- Queue, Exchange cung ten co the ton tai o cac vhost khac nhau
- User phai duoc cap quyen cho tung vhost
- Khong the route message **giua cac vhost**
- Default vhost la \`/\`

\`\`\`bash
# Quan ly vhost qua CLI
rabbitmqctl add_vhost /production
rabbitmqctl add_vhost /staging
rabbitmqctl list_vhosts
rabbitmqctl delete_vhost /testing
\`\`\`

## User Management

\`\`\`bash
# Tao user
rabbitmqctl add_user app_user strong_password

# Dat tags (roles)
rabbitmqctl set_user_tags app_user monitoring
# Tags: management, policymaker, monitoring, administrator

# List users
rabbitmqctl list_users

# Change password
rabbitmqctl change_password app_user new_password

# Delete user
rabbitmqctl delete_user old_user
\`\`\`

### User Tags (Roles)

| Tag | Quyen |
|-----|-------|
| (none) | Chi truy cap AMQP |
| management | Xem vhost cua minh qua Management UI |
| policymaker | management + tao/xoa policies |
| monitoring | management + xem tat ca connections, channels |
| administrator | Full access: users, vhosts, permissions, policies |

## Permissions

Moi user duoc cap 3 loai permission cho moi vhost:

| Permission | Description | Vi du |
|-----------|-------------|-------|
| **configure** | Declare/delete queues, exchanges | \`queue.declare\`, \`exchange.delete\` |
| **write** | Publish message den exchange | \`basic.publish\` |
| **read** | Consume tu queue, bind queue | \`basic.consume\`, \`queue.bind\` |

\`\`\`bash
# set_permissions vhost user configure write read
# Regex pattern match ten resource

# Full access den tat ca resource trong /production
rabbitmqctl set_permissions -p /production app_user ".*" ".*" ".*"

# Chi duoc publish den exchange bat dau bang "order"
rabbitmqctl set_permissions -p /production order_svc "^order.*" "^order.*" ""

# Chi duoc consume tu queue bat dau bang "payment"
rabbitmqctl set_permissions -p /production payment_svc "" "" "^payment.*"

# Read-only: chi consume, khong publish, khong configure
rabbitmqctl set_permissions -p /production reader "" "" ".*"
\`\`\`

## TLS/SSL

\`\`\`mermaid
graph LR
    C[Client] -->|TLS 1.2/1.3| B[RabbitMQ Broker]
    B --> CA[CA Certificate]
    B --> SC[Server Certificate]
    C --> CC[Client Certificate]
    style B fill:#7c3aed,stroke:#6d28d9,color:#fff
\`\`\`

### Server-side TLS config (rabbitmq.conf):

\`\`\`text
# Enable TLS listener
listeners.ssl.default = 5671

# Certificates
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem

# Require client certificate
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert = true

# TLS versions
ssl_options.versions.1 = tlsv1.3
ssl_options.versions.2 = tlsv1.2
\`\`\`

### Java Client TLS:

\`\`\`java
ConnectionFactory factory = new ConnectionFactory();
factory.setHost("rabbitmq.example.com");
factory.setPort(5671); // TLS port

// Basic TLS (khong verify certificate)
factory.useSslProtocol();

// Full TLS voi certificate verification
KeyStore ks = KeyStore.getInstance("PKCS12");
ks.load(new FileInputStream("/path/to/client.p12"), "password".toCharArray());

KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
kmf.init(ks, "password".toCharArray());

KeyStore tks = KeyStore.getInstance("JKS");
tks.load(new FileInputStream("/path/to/truststore.jks"), "password".toCharArray());

TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
tmf.init(tks);

SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);

factory.useSslProtocol(sslContext);
factory.enableHostnameVerification();
\`\`\`

## Authentication Backends

| Backend | Description |
|---------|-------------|
| Internal | Default, user/pass luu trong Mnesia |
| LDAP | Ket noi Active Directory/LDAP |
| HTTP | Custom auth qua HTTP API |
| OAuth 2.0 | Token-based authentication |

\`\`\`text
# rabbitmq.conf - LDAP backend
auth_backends.1 = ldap

auth_ldap.servers.1 = ldap.example.com
auth_ldap.user_dn_pattern = cn=\${username},ou=users,dc=example,dc=com
\`\`\`

## Security Best Practices

- ✅ Xoa user \`guest\` hoac disable remote access
- ✅ Dung TLS cho moi connection
- ✅ Moi application 1 user rieng voi **least privilege**
- ✅ Tach vhost cho moi environment (prod, staging, dev)
- ✅ Enable audit logging
- ✅ Rotate credentials dinh ky
- ✅ Dung firewall gioi han access den port 5672/5671/15672
- ✅ Disable Management UI tren production hoac gioi han IP

> ⚠️ Mac dinh user guest chi connect duoc tu localhost. KHONG BAO GIO dung guest trong production.
`
  },
  {
    id: 11,
    title: "Clustering & High Availability",
    desc: "Multi-node cluster, Quorum Queues, Network Partitions, Replication",
    content: `
## RabbitMQ Cluster

Cluster la nhom cac RabbitMQ nodes hoat dong cung nhau nhu **mot broker logic duy nhat**.

\`\`\`mermaid
graph TD
    subgraph "RabbitMQ Cluster"
        N1[Node 1<br/>rabbit@node1]
        N2[Node 2<br/>rabbit@node2]
        N3[Node 3<br/>rabbit@node3]
        N1 <--> N2
        N2 <--> N3
        N1 <--> N3
    end
    C1[Client 1] --> N1
    C2[Client 2] --> N2
    C3[Client 3] --> N3
\`\`\`

### Cluster chia se gi?

| Resource | Replicated? | Description |
|----------|------------|-------------|
| Users, vhosts, permissions | ✅ Yes | Luu trong Mnesia, replicate tren moi node |
| Exchanges | ✅ Yes | Metadata replicate tren moi node |
| Queue metadata | ✅ Yes | Thong tin queue (name, args) |
| Queue data (classic) | ❌ No | Chi tren 1 node |
| Queue data (quorum) | ✅ Yes | Replicate theo Raft consensus |
| Queue data (stream) | ✅ Yes | Replicate tren nhieu node |

## Setup Cluster

\`\`\`bash
# Node 2 join cluster cua Node 1
# Tren node2:
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app

# Node 3 join
# Tren node3:
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app

# Check cluster status
rabbitmqctl cluster_status
\`\`\`

### Erlang Cookie:

Moi node trong cluster phai co **cung Erlang cookie** (shared secret).

\`\`\`bash
# File: /var/lib/rabbitmq/.erlang.cookie
# Phai giong nhau tren tat ca nodes
\`\`\`

## Quorum Queue - HA chinh

Quorum Queue la cach **recommended** de dam bao High Availability.

\`\`\`mermaid
graph TD
    subgraph "Quorum Queue: order_queue"
        L[Leader - Node 1] -->|Raft replicate| F1[Follower - Node 2]
        L -->|Raft replicate| F2[Follower - Node 3]
    end
    P[Producer] -->|Write| L
    L -->|Read| C[Consumer]

    style L fill:#22c55e,stroke:#16a34a,color:#fff
    style F1 fill:#0ea5e9,stroke:#0284c7,color:#fff
    style F2 fill:#0ea5e9,stroke:#0284c7,color:#fff
\`\`\`

### Raft Consensus:

\`\`\`mermaid
sequenceDiagram
    participant P as Producer
    participant L as Leader
    participant F1 as Follower 1
    participant F2 as Follower 2

    P->>L: Publish message
    L->>F1: Replicate (AppendEntries)
    L->>F2: Replicate (AppendEntries)
    F1->>L: Ack
    F2->>L: Ack
    Note over L: Majority confirmed (2/3)
    L->>P: Publisher Confirm ✅
\`\`\`

- Message chi duoc confirm khi **majority** (da so) cac member da luu
- 3 nodes: chiu duoc 1 node chet
- 5 nodes: chiu duoc 2 nodes chet
- Formula: chiu duoc **(N-1)/2** node failures

### Quorum Queue config:

\`\`\`java
Map<String, Object> args = new HashMap<>();
args.put("x-queue-type", "quorum");

// So luong replicas (mac dinh = so nodes trong cluster, toi da 5)
args.put("x-quorum-initial-group-size", 3);

// Delivery limit truoc khi dead letter
args.put("x-delivery-limit", 5);

channel.queueDeclare("ha_queue", true, false, false, args);
\`\`\`

## Network Partitions

Khi network giua cac nodes bi ngat, cluster bi chia (split-brain).

\`\`\`mermaid
graph TD
    subgraph "Partition A"
        N1[Node 1]
        N2[Node 2]
        N1 <--> N2
    end
    subgraph "Partition B"
        N3[Node 3]
    end
    N2 -.->|"❌ Network break"| N3
\`\`\`

### Partition Handling Strategies:

| Strategy | Behavior | Use case |
|----------|----------|----------|
| \`ignore\` | Khong lam gi, manual fix | Mang cuc ky on dinh |
| \`pause_minority\` | Pause nodes o phia it hon | **Recommended** |
| \`autoheal\` | Tu dong chon "winner", restart "loser" | Khi can auto-recovery |

\`\`\`text
# rabbitmq.conf
cluster_partition_handling = pause_minority
\`\`\`

## Node Types

| Type | Description | Use case |
|------|-------------|----------|
| Disc node | Luu metadata ra disk | Can it nhat 1 trong cluster |
| RAM node | Luu metadata trong RAM | Nhanh hon, it dung |

\`\`\`bash
# Join nhu RAM node
rabbitmqctl join_cluster --ram rabbit@node1
\`\`\`

> ⚠️ Luon co it nhat 2 disc nodes. RAM node chi chua metadata trong RAM, KHONG phai message data.

## Cluster Sizing

| Cluster size | Fault tolerance | Notes |
|-------------|-----------------|-------|
| 3 nodes | 1 node failure | **Minimum recommended** |
| 5 nodes | 2 node failures | Cho workload quan trong |
| 7 nodes | 3 node failures | Hiem khi can thiet |

## Load Balancer

\`\`\`mermaid
graph TD
    C1[Client 1] --> LB[Load Balancer<br/>HAProxy/Nginx]
    C2[Client 2] --> LB
    C3[Client 3] --> LB
    LB --> N1[Node 1]
    LB --> N2[Node 2]
    LB --> N3[Node 3]
    style LB fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

\`\`\`text
# HAProxy config
frontend rabbitmq_front
    bind *:5672
    default_backend rabbitmq_back

backend rabbitmq_back
    balance roundrobin
    option tcp-check
    server rabbit1 node1:5672 check inter 5s
    server rabbit2 node2:5672 check inter 5s
    server rabbit3 node3:5672 check inter 5s
\`\`\`

## Production HA Checklist

- ✅ It nhat 3 nodes
- ✅ Quorum queues cho data quan trong
- ✅ partition_handling = pause_minority
- ✅ Load balancer phia truoc
- ✅ Monitor cluster health
- ✅ Erlang cookie bao mat
- ✅ Node placement tren cac AZ/rack khac nhau
`
  },
  {
    id: 12,
    title: "Monitoring & Management",
    desc: "Management UI, CLI, Prometheus, Grafana, Health checks",
    content: `
## Management Plugin

RabbitMQ Management Plugin cung cap **web UI** va **HTTP API** de quan ly broker.

\`\`\`bash
# Enable management plugin
rabbitmq-plugins enable rabbitmq_management

# Access: http://localhost:15672
# Default: guest/guest (chi tu localhost)
\`\`\`

\`\`\`mermaid
graph LR
    subgraph "Monitoring Stack"
        UI[Management UI<br/>:15672]
        API[HTTP API<br/>:15672/api]
        CLI[rabbitmqctl CLI]
    end
    subgraph "RabbitMQ"
        B[Broker]
    end
    UI --> B
    API --> B
    CLI --> B
\`\`\`

## Key Metrics can monitor

### Queue Metrics

| Metric | Mo ta | Alert khi |
|--------|-------|-----------|
| \`messages_ready\` | Messages cho consumer | Tang lien tuc |
| \`messages_unacked\` | Messages dang xu ly | Qua cao |
| \`message_bytes\` | Tong dung luong | Gan memory limit |
| \`consumers\` | So consumers | = 0 |
| \`consumer_utilisation\` | % thoi gian consumer san sang | < 50% |

### Connection/Channel Metrics

| Metric | Mo ta | Alert khi |
|--------|-------|-----------|
| \`connections\` | Tong so connections | Dot bien tang/giam |
| \`channels\` | Tong so channels | Qua cao (leak?) |
| \`connection_created_rate\` | Toc do tao connection moi | Cao (connection churn) |

### Node Metrics

| Metric | Mo ta | Alert khi |
|--------|-------|-----------|
| \`mem_used\` | Memory su dung | > mem_limit * 0.8 |
| \`disk_free\` | Disk con lai | < disk_free_limit |
| \`fd_used / fd_total\` | File descriptors | > 80% |
| \`proc_used / proc_total\` | Erlang processes | > 80% |
| \`run_queue\` | Erlang scheduler queue | > so CPU cores |

## rabbitmqctl Commands

\`\`\`bash
# Cluster status
rabbitmqctl cluster_status

# List connections
rabbitmqctl list_connections name peer_host state

# List channels
rabbitmqctl list_channels connection name consumer_count messages_unacknowledged

# List queues voi chi tiet
rabbitmqctl list_queues name messages consumers memory type

# List exchanges
rabbitmqctl list_exchanges name type

# List bindings
rabbitmqctl list_bindings source_name destination_name routing_key

# List consumers
rabbitmqctl list_consumers queue_name channel_pid consumer_tag ack_required

# Node health check
rabbitmqctl node_health_check

# Environment
rabbitmqctl environment
\`\`\`

## HTTP API

\`\`\`bash
# List queues
curl -u admin:password http://localhost:15672/api/queues

# Queue details
curl -u admin:password http://localhost:15672/api/queues/%2F/my_queue
#                                                         ^^^ vhost "/" URL-encoded

# Publish message qua API
curl -u admin:password -X POST \\
  http://localhost:15672/api/exchanges/%2F/my_exchange/publish \\
  -H "content-type: application/json" \\
  -d '{"routing_key":"test","payload":"hello","payload_encoding":"string","properties":{}}'

# Health checks
curl http://localhost:15672/api/health/checks/alarms
curl http://localhost:15672/api/health/checks/local-alarms
curl http://localhost:15672/api/health/checks/port-listener/5672
\`\`\`

## Prometheus + Grafana

\`\`\`mermaid
graph LR
    RMQ[RabbitMQ<br/>:15692] -->|scrape| P[Prometheus]
    P --> G[Grafana Dashboard]
    G --> A[Alertmanager]
    style P fill:#e6522c,stroke:#c43e1c,color:#fff
    style G fill:#f46800,stroke:#d45a00,color:#fff
\`\`\`

\`\`\`bash
# Enable prometheus plugin
rabbitmq-plugins enable rabbitmq_prometheus

# Metrics endpoint: http://localhost:15692/metrics
\`\`\`

### Prometheus config:

\`\`\`yaml
# prometheus.yml
scrape_configs:
  - job_name: 'rabbitmq'
    scrape_interval: 15s
    static_configs:
      - targets: ['rabbitmq1:15692', 'rabbitmq2:15692', 'rabbitmq3:15692']
\`\`\`

### Key Prometheus Queries:

\`\`\`text
# Messages ready (chua duoc consume)
rabbitmq_queue_messages_ready

# Messages unacked
rabbitmq_queue_messages_unacked

# Publish rate
rate(rabbitmq_channel_messages_published_total[5m])

# Consume rate
rate(rabbitmq_channel_messages_delivered_ack_total[5m])

# Memory usage
rabbitmq_process_resident_memory_bytes

# Connection count
rabbitmq_connections

# Queue depth alert rule
- alert: RabbitMQQueueDepthHigh
  expr: rabbitmq_queue_messages_ready > 10000
  for: 5m
  labels:
    severity: warning
\`\`\`

## Alarms

RabbitMQ se **block publishers** khi:

\`\`\`mermaid
graph TD
    MEM[Memory Alarm<br/>mem_used > mem_limit] --> BLOCK[Block Publishers ❌]
    DISK[Disk Alarm<br/>disk_free < disk_free_limit] --> BLOCK
    BLOCK --> UNBLOCK[Unblock khi resource giai phong]
    style BLOCK fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

\`\`\`text
# rabbitmq.conf
# Memory limit (default 40% RAM)
vm_memory_high_watermark.relative = 0.4
# hoac absolute
vm_memory_high_watermark.absolute = 2GB

# Disk limit (default 50MB)
disk_free_limit.absolute = 2GB
# hoac relative
disk_free_limit.relative = 1.5
\`\`\`

## Log Files

\`\`\`bash
# Default log location
/var/log/rabbitmq/rabbit@hostname.log

# Log level config
# rabbitmq.conf
log.console = true
log.console.level = info
log.file.level = warning

# Connection lifecycle logging
log.connection.level = info
\`\`\`

## Health Check Script

\`\`\`bash
#!/bin/bash
# health_check.sh

# Check node is running
rabbitmqctl status > /dev/null 2>&1 || exit 1

# Check alarms
ALARMS=$(rabbitmqctl list_alarms --formatter json)
if [ "$ALARMS" != "[]" ]; then
    echo "ALARM: $ALARMS"
    exit 1
fi

# Check queue depth
DEPTH=$(rabbitmqctl list_queues name messages --formatter json | \\
    jq '[.[].messages] | max')
if [ "$DEPTH" -gt 100000 ]; then
    echo "Queue depth too high: $DEPTH"
    exit 1
fi

echo "OK"
exit 0
\`\`\`

> ⚠️ Luon set up monitoring TRUOC KHI go production. Memory alarm va disk alarm la nguyen nhan hang dau cua outage.
`
  },
  {
    id: 13,
    title: "Plugins & Extensions",
    desc: "Shovel, Federation, Delayed Message, Management, MQTT, STOMP",
    content: `
## Plugin System

RabbitMQ co he thong plugin manh me, cho phep mo rong chuc nang.

\`\`\`bash
# List plugins
rabbitmq-plugins list

# Enable plugin
rabbitmq-plugins enable rabbitmq_management

# Disable plugin
rabbitmq-plugins disable rabbitmq_management

# List enabled plugins
rabbitmq-plugins list --enabled
\`\`\`

## Shovel Plugin

Shovel **chuyen message tu queue nay sang queue khac**, co the o **broker khac nhau**.

\`\`\`mermaid
graph LR
    subgraph "Datacenter A"
        Q1[Source Queue] --> S[Shovel]
    end
    subgraph "Datacenter B"
        S -->|WAN| Q2[Destination Queue]
    end
    style S fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

\`\`\`bash
rabbitmq-plugins enable rabbitmq_shovel
rabbitmq-plugins enable rabbitmq_shovel_management
\`\`\`

### Dynamic Shovel (qua API):

\`\`\`bash
curl -u admin:password -X PUT \\
  http://localhost:15672/api/parameters/shovel/%2F/my-shovel \\
  -H "content-type: application/json" \\
  -d '{
    "value": {
      "src-protocol": "amqp091",
      "src-uri": "amqp://localhost",
      "src-queue": "source_queue",
      "dest-protocol": "amqp091",
      "dest-uri": "amqp://remote-host",
      "dest-queue": "dest_queue",
      "ack-mode": "on-confirm",
      "prefetch-count": 100
    }
  }'
\`\`\`

## Federation Plugin

Federation tao **link giua exchanges hoac queues** o cac broker khac nhau. Khac Shovel: Federation la **declarative** va tu dong.

\`\`\`mermaid
graph LR
    subgraph "Upstream Broker"
        UE[orders exchange]
    end
    subgraph "Downstream Broker"
        FE[orders exchange<br/>federated] --> Q[Local Queue]
    end
    UE -->|Federation Link| FE
    style FE fill:#7c3aed,stroke:#6d28d9,color:#fff
\`\`\`

\`\`\`bash
rabbitmq-plugins enable rabbitmq_federation
rabbitmq-plugins enable rabbitmq_federation_management
\`\`\`

### Shovel vs Federation

| Feature | Shovel | Federation |
|---------|--------|-----------|
| Direction | Queue → Queue/Exchange | Exchange → Exchange, Queue → Queue |
| Config | Manual (per shovel) | Policy-based (declarative) |
| Topology | Point-to-point | Mesh/Hub-spoke |
| Use case | Data migration, bridging | Multi-DC replication |
| Complexity | Thap | Trung binh |

## Delayed Message Plugin

Gui message ma **delay** truoc khi deliver den consumer.

\`\`\`bash
# Download va enable
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
\`\`\`

\`\`\`java
// Declare delayed exchange
Map<String, Object> args = new HashMap<>();
args.put("x-delayed-type", "direct");
channel.exchangeDeclare("delayed_exchange", "x-delayed-message", true, false, args);

// Bind queue
channel.queueBind("my_queue", "delayed_exchange", "my_key");

// Publish voi delay 30 giay
Map<String, Object> headers = new HashMap<>();
headers.put("x-delay", 30000); // 30000ms = 30s

AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .headers(headers)
    .build();

channel.basicPublish("delayed_exchange", "my_key", props,
    message.getBytes("UTF-8"));
// Message se duoc deliver sau 30 giay
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant P as Producer
    participant DE as Delayed Exchange
    participant Q as Queue
    participant C as Consumer

    P->>DE: Publish (x-delay=30000)
    Note over DE: Giu message 30s
    DE->>Q: Route after 30s
    Q->>C: Deliver
\`\`\`

**Use cases:**
- Scheduled notifications
- Retry voi delay
- Order timeout (huy don sau 30 phut)
- Rate limiting

## MQTT Plugin

Cho phep IoT devices ket noi RabbitMQ qua **MQTT protocol**.

\`\`\`bash
rabbitmq-plugins enable rabbitmq_mqtt

# MQTT port: 1883
# MQTT over WebSocket: 15675
\`\`\`

\`\`\`mermaid
graph LR
    IOT1[IoT Sensor 1] -->|MQTT| RMQ[RabbitMQ]
    IOT2[IoT Sensor 2] -->|MQTT| RMQ
    RMQ -->|AMQP| APP[Backend App]
    RMQ -->|MQTT| DASH[Dashboard]
    style RMQ fill:#7c3aed,stroke:#6d28d9,color:#fff
\`\`\`

## STOMP Plugin

Simple Text Oriented Messaging Protocol - cho phep web browsers ket noi qua WebSocket.

\`\`\`bash
rabbitmq-plugins enable rabbitmq_stomp
rabbitmq-plugins enable rabbitmq_web_stomp

# STOMP port: 61613
# STOMP over WebSocket: 15674
\`\`\`

## Consistent Hash Exchange

Phan phoi message deu cho cac queue dua tren hash cua routing key.

\`\`\`bash
rabbitmq-plugins enable rabbitmq_consistent_hash_exchange
\`\`\`

\`\`\`java
channel.exchangeDeclare("hash_exchange", "x-consistent-hash");

// Bind voi weight
channel.queueBind("queue1", "hash_exchange", "1"); // weight 1
channel.queueBind("queue2", "hash_exchange", "1"); // weight 1
channel.queueBind("queue3", "hash_exchange", "2"); // weight 2 (nhan nhieu hon)
\`\`\`

## Essential Plugins cho Production

| Plugin | Mo ta | Priority |
|--------|-------|----------|
| \`rabbitmq_management\` | Web UI + HTTP API | **Must have** |
| \`rabbitmq_prometheus\` | Prometheus metrics | **Must have** |
| \`rabbitmq_shovel\` | Cross-broker message transfer | High |
| \`rabbitmq_federation\` | Multi-DC replication | High |
| \`rabbitmq_delayed_message_exchange\` | Delayed delivery | Medium |
| \`rabbitmq_consistent_hash_exchange\` | Load distribution | Medium |

> ⚠️ Chi enable plugin can thiet. Moi plugin tieu ton resource. Test ky truoc khi enable tren production.
`
  },
  {
    id: 14,
    title: "Performance Tuning",
    desc: "Optimization, Benchmarking, Memory, Disk, Network tuning",
    content: `
## Performance Factors

\`\`\`mermaid
graph TD
    PERF[Performance] --> PUB[Publisher]
    PERF --> BROKER[Broker]
    PERF --> CON[Consumer]
    PUB --> PS[Batch publish<br/>Async confirms<br/>Persistent vs transient]
    BROKER --> BS[Queue type<br/>Memory<br/>Disk<br/>Erlang VM]
    CON --> CS[Prefetch<br/>Ack strategy<br/>Consumer count]
\`\`\`

## Publisher Optimization

### 1. Batch Publishing

\`\`\`java
// ❌ CHAM: Publish tung message, doi confirm
for (String msg : messages) {
    channel.basicPublish("", "queue", null, msg.getBytes());
    channel.waitForConfirms(); // Block moi message!
}

// ✅ NHANH: Batch publish, async confirm
channel.confirmSelect();
channel.addConfirmListener(ackCallback, nackCallback);

for (String msg : messages) {
    channel.basicPublish("", "queue", null, msg.getBytes());
}
// Khong block, confirm xu ly async
\`\`\`

### 2. Message Size

| Message size | Throughput | Recommendation |
|-------------|-----------|----------------|
| < 1KB | Rat cao | Ly tuong |
| 1-10KB | Cao | Tot |
| 10-100KB | Trung binh | Can than |
| > 100KB | Thap | Nen dung Claim Check pattern |

### 3. Persistent vs Transient

\`\`\`java
// Persistent (deliveryMode=2) - Ghi ra disk → CHAM HON
channel.basicPublish("", "queue",
    MessageProperties.PERSISTENT_TEXT_PLAIN, msg.getBytes());

// Transient (deliveryMode=1) - Chi memory → NHANH HON
channel.basicPublish("", "queue",
    MessageProperties.TEXT_PLAIN, msg.getBytes());
\`\`\`

| Mode | Throughput | Safety |
|------|-----------|--------|
| Transient | ~2-5x nhanh hon | Mat khi restart |
| Persistent | Baseline | An toan |

## Consumer Optimization

### 1. Prefetch Tuning

\`\`\`java
// Qua thap → Consumer doi message
channel.basicQos(1);    // Chi cho task cuc nang

// Can bang → Tot cho hau het truong hop
channel.basicQos(30);   // 10-50 cho task thong thuong

// Cao → Throughput max, risk overload
channel.basicQos(250);  // Cho task cuc nhe
\`\`\`

### 2. Multiple Consumers

\`\`\`mermaid
graph LR
    Q[Queue<br/>100K msg/s] --> C1[Consumer 1]
    Q --> C2[Consumer 2]
    Q --> C3[Consumer 3]
    Q --> C4[Consumer 4]
    Q --> C5[Consumer 5]
\`\`\`

\`\`\`java
// Tao nhieu consumer tren cung queue
int consumerCount = Runtime.getRuntime().availableProcessors();
for (int i = 0; i < consumerCount; i++) {
    Channel ch = connection.createChannel();
    ch.basicQos(30);
    ch.basicConsume("task_queue", false, deliverCallback, cancelCallback);
}
\`\`\`

### 3. Batch Ack

\`\`\`java
int ackEvery = 10;
int count = 0;

DeliverCallback callback = (tag, delivery) -> {
    process(delivery);
    count++;
    if (count >= ackEvery) {
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), true);
        //                                                         ^^^^ multiple=true
        count = 0;
    }
};
\`\`\`

## Broker Tuning

### Memory

\`\`\`text
# rabbitmq.conf

# Memory limit (40% cua RAM)
vm_memory_high_watermark.relative = 0.4

# Paging threshold - bat dau ghi message ra disk khi dat 50% memory limit
vm_memory_high_watermark_paging_ratio = 0.5

# Memory calculation strategy
vm_memory_calculation_strategy = allocated
\`\`\`

### Disk

\`\`\`text
# Disk limit
disk_free_limit.absolute = 5GB

# IO thread pool
# Tang cho workload write-heavy
RABBITMQ_IO_THREAD_POOL_SIZE=128
\`\`\`

### Erlang VM

\`\`\`text
# Max processes (default 1048576)
RABBITMQ_MAX_NUMBER_OF_PROCESSES=2097152

# Async threads cho I/O
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+A 128"

# Scheduler bind type
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+stbt db"
\`\`\`

## Queue Optimization

### Lazy Queues (Classic)

Ghi message ra disk ngay, giam memory usage.

\`\`\`java
Map<String, Object> args = new HashMap<>();
args.put("x-queue-mode", "lazy");
channel.queueDeclare("lazy_queue", true, false, false, args);
\`\`\`

| Feature | Default mode | Lazy mode |
|---------|-------------|-----------|
| Message storage | Memory + disk | Disk only |
| Memory usage | Cao | Thap |
| Throughput | Cao | Thap hon |
| Use case | Normal | Queue dai, burst traffic |

### Queue Length Limit

\`\`\`java
Map<String, Object> args = new HashMap<>();
// Gioi han 100K messages
args.put("x-max-length", 100000);
// Khi day: drop-head (xoa message cu) hoac reject-publish
args.put("x-overflow", "drop-head");
channel.queueDeclare("bounded_queue", true, false, false, args);
\`\`\`

## Benchmarking voi PerfTest

\`\`\`bash
# RabbitMQ PerfTest tool
# Publish 10K msg, 1KB each, 2 producers, 4 consumers
rabbitmq-perf-test \\
    --uri amqp://guest:guest@localhost \\
    --producers 2 \\
    --consumers 4 \\
    --size 1000 \\
    --confirm 100 \\
    --qos 50 \\
    --queue perf_test \\
    --flag persistent \\
    --time 60

# Output:
# id: perf-test, sending rate avg: 45123 msg/s
# id: perf-test, receiving rate avg: 44987 msg/s
\`\`\`

## Performance Checklist

| Area | Action | Impact |
|------|--------|--------|
| Publisher | Async confirms | ⬆⬆⬆ |
| Publisher | Batch publish | ⬆⬆ |
| Consumer | Prefetch 10-50 | ⬆⬆⬆ |
| Consumer | Multiple consumers | ⬆⬆ |
| Consumer | Batch ack | ⬆ |
| Broker | Memory tuning | ⬆⬆ |
| Queue | Quorum cho HA | ⬆ safety |
| Queue | Length limit | ⬆ stability |
| Network | Connection pooling | ⬆ |
| All | Monitor & adjust | ⬆⬆⬆ |

> ⚠️ LUON benchmark voi workload thuc te cua ban. Con so tuyet doi khong co y nghia neu khong match use case.
`
  },
  {
    id: 15,
    title: "Production Patterns & Best Practices",
    desc: "Saga, Event-driven, Idempotency, Circuit Breaker, Migration strategies",
    content: `
## Production Architecture

\`\`\`mermaid
graph TD
    subgraph "Microservices"
        OS[Order Service]
        PS[Payment Service]
        IS[Inventory Service]
        NS[Notification Service]
    end
    subgraph "RabbitMQ Cluster"
        E1{order_events<br/>Topic Exchange}
        E2{payment_events<br/>Topic Exchange}
        Q1[order.created]
        Q2[order.payment]
        Q3[order.notify]
        Q4[payment.completed]
        DLQ[Dead Letter Queue]
    end
    OS --> E1
    E1 --> Q1
    E1 --> Q2
    E1 --> Q3
    PS --> E2
    E2 --> Q4
    Q2 --> PS
    Q1 --> IS
    Q3 --> NS
    Q4 --> OS
    style DLQ fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

## Pattern 1: Saga Pattern

Quan ly distributed transaction qua chuoi events.

\`\`\`mermaid
sequenceDiagram
    participant OS as Order Service
    participant RMQ as RabbitMQ
    participant PS as Payment Service
    participant IS as Inventory Service

    OS->>RMQ: order.created
    RMQ->>PS: → process payment
    PS->>RMQ: payment.completed
    RMQ->>IS: → reserve inventory
    IS->>RMQ: inventory.reserved
    RMQ->>OS: → confirm order ✅

    Note over OS,IS: Neu Payment fail:
    PS->>RMQ: payment.failed
    RMQ->>OS: → cancel order ❌
\`\`\`

\`\`\`java
// Order Service - Saga Orchestrator
DeliverCallback sagaCallback = (tag, delivery) -> {
    String event = delivery.getProperties().getType();
    String orderId = getOrderId(delivery);

    switch (event) {
        case "payment.completed":
            // Tiep tuc: reserve inventory
            publish("inventory_exchange", "reserve",
                Map.of("orderId", orderId));
            break;

        case "payment.failed":
            // Compensate: cancel order
            cancelOrder(orderId);
            publish("order_exchange", "order.cancelled",
                Map.of("orderId", orderId, "reason", "payment_failed"));
            break;

        case "inventory.reserved":
            // Hoan tat saga
            completeOrder(orderId);
            publish("notification_exchange", "order.confirmed",
                Map.of("orderId", orderId));
            break;

        case "inventory.failed":
            // Compensate: refund payment
            publish("payment_exchange", "refund",
                Map.of("orderId", orderId));
            cancelOrder(orderId);
            break;
    }
    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
};
\`\`\`

## Pattern 2: Idempotent Consumer

RabbitMQ dam bao **at-least-once delivery**, nen message co the duoc gui **nhieu lan**. Consumer PHAI xu ly idempotent.

\`\`\`java
public class IdempotentConsumer {
    private final Set<String> processedIds;  // Redis/DB trong production

    DeliverCallback callback = (tag, delivery) -> {
        String messageId = delivery.getProperties().getMessageId();

        // Check da xu ly chua
        if (processedIds.contains(messageId)) {
            // Da xu ly roi, ack va bo qua
            channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
            return;
        }

        try {
            processMessage(delivery);

            // Luu messageId
            processedIds.add(messageId);

            channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(delivery.getEnvelope().getDeliveryTag(),
                false, true);
        }
    };
}

// Publisher phai set messageId
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .messageId(UUID.randomUUID().toString())
    .timestamp(new Date())
    .build();
channel.basicPublish("", "queue", props, message.getBytes());
\`\`\`

## Pattern 3: Circuit Breaker

Ngung gui message khi downstream service lien tuc fail.

\`\`\`mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Open: Failures > threshold
    Open --> HalfOpen: Timeout expired
    HalfOpen --> Closed: Success
    HalfOpen --> Open: Failure
\`\`\`

\`\`\`java
public class CircuitBreakerConsumer {
    private enum State { CLOSED, OPEN, HALF_OPEN }
    private State state = State.CLOSED;
    private int failureCount = 0;
    private long openTime = 0;
    private static final int THRESHOLD = 5;
    private static final long TIMEOUT = 30000; // 30s

    DeliverCallback callback = (tag, delivery) -> {
        if (state == State.OPEN) {
            if (System.currentTimeMillis() - openTime > TIMEOUT) {
                state = State.HALF_OPEN;
            } else {
                // Requeue, khong xu ly
                channel.basicNack(delivery.getEnvelope().getDeliveryTag(),
                    false, true);
                return;
            }
        }

        try {
            processMessage(delivery);
            channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);

            if (state == State.HALF_OPEN) {
                state = State.CLOSED;
                failureCount = 0;
            }
        } catch (Exception e) {
            failureCount++;
            if (failureCount >= THRESHOLD) {
                state = State.OPEN;
                openTime = System.currentTimeMillis();
            }
            channel.basicNack(delivery.getEnvelope().getDeliveryTag(),
                false, true);
        }
    };
}
\`\`\`

## Pattern 4: Claim Check

Cho message lon, luu payload o external storage, chi gui reference qua RabbitMQ.

\`\`\`mermaid
graph LR
    P[Producer] -->|1. Upload file| S3[S3/MinIO]
    P -->|"2. Send {s3Key}"| RMQ[RabbitMQ]
    RMQ --> C[Consumer]
    C -->|"3. Download file"| S3
    style RMQ fill:#7c3aed,stroke:#6d28d9,color:#fff
\`\`\`

\`\`\`java
// Producer
String s3Key = s3Client.upload(largePayload);
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .headers(Map.of("x-claim-check", s3Key))
    .build();
channel.basicPublish("", "queue", props,
    "claim-check".getBytes());

// Consumer
String s3Key = delivery.getProperties().getHeaders()
    .get("x-claim-check").toString();
byte[] payload = s3Client.download(s3Key);
processLargePayload(payload);
\`\`\`

## Pattern 5: Transactional Outbox

Dam bao database write va message publish xay ra **dong thoi** (atomic).

\`\`\`mermaid
sequenceDiagram
    participant App as Application
    participant DB as Database
    participant OBP as Outbox Poller
    participant RMQ as RabbitMQ

    App->>DB: BEGIN TX
    App->>DB: INSERT order
    App->>DB: INSERT outbox_event
    App->>DB: COMMIT TX ✅
    Note over OBP: Poll moi 1s
    OBP->>DB: SELECT unpublished events
    OBP->>RMQ: Publish event
    OBP->>DB: Mark as published
\`\`\`

\`\`\`java
// 1. Trong transaction
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order);
    outboxRepository.save(new OutboxEvent(
        "order.created",
        objectMapper.writeValueAsString(order)
    ));
}

// 2. Outbox poller
@Scheduled(fixedDelay = 1000)
public void publishOutboxEvents() {
    List<OutboxEvent> events = outboxRepository.findUnpublished();
    for (OutboxEvent event : events) {
        try {
            channel.basicPublish("events", event.getRoutingKey(),
                MessageProperties.PERSISTENT_TEXT_PLAIN,
                event.getPayload().getBytes());
            event.setPublished(true);
            outboxRepository.save(event);
        } catch (Exception e) {
            // Se retry lan sau
        }
    }
}
\`\`\`

## Production Checklist

### Infrastructure
- ✅ Cluster 3+ nodes, cac AZ khac nhau
- ✅ Quorum queues cho data quan trong
- ✅ Load balancer (HAProxy)
- ✅ TLS cho moi connection
- ✅ Monitoring (Prometheus + Grafana)
- ✅ Alerting (queue depth, memory, disk)

### Application
- ✅ Publisher confirms (async)
- ✅ Manual ack + prefetch
- ✅ Dead Letter Exchange + retry logic
- ✅ Idempotent consumers
- ✅ Connection recovery enabled
- ✅ Message serialization (JSON/Protobuf)
- ✅ Correlation ID cho tracing

### Operations
- ✅ Backup policies
- ✅ Capacity planning
- ✅ Runbook cho common incidents
- ✅ Log aggregation
- ✅ Regular performance testing

> ⚠️ KHONG co silver bullet. Moi pattern co trade-offs. Hieu ro van de truoc khi ap dung pattern.
`
  }
]
