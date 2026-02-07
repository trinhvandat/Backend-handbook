export const kafkaLessons = [
  {
    id: 1,
    title: "Kafka la gi?",
    desc: "Event Streaming Platform - Tai sao Kafka thong tri the gioi distributed systems",
    content: `
## Kafka la gi?

Apache Kafka la mot **distributed event streaming platform** - nen tang xu ly luong su kien phan tan.

Kafka KHONG phai message queue truyen thong. No la mot **distributed commit log** - mot so ghi phan tan, ben vung, co thu tu.

\`\`\`mermaid
graph LR
    P1[Producer 1] --> K[Apache Kafka Cluster]
    P2[Producer 2] --> K
    P3[Producer 3] --> K
    K --> C1[Consumer 1]
    K --> C2[Consumer 2]
    K --> C3[Consumer 3]
    K --> C4[Consumer 4]
    style K fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

## Tai sao can Kafka?

**Van de**: Microservices can giao tiep voi nhau, nhung:

- **Point-to-point** phuc tap khi scale (n services = n*(n-1) connections)
- **Synchronous** goi truc tiep gay coupling chat
- **Mat data** khi service downstream chet

\`\`\`mermaid
graph TD
    subgraph "Khong co Kafka - Mesh phuc tap"
        A1[Order Service] --> B1[Payment Service]
        A1 --> C1[Inventory Service]
        A1 --> D1[Email Service]
        B1 --> C1
        B1 --> D1
        C1 --> D1
    end
\`\`\`

\`\`\`mermaid
graph TD
    subgraph "Co Kafka - Clean Architecture"
        A2[Order Service] --> K2[Kafka]
        K2 --> B2[Payment Service]
        K2 --> C2[Inventory Service]
        K2 --> D2[Email Service]
    end
\`\`\`

## Kafka vs Message Queue truyen thong

| Feature | Kafka | RabbitMQ | Redis Pub/Sub |
|---------|-------|----------|---------------|
| **Mo hinh** | Distributed Log | Message Queue | Pub/Sub |
| **Luu tru** | Disk (configurable) | Memory + Disk | Memory only |
| **Replay** | Co (doc lai tu bat ky offset) | Khong (xoa sau consume) | Khong |
| **Throughput** | Hang trieu msg/sec | Hang nghin msg/sec | Hang tram nghin msg/sec |
| **Ordering** | Co (trong partition) | Khong dam bao | Khong dam bao |
| **Consumer Groups** | Co (built-in) | Co (competing consumers) | Khong |
| **Use case** | Event streaming, log, ETL | Task queue, RPC | Cache invalidation, realtime |

## Kafka Ecosystem

\`\`\`mermaid
graph TD
    subgraph "Kafka Ecosystem"
        KC[Kafka Connect] --> KB[Kafka Broker Cluster]
        KB --> KS[Kafka Streams]
        KB --> KSQL[ksqlDB]
        SR[Schema Registry] --> KB
        KB --> MM[MirrorMaker 2]
    end
    DB[(Database)] --> KC
    API[REST API] --> KC
    KS --> APP[Application]
    KSQL --> DASH[Dashboard]
    MM --> KB2[Remote Cluster]
\`\`\`

## Core APIs

| API | Muc dich | Vi du |
|-----|----------|-------|
| **Producer API** | Gui message vao topic | Order service gui event |
| **Consumer API** | Doc message tu topic | Payment service nhan event |
| **Streams API** | Xu ly stream realtime | Tinh tong doanh thu realtime |
| **Connect API** | Ket noi he thong ben ngoai | Sync MySQL to Elasticsearch |
| **Admin API** | Quan ly cluster | Tao topic, xem consumer groups |

## Use Cases thuc te

1. **Event Sourcing**: Luu moi thay doi nhu event (banking transactions)
2. **Log Aggregation**: Thu thap logs tu nhieu services
3. **Stream Processing**: Xu ly data realtime (fraud detection)
4. **Data Pipeline**: ETL tu database sang data warehouse
5. **Metrics & Monitoring**: Thu thap metrics tu microservices
6. **Activity Tracking**: Tracking user behavior (clicks, views)

> ⚠️ Kafka phu hop cho high-throughput, event-driven systems. Khong nen dung cho request-reply pattern don gian.
    `
  },
  {
    id: 2,
    title: "Topics, Partitions & Offsets",
    desc: "Data model cot loi cua Kafka - hieu dung thi moi lam dung",
    content: `
## Topic

**Topic** = mot **category** hoac **feed** chua messages. Giong nhu mot bang trong database.

- Producer gui message vao topic
- Consumer doc message tu topic
- Mot topic co the co nhieu producers va consumers

## Partitions - Chia de tri

Moi topic duoc chia thanh **partitions** - day la bi quyet giup Kafka scale.

\`\`\`mermaid
graph TD
    subgraph "Topic: orders"
        P0["Partition 0<br/>offset: 0,1,2,3,4,5"]
        P1["Partition 1<br/>offset: 0,1,2,3"]
        P2["Partition 2<br/>offset: 0,1,2,3,4,5,6,7"]
    end
    PR[Producer] --> P0
    PR --> P1
    PR --> P2
\`\`\`

### Tai sao can Partitions?

- **Parallelism**: Nhieu consumers doc song song tu cac partitions khac nhau
- **Scalability**: Data phan tan tren nhieu brokers
- **Ordering**: Thu tu duoc dam bao TRONG MOI partition (khong phai across partitions)

## Offsets

**Offset** = so thu tu duy nhat cua message TRONG MOT partition.

\`\`\`
Partition 0:
┌─────┬─────┬─────┬─────┬─────┬─────┐
│  0  │  1  │  2  │  3  │  4  │  5  │ ← Offsets
│ msg │ msg │ msg │ msg │ msg │ msg │
└─────┴─────┴─────┴─────┴─────┴─────┘
                              ↑
                        Consumer dang doc o day
\`\`\`

### Dac diem cua Offsets:

- **Immutable**: Offset da gan khong bao gio thay doi
- **Incremental**: Tang dan trong moi partition
- **Per-partition**: Offset 5 o Partition 0 KHAC voi Offset 5 o Partition 1
- **Consumer tracking**: Moi consumer group theo doi offset rieng

## Message Structure

\`\`\`javascript
// Mot Kafka message (Record) gom:
{
    key: "user-123",           // Key (optional) - dung de partitioning
    value: "{\\"action\\":\\"purchase\\"}", // Value - noi dung chinh
    headers: {                 // Headers (optional) - metadata
        "source": "web-app",
        "trace-id": "abc-123"
    },
    timestamp: 1700000000000,  // Timestamp
    partition: 0,              // Partition duoc gan
    offset: 42                 // Offset trong partition
}
\`\`\`

## Key va Partitioning

\`\`\`mermaid
graph TD
    M1["Message key=A"] --> H[Hash Function]
    M2["Message key=B"] --> H
    M3["Message key=A"] --> H
    M4["Message key=C"] --> H
    H -->|"hash(A) % 3 = 0"| P0[Partition 0: A, A]
    H -->|"hash(B) % 3 = 1"| P1[Partition 1: B]
    H -->|"hash(C) % 3 = 2"| P2[Partition 2: C]
\`\`\`

**Quy tac**:
- **Co key**: Messages cung key LUON vao cung partition → dam bao thu tu
- **Khong co key**: Round-robin → phan phoi deu nhung KHONG dam bao thu tu

## Retention Policy

| Config | Mo ta | Default |
|--------|-------|---------|
| \`retention.ms\` | Giu message bao lau | 7 ngay (604800000ms) |
| \`retention.bytes\` | Giu toi da bao nhieu bytes | -1 (unlimited) |
| \`cleanup.policy\` | delete hoac compact | delete |

\`\`\`
Timeline retention.ms = 7 days:

Day 1    Day 2    Day 3  ...  Day 7    Day 8
[msg1]   [msg2]   [msg3]      [msg7]   [msg8]
  ↑                                       ↑
  Bi xoa sau 7 ngay                  Moi nhat
\`\`\`

## Log Compaction

Giu lai **message cuoi cung** cho moi key. Huu ich cho storing state.

\`\`\`
Truoc compaction:
Key=A: v1, v2, v3
Key=B: v1, v2
Key=C: v1

Sau compaction:
Key=A: v3        ← Chi giu ban moi nhat
Key=B: v2
Key=C: v1
\`\`\`

> ⚠️ Chon so luong partitions can than! Tang partitions de, nhung KHONG THE giam sau khi tao.
    `
  },
  {
    id: 3,
    title: "Producers Deep Dive",
    desc: "Gui message hieu qua - Batching, Acks, Idempotence, Compression",
    content: `
## Producer Architecture

\`\`\`mermaid
graph LR
    APP[Application] --> S[Serializer]
    S --> P[Partitioner]
    P --> B1[Batch - Partition 0]
    P --> B2[Batch - Partition 1]
    P --> B3[Batch - Partition 2]
    B1 --> NW[Network Thread]
    B2 --> NW
    B3 --> NW
    NW --> K[Kafka Broker]
\`\`\`

## Producer Flow chi tiet

\`\`\`mermaid
sequenceDiagram
    participant App as Application
    participant Prod as Producer
    participant Ser as Serializer
    participant Part as Partitioner
    participant Buf as Record Accumulator
    participant Send as Sender Thread
    participant Broker as Kafka Broker

    App->>Prod: send(record)
    Prod->>Ser: serialize key + value
    Ser->>Part: xac dinh partition
    Part->>Buf: them vao batch
    Note over Buf: Doi batch.size hoac linger.ms
    Buf->>Send: batch day hoac timeout
    Send->>Broker: gui batch qua network
    Broker-->>Send: ack (thanh cong/that bai)
    Send-->>App: callback
\`\`\`

## Acks - Muc do dam bao

\`\`\`mermaid
graph TD
    subgraph "acks=0 - Fire and Forget"
        P0[Producer] -->|"Gui, khong doi"| B0[Broker]
        B0 -.->|"Khong phan hoi"| P0
    end
\`\`\`

| acks | Mo ta | Throughput | Durability | Khi nao dung |
|------|-------|------------|------------|-------------|
| **0** | Khong doi ack | Cao nhat | Thap nhat - co the mat data | Metrics, logs khong quan trong |
| **1** | Doi leader ack | Trung binh | Trung binh - mat neu leader chet | Default, da so use cases |
| **all (-1)** | Doi tat ca ISR ack | Thap nhat | Cao nhat - khong mat data | Financial data, critical events |

## Code: Producer co ban

\`\`\`java
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
props.put(ProducerConfig.ACKS_CONFIG, "all");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// Async send voi callback
producer.send(
    new ProducerRecord<>("orders", "user-123", "{\\"item\\":\\"laptop\\"}"),
    (metadata, exception) -> {
        if (exception != null) {
            System.err.println("Send failed: " + exception.getMessage());
        } else {
            System.out.printf("Sent to partition %d, offset %d%n",
                metadata.partition(), metadata.offset());
        }
    }
);

producer.flush();
producer.close();
\`\`\`

## Batching & Compression

\`\`\`
Producer gui messages theo BATCH, khong phai tung cai:

batch.size = 16KB (default)
linger.ms = 0ms (default - gui ngay)

Nen tang batch.size va linger.ms de tang throughput:

linger.ms = 0:   [msg1] → send  [msg2] → send  [msg3] → send
                  3 network calls

linger.ms = 20:  [msg1, msg2, msg3] → send
                  1 network call → 3x it network overhead!
\`\`\`

| Config | Mo ta | Default | Recommend |
|--------|-------|---------|-----------|
| \`batch.size\` | Kich thuoc batch (bytes) | 16384 (16KB) | 32768-65536 |
| \`linger.ms\` | Doi bao lau truoc khi gui | 0 | 5-20ms |
| \`compression.type\` | Nen data | none | lz4 hoac zstd |
| \`buffer.memory\` | Tong buffer cua producer | 32MB | 64MB+ |

### So sanh Compression

| Algorithm | Ti le nen | Toc do | CPU | Recommend |
|-----------|-----------|--------|-----|-----------|
| **none** | 1x | - | 0% | Dev/test |
| **gzip** | Tot nhat (~70%) | Cham | Cao | Bandwidth limited |
| **snappy** | Kha (~50%) | Nhanh | Thap | General purpose |
| **lz4** | Kha (~55%) | Nhanh nhat | Thap nhat | High throughput |
| **zstd** | Tot (~65%) | Nhanh | Trung binh | Best balance |

## Idempotent Producer

**Van de**: Network glitch → Producer retry → Message bi duplicate!

\`\`\`mermaid
sequenceDiagram
    participant P as Producer
    participant B as Broker

    P->>B: Send msg (seq=0)
    B-->>P: ACK bi mat!
    Note over P: Timeout → Retry
    P->>B: Send msg (seq=0) AGAIN
    Note over B: Khong co idempotence: 2 ban ghi trung!
    Note over B: Co idempotence: Broker nhan ra seq=0 da co → skip
\`\`\`

\`\`\`java
// Bat idempotent producer
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
// Tu dong set: acks=all, retries=MAX, max.in.flight.requests=5
\`\`\`

## Partitioning Strategies

\`\`\`java
// Strategy 1: Key-based (default)
// Cung key → cung partition → dam bao ordering
new ProducerRecord<>("orders", "user-123", value);

// Strategy 2: Round-robin (null key)
// Phan phoi deu, khong dam bao order
new ProducerRecord<>("orders", null, value);

// Strategy 3: Custom Partitioner
public class GeoPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                         Object value, byte[] valueBytes, Cluster cluster) {
        String region = extractRegion((String) key);
        int numPartitions = cluster.partitionCountForTopic(topic);
        return Math.abs(region.hashCode()) % numPartitions;
    }
}
\`\`\`

> ⚠️ Luon bat \`enable.idempotence=true\` trong production. Khong co ly do gi de tat!
    `
  },
  {
    id: 4,
    title: "Consumers & Consumer Groups",
    desc: "Doc message, Consumer Groups, Offset Management, Rebalancing",
    content: `
## Consumer Basics

Consumer **poll** messages tu Kafka (pull model, khong phai push).

\`\`\`mermaid
sequenceDiagram
    participant C as Consumer
    participant B as Kafka Broker

    loop Every poll interval
        C->>B: poll(timeout=1000ms)
        B-->>C: Batch of records
        Note over C: Xu ly records
        C->>B: commit offsets
    end
\`\`\`

## Consumer Groups - Bi quyet Scale

**Consumer Group** = nhom consumers chia nhau doc partitions cua 1 topic.

\`\`\`mermaid
graph TD
    subgraph "Topic: orders (6 partitions)"
        P0[P0]
        P1[P1]
        P2[P2]
        P3[P3]
        P4[P4]
        P5[P5]
    end

    subgraph "Consumer Group A (3 consumers)"
        C1["Consumer 1<br/>doc P0, P1"]
        C2["Consumer 2<br/>doc P2, P3"]
        C3["Consumer 3<br/>doc P4, P5"]
    end

    P0 --> C1
    P1 --> C1
    P2 --> C2
    P3 --> C2
    P4 --> C3
    P5 --> C3
\`\`\`

### Quy tac vang

- **1 partition** chi duoc doc boi **1 consumer** trong group
- **1 consumer** co the doc **nhieu partitions**
- Neu consumers > partitions → consumer thua se **idle**
- Nhieu consumer groups doc CUNG topic → moi group nhan TAT CA messages

## Partition Assignment Strategies

| Strategy | Mo ta | Use case |
|----------|-------|----------|
| **RangeAssignor** | Chia partition theo range | Default, topic co it partitions |
| **RoundRobinAssignor** | Round-robin across consumers | Phan phoi deu |
| **StickyAssignor** | Giu assignment cu khi rebalance | Giam downtime |
| **CooperativeStickyAssignor** | Incremental rebalance | Production recommend |

## Offset Management

\`\`\`mermaid
graph LR
    subgraph "Partition 0"
        O0[0] --> O1[1] --> O2[2] --> O3[3] --> O4[4] --> O5[5]
    end

    CO["Committed Offset = 3<br/>(da xu ly xong)"] -.-> O3
    CP["Current Position = 5<br/>(dang doc)"] -.-> O5
    LEO["Log End Offset = 5<br/>(message moi nhat)"] -.-> O5

    style CO fill:#22c55e,color:#fff
    style CP fill:#3b82f6,color:#fff
    style LEO fill:#ef4444,color:#fff
\`\`\`

### Auto Commit vs Manual Commit

\`\`\`java
// AUTO COMMIT (default) - don gian nhung co the mat hoac duplicate
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, 5000);
// Van de: Crash TRUOC khi auto-commit → xu ly lai (duplicate)
//         Crash SAU commit nhung TRUOC xu ly → mat data

// MANUAL COMMIT - kiem soat chinh xac
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));
    for (ConsumerRecord<String, String> record : records) {
        processRecord(record);
    }
    consumer.commitSync(); // Commit SAU khi xu ly xong
}
\`\`\`

### Commit Strategies

\`\`\`java
// 1. commitSync() - Block cho den khi thanh cong
consumer.commitSync(); // An toan nhung cham

// 2. commitAsync() - Khong block
consumer.commitAsync((offsets, exception) -> {
    if (exception != null) {
        log.error("Commit failed: {}", offsets, exception);
    }
});

// 3. Commit specific offsets (tot nhat)
for (TopicPartition partition : records.partitions()) {
    List<ConsumerRecord<String, String>> partRecords = records.records(partition);
    long lastOffset = partRecords.get(partRecords.size() - 1).offset();
    consumer.commitSync(Map.of(
        partition, new OffsetAndMetadata(lastOffset + 1)
    ));
}
\`\`\`

## Consumer Code

\`\`\`java
Properties props = new Properties();
props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(ConsumerConfig.GROUP_ID_CONFIG, "order-processor");
props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest"); // hoac "latest"
props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(List.of("orders"));

try {
    while (true) {
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));
        for (ConsumerRecord<String, String> record : records) {
            System.out.printf("key=%s, value=%s, partition=%d, offset=%d%n",
                record.key(), record.value(), record.partition(), record.offset());
        }
        consumer.commitSync();
    }
} finally {
    consumer.close();
}
\`\`\`

## Rebalancing

**Rebalancing** xay ra khi thanh vien consumer group thay doi.

\`\`\`mermaid
sequenceDiagram
    participant GC as Group Coordinator
    participant C1 as Consumer 1
    participant C2 as Consumer 2
    participant C3 as Consumer 3 (moi)

    Note over C1,C2: Dang doc binh thuong
    C3->>GC: JoinGroup request
    GC->>C1: Revoke partitions!
    GC->>C2: Revoke partitions!
    Note over C1,C2: Commit offsets, dung xu ly
    C1->>GC: JoinGroup
    C2->>GC: JoinGroup
    GC->>C1: Nhan partition 0,1
    GC->>C2: Nhan partition 2,3
    GC->>C3: Nhan partition 4,5
    Note over C1,C3: Tiep tuc xu ly
\`\`\`

> ⚠️ Rebalancing gay **downtime** cho consumer group! Dung \`CooperativeStickyAssignor\` de giam thieu.
    `
  },
  {
    id: 5,
    title: "Brokers & Cluster Architecture",
    desc: "Kafka Server, Controller, ZooKeeper vs KRaft, Bootstrap",
    content: `
## Broker la gi?

**Broker** = mot Kafka server. Mot cluster co nhieu brokers.

\`\`\`mermaid
graph TD
    subgraph "Kafka Cluster"
        B1["Broker 1 (ID: 1)<br/>Controller"]
        B2["Broker 2 (ID: 2)"]
        B3["Broker 3 (ID: 3)"]
    end

    subgraph "Topic: orders (3 partitions, RF=3)"
        P0["P0: Leader=B1, Followers=B2,B3"]
        P1["P1: Leader=B2, Followers=B1,B3"]
        P2["P2: Leader=B3, Followers=B1,B2"]
    end

    B1 --- P0
    B2 --- P1
    B3 --- P2

    style B1 fill:#22c55e,color:#fff
\`\`\`

### Vai tro cua Broker:

- **Nhan** messages tu Producers
- **Luu tru** messages tren disk
- **Phuc vu** messages cho Consumers
- **Replicate** data sang brokers khac
- **Quan ly** partitions duoc gan

## Bootstrap Servers

\`\`\`
Q: Lam sao Producer/Consumer biet ket noi den broker nao?

A: Chi can biet 1-2 broker (bootstrap servers),
   Kafka se tra ve metadata cua TOAN BO cluster.

bootstrap.servers = "broker1:9092,broker2:9092"

Flow:
Client → Ket noi broker1 → Nhan metadata (tat ca brokers, topics, partitions)
       → Ket noi truc tiep den broker chua partition can thiet
\`\`\`

## Controller

**Controller** = mot broker dac biet, quan ly cluster.

### Nhiem vu:

- Theo doi broker nao song/chet
- Bau chon leader moi khi leader partition chet
- Thong bao thay doi metadata cho cac brokers

## ZooKeeper vs KRaft

\`\`\`mermaid
graph TD
    subgraph "Cu: ZooKeeper Mode"
        ZK[ZooKeeper Ensemble]
        ZK --- BK1[Broker 1]
        ZK --- BK2[Broker 2]
        ZK --- BK3[Broker 3]
    end
\`\`\`

\`\`\`mermaid
graph TD
    subgraph "Moi: KRaft Mode - Kafka 3.3+"
        BN1["Broker 1<br/>(Controller)"]
        BN2["Broker 2<br/>(Controller)"]
        BN3["Broker 3<br/>(Controller)"]
        BN4[Broker 4]
        BN5[Broker 5]
        BN1 <--> BN2
        BN2 <--> BN3
        BN1 <--> BN3
        BN4 --> BN1
        BN5 --> BN1
    end
\`\`\`

| Feature | ZooKeeper | KRaft |
|---------|-----------|-------|
| **Dependency** | Can ZK cluster rieng | Khong can dependency ngoai |
| **Scalability** | Gioi han boi ZK | Scale tot hon |
| **Recovery** | Cham (phu thuoc ZK) | Nhanh hon (Raft consensus) |
| **Complexity** | 2 he thong can van hanh | 1 he thong duy nhat |
| **Status** | Deprecated tu Kafka 3.5 | Production-ready tu 3.3 |

## Data Storage

\`\`\`
/kafka-logs/
├── orders-0/              ← Topic: orders, Partition: 0
│   ├── 00000000000000000000.log    ← Segment file (messages)
│   ├── 00000000000000000000.index  ← Offset index
│   ├── 00000000000000000000.timeindex ← Timestamp index
│   └── leader-epoch-checkpoint
├── orders-1/
├── orders-2/
└── __consumer_offsets-0/  ← Internal topic luu consumer offsets
\`\`\`

### Segments

\`\`\`
Partition = nhieu Segments (files):

Segment 0: offsets 0-999      (1GB, CLOSED - read only)
Segment 1: offsets 1000-1999  (1GB, CLOSED - read only)
Segment 2: offsets 2000-2345  (500MB, ACTIVE - dang ghi)

Config:
log.segment.bytes = 1073741824  (1GB - kich thuoc segment)
log.segment.ms = 604800000      (7 ngay - thoi gian segment)
\`\`\`

## Network Architecture

\`\`\`
Moi Broker co:
┌─────────────────────────────────────────────────┐
│ Acceptor Thread (1)                              │
│   Nhan connection moi                            │
│                                                  │
│ Network Threads (num.network.threads = 3)        │
│   Doc request tu socket, gui den request queue   │
│                                                  │
│ Request Handler Threads (num.io.threads = 8)     │
│   Xu ly request (read/write disk)                │
│                                                  │
│ Response Queue                                    │
│   Network threads gui response ve client          │
└─────────────────────────────────────────────────┘
\`\`\`

> ⚠️ Tu Kafka 3.5, ZooKeeper bi deprecated. Moi deployment nen dung KRaft mode.
    `
  },
  {
    id: 6,
    title: "Replication & Fault Tolerance",
    desc: "Leader-Follower, ISR, min.insync.replicas, Unclean Leader Election",
    content: `
## Replication Model

Moi partition co **1 Leader** va **N-1 Followers** (N = replication factor).

\`\`\`mermaid
graph LR
    P[Producer] -->|"Write"| L["Broker 1<br/>Leader P0"]
    L -->|"Replicate"| F1["Broker 2<br/>Follower P0"]
    L -->|"Replicate"| F2["Broker 3<br/>Follower P0"]
    C[Consumer] -->|"Read"| L

    style L fill:#22c55e,color:#fff
    style F1 fill:#3b82f6,color:#fff
    style F2 fill:#3b82f6,color:#fff
\`\`\`

### Quy tac:

- **Writes** LUON di qua Leader
- **Reads** mac dinh tu Leader (tu Kafka 2.4 co the doc tu Follower)
- Followers **pull** data tu Leader (giong Consumer)

## ISR - In-Sync Replicas

**ISR** = tap hop replicas dang dong bo voi Leader.

\`\`\`mermaid
graph TD
    subgraph "Partition 0 - RF=3"
        L["Leader (Broker 1)<br/>Offset: 100"]
        F1["Follower (Broker 2)<br/>Offset: 99 - TRONG ISR"]
        F2["Follower (Broker 3)<br/>Offset: 85 - NGOAI ISR!"]
    end
    L --> F1
    L --> F2

    style L fill:#22c55e,color:#fff
    style F1 fill:#3b82f6,color:#fff
    style F2 fill:#ef4444,color:#fff
\`\`\`

| Config | Mo ta | Default |
|--------|-------|---------|
| \`replica.lag.time.max.ms\` | Thoi gian toi da follower duoc phep lag | 30000 (30s) |
| \`min.insync.replicas\` | So ISR toi thieu de accept write | 1 |

## Acks + ISR Interaction

\`\`\`
replication.factor = 3
min.insync.replicas = 2

acks=all:
  Producer gui message → Leader nhan
  → DOI it nhat 2 ISR (bao gom Leader) xac nhan
  → Moi tra loi Producer

Neu chi con 1 ISR (Leader) va min.insync.replicas=2:
  → Producer nhan NotEnoughReplicasException
  → Data KHONG bi mat nhung cung KHONG ghi duoc!
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant P as Producer
    participant L as Leader
    participant F1 as Follower 1 (ISR)
    participant F2 as Follower 2 (ISR)

    P->>L: Send message (acks=all)
    L->>L: Ghi vao local log
    F1->>L: Fetch request
    L-->>F1: Data
    F1->>F1: Ghi vao local log
    F2->>L: Fetch request
    L-->>F2: Data
    F2->>F2: Ghi vao local log
    L-->>P: ACK (all ISR da xac nhan)
\`\`\`

## Leader Election

\`\`\`
Khi Leader chet:

1. Controller phat hien Leader khong phan hoi
2. Controller chon Leader moi TU ISR
3. Controller thong bao cho tat ca brokers
4. Producer/Consumer chuyen sang Leader moi

Timeline:
Leader die → Detection (~10s) → Election (~ms) → Recovery
\`\`\`

## Unclean Leader Election

**Van de**: Tat ca ISR chet, chi con follower NGOAI ISR (data cu).

| Config | Hanh vi | Hau qua |
|--------|---------|---------|
| \`unclean.leader.election.enable=false\` | Partition OFFLINE cho den khi ISR member quay lai | Khong mat data, nhung co downtime |
| \`unclean.leader.election.enable=true\` | Follower ngoai ISR thanh Leader | Co the MAT DATA nhung available |

## Recommend Production Settings

\`\`\`java
// Topic-level configs
replication.factor = 3          // 3 ban sao
min.insync.replicas = 2         // it nhat 2 ISR

// Producer
acks = all                      // Doi tat ca ISR
enable.idempotence = true       // Chong duplicate
retries = Integer.MAX_VALUE     // Retry khong gioi han

// Broker
unclean.leader.election.enable = false  // Khong chap nhan mat data
default.replication.factor = 3
\`\`\`

## High Water Mark

\`\`\`
Leader:    [0] [1] [2] [3] [4] [5] [6] [7]
Follower1: [0] [1] [2] [3] [4] [5]
Follower2: [0] [1] [2] [3] [4]
                                ↑
                        High Water Mark = 4
                        (Consumer chi doc duoc den day)

Consumers KHONG doc duoc messages chua duoc replicate!
→ Dam bao consistency
\`\`\`

> ⚠️ LUON dat \`min.insync.replicas=2\` voi \`acks=all\` cho production. Day la combo an toan nhat.
    `
  },
  {
    id: 7,
    title: "Message Delivery Guarantees",
    desc: "At-most-once, At-least-once, Exactly-once - chon dung cho use case",
    content: `
## 3 muc do dam bao

\`\`\`mermaid
graph TD
    subgraph "At-most-once"
        A1[Gui message] --> A2[Commit offset]
        A2 --> A3[Xu ly message]
        A3 -.->|"Crash o day → MAT message"| A4[Lost!]
    end
\`\`\`

\`\`\`mermaid
graph TD
    subgraph "At-least-once"
        B1[Gui message] --> B2[Xu ly message]
        B2 --> B3[Commit offset]
        B2 -.->|"Crash o day → xu ly LAI"| B4[Duplicate!]
    end
\`\`\`

\`\`\`mermaid
graph TD
    subgraph "Exactly-once"
        C1[Gui message] --> C2["Xu ly + Commit<br/>(ATOMIC transaction)"]
        C2 --> C3[Done - khong mat, khong trung]
    end
\`\`\`

## So sanh chi tiet

| | At-most-once | At-least-once | Exactly-once |
|---|---|---|---|
| **Mat data?** | Co the | Khong | Khong |
| **Duplicate?** | Khong | Co the | Khong |
| **Performance** | Nhanh nhat | Nhanh | Cham nhat |
| **Complexity** | Don gian | Don gian | Phuc tap |
| **Use case** | Metrics, logs | Da so cases | Financial, billing |

## At-most-once Pattern

\`\`\`java
// Commit TRUOC khi xu ly → co the mat message
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));
    // Auto commit o day (truoc khi xu ly!)
    for (ConsumerRecord<String, String> record : records) {
        processRecord(record); // Crash o day → message bi mat
    }
}
\`\`\`

## At-least-once Pattern

\`\`\`java
// Xu ly TRUOC khi commit → co the duplicate
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));
    for (ConsumerRecord<String, String> record : records) {
        processRecord(record); // Xu ly truoc
    }
    consumer.commitSync(); // Commit sau → crash truoc dong nay = xu ly lai
}

// Lam cho xu ly idempotent de chong duplicate:
void processRecord(ConsumerRecord<String, String> record) {
    String eventId = extractEventId(record);
    if (!processedEvents.contains(eventId)) { // Check duplicate
        doProcess(record);
        processedEvents.add(eventId);
    }
}
\`\`\`

## Exactly-once: Transactional Pattern

\`\`\`java
// Producer config
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
props.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "processor-1");

// Consumer config
consumerProps.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
consumerProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

// Init
producer.initTransactions();

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(200));
    if (records.isEmpty()) continue;

    producer.beginTransaction();
    try {
        for (ConsumerRecord<String, String> record : records) {
            // Xu ly va produce ket qua
            String result = process(record.value());
            producer.send(new ProducerRecord<>("output-topic", record.key(), result));
        }

        // Commit consumer offsets TRONG transaction
        Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();
        for (TopicPartition tp : records.partitions()) {
            var partRecords = records.records(tp);
            long lastOffset = partRecords.get(partRecords.size() - 1).offset();
            offsets.put(tp, new OffsetAndMetadata(lastOffset + 1));
        }
        producer.sendOffsetsToTransaction(offsets, consumer.groupMetadata());

        producer.commitTransaction(); // ALL-OR-NOTHING
    } catch (KafkaException e) {
        producer.abortTransaction(); // Rollback tat ca
    }
}
\`\`\`

## Exactly-once Flow

\`\`\`mermaid
sequenceDiagram
    participant C as Consumer
    participant P as Transactional Producer
    participant TC as Transaction Coordinator
    participant IB as Input Broker
    participant OB as Output Broker

    C->>IB: poll() - doc messages
    P->>TC: beginTransaction()
    P->>OB: send() - gui ket qua
    P->>TC: sendOffsetsToTransaction()
    P->>TC: commitTransaction()
    TC->>IB: Commit offsets
    TC->>OB: Mark messages visible
    Note over TC: Tat ca xay ra ATOMIC!
\`\`\`

## Chon dung guarantee

\`\`\`
Q: Nen dung guarantee nao?

Metrics/Logs        → At-most-once   (mat 1-2 record khong sao)
E-commerce orders   → At-least-once  (duplicate xu ly duoc, mat thi khong)
Banking/Financial   → Exactly-once   (khong duoc mat, khong duoc trung)
\`\`\`

> ⚠️ Exactly-once trong Kafka chi ap dung cho pattern: Kafka → Process → Kafka. Neu output la external system (DB, API), ban can idempotent consumer.
    `
  },
  {
    id: 8,
    title: "Performance Tuning",
    desc: "Producer, Consumer, Broker tuning - dat throughput toi da",
    content: `
## Producer Tuning

\`\`\`mermaid
graph LR
    subgraph "Producer Pipeline"
        A[App Thread] -->|send| B[Serializer]
        B --> C[Partitioner]
        C --> D[Record Accumulator]
        D -->|"batch.size / linger.ms"| E[Sender Thread]
        E -->|"max.in.flight"| F[Broker]
    end
\`\`\`

### Key Producer Configs

| Config | Mo ta | Default | Throughput | Latency |
|--------|-------|---------|------------|---------|
| \`batch.size\` | Kich thuoc batch | 16KB | Tang = cao hon | Tang = cao hon |
| \`linger.ms\` | Thoi gian doi batch | 0 | Tang = cao hon | Tang = cao hon |
| \`compression.type\` | Nen data | none | lz4/zstd tot hon | Tang chut |
| \`buffer.memory\` | Tong buffer | 32MB | Tang neu can | - |
| \`max.in.flight.requests.per.connection\` | Requests song song | 5 | Tang = cao hon | - |
| \`acks\` | Muc acknowledgment | all | 0 > 1 > all | 0 < 1 < all |

### High Throughput Producer

\`\`\`java
// Toi uu cho throughput
props.put(ProducerConfig.BATCH_SIZE_CONFIG, 65536);        // 64KB batch
props.put(ProducerConfig.LINGER_MS_CONFIG, 20);            // Doi 20ms
props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");  // Nen nhanh
props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 67108864);  // 64MB buffer
props.put(ProducerConfig.ACKS_CONFIG, "1");                // Chi doi leader
\`\`\`

### Low Latency Producer

\`\`\`java
// Toi uu cho latency
props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);        // 16KB (nho)
props.put(ProducerConfig.LINGER_MS_CONFIG, 0);             // Gui ngay
props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "none"); // Khong nen
props.put(ProducerConfig.ACKS_CONFIG, "1");                // Khong doi ISR
\`\`\`

## Consumer Tuning

| Config | Mo ta | Default | Tip |
|--------|-------|---------|-----|
| \`fetch.min.bytes\` | Data toi thieu moi fetch | 1 | Tang len 1KB-1MB cho throughput |
| \`fetch.max.wait.ms\` | Thoi gian doi fetch | 500ms | Tang cung fetch.min.bytes |
| \`max.poll.records\` | Records toi da moi poll | 500 | Giam neu xu ly cham |
| \`max.partition.fetch.bytes\` | Data toi da moi partition | 1MB | Tang neu message lon |
| \`session.timeout.ms\` | Timeout detect consumer chet | 45s | Giam xuong 10-15s |
| \`heartbeat.interval.ms\` | Interval gui heartbeat | 3s | 1/3 cua session.timeout |
| \`max.poll.interval.ms\` | Thoi gian toi da giua 2 poll | 5 phut | Tang neu xu ly cham |

## Partition Count Strategy

\`\`\`
Q: Bao nhieu partitions la du?

Formula: partitions = max(T/P, T/C)

T = target throughput (msg/sec)
P = throughput 1 producer tren 1 partition
C = throughput 1 consumer tren 1 partition

Vi du:
Target: 100,000 msg/sec
Producer throughput: 50,000 msg/sec/partition
Consumer throughput: 20,000 msg/sec/partition

partitions = max(100000/50000, 100000/20000)
           = max(2, 5)
           = 5 partitions (toi thieu)

Recommend: 5-10 partitions (du room de scale consumers)
\`\`\`

### Partition Trade-offs

| Nhieu partitions | It partitions |
|---|---|
| Throughput cao hon | Throughput thap hon |
| Nhieu consumers song song | It consumers |
| Ton nhieu file descriptors | It file descriptors |
| Leader election cham hon | Leader election nhanh |
| E2E latency cao hon | Latency thap hon |

## Broker Tuning

| Config | Mo ta | Default | Recommend |
|--------|-------|---------|-----------|
| \`num.network.threads\` | Network I/O threads | 3 | CPU cores / 2 |
| \`num.io.threads\` | Disk I/O threads | 8 | CPU cores |
| \`socket.send.buffer.bytes\` | TCP send buffer | 100KB | 1MB cho DC khac |
| \`socket.receive.buffer.bytes\` | TCP receive buffer | 100KB | 1MB cho DC khac |
| \`log.flush.interval.messages\` | Flush sau bao nhieu msg | Long.MAX | De OS quyet dinh |
| \`log.flush.interval.ms\` | Flush sau bao lau | null | De OS quyet dinh |

## Benchmark Comparisons

\`\`\`
Test environment: 3 brokers, 6 partitions, RF=3

Config Profile          | Throughput    | Latency (p99)
─────────────────────────────────────────────────────
Default                 | 50K msg/sec   | 15ms
High Throughput         | 200K msg/sec  | 50ms
Low Latency             | 30K msg/sec   | 3ms
Balanced                | 120K msg/sec  | 10ms
\`\`\`

## Compression Benchmark

\`\`\`
Message size: 1KB, 1M messages

Algorithm  | Size      | Compress  | Decompress | Ratio
───────────────────────────────────────────────────────
none       | 1000MB    | -         | -          | 1.0x
gzip       | 350MB     | 45 sec    | 12 sec     | 2.9x
snappy     | 500MB     | 8 sec     | 5 sec      | 2.0x
lz4        | 460MB     | 6 sec     | 3 sec      | 2.2x
zstd       | 380MB     | 15 sec    | 6 sec      | 2.6x

→ lz4: Throughput-focused (nhanh nhat)
→ zstd: Balance (nen tot, toc do kha)
→ gzip: Storage-focused (nen tot nhat, cham nhat)
\`\`\`

> ⚠️ Tuning la trade-off! Tang throughput = tang latency. Khong co silver bullet.
    `
  },
  {
    id: 9,
    title: "Kafka Connect",
    desc: "Ket noi Kafka voi Database, Elasticsearch, S3, va moi thu khac",
    content: `
## Kafka Connect la gi?

Framework de **stream data** giua Kafka va external systems ma KHONG can viet code.

\`\`\`mermaid
graph LR
    subgraph "Source Systems"
        DB[(MySQL)]
        PG[(PostgreSQL)]
        MG[(MongoDB)]
    end

    subgraph "Kafka Connect"
        SC[Source Connectors] --> K[Kafka Topics]
        K --> SK[Sink Connectors]
    end

    subgraph "Sink Systems"
        ES[(Elasticsearch)]
        S3[(S3)]
        HD[(HDFS)]
    end

    DB --> SC
    PG --> SC
    MG --> SC
    SK --> ES
    SK --> S3
    SK --> HD
\`\`\`

## Source vs Sink

| Type | Huong | Vi du |
|------|-------|-------|
| **Source Connector** | External System → Kafka | MySQL CDC → Kafka topic |
| **Sink Connector** | Kafka → External System | Kafka topic → Elasticsearch |

## Standalone vs Distributed Mode

\`\`\`mermaid
graph TD
    subgraph "Standalone Mode"
        W1["1 Worker<br/>chay tat ca connectors"]
    end

    subgraph "Distributed Mode"
        W2["Worker 1<br/>Connector A, Task 1"]
        W3["Worker 2<br/>Connector A, Task 2"]
        W4["Worker 3<br/>Connector B, Task 1"]
    end
\`\`\`

| Mode | Khi nao dung |
|------|-------------|
| **Standalone** | Dev/test, single server |
| **Distributed** | Production, HA, scale |

## Source Connector: MySQL CDC

\`\`\`json
{
  "name": "mysql-source",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql-host",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "secret",
    "database.server.id": "1",
    "topic.prefix": "mysql",
    "database.include.list": "ecommerce",
    "table.include.list": "ecommerce.orders,ecommerce.products",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "schema.history.internal.kafka.topic": "schema-changes"
  }
}
\`\`\`

\`\`\`
Ket qua: Moi thay doi trong MySQL tu dong tao event trong Kafka

MySQL: INSERT INTO orders (id, amount) VALUES (1, 99.99)
   ↓
Kafka topic "mysql.ecommerce.orders":
{
  "op": "c",    ← "c" = create
  "after": {
    "id": 1,
    "amount": 99.99
  }
}
\`\`\`

## Sink Connector: Elasticsearch

\`\`\`json
{
  "name": "elasticsearch-sink",
  "config": {
    "connector.class": "io.confluent.connect.elasticsearch.ElasticsearchSinkConnector",
    "topics": "mysql.ecommerce.orders",
    "connection.url": "http://elasticsearch:9200",
    "type.name": "_doc",
    "key.ignore": "false",
    "schema.ignore": "true",
    "transforms": "extractKey",
    "transforms.extractKey.type": "org.apache.kafka.connect.transforms.ExtractField$Key",
    "transforms.extractKey.field": "id"
  }
}
\`\`\`

## Single Message Transforms (SMT)

Bien doi message **on-the-fly** ma khong can code.

| Transform | Muc dich |
|-----------|----------|
| \`InsertField\` | Them field (timestamp, static value) |
| \`ReplaceField\` | Rename, xoa fields |
| \`MaskField\` | An data nhay cam |
| \`ExtractField\` | Lay 1 field tu struct |
| \`TimestampRouter\` | Route theo timestamp |
| \`RegexRouter\` | Route theo regex |
| \`Filter\` | Loc message theo condition |

\`\`\`json
{
  "transforms": "addTimestamp,maskEmail",
  "transforms.addTimestamp.type": "org.apache.kafka.connect.transforms.InsertField$Value",
  "transforms.addTimestamp.timestamp.field": "processed_at",
  "transforms.maskEmail.type": "org.apache.kafka.connect.transforms.MaskField$Value",
  "transforms.maskEmail.fields": "email"
}
\`\`\`

## CDC Flow voi Debezium

\`\`\`mermaid
sequenceDiagram
    participant App as Application
    participant DB as MySQL
    participant DBZ as Debezium Connector
    participant K as Kafka
    participant ES as Elasticsearch

    App->>DB: INSERT/UPDATE/DELETE
    DB->>DB: Ghi binlog
    DBZ->>DB: Doc binlog (CDC)
    DBZ->>K: Produce change event
    K->>ES: Sink connector sync
\`\`\`

## Quan ly Connectors (REST API)

\`\`\`bash
# List connectors
GET /connectors

# Tao connector moi
POST /connectors
{ "name": "...", "config": { ... } }

# Xem status
GET /connectors/mysql-source/status

# Pause / Resume
PUT /connectors/mysql-source/pause
PUT /connectors/mysql-source/resume

# Xoa connector
DELETE /connectors/mysql-source
\`\`\`

> ⚠️ Dung Debezium cho CDC thay vi polling JDBC connector. Debezium bat duoc DELETE va chi doc thay doi, khong phai toan bo table.
    `
  },
  {
    id: 10,
    title: "Schema Registry",
    desc: "Avro, Protobuf, JSON Schema - Quan ly schema evolution an toan",
    content: `
## Tai sao can Schema Registry?

**Van de**: Producer va Consumer phai thong nhat format data.

\`\`\`
Producer thay doi schema:
  Truoc: { "name": "Alice", "age": 25 }
  Sau:   { "fullName": "Alice", "age": "25", "email": "..." }

Consumer cu: CRASH! Khong hieu "fullName", "age" la string
\`\`\`

\`\`\`mermaid
graph LR
    P[Producer] -->|"1. Register/Check schema"| SR[Schema Registry]
    P -->|"2. Serialize + send"| K[Kafka]
    K -->|"3. Consume"| C[Consumer]
    C -->|"4. Get schema"| SR

    style SR fill:#f59e0b,color:#000
\`\`\`

## Schema Formats

| Format | Uu diem | Nhuoc diem | Khi nao dung |
|--------|---------|------------|-------------|
| **Avro** | Compact binary, schema evolution tot | Can registry | Default choice |
| **Protobuf** | Nhanh, strongly typed, gRPC | Phuc tap hon | High performance |
| **JSON Schema** | Doc duoc, debug de | Lon, cham | Dev/debug |

## Avro Schema Example

\`\`\`json
{
  "type": "record",
  "name": "Order",
  "namespace": "com.example",
  "fields": [
    {"name": "orderId", "type": "string"},
    {"name": "amount", "type": "double"},
    {"name": "status", "type": {
      "type": "enum",
      "name": "Status",
      "symbols": ["PENDING", "CONFIRMED", "SHIPPED"]
    }},
    {"name": "email", "type": ["null", "string"], "default": null}
  ]
}
\`\`\`

## Compatibility Modes

\`\`\`mermaid
graph TD
    subgraph "Compatibility Levels"
        BW["BACKWARD<br/>Consumer moi doc data cu"]
        FW["FORWARD<br/>Consumer cu doc data moi"]
        FL["FULL<br/>Ca hai chieu"]
        NO["NONE<br/>Khong check"]
    end
\`\`\`

| Mode | Cho phep | Vi du |
|------|----------|-------|
| **BACKWARD** (default) | Them field co default, xoa field | Consumer v2 doc data v1 |
| **FORWARD** | Them field, xoa field co default | Consumer v1 doc data v2 |
| **FULL** | Them/xoa field DEU phai co default | An toan nhat |
| **NONE** | Moi thu | Nguy hiem, khong nen dung |

### Schema Evolution Rules

\`\`\`
BACKWARD compatible (OK):
  v1: { name, age }
  v2: { name, age, email(default=null) }  ← Them field CO default

BACKWARD INCOMPATIBLE (FAIL):
  v1: { name, age }
  v2: { name, age, email }  ← Them field KHONG default → consumer cu khong biet!

FORWARD compatible (OK):
  v1: { name, age, phone }
  v2: { name, age }  ← Xoa field → consumer cu ignore

FULL compatible (OK):
  v1: { name, age }
  v2: { name, age, email(default=null) }  ← Them field CO default, khong xoa
\`\`\`

## Producer voi Schema Registry

\`\`\`java
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
    io.confluent.kafka.serializers.KafkaAvroSerializer.class);
props.put("schema.registry.url", "http://localhost:8081");

// Schema Registry tu dong:
// 1. Register schema (neu chua co)
// 2. Check compatibility
// 3. Serialize voi schema ID
\`\`\`

## Consumer voi Schema Registry

\`\`\`java
Properties props = new Properties();
props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
    io.confluent.kafka.serializers.KafkaAvroDeserializer.class);
props.put("schema.registry.url", "http://localhost:8081");
props.put("specific.avro.reader", true);

// Schema Registry tu dong:
// 1. Doc schema ID tu message
// 2. Fetch schema tu registry (co cache)
// 3. Deserialize voi dung schema
\`\`\`

## Wire Format

\`\`\`
Kafka message voi Schema Registry:

┌──────┬────────────┬──────────────────────┐
│ 0x00 │ Schema ID  │ Avro serialized data │
│ 1B   │ 4 bytes    │ N bytes              │
└──────┴────────────┴──────────────────────┘
  Magic   ID=42       Binary payload
  byte    (big-endian)
\`\`\`

> ⚠️ LUON dung BACKWARD hoac FULL compatibility trong production. NONE la con duong dan den loi luc 3h sang!
    `
  },
  {
    id: 11,
    title: "Kafka Streams",
    desc: "Stream Processing - KStream, KTable, Windowing, Stateful Operations",
    content: `
## Kafka Streams la gi?

**Library** (khong phai cluster rieng) de xu ly data streams **realtime** ngay trong application.

\`\`\`mermaid
graph LR
    subgraph "Kafka Streams App (JVM)"
        IT[Input Topic] --> KS[Stream Processing]
        KS --> OT[Output Topic]
    end

    style KS fill:#8b5cf6,color:#fff
\`\`\`

### So sanh voi cac framework khac

| Feature | Kafka Streams | Apache Flink | Spark Streaming |
|---------|--------------|--------------|-----------------|
| **Deploy** | Library (JAR) | Cluster rieng | Cluster rieng |
| **Exactly-once** | Co (native) | Co | Co |
| **State management** | RocksDB (local) | Managed state | RDD-based |
| **Latency** | Milliseconds | Milliseconds | Seconds (micro-batch) |
| **Scaling** | Tang instances | Tang TaskManagers | Tang executors |
| **Learning curve** | Thap | Cao | Trung binh |

## KStream vs KTable

\`\`\`mermaid
graph TD
    subgraph "KStream - Event Stream"
        S1["key=A, value=1"]
        S2["key=B, value=2"]
        S3["key=A, value=3"]
        S4["key=A: 1, 3  B: 2<br/>(tat ca events)"]
    end

    subgraph "KTable - Changelog Stream"
        T1["key=A, value=1"]
        T2["key=B, value=2"]
        T3["key=A, value=3"]
        T4["key=A: 3  B: 2<br/>(chi latest)"]
    end
\`\`\`

| | KStream | KTable |
|---|---|---|
| **Mo hinh** | Append-only stream | Mutable table (upsert) |
| **Duplicate keys** | Giu tat ca | Chi giu latest |
| **Giong nhu** | INSERT | INSERT or UPDATE |
| **Use case** | Events, logs | State, lookup |

## Stream Processing Topology

\`\`\`java
StreamsBuilder builder = new StreamsBuilder();

// Doc tu input topic nhu KStream
KStream<String, String> orders = builder.stream("orders");

// Filter
KStream<String, String> confirmedOrders = orders
    .filter((key, value) -> value.contains("CONFIRMED"));

// Map values
KStream<String, String> enriched = confirmedOrders
    .mapValues(value -> enrich(value));

// Group by key va count
KTable<String, Long> orderCountByUser = orders
    .groupByKey()
    .count();

// Ghi ra output topic
enriched.to("confirmed-orders");
orderCountByUser.toStream().to("order-counts");
\`\`\`

\`\`\`mermaid
graph LR
    A[orders topic] --> B[filter: CONFIRMED]
    B --> C[mapValues: enrich]
    C --> D[confirmed-orders topic]
    A --> E[groupByKey]
    E --> F[count]
    F --> G[order-counts topic]
\`\`\`

## Windowing Operations

\`\`\`mermaid
graph TD
    subgraph "Tumbling Window (5 min)"
        TW1["00:00-05:00 | count=10"]
        TW2["05:00-10:00 | count=15"]
        TW3["10:00-15:00 | count=8"]
    end

    subgraph "Hopping Window (5 min, advance 2 min)"
        HW1["00:00-05:00 | count=10"]
        HW2["02:00-07:00 | count=12"]
        HW3["04:00-09:00 | count=15"]
    end

    subgraph "Session Window (gap=5 min)"
        SW1["Activity burst 1 | count=5"]
        SW2["gap > 5 min"]
        SW3["Activity burst 2 | count=8"]
    end
\`\`\`

\`\`\`java
// Tumbling Window: dem orders moi 5 phut
KTable<Windowed<String>, Long> windowedCount = orders
    .groupByKey()
    .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(5)))
    .count();

// Hopping Window: dem moi 5 phut, cap nhat moi 1 phut
KTable<Windowed<String>, Long> hoppingCount = orders
    .groupByKey()
    .windowedBy(TimeWindows.ofSizeAndGrace(
        Duration.ofMinutes(5),
        Duration.ofMinutes(1))
        .advanceBy(Duration.ofMinutes(1)))
    .count();

// Session Window: group theo activity sessions
KTable<Windowed<String>, Long> sessionCount = orders
    .groupByKey()
    .windowedBy(SessionWindows.ofInactivityGapWithNoGrace(Duration.ofMinutes(5)))
    .count();
\`\`\`

## Stateful Operations: Joins

\`\`\`java
// KStream-KTable Join (enrichment)
KStream<String, Order> orders = builder.stream("orders");
KTable<String, User> users = builder.table("users");

KStream<String, EnrichedOrder> enrichedOrders = orders.join(
    users,
    (order, user) -> new EnrichedOrder(order, user.getName(), user.getEmail())
);
\`\`\`

| Join Type | Left | Right | Ket qua |
|-----------|------|-------|---------|
| **KStream-KTable** | Event | Lookup table | Enrich event voi latest state |
| **KStream-KStream** | Event | Event | Correlate events trong window |
| **KTable-KTable** | State | State | Join 2 materialized views |

## Run Kafka Streams App

\`\`\`java
Properties props = new Properties();
props.put(StreamsConfig.APPLICATION_ID_CONFIG, "order-processor");
props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.StringSerde.class);
props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.StringSerde.class);
props.put(StreamsConfig.PROCESSING_GUARANTEE_CONFIG, "exactly_once_v2");

KafkaStreams streams = new KafkaStreams(builder.build(), props);
streams.start();

// Graceful shutdown
Runtime.getRuntime().addShutdownHook(new Thread(streams::close));
\`\`\`

> ⚠️ Kafka Streams scale bang cach chay nhieu instances cua CUNG application. Partitions se duoc tu dong phan phoi.
    `
  },
  {
    id: 12,
    title: "Exactly-Once & Transactions",
    desc: "Transactional Producer, Read-Process-Write, Transaction Coordinator",
    content: `
## Tai sao can Exactly-Once?

\`\`\`
Scenario: Chuyen tien tu tai khoan A sang B qua Kafka

Khong co EOS:
  1. Consumer doc "transfer $100 A→B"
  2. Producer gui "debit A $100" → OK
  3. Producer gui "credit B $100" → CRASH!
  4. Consumer restart → xu ly lai
  5. "debit A $100" GUI LAI → A bi tru 2 lan!

Co EOS:
  1. Consumer doc "transfer $100 A→B"
  2. BEGIN TRANSACTION
  3. Producer gui "debit A $100"
  4. Producer gui "credit B $100" → CRASH!
  5. ABORT TRANSACTION → Ca 2 message bi huy
  6. Consumer restart → xu ly lai tu dau
  7. Lan nay thanh cong → COMMIT
\`\`\`

## Transaction Components

\`\`\`mermaid
graph TD
    subgraph "Transaction Flow"
        P["Transactional Producer<br/>(transactional.id)"]
        TC["Transaction Coordinator<br/>(Broker)"]
        TL["Transaction Log<br/>(__transaction_state topic)"]
        TP1["Target Partition 1"]
        TP2["Target Partition 2"]
        CO["__consumer_offsets"]
    end

    P -->|"1. initTransactions()"| TC
    P -->|"2. beginTransaction()"| TC
    P -->|"3. send()"| TP1
    P -->|"3. send()"| TP2
    P -->|"4. sendOffsetsToTransaction()"| TC
    TC -->|"5. commit markers"| TP1
    TC -->|"5. commit markers"| TP2
    TC -->|"5. commit offsets"| CO
    TC --> TL
\`\`\`

## Idempotent Producer (Exactly-once per partition)

\`\`\`mermaid
sequenceDiagram
    participant P as Producer (PID=1)
    participant B as Broker

    P->>B: Send(seq=0, msg=A)
    B->>B: Luu seq=0 cho PID=1
    B-->>P: ACK

    P->>B: Send(seq=1, msg=B)
    B->>B: Luu seq=1 cho PID=1
    B-->>P: ACK

    Note over P: Network error, retry!
    P->>B: Send(seq=1, msg=B) RETRY
    B->>B: seq=1 da co cho PID=1 → SKIP
    B-->>P: ACK (duplicate, nhung OK)
\`\`\`

\`\`\`java
// Chi can 1 dong de bat idempotence
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);

// Tu dong thiet lap:
// acks = all
// retries = Integer.MAX_VALUE
// max.in.flight.requests.per.connection <= 5
\`\`\`

## Transactional Producer (Exactly-once across partitions)

\`\`\`java
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
props.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "transfer-processor-1");
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// PHAI goi 1 lan truoc khi dung transactions
producer.initTransactions();

try {
    producer.beginTransaction();

    // Gui nhieu messages ATOMIC
    producer.send(new ProducerRecord<>("debits", "A", "-100"));
    producer.send(new ProducerRecord<>("credits", "B", "+100"));
    producer.send(new ProducerRecord<>("audit-log", null, "Transfer A→B $100"));

    producer.commitTransaction(); // ALL-OR-NOTHING

} catch (ProducerFencedException e) {
    // Mot producer khac voi cung transactional.id da thay the minh
    producer.close();
} catch (KafkaException e) {
    producer.abortTransaction(); // Huy tat ca
}
\`\`\`

## Read-Process-Write Pattern

\`\`\`java
// Consumer: PHAI doc read_committed
consumerProps.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
consumerProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

producer.initTransactions();
consumer.subscribe(List.of("input-topic"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(200));
    if (records.isEmpty()) continue;

    producer.beginTransaction();
    try {
        // Process moi record
        for (ConsumerRecord<String, String> record : records) {
            String result = transform(record.value());
            producer.send(new ProducerRecord<>("output-topic", record.key(), result));
        }

        // Commit offsets TRONG transaction
        Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();
        for (TopicPartition partition : records.partitions()) {
            var partRecords = records.records(partition);
            long lastOffset = partRecords.get(partRecords.size() - 1).offset();
            offsets.put(partition, new OffsetAndMetadata(lastOffset + 1));
        }
        producer.sendOffsetsToTransaction(offsets, consumer.groupMetadata());

        producer.commitTransaction();
    } catch (KafkaException e) {
        producer.abortTransaction();
    }
}
\`\`\`

## Isolation Levels

| Level | Hanh vi | Use case |
|-------|---------|----------|
| \`read_uncommitted\` | Doc tat ca messages (ke ca chua commit) | Monitoring, debug |
| \`read_committed\` | Chi doc messages da commit | Production EOS |

## Transaction States

\`\`\`
Transaction Lifecycle:

Empty → Ongoing → PrepareCommit → CompleteCommit
                → PrepareAbort  → CompleteAbort

Timeline:
initTransactions() → beginTransaction() → send()...
  → commitTransaction() hoac abortTransaction()
\`\`\`

> ⚠️ \`transactional.id\` phai UNIQUE cho moi instance. Neu 2 producers co cung ID, producer cu se bi "fenced" (ket thuc).
    `
  },
  {
    id: 13,
    title: "Security",
    desc: "Authentication (SASL), Authorization (ACLs), Encryption (TLS/SSL)",
    content: `
## Security Layers

\`\`\`mermaid
graph TD
    subgraph "Kafka Security"
        E["Encryption (TLS/SSL)<br/>Bao ve data truyen di"]
        A["Authentication (SASL)<br/>Xac dinh ai dang ket noi"]
        Z["Authorization (ACLs)<br/>Cho phep lam gi"]
    end

    C[Client] -->|"1. TLS Handshake"| E
    E -->|"2. SASL Auth"| A
    A -->|"3. ACL Check"| Z
    Z -->|"4. Access Granted"| K[Kafka Broker]
\`\`\`

## Encryption: TLS/SSL

\`\`\`
Client ←── TLS 1.2/1.3 ──→ Broker ←── TLS ──→ Broker
  Encrypt in transit          Inter-broker encryption
\`\`\`

### Broker Config

\`\`\`properties
# Broker TLS config
listeners=SSL://kafka1:9093
ssl.keystore.location=/var/ssl/kafka.keystore.jks
ssl.keystore.password=keystore-pass
ssl.truststore.location=/var/ssl/kafka.truststore.jks
ssl.truststore.password=truststore-pass
ssl.client.auth=required

# Inter-broker
security.inter.broker.protocol=SSL
\`\`\`

### Client Config

\`\`\`java
props.put("security.protocol", "SSL");
props.put("ssl.truststore.location", "/var/ssl/client.truststore.jks");
props.put("ssl.truststore.password", "truststore-pass");

// Neu mutual TLS (2-way):
props.put("ssl.keystore.location", "/var/ssl/client.keystore.jks");
props.put("ssl.keystore.password", "keystore-pass");
\`\`\`

## Authentication: SASL

| Mechanism | Mo ta | Use case |
|-----------|-------|----------|
| **PLAIN** | Username/password (plaintext) | Dev (PHAI dung voi SSL) |
| **SCRAM-SHA-256/512** | Username/password (hashed) | Production (khong can Kerberos) |
| **GSSAPI (Kerberos)** | Ticket-based | Enterprise co Kerberos |
| **OAUTHBEARER** | OAuth 2.0 tokens | Cloud, modern auth |

### SASL/SCRAM Config

\`\`\`properties
# Broker
listeners=SASL_SSL://kafka1:9093
sasl.mechanism.inter.broker.protocol=SCRAM-SHA-256
sasl.enabled.mechanisms=SCRAM-SHA-256
security.inter.broker.protocol=SASL_SSL

# Tao user
kafka-configs.sh --bootstrap-server localhost:9092 \\
  --alter --add-config \\
  'SCRAM-SHA-256=[password=secret]' \\
  --entity-type users --entity-name alice
\`\`\`

\`\`\`java
// Client
props.put("security.protocol", "SASL_SSL");
props.put("sasl.mechanism", "SCRAM-SHA-256");
props.put("sasl.jaas.config",
    "org.apache.kafka.common.security.scram.ScramLoginModule required " +
    "username=\\"alice\\" password=\\"secret\\";");
\`\`\`

## Authorization: ACLs

\`\`\`bash
# Cho phep user alice doc tu topic orders
kafka-acls.sh --bootstrap-server localhost:9092 \\
  --add \\
  --allow-principal User:alice \\
  --operation Read \\
  --topic orders

# Cho phep group order-processor doc
kafka-acls.sh --bootstrap-server localhost:9092 \\
  --add \\
  --allow-principal User:alice \\
  --operation Read \\
  --group order-processor

# Cho phep alice ghi vao topic results
kafka-acls.sh --bootstrap-server localhost:9092 \\
  --add \\
  --allow-principal User:alice \\
  --operation Write \\
  --topic results

# List ACLs
kafka-acls.sh --bootstrap-server localhost:9092 --list
\`\`\`

### ACL Operations

| Operation | Ap dung cho | Mo ta |
|-----------|-------------|-------|
| Read | Topic, Group | Doc messages, join group |
| Write | Topic | Gui messages |
| Create | Topic, Cluster | Tao topic |
| Delete | Topic | Xoa topic |
| Alter | Topic, Cluster | Thay doi config |
| Describe | Topic, Group, Cluster | Xem metadata |
| All | Tat ca | Toan quyen |

## Security Best Practices

\`\`\`
1. LUON dung TLS cho production
   → Encrypt in transit, chong man-in-the-middle

2. SASL + ACLs cho multi-tenant
   → Moi service chi access duoc topics cua minh

3. Rotate credentials dinh ky
   → Dung SCRAM (thay doi password khong can restart)

4. Network segmentation
   → Kafka cluster trong private network
   → Chi expose qua load balancer neu can

5. Audit logging
   → Bat authorizer.class.name
   → Log moi access attempt

6. Encryption at rest
   → OS-level encryption (LUKS, dm-crypt)
   → Hoac cloud-managed encryption (AWS EBS, etc.)
\`\`\`

> ⚠️ NEVER dung PLAIN authentication ma khong co TLS! Password se truyen plaintext qua network.
    `
  },
  {
    id: 14,
    title: "Monitoring & Operations",
    desc: "Metrics, Consumer Lag, Alerting, Partition Reassignment, Troubleshooting",
    content: `
## Key Metrics

\`\`\`mermaid
graph TD
    subgraph "Monitoring Stack"
        JMX[Kafka JMX Metrics] --> EX[Prometheus Exporter]
        EX --> PM[Prometheus]
        PM --> GR[Grafana Dashboard]
    end
\`\`\`

## Broker Metrics

| Metric | Mo ta | Alert khi |
|--------|-------|-----------|
| \`UnderReplicatedPartitions\` | Partitions chua replicate du | > 0 |
| \`ActiveControllerCount\` | So controller active | != 1 |
| \`OfflinePartitionsCount\` | Partitions khong co leader | > 0 |
| \`RequestHandlerAvgIdlePercent\` | % thoi gian ranh I/O threads | < 0.3 (70% busy) |
| \`NetworkProcessorAvgIdlePercent\` | % thoi gian ranh network threads | < 0.3 |
| \`TotalTimeMs (Produce/Fetch)\` | Thoi gian xu ly request | p99 > 100ms |
| \`BytesInPerSec\` | Data vao broker | Bat thuong |
| \`BytesOutPerSec\` | Data ra broker | Bat thuong |
| \`LogFlushLatencyMs\` | Thoi gian flush disk | p99 > 50ms |

## Producer Metrics

| Metric | Mo ta | Alert khi |
|--------|-------|-----------|
| \`record-send-rate\` | Messages gui/sec | Giam dot ngot |
| \`record-error-rate\` | Loi gui/sec | > 0 |
| \`request-latency-avg\` | Latency trung binh | > 100ms |
| \`batch-size-avg\` | Kich thuoc batch trung binh | Qua nho |
| \`buffer-available-bytes\` | Buffer con trong | < 10% |

## Consumer Metrics & Lag

\`\`\`
Consumer Lag = Log End Offset - Consumer Committed Offset

Partition 0: LEO=1000, Committed=990 → Lag = 10
Partition 1: LEO=2000, Committed=1500 → Lag = 500 ← Van de!
Partition 2: LEO=1500, Committed=1500 → Lag = 0 ✓
\`\`\`

| Metric | Mo ta | Alert khi |
|--------|-------|-----------|
| \`records-lag-max\` | Lag cao nhat across partitions | Tang lien tuc |
| \`records-consumed-rate\` | Records xu ly/sec | Giam dot ngot |
| \`commit-latency-avg\` | Thoi gian commit offset | > 50ms |
| \`rebalance-latency-total\` | Tong thoi gian rebalance | > 60s |

## Monitor Consumer Lag

\`\`\`bash
# Xem lag cua consumer group
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \\
  --group order-processor \\
  --describe

# Output:
# TOPIC    PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# orders   0          990             1000            10
# orders   1          1500            2000            500
# orders   2          1500            1500            0
\`\`\`

## Common Operations

### Partition Reassignment

\`\`\`bash
# Khi them broker moi, can redistribute partitions

# 1. Tao reassignment plan
kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \\
  --topics-to-move-json-file topics.json \\
  --broker-list "1,2,3,4" \\
  --generate

# 2. Execute plan
kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \\
  --reassignment-json-file plan.json \\
  --execute

# 3. Verify
kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \\
  --reassignment-json-file plan.json \\
  --verify
\`\`\`

### Tang Partitions

\`\`\`bash
# Tang tu 3 len 6 partitions
kafka-topics.sh --bootstrap-server localhost:9092 \\
  --alter --topic orders \\
  --partitions 6
\`\`\`

### Rolling Restart

\`\`\`
Quy trinh restart broker khong downtime:

1. Restart tung broker mot
2. Doi broker rejoin cluster va catch up (ISR)
3. Moi restart broker tiep theo

Config ho tro:
controlled.shutdown.enable = true
controlled.shutdown.max.retries = 3
\`\`\`

## Troubleshooting Guide

| Van de | Nguyen nhan | Giai phap |
|--------|-------------|-----------|
| Consumer lag tang | Consumer cham, partition kem | Tang consumers, optimize processing |
| UnderReplicated partitions | Broker cham, network issue | Check disk I/O, network |
| Producer timeout | Broker qua tai | Tang timeout, check broker metrics |
| Frequent rebalancing | Consumer crash, timeout ngan | Tang session.timeout, check health |
| Disk full | Retention qua dai | Giam retention, tang disk |
| OOM broker | Too many partitions | Giam partitions, tang RAM |

## Alerting Rules

\`\`\`yaml
# Prometheus alerting rules
groups:
  - name: kafka-alerts
    rules:
      - alert: KafkaOfflinePartitions
        expr: kafka_controller_kafkacontroller_offlinepartitionscount > 0
        for: 5m
        labels:
          severity: critical

      - alert: KafkaConsumerLag
        expr: kafka_consumergroup_lag > 10000
        for: 10m
        labels:
          severity: warning

      - alert: KafkaUnderReplicatedPartitions
        expr: kafka_server_replicamanager_underreplicatedpartitions > 0
        for: 5m
        labels:
          severity: warning

      - alert: KafkaBrokerDown
        expr: count(kafka_server_kafkaserver_brokerstate) < 3
        for: 1m
        labels:
          severity: critical
\`\`\`

> ⚠️ Consumer lag la metric QUAN TRONG NHAT. Neu lag tang lien tuc, he thong dang co van de!
    `
  },
  {
    id: 15,
    title: "Production Patterns & Expert",
    desc: "Event Sourcing, CQRS, Saga, Dead Letter Queue, Multi-DC, Capacity Planning",
    content: `
## Event Sourcing Pattern

Luu moi thay doi nhu mot **event** thay vi chi luu state hien tai.

\`\`\`mermaid
graph LR
    CMD[Command] --> ES[Event Store - Kafka]
    ES --> V1["View 1<br/>(Order Status)"]
    ES --> V2["View 2<br/>(Analytics)"]
    ES --> V3["View 3<br/>(Audit Log)"]
\`\`\`

\`\`\`java
// Events
topic: account-events

// Thay vi UPDATE balance = 100
// Luu chuoi events:
{ "type": "AccountCreated", "accountId": "A1", "balance": 0 }
{ "type": "MoneyDeposited", "accountId": "A1", "amount": 200 }
{ "type": "MoneyWithdrawn", "accountId": "A1", "amount": 50 }
{ "type": "MoneyDeposited", "accountId": "A1", "amount": 30 }

// Replay events → current state: balance = 180
\`\`\`

### Loi ich:

- **Audit trail** hoan chinh
- **Time travel** - xem state tai bat ky thoi diem
- **Event replay** - rebuild state hoac tao view moi
- **Debugging** - biet chinh xac dieu gi da xay ra

## CQRS Pattern

**Command Query Responsibility Segregation** - tach read va write.

\`\`\`mermaid
graph TD
    subgraph "Write Side"
        API1[Write API] --> K[Kafka]
    end

    subgraph "Read Side"
        K --> P1[Processor 1]
        K --> P2[Processor 2]
        P1 --> DB1[(Read DB 1<br/>PostgreSQL)]
        P2 --> DB2[(Read DB 2<br/>Elasticsearch)]
    end

    Q1[Query: Get Order] --> DB1
    Q2[Query: Search Orders] --> DB2
\`\`\`

\`\`\`
Write: Toi uu cho toc do ghi (append-only Kafka)
Read:  Toi uu cho toc do doc (materialized views)

Vi du:
- Write side: Kafka topic "orders"
- Read side 1: PostgreSQL (query by ID, joins)
- Read side 2: Elasticsearch (full-text search)
- Read side 3: Redis (cache hot data)
\`\`\`

## Saga Pattern (Distributed Transactions)

\`\`\`mermaid
sequenceDiagram
    participant OS as Order Service
    participant K as Kafka
    participant PS as Payment Service
    participant IS as Inventory Service
    participant NS as Notification Service

    OS->>K: OrderCreated
    K->>PS: Consume OrderCreated
    PS->>K: PaymentCompleted
    K->>IS: Consume PaymentCompleted
    IS->>K: InventoryReserved
    K->>NS: Consume InventoryReserved
    NS->>NS: Send confirmation email

    Note over PS: Neu Payment FAIL:
    PS->>K: PaymentFailed
    K->>OS: Consume PaymentFailed
    OS->>OS: Cancel order (compensating action)
\`\`\`

## Dead Letter Queue (DLQ)

\`\`\`mermaid
graph LR
    IT[Input Topic] --> C[Consumer]
    C -->|"Success"| P[Process OK]
    C -->|"Fail after retries"| DLQ[Dead Letter Topic]
    DLQ --> M[Manual Review]
    DLQ --> R[Retry Service]
\`\`\`

\`\`\`java
// Spring Kafka DLQ config
@Bean
public CommonErrorHandler errorHandler(KafkaOperations<Object, Object> template) {
    DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(
        template,
        (record, ex) -> new TopicPartition(record.topic() + ".DLT", record.partition())
    );

    // Retry 3 lan, moi lan doi 1s, sau do gui DLQ
    DefaultErrorHandler handler = new DefaultErrorHandler(
        recoverer, new FixedBackOff(1000L, 3L));

    // Khong retry cho validation errors
    handler.addNotRetryableExceptions(ValidationException.class);
    return handler;
}
\`\`\`

## Multi-DC Replication (MirrorMaker 2)

\`\`\`mermaid
graph LR
    subgraph "DC 1 - Active"
        K1[Kafka Cluster 1]
    end

    subgraph "DC 2 - Standby"
        K2[Kafka Cluster 2]
    end

    K1 -->|"MirrorMaker 2<br/>Async Replication"| K2

    style K1 fill:#22c55e,color:#fff
    style K2 fill:#3b82f6,color:#fff
\`\`\`

| Topology | Mo ta | Use case |
|----------|-------|----------|
| **Active-Passive** | 1 DC active, 1 standby | Disaster Recovery |
| **Active-Active** | Ca 2 DC nhan traffic | Geo-distributed |
| **Fan-out** | 1 source → nhieu targets | Data distribution |
| **Aggregation** | Nhieu sources → 1 target | Central analytics |

## Capacity Planning

\`\`\`
Step 1: Uoc luong throughput
  Messages/sec: 100,000
  Average message size: 1KB
  Data rate: 100MB/sec

Step 2: Tinh disk
  Retention: 7 days
  Replication factor: 3
  Disk = 100MB/s * 86400s * 7days * 3 = 181 TB
  + 20% buffer = ~220 TB

Step 3: Tinh partitions
  Target throughput: 100K msg/sec
  Consumer throughput: 20K msg/sec per partition
  Min partitions: 100K / 20K = 5
  Recommend: 12-24 (room to grow)

Step 4: Tinh brokers
  Disk per broker: 10TB SSD
  Brokers for storage: 220TB / 10TB = 22 brokers
  Network: 10Gbps per broker
  Brokers for network: check bandwidth needs
  → 22-30 brokers
\`\`\`

## Production Checklist

### Infrastructure
- Dung SSD (KHONG dung HDD cho production)
- Toi thieu 3 brokers (5+ cho large clusters)
- Dedicated ZooKeeper/KRaft controllers
- Network: 10Gbps giua brokers

### Configuration
- \`replication.factor = 3\`
- \`min.insync.replicas = 2\`
- \`unclean.leader.election.enable = false\`
- \`auto.create.topics.enable = false\`
- \`default.replication.factor = 3\`
- \`log.retention.hours = 168\` (7 ngay)

### Monitoring
- Consumer lag alerting
- Broker disk usage alerting
- Under-replicated partitions alerting
- JMX metrics → Prometheus → Grafana

### Security
- TLS encryption in transit
- SASL authentication
- ACLs per service/topic
- Network segmentation

### Operations
- Rolling restart procedure
- Backup/restore plan
- Partition reassignment playbook
- Incident response runbook

> ⚠️ Kafka la infrastructure CORE. Dau tu vao monitoring, alerting va runbooks TRUOC khi gap su co, khong phai SAU.
    `
  }
];
