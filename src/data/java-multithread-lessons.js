export const javaMultithreadLessons = [
  {
    id: 1,
    title: "Thread Fundamentals",
    desc: "Process vs Thread, tao thread, JVM Thread Model - nen tang cua moi thu",
    content: `
## Process vs Thread

\`\`\`mermaid
graph TD
    subgraph "Process A (JVM Instance)"
        H1[Heap - Shared Memory]
        MS1[Method Area / Metaspace]
        T1["Thread 1<br/>Stack | PC | Native Stack"]
        T2["Thread 2<br/>Stack | PC | Native Stack"]
        T3["Thread 3<br/>Stack | PC | Native Stack"]
        H1 --- T1
        H1 --- T2
        H1 --- T3
    end

    subgraph "Process B (Another JVM)"
        H2[Heap]
        T4["Thread 1<br/>Stack | PC"]
    end
\`\`\`

| | Process | Thread |
|---|---|---|
| **Memory** | Co khong gian rieng | CHIA SE heap voi cac threads khac |
| **Tao moi** | Nang (fork process) | Nhe (chi can stack + PC) |
| **Communication** | IPC (cham, phuc tap) | Shared memory (nhanh, nguy hiem) |
| **Crash** | Khong anh huong process khac | Co the crash CA process |
| **Cost** | ~10MB+ | ~1MB stack (default) |

## JVM Thread Model (1:1 Mapping)

\`\`\`mermaid
graph TD
    subgraph "JVM (User Space)"
        JT1[Java Thread 1]
        JT2[Java Thread 2]
        JT3[Java Thread 3]
    end

    subgraph "OS (Kernel Space)"
        OT1[OS Thread 1]
        OT2[OS Thread 2]
        OT3[OS Thread 3]
    end

    JT1 -->|"1:1 mapping"| OT1
    JT2 -->|"1:1 mapping"| OT2
    JT3 -->|"1:1 mapping"| OT3

    subgraph "CPU Cores"
        C1[Core 1]
        C2[Core 2]
    end

    OT1 -->|"Scheduled by OS"| C1
    OT2 -->|"Scheduled by OS"| C2
    OT3 -->|"Waiting..."| C1
\`\`\`

**Truoc Java 21**: Moi Java Thread = 1 OS Thread (Platform Thread)
**Tu Java 21**: Co them Virtual Threads (M:N mapping) - Bai 14

## JVM Memory cho moi Thread

\`\`\`
Moi Thread co RIENG:
┌─────────────────────────────────┐
│ Program Counter (PC)            │ ← Dong code dang chay
│ JVM Stack                       │ ← Stack frames (method calls)
│   ├── Frame 1: main()           │
│   ├── Frame 2: processOrder()   │
│   └── Frame 3: validateInput()  │
│ Native Method Stack             │ ← Cho native (C/C++) methods
└─────────────────────────────────┘

Tat ca Threads CHIA SE:
┌─────────────────────────────────┐
│ Heap (Objects, Arrays)          │ ← Day la noi xay ra "van de"
│ Method Area / Metaspace         │ ← Class metadata, static fields
│ String Pool                     │
└─────────────────────────────────┘
\`\`\`

## Tao Thread - 3 cach

### Cach 1: Extend Thread class

\`\`\`java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Running in: " + Thread.currentThread().getName());
    }
}

MyThread t = new MyThread();
t.start();  // PHAI goi start(), KHONG goi run() truc tiep!
\`\`\`

### Cach 2: Implement Runnable (Recommend)

\`\`\`java
class MyTask implements Runnable {
    @Override
    public void run() {
        System.out.println("Task running in: " + Thread.currentThread().getName());
    }
}

Thread t = new Thread(new MyTask(), "worker-1");
t.start();

// Hoac voi Lambda (Java 8+)
Thread t2 = new Thread(() -> {
    System.out.println("Lambda task in: " + Thread.currentThread().getName());
});
t2.start();
\`\`\`

### Cach 3: Implement Callable (tra ve ket qua)

\`\`\`java
Callable<Integer> task = () -> {
    Thread.sleep(1000);
    return 42;
};

ExecutorService executor = Executors.newSingleThreadExecutor();
Future<Integer> future = executor.submit(task);

Integer result = future.get(); // Block cho den khi co ket qua
System.out.println("Result: " + result); // 42
executor.shutdown();
\`\`\`

## start() vs run() - Sai lam kinh dien

\`\`\`java
Thread t = new Thread(() -> {
    System.out.println("Thread: " + Thread.currentThread().getName());
});

t.run();   // ❌ Chay trong MAIN thread! Khong tao thread moi!
t.start(); // ✅ Tao OS thread moi, goi run() trong thread do

// start() internal:
// 1. JVM allocate stack cho thread moi
// 2. Goi native method de tao OS thread
// 3. OS thread bat dau chay run()
\`\`\`

## Daemon vs User Threads

\`\`\`java
Thread daemon = new Thread(() -> {
    while (true) {
        // Background work (GC, monitoring...)
    }
});
daemon.setDaemon(true); // PHAI set TRUOC start()
daemon.start();

// JVM thoat khi TAT CA user threads ket thuc
// Daemon threads bi kill tu dong khi khong con user thread nao
\`\`\`

| | User Thread | Daemon Thread |
|---|---|---|
| **JVM doi?** | Co - JVM khong exit cho den khi tat ca user threads xong | Khong - bi kill tu dong |
| **Vi du** | main thread, worker threads | GC thread, finalizer thread |
| **Default** | User thread | Phai set \`setDaemon(true)\` |

> ⚠️ KHONG BAO GIO goi \`run()\` truc tiep. Luon dung \`start()\` de tao thread moi thuc su.
    `
  },
  {
    id: 2,
    title: "Thread Lifecycle & States",
    desc: "6 trang thai cua thread, chuyen doi trang thai, thread scheduling",
    content: `
## 6 Thread States trong Java

\`\`\`mermaid
stateDiagram-v2
    [*] --> NEW: new Thread()
    NEW --> RUNNABLE: start()
    RUNNABLE --> BLOCKED: doi monitor lock
    RUNNABLE --> WAITING: wait() / join() / park()
    RUNNABLE --> TIMED_WAITING: sleep() / wait(timeout)
    BLOCKED --> RUNNABLE: co duoc lock
    WAITING --> RUNNABLE: notify() / unpark()
    TIMED_WAITING --> RUNNABLE: het timeout / notify()
    RUNNABLE --> TERMINATED: run() ket thuc
    TERMINATED --> [*]
\`\`\`

## Chi tiet tung State

| State | Mo ta | Cach vao | Cach ra |
|-------|-------|----------|---------|
| **NEW** | Thread vua tao, chua start | \`new Thread()\` | \`start()\` |
| **RUNNABLE** | San sang chay (co the dang chay hoac doi CPU) | \`start()\`, duoc notify, het timeout | Bi block, wait, sleep, run xong |
| **BLOCKED** | Doi lay monitor lock | Thread khac dang giu lock | Thread khac release lock |
| **WAITING** | Doi vo thoi han | \`wait()\`, \`join()\`, \`LockSupport.park()\` | \`notify()\`, thread join xong, \`unpark()\` |
| **TIMED_WAITING** | Doi co thoi han | \`sleep(ms)\`, \`wait(ms)\`, \`join(ms)\` | Het timeout hoac duoc notify |
| **TERMINATED** | Da ket thuc | \`run()\` return hoac exception | Khong quay lai duoc |

## RUNNABLE = Ready + Running

\`\`\`mermaid
graph LR
    subgraph "RUNNABLE State (Java)"
        R[Ready - doi CPU] -->|"OS Scheduler"| RU[Running - dang chay]
        RU -->|"Time slice het"| R
    end
\`\`\`

**Quan trong**: Java KHONG phan biet Ready vs Running. Ca 2 deu la RUNNABLE.
OS scheduler quyet dinh thread nao duoc CPU, khong phai JVM.

## Thread Scheduling (OS Level)

\`\`\`
OS su dung PREEMPTIVE scheduling:

Time Slice (quantum) ~10-20ms:
┌────────┬────────┬────────┬────────┬────────┐
│Thread 1│Thread 2│Thread 1│Thread 3│Thread 2│ ← CPU time
└────────┴────────┴────────┴────────┴────────┘
    10ms     10ms     10ms     10ms     10ms

Thread co the bi "preempted" bat ky luc nao!
→ Day la nguyen nhan cua hau het concurrency bugs
\`\`\`

## Code: Quan sat Thread States

\`\`\`java
Thread t = new Thread(() -> {
    try {
        Thread.sleep(2000); // TIMED_WAITING
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});

System.out.println(t.getState()); // NEW
t.start();
System.out.println(t.getState()); // RUNNABLE

Thread.sleep(100);
System.out.println(t.getState()); // TIMED_WAITING

t.join(); // Doi t ket thuc
System.out.println(t.getState()); // TERMINATED
\`\`\`

## BLOCKED vs WAITING

\`\`\`mermaid
graph TD
    subgraph "BLOCKED"
        B1[Thread A] -->|"doi lock"| LOCK["synchronized block<br/>(Thread B dang giu lock)"]
        B1 -.->|"KHONG THE bi interrupt"| B1
    end

    subgraph "WAITING"
        W1[Thread C] -->|"goi wait()"| MON["Object monitor<br/>(doi notify)"]
        W1 -.->|"CO THE bi interrupt"| W1
    end
\`\`\`

| | BLOCKED | WAITING |
|---|---|---|
| **Nguyen nhan** | Doi lay intrinsic lock | Chu dong doi (wait/join/park) |
| **Interruptible?** | Khong | Co |
| **Ra bang cach** | Thread khac release lock | notify/unpark/interrupt |
| **Vi du** | Doi vao synchronized block | Goi object.wait() |

## Thread Priority

\`\`\`java
thread.setPriority(Thread.MIN_PRIORITY);  // 1
thread.setPriority(Thread.NORM_PRIORITY); // 5 (default)
thread.setPriority(Thread.MAX_PRIORITY);  // 10

// CHU Y: Priority chi la GOI Y cho OS scheduler
// OS co the HOAN TOAN BO QUA!
// KHONG dung priority de kiem soat logic!
\`\`\`

## join() - Doi thread khac ket thuc

\`\`\`java
Thread worker = new Thread(() -> {
    // Lam viec nang...
    heavyComputation();
});
worker.start();

// Main thread DOI worker xong moi tiep tuc
worker.join();         // Block vo han
worker.join(5000);     // Block toi da 5 giay

// Sau join(), dam bao worker da TERMINATED
\`\`\`

## interrupt() - Yeu cau thread dung lai

\`\`\`java
Thread t = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            Thread.sleep(1000);
            doWork();
        } catch (InterruptedException e) {
            // sleep() nem InterruptedException khi bi interrupt
            Thread.currentThread().interrupt(); // Restore flag!
            break; // Thoat loop
        }
    }
    System.out.println("Thread dung lai an toan");
});

t.start();
Thread.sleep(3000);
t.interrupt(); // Gui tin hieu interrupt
\`\`\`

> ⚠️ \`interrupt()\` KHONG force-kill thread! No chi set flag va nem InterruptedException tu blocking methods. Thread PHAI tu check va dung lai.
    `
  },
  {
    id: 3,
    title: "synchronized & Monitor",
    desc: "Intrinsic Lock, Object Monitor, synchronized method/block - JVM internals",
    content: `
## Van de: Race Condition

\`\`\`java
// 2 threads cung tang counter
private int counter = 0;

// Thread 1 & Thread 2 goi tang():
void tang() {
    counter++; // KHONG PHAI atomic!
}

// counter++ thuc ra la 3 buoc:
// 1. READ:  temp = counter     (doc tu memory)
// 2. MODIFY: temp = temp + 1   (tinh toan)
// 3. WRITE: counter = temp     (ghi lai memory)
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant T1 as Thread 1
    participant MEM as Memory (counter=0)
    participant T2 as Thread 2

    T1->>MEM: READ counter = 0
    T2->>MEM: READ counter = 0
    T1->>T1: MODIFY: 0 + 1 = 1
    T2->>T2: MODIFY: 0 + 1 = 1
    T1->>MEM: WRITE counter = 1
    T2->>MEM: WRITE counter = 1
    Note over MEM: counter = 1 (dung ra phai la 2!)
\`\`\`

## Object Monitor (JVM Internal)

Moi object trong Java co 1 **Monitor** (con goi la Intrinsic Lock).

\`\`\`mermaid
graph TD
    subgraph "Object Monitor"
        OL["Owner (Thread dang giu lock)"]
        EQ["Entry Set<br/>(Threads doi lay lock - BLOCKED)"]
        WS["Wait Set<br/>(Threads doi notify - WAITING)"]
    end

    T1[Thread 1] -->|"synchronized - co lock"| OL
    T2[Thread 2] -->|"synchronized - doi lock"| EQ
    T3[Thread 3] -->|"synchronized - doi lock"| EQ
    T4[Thread 4] -->|"goi wait() - nha lock"| WS

    OL -->|"notify()"| WS
    WS -->|"duoc notify - vao lai"| EQ
    OL -->|"exit synchronized"| EQ
\`\`\`

## Object Header & Mark Word

\`\`\`
Moi Java object trong Heap co:

┌──────────────────────────────────────────────┐
│              Object Header                    │
├──────────────────────────────────────────────┤
│  Mark Word (8 bytes on 64-bit)               │
│  ┌─────────────────────────────────────────┐ │
│  │ hashcode │ age │ bias │ lock state (2b) │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  Lock States:                                │
│  00 = Lightweight Lock (CAS, khong OS call)  │
│  01 = Unlocked hoac Biased                   │
│  10 = Heavyweight Lock (OS mutex)            │
│  11 = GC mark                                │
├──────────────────────────────────────────────┤
│  Class Pointer (4-8 bytes)                   │
├──────────────────────────────────────────────┤
│  Instance Data (fields)                      │
├──────────────────────────────────────────────┤
│  Padding (alignment to 8 bytes)              │
└──────────────────────────────────────────────┘
\`\`\`

## Lock Escalation (JVM Optimization)

\`\`\`mermaid
graph LR
    A["No Lock<br/>(01)"] -->|"1 thread truy cap"| B["Biased Lock<br/>(01 + thread ID)"]
    B -->|"Thread khac canh tranh"| C["Lightweight Lock<br/>(00, CAS spin)"]
    C -->|"Spin qua nhieu lan"| D["Heavyweight Lock<br/>(10, OS mutex)"]

    style A fill:#22c55e,color:#fff
    style B fill:#3b82f6,color:#fff
    style C fill:#f59e0b,color:#000
    style D fill:#ef4444,color:#fff
\`\`\`

| Lock Type | Mechanism | Performance | Khi nao |
|-----------|-----------|-------------|---------|
| **Biased** | Luu thread ID trong mark word | Nhanh nhat - khong CAS | Chi 1 thread dung |
| **Lightweight** | CAS spin trên stack | Nhanh - no OS call | It threads, giu lock ngan |
| **Heavyweight** | OS mutex (futex on Linux) | Cham - context switch | Nhieu threads, giu lock lau |

## synchronized Method

\`\`\`java
public class Counter {
    private int count = 0;

    // Lock tren THIS object
    public synchronized void increment() {
        count++; // Chi 1 thread vao duoc tai 1 thoi diem
    }

    // Tuong duong voi:
    public void incrementV2() {
        synchronized (this) {
            count++;
        }
    }

    // Static synchronized = lock tren CLASS object
    private static int globalCount = 0;
    public static synchronized void globalIncrement() {
        globalCount++; // Lock tren Counter.class
    }
}
\`\`\`

## synchronized Block (Recommend)

\`\`\`java
public class BankAccount {
    private final Object balanceLock = new Object(); // Lock object rieng
    private final Object txLock = new Object();
    private double balance;
    private List<String> transactions;

    public void deposit(double amount) {
        synchronized (balanceLock) {  // Chi lock phan can thiet
            balance += amount;
        }
        // Code o day KHONG bi lock → throughput cao hon
    }

    public void addTransaction(String tx) {
        synchronized (txLock) { // Lock rieng, khong block deposit
            transactions.add(tx);
        }
    }
}
\`\`\`

## Reentrant (Vao lai duoc)

\`\`\`java
public class Reentrant {
    public synchronized void methodA() {
        System.out.println("A");
        methodB(); // Goi method synchronized khac - VAN DUOC!
    }

    public synchronized void methodB() {
        System.out.println("B");
        // Cung thread da giu lock cua this → vao lai duoc
        // JVM dem so lan vao (reentrant count)
    }
}
// Neu khong reentrant → DEADLOCK khi goi methodA → methodB!
\`\`\`

## synchronized Guarantees

- **Mutual Exclusion**: Chi 1 thread trong critical section
- **Visibility**: Thay doi duoc flush tu cache → main memory khi exit
- **Ordering**: Compiler/CPU khong reorder qua synchronized boundary

> ⚠️ synchronized tren method = lock TOAN BO method. Dung synchronized block de lock chi phan nho nhat can thiet → tang performance.
    `
  },
  {
    id: 4,
    title: "Inter-thread Communication",
    desc: "wait(), notify(), notifyAll() - Producer-Consumer pattern",
    content: `
## Tai sao can Communication?

**Van de**: Thread A can doi Thread B hoan thanh mot viec gi do.

\`\`\`java
// ❌ Busy waiting - lang phi CPU!
while (!dataReady) {
    // Quay vong lien tuc, 100% CPU
}

// ✅ wait/notify - CPU nghi khi doi
synchronized (lock) {
    while (!dataReady) {
        lock.wait(); // Nha lock, ngu, doi notify
    }
}
\`\`\`

## wait() / notify() Internal

\`\`\`mermaid
sequenceDiagram
    participant C as Consumer Thread
    participant M as Monitor (Object)
    participant P as Producer Thread

    Note over C: Co lock cua monitor
    C->>M: wait() - nha lock, vao Wait Set
    Note over C: WAITING (khong chiem CPU)
    Note over P: Co lock cua monitor
    P->>P: San xuat data
    P->>M: notify() - chuyen 1 thread tu Wait Set → Entry Set
    P->>M: Exit synchronized - nha lock
    M->>C: Thread duoc chon tu Entry Set
    Note over C: Co lai lock, tiep tuc sau wait()
\`\`\`

## Monitor Architecture chi tiet

\`\`\`mermaid
graph TD
    subgraph "Object Monitor"
        direction TB
        OWNER["OWNER<br/>(Thread dang giu lock)"]
        ENTRY["ENTRY SET<br/>(BLOCKED threads doi lock)"]
        WAIT["WAIT SET<br/>(WAITING threads doi notify)"]
    end

    T_NEW[Thread moi] -->|"synchronized"| ENTRY
    ENTRY -->|"Co duoc lock"| OWNER
    OWNER -->|"wait()"| WAIT
    WAIT -->|"notify()"| ENTRY
    OWNER -->|"exit synchronized"| EXIT[Release lock]
    EXIT -->|"Thread tiep theo"| ENTRY
\`\`\`

## Producer-Consumer Pattern

\`\`\`java
public class MessageQueue<T> {
    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;
    private final Object lock = new Object();

    public MessageQueue(int capacity) {
        this.capacity = capacity;
    }

    // PRODUCER
    public void put(T item) throws InterruptedException {
        synchronized (lock) {
            // PHAI dung WHILE, khong phai IF!
            while (queue.size() == capacity) {
                lock.wait(); // Queue day → doi consumer lay bot
            }
            queue.add(item);
            lock.notifyAll(); // Bao consumer co data moi
        }
    }

    // CONSUMER
    public T take() throws InterruptedException {
        synchronized (lock) {
            while (queue.isEmpty()) {
                lock.wait(); // Queue rong → doi producer them
            }
            T item = queue.poll();
            lock.notifyAll(); // Bao producer co cho trong
            return item;
        }
    }
}
\`\`\`

## Tai sao WHILE khong phai IF?

\`\`\`java
// ❌ SAI - Spurious Wakeup!
synchronized (lock) {
    if (queue.isEmpty()) { // Dung IF
        lock.wait();
    }
    // Sau khi wake up, queue VAN CO THE rong!
    // Vi: 1) Spurious wakeup (OS issue)
    //     2) Thread khac da lay het truoc
    T item = queue.poll(); // NullPointerException!
}

// ✅ DUNG - Luon check lai condition
synchronized (lock) {
    while (queue.isEmpty()) { // Dung WHILE
        lock.wait();
    }
    // Dam bao queue CHAC CHAN co data
    T item = queue.poll();
}
\`\`\`

## notify() vs notifyAll()

\`\`\`mermaid
graph TD
    subgraph "notify() - Danh thuc 1 thread"
        W1A[Thread A - WAITING]
        W1B[Thread B - WAITING]
        W1C[Thread C - WAITING]
        W1A -->|"Duoc chon (random)"| E1[Entry Set]
        W1B -.->|"Van WAITING"| W1B
        W1C -.->|"Van WAITING"| W1C
    end
\`\`\`

\`\`\`mermaid
graph TD
    subgraph "notifyAll() - Danh thuc TAT CA"
        W2A[Thread A - WAITING] -->|"Vao Entry Set"| E2[Entry Set]
        W2B[Thread B - WAITING] -->|"Vao Entry Set"| E2
        W2C[Thread C - WAITING] -->|"Vao Entry Set"| E2
        E2 -->|"Canh tranh lock"| WINNER[1 thread thang]
    end
\`\`\`

| | notify() | notifyAll() |
|---|---|---|
| **Danh thuc** | 1 thread (random) | Tat ca threads |
| **Risk** | Thread sai duoc danh thuc → deadlock | An toan hon |
| **Performance** | Tot hon (it context switch) | Nhieu context switch |
| **Recommend** | Chi khi chi co 1 loai waiter | Da so truong hop |

## BlockingQueue (Java cung cap san)

\`\`\`java
// Thay vi tu viet wait/notify, dung BlockingQueue:
BlockingQueue<String> queue = new ArrayBlockingQueue<>(100);

// Producer
queue.put("message"); // Block neu day

// Consumer
String msg = queue.take(); // Block neu rong

// Cac loai BlockingQueue:
// ArrayBlockingQueue  - bounded, array-backed
// LinkedBlockingQueue - optionally bounded, linked list
// PriorityBlockingQueue - unbounded, priority ordering
// SynchronousQueue - zero capacity, handoff truc tiep
\`\`\`

> ⚠️ Trong production, dung \`BlockingQueue\` thay vi tu viet wait/notify. It bug hon, da duoc test ky luong.
    `
  },
  {
    id: 5,
    title: "Thread Safety Problems",
    desc: "Race Condition, Visibility, Atomicity, Instruction Reordering - 4 con quai vat",
    content: `
## 4 Van de cot loi

\`\`\`mermaid
graph TD
    subgraph "Thread Safety Problems"
        RC["1. Race Condition<br/>(Dua nhau truy cap data)"]
        VIS["2. Visibility<br/>(Khong thay thay doi cua thread khac)"]
        ATOM["3. Atomicity<br/>(Thao tac bi cat giua chung)"]
        REORD["4. Instruction Reordering<br/>(CPU/Compiler doi thu tu)"]
    end
\`\`\`

## 1. Race Condition

\`\`\`java
// Classic: Check-then-act
public class LazyInit {
    private static Object instance;

    // ❌ Race condition!
    public static Object getInstance() {
        if (instance == null) {        // Thread A check: null
            instance = new Object();   // Thread A tao
            // Thread B cung check: null (chua thay)
            // Thread B CUNG tao → 2 instances!
        }
        return instance;
    }
}
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant A as Thread A
    participant MEM as Shared Memory
    participant B as Thread B

    A->>MEM: Check: instance == null? → YES
    B->>MEM: Check: instance == null? → YES
    A->>MEM: instance = new Object() (obj1)
    B->>MEM: instance = new Object() (obj2)
    Note over MEM: 2 instances duoc tao! Bug!
\`\`\`

## 2. Visibility Problem

\`\`\`mermaid
graph TD
    subgraph "CPU Architecture"
        subgraph "Core 1"
            T1[Thread 1]
            L1A["L1 Cache<br/>running = true"]
        end
        subgraph "Core 2"
            T2[Thread 2]
            L1B["L1 Cache<br/>running = true (stale!)"]
        end
        RAM["Main Memory<br/>running = false (da update)"]
    end

    T1 -->|"Ghi"| L1A
    L1A -->|"Chua flush!"| RAM
    T2 -->|"Doc"| L1B
    L1B -.->|"Chua reload!"| RAM
\`\`\`

\`\`\`java
// ❌ Thread 2 co the KHONG BAO GIO thay running = false
private boolean running = true; // Khong volatile!

// Thread 1:
public void stop() {
    running = false; // Ghi vao CPU cache, chua flush main memory
}

// Thread 2:
public void run() {
    while (running) { // Doc tu CPU cache cu → luon true!
        doWork();     // Vong lap vo han!
    }
}

// ✅ Fix: volatile
private volatile boolean running = true;
// volatile bat buoc doc/ghi truc tiep tu main memory
\`\`\`

## 3. Atomicity

\`\`\`java
// Cac thao tac KHONG atomic:
count++;          // READ → MODIFY → WRITE (3 buoc)
count = count + 1; // Tuong tu
arr[i] = arr[i] * 2; // Doc → Tinh → Ghi

// Cac thao tac IS atomic (trong Java):
int x = 10;      // Gan gia tri (primitive, nho hon 64-bit)
boolean b = true; // Atomic
Object ref = obj; // Reference assignment la atomic

// CHU Y: long va double KHONG atomic tren 32-bit JVM!
long x = 123456789L; // Co the bi doc giua chung → invalid value!
// Fix: volatile long x; (dam bao atomic read/write)
\`\`\`

## 4. Instruction Reordering

\`\`\`java
// Code ban viet:
int a = 1;    // (1)
int b = 2;    // (2)
int c = a + b; // (3)

// Compiler/CPU co the doi thanh:
int b = 2;    // (2) ← Doi truoc!
int a = 1;    // (1)
int c = a + b; // (3)
// Single-threaded: OK, ket qua giong nhau
// Multi-threaded: Co the NGUY HIEM!
\`\`\`

### Double-Checked Locking Bug

\`\`\`java
public class Singleton {
    private static Singleton instance; // ❌ Khong volatile!

    public static Singleton getInstance() {
        if (instance == null) {                    // Check 1
            synchronized (Singleton.class) {
                if (instance == null) {             // Check 2
                    instance = new Singleton();     // Van de o day!
                }
            }
        }
        return instance;
    }
}
\`\`\`

\`\`\`
instance = new Singleton() thuc ra la 3 buoc:

1. Allocate memory
2. Goi constructor (init fields)
3. Gan reference cho instance

CPU co the reorder thanh:
1. Allocate memory
3. Gan reference cho instance ← instance != null roi!
2. Goi constructor             ← CHUA init xong!

Thread khac thay instance != null → dung object CHUA INIT!
\`\`\`

\`\`\`java
// ✅ Fix: volatile ngan reordering
private static volatile Singleton instance;
// volatile tao Memory Barrier → khong reorder qua
\`\`\`

## Tong ket: Cach fix

| Van de | Giai phap |
|--------|-----------|
| Race Condition | synchronized, Lock, Atomic variables |
| Visibility | volatile, synchronized, final |
| Atomicity | synchronized, Atomic classes, Lock |
| Reordering | volatile (memory barrier), synchronized |

> ⚠️ Mot dong code don gian nhu \`counter++\` co the chua 3 VAN DE cung luc: race condition, visibility, va atomicity. Luon suy nghi ve concurrency!
    `
  },
  {
    id: 6,
    title: "Java Memory Model (JMM)",
    desc: "happens-before, Memory Barriers, volatile deep dive - JVM internal",
    content: `
## JMM la gi?

**Java Memory Model** dinh nghia CACH va KHI NAO thay doi cua 1 thread VISIBLE cho thread khac.

\`\`\`mermaid
graph TD
    subgraph "Thuc te: CPU Memory Architecture"
        T1[Thread 1] --> L1A[L1 Cache]
        T2[Thread 2] --> L1B[L1 Cache]
        L1A --> L2A[L2 Cache]
        L1B --> L2B[L2 Cache]
        L2A --> L3[L3 Cache - Shared]
        L2B --> L3
        L3 --> RAM[Main Memory]
    end
\`\`\`

\`\`\`
Van de:
Thread 1 ghi x = 42 → vao L1 Cache cua Core 1
Thread 2 doc x → tu L1 Cache cua Core 2 → VAN LA 0!

JMM cung cap QUY TAC de biet KHI NAO Thread 2 CHAC CHAN thay x = 42
\`\`\`

## happens-before Relationship

**A happens-before B** co nghia: KET QUA cua A duoc DAM BAO visible cho B.

### 6 Quy tac happens-before

\`\`\`mermaid
graph TD
    R1["1. Program Order Rule<br/>Trong 1 thread: lenh truoc HB lenh sau"]
    R2["2. Monitor Lock Rule<br/>unlock() HB lock() tiep theo tren CUNG monitor"]
    R3["3. Volatile Variable Rule<br/>Write volatile HB Read volatile tiep theo"]
    R4["4. Thread Start Rule<br/>thread.start() HB moi lenh trong thread do"]
    R5["5. Thread Join Rule<br/>Moi lenh trong thread HB join() return"]
    R6["6. Transitivity<br/>A HB B va B HB C → A HB C"]
\`\`\`

### Vi du cu the

\`\`\`java
// Volatile Variable Rule:
volatile boolean ready = false;
int data = 0;

// Thread 1:
data = 42;       // (1)
ready = true;    // (2) WRITE volatile

// Thread 2:
if (ready) {     // (3) READ volatile
    // (2) happens-before (3)
    // Transitivity: (1) HB (2) HB (3) → (1) HB (3)
    System.out.println(data); // DAM BAO la 42!
}
\`\`\`

## volatile Deep Dive

### volatile lam gi?

\`\`\`mermaid
graph TD
    subgraph "Khong co volatile"
        W1["Thread 1: x = 42"] -->|"Ghi vao CPU cache"| C1[L1 Cache Core 1]
        C1 -.->|"Co the CHUA flush"| M1[Main Memory: x = 0]
        M1 -.->|"Doc tu cache cu"| C2[L1 Cache Core 2]
        C2 --> R1["Thread 2: doc x = 0"]
    end
\`\`\`

\`\`\`mermaid
graph TD
    subgraph "Co volatile"
        W2["Thread 1: x = 42"] -->|"1. Ghi + Flush"| M2[Main Memory: x = 42]
        M2 -->|"2. Invalidate caches khac"| C4[L1 Cache Core 2: INVALID]
        C4 -->|"3. Reload tu main memory"| R2["Thread 2: doc x = 42"]
    end
\`\`\`

### Memory Barriers

\`\`\`
volatile write tao 2 barriers:

         LoadStore Barrier
code truoc khong duoc reorder xuong duoi
─────────────────────────────────────────
         VOLATILE WRITE (x = 42)
─────────────────────────────────────────
         StoreLoad Barrier
code sau khong duoc reorder len tren

volatile read tao 2 barriers:

         LoadLoad Barrier
         ──────────────────
         VOLATILE READ (y = x)
         ──────────────────
         LoadStore Barrier
code sau khong duoc reorder len tren
\`\`\`

### volatile KHONG dam bao Atomicity!

\`\`\`java
private volatile int count = 0;

// ❌ Van co race condition!
count++; // Van la READ → MODIFY → WRITE
// volatile chi dam bao moi thread doc gia tri moi nhat
// NHUNG 2 threads van co the doc cung gia tri → ghi de nhau

// ✅ Dung AtomicInteger cho atomic operations
private final AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet(); // Atomic bang CAS
\`\`\`

## final Fields & Safe Publication

\`\`\`java
public class ImmutableConfig {
    private final String host;   // final = safe publication
    private final int port;

    public ImmutableConfig(String host, int port) {
        this.host = host;
        this.port = port;
    }
    // Sau constructor, bat ky thread nao doc host va port
    // deu DAM BAO thay gia tri dung
    // (JMM dam bao final fields visible sau construction)
}
\`\`\`

## Tong ket JMM

\`\`\`
                    ┌─────────────────────────────────┐
                    │   JMM Guarantees                 │
                    ├─────────────────────────────────┤
                    │ synchronized:                    │
                    │   ✅ Visibility                  │
                    │   ✅ Atomicity                   │
                    │   ✅ Ordering                    │
                    ├─────────────────────────────────┤
                    │ volatile:                        │
                    │   ✅ Visibility                  │
                    │   ❌ Atomicity (chi read/write)  │
                    │   ✅ Ordering (memory barrier)   │
                    ├─────────────────────────────────┤
                    │ final:                           │
                    │   ✅ Visibility (sau constructor) │
                    │   N/A Atomicity                  │
                    │   ✅ Ordering (constructor)       │
                    └─────────────────────────────────┘
\`\`\`

> ⚠️ JMM la phan KHO NHAT cua Java concurrency. Hieu happens-before la chia khoa de viet code thread-safe ma khong dung synchronized khap noi.
    `
  },
  {
    id: 7,
    title: "Lock Framework",
    desc: "ReentrantLock, ReadWriteLock, StampedLock, Condition - vuot qua synchronized",
    content: `
## Tai sao can Lock Framework?

| | synchronized | Lock Framework |
|---|---|---|
| **Try lock** | Khong (block mai) | \`tryLock(timeout)\` |
| **Interruptible** | Khong | \`lockInterruptibly()\` |
| **Fair lock** | Khong | \`new ReentrantLock(true)\` |
| **Multiple conditions** | 1 wait set | Nhieu Condition objects |
| **Read/Write rieng** | Khong | ReadWriteLock |
| **Release thu tu** | Phai LIFO | Linh hoat |

## ReentrantLock

\`\`\`java
private final ReentrantLock lock = new ReentrantLock();

public void transfer(Account from, Account to, double amount) {
    lock.lock();
    try {
        from.debit(amount);
        to.credit(amount);
    } finally {
        lock.unlock(); // LUON unlock trong finally!
    }
}

// Try lock voi timeout
public boolean tryTransfer(Account from, Account to, double amount) {
    try {
        if (lock.tryLock(5, TimeUnit.SECONDS)) {
            try {
                from.debit(amount);
                to.credit(amount);
                return true;
            } finally {
                lock.unlock();
            }
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
    return false; // Khong lay duoc lock
}
\`\`\`

## Fair vs Unfair Lock

\`\`\`mermaid
graph TD
    subgraph "Unfair Lock (default) - Nhanh hon"
        UQ["Queue: T2 → T3 → T4"]
        UT["T5 (moi den)"] -->|"Chen ngang!"| UL[Lock]
        UQ -->|"Doi tu lau"| UL
    end

    subgraph "Fair Lock - Cong bang"
        FQ["Queue: T2 → T3 → T4 → T5"]
        FQ -->|"Theo thu tu FIFO"| FL[Lock]
    end
\`\`\`

\`\`\`java
// Unfair (default) - throughput cao hon
ReentrantLock unfair = new ReentrantLock(false);

// Fair - dam bao khong starvation
ReentrantLock fair = new ReentrantLock(true);
// Trade-off: throughput giam ~10-30%
\`\`\`

## Condition (thay wait/notify)

\`\`\`java
public class BoundedBuffer<T> {
    private final Lock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();  // Cho producer
    private final Condition notEmpty = lock.newCondition(); // Cho consumer
    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;

    public BoundedBuffer(int capacity) {
        this.capacity = capacity;
    }

    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (queue.size() == capacity) {
                notFull.await(); // Chi doi dieu kien "khong day"
            }
            queue.add(item);
            notEmpty.signal(); // Chi bao consumer
        } finally {
            lock.unlock();
        }
    }

    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (queue.isEmpty()) {
                notEmpty.await(); // Chi doi dieu kien "khong rong"
            }
            T item = queue.poll();
            notFull.signal(); // Chi bao producer
            return item;
        } finally {
            lock.unlock();
        }
    }
}
\`\`\`

## ReadWriteLock

\`\`\`mermaid
graph TD
    subgraph "ReadWriteLock"
        RL["Read Lock<br/>(Shared - nhieu thread doc cung luc)"]
        WL["Write Lock<br/>(Exclusive - chi 1 thread ghi)"]
    end

    R1[Reader 1] -->|"readLock"| RL
    R2[Reader 2] -->|"readLock"| RL
    R3[Reader 3] -->|"readLock"| RL
    W1[Writer] -->|"writeLock - DOI tat ca readers xong"| WL
\`\`\`

\`\`\`java
private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
private final Map<String, Object> cache = new HashMap<>();

public Object get(String key) {
    rwLock.readLock().lock();     // Nhieu threads doc song song
    try {
        return cache.get(key);
    } finally {
        rwLock.readLock().unlock();
    }
}

public void put(String key, Object value) {
    rwLock.writeLock().lock();    // Exclusive - block tat ca readers
    try {
        cache.put(key, value);
    } finally {
        rwLock.writeLock().unlock();
    }
}
\`\`\`

## StampedLock (Java 8+, Nhanh nhat)

\`\`\`java
private final StampedLock sl = new StampedLock();
private double x, y;

// Optimistic Read - KHONG lock, nhanh nhat
public double distanceFromOrigin() {
    long stamp = sl.tryOptimisticRead(); // Khong block!
    double currentX = x, currentY = y;

    if (!sl.validate(stamp)) { // Check co ai ghi trong luc doc?
        stamp = sl.readLock();  // Co → dung pessimistic read
        try {
            currentX = x;
            currentY = y;
        } finally {
            sl.unlockRead(stamp);
        }
    }
    return Math.sqrt(currentX * currentX + currentY * currentY);
}

// Write
public void move(double deltaX, double deltaY) {
    long stamp = sl.writeLock();
    try {
        x += deltaX;
        y += deltaY;
    } finally {
        sl.unlockWrite(stamp);
    }
}
\`\`\`

## So sanh Lock types

| Lock | Read/Read | Read/Write | Write/Write | Dac biet |
|------|-----------|------------|-------------|----------|
| **synchronized** | Block | Block | Block | Don gian nhat |
| **ReentrantLock** | Block | Block | Block | tryLock, fair, condition |
| **ReentrantReadWriteLock** | Song song | Block | Block | Read-heavy workloads |
| **StampedLock** | Optimistic | Block | Block | Nhanh nhat, nhung phuc tap |

> ⚠️ LUON dung try-finally voi Lock! Neu exception xay ra ma khong unlock → DEADLOCK vinh vien.
    `
  },
  {
    id: 8,
    title: "Atomic Variables & CAS",
    desc: "AtomicInteger, CAS internal, ABA Problem - Lock-free programming",
    content: `
## Compare-And-Swap (CAS) - Hardware Level

\`\`\`mermaid
sequenceDiagram
    participant T as Thread
    participant CPU as CPU (cmpxchg instruction)
    participant MEM as Memory

    T->>MEM: Doc value = 10 (expected)
    T->>T: Tinh toan: 10 + 1 = 11 (new value)
    T->>CPU: CAS(address, expected=10, new=11)
    CPU->>MEM: Kiem tra: value van = 10?
    alt Van la 10
        CPU->>MEM: Ghi 11 → SUCCESS
        CPU-->>T: true
    else Da thay doi (vi du = 15)
        CPU-->>T: false (KHONG ghi)
        Note over T: Retry: doc lai, tinh lai
    end
\`\`\`

\`\`\`
CAS la HARDWARE instruction (x86: CMPXCHG, ARM: LDREX/STREX)
→ Atomic tai CPU level, KHONG can OS lock
→ Nhanh hon synchronized (khong context switch)
\`\`\`

## AtomicInteger Internal

\`\`\`java
public class AtomicInteger {
    private volatile int value; // volatile dam bao visibility

    public final int incrementAndGet() {
        // Unsafe.compareAndSwapInt - goi CPU CAS instruction
        int prev, next;
        do {
            prev = get();           // Doc gia tri hien tai
            next = prev + 1;        // Tinh gia tri moi
        } while (!compareAndSet(prev, next)); // CAS loop
        return next;
    }

    // CAS: Neu value == expect → set value = update, return true
    //       Neu value != expect → return false, retry
    public final boolean compareAndSet(int expect, int update) {
        return UNSAFE.compareAndSwapInt(this, valueOffset, expect, update);
    }
}
\`\`\`

## Cac Atomic Classes

| Class | Muc dich |
|-------|----------|
| \`AtomicInteger\` | int operations (increment, add, compareAndSet) |
| \`AtomicLong\` | long operations |
| \`AtomicBoolean\` | boolean flag |
| \`AtomicReference<V>\` | Reference CAS |
| \`AtomicIntegerArray\` | Array of atomic ints |
| \`AtomicStampedReference\` | Reference + version (fix ABA) |
| \`LongAdder\` | High-contention counter (Java 8+) |

## Code vi du

\`\`\`java
// Thread-safe counter khong can lock
AtomicInteger counter = new AtomicInteger(0);

// Nhieu threads goi dong thoi - LUON dung!
counter.incrementAndGet();  // +1, return new value
counter.addAndGet(5);       // +5, return new value
counter.compareAndSet(6, 0); // Reset ve 0 neu dang la 6

// Atomic update voi function
counter.updateAndGet(current -> current * 2); // Nhan doi

// AtomicReference cho objects
AtomicReference<String> ref = new AtomicReference<>("hello");
ref.compareAndSet("hello", "world"); // Thay doi neu dang la "hello"
\`\`\`

## ABA Problem

\`\`\`mermaid
sequenceDiagram
    participant T1 as Thread 1
    participant MEM as Memory
    participant T2 as Thread 2

    T1->>MEM: Doc value = A
    Note over T1: Bi preempted (tam dung)
    T2->>MEM: Doi A → B
    T2->>MEM: Doi B → A (tro lai A!)
    Note over T1: Tiep tuc
    T1->>MEM: CAS(expected=A, new=C)
    Note over MEM: Value = A → CAS thanh cong!
    Note over T1: NHUNG trang thai DA THAY DOI (A→B→A)!
\`\`\`

\`\`\`java
// Fix ABA voi AtomicStampedReference
AtomicStampedReference<String> ref =
    new AtomicStampedReference<>("A", 0); // value + stamp

int[] stampHolder = new int[1];
String current = ref.get(stampHolder); // Doc value + stamp

// CAS kiem tra CA value VA stamp
ref.compareAndSet(
    current,           // expected value
    "C",               // new value
    stampHolder[0],    // expected stamp
    stampHolder[0] + 1 // new stamp
);
// Neu ai do da doi A→B→A, stamp da tang → CAS FAIL!
\`\`\`

## LongAdder - Toi uu cho High Contention

\`\`\`mermaid
graph TD
    subgraph "AtomicLong - 1 variable, nhieu threads CAS"
        AL[value = 100]
        TA1[Thread 1] -->|"CAS retry"| AL
        TA2[Thread 2] -->|"CAS retry"| AL
        TA3[Thread 3] -->|"CAS retry"| AL
        TA4[Thread 4] -->|"CAS retry"| AL
    end

    subgraph "LongAdder - Chia thanh cells"
        C1["Cell 0: 25"]
        C2["Cell 1: 25"]
        C3["Cell 2: 25"]
        C4["Cell 3: 25"]
        TB1[Thread 1] --> C1
        TB2[Thread 2] --> C2
        TB3[Thread 3] --> C3
        TB4[Thread 4] --> C4
        C1 -->|"sum()"| SUM["Total: 100"]
        C2 --> SUM
        C3 --> SUM
        C4 --> SUM
    end
\`\`\`

\`\`\`java
// Khi nhieu threads increment CUNG LUC:
LongAdder adder = new LongAdder();

// Moi thread increment cell rieng → it CAS contention
adder.increment();
adder.add(10);

// Lay tong (cham hon, nhung increment nhanh hon)
long total = adder.sum();

// Benchmark (16 threads):
// AtomicLong.incrementAndGet(): 180ms
// LongAdder.increment():        35ms  ← 5x nhanh hon!
\`\`\`

## Lock-free vs Lock-based

| | Lock-based (synchronized) | Lock-free (CAS) |
|---|---|---|
| **Blocking** | Co - thread cho | Khong - spin retry |
| **Deadlock** | Co the | Khong bao gio |
| **Overhead** | Context switch (OS) | CAS retry (CPU) |
| **Best for** | Long critical sections | Short operations (counter, flag) |
| **Starvation** | Co the (unfair lock) | Co the (livelock) |

> ⚠️ CAS tot cho operations DON GIAN (counter, flag). Cho logic PHUC TAP, dung Lock/synchronized - de hieu va it bug hon.
    `
  },
  {
    id: 9,
    title: "Concurrent Collections",
    desc: "ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue - internal structure",
    content: `
## Tai sao khong dung Collections.synchronizedMap()?

\`\`\`java
// ❌ synchronizedMap = 1 lock cho TOAN BO map
Map<String, Object> map = Collections.synchronizedMap(new HashMap<>());
// Moi operation lock TOAN BO map → chi 1 thread tai 1 thoi diem

// ✅ ConcurrentHashMap = lock tung segment/bucket
ConcurrentHashMap<String, Object> map = new ConcurrentHashMap<>();
// Nhieu threads doc/ghi DONG THOI tren cac buckets khac nhau
\`\`\`

## ConcurrentHashMap Internal (Java 8+)

\`\`\`mermaid
graph TD
    subgraph "ConcurrentHashMap"
        subgraph "Node Array (table)"
            B0["Bucket 0<br/>LinkedList/TreeBin"]
            B1["Bucket 1<br/>(empty)"]
            B2["Bucket 2<br/>LinkedList"]
            B3["Bucket 3<br/>TreeBin (>8 nodes)"]
        end
    end

    T1["Thread 1"] -->|"CAS on bucket 0"| B0
    T2["Thread 2"] -->|"CAS on bucket 2"| B2
    T3["Thread 3"] -->|"synchronized(head) on bucket 3"| B3
\`\`\`

\`\`\`
Java 8 ConcurrentHashMap:
- KHONG dung Segment nhu Java 7
- Lock tung BUCKET (node dau tien)
- Dung CAS cho insert node moi vao bucket rong
- Dung synchronized(head node) cho update/insert vao bucket co node

put() flow:
1. hash key → tim bucket index
2. Bucket rong? → CAS insert (lock-free!)
3. Bucket co node? → synchronized(head) → insert/update
4. Bucket co > 8 nodes? → Chuyen tu LinkedList → TreeBin (Red-Black Tree)
\`\`\`

### Key Operations

\`\`\`java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// Atomic operations (thread-safe)
map.put("key", 1);
map.putIfAbsent("key", 2); // Chi put neu chua co
map.computeIfAbsent("key", k -> expensiveCompute(k));
map.merge("key", 1, Integer::sum); // Atomic increment

// ❌ KHONG atomic!
Integer val = map.get("key");
if (val == null) {
    map.put("key", 1); // Race condition giua get va put!
}

// ✅ Dung computeIfAbsent
map.computeIfAbsent("key", k -> 1); // Atomic check-then-act
\`\`\`

## CopyOnWriteArrayList

\`\`\`mermaid
graph LR
    subgraph "Write: Copy toan bo array"
        A1["[1, 2, 3]"] -->|"add(4)"| A2["[1, 2, 3, 4] (array MOI)"]
        A1 -.->|"Readers van doc array CU"| R1[Reader 1]
        A1 -.-> R2[Reader 2]
    end
\`\`\`

\`\`\`java
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// Write: Copy TOAN BO array → O(n)
list.add("item"); // Cham! Nhung thread-safe

// Read: Khong can lock → O(1), nhanh!
String item = list.get(0);

// Iterator: Snapshot tai thoi diem tao
for (String s : list) {
    // Luon doc snapshot cu, KHONG thay thay doi moi
    // KHONG nem ConcurrentModificationException
}
\`\`\`

| Use case | Dung | Khong dung |
|----------|------|------------|
| **Read nhieu, Write it** | Config lists, listener lists | Frequently modified lists |
| **Iteration an toan** | Snapshot semantics | Can thay changes real-time |

## BlockingQueue Implementations

\`\`\`mermaid
graph TD
    subgraph "BlockingQueue Family"
        ABQ["ArrayBlockingQueue<br/>Bounded, fair/unfair"]
        LBQ["LinkedBlockingQueue<br/>Optionally bounded"]
        PBQ["PriorityBlockingQueue<br/>Unbounded, sorted"]
        DQ["DelayQueue<br/>Elements available sau delay"]
        SQ["SynchronousQueue<br/>Zero capacity, handoff"]
    end
\`\`\`

| Implementation | Bounded? | Lock | Best for |
|----------------|----------|------|----------|
| \`ArrayBlockingQueue\` | Co | 1 ReentrantLock | General purpose, bounded |
| \`LinkedBlockingQueue\` | Optional | 2 Locks (put/take rieng) | High throughput |
| \`PriorityBlockingQueue\` | Khong | 1 ReentrantLock | Priority processing |
| \`SynchronousQueue\` | 0 capacity | Lock-free (CAS) | Direct handoff |
| \`LinkedTransferQueue\` | Khong | Lock-free | Flexible transfer |

## ConcurrentSkipListMap (Sorted, Thread-safe)

\`\`\`
SkipList structure:
Level 3: HEAD ─────────────────────────── 50 ────── NIL
Level 2: HEAD ────── 10 ─────────── 30 ── 50 ────── NIL
Level 1: HEAD ── 5 ─ 10 ── 20 ── 30 ── 50 ── 70 ── NIL

- O(log n) cho get/put/remove
- Lock-free (CAS based)
- Sorted order (nhu TreeMap nhung thread-safe)
\`\`\`

\`\`\`java
ConcurrentSkipListMap<String, Integer> sortedMap = new ConcurrentSkipListMap<>();
sortedMap.put("banana", 2);
sortedMap.put("apple", 1);
sortedMap.put("cherry", 3);
// Iterator: apple → banana → cherry (sorted)
\`\`\`

## Chon dung Collection

| Need | Dung |
|------|------|
| Thread-safe Map, high throughput | \`ConcurrentHashMap\` |
| Thread-safe sorted Map | \`ConcurrentSkipListMap\` |
| Read-heavy List | \`CopyOnWriteArrayList\` |
| Producer-Consumer queue | \`LinkedBlockingQueue\` |
| Bounded buffer | \`ArrayBlockingQueue\` |
| Priority queue | \`PriorityBlockingQueue\` |
| Direct handoff | \`SynchronousQueue\` |

> ⚠️ \`HashMap\` va \`ArrayList\` KHONG thread-safe. Trong multi-threaded code, LUON dung concurrent collections hoac synchronized wrappers.
    `
  },
  {
    id: 10,
    title: "Thread Pools & ExecutorService",
    desc: "ThreadPoolExecutor internal, cac loai pool, rejection policies, sizing",
    content: `
## Tai sao can Thread Pool?

\`\`\`
Khong co pool:
Request 1 → new Thread() → OS create thread (~1ms, ~1MB stack)
Request 2 → new Thread() → OS create thread
...
Request 10000 → new Thread() → OutOfMemoryError!

Co pool:
Request 1 → Pool [Thread 1 is free] → Thread 1 xu ly
Request 2 → Pool [Thread 2 is free] → Thread 2 xu ly
...
Request 10000 → Pool [All busy] → Queue → Doi thread free
\`\`\`

## ThreadPoolExecutor Internal

\`\`\`mermaid
graph TD
    TASK[Task submitted] --> CHECK{corePoolSize<br/>da du?}
    CHECK -->|"Chua du"| CREATE["Tao CORE thread moi"]
    CHECK -->|"Da du"| QUEUE{Work Queue<br/>con cho?}
    QUEUE -->|"Con cho"| ENQUEUE["Them vao Queue"]
    QUEUE -->|"Queue day!"| MAX{maxPoolSize<br/>da du?}
    MAX -->|"Chua du"| CREATEMAX["Tao NON-CORE thread moi"]
    MAX -->|"Da du!"| REJECT["RejectedExecutionHandler"]

    style REJECT fill:#ef4444,color:#fff
\`\`\`

## 7 Tham so cua ThreadPoolExecutor

\`\`\`java
new ThreadPoolExecutor(
    int corePoolSize,      // So threads toi thieu (luon song)
    int maximumPoolSize,   // So threads toi da
    long keepAliveTime,    // Thoi gian thread idle truoc khi bi kill
    TimeUnit unit,         // Don vi thoi gian
    BlockingQueue<Runnable> workQueue,    // Hang doi cho tasks
    ThreadFactory threadFactory,          // Cach tao thread
    RejectedExecutionHandler handler      // Xu ly khi queue day
);

// Vi du thuc te:
ExecutorService pool = new ThreadPoolExecutor(
    10,                          // core: 10 threads
    50,                          // max: 50 threads
    60L, TimeUnit.SECONDS,       // idle 60s → kill non-core
    new LinkedBlockingQueue<>(1000), // Queue chua 1000 tasks
    new ThreadFactory() {
        private int count = 0;
        public Thread newThread(Runnable r) {
            return new Thread(r, "worker-" + count++);
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy() // Caller tu chay
);
\`\`\`

## Rejection Policies

| Policy | Hanh vi | Khi nao dung |
|--------|---------|-------------|
| **AbortPolicy** (default) | Throw RejectedExecutionException | Bao loi, xu ly exception |
| **CallerRunsPolicy** | Caller thread tu chay task | Slow down producer (back-pressure) |
| **DiscardPolicy** | Bo task, khong bao loi | Tasks khong quan trong |
| **DiscardOldestPolicy** | Bo task cu nhat trong queue | Uu tien task moi |

## Executors Factory Methods

\`\`\`java
// ❌ KHONG NEN dung trong production!

// FixedThreadPool - LinkedBlockingQueue (UNBOUNDED!)
Executors.newFixedThreadPool(10);
// Queue vo han → OOM khi tasks nhieu!

// CachedThreadPool - SynchronousQueue
Executors.newCachedThreadPool();
// Max = Integer.MAX_VALUE → tao qua nhieu threads → OOM!

// SingleThreadExecutor - LinkedBlockingQueue (UNBOUNDED!)
Executors.newSingleThreadExecutor();
// Queue vo han → OOM!

// ScheduledThreadPool
Executors.newScheduledThreadPool(5);
\`\`\`

\`\`\`java
// ✅ TU TAO ThreadPoolExecutor voi bounded queue!
ExecutorService pool = new ThreadPoolExecutor(
    10, 20, 60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(500),     // BOUNDED!
    new ThreadPoolExecutor.CallerRunsPolicy()
);
\`\`\`

## Thread Pool Sizing

\`\`\`
CPU-bound tasks (tinh toan):
  threads = CPU cores + 1
  Vi du: 8 cores → 9 threads

IO-bound tasks (DB, HTTP, file):
  threads = CPU cores * (1 + W/C)
  W = thoi gian cho (wait)
  C = thoi gian tinh (compute)

  Vi du: 8 cores, task doi DB 80ms, tinh 20ms
  threads = 8 * (1 + 80/20) = 8 * 5 = 40 threads

Mixed: Tach CPU-bound va IO-bound thanh pools rieng
\`\`\`

## ExecutorService Lifecycle

\`\`\`mermaid
stateDiagram-v2
    [*] --> Running: new ThreadPoolExecutor()
    Running --> ShuttingDown: shutdown()
    Running --> ShuttingDown: shutdownNow()
    ShuttingDown --> Terminated: tat ca tasks hoan thanh
    Terminated --> [*]
\`\`\`

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(10);

// Submit tasks
Future<String> future = pool.submit(() -> {
    return "result";
});

// Graceful shutdown
pool.shutdown();            // Khong nhan task moi, doi tasks cu xong
pool.awaitTermination(30, TimeUnit.SECONDS);

// Force shutdown (neu can)
if (!pool.isTerminated()) {
    pool.shutdownNow();     // Interrupt tat ca threads
}
\`\`\`

## ScheduledExecutorService

\`\`\`java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

// Chay sau 5 giay
scheduler.schedule(() -> doTask(), 5, TimeUnit.SECONDS);

// Chay moi 10 giay (tinh tu luc BAT DAU task truoc)
scheduler.scheduleAtFixedRate(() -> doTask(), 0, 10, TimeUnit.SECONDS);

// Chay moi 10 giay (tinh tu luc KET THUC task truoc)
scheduler.scheduleWithFixedDelay(() -> doTask(), 0, 10, TimeUnit.SECONDS);
\`\`\`

> ⚠️ KHONG dung \`Executors.newFixedThreadPool()\` trong production! Luon tu tao ThreadPoolExecutor voi bounded queue de tranh OOM.
    `
  },
  {
    id: 11,
    title: "CompletableFuture & Async",
    desc: "Async composition, chaining, exception handling - Modern async Java",
    content: `
## Future vs CompletableFuture

\`\`\`java
// Future (Java 5) - Han che
Future<String> future = executor.submit(() -> fetchData());
String result = future.get(); // BLOCK! Khong the chain

// CompletableFuture (Java 8) - Async, composable
CompletableFuture<String> cf = CompletableFuture
    .supplyAsync(() -> fetchData())
    .thenApply(data -> transform(data))
    .thenAccept(result -> save(result));
// KHONG block! Chain duoc!
\`\`\`

## Async Pipeline

\`\`\`mermaid
graph LR
    S["supplyAsync<br/>(chay async)"] --> TA["thenApply<br/>(transform)"]
    TA --> TAC["thenAccept<br/>(consume)"]
    TAC --> TR["thenRun<br/>(action cuoi)"]
    S -.->|"Exception!"| EX["exceptionally<br/>(handle error)"]

    style S fill:#3b82f6,color:#fff
    style EX fill:#ef4444,color:#fff
\`\`\`

## Tao CompletableFuture

\`\`\`java
// 1. supplyAsync - co return value
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> {
    return callAPI(); // Chay trong ForkJoinPool.commonPool()
});

// 2. supplyAsync voi custom Executor
ExecutorService pool = Executors.newFixedThreadPool(10);
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> {
    return callAPI();
}, pool); // Chay trong pool cua minh

// 3. runAsync - khong co return value
CompletableFuture<Void> cf3 = CompletableFuture.runAsync(() -> {
    sendNotification();
});

// 4. Tu gia tri co san
CompletableFuture<String> cf4 = CompletableFuture.completedFuture("done");
\`\`\`

## Chaining (Transformation)

\`\`\`java
CompletableFuture<String> pipeline = CompletableFuture
    .supplyAsync(() -> fetchUser(userId))      // Async: Lay user
    .thenApply(user -> user.getEmail())         // Sync: Lay email
    .thenApply(email -> email.toUpperCase())    // Sync: Transform
    .thenApplyAsync(email -> sendEmail(email)); // Async: Gui email

// thenApply  = chay trong CUNG thread (hoac caller)
// thenApplyAsync = chay trong thread MOI (async)
\`\`\`

| Method | Input | Output | Async? |
|--------|-------|--------|--------|
| \`thenApply(fn)\` | T → U | CompletableFuture<U> | No |
| \`thenApplyAsync(fn)\` | T → U | CompletableFuture<U> | Yes |
| \`thenAccept(fn)\` | T → void | CompletableFuture<Void> | No |
| \`thenRun(action)\` | void | CompletableFuture<Void> | No |
| \`thenCompose(fn)\` | T → CF<U> | CompletableFuture<U> | No (flatMap) |

## Compose (flatMap)

\`\`\`java
// thenApply → tra ve CompletableFuture<CompletableFuture<Order>> (NESTED!)
// thenCompose → tra ve CompletableFuture<Order> (FLAT!)

CompletableFuture<Order> order = CompletableFuture
    .supplyAsync(() -> getUser(userId))
    .thenCompose(user -> getLatestOrder(user)); // getLatestOrder tra ve CF<Order>
\`\`\`

## Combine (chay song song)

\`\`\`java
CompletableFuture<String> userCF = CompletableFuture
    .supplyAsync(() -> fetchUser(id));

CompletableFuture<List<Order>> ordersCF = CompletableFuture
    .supplyAsync(() -> fetchOrders(id));

// Doi CA HAI xong, roi combine
CompletableFuture<UserProfile> profile = userCF
    .thenCombine(ordersCF, (user, orders) -> {
        return new UserProfile(user, orders);
    });
\`\`\`

## allOf / anyOf

\`\`\`java
// Doi TAT CA hoan thanh
CompletableFuture<Void> all = CompletableFuture.allOf(cf1, cf2, cf3);
all.thenRun(() -> System.out.println("Tat ca xong!"));

// Doi BAT KY 1 cai hoan thanh
CompletableFuture<Object> any = CompletableFuture.anyOf(cf1, cf2, cf3);
any.thenAccept(result -> System.out.println("Cai nhanh nhat: " + result));

// Pattern: Goi nhieu APIs song song
List<CompletableFuture<String>> futures = urls.stream()
    .map(url -> CompletableFuture.supplyAsync(() -> fetch(url)))
    .toList();

CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
    .thenApply(v -> futures.stream()
        .map(CompletableFuture::join) // Lay ket qua
        .toList());
\`\`\`

## Exception Handling

\`\`\`java
CompletableFuture<String> cf = CompletableFuture
    .supplyAsync(() -> {
        if (error) throw new RuntimeException("Loi!");
        return "OK";
    })
    .exceptionally(ex -> {
        // Handle exception, return default
        log.error("Error: ", ex);
        return "DEFAULT";
    });

// handle() - xu ly CA success VA error
CompletableFuture<String> cf2 = CompletableFuture
    .supplyAsync(() -> riskyOperation())
    .handle((result, ex) -> {
        if (ex != null) return "Error: " + ex.getMessage();
        return "Success: " + result;
    });

// whenComplete() - side-effect, khong doi ket qua
CompletableFuture<String> cf3 = CompletableFuture
    .supplyAsync(() -> fetchData())
    .whenComplete((result, ex) -> {
        if (ex != null) log.error("Failed", ex);
        else log.info("Got: {}", result);
    });
\`\`\`

## Timeout (Java 9+)

\`\`\`java
CompletableFuture<String> cf = CompletableFuture
    .supplyAsync(() -> slowAPI())
    .orTimeout(5, TimeUnit.SECONDS)         // Timeout → TimeoutException
    .completeOnTimeout("default", 5, TimeUnit.SECONDS); // Timeout → default value
\`\`\`

> ⚠️ CompletableFuture dung ForkJoinPool.commonPool() mac dinh - chi co it threads! Cho IO tasks, LUON truyen custom Executor.
    `
  },
  {
    id: 12,
    title: "Fork/Join Framework",
    desc: "Work-Stealing, RecursiveTask, Divide and Conquer - Parallel computing",
    content: `
## Fork/Join la gi?

Framework de xu ly bai toan **chia de tri** (divide and conquer) song song.

\`\`\`mermaid
graph TD
    BIG["Big Task<br/>[1...1000000]"] -->|"fork"| L["Left Half<br/>[1...500000]"]
    BIG -->|"fork"| R["Right Half<br/>[500001...1000000]"]
    L -->|"fork"| LL["[1...250000]"]
    L -->|"fork"| LR["[250001...500000]"]
    R -->|"fork"| RL["[500001...750000]"]
    R -->|"fork"| RR["[750001...1000000]"]
    LL -->|"join"| L
    LR -->|"join"| L
    RL -->|"join"| R
    RR -->|"join"| R
    L -->|"join"| BIG
    R -->|"join"| BIG
\`\`\`

## Work-Stealing Algorithm

\`\`\`mermaid
graph LR
    subgraph "ForkJoinPool"
        subgraph "Thread 1"
            Q1["Deque: [Task A, Task B, Task C]"]
        end
        subgraph "Thread 2"
            Q2["Deque: [Task D]"]
        end
        subgraph "Thread 3 (idle)"
            Q3["Deque: (EMPTY)"]
        end
    end

    Q3 -.->|"STEAL Task C<br/>tu cuoi queue"| Q1
\`\`\`

\`\`\`
Work-Stealing:
- Moi thread co 1 DOUBLE-ENDED queue (deque)
- Thread push/pop tasks tu DAU deque (LIFO - cho locality)
- Thread idle STEAL tu CUOI deque cua thread khac (FIFO)
- Giam contention vi push/pop va steal o 2 dau khac nhau
\`\`\`

## RecursiveTask (co return)

\`\`\`java
public class SumTask extends RecursiveTask<Long> {
    private final long[] array;
    private final int start, end;
    private static final int THRESHOLD = 10_000;

    public SumTask(long[] array, int start, int end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }

    @Override
    protected Long compute() {
        // Base case: nho du → tinh truc tiep
        if (end - start <= THRESHOLD) {
            long sum = 0;
            for (int i = start; i < end; i++) {
                sum += array[i];
            }
            return sum;
        }

        // Chia thanh 2 nua
        int mid = (start + end) / 2;
        SumTask left = new SumTask(array, start, mid);
        SumTask right = new SumTask(array, mid, end);

        left.fork();   // Submit left cho thread khac
        long rightResult = right.compute(); // Tu tinh right
        long leftResult = left.join();      // Doi ket qua left

        return leftResult + rightResult;
    }
}

// Su dung
ForkJoinPool pool = new ForkJoinPool(); // Hoac ForkJoinPool.commonPool()
long[] arr = new long[10_000_000];
long sum = pool.invoke(new SumTask(arr, 0, arr.length));
\`\`\`

## RecursiveAction (khong return)

\`\`\`java
public class SortTask extends RecursiveAction {
    private final int[] array;
    private final int start, end;

    @Override
    protected void compute() {
        if (end - start <= 1000) {
            Arrays.sort(array, start, end); // Base case
            return;
        }

        int mid = (start + end) / 2;
        invokeAll(
            new SortTask(array, start, mid),
            new SortTask(array, mid, end)
        );
        merge(array, start, mid, end); // Merge 2 sorted halves
    }
}
\`\`\`

## Parallel Streams (su dung Fork/Join)

\`\`\`java
// Parallel stream = Fork/Join duoi hood
long sum = LongStream.rangeClosed(1, 100_000_000)
    .parallel()      // Su dung ForkJoinPool.commonPool()
    .sum();

// Custom ForkJoinPool cho parallel stream
ForkJoinPool customPool = new ForkJoinPool(16);
long sum = customPool.submit(() ->
    list.parallelStream()
        .mapToLong(Item::getValue)
        .sum()
).get();
\`\`\`

## Khi nao dung Fork/Join?

| Dung | Khong dung |
|------|------------|
| Bai toan chia nho duoc (sort, sum, search) | IO-bound tasks |
| Data lon (>10K elements) | Data nho |
| CPU-bound computation | Tasks co side effects |
| Sub-tasks doc lap | Tasks phu thuoc nhau |

## Performance

\`\`\`
Benchmark: Sum 100M integers
CPU: 8 cores

Sequential:        450ms
Fork/Join (8 threads): 75ms   ← 6x nhanh hon
Parallel Stream:    78ms   ← Tuong tu Fork/Join

Overhead: Fork/Join co overhead cho task nho
  THRESHOLD qua nho → qua nhieu tasks → cham hon
  THRESHOLD qua lon → khong du parallelism
  Rule of thumb: THRESHOLD = array.length / (4 * CPU_CORES)
\`\`\`

> ⚠️ \`parallelStream()\` dung ForkJoinPool.commonPool() CHIA SE giua tat ca parallel streams. Neu 1 stream cham → block het. Dung custom pool cho critical tasks.
    `
  },
  {
    id: 13,
    title: "Deadlock, Livelock & Starvation",
    desc: "Phat hien, phong tranh, xu ly - 3 van de nguy hiem nhat",
    content: `
## Deadlock

2 threads doi nhau NHA LOCK → Ca 2 KHONG BAO GIO tiep tuc.

\`\`\`mermaid
graph LR
    T1["Thread 1<br/>Giu Lock A<br/>Doi Lock B"] -->|"Doi"| LB[Lock B]
    T2["Thread 2<br/>Giu Lock B<br/>Doi Lock A"] -->|"Doi"| LA[Lock A]
    LA -->|"Dang giu boi"| T1
    LB -->|"Dang giu boi"| T2

    style T1 fill:#ef4444,color:#fff
    style T2 fill:#ef4444,color:#fff
\`\`\`

\`\`\`java
// ❌ Classic Deadlock
Object lockA = new Object();
Object lockB = new Object();

// Thread 1: Lock A → Lock B
new Thread(() -> {
    synchronized (lockA) {
        Thread.sleep(100); // Tang kha nang deadlock
        synchronized (lockB) { // DOI Lock B (Thread 2 dang giu!)
            doWork();
        }
    }
}).start();

// Thread 2: Lock B → Lock A (THU TU NGUOC!)
new Thread(() -> {
    synchronized (lockB) {
        Thread.sleep(100);
        synchronized (lockA) { // DOI Lock A (Thread 1 dang giu!)
            doWork();
        }
    }
}).start();
\`\`\`

## 4 Dieu kien Deadlock (Coffman Conditions)

| Dieu kien | Mo ta | Cach pha |
|-----------|-------|----------|
| **Mutual Exclusion** | Resource chi 1 thread dung | Dung concurrent collections |
| **Hold and Wait** | Giu lock va doi lock khac | Lay tat ca locks cung luc |
| **No Preemption** | Khong the cuong lock | Dung tryLock() |
| **Circular Wait** | Vong tron doi | Dat thu tu lock co dinh |

## Fix Deadlock

### Cach 1: Lock Ordering (Tot nhat)

\`\`\`java
// ✅ LUON lay lock theo CUNG THU TU
// Thu tu: lockA truoc lockB (theo hash hoac ID)
void transfer(Account from, Account to, double amount) {
    Account first = from.getId() < to.getId() ? from : to;
    Account second = from.getId() < to.getId() ? to : from;

    synchronized (first) {
        synchronized (second) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}
\`\`\`

### Cach 2: tryLock() voi timeout

\`\`\`java
// ✅ Khong block vinh vien
ReentrantLock lockA = new ReentrantLock();
ReentrantLock lockB = new ReentrantLock();

boolean success = false;
while (!success) {
    if (lockA.tryLock(1, TimeUnit.SECONDS)) {
        try {
            if (lockB.tryLock(1, TimeUnit.SECONDS)) {
                try {
                    doWork();
                    success = true;
                } finally { lockB.unlock(); }
            }
        } finally { lockA.unlock(); }
    }
    if (!success) Thread.sleep(random.nextInt(100)); // Back off
}
\`\`\`

## Deadlock Detection

\`\`\`bash
# Thread dump (jstack)
jstack <PID>

# Output:
# Found one Java-level deadlock:
# "Thread-1":
#   waiting to lock monitor 0x00007f... (object 0x00000...)
#   which is held by "Thread-2"
# "Thread-2":
#   waiting to lock monitor 0x00007f... (object 0x00000...)
#   which is held by "Thread-1"
\`\`\`

\`\`\`java
// Programmatic detection
ThreadMXBean bean = ManagementFactory.getThreadMXBean();
long[] deadlockedThreads = bean.findDeadlockedThreads();
if (deadlockedThreads != null) {
    ThreadInfo[] infos = bean.getThreadInfo(deadlockedThreads, true, true);
    for (ThreadInfo info : infos) {
        System.out.println("Deadlocked: " + info.getThreadName());
    }
}
\`\`\`

## Livelock

Threads KHONG block nhung cu LAP LAI hanh dong ma khong tien trien.

\`\`\`java
// Livelock: 2 nguoi gap nhau trong hanh lang hep
// Ca 2 buoc tranh cung phia → van chan nhau → buoc lai...

// Fix: Random backoff
if (conflict) {
    Thread.sleep(ThreadLocalRandom.current().nextInt(10, 100));
}
\`\`\`

## Starvation

Thread khong bao gio duoc chay vi threads khac chiem het CPU/lock.

\`\`\`mermaid
graph TD
    subgraph "Starvation"
        HP1["High Priority Thread 1"] -->|"Luon chay"| CPU[CPU]
        HP2["High Priority Thread 2"] -->|"Luon chay"| CPU
        LP["Low Priority Thread"] -.->|"KHONG BAO GIO duoc chay!"| CPU
    end
\`\`\`

\`\`\`java
// Fix starvation: Fair lock
ReentrantLock fairLock = new ReentrantLock(true); // FIFO ordering
// Thread doi lau nhat se duoc uu tien
\`\`\`

## Tong ket

| Van de | Trieu chung | Fix |
|--------|-------------|-----|
| **Deadlock** | Threads dong cung, 100% hang | Lock ordering, tryLock, jstack |
| **Livelock** | CPU 100% nhung khong tien trien | Random backoff |
| **Starvation** | 1 thread khong bao gio chay | Fair locks, priority adjustment |

> ⚠️ Deadlock la BUG NGUY HIEM NHAT trong concurrent programming. Luon dung lock ordering hoac tryLock() de phong tranh.
    `
  },
  {
    id: 14,
    title: "Virtual Threads (Project Loom)",
    desc: "Java 21+ - Lightweight threads, Structured Concurrency, M:N scheduling",
    content: `
## Van de voi Platform Threads

\`\`\`
Platform Thread = 1 OS Thread:
- Stack: ~1MB
- Tao/huy: ~1ms (kernel call)
- Max: ~10,000 threads (OS limit)
- Context switch: ~10μs (kernel mode)

Van de: 10K concurrent HTTP requests = 10K threads = 10GB RAM!
\`\`\`

## Virtual Threads (Java 21)

\`\`\`mermaid
graph TD
    subgraph "Virtual Threads (M:N Model)"
        VT1[Virtual Thread 1]
        VT2[Virtual Thread 2]
        VT3[Virtual Thread 3]
        VT4[Virtual Thread 4]
        VT5["...Virtual Thread 1M"]
    end

    subgraph "Carrier Threads (Platform)"
        PT1["Carrier 1<br/>(OS Thread)"]
        PT2["Carrier 2<br/>(OS Thread)"]
    end

    VT1 -->|"mounted"| PT1
    VT2 -->|"mounted"| PT2
    VT3 -.->|"waiting (unmounted)"| HEAP["Heap Memory<br/>(chi vai KB)"]
    VT4 -.->|"waiting (unmounted)"| HEAP
    VT5 -.->|"waiting (unmounted)"| HEAP
\`\`\`

| | Platform Thread | Virtual Thread |
|---|---|---|
| **Stack** | ~1MB (OS stack) | ~vài KB (heap, auto-grow) |
| **Tao** | ~1ms (OS call) | ~1μs (JVM managed) |
| **So luong** | ~10K | ~1,000,000+ |
| **Scheduling** | OS scheduler | JVM scheduler (ForkJoinPool) |
| **Blocking** | Block OS thread | Unmount, free carrier |
| **Use case** | CPU-bound | IO-bound (HTTP, DB, file) |

## Tao Virtual Threads

\`\`\`java
// Cach 1: Thread.startVirtualThread()
Thread vt = Thread.startVirtualThread(() -> {
    System.out.println("Hello from virtual thread!");
    System.out.println("Is virtual: " + Thread.currentThread().isVirtual()); // true
});

// Cach 2: Thread.ofVirtual()
Thread vt2 = Thread.ofVirtual()
    .name("vt-", 0)  // vt-0, vt-1, vt-2...
    .start(() -> doWork());

// Cach 3: ExecutorService (Recommend)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    // Moi task = 1 virtual thread MOI
    for (int i = 0; i < 1_000_000; i++) {
        executor.submit(() -> {
            // IO task: HTTP call, DB query...
            String result = httpGet("https://api.example.com/data");
            return result;
        });
    }
} // Auto shutdown
\`\`\`

## Blocking = Unmount (Magic!)

\`\`\`mermaid
sequenceDiagram
    participant VT as Virtual Thread
    participant CT as Carrier Thread
    participant JVM as JVM Scheduler

    VT->>CT: Mounted (dang chay)
    VT->>VT: Thread.sleep() hoac IO block
    VT->>JVM: Unmount tu carrier!
    Note over CT: Carrier thread FREE cho VT khac
    JVM->>CT: Mount Virtual Thread khac
    Note over VT: Ngu tren Heap (vai KB)
    VT->>JVM: IO xong, san sang chay
    JVM->>CT: Mount lai VT
    VT->>CT: Tiep tuc chay
\`\`\`

\`\`\`
Khi Virtual Thread gap blocking operation:
1. JVM UNMOUNT VT tu carrier thread
2. Luu state len Heap (chi vai KB)
3. Carrier thread chay VT khac
4. Khi IO xong → JVM MOUNT lai VT len carrier
5. VT tiep tuc tu cho cu

→ 1 triệu VT chi can 8-16 carrier threads!
\`\`\`

## Structured Concurrency (Preview - Java 21)

\`\`\`java
// Xu ly nhieu tasks nhu 1 don vi
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<String> user = scope.fork(() -> fetchUser(id));
    Subtask<List<Order>> orders = scope.fork(() -> fetchOrders(id));

    scope.join();           // Doi tat ca subtasks
    scope.throwIfFailed();  // Throw neu co loi

    // Ca 2 da xong thanh cong
    return new UserProfile(user.get(), orders.get());
}
// Neu 1 task fail → cancel tat ca tasks khac!
// Khong co "dangling threads"
\`\`\`

## Khi nao dung Virtual Threads?

| Dung | KHONG dung |
|------|------------|
| IO-bound (HTTP, DB, file) | CPU-bound (tinh toan nang) |
| High concurrency (>10K concurrent tasks) | It concurrent tasks |
| Request-per-thread model (web servers) | Da dung reactive/async |
| Simple blocking code | Code dung synchronized nhieu |

## Chu y quan trong

\`\`\`java
// ❌ KHONG dung synchronized trong Virtual Threads!
// synchronized PIN virtual thread vao carrier → khong unmount duoc
synchronized (lock) {
    blockingIO(); // Carrier thread BI BLOCK!
}

// ✅ Dung ReentrantLock thay the
lock.lock();
try {
    blockingIO(); // Virtual thread unmount binh thuong
} finally {
    lock.unlock();
}

// ❌ KHONG pool Virtual Threads!
// Chung duoc thiet ke de tao-va-huy, khong phai reuse
ExecutorService pool = Executors.newFixedThreadPool(10);
pool.submit(virtualThreadTask); // SAI!

// ✅ Tao moi cho moi task
Executors.newVirtualThreadPerTaskExecutor();
\`\`\`

> ⚠️ Virtual Threads la cho IO-bound tasks. Cho CPU-bound, van dung Platform Threads voi thread pool.
    `
  },
  {
    id: 15,
    title: "Production Patterns & Best Practices",
    desc: "Thread-safe patterns, Immutability, Performance tips, Debugging - Expert level",
    content: `
## Thread-Safe Singleton

\`\`\`java
// Pattern 1: Enum Singleton (Tot nhat)
public enum DatabasePool {
    INSTANCE;
    private final HikariDataSource ds;
    DatabasePool() { ds = new HikariDataSource(config); }
    public Connection getConnection() { return ds.getConnection(); }
}

// Pattern 2: Lazy Holder (Thread-safe, lazy init)
public class Singleton {
    private Singleton() {}
    private static class Holder {
        static final Singleton INSTANCE = new Singleton();
        // JVM dam bao class chi init 1 lan (thread-safe)
    }
    public static Singleton getInstance() {
        return Holder.INSTANCE;
    }
}
\`\`\`

## Immutable Objects (Tot nhat cho concurrency)

\`\`\`java
// Immutable = KHONG CAN DONG BO
public record UserDTO(
    String name,
    String email,
    List<String> roles  // BAT BIEN
) {
    public UserDTO {
        roles = List.copyOf(roles); // Defensive copy
    }
}

// Chia se thoai mai giua threads ma KHONG can lock
// Vi khong ai co the thay doi state
\`\`\`

\`\`\`
Quy tac:
1. Tat ca fields la final
2. Khong co setter
3. Defensive copy cho mutable fields (List, Date, etc.)
4. Class la final (khong extend duoc)
5. Dung record (Java 16+) khi co the
\`\`\`

## ThreadLocal

\`\`\`java
// Moi thread co BAN SAO RIENG cua variable
private static final ThreadLocal<SimpleDateFormat> formatter =
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));

// Thread 1: formatter.get() → instance rieng
// Thread 2: formatter.get() → instance rieng (khac!)

// QUAN TRONG: Clear khi xong (tranh memory leak voi thread pools!)
try {
    SimpleDateFormat df = formatter.get();
    return df.format(date);
} finally {
    formatter.remove(); // PHAI clear!
}
\`\`\`

## CountDownLatch & CyclicBarrier

\`\`\`mermaid
graph TD
    subgraph "CountDownLatch (1 lan)"
        T1A["Worker 1 → countDown()"]
        T2A["Worker 2 → countDown()"]
        T3A["Worker 3 → countDown()"]
        T1A --> LATCH["Latch count: 3→2→1→0"]
        T2A --> LATCH
        T3A --> LATCH
        LATCH -->|"count = 0"| MAIN["Main thread: await() returns!"]
    end
\`\`\`

\`\`\`java
// CountDownLatch: Doi N tasks xong
CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    executor.submit(() -> {
        doWork();
        latch.countDown(); // Giam 1
    });
}
latch.await(); // Block cho den khi count = 0

// CyclicBarrier: Nhieu threads doi nhau tai 1 diem
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("Tat ca da den barrier!");
});
// Moi thread: barrier.await(); // Block cho den khi 3 threads den
// Co the REUSE (Cyclic) - CountDownLatch thi khong
\`\`\`

## Semaphore - Rate Limiting

\`\`\`java
// Gioi han so threads dong thoi
Semaphore semaphore = new Semaphore(10); // Max 10 concurrent

void handleRequest() {
    semaphore.acquire(); // Lay permit (block neu het)
    try {
        callExternalAPI(); // Chi 10 threads goi cung luc
    } finally {
        semaphore.release(); // Tra lai permit
    }
}
\`\`\`

## Performance Tips

\`\`\`
1. GIAM LOCK SCOPE
   ❌ synchronized(this) { readDB(); process(); writeToDB(); }
   ✅ readDB(); synchronized(this) { process(); } writeToDB();

2. DUNG LOCK PHU HOP
   Read-heavy → ReadWriteLock hoac StampedLock
   Counter → AtomicLong hoac LongAdder
   Flag → volatile boolean

3. TRANH FALSE SHARING
   2 variables tren cung cache line (64 bytes)
   Thread 1 ghi var A → invalidate cache line → Thread 2 phai reload var B
   Fix: @Contended hoac padding

4. LOCK-FREE KHI CO THE
   ConcurrentHashMap > Collections.synchronizedMap
   AtomicInteger > synchronized counter
   CopyOnWriteArrayList > synchronized list (read-heavy)

5. TRANH THREAD CREATION
   Luon dung Thread Pool
   Virtual Threads cho IO-bound tasks
\`\`\`

## Debugging Concurrency

\`\`\`bash
# 1. Thread dump
jstack <PID> > thread-dump.txt

# 2. Tim deadlock
jstack <PID> | grep -A 5 "deadlock"

# 3. Monitor threads
jcmd <PID> Thread.print

# 4. VisualVM - GUI tool
jvisualvm
\`\`\`

## Production Checklist

### Code
- Immutable objects khi co the
- Bounded queues (KHONG unbounded)
- Proper shutdown (shutdown + awaitTermination)
- ThreadLocal.remove() sau khi dung
- try-finally voi Lock.unlock()

### Monitoring
- Thread count (active, peak)
- Thread pool stats (queue size, active threads, completed tasks)
- Deadlock detection (ThreadMXBean)
- Consumer lag (cho producer-consumer patterns)

### Testing
- Stress test voi nhieu threads
- Race condition detection (jcstress, Thread Sanitizer)
- Timeout cho tat ca blocking operations

> ⚠️ Quy tac so 1 cua concurrency: **Don gian nhat co the**. Immutable objects > Atomic variables > Locks > Complex lock-free algorithms. Chon muc don gian THAP NHAT du dung cho bai toan.
    `
  }
];
