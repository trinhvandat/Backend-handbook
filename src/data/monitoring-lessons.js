export const monitoringLessons = [
  {
    id: 1,
    title: "Observability Fundamentals",
    desc: "Nen tang Observability - Tu monitoring truyen thong den he thong quan sat hien dai",
    content: `
## Observability vs Monitoring

**Monitoring** la viec thu thap va hien thi metrics da biet truoc - ban biet can theo doi cai gi.

**Observability** la kha nang hieu trang thai ben trong cua he thong tu nhung du lieu no xuat ra (outputs) - ban co the hoi nhung cau hoi MOI ma chua biet truoc.

| Aspect | Monitoring | Observability |
|--------|-----------|---------------|
| **Approach** | Reactive - theo doi metric da dinh nghia | Proactive - kham pha van de moi |
| **Questions** | Known unknowns (biet minh khong biet gi) | Unknown unknowns (khong biet minh khong biet gi) |
| **Data** | Metrics, health checks | Metrics + Logs + Traces (3 pillars) |
| **Goal** | Alert khi co van de | Hieu TAI SAO co van de |
| **Scope** | Tung component rieng le | Toan bo he thong (end-to-end) |

## Three Pillars of Observability

\`\`\`mermaid
graph TD
    subgraph "Three Pillars of Observability"
        M[Metrics<br/>What is happening?]
        L[Logs<br/>Why is it happening?]
        T[Traces<br/>Where is it happening?]
    end
    M --> C[Correlated View]
    L --> C
    T --> C
    C --> I[Full System Understanding]
    style M fill:#3b82f6,stroke:#2563eb,color:#fff
    style L fill:#22c55e,stroke:#16a34a,color:#fff
    style T fill:#f59e0b,stroke:#d97706,color:#fff
    style I fill:#8b5cf6,stroke:#7c3aed,color:#fff
\`\`\`

### 1. Metrics
- **Numeric measurements** thu thap theo thoi gian (time-series data)
- Lightweight, de aggregate, phu hop cho alerting
- Vi du: CPU usage 85%, request count 1500/s, error rate 0.5%

### 2. Logs
- **Event records** chi tiet ve nhung gi da xay ra
- Rich context nhung kho aggregate khi volume lon
- Vi du: \`ERROR 2024-01-15 10:30:05 OrderService - Failed to process order #12345: Payment timeout\`

### 3. Traces
- **Request journey** xuyen suot nhieu services
- Cho thay dependency va latency giua cac services
- Vi du: User request -> API Gateway -> Order Service -> Payment Service -> Database

## Why Observability Matters in Distributed Systems

\`\`\`mermaid
graph LR
    subgraph "Monolith - De debug"
        A1[Single Process<br/>Single Log File<br/>Stack Trace]
    end
    subgraph "Microservices - Kho debug"
        B1[Service A] --> B2[Service B]
        B2 --> B3[Service C]
        B3 --> B4[Service D]
        B2 --> B5[Service E]
    end
\`\`\`

Trong distributed systems:
- **Nhieu processes** chay tren nhieu machines
- **Network failures** xay ra thuong xuyen
- **Partial failures** kho phat hien (1 service cham anh huong ca chain)
- **Non-deterministic** behavior do concurrency
- **Log nam rai rac** tren hang chuc services

## SLI, SLO, SLA

| Concept | Definition | Example |
|---------|-----------|---------|
| **SLI** (Service Level Indicator) | Metric do luong chat luong dich vu | Request latency p99 = 200ms |
| **SLO** (Service Level Objective) | Muc tieu noi bo cho SLI | 99.9% requests < 200ms trong 30 ngay |
| **SLA** (Service Level Agreement) | Hop dong voi khach hang, co penalty | 99.95% uptime, vi pham = boi thuong 10% |

\`\`\`text
SLA (external promise) >= SLO (internal target) >= SLI (actual measurement)

Vi du:
  SLA: 99.9% availability (hop dong voi khach hang)
  SLO: 99.95% availability (muc tieu noi bo, strict hon SLA)
  SLI: 99.97% availability (do luong thuc te hien tai)
\`\`\`

## Golden Signals (Google SRE)

4 golden signals ma MOI service can monitor:

### 1. Latency
- Thoi gian xu ly request
- Phan biet **successful requests** vs **failed requests** latency
- Track percentiles: p50, p90, p95, p99

### 2. Traffic
- Luong demand tren he thong
- HTTP requests/sec, transactions/sec, messages/sec
- Business-specific: orders/min, logins/hour

### 3. Errors
- Ty le request that bai
- Explicit errors (HTTP 5xx) va implicit errors (HTTP 200 nhung response sai)
- Errors phan loai theo type

### 4. Saturation
- Muc do "day" cua resources
- CPU, memory, disk I/O, network bandwidth
- Queue depth, thread pool usage

\`\`\`mermaid
graph TD
    subgraph "Golden Signals"
        GS[Request vao he thong]
        GS --> LAT[Latency<br/>Mat bao lau?]
        GS --> TRA[Traffic<br/>Bao nhieu request?]
        GS --> ERR[Errors<br/>Bao nhieu loi?]
        GS --> SAT[Saturation<br/>Resources con bao nhieu?]
    end
    style LAT fill:#ef4444,stroke:#dc2626,color:#fff
    style TRA fill:#3b82f6,stroke:#2563eb,color:#fff
    style ERR fill:#f59e0b,stroke:#d97706,color:#fff
    style SAT fill:#8b5cf6,stroke:#7c3aed,color:#fff
\`\`\`

## RED Method (Request-focused)

Phu hop cho **request-driven services** (APIs, web services):

| Signal | Description | PromQL Example |
|--------|------------|----------------|
| **Rate** | Requests per second | \`rate(http_requests_total[5m])\` |
| **Errors** | Failed requests per second | \`rate(http_requests_total{status=~"5.."}[5m])\` |
| **Duration** | Latency distribution | \`histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))\` |

## USE Method (Resource-focused)

Phu hop cho **infrastructure resources** (CPU, memory, disk, network):

| Signal | Description | Example |
|--------|------------|---------|
| **Utilization** | % thoi gian resource busy | CPU usage 75% |
| **Saturation** | Work queued, khong xu ly kip | CPU run queue length = 8 |
| **Errors** | So luong error events | Disk read errors = 5 |

## Observability Architecture tong quan

\`\`\`mermaid
graph TB
    subgraph "Applications"
        APP1[Service A<br/>Metrics + Logs + Traces]
        APP2[Service B<br/>Metrics + Logs + Traces]
        APP3[Service C<br/>Metrics + Logs + Traces]
    end
    subgraph "Collection Layer"
        OTEL[OpenTelemetry Collector]
        FB[Filebeat / Fluentd]
        PROM[Prometheus Scraper]
    end
    subgraph "Storage Layer"
        TSDB[(Prometheus/Mimir<br/>Metrics)]
        ES[(Elasticsearch<br/>Logs)]
        JAEGER[(Jaeger/Tempo<br/>Traces)]
    end
    subgraph "Visualization & Alerting"
        GRAF[Grafana Dashboards]
        AM[Alertmanager]
        PD[PagerDuty / Slack]
    end
    APP1 --> OTEL
    APP2 --> OTEL
    APP3 --> OTEL
    APP1 --> FB
    APP2 --> FB
    APP3 --> FB
    OTEL --> TSDB
    OTEL --> JAEGER
    FB --> ES
    PROM --> TSDB
    TSDB --> GRAF
    ES --> GRAF
    JAEGER --> GRAF
    TSDB --> AM
    AM --> PD
    style GRAF fill:#f97316,stroke:#ea580c,color:#fff
    style OTEL fill:#3b82f6,stroke:#2563eb,color:#fff
\`\`\`

> ⚠️ Luu y: Observability khong phai la tool, ma la **practice**. Cong cu chi la phuong tien - quan trong la cach ban thiet ke va su dung du lieu observability.
    `
  },
  {
    id: 2,
    title: "Metrics & Time-Series Data",
    desc: "Hieu sau ve metrics, metric types va time-series database concepts",
    content: `
## What are Metrics?

**Metrics** la cac gia tri so (numeric values) duoc thu thap va luu tru theo thoi gian. Moi metric data point gom:
- **Metric name**: ten cua metric (vd: \`http_requests_total\`)
- **Timestamp**: thoi diem thu thap
- **Value**: gia tri so (vd: 1523)
- **Labels/Tags**: metadata mo ta (vd: \`method="GET"\`, \`status="200"\`)

\`\`\`text
Metric format (Prometheus):
http_requests_total{method="GET", status="200", path="/api/users"} 1523 1705312800

|-- metric name --|------------ labels ----------------------| value | timestamp |
\`\`\`

## Metric Types

### 1. Counter

**Counter** la metric CHI TANG (hoac reset ve 0 khi restart). Dung de dem so luong events.

\`\`\`text
http_requests_total = 0 -> 1 -> 2 -> 5 -> 10 -> 15 -> [restart] -> 0 -> 3 -> 7
                      ↑ chi tang                        ↑ reset      ↑ tang tiep
\`\`\`

\`\`\`promql
# Rate of requests per second (su dung rate() voi counter)
rate(http_requests_total[5m])

# Total errors in last hour
increase(http_errors_total[1h])
\`\`\`

**Use cases**: Request count, error count, bytes sent, tasks completed

### 2. Gauge

**Gauge** co the TANG hoac GIAM. Dung do gia tri hien tai cua mot thu gi do.

\`\`\`text
temperature_celsius = 22.5 -> 23.1 -> 22.8 -> 24.0 -> 23.5
                      ↑ tang    ↑ giam   ↑ tang   ↑ giam
\`\`\`

\`\`\`promql
# Current memory usage
node_memory_MemAvailable_bytes

# Active connections right now
http_active_connections
\`\`\`

**Use cases**: Temperature, memory usage, queue size, active connections, thread count

### 3. Histogram

**Histogram** dem so observations roi vao cac **buckets** (khoang gia tri). Tu do tinh percentiles.

\`\`\`text
http_request_duration_seconds_bucket{le="0.01"} 50     # 50 requests <= 10ms
http_request_duration_seconds_bucket{le="0.05"} 200    # 200 requests <= 50ms
http_request_duration_seconds_bucket{le="0.1"}  350    # 350 requests <= 100ms
http_request_duration_seconds_bucket{le="0.5"}  480    # 480 requests <= 500ms
http_request_duration_seconds_bucket{le="1.0"}  495    # 495 requests <= 1s
http_request_duration_seconds_bucket{le="+Inf"} 500    # 500 requests total
http_request_duration_seconds_sum                42.5   # tong thoi gian
http_request_duration_seconds_count              500    # tong so requests
\`\`\`

\`\`\`promql
# p99 latency
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# p50 (median) latency
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))

# Average latency
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
\`\`\`

### 4. Summary

**Summary** tinh percentiles phia client (trong application). Khong can bucket config nhung khong the aggregate giua cac instances.

\`\`\`text
http_request_duration_seconds{quantile="0.5"}  0.045    # p50 = 45ms
http_request_duration_seconds{quantile="0.9"}  0.089    # p90 = 89ms
http_request_duration_seconds{quantile="0.99"} 0.198    # p99 = 198ms
http_request_duration_seconds_sum              42.5
http_request_duration_seconds_count            500
\`\`\`

## Comparison: Metric Types

| Feature | Counter | Gauge | Histogram | Summary |
|---------|---------|-------|-----------|---------|
| **Direction** | Chi tang | Tang/Giam | Buckets | Quantiles |
| **Use case** | Dem events | Gia tri hien tai | Latency distribution | Latency percentiles |
| **Aggregatable** | Co (rate) | Co (avg, max) | Co (across instances) | KHONG (pre-calculated) |
| **Functions** | rate(), increase() | Truc tiep | histogram_quantile() | Truc tiep |
| **Server-side calc** | Co | Co | Co | Khong (client-side) |
| **Recommendation** | Default cho counting | Default cho current values | **Recommended** cho latency | Tranh dung |

## Time-Series Database Concepts

\`\`\`mermaid
graph TD
    subgraph "Time-Series Data Model"
        TS["Time Series = Metric Name + Labels"]
        TS --> DP1["t1: value1"]
        TS --> DP2["t2: value2"]
        TS --> DP3["t3: value3"]
        TS --> DP4["t4: value4"]
    end
\`\`\`

### Key Concepts

- **Time Series**: Chuoi cac data points duoc sap xep theo thoi gian
- **Sample**: Mot data point (timestamp + value)
- **Series**: Unique combination cua metric name + labels
- **Chunk**: Block cac samples duoc nen lai voi nhau
- **Block**: Group cac chunks, thoi gian mac dinh 2h trong Prometheus

\`\`\`text
# Moi combination cua labels = 1 time series rieng
http_requests_total{method="GET", status="200"}   -> series 1
http_requests_total{method="GET", status="404"}   -> series 2
http_requests_total{method="POST", status="200"}  -> series 3
http_requests_total{method="POST", status="500"}  -> series 4
# => 4 time series tu 1 metric name
\`\`\`

## Labels and Cardinality

**Cardinality** = tong so unique time series. Day la yeu to QUAN TRONG NHAT anh huong performance.

\`\`\`text
# LOW cardinality - Tot
http_requests_total{method="GET|POST|PUT|DELETE", status="2xx|4xx|5xx"}
=> 4 methods * 3 status groups = 12 series

# HIGH cardinality - NGUY HIEM
http_requests_total{user_id="..."}
=> 1 trieu users = 1 TRIEU series -> OOM, query cham
\`\`\`

**Rules of thumb:**
- Tong so series nen < 1 trieu cho 1 Prometheus instance
- Moi label value nen < 100 unique values
- KHONG BAO GIO dung high-cardinality fields lam labels (user_id, request_id, email)

## Metric Naming Conventions

\`\`\`text
# Format: <namespace>_<subsystem>_<name>_<unit>
# Vi du:
prometheus_http_requests_total          # counter - co suffix _total
node_cpu_seconds_total                  # counter
http_request_duration_seconds           # histogram - dung base unit (seconds, bytes)
process_resident_memory_bytes           # gauge - dung base unit
node_filesystem_avail_bytes             # gauge

# Naming rules:
# 1. Snake_case
# 2. Don vi o suffix: _seconds, _bytes, _total
# 3. Counter phai co _total suffix
# 4. Dung base units: seconds (khong milliseconds), bytes (khong megabytes)
\`\`\`

## Push vs Pull Model

\`\`\`mermaid
graph LR
    subgraph "Pull Model (Prometheus)"
        PA[App /metrics] <-.GET /metrics.-> PP[Prometheus]
    end
    subgraph "Push Model (StatsD, InfluxDB)"
        PB[App] --push metrics--> PC[Collector/Agent]
    end
\`\`\`

| Feature | Pull Model | Push Model |
|---------|-----------|------------|
| **Direction** | Server scrape tu targets | Apps push den collector |
| **Discovery** | Can service discovery | Apps biet endpoint collector |
| **Health check** | Biet target UP/DOWN (scrape fail = down) | Khong biet (khong push = down hay chua start?) |
| **Firewall** | Server can access targets | Targets can access server |
| **Short-lived jobs** | Kho (can Pushgateway) | De (push truoc khi exit) |
| **Examples** | Prometheus | StatsD, Graphite, Datadog Agent |

> ⚠️ Luu y: High cardinality la nguyen nhan #1 gay Prometheus OOM va query timeout. Luon kiem tra cardinality truoc khi them labels moi. Dung \`prometheus_tsdb_head_series\` de monitor so luong active series.
    `
  },
  {
    id: 3,
    title: "Prometheus Architecture",
    desc: "Kien truc Prometheus - Tu pull model den service discovery va storage engine",
    content: `
## Prometheus Overview

Prometheus la mot **open-source monitoring and alerting toolkit** duoc phat trien tai SoundCloud va tro thanh project thu 2 cua CNCF (sau Kubernetes).

### Key Features
- **Multi-dimensional data model** voi metric name va key/value labels
- **PromQL** - ngon ngu query manh me
- **Pull model** qua HTTP
- **Service discovery** hoac static config
- **Built-in alerting** voi Alertmanager
- **No dependency** - single binary, local storage

## Prometheus Components

\`\`\`mermaid
graph TB
    subgraph "Prometheus Ecosystem"
        subgraph "Data Collection"
            SD[Service Discovery<br/>K8s, Consul, DNS, File]
            EXP1[Node Exporter<br/>Host metrics]
            EXP2[cAdvisor<br/>Container metrics]
            EXP3[App /metrics<br/>Custom metrics]
            PGW[Pushgateway<br/>Short-lived jobs]
        end
        subgraph "Prometheus Server"
            RET[Retrieval<br/>Scrape targets]
            TSDB[(TSDB<br/>Local Storage)]
            HTTP[HTTP Server<br/>PromQL API]
            RULES[Rule Engine<br/>Recording + Alert rules]
        end
        subgraph "Alerting"
            AM[Alertmanager<br/>Route, Group, Silence]
            SLACK[Slack]
            PD[PagerDuty]
            EMAIL[Email]
        end
        subgraph "Visualization"
            GRAF[Grafana]
            PROM_UI[Prometheus UI]
        end
    end
    SD --> RET
    EXP1 --> RET
    EXP2 --> RET
    EXP3 --> RET
    PGW --> RET
    RET --> TSDB
    TSDB --> HTTP
    TSDB --> RULES
    RULES --> AM
    AM --> SLACK
    AM --> PD
    AM --> EMAIL
    HTTP --> GRAF
    HTTP --> PROM_UI
    style TSDB fill:#e65100,stroke:#bf360c,color:#fff
    style AM fill:#ef4444,stroke:#dc2626,color:#fff
    style GRAF fill:#f97316,stroke:#ea580c,color:#fff
\`\`\`

## Pull-Based Architecture

\`\`\`text
Prometheus Server                     Targets
+------------------+                 +------------------+
|                  |  GET /metrics   | App + Client Lib |
|  Scrape Manager  | =============> | /metrics endpoint|
|                  |  (every 15s)   |                  |
|  +------------+  |                 | # HELP http_req  |
|  | TSDB       |  |                 | # TYPE counter   |
|  | (storage)  |  |                 | http_req_total 42|
|  +------------+  |                 +------------------+
+------------------+
\`\`\`

### Scrape Process

1. Prometheus doc danh sach targets tu **service discovery**
2. Moi **scrape_interval** (mac dinh 15s), gui HTTP GET den \`/metrics\`
3. Parse response theo **Prometheus exposition format**
4. Luu vao **TSDB** voi timestamp cua scrape time
5. Evaluate **recording rules** va **alert rules**

## Service Discovery

### Static Configuration
\`\`\`yaml
# prometheus.yml - Static targets
scrape_configs:
  - job_name: 'my-app'
    scrape_interval: 15s
    static_configs:
      - targets: ['app1:8080', 'app2:8080', 'app3:8080']
        labels:
          env: 'production'
          team: 'backend'
\`\`\`

### Kubernetes Service Discovery
\`\`\`yaml
scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      # Chi scrape pods co annotation prometheus.io/scrape: "true"
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      # Lay port tu annotation
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: (.+)
        replacement: \${1}
      # Lay path tu annotation
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
\`\`\`

### Consul Service Discovery
\`\`\`yaml
scrape_configs:
  - job_name: 'consul-services'
    consul_sd_configs:
      - server: 'consul.example.com:8500'
        services: ['web', 'api', 'worker']
    relabel_configs:
      - source_labels: [__meta_consul_tags]
        regex: .*,prometheus,.*
        action: keep
\`\`\`

### DNS Service Discovery
\`\`\`yaml
scrape_configs:
  - job_name: 'dns-discovery'
    dns_sd_configs:
      - names:
          - 'api.service.consul'
          - 'web.service.consul'
        type: 'SRV'
        refresh_interval: 30s
\`\`\`

## Storage Architecture (TSDB)

\`\`\`mermaid
graph TD
    subgraph "Prometheus TSDB"
        subgraph "Head Block (In Memory)"
            WAL[Write-Ahead Log<br/>On disk for crash recovery]
            HEAD[Head Chunks<br/>Last 2h of data in memory]
        end
        subgraph "Persistent Blocks (On Disk)"
            B1[Block 1<br/>2h chunk]
            B2[Block 2<br/>2h chunk]
            B3[Block 3<br/>Compacted]
        end
    end
    WAL --> HEAD
    HEAD -->|"Compaction<br/>(every 2h)"| B1
    B1 -->|Compaction| B3
    B2 -->|Compaction| B3
\`\`\`

### Storage Components

| Component | Description | Location |
|-----------|------------|----------|
| **WAL** (Write-Ahead Log) | Ghi truoc moi data point, chong mat du lieu khi crash | Disk: \`wal/\` |
| **Head Block** | Du lieu 2h gan nhat, nam trong memory | Memory + Disk |
| **Persistent Blocks** | Du lieu cu hon 2h, duoc compress va index | Disk: \`blocks/\` |
| **Compaction** | Merge nhieu blocks nho thanh block lon | Background process |
| **Retention** | Tu dong xoa data cu | Default: 15 ngay |

### Block Structure on Disk
\`\`\`text
data/
├── wal/                    # Write-ahead log
│   ├── 00000001
│   └── 00000002
├── 01BKGV7JBM69T2G1BGBGM6KB12/   # Block (ULID)
│   ├── chunks/             # Compressed time-series data
│   │   └── 000001
│   ├── index               # Inverted index (labels -> series)
│   ├── meta.json           # Block metadata (time range, stats)
│   └── tombstones          # Deleted series markers
├── 01BKGTZQ1SYQJTR4PB43C8PD98/
│   ├── chunks/
│   │   └── 000001
│   ├── index
│   ├── meta.json
│   └── tombstones
└── lock                    # Process lock file
\`\`\`

### Storage Configuration
\`\`\`yaml
# prometheus.yml - command line flags
# --storage.tsdb.path=/prometheus       # Thu muc luu data
# --storage.tsdb.retention.time=30d     # Giu data 30 ngay
# --storage.tsdb.retention.size=50GB    # Hoac gioi han theo size
# --storage.tsdb.wal-compression        # Nen WAL (recommended)
# --storage.tsdb.min-block-duration=2h  # Block duration toi thieu
# --storage.tsdb.max-block-duration=36h # Block duration toi da sau compaction
\`\`\`

## Federation

Federation cho phep 1 Prometheus server scrape metrics tu Prometheus server khac.

\`\`\`mermaid
graph TD
    subgraph "Data Center 1"
        P1[Prometheus DC1]
        APP1[Apps DC1]
        APP1 --> P1
    end
    subgraph "Data Center 2"
        P2[Prometheus DC2]
        APP2[Apps DC2]
        APP2 --> P2
    end
    subgraph "Global"
        PG[Prometheus Global<br/>Aggregated metrics]
    end
    P1 -->|"/federate"| PG
    P2 -->|"/federate"| PG
    PG --> GRAF[Grafana]
\`\`\`

\`\`\`yaml
# Global Prometheus - scrape tu Prometheus khac
scrape_configs:
  - job_name: 'federate-dc1'
    scrape_interval: 30s
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        - '{job=~".*"}'             # Tat ca metrics
        - 'up'                       # Health status
    static_configs:
      - targets: ['prometheus-dc1:9090']
        labels:
          datacenter: 'dc1'
\`\`\`

## Complete Prometheus Configuration

\`\`\`yaml
# prometheus.yml
global:
  scrape_interval: 15s          # Mac dinh scrape moi 15s
  evaluation_interval: 15s      # Evaluate rules moi 15s
  scrape_timeout: 10s           # Timeout cho moi scrape
  external_labels:
    cluster: 'production'
    region: 'ap-southeast-1'

# Recording rules va Alert rules
rule_files:
  - 'rules/recording_rules.yml'
  - 'rules/alert_rules.yml'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

# Scrape configurations
scrape_configs:
  # Prometheus tu monitor chinh no
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node1:9100', 'node2:9100', 'node3:9100']

  # Application metrics
  - job_name: 'spring-boot-apps'
    metrics_path: '/actuator/prometheus'
    scrape_interval: 10s
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: 'my-app.*'
\`\`\`

> ⚠️ Luu y: Prometheus luu data tren local disk nen khong co built-in replication. Cho production, nen dung Thanos hoac Mimir de co high availability va long-term storage (se hoc o Lesson 15).
    `
  },
  {
    id: 4,
    title: "PromQL - Prometheus Query Language",
    desc: "Thanh thao PromQL - ngon ngu query manh me de khai thac metrics",
    content: `
## PromQL Data Types

PromQL co 4 data types:

| Type | Description | Example |
|------|------------|---------|
| **Instant Vector** | Tap hop time series, moi series co 1 sample tai 1 thoi diem | \`http_requests_total\` |
| **Range Vector** | Tap hop time series, moi series co nhieu samples trong 1 khoang thoi gian | \`http_requests_total[5m]\` |
| **Scalar** | Mot gia tri so don gian | \`42\`, \`3.14\` |
| **String** | Mot chuoi (it su dung) | \`"hello"\` |

\`\`\`text
# Instant Vector - 1 value per series tai thoi diem hien tai
http_requests_total{method="GET"}
=> http_requests_total{method="GET", status="200"} 1523
   http_requests_total{method="GET", status="404"} 42

# Range Vector - nhieu values per series trong 5 phut qua
http_requests_total{method="GET"}[5m]
=> http_requests_total{method="GET", status="200"} 1500@t1 1510@t2 1520@t3 1523@t4
   http_requests_total{method="GET", status="404"} 40@t1 41@t2 41@t3 42@t4
\`\`\`

## Selectors and Matchers

\`\`\`promql
# Exact match
http_requests_total{method="GET"}

# Not equal
http_requests_total{method!="GET"}

# Regex match
http_requests_total{method=~"GET|POST"}

# Negative regex match
http_requests_total{method!~"OPTIONS|HEAD"}

# Multiple matchers (AND)
http_requests_total{method="GET", status=~"2..", handler="/api/users"}

# Match all series with a specific label
{__name__=~"http_.*"}     # Tat ca metrics bat dau bang http_
\`\`\`

## Essential Functions

### rate() - Ty le tang per second (cho Counter)
\`\`\`promql
# Requests per second averaged over 5 minutes
rate(http_requests_total[5m])

# rate() tu dong handle counter resets
# Range window >= 4 * scrape_interval (vd: scrape 15s -> range >= 1m)
\`\`\`

### irate() - Instant rate (2 data points cuoi cung)
\`\`\`promql
# Instant rate - phan hoi nhanh hon nhung "noisy" hon
irate(http_requests_total[5m])

# Dung irate() cho graphs, rate() cho alerting
\`\`\`

### increase() - Tong tang trong khoang thoi gian
\`\`\`promql
# Total requests in last hour
increase(http_requests_total[1h])

# increase() = rate() * seconds_in_range
# increase(x[1h]) ~ rate(x[1h]) * 3600
\`\`\`

### histogram_quantile() - Tinh percentiles tu histogram
\`\`\`promql
# p99 latency
histogram_quantile(0.99,
  rate(http_request_duration_seconds_bucket[5m])
)

# p50 (median) latency by service
histogram_quantile(0.50,
  sum by (le, service) (
    rate(http_request_duration_seconds_bucket[5m])
  )
)

# p95 latency
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket[5m])
)
\`\`\`

### Other Important Functions
\`\`\`promql
# abs() - Gia tri tuyet doi
abs(delta(temperature_celsius[1h]))

# ceil(), floor(), round() - Lam tron
ceil(http_request_duration_seconds)

# clamp_min(), clamp_max() - Gioi han gia tri
clamp_min(free_disk_bytes, 0)

# delta() - Thay doi trong khoang thoi gian (cho gauge)
delta(temperature_celsius[1h])

# deriv() - Dao ham (per-second derivative cua gauge)
deriv(node_filesystem_avail_bytes[1h])

# predict_linear() - Du doan tuong lai (linear regression)
predict_linear(node_filesystem_avail_bytes[6h], 24*3600)
# => Du doan disk space sau 24h nua

# changes() - So lan gia tri thay doi
changes(process_start_time_seconds[1h])
# => So lan process restart trong 1h

# resets() - So lan counter reset
resets(http_requests_total[1h])

# absent() - Tra ve 1 neu metric KHONG ton tai
absent(up{job="my-app"})
# => 1 neu khong co target nao tro thanh "my-app"

# sort_desc() - Sap xep giam dan
sort_desc(rate(http_requests_total[5m]))

# time() - Unix timestamp hien tai
time() - process_start_time_seconds
# => Uptime tinh bang seconds
\`\`\`

## Aggregation Operators

\`\`\`promql
# sum - Tong
sum(rate(http_requests_total[5m]))
sum by (method) (rate(http_requests_total[5m]))
sum without (instance) (rate(http_requests_total[5m]))

# avg - Trung binh
avg(rate(http_requests_total[5m]))

# min, max
max by (instance) (node_cpu_seconds_total)

# count - Dem so luong series
count(up == 1)           # So luong targets dang UP

# topk, bottomk - Top/Bottom N
topk(5, rate(http_requests_total[5m]))   # Top 5 busiest endpoints
bottomk(3, up)                            # 3 targets co van de

# count_values - Dem theo gia tri
count_values("version", build_info)
# => version="1.0" 5, version="1.1" 3

# stddev, stdvar - Do lech chuan
stddev(rate(http_requests_total[5m]))

# quantile - Tinh quantile across series
quantile(0.95, rate(http_requests_total[5m]))
\`\`\`

## Binary Operators and Vector Matching

\`\`\`promql
# Arithmetic: + - * / % ^
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes  # Used memory

# Memory usage percentage
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# Comparison: == != > < >= <=
# Tra ve series thoa man dieu kien
http_requests_total > 1000
node_filesystem_avail_bytes < 1e9   # Disk duoi 1GB

# bool modifier - Tra ve 0 hoac 1
http_requests_total > bool 1000

# Logical: and, or, unless
up == 1 and on(instance) (node_memory_MemAvailable_bytes < 1e9)
# => Instances dang UP va memory thap

# Vector matching - on() va ignoring()
rate(http_requests_total{status=~"5.."}[5m])
  / on(method, handler)
rate(http_requests_total[5m])
# => Error rate per endpoint

# group_left / group_right (many-to-one matching)
rate(http_requests_total[5m])
  * on(instance) group_left(hostname)
node_uname_info
\`\`\`

## Recording Rules

Recording rules pre-compute queries thuong dung va luu ket qua thanh time series moi.

\`\`\`yaml
# rules/recording_rules.yml
groups:
  - name: http_recording_rules
    interval: 15s
    rules:
      # Request rate by method and status
      - record: job:http_requests:rate5m
        expr: sum by (job, method, status) (rate(http_requests_total[5m]))

      # Error rate percentage
      - record: job:http_errors:rate5m_ratio
        expr: |
          sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))
          /
          sum by (job) (rate(http_requests_total[5m]))

      # p99 latency
      - record: job:http_request_duration:p99_5m
        expr: |
          histogram_quantile(0.99,
            sum by (job, le) (
              rate(http_request_duration_seconds_bucket[5m])
            )
          )

      # Memory usage percentage
      - record: instance:node_memory_utilization:ratio
        expr: |
          1 - (
            node_memory_MemAvailable_bytes
            /
            node_memory_MemTotal_bytes
          )
\`\`\`

## Practical Query Examples

### CPU Monitoring
\`\`\`promql
# CPU usage percentage per instance
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# CPU usage by mode
sum by (mode) (rate(node_cpu_seconds_total[5m]))
\`\`\`

### Memory Monitoring
\`\`\`promql
# Memory usage percentage
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# Memory usage in GB
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / 1024^3
\`\`\`

### Request Rate & Error Rate
\`\`\`promql
# Total request rate
sum(rate(http_requests_total[5m]))

# Error rate percentage
sum(rate(http_requests_total{status=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m])) * 100

# Request rate by endpoint (top 10)
topk(10, sum by (handler) (rate(http_requests_total[5m])))
\`\`\`

### Latency Percentiles
\`\`\`promql
# p50, p90, p99 latency in milliseconds
histogram_quantile(0.50, sum by (le) (rate(http_request_duration_seconds_bucket[5m]))) * 1000
histogram_quantile(0.90, sum by (le) (rate(http_request_duration_seconds_bucket[5m]))) * 1000
histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m]))) * 1000

# Apdex score (threshold 0.5s)
(
  sum(rate(http_request_duration_seconds_bucket{le="0.5"}[5m]))
  + sum(rate(http_request_duration_seconds_bucket{le="1.0"}[5m]))
) / 2
/ sum(rate(http_request_duration_seconds_count[5m]))
\`\`\`

### Disk & Prediction
\`\`\`promql
# Disk usage percentage
(1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100

# Predict when disk will be full (linear extrapolation)
predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[6h], 24*3600) < 0
# => TRUE neu disk se day trong 24h toi
\`\`\`

> ⚠️ Luu y: Luon dung \`rate()\` thay vi \`irate()\` trong alert rules. \`irate()\` rat nhay va co the gay false positives. \`rate()\` cho ket qua on dinh hon vi average qua ca range window.
    `
  },
  {
    id: 5,
    title: "Grafana Dashboards",
    desc: "Xay dung dashboards chuyen nghiep voi Grafana - tu thiet ke den provisioning",
    content: `
## Grafana Architecture

Grafana la **open-source visualization and analytics platform** ho tro nhieu data sources.

\`\`\`mermaid
graph TB
    subgraph "Grafana Architecture"
        UI[Grafana UI<br/>Browser]
        API[Grafana Server<br/>API + Auth]
        DB[(Grafana DB<br/>SQLite/MySQL/Postgres)]
    end
    subgraph "Data Sources"
        PROM[Prometheus]
        ES[Elasticsearch]
        LOKI[Loki]
        INFLUX[InfluxDB]
        MYSQL[MySQL]
        PG[PostgreSQL]
    end
    UI --> API
    API --> DB
    API --> PROM
    API --> ES
    API --> LOKI
    API --> INFLUX
    API --> MYSQL
    API --> PG
    style UI fill:#f97316,stroke:#ea580c,color:#fff
    style API fill:#f97316,stroke:#ea580c,color:#fff
\`\`\`

### Data Source Configuration
\`\`\`yaml
# provisioning/datasources/datasource.yml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    jsonData:
      timeInterval: '15s'
      queryTimeout: '60s'
      httpMethod: POST

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    jsonData:
      maxLines: 1000

  - name: Elasticsearch
    type: elasticsearch
    access: proxy
    url: http://elasticsearch:9200
    database: 'logs-*'
    jsonData:
      esVersion: '8.0.0'
      timeField: '@timestamp'
      logMessageField: message
      logLevelField: level
\`\`\`

## Dashboard Design Principles

### Layout Strategy - Top to Bottom

\`\`\`text
+----------------------------------------------------------+
| Row 1: Overview / Key Metrics (Stat panels)              |
| [Request Rate] [Error Rate] [p99 Latency] [Uptime]      |
+----------------------------------------------------------+
| Row 2: Traffic & Errors (Graph panels)                   |
| [Request Rate Over Time    ] [Error Rate Over Time      ]|
+----------------------------------------------------------+
| Row 3: Latency (Graph + Heatmap)                         |
| [Latency Percentiles       ] [Latency Heatmap           ]|
+----------------------------------------------------------+
| Row 4: Resources (Graph panels)                          |
| [CPU Usage                 ] [Memory Usage              ]|
+----------------------------------------------------------+
| Row 5: Details (Table panels)                            |
| [Top Endpoints by Request Rate                           ]|
| [Recent Errors Table                                     ]|
+----------------------------------------------------------+
\`\`\`

### Design Principles
1. **Tren xuong duoi**: Overview -> Details (progressive disclosure)
2. **Trai sang phai**: Related metrics canh nhau
3. **Consistent colors**: Xanh = healthy, Do = error, Vang = warning
4. **Time range**: Tat ca panels dung chung time range
5. **Variables**: Cho phep filter by service, instance, environment
6. **Max 15-20 panels** per dashboard - qua nhieu = mat focus

## Panel Types

| Panel Type | Use Case | Best For |
|-----------|----------|----------|
| **Time series** | Metrics over time | Request rate, CPU, memory |
| **Stat** | Single value | Current error rate, uptime |
| **Gauge** | Value within range | CPU %, disk usage % |
| **Bar gauge** | Compare values | Top endpoints |
| **Table** | Tabular data | Instance details, top-N |
| **Heatmap** | Distribution over time | Latency distribution |
| **Logs** | Log entries | Application logs from Loki |
| **Node graph** | Service dependencies | Service mesh topology |
| **Pie chart** | Proportions | Error distribution by type |
| **Alert list** | Active alerts | Current firing alerts |

## Variables and Templating

\`\`\`json
{
  "templating": {
    "list": [
      {
        "name": "datasource",
        "type": "datasource",
        "query": "prometheus",
        "label": "Data Source"
      },
      {
        "name": "namespace",
        "type": "query",
        "datasource": "Prometheus",
        "query": "label_values(kube_pod_info, namespace)",
        "refresh": 2,
        "sort": 1,
        "multi": true,
        "includeAll": true,
        "label": "Namespace"
      },
      {
        "name": "service",
        "type": "query",
        "datasource": "Prometheus",
        "query": "label_values(up{namespace=~\\"$namespace\\"}, job)",
        "refresh": 2,
        "sort": 1,
        "label": "Service"
      },
      {
        "name": "instance",
        "type": "query",
        "datasource": "Prometheus",
        "query": "label_values(up{job=\\"$service\\"}, instance)",
        "refresh": 2,
        "sort": 1,
        "multi": true,
        "includeAll": true,
        "label": "Instance"
      }
    ]
  }
}
\`\`\`

### Using Variables in Queries
\`\`\`promql
# Single variable
rate(http_requests_total{job="$service"}[5m])

# Multi-value variable (regex)
rate(http_requests_total{job=~"$service", instance=~"$instance"}[5m])

# In legend
{{method}} - {{status}} on {{instance}}

# Repeat panel per variable value
# Panel setting: Repeat -> select variable -> horizontal/vertical
\`\`\`

## Dashboard Provisioning

\`\`\`yaml
# provisioning/dashboards/dashboards.yml
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: 'Provisioned'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards/json
      foldersFromFilesStructure: true
\`\`\`

### Dashboard JSON Definition
\`\`\`json
{
  "dashboard": {
    "id": null,
    "uid": "service-overview",
    "title": "Service Overview",
    "tags": ["production", "overview"],
    "timezone": "browser",
    "refresh": "30s",
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "stat",
        "gridPos": { "h": 4, "w": 6, "x": 0, "y": 0 },
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=\\"$service\\"}[5m]))",
            "legendFormat": "req/s"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "reqps",
            "thresholds": {
              "steps": [
                { "value": 0, "color": "green" },
                { "value": 1000, "color": "yellow" },
                { "value": 5000, "color": "red" }
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "Error Rate",
        "type": "stat",
        "gridPos": { "h": 4, "w": 6, "x": 6, "y": 0 },
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=\\"$service\\",status=~\\"5..\\"}[5m])) / sum(rate(http_requests_total{job=\\"$service\\"}[5m])) * 100",
            "legendFormat": "error %"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "steps": [
                { "value": 0, "color": "green" },
                { "value": 1, "color": "yellow" },
                { "value": 5, "color": "red" }
              ]
            }
          }
        }
      },
      {
        "id": 3,
        "title": "Request Rate Over Time",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 4 },
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum by (method) (rate(http_requests_total{job=\\"$service\\"}[5m]))",
            "legendFormat": "{{method}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "reqps",
            "custom": {
              "drawStyle": "line",
              "lineWidth": 2,
              "fillOpacity": 10,
              "pointSize": 5,
              "stacking": { "mode": "none" }
            }
          }
        }
      },
      {
        "id": 4,
        "title": "Latency Percentiles",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 4 },
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum by (le) (rate(http_request_duration_seconds_bucket{job=\\"$service\\"}[5m]))) * 1000",
            "legendFormat": "p50"
          },
          {
            "expr": "histogram_quantile(0.90, sum by (le) (rate(http_request_duration_seconds_bucket{job=\\"$service\\"}[5m]))) * 1000",
            "legendFormat": "p90"
          },
          {
            "expr": "histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket{job=\\"$service\\"}[5m]))) * 1000",
            "legendFormat": "p99"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "ms",
            "custom": {
              "drawStyle": "line",
              "lineWidth": 2,
              "fillOpacity": 5
            }
          }
        }
      }
    ]
  }
}
\`\`\`

## Annotations

\`\`\`json
{
  "annotations": {
    "list": [
      {
        "name": "Deployments",
        "datasource": "Prometheus",
        "expr": "changes(kube_deployment_status_observed_generation{namespace=\\"$namespace\\"}[2m]) > 0",
        "titleFormat": "Deployment",
        "textFormat": "{{deployment}} updated",
        "tagKeys": "namespace,deployment",
        "iconColor": "blue",
        "enable": true
      },
      {
        "name": "Alerts",
        "datasource": "-- Grafana --",
        "type": "alert",
        "iconColor": "red",
        "enable": true
      }
    ]
  }
}
\`\`\`

## Best Practices Summary

1. **Naming**: Dashboard ten ro rang: \`[Team] Service Name - Purpose\`
2. **Tags**: Su dung tags de organize: \`production\`, \`team-backend\`, \`sre\`
3. **Variables**: Luon co datasource, namespace, service variables
4. **Refresh**: Set auto-refresh phu hop (30s cho real-time, 5m cho overview)
5. **Alerts**: Dinh nghia alerts truc tiep tren panels quan trong
6. **Links**: Them dashboard links de navigate giua related dashboards
7. **Version control**: Export JSON va luu trong Git
8. **Documentation**: Them description cho moi panel va dashboard

> ⚠️ Luu y: Dashboard khong phai "set and forget". Review va update dashboards thuong xuyen khi he thong thay doi. Dashboard khong ai xem la dashboard khong can thiet - xoa di de giam noise.
    `
  },
  {
    id: 6,
    title: "Alerting with Alertmanager",
    desc: "Thiet lap alerting hieu qua - Tu Prometheus alert rules den Alertmanager routing",
    content: `
## Alert Rules in Prometheus

Alert rules duoc dinh nghia trong Prometheus va gui den Alertmanager khi fire.

\`\`\`yaml
# rules/alert_rules.yml
groups:
  - name: service_alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))
          / sum by (job) (rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "High error rate on {{ $labels.job }}"
          description: "Error rate is {{ $value | humanizePercentage }} (threshold: 5%) for job {{ $labels.job }}"
          runbook_url: "https://wiki.example.com/runbooks/high-error-rate"
          dashboard_url: "https://grafana.example.com/d/service-overview?var-service={{ $labels.job }}"

      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99,
            sum by (job, le) (rate(http_request_duration_seconds_bucket[5m]))
          ) > 1.0
        for: 10m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "High p99 latency on {{ $labels.job }}"
          description: "p99 latency is {{ $value | humanizeDuration }} (threshold: 1s)"

      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Instance {{ $labels.instance }} of job {{ $labels.job }} has been down for more than 2 minutes"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) > 0.9
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # Disk almost full
      - alert: DiskAlmostFull
        expr: |
          (1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) > 0.85
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "Disk almost full on {{ $labels.instance }}"
          description: "Disk usage is {{ $value | humanizePercentage }} on {{ $labels.mountpoint }}"

      # Disk will be full soon (prediction)
      - alert: DiskWillFillIn24h
        expr: |
          predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[6h], 24*3600) < 0
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Disk on {{ $labels.instance }} will be full within 24 hours"
\`\`\`

## Alert Lifecycle

\`\`\`mermaid
stateDiagram-v2
    [*] --> Inactive: Condition FALSE
    Inactive --> Pending: Condition TRUE
    Pending --> Firing: Condition TRUE for 'for' duration
    Pending --> Inactive: Condition FALSE (reset)
    Firing --> Inactive: Condition FALSE (resolved)
    Firing --> Firing: Condition TRUE (continues)
\`\`\`

| State | Description |
|-------|------------|
| **Inactive** | Alert condition chua thoa man |
| **Pending** | Condition TRUE nhung chua du thoi gian \`for\` |
| **Firing** | Condition TRUE >= \`for\` duration, gui den Alertmanager |

## Alertmanager Architecture

\`\`\`mermaid
graph TD
    subgraph "Alertmanager Pipeline"
        IN[Incoming Alerts<br/>from Prometheus]
        IN --> DEDUP[Deduplication<br/>Go bo trung lap]
        DEDUP --> GROUP[Grouping<br/>Nhom alerts lien quan]
        GROUP --> ROUTE[Routing<br/>Chon receiver phu hop]
        ROUTE --> INHIB[Inhibition<br/>An alerts phu thuoc]
        INHIB --> SILENCE[Silencing<br/>Tam tat alerts]
        SILENCE --> NOTIFY[Notification<br/>Gui thong bao]
    end
    NOTIFY --> SLACK[Slack]
    NOTIFY --> PD[PagerDuty]
    NOTIFY --> EMAIL[Email]
    NOTIFY --> WH[Webhook]
    style IN fill:#ef4444,stroke:#dc2626,color:#fff
    style NOTIFY fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### Key Concepts

- **Grouping**: Nhom nhieu alerts thanh 1 notification (vd: 100 instances cung loi -> 1 message)
- **Inhibition**: Khi alert A fire thi suppress alert B (vd: cluster down -> suppress pod alerts)
- **Silencing**: Tam thoi tat alerts (vd: scheduled maintenance)
- **Routing**: Route alerts den dung receiver dua tren labels

## Alertmanager Configuration

\`\`\`yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'app-password'
  slack_api_url: 'https://hooks.slack.com/services/xxx/yyy/zzz'

# Routing tree
route:
  receiver: 'default-slack'
  group_by: ['alertname', 'job', 'severity']
  group_wait: 30s            # Doi 30s de nhom alerts
  group_interval: 5m         # Gui notification group moi 5 phut
  repeat_interval: 4h        # Gui lai notification moi 4h neu chua resolve
  routes:
    # Critical alerts -> PagerDuty + Slack
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      group_wait: 10s
      repeat_interval: 1h
      routes:
        # Database alerts -> DBA team
        - match:
            team: dba
          receiver: 'pagerduty-dba'

    # Warning alerts -> Slack only
    - match:
        severity: warning
      receiver: 'slack-warnings'
      repeat_interval: 8h

    # Info alerts -> email digest
    - match:
        severity: info
      receiver: 'email-digest'
      group_wait: 10m
      repeat_interval: 24h

# Inhibition rules
inhibit_rules:
  # Neu critical fire -> suppress warning cung job
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'job']

  # Neu cluster down -> suppress tat ca alerts cua cluster do
  - source_match:
      alertname: 'ClusterDown'
    target_match_re:
      alertname: '.+'
    equal: ['cluster']

# Receivers
receivers:
  - name: 'default-slack'
    slack_configs:
      - channel: '#monitoring-alerts'
        send_resolved: true
        title: '{{ if eq .Status "firing" }}:fire:{{ else }}:white_check_mark:{{ end }} [{{ .Status | toUpper }}] {{ .CommonLabels.alertname }}'
        text: >-
          *Alert:* {{ .CommonAnnotations.summary }}
          *Description:* {{ .CommonAnnotations.description }}
          *Severity:* {{ .CommonLabels.severity }}
          *Details:*
          {{ range .Alerts }}
            - *{{ .Labels.instance }}*: {{ .Annotations.description }}
          {{ end }}
        actions:
          - type: button
            text: 'Runbook :book:'
            url: '{{ (index .Alerts 0).Annotations.runbook_url }}'
          - type: button
            text: 'Dashboard :bar_chart:'
            url: '{{ (index .Alerts 0).Annotations.dashboard_url }}'

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'your-pagerduty-service-key'
        severity: '{{ .CommonLabels.severity }}'
        description: '{{ .CommonAnnotations.summary }}'
        details:
          firing: '{{ .Alerts.Firing | len }}'
          resolved: '{{ .Alerts.Resolved | len }}'
          description: '{{ .CommonAnnotations.description }}'
    slack_configs:
      - channel: '#critical-alerts'
        send_resolved: true

  - name: 'pagerduty-dba'
    pagerduty_configs:
      - service_key: 'dba-pagerduty-key'

  - name: 'slack-warnings'
    slack_configs:
      - channel: '#monitoring-warnings'
        send_resolved: true

  - name: 'email-digest'
    email_configs:
      - to: 'team@example.com'
        send_resolved: false
\`\`\`

## Webhook Receiver

\`\`\`yaml
receivers:
  - name: 'custom-webhook'
    webhook_configs:
      - url: 'http://alert-handler:8080/api/alerts'
        send_resolved: true
        http_config:
          bearer_token: 'your-auth-token'
\`\`\`

\`\`\`json
// Webhook payload tu Alertmanager
{
  "version": "4",
  "status": "firing",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "HighErrorRate",
        "severity": "critical",
        "job": "api-server"
      },
      "annotations": {
        "summary": "High error rate on api-server",
        "description": "Error rate is 8.5%"
      },
      "startsAt": "2024-01-15T10:30:00Z",
      "endsAt": "0001-01-01T00:00:00Z",
      "generatorURL": "http://prometheus:9090/graph?g0.expr=..."
    }
  ],
  "groupLabels": { "alertname": "HighErrorRate" },
  "commonLabels": { "severity": "critical" },
  "commonAnnotations": { "summary": "High error rate on api-server" },
  "externalURL": "http://alertmanager:9093"
}
\`\`\`

## Alert Fatigue Prevention

| Strategy | Description |
|----------|------------|
| **Meaningful thresholds** | Dua tren SLO, khong phai con so tuy y |
| **Appropriate \`for\` duration** | 5-15m cho critical, 15-30m cho warning |
| **Proper grouping** | Nhom alerts cung nguyen nhan |
| **Inhibition rules** | Suppress cascading alerts |
| **Routing by severity** | Critical -> pager, Warning -> Slack, Info -> email |
| **Actionable alerts** | Moi alert phai co runbook va dashboard link |
| **Regular review** | Review alerts hang thang, xoa alerts khong ai action |
| **Error budgets** | Alert dua tren burn rate thay vi threshold tuyet doi |

### Anti-patterns
- Alert tren MOI metric (alert fatigue)
- Threshold qua thap (false positives nhieu)
- Khong co \`for\` duration (flapping alerts)
- Khong co runbook (nhan alert nhung khong biet lam gi)
- Alert khong ai action (noise)

> ⚠️ Luu y: Moi alert PHAI co runbook_url va dashboard_url trong annotations. Alert ma khong co huong dan xu ly thi chi lam tang noise va stress cho on-call engineers.
    `
  },
  {
    id: 7,
    title: "Application Metrics with Micrometer",
    desc: "Instrument ung dung Java/Spring Boot voi Micrometer - metrics facade cho JVM applications",
    content: `
## Micrometer Overview

**Micrometer** la metrics facade cho JVM applications - tuong tu nhu SLF4J cho logging. No cung cap vendor-neutral API de instrument code va export den nhieu monitoring systems.

\`\`\`mermaid
graph LR
    subgraph "Application Code"
        APP[Your Application]
        MIC[Micrometer API]
    end
    subgraph "Meter Registries"
        PROM[Prometheus Registry]
        DD[Datadog Registry]
        INFLUX[InfluxDB Registry]
        NR[New Relic Registry]
    end
    APP --> MIC
    MIC --> PROM
    MIC --> DD
    MIC --> INFLUX
    MIC --> NR
    style MIC fill:#3b82f6,stroke:#2563eb,color:#fff
\`\`\`

### Dependencies (Spring Boot)
\`\`\`yaml
# build.gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-registry-prometheus'
}
\`\`\`

\`\`\`yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  endpoint:
    health:
      show-details: always
  metrics:
    tags:
      application: my-service
      environment: production
    distribution:
      percentiles-histogram:
        http.server.requests: true
      slo:
        http.server.requests: 50ms,100ms,200ms,500ms,1s
\`\`\`

## Meter Types

### 1. Counter - Dem so luong events
\`\`\`java
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

@Service
public class OrderService {

    private final Counter orderCounter;
    private final Counter orderErrorCounter;

    public OrderService(MeterRegistry registry) {
        // Cach 1: Builder pattern
        this.orderCounter = Counter.builder("orders.created")
            .description("Total number of orders created")
            .tag("type", "all")
            .register(registry);

        this.orderErrorCounter = Counter.builder("orders.errors")
            .description("Total number of order processing errors")
            .register(registry);
    }

    public Order createOrder(OrderRequest request) {
        try {
            Order order = processOrder(request);
            orderCounter.increment();
            return order;
        } catch (Exception e) {
            orderErrorCounter.increment();
            throw e;
        }
    }

    // Cach 2: Dynamic tags
    public void processPayment(String paymentMethod) {
        Counter.builder("payments.processed")
            .tag("method", paymentMethod)   // visa, mastercard, etc.
            .tag("status", "success")
            .register(registry)
            .increment();
    }
}
\`\`\`

### 2. Timer - Do thoi gian thuc thi
\`\`\`java
import io.micrometer.core.instrument.Timer;

@Service
public class UserService {

    private final Timer userLookupTimer;
    private final MeterRegistry registry;

    public UserService(MeterRegistry registry) {
        this.registry = registry;
        this.userLookupTimer = Timer.builder("users.lookup.duration")
            .description("Time taken to look up a user")
            .publishPercentiles(0.5, 0.9, 0.95, 0.99)    // Client-side percentiles
            .publishPercentileHistogram()                   // Server-side histogram
            .serviceLevelObjectives(                        // SLO buckets
                Duration.ofMillis(50),
                Duration.ofMillis(100),
                Duration.ofMillis(500),
                Duration.ofSeconds(1)
            )
            .register(registry);
    }

    // Cach 1: Timer.record()
    public User findUser(String id) {
        return userLookupTimer.record(() -> {
            return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        });
    }

    // Cach 2: Timer.Sample
    public User findUserWithSample(String id) {
        Timer.Sample sample = Timer.start(registry);
        try {
            User user = userRepository.findById(id).orElseThrow();
            sample.stop(Timer.builder("users.lookup.duration")
                .tag("status", "success")
                .register(registry));
            return user;
        } catch (Exception e) {
            sample.stop(Timer.builder("users.lookup.duration")
                .tag("status", "error")
                .register(registry));
            throw e;
        }
    }
}
\`\`\`

### 3. Gauge - Gia tri hien tai
\`\`\`java
import io.micrometer.core.instrument.Gauge;

@Component
public class QueueMetrics {

    private final BlockingQueue<Task> taskQueue;

    public QueueMetrics(MeterRegistry registry, BlockingQueue<Task> taskQueue) {
        this.taskQueue = taskQueue;

        // Gauge tu dong doc gia tri tu object
        Gauge.builder("task.queue.size", taskQueue, BlockingQueue::size)
            .description("Current number of tasks in the queue")
            .tag("queue", "main")
            .register(registry);

        // Gauge tu AtomicInteger
        AtomicInteger activeUsers = new AtomicInteger(0);
        Gauge.builder("users.active", activeUsers, AtomicInteger::get)
            .description("Number of currently active users")
            .register(registry);

        // Gauge tu collection size
        Gauge.builder("cache.entries", cacheManager,
            cm -> cm.getCache("users").estimatedSize())
            .description("Number of entries in user cache")
            .register(registry);
    }
}
\`\`\`

### 4. DistributionSummary - Phan phoi gia tri (khong phai thoi gian)
\`\`\`java
import io.micrometer.core.instrument.DistributionSummary;

@Service
public class PaymentService {

    private final DistributionSummary paymentAmount;

    public PaymentService(MeterRegistry registry) {
        this.paymentAmount = DistributionSummary.builder("payment.amount")
            .description("Distribution of payment amounts")
            .baseUnit("usd")
            .publishPercentiles(0.5, 0.9, 0.99)
            .publishPercentileHistogram()
            .scale(0.01)                    // Convert cents to dollars
            .minimumExpectedValue(1.0)
            .maximumExpectedValue(10000.0)
            .register(registry);
    }

    public void processPayment(BigDecimal amount) {
        paymentAmount.record(amount.doubleValue());
        // ... payment processing logic
    }
}
\`\`\`

## Annotations: @Timed and @Counted

\`\`\`java
import io.micrometer.core.annotation.Timed;
import io.micrometer.core.annotation.Counted;

// Phai enable annotation support
@Configuration
public class MetricsConfig {
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }

    @Bean
    public CountedAspect countedAspect(MeterRegistry registry) {
        return new CountedAspect(registry);
    }
}

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Timed(
        value = "orders.api.duration",
        description = "Time taken to process order API requests",
        percentiles = {0.5, 0.9, 0.99},
        histogram = true
    )
    @GetMapping("/{id}")
    public Order getOrder(@PathVariable String id) {
        return orderService.findById(id);
    }

    @Counted(
        value = "orders.api.calls",
        description = "Number of order API calls"
    )
    @PostMapping
    public Order createOrder(@RequestBody OrderRequest request) {
        return orderService.create(request);
    }

    @Timed(value = "orders.api.list.duration", histogram = true)
    @GetMapping
    public List<Order> listOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return orderService.findAll(page, size);
    }
}
\`\`\`

## Custom Metrics Implementation

\`\`\`java
@Component
public class BusinessMetrics {

    private final MeterRegistry registry;

    public BusinessMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    // Revenue tracking
    public void recordRevenue(String product, String currency, double amount) {
        DistributionSummary.builder("business.revenue")
            .tag("product", product)
            .tag("currency", currency)
            .register(registry)
            .record(amount);
    }

    // User signup funnel
    public void recordFunnelStep(String step, String source) {
        Counter.builder("business.funnel")
            .tag("step", step)       // "visit", "signup", "verify", "activate"
            .tag("source", source)   // "google", "facebook", "direct"
            .register(registry)
            .increment();
    }

    // SLA tracking
    public void recordSlaCompliance(String operation, boolean withinSla) {
        Counter.builder("business.sla")
            .tag("operation", operation)
            .tag("compliant", String.valueOf(withinSla))
            .register(registry)
            .increment();
    }

    // Circuit breaker state
    public void recordCircuitBreakerState(String service, String state) {
        // state: "closed", "open", "half_open"
        Gauge.builder("circuit_breaker.state", () -> {
            switch (state) {
                case "closed": return 0;
                case "half_open": return 1;
                case "open": return 2;
                default: return -1;
            }
        })
        .tag("service", service)
        .register(registry);
    }
}
\`\`\`

## JVM Metrics (Auto-configured with Spring Boot Actuator)

Spring Boot Actuator tu dong expose nhieu JVM metrics:

| Metric | Description |
|--------|------------|
| \`jvm_memory_used_bytes\` | Memory dang su dung (heap/non-heap) |
| \`jvm_memory_max_bytes\` | Memory toi da |
| \`jvm_gc_pause_seconds\` | GC pause duration |
| \`jvm_gc_memory_promoted_bytes_total\` | Bytes promoted to old gen |
| \`jvm_threads_states_threads\` | Thread count by state |
| \`jvm_threads_live_threads\` | Current live threads |
| \`jvm_classes_loaded_classes\` | Classes currently loaded |
| \`process_cpu_usage\` | CPU usage cua process |
| \`system_cpu_usage\` | CPU usage cua he thong |
| \`process_uptime_seconds\` | Process uptime |
| \`hikaricp_connections_active\` | HikariCP active connections |
| \`hikaricp_connections_idle\` | HikariCP idle connections |
| \`http_server_requests_seconds\` | HTTP request duration |

\`\`\`promql
# Useful PromQL for JVM metrics
# Heap memory usage percentage
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100

# GC pause rate
rate(jvm_gc_pause_seconds_count[5m])

# GC pause duration p99
histogram_quantile(0.99, rate(jvm_gc_pause_seconds_bucket[5m]))

# Thread pool utilization
jvm_threads_states_threads{state="runnable"}
  / jvm_threads_live_threads * 100

# HikariCP connection pool utilization
hikaricp_connections_active / hikaricp_connections_max * 100
\`\`\`

> ⚠️ Luu y: TRANH tao metrics voi high cardinality tags. Khong dung user_id, request_id, hay bat ky identifier nao co gia tri unique cao lam tag. Dieu nay se gay Prometheus OOM va query cham.
    `
  },
  {
    id: 8,
    title: "Distributed Tracing Fundamentals",
    desc: "Hieu sau ve Distributed Tracing - theo doi request xuyen suot microservices",
    content: `
## What is Distributed Tracing?

Trong microservices, mot request cua user co the di qua **hang chuc services**. Khi co loi hoac performance cham, lam sao biet service nao gay ra van de?

**Distributed Tracing** theo doi toan bo hanh trinh cua request xuyen suot tat ca services.

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant GW as API Gateway
    participant OS as Order Service
    participant PS as Payment Service
    participant IS as Inventory Service
    participant NS as Notification Service
    participant DB as Database

    U->>GW: POST /orders
    Note over GW: Trace ID: abc123
    GW->>OS: Create Order
    Note over OS: Span: order-create
    OS->>PS: Process Payment
    Note over PS: Span: payment-process
    PS->>DB: Charge Card
    Note over DB: Span: db-query
    DB-->>PS: Success
    PS-->>OS: Payment OK
    OS->>IS: Reserve Items
    Note over IS: Span: inventory-reserve
    IS->>DB: Update Stock
    DB-->>IS: Updated
    IS-->>OS: Reserved
    OS->>NS: Send Confirmation
    Note over NS: Span: send-email (async)
    OS-->>GW: Order Created
    GW-->>U: 201 Created
\`\`\`

## Core Concepts

### Trace
Mot **Trace** dai dien cho toan bo hanh trinh cua mot request trong he thong. Gom nhieu Spans.

### Span
Mot **Span** dai dien cho mot don vi cong viec (operation) trong trace. Co:
- **Trace ID**: Dinh danh toan bo trace (shared across all spans)
- **Span ID**: Dinh danh rieng cua span
- **Parent Span ID**: Span cha (tao nen cay hierarchy)
- **Operation Name**: Ten cua operation
- **Start/End Timestamp**: Thoi gian bat dau va ket thuc
- **Tags/Attributes**: Metadata (http.method, http.status_code, db.type)
- **Events/Logs**: Events xay ra trong span
- **Status**: OK, ERROR, UNSET

\`\`\`text
Trace: abc123
├── Span A: API Gateway (0-250ms)
│   ├── Span B: Order Service - create order (10-240ms)
│   │   ├── Span C: Payment Service - process payment (20-150ms)
│   │   │   └── Span D: Database - charge card (30-100ms)
│   │   ├── Span E: Inventory Service - reserve (155-220ms)
│   │   │   └── Span F: Database - update stock (160-200ms)
│   │   └── Span G: Notification - send email (225-235ms) [async]
\`\`\`

### SpanContext
**SpanContext** chua thong tin can thiet de propagate trace across service boundaries:

\`\`\`text
SpanContext:
  - Trace ID:  4bf92f3577b34da6a3ce929d0e0e4736
  - Span ID:   00f067aa0ba902b7
  - Trace Flags: 01 (sampled)
  - Trace State: vendor-specific data
\`\`\`

## Context Propagation

Khi Service A goi Service B, trace context duoc truyen qua HTTP headers.

### W3C Trace Context (Standard)
\`\`\`text
# Request headers
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             |  |                                |                |
             v  v                                v                v
          version  trace-id (32 hex)         parent-id (16 hex) flags

tracestate: rojo=00f067aa0ba902b7,congo=t61rcWkgMzE
            # Vendor-specific trace data
\`\`\`

### B3 Propagation (Zipkin)
\`\`\`text
# Single header format
b3: 4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-1

# Multi header format
X-B3-TraceId: 4bf92f3577b34da6a3ce929d0e0e4736
X-B3-SpanId: 00f067aa0ba902b7
X-B3-ParentSpanId: 463ac35c9f6413ad
X-B3-Sampled: 1
\`\`\`

### Propagation in Code (Spring Boot + OpenTelemetry)
\`\`\`java
// Auto-propagation: Spring Boot + OpenTelemetry auto-instrumentation
// HTTP headers duoc tu dong inject/extract

// Manual propagation (khi can)
import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.TextMapPropagator;

@Service
public class TracingService {

    private final OpenTelemetry openTelemetry;

    // Inject trace context vao outgoing request
    public void injectContext(HttpHeaders headers) {
        TextMapPropagator propagator = openTelemetry.getPropagators()
            .getTextMapPropagator();
        propagator.inject(Context.current(), headers,
            (carrier, key, value) -> carrier.set(key, value));
    }

    // Extract trace context tu incoming request
    public Context extractContext(HttpServletRequest request) {
        TextMapPropagator propagator = openTelemetry.getPropagators()
            .getTextMapPropagator();
        return propagator.extract(Context.current(), request,
            new TextMapGetter<HttpServletRequest>() {
                @Override
                public Iterable<String> keys(HttpServletRequest carrier) {
                    return Collections.list(carrier.getHeaderNames());
                }
                @Override
                public String get(HttpServletRequest carrier, String key) {
                    return carrier.getHeader(key);
                }
            });
    }
}
\`\`\`

## Sampling Strategies

Khong the trace 100% requests trong production (qua nhieu data, qua ton chi phi). Sampling giup giam volume.

### Head-Based Sampling
Quyet dinh trace hay khong **ngay khi request bat dau** (tai entry point).

\`\`\`text
Request vao -> Random(0-1) < sampling_rate? -> Yes: Trace | No: Skip

Vi du: sampling_rate = 0.1 (10%)
=> Cu 10 requests thi trace 1 request
\`\`\`

| Pros | Cons |
|------|------|
| Don gian, hieu qua | Co the bo sot errors (neu error request khong duoc sample) |
| It overhead | Khong biet truoc request co "interesting" khong |
| Consistent across services | Bias toward frequent paths |

### Tail-Based Sampling
Thu thap ALL spans truoc, roi quyet dinh giu hay bo **sau khi trace hoan thanh**.

\`\`\`text
All spans -> Buffer -> Trace complete? -> Apply rules:
  - Error? -> KEEP
  - Latency > 1s? -> KEEP
  - Specific endpoint? -> KEEP
  - Normal? -> Sample 5%
\`\`\`

| Pros | Cons |
|------|------|
| Giu tat ca traces co error/high latency | Can buffer toan bo spans (nhieu memory) |
| Quyet dinh thong minh hon | Phuc tap hon (can collector) |
| Khong bo sot interesting traces | Latency cao hon (doi trace complete) |

\`\`\`mermaid
graph LR
    subgraph "Head-Based Sampling"
        R1[Request] --> D1{Random < 10%?}
        D1 -->|Yes| T1[Trace]
        D1 -->|No| S1[Skip]
    end
    subgraph "Tail-Based Sampling"
        R2[All Requests] --> B2[Buffer All Spans]
        B2 --> D2{Trace Complete}
        D2 --> E2{Error or Slow?}
        E2 -->|Yes| K2[Keep]
        E2 -->|No| P2{Random < 5%?}
        P2 -->|Yes| K2
        P2 -->|No| S2[Drop]
    end
\`\`\`

### Practical Sampling Config
\`\`\`yaml
# OpenTelemetry Collector - tail sampling
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    policies:
      # Giu tat ca traces co error
      - name: errors-policy
        type: status_code
        status_code: {status_codes: [ERROR]}
      # Giu traces co latency > 1s
      - name: latency-policy
        type: latency
        latency: {threshold_ms: 1000}
      # Sample 10% cac traces binh thuong
      - name: probabilistic-policy
        type: probabilistic
        probabilistic: {sampling_percentage: 10}
\`\`\`

## Trace Correlation with Logs and Metrics

### Inject Trace ID into Logs
\`\`\`java
// logback-spring.xml - Tu dong inject trace ID vao moi log line
// Voi OpenTelemetry Java Agent, trace_id va span_id duoc tu dong them vao MDC

// Log pattern
// %d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36}
//   [trace_id=%X{trace_id} span_id=%X{span_id}] - %msg%n

// Ket qua:
// 2024-01-15 10:30:05.123 [http-nio-8080-exec-1] ERROR OrderService
//   [trace_id=4bf92f3577b34da6 span_id=00f067aa0ba902b7] - Payment failed for order #12345
\`\`\`

\`\`\`xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>
                %d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} [trace_id=%X{trace_id} span_id=%X{span_id}] - %msg%n
            </pattern>
        </encoder>
    </appender>

    <!-- JSON format for log aggregation -->
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeMdcKeyName>trace_id</includeMdcKeyName>
            <includeMdcKeyName>span_id</includeMdcKeyName>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="JSON" />
    </root>
</configuration>
\`\`\`

### Exemplars - Link Metrics to Traces
\`\`\`java
// Micrometer + OpenTelemetry: tu dong attach trace_id vao histogram samples
// Grafana co the tu metric panel nhay sang trace view

// prometheus.yml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: 'spring-app'
    metrics_path: '/actuator/prometheus'
    # Enable exemplars
    params:
      includedNames: ['http_server_requests_seconds']
\`\`\`

\`\`\`text
# Prometheus metric with exemplar
http_request_duration_seconds_bucket{le="0.5"} 1000 # {trace_id="abc123"} 0.48
                                                      ↑ exemplar: link den trace
\`\`\`

\`\`\`mermaid
graph LR
    subgraph "Correlation"
        M[Metrics<br/>Error rate spike] -->|exemplar trace_id| T[Traces<br/>Slow trace detail]
        T -->|span logs| L[Logs<br/>Error message detail]
        L -->|trace_id filter| T
        M -->|time range| L
    end
    style M fill:#3b82f6,stroke:#2563eb,color:#fff
    style T fill:#f59e0b,stroke:#d97706,color:#fff
    style L fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

> ⚠️ Luu y: Sampling rate phai balance giua **observability** va **cost**. Bat dau voi 100% trong development, giam xuong 10-20% trong staging, va 1-5% trong production (tuy traffic). Luon giu 100% cho error traces voi tail-based sampling.
    `
  },
  {
    id: 9,
    title: 'OpenTelemetry',
    desc: 'OTel architecture, auto/manual instrumentation, Collector pipeline, OTLP',
    content: `
## OpenTelemetry

OpenTelemetry (OTel) la open-source observability framework - cung cap unified API, SDK, va tools de collect metrics, logs, va traces. Day la tuong lai cua observability.

### OTel Architecture

\`\`\`mermaid
graph LR
    subgraph "Application"
        API[OTel API] --> SDK[OTel SDK]
        SDK --> EXP[Exporters]
    end
    subgraph "Collector"
        R[Receivers] --> P[Processors]
        P --> E[Exporters]
    end
    EXP --> R
    E --> J[Jaeger]
    E --> PR[Prometheus]
    E --> L[Loki]
    style API fill:#3b82f6,stroke:#2563eb,color:#fff
    style SDK fill:#3b82f6,stroke:#2563eb,color:#fff
    style R fill:#22c55e,stroke:#16a34a,color:#fff
    style P fill:#f59e0b,stroke:#d97706,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

### Auto-Instrumentation (Java)

\`\`\`bash
# Download OTel Java Agent
curl -L https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar -o otel-agent.jar

# Run application with agent
java -javaagent:otel-agent.jar \\
  -Dotel.service.name=my-service \\
  -Dotel.exporter.otlp.endpoint=http://collector:4317 \\
  -Dotel.traces.sampler=parentbased_traceidratio \\
  -Dotel.traces.sampler.arg=0.1 \\
  -jar my-app.jar
\`\`\`

### Manual Instrumentation

\`\`\`java
// Initialize tracer
Tracer tracer = GlobalOpenTelemetry.getTracer("my-service", "1.0.0");

// Create span
Span span = tracer.spanBuilder("processOrder")
    .setSpanKind(SpanKind.INTERNAL)
    .setAttribute("order.id", orderId)
    .setAttribute("order.amount", amount)
    .startSpan();

try (Scope scope = span.makeCurrent()) {
    // Business logic
    validateOrder(orderId);
    processPayment(orderId, amount);

    span.setStatus(StatusCode.OK);
} catch (Exception e) {
    span.setStatus(StatusCode.ERROR, e.getMessage());
    span.recordException(e);
    throw e;
} finally {
    span.end();
}

// Custom metrics
Meter meter = GlobalOpenTelemetry.getMeter("my-service");

LongCounter orderCounter = meter.counterBuilder("orders.processed")
    .setDescription("Number of processed orders")
    .setUnit("1")
    .build();

orderCounter.add(1, Attributes.of(
    AttributeKey.stringKey("status"), "success",
    AttributeKey.stringKey("payment.method"), "credit_card"
));

DoubleHistogram latencyHistogram = meter.histogramBuilder("order.processing.duration")
    .setDescription("Order processing latency")
    .setUnit("ms")
    .build();

latencyHistogram.record(processingTimeMs);
\`\`\`

### OTel Collector Configuration

\`\`\`yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  prometheus:
    config:
      scrape_configs:
        - job_name: 'my-app'
          static_configs:
            - targets: ['app:8080']

processors:
  batch:
    timeout: 5s
    send_batch_size: 1024
  memory_limiter:
    limit_mib: 512
    spike_limit_mib: 128
    check_interval: 5s
  attributes:
    actions:
      - key: environment
        value: production
        action: upsert
  tail_sampling:
    decision_wait: 10s
    policies:
      - name: errors-policy
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: slow-traces
        type: latency
        latency: {threshold_ms: 1000}

exporters:
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  prometheus:
    endpoint: 0.0.0.0:8889
  loki:
    endpoint: http://loki:3100/loki/api/v1/push

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, tail_sampling]
      exporters: [otlp/jaeger]
    metrics:
      receivers: [otlp, prometheus]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch, attributes]
      exporters: [loki]
\`\`\`

### Context Propagation

| Standard | Header | Format |
|----------|--------|--------|
| W3C Trace Context | traceparent | 00-{trace-id}-{span-id}-{flags} |
| B3 Single | b3 | {trace-id}-{span-id}-{sampling} |
| B3 Multi | X-B3-TraceId, X-B3-SpanId | Separate headers |
| Jaeger | uber-trace-id | {trace-id}:{span-id}:{parent}:{flags} |

> ⚠️ Luu y: Chon W3C Trace Context lam standard - day la W3C recommendation va duoc support boi hau het frameworks. OTel SDK tu dong propagate context qua HTTP headers va messaging systems.
    `
  },
  {
    id: 10,
    title: 'Logging Architecture - ELK Stack',
    desc: 'Structured logging, Elasticsearch, Logstash, Kibana, Filebeat',
    content: `
## Logging Architecture - ELK Stack

ELK Stack (Elasticsearch, Logstash, Kibana) la standard cho centralized logging. Structured logging va log correlation la chia khoa cho effective debugging.

### ELK Pipeline

\`\`\`mermaid
graph LR
    A1[App 1] --> F[Filebeat]
    A2[App 2] --> F
    A3[App 3] --> F
    F --> L[Logstash]
    L --> E[Elasticsearch]
    E --> K[Kibana]
    style F fill:#f59e0b,stroke:#d97706,color:#fff
    style L fill:#22c55e,stroke:#16a34a,color:#fff
    style E fill:#3b82f6,stroke:#2563eb,color:#fff
    style K fill:#e11d48,stroke:#be123c,color:#fff
\`\`\`

### Structured Logging (Java/Logback)

\`\`\`xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeMdcKeyName>traceId</includeMdcKeyName>
            <includeMdcKeyName>spanId</includeMdcKeyName>
            <includeMdcKeyName>userId</includeMdcKeyName>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="JSON" />
    </root>
</configuration>
\`\`\`

\`\`\`java
// Structured logging with SLF4J + MDC
import org.slf4j.MDC;

public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public void processOrder(String orderId, String userId) {
        MDC.put("orderId", orderId);
        MDC.put("userId", userId);
        try {
            log.info("Processing order", kv("amount", 99.99), kv("items", 3));
            // ... business logic
            log.info("Order processed successfully");
        } catch (Exception e) {
            log.error("Order processing failed", e);
        } finally {
            MDC.clear();
        }
    }
}

// Output (JSON):
// {"timestamp":"2024-06-15T10:30:00","level":"INFO","logger":"OrderService",
//  "message":"Processing order","orderId":"ORD-123","userId":"USR-456",
//  "amount":99.99,"items":3,"traceId":"abc123","spanId":"def456"}
\`\`\`

### Logstash Configuration

\`\`\`text
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  json {
    source => "message"
  }

  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }

  if [level] == "ERROR" {
    mutate {
      add_tag => ["error"]
    }
  }

  geoip {
    source => "client_ip"
    target => "geoip"
  }

  mutate {
    remove_field => ["host", "agent"]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{[service.name]}-%{+YYYY.MM.dd}"
  }
}
\`\`\`

### Filebeat Configuration

\`\`\`yaml
# filebeat.yml
filebeat.inputs:
  - type: container
    paths:
      - /var/lib/docker/containers/*/*.log
    processors:
      - add_kubernetes_metadata:
          host: ${NODE_NAME}

output.logstash:
  hosts: ["logstash:5044"]

# Index Lifecycle Management
setup.ilm.enabled: true
setup.ilm.policy_name: "logs-policy"
setup.ilm.rollover_alias: "logs"
\`\`\`

### Elasticsearch Index Management

\`\`\`json
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "1d"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "freeze": {}
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
\`\`\`

### Log Levels Best Practices

| Level | Use For | Example |
|-------|---------|---------|
| TRACE | Very detailed debugging | Method entry/exit, variable values |
| DEBUG | Debugging information | SQL queries, cache hits/misses |
| INFO | Normal operation events | Request processed, job completed |
| WARN | Potential problems | Slow query, retry attempt, deprecation |
| ERROR | Errors requiring attention | Exception, failed operation |

> ⚠️ Luu y: Luon dung structured logging (JSON) trong production. KHONG log sensitive data (passwords, tokens, PII). Dung log correlation voi traceId de trace request across services.
    `
  },
  {
    id: 11,
    title: 'Kubernetes Monitoring',
    desc: 'kube-state-metrics, cAdvisor, Prometheus Operator, HPA custom metrics',
    content: `
## Kubernetes Monitoring

Monitoring Kubernetes can theo doi ca cluster infrastructure va application workloads. Prometheus Operator la standard de deploy monitoring stack tren K8s.

### K8s Monitoring Stack

\`\`\`mermaid
graph TD
    subgraph "Kubernetes Cluster"
        KSM[kube-state-metrics] --> P[Prometheus]
        NE[Node Exporter] --> P
        CA[cAdvisor] --> P
        APP[App Metrics] --> P
        MS[metrics-server] --> HPA[HPA]
    end
    P --> G[Grafana]
    P --> AM[Alertmanager]
    AM --> S[Slack/PagerDuty]
    style P fill:#e11d48,stroke:#be123c,color:#fff
    style G fill:#f59e0b,stroke:#d97706,color:#fff
    style AM fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

### kube-state-metrics vs metrics-server

| Aspect | kube-state-metrics | metrics-server |
|--------|-------------------|----------------|
| Purpose | K8s object states | Resource usage (CPU/Memory) |
| Data source | K8s API | kubelet/cAdvisor |
| Used by | Prometheus, alerting | HPA, kubectl top |
| Examples | Pod phase, deployment replicas | CPU %, Memory bytes |

### Key Kubernetes Metrics

\`\`\`text
# Pod metrics (kube-state-metrics)
kube_pod_status_phase{phase="Running"}
kube_pod_container_status_restarts_total
kube_pod_container_resource_requests{resource="cpu"}
kube_pod_container_resource_limits{resource="memory"}

# Deployment metrics
kube_deployment_status_replicas_available
kube_deployment_spec_replicas
kube_deployment_status_replicas_unavailable

# Node metrics (Node Exporter)
node_cpu_seconds_total
node_memory_MemAvailable_bytes
node_disk_io_time_seconds_total
node_network_receive_bytes_total

# Container metrics (cAdvisor)
container_cpu_usage_seconds_total
container_memory_working_set_bytes
container_network_receive_bytes_total
container_fs_usage_bytes
\`\`\`

### Prometheus Operator & ServiceMonitor

\`\`\`yaml
# ServiceMonitor: Tell Prometheus to scrape your app
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app-monitor
  labels:
    release: prometheus  # Must match Prometheus selector
spec:
  selector:
    matchLabels:
      app: my-app
  endpoints:
    - port: metrics
      path: /actuator/prometheus
      interval: 15s
      scrapeTimeout: 10s
  namespaceSelector:
    matchNames:
      - production

---
# PrometheusRule: Define alerts
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: my-app-alerts
spec:
  groups:
    - name: my-app
      rules:
        - alert: HighErrorRate
          expr: |
            sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
            / sum(rate(http_server_requests_seconds_count[5m])) > 0.05
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "High error rate detected"
            description: "Error rate is {{ $value | humanizePercentage }}"

        - alert: PodCrashLooping
          expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
          for: 5m
          labels:
            severity: warning
\`\`\`

### HPA with Custom Metrics

\`\`\`yaml
# HPA using custom Prometheus metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
\`\`\`

### Essential Grafana Dashboards for K8s

\`\`\`text
Recommended dashboards (Grafana.com IDs):
1. Kubernetes cluster overview: #6417
2. Node Exporter Full: #1860
3. Kubernetes pods: #6336
4. CoreDNS: #5926
5. etcd: #3070

Key panels to include:
- Cluster CPU/Memory utilization
- Pod restart counts
- Node disk pressure
- Network I/O per pod
- PVC usage
- API server request latency
\`\`\`

> ⚠️ Luu y: Luon set resource requests/limits cho pods. Khong co limits = pod co the consume het node resources. Monitoring resource usage giup right-size requests/limits va tiet kiem chi phi.
    `
  },
  {
    id: 12,
    title: 'APM - Application Performance Monitoring',
    desc: 'Transaction tracing, database monitoring, error tracking, anomaly detection',
    content: `
## APM - Application Performance Monitoring

APM cung cap deep visibility vao application performance, giup identify bottlenecks, errors, va degradations truoc khi user bi anh huong.

### APM Components

\`\`\`mermaid
graph TD
    subgraph "APM System"
        AT[Agent/SDK] --> C[Collector]
        C --> S[Storage]
        S --> UI[Dashboard/UI]
    end
    subgraph "Features"
        TX[Transaction Tracing]
        DB[Database Monitoring]
        ET[Error Tracking]
        SM[Service Map]
        AD[Anomaly Detection]
    end
    style AT fill:#3b82f6,stroke:#2563eb,color:#fff
    style C fill:#22c55e,stroke:#16a34a,color:#fff
    style S fill:#f59e0b,stroke:#d97706,color:#fff
    style UI fill:#e11d48,stroke:#be123c,color:#fff
\`\`\`

### Transaction Tracing

\`\`\`text
Transaction: POST /api/orders
Total: 450ms
├── Controller.createOrder: 5ms
├── OrderValidator.validate: 15ms
├── Database: INSERT orders: 25ms
├── Database: UPDATE inventory: 30ms
├── PaymentService.charge (HTTP): 350ms  ← BOTTLENECK!
│   ├── DNS lookup: 5ms
│   ├── TCP connect: 10ms
│   ├── TLS handshake: 20ms
│   └── Server processing: 315ms
└── NotificationService.send (Kafka): 25ms
\`\`\`

### Database Query Monitoring

\`\`\`java
// Spring Boot with Micrometer - auto database monitoring
// application.yml
spring:
  datasource:
    hikari:
      metrics:
        enabled: true

management:
  metrics:
    distribution:
      percentiles-histogram:
        spring.data.repository.invocations: true

// Key metrics to track:
// - Query execution time (p50, p95, p99)
// - Slow queries (> threshold)
// - Connection pool utilization
// - Query count per endpoint
// - N+1 query detection
\`\`\`

### Error Tracking & Grouping

\`\`\`java
// Structured error tracking
@ControllerAdvice
public class GlobalExceptionHandler {
    private final MeterRegistry meterRegistry;
    private final Tracer tracer;

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex, HttpServletRequest req) {
        // Increment error counter with dimensions
        meterRegistry.counter("app.errors",
            "type", ex.getClass().getSimpleName(),
            "endpoint", req.getRequestURI(),
            "method", req.getMethod()
        ).increment();

        // Add error to current trace
        Span currentSpan = tracer.currentSpan();
        if (currentSpan != null) {
            currentSpan.tag("error", "true");
            currentSpan.tag("error.type", ex.getClass().getName());
            currentSpan.tag("error.message", ex.getMessage());
        }

        log.error("Unhandled exception on {} {}",
            req.getMethod(), req.getRequestURI(), ex);

        return ResponseEntity.status(500)
            .body(new ErrorResponse("Internal Server Error", traceId));
    }
}
\`\`\`

### Service Dependency Map

\`\`\`mermaid
graph LR
    GW[API Gateway] --> US[User Service]
    GW --> OS[Order Service]
    OS --> PS[Payment Service]
    OS --> IS[Inventory Service]
    OS --> NS[Notification Service]
    US --> DB1[(User DB)]
    OS --> DB2[(Order DB)]
    IS --> DB3[(Inventory DB)]
    OS --> K[Kafka]
    NS --> K
    style GW fill:#3b82f6,stroke:#2563eb,color:#fff
    style K fill:#e11d48,stroke:#be123c,color:#fff
\`\`\`

### APM Tools Comparison

| Feature | Datadog | New Relic | Elastic APM | Jaeger |
|---------|---------|-----------|-------------|--------|
| Pricing | Per host | Per GB | Self-hosted free | Free/OSS |
| Auto-instrumentation | Excellent | Excellent | Good | Manual |
| Distributed tracing | Yes | Yes | Yes | Yes |
| Log correlation | Yes | Yes | Yes | No |
| Anomaly detection | AI-powered | AI-powered | Basic | No |
| Custom dashboards | Excellent | Good | Good | Basic |
| Kubernetes | Native | Native | Good | Good |

### Performance Baselines

\`\`\`text
Establish baselines for key metrics:

1. Response Time:
   - p50 < 100ms (normal)
   - p95 < 500ms (acceptable)
   - p99 < 1000ms (edge case)

2. Error Rate:
   - < 0.1% (healthy)
   - 0.1% - 1% (degraded)
   - > 1% (critical)

3. Throughput:
   - Track RPS per endpoint
   - Compare with historical patterns
   - Alert on sudden drops (may indicate upstream issues)

4. Saturation:
   - CPU utilization < 70%
   - Memory utilization < 80%
   - Thread pool utilization < 75%
   - Connection pool utilization < 80%
\`\`\`

> ⚠️ Luu y: APM agent overhead thuong 1-5% CPU va memory. Luon test performance impact truoc khi deploy production. Dung sampling de giam overhead cho high-traffic services.
    `
  },
  {
    id: 13,
    title: 'Infrastructure Monitoring',
    desc: 'Node Exporter, Blackbox Exporter, cloud monitoring, capacity planning',
    content: `
## Infrastructure Monitoring

Infrastructure monitoring theo doi hardware va OS-level metrics, dam bao he thong co du resources va healthy.

### System Metrics Categories

| Category | Metrics | Tools |
|----------|---------|-------|
| CPU | Utilization, load average, context switches | Node Exporter |
| Memory | Used, available, swap, page faults | Node Exporter |
| Disk | IOPS, throughput, latency, space | Node Exporter |
| Network | Bandwidth, packets, errors, connections | Node Exporter |
| Process | Count, states, file descriptors | Node Exporter |

### Node Exporter Key Metrics

\`\`\`text
# CPU utilization (%)
100 - (avg by(instance)(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory utilization (%)
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# Disk space utilization (%)
(1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100

# Disk I/O utilization
rate(node_disk_io_time_seconds_total[5m])

# Network throughput (bytes/sec)
rate(node_network_receive_bytes_total{device="eth0"}[5m])
rate(node_network_transmit_bytes_total{device="eth0"}[5m])

# Open file descriptors
node_filefd_allocated / node_filefd_maximum

# System load (1min average / number of CPUs)
node_load1 / count without(cpu)(node_cpu_seconds_total{mode="idle"})
\`\`\`

### Blackbox Exporter

\`\`\`yaml
# blackbox.yml - Probe configurations
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: [200]
      method: GET
      follow_redirects: true
      tls_config:
        insecure_skip_verify: false

  http_post_2xx:
    prober: http
    http:
      method: POST
      headers:
        Content-Type: application/json
      body: '{"test": true}'

  tcp_connect:
    prober: tcp
    timeout: 5s

  icmp:
    prober: icmp
    timeout: 5s
    icmp:
      preferred_ip_protocol: ip4

  dns_lookup:
    prober: dns
    dns:
      query_name: "example.com"
      query_type: "A"
\`\`\`

\`\`\`yaml
# Prometheus config for blackbox exporter
scrape_configs:
  - job_name: 'blackbox-http'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - https://api.myapp.com/health
          - https://www.myapp.com
          - https://admin.myapp.com/login
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
\`\`\`

### Key Blackbox Metrics

\`\`\`text
# HTTP probe success (1 = up, 0 = down)
probe_success{instance="https://api.myapp.com/health"}

# HTTP response time
probe_http_duration_seconds{phase="resolve"}   # DNS
probe_http_duration_seconds{phase="connect"}   # TCP
probe_http_duration_seconds{phase="tls"}       # TLS handshake
probe_http_duration_seconds{phase="transfer"}  # Data transfer

# SSL certificate expiry (days)
(probe_ssl_earliest_cert_expiry - time()) / 86400

# Alert: SSL cert expiring in 30 days
probe_ssl_earliest_cert_expiry - time() < 86400 * 30
\`\`\`

### Cloud Monitoring Integration

\`\`\`text
AWS CloudWatch -> Prometheus:
- Use cloudwatch-exporter or YACE exporter
- Key metrics: EC2 CPU, RDS connections, ALB latency, SQS queue depth

GCP Cloud Monitoring -> Prometheus:
- Use stackdriver-exporter
- Key metrics: GCE CPU, Cloud SQL, GKE node metrics

Azure Monitor -> Prometheus:
- Use azure-metrics-exporter
- Key metrics: VM CPU, Cosmos DB RU, AKS metrics
\`\`\`

### Capacity Planning

\`\`\`text
Capacity Planning Process:
1. Collect historical data (3-6 months minimum)
2. Identify trends: predict(metric, 30d) in Grafana
3. Set thresholds:
   - CPU: Plan upgrade at 70% sustained
   - Memory: Plan upgrade at 80% sustained
   - Disk: Plan expansion at 75%
   - Network: Plan upgrade at 60% sustained

PromQL for capacity forecasting:
# Disk full prediction (days until 100%)
(node_filesystem_avail_bytes / (rate(node_filesystem_avail_bytes[7d]) * -1)) / 86400

# Linear prediction 30 days ahead
predict_linear(node_filesystem_avail_bytes[30d], 30*86400)
\`\`\`

> ⚠️ Luu y: Blackbox monitoring la line-of-defense cuoi cung - no cho biet user experience thuc te. Luon co blackbox probes cho tat ca critical endpoints, ke ca khi da co internal monitoring.
    `
  },
  {
    id: 14,
    title: 'SRE Practices & Incident Management',
    desc: 'SLI/SLO implementation, error budgets, burn rate alerts, incident response',
    content: `
## SRE Practices & Incident Management

Site Reliability Engineering (SRE) ket hop software engineering va operations de xay dung reliable systems. SLI/SLO/Error Budget la core concepts.

### SLI/SLO/SLA Hierarchy

\`\`\`mermaid
graph TD
    SLA[SLA - Service Level Agreement<br/>Contract with customers<br/>99.9% uptime, penalties] --> SLO
    SLO[SLO - Service Level Objective<br/>Internal target<br/>99.95% availability] --> SLI
    SLI[SLI - Service Level Indicator<br/>Actual measurement<br/>ratio of successful requests]
    style SLA fill:#ef4444,stroke:#dc2626,color:#fff
    style SLO fill:#f59e0b,stroke:#d97706,color:#fff
    style SLI fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### Defining SLIs

\`\`\`text
Common SLI types:

1. Availability SLI:
   successful_requests / total_requests
   Example: 99.95% of requests return non-5xx

2. Latency SLI:
   requests_below_threshold / total_requests
   Example: 99% of requests complete < 200ms

3. Throughput SLI:
   actual_throughput / expected_throughput
   Example: System handles > 10,000 RPS

4. Correctness SLI:
   correct_responses / total_responses
   Example: 99.99% of calculations are correct
\`\`\`

### Implementing SLOs with Prometheus

\`\`\`text
# Availability SLO: 99.9% of requests succeed (non-5xx)
# SLI calculation:
sum(rate(http_server_requests_seconds_count{status!~"5.."}[30d]))
/
sum(rate(http_server_requests_seconds_count[30d]))

# Error budget: 0.1% = 43.2 minutes per 30 days
# Error budget remaining:
1 - (
  sum(rate(http_server_requests_seconds_count{status=~"5.."}[30d]))
  /
  sum(rate(http_server_requests_seconds_count[30d]))
) / 0.001

# Latency SLO: 99% of requests < 200ms
sum(rate(http_server_requests_seconds_bucket{le="0.2"}[30d]))
/
sum(rate(http_server_requests_seconds_count[30d]))
\`\`\`

### Error Budget

\`\`\`text
SLO: 99.9% availability per 30-day window

Error budget = 1 - SLO = 0.1%

In 30 days (43,200 minutes):
Error budget = 43,200 * 0.001 = 43.2 minutes of downtime

If current month:
- 20 minutes downtime used -> 23.2 minutes remaining (53% budget left)
- 40 minutes downtime used -> 3.2 minutes remaining (7% budget left)
- 45 minutes downtime used -> BUDGET EXHAUSTED! Feature freeze!

Error budget policies:
- > 50% remaining: Ship features freely
- 25-50% remaining: Extra review, careful deployments
- < 25% remaining: Focus on reliability improvements
- 0% remaining: Feature freeze, only reliability work
\`\`\`

### Burn Rate Alerts

\`\`\`text
# Burn rate = how fast error budget is being consumed
# Burn rate 1 = consuming budget exactly at pace (will exhaust in 30d)
# Burn rate 10 = will exhaust budget in 3 days
# Burn rate 720 = will exhaust budget in 1 hour

# Multi-window burn rate alerts (Google SRE recommendation)

# Page alert: 2% budget consumed in 1 hour (burn rate 14.4)
- alert: ErrorBudgetBurnHigh
  expr: |
    (
      sum(rate(http_requests_total{status=~"5.."}[1h]))
      / sum(rate(http_requests_total[1h]))
    ) > (14.4 * 0.001)
    AND
    (
      sum(rate(http_requests_total{status=~"5.."}[5m]))
      / sum(rate(http_requests_total[5m]))
    ) > (14.4 * 0.001)
  for: 2m
  labels:
    severity: page

# Ticket alert: 5% budget consumed in 6 hours (burn rate 6)
- alert: ErrorBudgetBurnMedium
  expr: |
    (
      sum(rate(http_requests_total{status=~"5.."}[6h]))
      / sum(rate(http_requests_total[6h]))
    ) > (6 * 0.001)
    AND
    (
      sum(rate(http_requests_total{status=~"5.."}[30m]))
      / sum(rate(http_requests_total[30m]))
    ) > (6 * 0.001)
  for: 5m
  labels:
    severity: ticket
\`\`\`

### Incident Response Process

\`\`\`mermaid
graph TD
    D[Detect<br/>Alert fires] --> T[Triage<br/>Severity assessment]
    T --> M[Mitigate<br/>Stop the bleeding]
    M --> RCA[Root Cause<br/>Find the cause]
    RCA --> R[Resolve<br/>Fix permanently]
    R --> PM[Post-Mortem<br/>Learn & improve]
    PM --> A[Action Items<br/>Prevent recurrence]
    style D fill:#ef4444,stroke:#dc2626,color:#fff
    style T fill:#f59e0b,stroke:#d97706,color:#fff
    style M fill:#3b82f6,stroke:#2563eb,color:#fff
    style RCA fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style R fill:#22c55e,stroke:#16a34a,color:#fff
    style PM fill:#06b6d4,stroke:#0891b2,color:#fff
\`\`\`

### Incident Severity Levels

| Severity | Impact | Response Time | Example |
|----------|--------|---------------|---------|
| SEV1 - Critical | Full outage, data loss | < 15 min | Site completely down |
| SEV2 - High | Major feature broken | < 30 min | Payments failing |
| SEV3 - Medium | Minor feature broken | < 4 hours | Search degraded |
| SEV4 - Low | Minimal impact | Next business day | UI glitch |

### Post-Mortem Template

\`\`\`text
Post-Mortem: [Incident Title]
Date: YYYY-MM-DD
Duration: X hours Y minutes
Impact: [Number of users/requests affected]
Severity: SEV-N

Timeline:
- HH:MM - Alert fired
- HH:MM - On-call acknowledged
- HH:MM - Root cause identified
- HH:MM - Mitigation applied
- HH:MM - Full resolution

Root Cause: [Technical explanation]

Contributing Factors:
1. [Factor 1]
2. [Factor 2]

What Went Well:
- [Item]

What Went Wrong:
- [Item]

Action Items:
- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]

Lessons Learned:
- [Lesson]
\`\`\`

> ⚠️ Luu y: Post-mortem phai la BLAMELESS - khong blame ca nhan. Focus vao system va process failures. Muc tieu la hoc hoi va prevent, khong phai trung phat.
    `
  },
  {
    id: 15,
    title: 'Production-Grade Monitoring Stack',
    desc: 'Thanos/Cortex HA, long-term storage, multi-cluster monitoring, security',
    content: `
## Production-Grade Monitoring Stack

Trong production, monitoring system can high availability, long-term storage, va multi-cluster support. Thanos va Cortex/Mimir la standard cho Prometheus at scale.

### Thanos Architecture

\`\`\`mermaid
graph TD
    subgraph "Cluster 1"
        P1[Prometheus 1] --> TS1[Thanos Sidecar]
    end
    subgraph "Cluster 2"
        P2[Prometheus 2] --> TS2[Thanos Sidecar]
    end
    TS1 --> TQ[Thanos Query]
    TS2 --> TQ
    TS1 --> OS[Object Storage<br/>S3/GCS/MinIO]
    TS2 --> OS
    OS --> TST[Thanos Store Gateway]
    TST --> TQ
    TQ --> G[Grafana]
    TC[Thanos Compactor] --> OS
    style TQ fill:#3b82f6,stroke:#2563eb,color:#fff
    style OS fill:#22c55e,stroke:#16a34a,color:#fff
    style G fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

### Thanos Components

| Component | Role | Description |
|-----------|------|-------------|
| Sidecar | Data shipping | Runs alongside Prometheus, uploads blocks to object storage |
| Query | Querying | Global query view across all Prometheus + Store Gateways |
| Store Gateway | Historical data | Serves metrics from object storage |
| Compactor | Maintenance | Compacts and downsamples old data |
| Ruler | Alerting | Evaluates recording/alerting rules globally |
| Query Frontend | Caching | Query caching and splitting for performance |

### Thanos Sidecar Configuration

\`\`\`yaml
# Prometheus with Thanos Sidecar (Kubernetes)
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: prometheus
spec:
  template:
    spec:
      containers:
        - name: prometheus
          image: prom/prometheus:v2.50.0
          args:
            - --storage.tsdb.min-block-duration=2h
            - --storage.tsdb.max-block-duration=2h
            - --storage.tsdb.retention.time=6h
          volumeMounts:
            - name: data
              mountPath: /prometheus

        - name: thanos-sidecar
          image: thanosio/thanos:v0.34.0
          args:
            - sidecar
            - --tsdb.path=/prometheus
            - --prometheus.url=http://localhost:9090
            - --objstore.config-file=/etc/thanos/bucket.yml
            - --grpc-address=0.0.0.0:10901
          volumeMounts:
            - name: data
              mountPath: /prometheus
            - name: bucket-config
              mountPath: /etc/thanos
\`\`\`

### Object Storage Configuration

\`\`\`yaml
# bucket.yml - S3 configuration
type: S3
config:
  bucket: thanos-metrics
  endpoint: s3.amazonaws.com
  region: ap-southeast-1
  access_key: ${AWS_ACCESS_KEY_ID}
  secret_key: ${AWS_SECRET_ACCESS_KEY}
  sse_config:
    type: SSE-S3

---
# bucket.yml - MinIO (self-hosted)
type: S3
config:
  bucket: thanos-metrics
  endpoint: minio:9000
  access_key: minio
  secret_key: minio123
  insecure: true
\`\`\`

### Multi-Cluster Global View

\`\`\`yaml
# Thanos Query - aggregate all clusters
apiVersion: apps/v1
kind: Deployment
metadata:
  name: thanos-query
spec:
  template:
    spec:
      containers:
        - name: thanos-query
          image: thanosio/thanos:v0.34.0
          args:
            - query
            - --grpc-address=0.0.0.0:10901
            - --http-address=0.0.0.0:9090
            - --store=prometheus-cluster1-sidecar:10901
            - --store=prometheus-cluster2-sidecar:10901
            - --store=thanos-store-gateway:10901
            - --query.auto-downsampling
            - --query.partial-response
\`\`\`

### Data Retention & Downsampling

\`\`\`text
Thanos Compactor handles:

1. Compaction: Merge small blocks into larger ones
2. Downsampling:
   - Raw data: 0-2 weeks (full resolution)
   - 5-minute resolution: 2 weeks - 3 months
   - 1-hour resolution: 3 months - 1 year+

Storage savings:
- 1 year raw data: ~500GB
- With downsampling: ~50GB (90% reduction!)

Compactor flags:
  --retention.resolution-raw=14d
  --retention.resolution-5m=90d
  --retention.resolution-1h=365d
  --compact.concurrency=4
  --downsample.concurrency=4
\`\`\`

### Monitoring Security

\`\`\`text
Security checklist:
1. TLS everywhere: Prometheus <-> Thanos, Grafana <-> Prometheus
2. Authentication: OAuth2 proxy for Grafana, basic auth for Prometheus
3. Authorization: Grafana RBAC, Thanos multi-tenancy
4. Network policies: Restrict access to monitoring endpoints
5. Secrets management: Use Kubernetes secrets for credentials
6. Audit logging: Track who accesses dashboards and alerts
\`\`\`

\`\`\`yaml
# Network Policy: Only allow Prometheus to scrape
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-prometheus-scrape
spec:
  podSelector:
    matchLabels:
      app: my-app
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: prometheus
      ports:
        - protocol: TCP
          port: 8080
\`\`\`

### Cost Optimization

\`\`\`text
Strategies to reduce monitoring costs:

1. Cardinality management:
   - Drop unused labels: metric_relabel_configs
   - Limit label values (no user IDs as labels!)
   - Monitor: prometheus_tsdb_symbol_table_size_bytes

2. Storage optimization:
   - Use object storage (cheap) for long-term
   - Downsample aggressively for old data
   - Set retention policies per metric importance

3. Scrape optimization:
   - Increase scrape interval for non-critical metrics (30s-60s)
   - Use recording rules to pre-aggregate
   - Drop high-cardinality metrics at collection

4. Query optimization:
   - Use recording rules for dashboard queries
   - Enable query caching (Thanos Query Frontend)
   - Limit query time ranges in Grafana
\`\`\`

### Production Monitoring Checklist

| Category | Item | Priority |
|----------|------|----------|
| **HA** | Prometheus HA pair (2 replicas) | Required |
| **HA** | Alertmanager cluster (3 nodes) | Required |
| **HA** | Grafana with shared database | Required |
| **Storage** | Object storage for long-term | Required |
| **Storage** | Retention policies configured | Required |
| **Security** | TLS for all connections | Required |
| **Security** | Authentication for dashboards | Required |
| **Alerting** | Multi-window burn rate alerts | Recommended |
| **Alerting** | Dead man's switch (watchdog) | Required |
| **Scaling** | Thanos/Cortex for multi-cluster | Recommended |
| **Cost** | Cardinality monitoring | Required |
| **Cost** | Downsampling configured | Recommended |
| **Backup** | Grafana dashboards in Git | Required |
| **Backup** | Alert rules in Git (GitOps) | Required |

> ⚠️ Luu y: Monitoring system cung can duoc monitor! Dung "Dead man's switch" (Watchdog alert) - mot alert luon firing. Neu no ngung firing, nghia la monitoring system bi loi. Integrate voi external service nhu Healthchecks.io.
    `
  }
];
