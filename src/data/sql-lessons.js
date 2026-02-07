export const sqlLessons = [
  {
    id: 1,
    title: "SQL Fundamentals - SELECT, WHERE, ORDER BY",
    desc: "Nen tang SQL - Truy van du lieu co ban tu SELECT den GROUP BY",
    content: `
## SQL la gi?

**SQL** (Structured Query Language) la ngon ngu chuan de tuong tac voi **Relational Database Management Systems** (RDBMS) nhu PostgreSQL, MySQL, Oracle, SQL Server.

SQL chia thanh nhieu nhom lenh:

| Nhom | Ten day du | Lenh | Muc dich |
|------|-----------|------|----------|
| **DQL** | Data Query Language | SELECT | Truy van du lieu |
| **DML** | Data Manipulation Language | INSERT, UPDATE, DELETE | Thao tac du lieu |
| **DDL** | Data Definition Language | CREATE, ALTER, DROP | Dinh nghia cau truc |
| **DCL** | Data Control Language | GRANT, REVOKE | Phan quyen |
| **TCL** | Transaction Control Language | COMMIT, ROLLBACK | Quan ly transaction |

## SELECT - Truy van du lieu co ban

### Cu phap co ban

\`\`\`sql
SELECT column1, column2, ...
FROM table_name;
\`\`\`

### Sample Data - Bang employees

\`\`\`sql
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE,
    manager_id INT
);

INSERT INTO employees VALUES
(1, 'Nguyen Van A', 'Engineering', 85000.00, '2020-01-15', NULL),
(2, 'Tran Thi B', 'Engineering', 92000.00, '2019-06-01', 1),
(3, 'Le Van C', 'Marketing', 65000.00, '2021-03-20', 1),
(4, 'Pham Thi D', 'Engineering', 78000.00, '2022-01-10', 2),
(5, 'Hoang Van E', 'Marketing', 55000.00, '2023-05-15', 3),
(6, 'Vo Thi F', 'HR', 70000.00, '2020-09-01', 1),
(7, 'Dao Van G', 'HR', 62000.00, '2021-11-20', 6),
(8, 'Bui Thi H', 'Engineering', 95000.00, '2018-03-10', 1),
(9, 'Ngo Van I', 'Marketing', 58000.00, '2022-07-01', 3),
(10, 'Dinh Thi K', 'Engineering', 88000.00, '2020-12-01', 2);
\`\`\`

### Column Aliases va DISTINCT

\`\`\`sql
-- Column alias voi AS
SELECT name AS employee_name, salary AS monthly_pay
FROM employees;

-- DISTINCT - loai bo gia tri trung lap
SELECT DISTINCT department FROM employees;

-- DISTINCT tren nhieu cot
SELECT DISTINCT department, manager_id FROM employees;
\`\`\`

### SELECT voi bieu thuc

\`\`\`sql
-- Tinh toan trong SELECT
SELECT name,
       salary AS yearly_salary,
       salary / 12 AS monthly_salary,
       salary * 1.1 AS salary_after_raise
FROM employees;

-- String concatenation (PostgreSQL)
SELECT name || ' - ' || department AS employee_info
FROM employees;

-- CASE expression
SELECT name, salary,
    CASE
        WHEN salary >= 90000 THEN 'Senior'
        WHEN salary >= 70000 THEN 'Mid'
        ELSE 'Junior'
    END AS level
FROM employees;
\`\`\`

## WHERE - Loc du lieu

### Cac toan tu so sanh

\`\`\`sql
-- Bang (=) va Khac (<> hoac !=)
SELECT * FROM employees WHERE department = 'Engineering';
SELECT * FROM employees WHERE department <> 'Marketing';

-- Lon hon (>), Nho hon (<), Lon hon bang (>=), Nho hon bang (<=)
SELECT * FROM employees WHERE salary > 80000;
SELECT * FROM employees WHERE salary <= 65000;

-- BETWEEN - trong khoang
SELECT * FROM employees
WHERE salary BETWEEN 60000 AND 80000;
-- Tuong duong: salary >= 60000 AND salary <= 80000

-- IN - nam trong tap gia tri
SELECT * FROM employees
WHERE department IN ('Engineering', 'HR');

-- LIKE - pattern matching
SELECT * FROM employees WHERE name LIKE 'Nguyen%';  -- bat dau bang Nguyen
SELECT * FROM employees WHERE name LIKE '%Van%';     -- chua Van
SELECT * FROM employees WHERE name LIKE '_ran%';     -- ky tu thu 2-4 la 'ran'

-- IS NULL / IS NOT NULL
SELECT * FROM employees WHERE manager_id IS NULL;    -- la CEO/top manager
SELECT * FROM employees WHERE manager_id IS NOT NULL;
\`\`\`

### Ket hop dieu kien voi AND, OR, NOT

\`\`\`sql
-- AND - tat ca dieu kien deu dung
SELECT * FROM employees
WHERE department = 'Engineering' AND salary > 80000;

-- OR - it nhat mot dieu kien dung
SELECT * FROM employees
WHERE department = 'Engineering' OR department = 'HR';

-- NOT - phu dinh
SELECT * FROM employees
WHERE NOT department = 'Marketing';

-- Ket hop phuc tap - dung ngoac don de ro rang
SELECT * FROM employees
WHERE (department = 'Engineering' OR department = 'HR')
  AND salary > 70000;
\`\`\`

> ⚠️ Luu y: Thu tu uu tien la NOT > AND > OR. Luon dung ngoac don () de tranh nhap nhang.

## ORDER BY - Sap xep ket qua

\`\`\`sql
-- Sap xep tang dan (ASC - mac dinh)
SELECT * FROM employees ORDER BY salary ASC;

-- Sap xep giam dan
SELECT * FROM employees ORDER BY salary DESC;

-- Sap xep nhieu cot
SELECT * FROM employees
ORDER BY department ASC, salary DESC;

-- Sap xep bang vi tri cot (khong khuyen khich)
SELECT name, department, salary
FROM employees
ORDER BY 2 ASC, 3 DESC;

-- NULL ordering
SELECT * FROM employees
ORDER BY manager_id NULLS FIRST;  -- PostgreSQL
\`\`\`

## LIMIT va OFFSET - Phan trang

\`\`\`sql
-- Lay 5 ban ghi dau tien
SELECT * FROM employees ORDER BY salary DESC LIMIT 5;

-- Phan trang: trang 2 voi 5 ban ghi moi trang
SELECT * FROM employees
ORDER BY id
LIMIT 5 OFFSET 5;

-- PostgreSQL: FETCH FIRST (chuan SQL)
SELECT * FROM employees
ORDER BY salary DESC
FETCH FIRST 5 ROWS ONLY;

-- Top-N query: 3 nhan vien luong cao nhat
SELECT name, salary
FROM employees
ORDER BY salary DESC
LIMIT 3;
\`\`\`

## Aggregate Functions - Ham tong hop

\`\`\`sql
-- COUNT - dem so ban ghi
SELECT COUNT(*) AS total_employees FROM employees;
SELECT COUNT(DISTINCT department) AS dept_count FROM employees;

-- SUM - tong
SELECT SUM(salary) AS total_salary FROM employees;

-- AVG - trung binh
SELECT AVG(salary) AS avg_salary FROM employees;

-- MIN, MAX
SELECT MIN(salary) AS min_salary, MAX(salary) AS max_salary FROM employees;

-- Ket hop nhieu aggregate
SELECT
    COUNT(*) AS total,
    SUM(salary) AS total_salary,
    AVG(salary) AS avg_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary
FROM employees
WHERE department = 'Engineering';
\`\`\`

## GROUP BY va HAVING

\`\`\`sql
-- GROUP BY - nhom du lieu
SELECT department, COUNT(*) AS emp_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;

-- Ket qua:
-- department   | emp_count | avg_salary
-- Engineering  | 5         | 87600.00
-- Marketing    | 3         | 59333.33
-- HR           | 2         | 66000.00

-- HAVING - loc sau khi GROUP BY
SELECT department, COUNT(*) AS emp_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING COUNT(*) >= 3;

-- HAVING vs WHERE
-- WHERE: loc truoc khi group
-- HAVING: loc sau khi group
SELECT department,
       COUNT(*) AS emp_count,
       AVG(salary) AS avg_salary
FROM employees
WHERE hire_date >= '2020-01-01'   -- loc truoc khi group
GROUP BY department
HAVING AVG(salary) > 60000;       -- loc sau khi group
\`\`\`

### Thu tu thuc thi cua SQL

\`\`\`text
1. FROM        - Xac dinh bang nguon
2. WHERE       - Loc ban ghi
3. GROUP BY    - Nhom ket qua
4. HAVING      - Loc nhom
5. SELECT      - Chon cot
6. DISTINCT    - Loai trung lap
7. ORDER BY    - Sap xep
8. LIMIT/OFFSET - Phan trang
\`\`\`

> ⚠️ Luu y: Thu tu thuc thi KHAC voi thu tu viet. Vi du: khong the dung alias trong WHERE vi SELECT chua chay.
    `
  },
  {
    id: 2,
    title: "Joins Deep Dive",
    desc: "Tat ca cac loai JOIN - tu INNER den SELF JOIN va thuat toan dang sau",
    content: `
## JOIN la gi?

**JOIN** cho phep ket hop du lieu tu **nhieu bang** dua tren dieu kien lien ket (join condition). Day la suc manh cot loi cua relational database.

### Sample Data

\`\`\`sql
CREATE TABLE departments (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    location VARCHAR(100)
);

CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    dept_id INT,
    salary DECIMAL(10,2),
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

CREATE TABLE projects (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    budget DECIMAL(12,2)
);

CREATE TABLE employee_projects (
    employee_id INT,
    project_id INT,
    role VARCHAR(50),
    PRIMARY KEY (employee_id, project_id)
);

INSERT INTO departments VALUES
(1, 'Engineering', 'HCM'),
(2, 'Marketing', 'HN'),
(3, 'HR', 'HCM'),
(4, 'Finance', 'DN');  -- Khong co employee nao

INSERT INTO employees VALUES
(1, 'Nguyen Van A', 1, 85000),
(2, 'Tran Thi B', 1, 92000),
(3, 'Le Van C', 2, 65000),
(4, 'Pham Thi D', NULL, 78000),  -- Khong co department
(5, 'Hoang Van E', 3, 70000);

INSERT INTO projects VALUES
(1, 'Project Alpha', 500000),
(2, 'Project Beta', 300000),
(3, 'Project Gamma', 200000);

INSERT INTO employee_projects VALUES
(1, 1, 'Lead'), (1, 2, 'Member'),
(2, 1, 'Member'), (3, 2, 'Lead'),
(5, 3, 'Lead');
\`\`\`

## Cac loai JOIN

\`\`\`mermaid
graph TD
    subgraph "SQL JOIN Types"
        IJ[INNER JOIN<br/>Chi lay phan giao]
        LJ[LEFT JOIN<br/>Tat ca ben trai + giao]
        RJ[RIGHT JOIN<br/>Tat ca ben phai + giao]
        FJ[FULL OUTER JOIN<br/>Tat ca ca hai ben]
        CJ[CROSS JOIN<br/>Tich Descartes]
        SJ[SELF JOIN<br/>Tu join voi chinh no]
    end
\`\`\`

## INNER JOIN

Tra ve cac ban ghi co **match o ca hai bang**.

\`\`\`sql
SELECT e.name AS employee, d.name AS department
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- Ket qua:
-- employee      | department
-- Nguyen Van A  | Engineering
-- Tran Thi B    | Engineering
-- Le Van C      | Marketing
-- Hoang Van E   | HR
-- (Pham Thi D bi loai vi dept_id = NULL)
-- (Finance bi loai vi khong co employee)
\`\`\`

## LEFT JOIN (LEFT OUTER JOIN)

Tra ve **tat ca ban ghi tu bang trai** + match tu bang phai (NULL neu khong match).

\`\`\`sql
SELECT e.name AS employee, d.name AS department
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- Ket qua:
-- employee      | department
-- Nguyen Van A  | Engineering
-- Tran Thi B    | Engineering
-- Le Van C      | Marketing
-- Pham Thi D    | NULL          <-- khong co department
-- Hoang Van E   | HR
\`\`\`

### Tim ban ghi khong co match (Anti-Join)

\`\`\`sql
-- Tim employees khong thuoc department nao
SELECT e.name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.id IS NULL;

-- Ket qua: Pham Thi D
\`\`\`

## RIGHT JOIN (RIGHT OUTER JOIN)

Tra ve **tat ca ban ghi tu bang phai** + match tu bang trai.

\`\`\`sql
SELECT e.name AS employee, d.name AS department
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;

-- Ket qua:
-- employee      | department
-- Nguyen Van A  | Engineering
-- Tran Thi B    | Engineering
-- Le Van C      | Marketing
-- Hoang Van E   | HR
-- NULL           | Finance       <-- khong co employee
\`\`\`

## FULL OUTER JOIN

Tra ve **tat ca ban ghi tu ca hai bang**, NULL cho ben khong match.

\`\`\`sql
SELECT e.name AS employee, d.name AS department
FROM employees e
FULL OUTER JOIN departments d ON e.dept_id = d.id;

-- Ket qua:
-- employee      | department
-- Nguyen Van A  | Engineering
-- Tran Thi B    | Engineering
-- Le Van C      | Marketing
-- Hoang Van E   | HR
-- Pham Thi D    | NULL          <-- employee khong co dept
-- NULL           | Finance       <-- dept khong co employee
\`\`\`

## CROSS JOIN

Tich Descartes - **moi ban ghi cua bang nay ket hop voi tat ca ban ghi cua bang kia**.

\`\`\`sql
-- Moi employee duoc gan vao moi project (de danh gia)
SELECT e.name, p.name AS project
FROM employees e
CROSS JOIN projects p;
-- 5 employees x 3 projects = 15 rows
\`\`\`

> ⚠️ Luu y: CROSS JOIN co the tao ra tap ket qua RAT LON (m x n rows). Chi dung khi thuc su can.

## SELF JOIN

Bang tu join voi chinh no - thuong dung cho **quan he cha-con** hoac **so sanh trong cung bang**.

\`\`\`sql
-- Tim manager cua moi employee
CREATE TABLE staff (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    manager_id INT REFERENCES staff(id)
);

INSERT INTO staff VALUES
(1, 'CEO Nguyen', NULL),
(2, 'CTO Tran', 1),
(3, 'Dev Le', 2),
(4, 'Dev Pham', 2);

SELECT
    e.name AS employee,
    m.name AS manager
FROM staff e
LEFT JOIN staff m ON e.manager_id = m.id;

-- Ket qua:
-- employee    | manager
-- CEO Nguyen  | NULL
-- CTO Tran    | CEO Nguyen
-- Dev Le      | CTO Tran
-- Dev Pham    | CTO Tran
\`\`\`

## Multiple JOINs

\`\`\`sql
-- Tim employee, department va project cua ho
SELECT
    e.name AS employee,
    d.name AS department,
    p.name AS project,
    ep.role
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
LEFT JOIN employee_projects ep ON e.id = ep.employee_id
LEFT JOIN projects p ON ep.project_id = p.id
ORDER BY e.name;

-- Ket qua:
-- employee      | department  | project        | role
-- Hoang Van E   | HR          | Project Gamma  | Lead
-- Le Van C      | Marketing   | Project Beta   | Lead
-- Nguyen Van A  | Engineering | Project Alpha  | Lead
-- Nguyen Van A  | Engineering | Project Beta   | Member
-- Pham Thi D    | NULL        | NULL           | NULL
-- Tran Thi B    | Engineering | Project Alpha  | Member
\`\`\`

## Join Algorithms

\`\`\`mermaid
graph LR
    subgraph "Join Algorithms"
        NL[Nested Loop Join<br/>O n*m]
        HJ[Hash Join<br/>O n+m]
        MJ[Merge Join<br/>O n+m sorted]
    end
    NL -->|Nho, co index| Best1[Tot voi small tables]
    HJ -->|Lon, equality join| Best2[Tot voi large unsorted]
    MJ -->|Da sort, equality| Best3[Tot voi large sorted]
\`\`\`

### So sanh Join Algorithms

| Algorithm | Do phuc tap | Khi nao dung | Uu diem | Nhuoc diem |
|-----------|------------|--------------|---------|------------|
| **Nested Loop** | O(n * m) | Bang nho, co index | Don gian, ho tro moi loai join | Cham voi bang lon |
| **Hash Join** | O(n + m) | Bang lon, equality join | Nhanh voi du lieu lon | Can memory cho hash table |
| **Merge Join** | O(n + m) | Du lieu da sort | Hieu qua voi sorted data | Can sort truoc |

\`\`\`sql
-- Xem join algorithm trong EXPLAIN
EXPLAIN ANALYZE
SELECT e.name, d.name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- PostgreSQL output vi du:
-- Hash Join (cost=1.09..2.19 rows=4 width=64)
--   Hash Cond: (e.dept_id = d.id)
--   -> Seq Scan on employees e
--   -> Hash
--        -> Seq Scan on departments d
\`\`\`

## Bang tom tat JOIN types

| JOIN Type | Giu lai tu bang trai | Giu lai tu bang phai | Match required |
|-----------|---------------------|---------------------|----------------|
| **INNER JOIN** | Chi khi match | Chi khi match | Ca hai |
| **LEFT JOIN** | Tat ca | Chi khi match | Chi bang trai |
| **RIGHT JOIN** | Chi khi match | Tat ca | Chi bang phai |
| **FULL OUTER** | Tat ca | Tat ca | Khong |
| **CROSS JOIN** | Tat ca x Tat ca | Tat ca x Tat ca | Khong co dieu kien |
| **SELF JOIN** | Tuy loai join | Tuy loai join | Tuy loai join |

> ⚠️ Luu y: Luon dung ON clause ro rang thay vi WHERE de join. Dieu kien join trong WHERE lam code kho doc va de loi voi OUTER JOIN.
    `
  },
  {
    id: 3,
    title: "Subqueries & Common Table Expressions",
    desc: "Subqueries, CTE va Recursive CTE cho truy van phuc tap va du lieu phan cap",
    content: `
## Subquery la gi?

**Subquery** (truy van con) la mot cau lenh SELECT duoc dat ben trong mot cau lenh SQL khac. Subquery chay truoc va ket qua cua no duoc su dung boi outer query.

## Cac loai Subquery

\`\`\`mermaid
graph TD
    SQ[Subquery Types]
    SQ --> SC[Scalar Subquery<br/>Tra ve 1 gia tri]
    SQ --> SR[Row Subquery<br/>Tra ve 1 dong]
    SQ --> ST[Table Subquery<br/>Tra ve nhieu dong/cot]
    SQ --> CO[Correlated Subquery<br/>Tham chieu outer query]
\`\`\`

### Sample Data

\`\`\`sql
CREATE TABLE departments (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    budget DECIMAL(12,2)
);

CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    dept_id INT REFERENCES departments(id),
    salary DECIMAL(10,2),
    hire_date DATE
);

INSERT INTO departments VALUES
(1, 'Engineering', 1000000),
(2, 'Marketing', 500000),
(3, 'HR', 300000);

INSERT INTO employees VALUES
(1, 'Nguyen Van A', 1, 85000, '2020-01-15'),
(2, 'Tran Thi B', 1, 92000, '2019-06-01'),
(3, 'Le Van C', 2, 65000, '2021-03-20'),
(4, 'Pham Thi D', 1, 78000, '2022-01-10'),
(5, 'Hoang Van E', 2, 55000, '2023-05-15'),
(6, 'Vo Thi F', 3, 70000, '2020-09-01'),
(7, 'Dao Van G', 3, 62000, '2021-11-20'),
(8, 'Bui Thi H', 1, 95000, '2018-03-10');
\`\`\`

## Scalar Subquery

Tra ve **dung 1 gia tri** (1 dong, 1 cot).

\`\`\`sql
-- Tim employees co luong cao hon trung binh
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Hien thi % so voi max salary
SELECT name, salary,
       ROUND(salary / (SELECT MAX(salary) FROM employees) * 100, 1) AS pct_of_max
FROM employees
ORDER BY salary DESC;

-- Scalar subquery trong SELECT
SELECT name, salary,
       salary - (SELECT AVG(salary) FROM employees) AS diff_from_avg
FROM employees;
\`\`\`

## Table Subquery (IN, ANY, ALL)

\`\`\`sql
-- IN - co trong danh sach ket qua
SELECT name, dept_id
FROM employees
WHERE dept_id IN (
    SELECT id FROM departments WHERE budget > 400000
);

-- NOT IN - khong co trong danh sach
SELECT name FROM departments
WHERE id NOT IN (
    SELECT DISTINCT dept_id FROM employees WHERE dept_id IS NOT NULL
);

-- ANY/SOME - so sanh voi bat ky gia tri nao
SELECT name, salary
FROM employees
WHERE salary > ANY (
    SELECT salary FROM employees WHERE dept_id = 2
);
-- salary > MIN(salary cua dept 2)

-- ALL - so sanh voi tat ca gia tri
SELECT name, salary
FROM employees
WHERE salary > ALL (
    SELECT salary FROM employees WHERE dept_id = 2
);
-- salary > MAX(salary cua dept 2)
\`\`\`

> ⚠️ Luu y: NOT IN co van de voi NULL. Neu subquery tra ve NULL, NOT IN se tra ve rong. Dung NOT EXISTS thay the.

## Correlated Subquery

Subquery **tham chieu den outer query** - chay MOI LAN cho moi dong cua outer query.

\`\`\`sql
-- Tim nhan vien co luong cao nhat trong moi department
SELECT e.name, e.dept_id, e.salary
FROM employees e
WHERE e.salary = (
    SELECT MAX(e2.salary)
    FROM employees e2
    WHERE e2.dept_id = e.dept_id  -- tham chieu outer query
);

-- Tim departments co trung binh luong > trung binh toan cong ty
SELECT d.name, d.budget
FROM departments d
WHERE (
    SELECT AVG(e.salary) FROM employees e WHERE e.dept_id = d.id
) > (SELECT AVG(salary) FROM employees);
\`\`\`

## EXISTS vs IN

\`\`\`sql
-- EXISTS - tra ve TRUE neu subquery co it nhat 1 ket qua
SELECT d.name
FROM departments d
WHERE EXISTS (
    SELECT 1 FROM employees e WHERE e.dept_id = d.id
);

-- Tuong duong IN nhung hieu qua hon voi bang lon
SELECT d.name
FROM departments d
WHERE d.id IN (SELECT dept_id FROM employees);
\`\`\`

### So sanh EXISTS vs IN

| Tieu chi | EXISTS | IN |
|----------|--------|-----|
| **NULL handling** | Xu ly dung | NOT IN co van de voi NULL |
| **Bang ngoai lon** | Tot hon | Cham hon |
| **Bang trong nho** | Binh thuong | Tot hon |
| **Correlated** | Luon correlated | Thuong khong |
| **Khi nao dung** | Subquery tra ve nhieu dong | Subquery tra ve it gia tri |

## Common Table Expressions (CTE)

CTE (menh de **WITH**) cho phep dat ten cho mot subquery va tai su dung nhieu lan.

\`\`\`sql
-- CTE co ban
WITH high_earners AS (
    SELECT name, dept_id, salary
    FROM employees
    WHERE salary > 75000
)
SELECT d.name AS department, COUNT(*) AS high_earner_count
FROM high_earners h
JOIN departments d ON h.dept_id = d.id
GROUP BY d.name;

-- Nhieu CTEs
WITH dept_stats AS (
    SELECT dept_id,
           COUNT(*) AS emp_count,
           AVG(salary) AS avg_salary,
           MAX(salary) AS max_salary
    FROM employees
    GROUP BY dept_id
),
company_avg AS (
    SELECT AVG(salary) AS overall_avg FROM employees
)
SELECT d.name,
       ds.emp_count,
       ROUND(ds.avg_salary, 0) AS dept_avg,
       ds.max_salary,
       ROUND(ca.overall_avg, 0) AS company_avg,
       CASE
           WHEN ds.avg_salary > ca.overall_avg THEN 'Above Average'
           ELSE 'Below Average'
       END AS status
FROM dept_stats ds
JOIN departments d ON ds.dept_id = d.id
CROSS JOIN company_avg ca;
\`\`\`

## CTE vs Derived Table (Subquery trong FROM)

\`\`\`sql
-- Derived table (subquery trong FROM)
SELECT d.name, sub.emp_count
FROM departments d
JOIN (
    SELECT dept_id, COUNT(*) AS emp_count
    FROM employees
    GROUP BY dept_id
) sub ON d.id = sub.dept_id;

-- CTE tuong duong - de doc hon
WITH emp_counts AS (
    SELECT dept_id, COUNT(*) AS emp_count
    FROM employees
    GROUP BY dept_id
)
SELECT d.name, ec.emp_count
FROM departments d
JOIN emp_counts ec ON d.id = ec.dept_id;
\`\`\`

| Tieu chi | CTE | Derived Table |
|----------|-----|---------------|
| **Readability** | Tot hon, dat ten ro rang | Kho doc khi nested |
| **Reusability** | Dung nhieu lan trong query | Phai duplicate |
| **Recursive** | Ho tro | Khong ho tro |
| **Performance** | Thuong tuong duong | Thuong tuong duong |
| **Materialized** | Tuy DB (PostgreSQL co) | Optimizer quyet dinh |

## Recursive CTE - Du lieu phan cap

\`\`\`sql
-- Cau truc to chuc: CEO -> Manager -> Employee
CREATE TABLE org (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    manager_id INT REFERENCES org(id),
    title VARCHAR(100)
);

INSERT INTO org VALUES
(1, 'CEO Nguyen', NULL, 'CEO'),
(2, 'CTO Tran', 1, 'CTO'),
(3, 'VP Le', 1, 'VP Marketing'),
(4, 'Lead Pham', 2, 'Tech Lead'),
(5, 'Dev Hoang', 4, 'Senior Dev'),
(6, 'Dev Vo', 4, 'Junior Dev'),
(7, 'Marketer Dao', 3, 'Marketing Manager');

-- Recursive CTE: Hien thi cay to chuc
WITH RECURSIVE org_tree AS (
    -- Base case: CEO (khong co manager)
    SELECT id, name, title, manager_id, 0 AS level,
           name::TEXT AS path
    FROM org
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive case: tim tat ca nhan vien bao cao cho cap tren
    SELECT o.id, o.name, o.title, o.manager_id, ot.level + 1,
           ot.path || ' > ' || o.name
    FROM org o
    INNER JOIN org_tree ot ON o.manager_id = ot.id
)
SELECT
    REPEAT('  ', level) || name AS org_chart,
    title,
    level,
    path
FROM org_tree
ORDER BY path;
\`\`\`

\`\`\`text
-- Ket qua:
-- org_chart              | title             | level | path
-- CEO Nguyen             | CEO               | 0     | CEO Nguyen
--   CTO Tran             | CTO               | 1     | CEO Nguyen > CTO Tran
--     Lead Pham           | Tech Lead         | 2     | CEO Nguyen > CTO Tran > Lead Pham
--       Dev Hoang         | Senior Dev        | 3     | ... > Lead Pham > Dev Hoang
--       Dev Vo            | Junior Dev        | 3     | ... > Lead Pham > Dev Vo
--   VP Le                | VP Marketing      | 1     | CEO Nguyen > VP Le
--     Marketer Dao        | Marketing Manager | 2     | ... > VP Le > Marketer Dao
\`\`\`

### Recursive CTE: Tinh tong so nhan vien report (truc tiep + gian tiep)

\`\`\`sql
WITH RECURSIVE subordinates AS (
    SELECT id, name, manager_id
    FROM org
    WHERE name = 'CTO Tran'  -- Bat dau tu CTO

    UNION ALL

    SELECT o.id, o.name, o.manager_id
    FROM org o
    INNER JOIN subordinates s ON o.manager_id = s.id
)
SELECT COUNT(*) - 1 AS total_reports  -- Tru chinh minh
FROM subordinates;
-- Ket qua: 3 (Lead Pham, Dev Hoang, Dev Vo)
\`\`\`

> ⚠️ Luu y: Recursive CTE co the chay vo han neu du lieu co cycle. Luon them LIMIT hoac dieu kien dung (PostgreSQL: CYCLE detection tu v14+).
    `
  },
  {
    id: 4,
    title: "Window Functions",
    desc: "Window functions - cong cu manh me cho phan tich du lieu, ranking, va running totals",
    content: `
## Window Functions la gi?

**Window Functions** thuc hien tinh toan tren mot **tap hop cac dong lien quan** (window) ma **KHONG gom nhom** chung lai nhu GROUP BY. Moi dong giu nguyen trong ket qua.

\`\`\`mermaid
graph LR
    subgraph "GROUP BY"
        G1[5 rows] --> G2[2 groups]
    end
    subgraph "Window Function"
        W1[5 rows] --> W2[5 rows + computed value]
    end
\`\`\`

### Sample Data

\`\`\`sql
CREATE TABLE sales (
    id INT PRIMARY KEY,
    employee VARCHAR(50),
    department VARCHAR(30),
    amount DECIMAL(10,2),
    sale_date DATE
);

INSERT INTO sales VALUES
(1, 'Nguyen A', 'North', 15000, '2024-01-05'),
(2, 'Tran B', 'North', 22000, '2024-01-12'),
(3, 'Le C', 'South', 18000, '2024-01-08'),
(4, 'Nguyen A', 'North', 19000, '2024-01-20'),
(5, 'Pham D', 'South', 25000, '2024-01-15'),
(6, 'Tran B', 'North', 17000, '2024-02-03'),
(7, 'Le C', 'South', 21000, '2024-02-10'),
(8, 'Nguyen A', 'North', 23000, '2024-02-15'),
(9, 'Pham D', 'South', 16000, '2024-02-20'),
(10, 'Hoang E', 'South', 28000, '2024-02-25');
\`\`\`

## Cu phap OVER()

\`\`\`sql
-- OVER() khong co tham so = toan bo tap ket qua la window
SELECT employee, amount,
       SUM(amount) OVER() AS total_sales,
       ROUND(amount / SUM(amount) OVER() * 100, 1) AS pct_of_total
FROM sales;

-- PARTITION BY - chia thanh nhom (window)
SELECT employee, department, amount,
       SUM(amount) OVER(PARTITION BY department) AS dept_total,
       ROUND(amount / SUM(amount) OVER(PARTITION BY department) * 100, 1) AS pct_of_dept
FROM sales;

-- ORDER BY trong OVER - tao running/cumulative
SELECT employee, sale_date, amount,
       SUM(amount) OVER(ORDER BY sale_date) AS running_total
FROM sales;
\`\`\`

## Ranking Functions

### ROW_NUMBER, RANK, DENSE_RANK

\`\`\`sql
SELECT employee, department, amount,
    ROW_NUMBER() OVER(ORDER BY amount DESC) AS row_num,
    RANK()       OVER(ORDER BY amount DESC) AS rank,
    DENSE_RANK() OVER(ORDER BY amount DESC) AS dense_rank
FROM sales;
\`\`\`

\`\`\`text
-- Ket qua (gom ket qua chung amount = 15000 de minh hoa):
-- employee | amount | row_num | rank | dense_rank
-- Hoang E  | 28000  | 1       | 1    | 1
-- Pham D   | 25000  | 2       | 2    | 2
-- Nguyen A | 23000  | 3       | 3    | 3
-- Tran B   | 22000  | 4       | 4    | 4
-- Le C     | 21000  | 5       | 5    | 5
-- Nguyen A | 19000  | 6       | 6    | 6
-- Le C     | 18000  | 7       | 7    | 7
-- Tran B   | 17000  | 8       | 8    | 8
-- Pham D   | 16000  | 9       | 9    | 9
-- Nguyen A | 15000  | 10      | 10   | 10
\`\`\`

### Su khac biet khi co gia tri bang nhau

\`\`\`text
-- Gia su co 2 nguoi cung 25000:
-- amount | ROW_NUMBER | RANK | DENSE_RANK
-- 28000  | 1          | 1    | 1
-- 25000  | 2          | 2    | 2      <-- ROW_NUMBER: khac nhau
-- 25000  | 3          | 2    | 2      <-- RANK: bo qua 3
-- 23000  | 4          | 4    | 3      <-- DENSE_RANK: khong bo qua
\`\`\`

### NTILE - Chia thanh N nhom

\`\`\`sql
-- Chia sales thanh 4 nhom (quartiles)
SELECT employee, amount,
       NTILE(4) OVER(ORDER BY amount DESC) AS quartile
FROM sales;
-- Quartile 1: Top 25%, Quartile 4: Bottom 25%
\`\`\`

## Top-N per Group

\`\`\`sql
-- Top 2 sales cho moi department
WITH ranked_sales AS (
    SELECT employee, department, amount,
           ROW_NUMBER() OVER(
               PARTITION BY department
               ORDER BY amount DESC
           ) AS rn
    FROM sales
)
SELECT employee, department, amount
FROM ranked_sales
WHERE rn <= 2;

-- Ket qua:
-- employee | department | amount
-- Nguyen A | North      | 23000
-- Tran B   | North      | 22000
-- Hoang E  | South      | 28000
-- Pham D   | South      | 25000
\`\`\`

## LAG va LEAD

\`\`\`sql
-- LAG: lay gia tri cua dong truoc
-- LEAD: lay gia tri cua dong sau
SELECT employee, sale_date, amount,
    LAG(amount, 1) OVER(ORDER BY sale_date) AS prev_amount,
    LEAD(amount, 1) OVER(ORDER BY sale_date) AS next_amount,
    amount - LAG(amount, 1) OVER(ORDER BY sale_date) AS change
FROM sales
ORDER BY sale_date;

-- LAG/LEAD theo partition
SELECT employee, sale_date, amount,
    LAG(amount) OVER(PARTITION BY employee ORDER BY sale_date) AS prev_sale,
    amount - LAG(amount) OVER(PARTITION BY employee ORDER BY sale_date) AS growth
FROM sales
ORDER BY employee, sale_date;
\`\`\`

### LAG/LEAD voi gia tri mac dinh

\`\`\`sql
-- Tham so thu 3: gia tri mac dinh khi khong co dong truoc/sau
SELECT employee, sale_date, amount,
    LAG(amount, 1, 0) OVER(
        PARTITION BY employee ORDER BY sale_date
    ) AS prev_amount
FROM sales;
\`\`\`

## FIRST_VALUE va LAST_VALUE

\`\`\`sql
SELECT employee, department, amount,
    FIRST_VALUE(employee) OVER(
        PARTITION BY department ORDER BY amount DESC
    ) AS top_performer,
    FIRST_VALUE(amount) OVER(
        PARTITION BY department ORDER BY amount DESC
    ) AS top_amount,
    amount - FIRST_VALUE(amount) OVER(
        PARTITION BY department ORDER BY amount DESC
    ) AS diff_from_top
FROM sales;
\`\`\`

> ⚠️ Luu y: LAST_VALUE thuong tra ve gia tri khong mong muon vi frame mac dinh la ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. Can chi dinh ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.

## Aggregate Window Functions

\`\`\`sql
-- Running total, running average
SELECT sale_date, amount,
    SUM(amount) OVER(ORDER BY sale_date) AS running_total,
    ROUND(AVG(amount) OVER(ORDER BY sale_date), 0) AS running_avg,
    COUNT(*) OVER(ORDER BY sale_date) AS running_count
FROM sales;

-- Moving average (3-day window)
SELECT sale_date, amount,
    ROUND(AVG(amount) OVER(
        ORDER BY sale_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 0) AS moving_avg_3
FROM sales;
\`\`\`

## Frame Specification: ROWS vs RANGE

\`\`\`sql
-- Cu phap day du:
-- function OVER(
--     PARTITION BY ...
--     ORDER BY ...
--     ROWS|RANGE BETWEEN frame_start AND frame_end
-- )

-- Frame bounds:
-- UNBOUNDED PRECEDING    = tu dong dau tien
-- n PRECEDING             = n dong truoc
-- CURRENT ROW            = dong hien tai
-- n FOLLOWING             = n dong sau
-- UNBOUNDED FOLLOWING    = den dong cuoi cung
\`\`\`

### Vi du ROWS vs RANGE

\`\`\`sql
-- ROWS: dem theo vi tri dong vat ly
SELECT sale_date, amount,
    SUM(amount) OVER(
        ORDER BY sale_date
        ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
    ) AS sum_rows
FROM sales;
-- Gom: dong truoc + dong hien tai + dong sau (3 dong)

-- RANGE: dem theo gia tri logic
SELECT sale_date, amount,
    SUM(amount) OVER(
        ORDER BY sale_date
        RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW
    ) AS sum_7_days
FROM sales;
-- Gom: tat ca dong trong 7 ngay truoc + dong hien tai
\`\`\`

| Frame Type | Y nghia | Use case |
|------------|---------|----------|
| **ROWS** | Dem theo so dong vat ly | Moving average N dong |
| **RANGE** | Dem theo gia tri | Tong trong khoang thoi gian |
| **GROUPS** | Dem theo nhom gia tri bang nhau | Nhom cac gia tri trung lap |

## Practical: Gaps and Islands

\`\`\`sql
-- Tim chuoi ngay lien tiep co sale
WITH numbered AS (
    SELECT sale_date,
           sale_date - ROW_NUMBER() OVER(ORDER BY sale_date)::INT * INTERVAL '1 day' AS grp
    FROM (SELECT DISTINCT sale_date FROM sales) s
)
SELECT MIN(sale_date) AS island_start,
       MAX(sale_date) AS island_end,
       MAX(sale_date) - MIN(sale_date) + 1 AS duration_days
FROM numbered
GROUP BY grp
ORDER BY island_start;
\`\`\`

## Named Window

\`\`\`sql
-- WINDOW clause de tai su dung window definition
SELECT employee, department, amount,
    SUM(amount) OVER dept_window AS dept_total,
    AVG(amount) OVER dept_window AS dept_avg,
    RANK() OVER dept_window AS dept_rank
FROM sales
WINDOW dept_window AS (PARTITION BY department ORDER BY amount DESC);
\`\`\`

> ⚠️ Luu y: Window functions chi co the dung trong SELECT va ORDER BY. Khong the dung trong WHERE, GROUP BY, hay HAVING. Dung CTE/subquery neu can loc theo ket qua window function.
    `
  },
  {
    id: 5,
    title: "Data Definition Language (DDL)",
    desc: "CREATE TABLE, constraints, ALTER TABLE, va cac lenh dinh nghia cau truc database",
    content: `
## DDL - Data Definition Language

DDL la nhom cac lenh SQL dung de **dinh nghia va thay doi cau truc** cua database objects: tables, indexes, views, schemas.

\`\`\`mermaid
graph TD
    DDL[DDL Commands]
    DDL --> CREATE[CREATE<br/>Tao moi]
    DDL --> ALTER[ALTER<br/>Thay doi]
    DDL --> DROP[DROP<br/>Xoa]
    DDL --> TRUNCATE[TRUNCATE<br/>Xoa toan bo data]
    DDL --> RENAME[RENAME<br/>Doi ten]
\`\`\`

## CREATE TABLE

### Cu phap co ban

\`\`\`sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    age INT CHECK (age >= 0 AND age <= 150),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Data Types pho bien

| Type | PostgreSQL | MySQL | Mo ta |
|------|-----------|-------|-------|
| **Integer** | INT, BIGINT, SMALLINT | INT, BIGINT, TINYINT | So nguyen |
| **Decimal** | DECIMAL(p,s), NUMERIC | DECIMAL(p,s) | So thap phan chinh xac |
| **Float** | REAL, DOUBLE PRECISION | FLOAT, DOUBLE | So thap phan xap xi |
| **String** | VARCHAR(n), TEXT | VARCHAR(n), TEXT | Chuoi ky tu |
| **Boolean** | BOOLEAN | BOOLEAN (TINYINT(1)) | True/False |
| **Date/Time** | DATE, TIME, TIMESTAMP | DATE, TIME, DATETIME | Ngay gio |
| **JSON** | JSON, JSONB | JSON | Du lieu JSON |
| **UUID** | UUID | CHAR(36) | Dinh danh duy nhat |
| **Binary** | BYTEA | BLOB | Du lieu nhi phan |
| **Array** | INT[], TEXT[] | Khong co native | Mang (PostgreSQL) |

## Constraints - Rang buoc

### NOT NULL

\`\`\`sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,  -- bat buoc co gia tri
    price DECIMAL(10,2) NOT NULL,
    description TEXT              -- co the NULL
);
\`\`\`

### UNIQUE

\`\`\`sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE,              -- unique 1 cot
    ssn VARCHAR(20) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    department_id INT,
    UNIQUE(first_name, last_name, department_id)  -- composite unique
);
\`\`\`

### CHECK

\`\`\`sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    quantity INT CHECK (quantity > 0),
    unit_price DECIMAL(10,2) CHECK (unit_price >= 0),
    discount DECIMAL(5,2) CHECK (discount >= 0 AND discount <= 100),
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    order_date DATE CHECK (order_date <= CURRENT_DATE),
    delivery_date DATE,
    -- Table-level check: delivery sau order
    CONSTRAINT chk_dates CHECK (delivery_date IS NULL OR delivery_date >= order_date)
);
\`\`\`

### DEFAULT

\`\`\`sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) DEFAULT '0.0.0.0',
    is_successful BOOLEAN DEFAULT TRUE
);
\`\`\`

## PRIMARY KEY - Natural vs Surrogate

### Natural Key

\`\`\`sql
-- Natural key: su dung gia tri co san co y nghia kinh doanh
CREATE TABLE countries (
    country_code CHAR(2) PRIMARY KEY,  -- ISO 3166-1 alpha-2
    name VARCHAR(100) NOT NULL
);
-- VD: 'VN', 'US', 'JP'
\`\`\`

### Surrogate Key

\`\`\`sql
-- Surrogate key: gia tri tu dong sinh, khong co y nghia kinh doanh
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,        -- auto-increment
    email VARCHAR(100) NOT NULL UNIQUE
);

-- UUID lam primary key
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL
);
\`\`\`

| Tieu chi | Natural Key | Surrogate Key |
|----------|-------------|---------------|
| **Y nghia** | Co y nghia kinh doanh | Khong co y nghia |
| **Thay doi** | Co the thay doi (rui ro!) | Khong bao gio thay doi |
| **Kich thuoc** | Thuong lon (VARCHAR) | Nho (INT, BIGINT) |
| **Performance** | Cham hon cho JOIN | Nhanh hon cho JOIN |
| **Khi nao dung** | Stable, don gian (country code) | Hau het cac truong hop |

## FOREIGN KEY

\`\`\`sql
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dept_id INT,

    -- Foreign key voi cac hanh vi khac nhau
    CONSTRAINT fk_department
        FOREIGN KEY (dept_id)
        REFERENCES departments(id)
        ON DELETE SET NULL      -- Khi department bi xoa, set dept_id = NULL
        ON UPDATE CASCADE       -- Khi department.id thay doi, tu dong cap nhat
);
\`\`\`

### Referential Actions

| Action | ON DELETE | ON UPDATE | Mo ta |
|--------|-----------|-----------|-------|
| **CASCADE** | Xoa employee theo | Cap nhat FK theo | Tu dong lan truyen |
| **SET NULL** | Set FK = NULL | Set FK = NULL | Giu ban ghi, xoa lien ket |
| **SET DEFAULT** | Set FK = default | Set FK = default | Dung gia tri mac dinh |
| **RESTRICT** | Chan xoa parent | Chan update parent | Bao ve toan ven (mac dinh) |
| **NO ACTION** | Tuong tu RESTRICT | Tuong tu RESTRICT | Kiem tra cuoi transaction |

\`\`\`sql
-- Vi du CASCADE: Xoa department xoa tat ca employees
CREATE TABLE emp_cascade (
    id SERIAL PRIMARY KEY,
    dept_id INT REFERENCES departments(id) ON DELETE CASCADE
);

-- Vi du RESTRICT: Khong cho xoa department co employees
CREATE TABLE emp_restrict (
    id SERIAL PRIMARY KEY,
    dept_id INT REFERENCES departments(id) ON DELETE RESTRICT
);
\`\`\`

> ⚠️ Luu y: Can than voi ON DELETE CASCADE - co the xoa du lieu hang loat ngoai y muon. Nen dung RESTRICT cho production va xu ly xoa thu cong.

## ALTER TABLE

\`\`\`sql
-- Them cot
ALTER TABLE employees ADD COLUMN phone VARCHAR(20);

-- Xoa cot
ALTER TABLE employees DROP COLUMN phone;

-- Doi ten cot
ALTER TABLE employees RENAME COLUMN name TO full_name;

-- Thay doi kieu du lieu
ALTER TABLE employees ALTER COLUMN full_name TYPE VARCHAR(200);

-- Them/Xoa NOT NULL
ALTER TABLE employees ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE employees ALTER COLUMN full_name DROP NOT NULL;

-- Them/Xoa DEFAULT
ALTER TABLE employees ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE employees ALTER COLUMN status DROP DEFAULT;

-- Them constraint
ALTER TABLE employees ADD CONSTRAINT chk_salary CHECK (salary > 0);

-- Xoa constraint
ALTER TABLE employees DROP CONSTRAINT chk_salary;

-- Them foreign key
ALTER TABLE employees
    ADD CONSTRAINT fk_dept
    FOREIGN KEY (dept_id) REFERENCES departments(id);

-- Doi ten bang
ALTER TABLE employees RENAME TO staff;
\`\`\`

## CREATE INDEX

\`\`\`sql
-- Index don cot
CREATE INDEX idx_employees_dept ON employees(dept_id);

-- Composite index
CREATE INDEX idx_employees_dept_salary ON employees(dept_id, salary);

-- Unique index
CREATE UNIQUE INDEX idx_employees_email ON employees(email);

-- Partial index (PostgreSQL)
CREATE INDEX idx_active_employees
ON employees(dept_id)
WHERE status = 'active';

-- Expression index
CREATE INDEX idx_employees_lower_email
ON employees(LOWER(email));

-- Xoa index
DROP INDEX idx_employees_dept;

-- Xem indexes cua bang (PostgreSQL)
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'employees';
\`\`\`

## TRUNCATE vs DELETE

\`\`\`sql
-- DELETE: xoa tung dong, co the WHERE, ghi log, co the rollback
DELETE FROM employees WHERE dept_id = 1;

-- TRUNCATE: xoa TOAN BO, nhanh hon, reset auto-increment
TRUNCATE TABLE employees;

-- TRUNCATE CASCADE: xoa ca bang con co FK
TRUNCATE TABLE departments CASCADE;
\`\`\`

| Tieu chi | DELETE | TRUNCATE |
|----------|--------|----------|
| **WHERE** | Co | Khong |
| **Toc do** | Cham (tung dong) | Nhanh (xoa toan bo) |
| **Transaction log** | Ghi tung dong | Ghi toi thieu |
| **Trigger** | Fire triggers | Khong fire (thuong) |
| **Auto-increment** | Giu nguyen | Reset |
| **Rollback** | Co the | Tuy database |
| **FK constraint** | Kiem tra | Can CASCADE |
    `
  },
  {
    id: 6,
    title: "Indexing Deep Dive",
    desc: "B-Tree, Clustered/Non-clustered, Composite Index, EXPLAIN plan - toi uu truy van bang index",
    content: `
## Index la gi?

**Index** la cau truc du lieu giup database tim kiem nhanh hon - giong nhu muc luc cua mot cuon sach. Thay vi doc toan bo sach (Full Table Scan), ban tra muc luc (Index Scan) de tim trang can.

\`\`\`mermaid
graph LR
    subgraph "Khong co Index - Full Scan"
        FS[Doc tung dong<br/>O n]
    end
    subgraph "Co Index - Index Scan"
        IS[Tra cuu index<br/>O log n]
    end
    FS -.->|Cham| R1[Ket qua]
    IS -.->|Nhanh| R2[Ket qua]
\`\`\`

## B-Tree Index

B-Tree (Balanced Tree) la loai index **phap bien nhat**, mac dinh cho hau het database.

\`\`\`mermaid
graph TD
    R[Root Node<br/>50]
    R --> L1[Internal Node<br/>20, 35]
    R --> L2[Internal Node<br/>65, 80]
    L1 --> LL1[Leaf<br/>5, 10, 15]
    L1 --> LL2[Leaf<br/>20, 25, 30]
    L1 --> LL3[Leaf<br/>35, 40, 45]
    L2 --> LL4[Leaf<br/>50, 55, 60]
    L2 --> LL5[Leaf<br/>65, 70, 75]
    L2 --> LL6[Leaf<br/>80, 85, 90]
    LL1 --> LL2
    LL2 --> LL3
    LL3 --> LL4
    LL4 --> LL5
    LL5 --> LL6
    style R fill:#ef4444,color:#fff
    style L1 fill:#f97316,color:#fff
    style L2 fill:#f97316,color:#fff
\`\`\`

### Dac diem B-Tree

- **Balanced**: Moi path tu root den leaf co cung do dai -> O(log n)
- **Sorted**: Du lieu trong leaf nodes duoc sap xep -> tot cho range queries
- **Linked leaves**: Cac leaf node lien ket nhau -> sequential scan hieu qua

### B-Tree ho tro tot cac loai truy van

\`\`\`sql
-- Equality: O(log n)
SELECT * FROM users WHERE id = 42;

-- Range: O(log n + k) voi k la so ket qua
SELECT * FROM users WHERE age BETWEEN 20 AND 30;

-- Prefix LIKE: O(log n + k)
SELECT * FROM users WHERE name LIKE 'Nguyen%';

-- ORDER BY: khong can sort them
SELECT * FROM users ORDER BY age ASC;

-- MIN/MAX: O(log n) - chi can doc dau/cuoi leaf
SELECT MIN(age), MAX(age) FROM users;
\`\`\`

## Clustered vs Non-Clustered Index

\`\`\`mermaid
graph TD
    subgraph "Clustered Index"
        CI[Index + Data<br/>Du lieu sap xep theo index]
        CI --> CD1[Row 1, Row 2, Row 3]
        CI --> CD2[Row 4, Row 5, Row 6]
    end
    subgraph "Non-Clustered Index"
        NCI[Index -> Pointer]
        NCI --> P1[Pointer -> Row 5]
        NCI --> P2[Pointer -> Row 2]
        NCI --> P3[Pointer -> Row 8]
    end
\`\`\`

| Tieu chi | Clustered Index | Non-Clustered Index |
|----------|----------------|---------------------|
| **Du lieu** | Luu truc tiep trong index | Index tro den du lieu |
| **So luong/bang** | Chi 1 | Nhieu (thuong <= 10-15) |
| **Toc do doc** | Nhanh hon (khong can lookup) | Can them bookmark lookup |
| **Toc do ghi** | Cham hon (phai sap xep lai) | Nhanh hon |
| **Kich thuoc** | Bang chinh la index | Them bo nho cho index |
| **PostgreSQL** | Khong co (dung CLUSTER command) | Mac dinh |
| **MySQL InnoDB** | PRIMARY KEY | Secondary indexes |

\`\`\`sql
-- MySQL: PRIMARY KEY la clustered index
CREATE TABLE users (
    id INT PRIMARY KEY,      -- Clustered index
    email VARCHAR(100),
    name VARCHAR(100)
);
CREATE INDEX idx_email ON users(email);  -- Non-clustered

-- PostgreSQL: CLUSTER de sap xep du lieu theo index (1 lan)
CREATE INDEX idx_users_email ON users(email);
CLUSTER users USING idx_users_email;
\`\`\`

## Composite Index (Multi-Column Index)

\`\`\`sql
-- Composite index tren (department, salary, hire_date)
CREATE INDEX idx_dept_sal_date
ON employees(department, salary, hire_date);
\`\`\`

### Leftmost Prefix Rule

Composite index chi hieu qua khi query su dung **cac cot tu trai sang phai**.

\`\`\`sql
-- Su dung DUOC index (department, salary, hire_date):
WHERE department = 'Engineering'                            -- dung cot 1
WHERE department = 'Engineering' AND salary > 80000         -- dung cot 1,2
WHERE department = 'Engineering' AND salary > 80000         -- dung cot 1,2,3
      AND hire_date > '2020-01-01'

-- KHONG su dung duoc index:
WHERE salary > 80000                     -- bo qua cot 1
WHERE hire_date > '2020-01-01'           -- bo qua cot 1,2
WHERE salary > 80000 AND hire_date > '2020-01-01'  -- bo qua cot 1
\`\`\`

> ⚠️ Luu y: Thu tu cot trong composite index RAT QUAN TRONG. Dat cot co selectivity cao (nhieu gia tri khac nhau) va dung nhieu nhat len truoc.

## Covering Index

**Covering index** chua tat ca cot ma query can, khong can quay lai bang de lay du lieu (index-only scan).

\`\`\`sql
-- Query can: department, salary, name
SELECT department, salary, name
FROM employees
WHERE department = 'Engineering' AND salary > 80000;

-- Covering index: INCLUDE cac cot khong dung cho filter
CREATE INDEX idx_covering
ON employees(department, salary)
INCLUDE (name);  -- PostgreSQL 11+

-- MySQL: khong co INCLUDE, them cot vao index
CREATE INDEX idx_covering
ON employees(department, salary, name);
\`\`\`

\`\`\`text
-- EXPLAIN voi covering index:
-- Index Only Scan using idx_covering on employees
--   Index Cond: (department = 'Engineering' AND salary > 80000)
-- (Khong co "Heap Fetches" hoac rat it)
\`\`\`

## Cac loai Index dac biet

### Hash Index

\`\`\`sql
-- Chi ho tro equality (=), khong ho tro range
CREATE INDEX idx_hash_email ON users USING HASH (email);

-- Tot cho: WHERE email = 'abc@xyz.com'
-- Khong tot cho: WHERE email LIKE 'abc%'
\`\`\`

### GIN (Generalized Inverted Index) - PostgreSQL

\`\`\`sql
-- Tot cho: full-text search, JSONB, arrays
CREATE INDEX idx_gin_tags ON articles USING GIN (tags);
CREATE INDEX idx_gin_data ON events USING GIN (metadata jsonb_path_ops);

-- Query su dung GIN
SELECT * FROM articles WHERE tags @> ARRAY['sql', 'postgres'];
SELECT * FROM events WHERE metadata @> '{"type": "click"}';
\`\`\`

### GiST (Generalized Search Tree) - PostgreSQL

\`\`\`sql
-- Tot cho: geometric data, range types, full-text search
CREATE INDEX idx_gist_location ON stores USING GiST (location);
CREATE INDEX idx_gist_tsv ON articles USING GiST (to_tsvector('english', content));
\`\`\`

### Partial Index

\`\`\`sql
-- Chi index cac dong thoa dieu kien
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;

-- Nho hon full index, nhanh hon cho query cu the
-- Chi co tac dung khi WHERE co dieu kien tuong ung
SELECT * FROM users WHERE is_active = true AND email = 'abc@xyz.com';
\`\`\`

### Expression Index

\`\`\`sql
-- Index tren bieu thuc
CREATE INDEX idx_lower_email ON users(LOWER(email));
CREATE INDEX idx_year_created ON orders(EXTRACT(YEAR FROM created_at));

-- Query phai match bieu thuc CHINH XAC
SELECT * FROM users WHERE LOWER(email) = 'abc@xyz.com';  -- dung index
SELECT * FROM users WHERE email = 'abc@xyz.com';          -- KHONG dung index tren
\`\`\`

## EXPLAIN - Doc Execution Plan

\`\`\`sql
-- PostgreSQL: EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT e.name, d.name
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE e.salary > 80000;
\`\`\`

\`\`\`text
-- Output vi du:
Hash Join  (cost=1.07..2.15 rows=2 width=64) (actual time=0.045..0.051 rows=3 loops=1)
  Hash Cond: (e.dept_id = d.id)
  ->  Seq Scan on employees e  (cost=0.00..1.05 rows=2 width=40) (actual time=0.012..0.015 rows=3 loops=1)
        Filter: (salary > 80000)
        Rows Removed by Filter: 7
  ->  Hash  (cost=1.04..1.04 rows=3 width=36) (actual time=0.010..0.011 rows=3 loops=1)
        Buckets: 1024  Batches: 1  Memory Usage: 9kB
        ->  Seq Scan on departments d  (cost=0.00..1.04 rows=3 width=36) (actual time=0.004..0.005 rows=3 loops=1)
Planning Time: 0.185 ms
Execution Time: 0.080 ms
\`\`\`

### Cac node type quan trong

| Node Type | Mo ta | Khi nao xuat hien |
|-----------|-------|--------------------|
| **Seq Scan** | Doc toan bo bang | Khong co index phu hop |
| **Index Scan** | Dung index + lay du lieu tu bang | Co index, can nhieu cot |
| **Index Only Scan** | Chi dung index | Covering index |
| **Bitmap Index Scan** | Ket hop nhieu index | Nhieu dieu kien OR |
| **Hash Join** | Join bang hash table | Large tables, equality join |
| **Nested Loop** | Join bang nested loop | Small tables, co index |
| **Merge Join** | Join bang merge sorted | Sorted data |
| **Sort** | Sap xep du lieu | ORDER BY khong co index |

## Best Practices

1. **Index cac cot trong WHERE, JOIN, ORDER BY** - nhung KHONG index moi cot
2. **Composite index** theo thu tu selectivity giam dan
3. **Covering index** cho hot queries
4. **Partial index** khi chi query mot subset du lieu
5. **Theo doi index usage** - xoa index khong su dung

\`\`\`sql
-- PostgreSQL: Tim index khong su dung
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
\`\`\`

> ⚠️ Luu y: Moi index lam CHAM viec ghi (INSERT, UPDATE, DELETE) vi phai cap nhat index. Dung them index chi khi thuc su can thiet cho query performance.
    `
  },
  {
    id: 7,
    title: "ACID Properties Fundamentals",
    desc: "Atomicity, Consistency, Isolation, Durability - nen tang cua transaction trong database",
    content: `
## ACID la gi?

**ACID** la 4 thuoc tinh dam bao **tinh toan ven cua transactions** trong database. Khong co ACID, du lieu co the bi hong, mat, hoac khong nhat quan.

\`\`\`mermaid
graph TD
    ACID[ACID Properties]
    ACID --> A[Atomicity<br/>All or Nothing]
    ACID --> C[Consistency<br/>Valid State Only]
    ACID --> I[Isolation<br/>Concurrent Safety]
    ACID --> D[Durability<br/>Permanent Once Committed]
    style ACID fill:#3b82f6,color:#fff
    style A fill:#ef4444,color:#fff
    style C fill:#22c55e,color:#fff
    style I fill:#f59e0b,color:#fff
    style D fill:#8b5cf6,color:#fff
\`\`\`

## Transaction la gi?

**Transaction** la mot don vi cong viec logic gom nhieu operations duoc xu ly nhu **mot khoi duy nhat**.

\`\`\`sql
-- Vi du kinh dien: Chuyen tien
BEGIN TRANSACTION;

-- Buoc 1: Tru tien tai khoan A
UPDATE accounts SET balance = balance - 1000000
WHERE account_id = 'A';

-- Buoc 2: Cong tien tai khoan B
UPDATE accounts SET balance = balance + 1000000
WHERE account_id = 'B';

-- Buoc 3: Ghi log giao dich
INSERT INTO transactions (from_acc, to_acc, amount, created_at)
VALUES ('A', 'B', 1000000, NOW());

COMMIT;  -- Tat ca thanh cong -> luu
-- hoac ROLLBACK;  -- Co loi -> huy tat ca
\`\`\`

## Atomicity - Tat ca hoac Khong gi

**Atomicity** dam bao: Moi operation trong transaction DIEU thanh cong, hoac KHONG operation nao duoc thuc hien.

\`\`\`mermaid
graph LR
    subgraph "Atomicity"
        T1[Transaction] --> S1[Step 1: Tru tien A<br/>OK]
        S1 --> S2[Step 2: Cong tien B<br/>FAIL!]
        S2 --> RB[ROLLBACK<br/>Huy Step 1]
    end
    style RB fill:#ef4444,color:#fff
\`\`\`

### Cach database dam bao Atomicity

\`\`\`sql
-- Vi du: Neu buoc 2 that bai
BEGIN;
UPDATE accounts SET balance = balance - 1000000 WHERE account_id = 'A';
-- -> Thanh cong, balance A giam 1 trieu

UPDATE accounts SET balance = balance + 1000000 WHERE account_id = 'B';
-- -> THAT BAI! (vi du: B khong ton tai, constraint violation)

ROLLBACK;
-- -> Tu dong huy buoc 1, balance A tro ve nhu cu
\`\`\`

\`\`\`sql
-- SAVEPOINT: rollback mot phan
BEGIN;
INSERT INTO orders (id, total) VALUES (1, 500000);

SAVEPOINT sp1;
INSERT INTO order_items (order_id, product_id) VALUES (1, 999);
-- Loi: product 999 khong ton tai

ROLLBACK TO SAVEPOINT sp1;
-- Chi huy insert order_items, giu lai insert orders

INSERT INTO order_items (order_id, product_id) VALUES (1, 100);
COMMIT;
\`\`\`

## Consistency - Tinh nhat quan

**Consistency** dam bao: Transaction chi dua database tu **trang thai hop le nay** sang **trang thai hop le khac**. Moi constraint, rule, trigger phai duoc thoa man.

\`\`\`sql
-- Vi du: Kiem tra tong balance truoc va sau transaction phai bang nhau
-- Truoc: A=5000000, B=3000000, Tong=8000000

BEGIN;
UPDATE accounts SET balance = balance - 1000000 WHERE account_id = 'A';
-- A=4000000, B=3000000, Tong=7000000 (tam thoi khong nhat quan)

UPDATE accounts SET balance = balance + 1000000 WHERE account_id = 'B';
-- A=4000000, B=4000000, Tong=8000000 (nhat quan tro lai)
COMMIT;

-- Sau COMMIT: Tong van = 8000000 -> Consistency duoc dam bao
\`\`\`

### Consistency bao gom

1. **Entity integrity**: Primary key khong NULL, khong trung
2. **Referential integrity**: Foreign key hop le
3. **Domain integrity**: Gia tri trong pham vi cho phep (CHECK)
4. **User-defined rules**: Business logic tu dinh nghia

\`\`\`sql
-- Database tu dong chan neu vi pham constraint
BEGIN;
UPDATE accounts SET balance = balance - 10000000 WHERE account_id = 'A';
-- Neu co CHECK (balance >= 0) va A chi co 5000000
-- -> Error: CHECK constraint violation
-- -> Transaction ROLLBACK tu dong
\`\`\`

## Isolation - Cach ly giao dich dong thoi

**Isolation** dam bao: Cac transactions chay dong thoi **khong anh huong** lan nhau. Ket qua phai nhu the chung chay **tuan tu**.

\`\`\`mermaid
sequenceDiagram
    participant T1 as Transaction 1
    participant DB as Database
    participant T2 as Transaction 2

    T1->>DB: BEGIN
    T2->>DB: BEGIN
    T1->>DB: READ balance A = 5000
    T2->>DB: READ balance A = 5000
    T1->>DB: UPDATE A = A - 1000
    Note over DB: T1 thay A = 4000
    T2->>DB: UPDATE A = A - 2000
    Note over DB: T2 thay A = 3000?<br/>hay A = 2000?
    T1->>DB: COMMIT
    T2->>DB: COMMIT
\`\`\`

### Cac van de khi thieu Isolation (se hoc chi tiet o bai 8)

| Van de | Mo ta |
|--------|-------|
| **Dirty Read** | Doc du lieu chua COMMIT cua transaction khac |
| **Non-Repeatable Read** | Doc 2 lan cho ket qua khac nhau |
| **Phantom Read** | Query 2 lan thay so dong khac nhau |
| **Lost Update** | 2 transaction ghi de ket qua cua nhau |

## Durability - Ben vung

**Durability** dam bao: Khi transaction da **COMMIT thanh cong**, du lieu se **KHONG BAO GIO bi mat** - ke ca khi mat dien, crash, loi phan cung.

### Write-Ahead Logging (WAL)

WAL la co che chinh de dam bao Durability: **Ghi log TRUOC khi ghi du lieu**.

\`\`\`mermaid
sequenceDiagram
    participant App as Application
    participant DB as Database Engine
    participant WAL as WAL Log (Disk)
    participant Data as Data Files (Disk)

    App->>DB: UPDATE balance = 4000
    DB->>WAL: 1. Ghi WAL record (truoc)
    Note over WAL: LSN: 100<br/>old: 5000<br/>new: 4000
    WAL-->>DB: WAL flushed to disk
    DB->>App: COMMIT thanh cong
    Note over DB: Du lieu van o<br/>trong memory
    DB->>Data: 2. Ghi data files (sau - async)
    Note over Data: Checkpoint<br/>dinh ky
\`\`\`

### WAL hoat dong nhu the nao

\`\`\`text
1. Transaction thuc hien UPDATE
2. Database ghi THAY DOI vao WAL buffer (memory)
3. Khi COMMIT: flush WAL buffer ra DISK (fsync)
4. Tra ve "COMMIT success" cho application
5. Du lieu thuc te duoc ghi vao data files SAU DO (lazy/async)
6. Checkpoint dinh ky dong bo WAL voi data files

Neu crash xay ra:
- Truoc buoc 3: Transaction bi mat (chua commit) -> KHONG van de
- Sau buoc 3: WAL da tren disk -> Recovery doc WAL va replay
\`\`\`

### Tai sao WAL nhanh hon ghi truc tiep?

\`\`\`text
WAL writes:     Sequential I/O (append-only) -> NHANH
Data writes:    Random I/O (cap nhat nhieu noi) -> CHAM

Vi du: 1 transaction update 10 dong o 10 trang khac nhau
- Khong WAL: 10 random writes
- Co WAL: 1 sequential write (ghi tat ca thay doi vao WAL)
         + data writes duoc batch va ghi sau
\`\`\`

## Checkpoint va Recovery

\`\`\`mermaid
graph LR
    subgraph "WAL Timeline"
        CP1[Checkpoint 1] --> W1[WAL Record]
        W1 --> W2[WAL Record]
        W2 --> W3[WAL Record]
        W3 --> CP2[Checkpoint 2]
        CP2 --> W4[WAL Record]
        W4 --> W5[WAL Record]
        W5 --> CRASH[CRASH!]
    end
    CRASH --> REC[Recovery:<br/>Replay W4, W5]
    style CRASH fill:#ef4444,color:#fff
    style CP1 fill:#22c55e,color:#fff
    style CP2 fill:#22c55e,color:#fff
\`\`\`

### Recovery Process

\`\`\`text
1. Database khoi dong lai sau crash
2. Tim checkpoint cuoi cung (Checkpoint 2)
3. Doc WAL tu checkpoint cuoi
4. REDO: Replay cac thay doi da COMMIT nhung chua ghi vao data files
5. UNDO: Huy cac thay doi CHUA COMMIT
6. Database tro ve trang thai nhat quan
\`\`\`

\`\`\`sql
-- PostgreSQL: Cau hinh WAL
-- postgresql.conf

-- Kich thuoc WAL segment
-- wal_segment_size = 16MB

-- So WAL files giu lai
-- min_wal_size = 1GB
-- max_wal_size = 4GB

-- Tan suat checkpoint
-- checkpoint_timeout = 5min
-- checkpoint_completion_target = 0.9

-- Synchronous commit (dam bao durability)
SET synchronous_commit = on;  -- Mac dinh: on

-- Co the tat de tang performance (mat durability cho 1 so transaction)
SET synchronous_commit = off;
-- Du lieu co the mat trong ~600ms (wal_writer_delay * 3)
\`\`\`

> ⚠️ Luu y: Tat synchronous_commit tang performance nhung co the mat du lieu cua transaction gan nhat khi crash. Chi nen dung cho du lieu khong critical (logs, metrics).

## Tong ket ACID

| Property | Dam bao | Co che | Vi du |
|----------|---------|--------|-------|
| **Atomicity** | All or nothing | Undo log / WAL | Chuyen tien: ca 2 buoc hoac khong buoc nao |
| **Consistency** | Valid state only | Constraints, triggers | Balance khong duoc am |
| **Isolation** | No interference | Locks, MVCC | 2 nguoi chuyen tien dong thoi |
| **Durability** | Permanent after commit | WAL, checkpoints | Mat dien van giu du lieu |

\`\`\`mermaid
graph TD
    subgraph "ACID dam bao Data Integrity"
        TX[Transaction]
        TX -->|Atomicity| UNDO[Undo/Redo Log]
        TX -->|Consistency| CONST[Constraints + Rules]
        TX -->|Isolation| MVCC[Locks + MVCC]
        TX -->|Durability| WAL[WAL + Checkpoint]
    end
\`\`\`
    `
  },
  {
    id: 8,
    title: "Transaction Isolation Levels",
    desc: "Read phenomena, 4 isolation levels, MVCC va Snapshot Isolation chi tiet",
    content: `
## Tai sao can Isolation Levels?

Khi nhieu transactions chay **dong thoi**, can **can bang** giua:
- **Data correctness** (isolation cao -> an toan hon)
- **Performance** (isolation cao -> cham hon, nhieu lock hon)

\`\`\`mermaid
graph LR
    RU[READ UNCOMMITTED<br/>Nhanh, it an toan] --> RC[READ COMMITTED<br/>Mac dinh PostgreSQL]
    RC --> RR[REPEATABLE READ<br/>Mac dinh MySQL InnoDB]
    RR --> SR[SERIALIZABLE<br/>An toan nhat, cham nhat]
    style RU fill:#ef4444,color:#fff
    style RC fill:#f59e0b,color:#fff
    style RR fill:#3b82f6,color:#fff
    style SR fill:#22c55e,color:#fff
\`\`\`

## Read Phenomena - Cac van de khi doc du lieu

### 1. Dirty Read

Doc du lieu **chua duoc COMMIT** tu transaction khac. Neu transaction do ROLLBACK, du lieu da doc la **sai**.

\`\`\`sql
-- Transaction 1                    -- Transaction 2
BEGIN;                              BEGIN;
UPDATE accounts
SET balance = 0
WHERE id = 1;
-- balance = 0 (chua commit)
                                    -- Dirty Read!
                                    SELECT balance FROM accounts
                                    WHERE id = 1;
                                    -- Doc duoc balance = 0
ROLLBACK;
-- balance tro ve gia tri cu
                                    -- Transaction 2 da dung gia tri SAI
                                    COMMIT;
\`\`\`

### 2. Non-Repeatable Read

Doc cung mot dong **2 lan** trong 1 transaction cho ket qua **khac nhau** vi transaction khac da UPDATE va COMMIT.

\`\`\`sql
-- Transaction 1                    -- Transaction 2
BEGIN;
SELECT balance FROM accounts
WHERE id = 1;
-- balance = 5000000
                                    BEGIN;
                                    UPDATE accounts
                                    SET balance = 3000000
                                    WHERE id = 1;
                                    COMMIT;

SELECT balance FROM accounts
WHERE id = 1;
-- balance = 3000000 (khac lan 1!)
COMMIT;
\`\`\`

### 3. Phantom Read

Query cung dieu kien **2 lan** thay **so dong khac nhau** vi transaction khac da INSERT/DELETE va COMMIT.

\`\`\`sql
-- Transaction 1                    -- Transaction 2
BEGIN;
SELECT COUNT(*) FROM employees
WHERE department = 'Engineering';
-- count = 5
                                    BEGIN;
                                    INSERT INTO employees (name, department)
                                    VALUES ('New Dev', 'Engineering');
                                    COMMIT;

SELECT COUNT(*) FROM employees
WHERE department = 'Engineering';
-- count = 6 (phantom row xuat hien!)
COMMIT;
\`\`\`

## 4 Isolation Levels

### READ UNCOMMITTED

\`\`\`sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
-- Cho phep doc du lieu chua commit cua transaction khac
-- Hau nhu KHONG dung trong thuc te
-- PostgreSQL: tuong duong READ COMMITTED (khong ho tro dirty read)
\`\`\`

### READ COMMITTED (Mac dinh PostgreSQL)

\`\`\`sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

BEGIN;
-- Moi lenh SELECT thay cac thay doi da COMMIT tai thoi diem SELECT chay
-- Giua 2 SELECT, neu co transaction khac COMMIT thi thay du lieu moi

SELECT * FROM accounts WHERE id = 1;  -- Thay snapshot tai thoi diem nay
-- Transaction khac commit thay doi...
SELECT * FROM accounts WHERE id = 1;  -- Thay snapshot MOI (co the khac)
COMMIT;
\`\`\`

### REPEATABLE READ (Mac dinh MySQL InnoDB)

\`\`\`sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

BEGIN;
-- Tat ca SELECT trong transaction thay CUNG MOT snapshot
-- Snapshot duoc tao tai thoi diem transaction bat dau (hoac SELECT dau tien)

SELECT * FROM accounts WHERE id = 1;  -- balance = 5000
-- Transaction khac thay doi balance va commit
SELECT * FROM accounts WHERE id = 1;  -- VAN thay balance = 5000
COMMIT;
\`\`\`

### SERIALIZABLE

\`\`\`sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Ket qua PHAI giong nhu cac transaction chay TUAN TU
-- Database su dung predicate locks hoac SSI (Serializable Snapshot Isolation)

BEGIN;
SELECT SUM(balance) FROM accounts;  -- tong = 10000000

-- Transaction khac co gang INSERT account moi
-- -> Bi BLOCK hoac ABORT

UPDATE accounts SET balance = balance + 100000 WHERE id = 1;
COMMIT;
\`\`\`

## Bang so sanh Isolation Levels

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Performance |
|----------------|------------|--------------------:|-------------:|-------------|
| **READ UNCOMMITTED** | Co the xay ra | Co the xay ra | Co the xay ra | Nhanh nhat |
| **READ COMMITTED** | Khong | Co the xay ra | Co the xay ra | Nhanh |
| **REPEATABLE READ** | Khong | Khong | Co the xay ra* | Trung binh |
| **SERIALIZABLE** | Khong | Khong | Khong | Cham nhat |

> ⚠️ Luu y: (*) Trong PostgreSQL, REPEATABLE READ thuc te KHONG co phantom read nho MVCC/Snapshot Isolation. Trong MySQL InnoDB, phantom read van co the xay ra voi mot so truong hop.

## MVCC - Multi-Version Concurrency Control

**MVCC** la co che cho phep nhieu transactions **doc du lieu dong thoi** ma khong can lock, bang cach giu **nhieu phien ban** cua du lieu.

\`\`\`mermaid
graph TD
    subgraph "MVCC - Nhieu phien ban cung ton tai"
        R1[Row v1<br/>balance=5000<br/>xmin=100, xmax=200]
        R2[Row v2<br/>balance=4000<br/>xmin=200, xmax=300]
        R3[Row v3<br/>balance=6000<br/>xmin=300, xmax=null]
    end
    T1[Transaction 150] -->|Thay| R1
    T2[Transaction 250] -->|Thay| R2
    T3[Transaction 350] -->|Thay| R3
\`\`\`

### MVCC trong PostgreSQL

\`\`\`text
PostgreSQL luu tru nhieu phien ban cua moi row:

Moi row co:
- xmin: Transaction ID da tao phien ban nay
- xmax: Transaction ID da xoa/update (tao phien ban moi)
- Combo ID + Snapshot info

Khi SELECT:
1. Xac dinh "snapshot" = danh sach cac transaction da commit
2. Tim phien ban row co xmin TRONG snapshot va xmax NGOAI snapshot
3. Tra ve phien ban do

Khi UPDATE:
1. KHONG overwrite row cu
2. Tao row MOI voi du lieu moi
3. Danh dau row cu bang xmax = current txid
4. VACUUM sau do don dep cac row cu khong ai can nua
\`\`\`

\`\`\`sql
-- Xem xmin, xmax cua row (PostgreSQL)
SELECT xmin, xmax, * FROM accounts WHERE id = 1;
-- xmin = 1234 (transaction tao/update gan nhat)
-- xmax = 0 (chua bi xoa/update boi transaction khac)
\`\`\`

### MVCC trong MySQL InnoDB

\`\`\`text
MySQL InnoDB su dung Undo Log cho MVCC:

Moi row co:
- DB_TRX_ID: Transaction ID sua cuoi cung
- DB_ROLL_PTR: Pointer tro den undo log (phien ban cu)

Khi can doc phien ban cu:
1. Theo DB_ROLL_PTR den undo log
2. Apply undo log nguoc lai de lay phien ban cu
3. Tiep tuc theo chuoi undo cho den phien ban can thiet

Khac PostgreSQL:
- PostgreSQL: Luu nhieu phien ban cung trong heap -> can VACUUM
- MySQL: Luu phien ban cu trong undo log -> tu dong cleanup
\`\`\`

## Snapshot Isolation (SI)

\`\`\`text
Snapshot Isolation la mot mo hinh isolation cu the:

1. Moi transaction nhan mot "snapshot" cua database tai thoi diem bat dau
2. Moi READ thay du lieu tu snapshot do (khong bi anh huong boi transaction khac)
3. Khi COMMIT:
   - Kiem tra Write-Write conflict
   - Neu 2 transactions update cung row -> transaction sau bi ABORT
   - Neu khong conflict -> COMMIT thanh cong

SI ngat chan: Dirty Read, Non-Repeatable Read, Phantom Read
SI KHONG ngan: Write Skew anomaly
\`\`\`

### Write Skew - Van de cua Snapshot Isolation

\`\`\`sql
-- Vi du: Quy tac: it nhat 1 bac si phai truc
-- Hien tai: Dr.A (on_call=true), Dr.B (on_call=true)

-- Transaction 1 (Dr.A)             -- Transaction 2 (Dr.B)
BEGIN;                               BEGIN;
SELECT COUNT(*) FROM doctors
WHERE on_call = true;
-- count = 2 (ca A va B)
                                     SELECT COUNT(*) FROM doctors
                                     WHERE on_call = true;
                                     -- count = 2 (ca A va B)

UPDATE doctors SET on_call = false
WHERE name = 'Dr.A';
-- "Con Dr.B truc, OK"
                                     UPDATE doctors SET on_call = false
                                     WHERE name = 'Dr.B';
                                     -- "Con Dr.A truc, OK"

COMMIT;                              COMMIT;
-- Ket qua: CA HAI off_call! Vi pham business rule!
-- Snapshot Isolation KHONG ngan duoc dieu nay
-- Can SERIALIZABLE hoac explicit locking
\`\`\`

## So sanh Implementation: PostgreSQL vs MySQL

| Tieu chi | PostgreSQL | MySQL InnoDB |
|----------|-----------|--------------|
| **Mac dinh** | READ COMMITTED | REPEATABLE READ |
| **MVCC** | Heap-based (nhieu phien ban trong heap) | Undo log-based |
| **Cleanup** | VACUUM (can chay dinh ky) | Purge thread (tu dong) |
| **READ UNCOMMITTED** | = READ COMMITTED | Ho tro dirty read |
| **REPEATABLE READ** | Snapshot Isolation (khong phantom) | Gap locks (co the phantom) |
| **SERIALIZABLE** | SSI (Serializable Snapshot Isolation) | 2PL (Two-Phase Locking) |
| **Deadlock** | Detect + abort 1 transaction | Detect + rollback nho nhat |
| **Write Skew** | Phat hien o SERIALIZABLE (SSI) | Khong phat hien |

\`\`\`sql
-- PostgreSQL: Kiem tra isolation level hien tai
SHOW default_transaction_isolation;

-- Dat isolation level cho session
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Dat isolation level cho 1 transaction
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- ... queries ...
COMMIT;

-- MySQL: Kiem tra isolation level
SELECT @@transaction_isolation;

-- MySQL: Dat isolation level
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
\`\`\`

> ⚠️ Luu y: Chon isolation level dua tren yeu cau cua ung dung. READ COMMITTED phu hop cho hau het truong hop. SERIALIZABLE chi khi can chinh xac tuyet doi va chap nhan performance hit.
    `
  },
  {
    id: 9,
    title: 'Locking Mechanisms',
    desc: 'Shared/Exclusive locks, deadlock detection, optimistic vs pessimistic locking',
    content: `
## Locking Mechanisms

Database locks dam bao data integrity khi nhieu transactions truy cap dong thoi. Hieu locking la key de xay dung ung dung concurrent dung.

### Lock Types

| Lock Type | Abbreviation | Description | Compatible With |
|-----------|-------------|-------------|-----------------|
| Shared (S) | S | Read lock - nhieu transaction co the hold | S |
| Exclusive (X) | X | Write lock - chi 1 transaction | None |
| Intent Shared (IS) | IS | Intent to acquire S lock on row | IS, IX, S |
| Intent Exclusive (IX) | IX | Intent to acquire X lock on row | IS, IX |
| Schema Stability (Sch-S) | Sch-S | Prevent schema changes | All except Sch-M |
| Schema Modification (Sch-M) | Sch-M | Schema change lock | None |

### Lock Granularity

\`\`\`mermaid
graph TD
    DB[Database Lock] --> T[Table Lock]
    T --> P[Page Lock]
    P --> R[Row Lock]
    R --> K[Key Lock]
    style DB fill:#ef4444,stroke:#dc2626,color:#fff
    style T fill:#f97316,stroke:#ea580c,color:#fff
    style P fill:#eab308,stroke:#ca8a04,color:#fff
    style R fill:#22c55e,stroke:#16a34a,color:#fff
    style K fill:#3b82f6,stroke:#2563eb,color:#fff
\`\`\`

- **Row-level lock**: Fine-grained, high concurrency, more memory
- **Table-level lock**: Coarse-grained, less overhead, less concurrency
- **Lock escalation**: Database tu dong escalate row locks thanh table lock khi qua nhieu rows bi lock

### SELECT FOR UPDATE

\`\`\`sql
-- Pessimistic locking: Lock row khi SELECT
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- Row id=1 bi locked, transactions khac phai doi
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- FOR SHARE: shared lock (cho phep read, block write)
SELECT * FROM products WHERE id = 5 FOR SHARE;

-- SKIP LOCKED: Bo qua rows dang bi lock (queue pattern)
SELECT * FROM tasks
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;

-- NOWAIT: Tra ve loi ngay neu row bi lock
SELECT * FROM orders WHERE id = 10 FOR UPDATE NOWAIT;
\`\`\`

### Deadlock Detection

\`\`\`mermaid
sequenceDiagram
    participant T1 as Transaction 1
    participant DB as Database
    participant T2 as Transaction 2
    T1->>DB: LOCK Row A (OK)
    T2->>DB: LOCK Row B (OK)
    T1->>DB: LOCK Row B (WAIT...)
    T2->>DB: LOCK Row A (DEADLOCK!)
    DB->>T2: Rollback (victim)
    DB->>T1: LOCK Row B (OK)
\`\`\`

\`\`\`sql
-- Deadlock scenario
-- Transaction 1:
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- waits for T2...
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- Transaction 2 (concurrent):
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;
-- waits for T1... DEADLOCK!
UPDATE accounts SET balance = balance + 50 WHERE id = 1;
COMMIT;

-- Prevention: Always lock in same order!
-- Both transactions should lock id=1 first, then id=2
\`\`\`

### Optimistic vs Pessimistic Locking

| Aspect | Optimistic | Pessimistic |
|--------|-----------|-------------|
| Strategy | Detect conflicts at commit | Prevent conflicts with locks |
| Implementation | Version column | SELECT FOR UPDATE |
| Throughput | High (no lock waiting) | Lower (lock contention) |
| Conflict handling | Retry on version mismatch | Wait or timeout |
| Best for | Low contention | High contention |

\`\`\`sql
-- Optimistic locking with version column
-- Step 1: Read with version
SELECT id, name, balance, version FROM accounts WHERE id = 1;
-- Returns: id=1, balance=1000, version=5

-- Step 2: Update with version check
UPDATE accounts
SET balance = 900, version = version + 1
WHERE id = 1 AND version = 5;

-- If rows_affected = 0 => someone else updated, retry!
\`\`\`

> ⚠️ Luu y: Deadlock prevention tot nhat la luon lock resources theo CUNG thu tu trong moi transaction. Neu khong the, dung lock timeout de tranh infinite wait.
    `
  },
  {
    id: 10,
    title: 'Query Optimization',
    desc: 'EXPLAIN plans, statistics, query rewriting, common anti-patterns',
    content: `
## Query Optimization

Query optimizer la "brain" cua database - no quyet dinh cach thuc hien query hieu qua nhat. Hieu optimizer giup ban viet queries nhanh hon hang tram lan.

### EXPLAIN Plan

\`\`\`sql
-- PostgreSQL: EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.name
ORDER BY order_count DESC
LIMIT 10;

-- Output giai thich:
-- Limit (cost=156.34..156.37 rows=10 width=40) (actual time=2.451..2.455 rows=10 loops=1)
--   -> Sort (cost=156.34..158.84 rows=1000 width=40) (actual time=2.449..2.451 rows=10 loops=1)
--     Sort Key: (count(o.id)) DESC
--     Sort Method: top-N heapsort Memory: 25kB
--     -> HashAggregate (cost=128.50..138.50 rows=1000 width=40) (actual time=2.109..2.301 rows=500 loops=1)
--       -> Hash Left Join (cost=25.00..116.00 rows=2500 width=36) (actual time=0.352..1.533 rows=2500 loops=1)
\`\`\`

### Scan Types

| Scan Type | Description | When Used |
|-----------|-------------|-----------|
| Seq Scan | Full table scan | No index, small table |
| Index Scan | B-Tree traversal + table lookup | Selective queries |
| Index Only Scan | Read from index only | All columns in index |
| Bitmap Index Scan | Bitmap of matching rows | Multiple index conditions |
| Hash Join | Build hash table for join | Equality joins |
| Merge Join | Merge sorted inputs | Pre-sorted data |
| Nested Loop | Loop for each outer row | Small datasets, indexed inner |

### Common Anti-Patterns

\`\`\`sql
-- BAD: Function on indexed column (prevents index use)
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- GOOD: Range condition
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- BAD: Leading wildcard
SELECT * FROM products WHERE name LIKE '%phone%';
-- GOOD: Prefix search (can use index)
SELECT * FROM products WHERE name LIKE 'phone%';

-- BAD: Implicit type conversion
SELECT * FROM users WHERE phone = 84901234567;  -- phone is VARCHAR
-- GOOD: Match types
SELECT * FROM users WHERE phone = '84901234567';

-- BAD: SELECT * (reads unnecessary columns)
SELECT * FROM users WHERE id = 1;
-- GOOD: Select only needed columns
SELECT name, email FROM users WHERE id = 1;

-- BAD: OR on different columns (prevents index use)
SELECT * FROM orders WHERE user_id = 1 OR product_id = 5;
-- GOOD: UNION ALL
SELECT * FROM orders WHERE user_id = 1
UNION ALL
SELECT * FROM orders WHERE product_id = 5 AND user_id != 1;

-- BAD: NOT IN with NULLs
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM banned);
-- GOOD: NOT EXISTS
SELECT * FROM users u WHERE NOT EXISTS (SELECT 1 FROM banned b WHERE b.user_id = u.id);
\`\`\`

### Index Optimization

\`\`\`sql
-- Composite index: column order matters!
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- This query USES the index:
SELECT * FROM orders WHERE user_id = 1 AND status = 'active';
SELECT * FROM orders WHERE user_id = 1;  -- left prefix

-- This query CANNOT use the index:
SELECT * FROM orders WHERE status = 'active';  -- skip first column

-- Covering index: avoid table lookup
CREATE INDEX idx_users_email_name ON users(email) INCLUDE (name);
-- Index-only scan for:
SELECT name FROM users WHERE email = 'test@test.com';

-- Partial index: smaller, faster
CREATE INDEX idx_active_orders ON orders(created_at) WHERE status = 'active';
\`\`\`

### Query Rewriting Techniques

\`\`\`sql
-- 1. Replace correlated subquery with JOIN
-- Slow:
SELECT u.name, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) FROM users u;
-- Fast:
SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name;

-- 2. EXISTS instead of COUNT for existence check
-- Slow:
SELECT * FROM users u WHERE (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) > 0;
-- Fast:
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 3. Batch operations instead of row-by-row
-- Slow: INSERT one by one in a loop
-- Fast:
INSERT INTO logs (user_id, action) VALUES (1, 'login'), (2, 'login'), (3, 'logout');
\`\`\`

> ⚠️ Luu y: Luon chay EXPLAIN ANALYZE truoc khi optimize. Khong optimize dua tren intuition - hay de data chi duong. Mot query 'xau' co the nhanh tren small data va chi cham khi scale.
    `
  },
  {
    id: 11,
    title: 'Normalization & Schema Design',
    desc: '1NF through 5NF, denormalization, ER modeling, star schema',
    content: `
## Normalization & Schema Design

Normalization la qua trinh to chuc data de giam redundancy va dam bao data integrity. Schema design quyet dinh performance va maintainability cua he thong.

### Normal Forms

| Normal Form | Rule | Eliminates |
|------------|------|------------|
| 1NF | Atomic values, no repeating groups | Multi-valued attributes |
| 2NF | 1NF + no partial dependencies | Partial key dependencies |
| 3NF | 2NF + no transitive dependencies | Transitive dependencies |
| BCNF | Every determinant is a candidate key | Remaining anomalies |
| 4NF | No multi-valued dependencies | Multi-valued dependencies |
| 5NF | No join dependencies | Join dependencies |

### 1NF - First Normal Form

\`\`\`sql
-- VIOLATES 1NF: repeating group
-- | student_id | name  | courses          |
-- | 1          | Alice | Math, Physics    |

-- 1NF compliant:
CREATE TABLE student_courses (
    student_id INT,
    name VARCHAR(100),
    course VARCHAR(100),
    PRIMARY KEY (student_id, course)
);
-- | student_id | name  | course  |
-- | 1          | Alice | Math    |
-- | 1          | Alice | Physics |
\`\`\`

### 2NF - Second Normal Form

\`\`\`sql
-- VIOLATES 2NF: name depends only on student_id, not full PK
-- student_courses(student_id, course, name, grade)
-- name is partially dependent on PK

-- 2NF: Split into two tables
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE enrollments (
    student_id INT,
    course VARCHAR(100),
    grade CHAR(1),
    PRIMARY KEY (student_id, course),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);
\`\`\`

### 3NF - Third Normal Form

\`\`\`sql
-- VIOLATES 3NF: city depends on zip_code, not directly on PK
-- employees(id, name, zip_code, city, state)
-- zip_code -> city, state (transitive dependency)

-- 3NF: Remove transitive dependency
CREATE TABLE zip_codes (
    zip_code VARCHAR(10) PRIMARY KEY,
    city VARCHAR(100),
    state VARCHAR(50)
);

CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    zip_code VARCHAR(10) REFERENCES zip_codes(zip_code)
);
\`\`\`

### Denormalization

\`\`\`sql
-- When to denormalize:
-- 1. Read-heavy workloads (OLAP, reporting)
-- 2. Frequent joins slowing down queries
-- 3. Caching calculated values

-- Example: Add redundant column for performance
ALTER TABLE orders ADD COLUMN customer_name VARCHAR(100);

-- Materialized view for reporting
CREATE MATERIALIZED VIEW daily_sales AS
SELECT DATE(created_at) as sale_date,
       COUNT(*) as total_orders,
       SUM(amount) as total_revenue
FROM orders
GROUP BY DATE(created_at);

-- Refresh periodically
REFRESH MATERIALIZED VIEW daily_sales;
\`\`\`

### Star Schema (Data Warehouse)

\`\`\`mermaid
graph TD
    F[Fact: Sales<br/>order_id, amount, quantity<br/>date_key, product_key, store_key] --> D1[Dim: Date<br/>date_key, year, month<br/>quarter, day_of_week]
    F --> D2[Dim: Product<br/>product_key, name<br/>category, brand]
    F --> D3[Dim: Store<br/>store_key, name<br/>city, region]
    style F fill:#3b82f6,stroke:#2563eb,color:#fff
    style D1 fill:#22c55e,stroke:#16a34a,color:#fff
    style D2 fill:#22c55e,stroke:#16a34a,color:#fff
    style D3 fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

\`\`\`sql
-- Star schema example
CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,
    full_date DATE,
    year INT,
    quarter INT,
    month INT,
    day_of_week VARCHAR(10)
);

CREATE TABLE dim_product (
    product_key INT PRIMARY KEY,
    name VARCHAR(200),
    category VARCHAR(100),
    brand VARCHAR(100)
);

CREATE TABLE fact_sales (
    sale_id BIGINT PRIMARY KEY,
    date_key INT REFERENCES dim_date(date_key),
    product_key INT REFERENCES dim_product(product_key),
    quantity INT,
    amount DECIMAL(12,2)
);

-- Fast aggregation query
SELECT d.year, d.quarter, p.category, SUM(f.amount) as revenue
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY d.year, d.quarter, p.category;
\`\`\`

> ⚠️ Luu y: Normalize cho OLTP (transactional), denormalize cho OLAP (analytical). Hau het production systems can 3NF. Chi denormalize khi co evidence (slow queries, profiling data).
    `
  },
  {
    id: 12,
    title: 'Stored Procedures, Functions & Triggers',
    desc: 'Server-side logic, triggers, cursors, error handling',
    content: `
## Stored Procedures, Functions & Triggers

Database server-side programming cho phep logic chay trong database engine, giam network round-trips va dam bao data consistency.

### Stored Procedures

\`\`\`sql
-- PostgreSQL: Transfer money between accounts
CREATE OR REPLACE PROCEDURE transfer_money(
    sender_id INT,
    receiver_id INT,
    amount DECIMAL(12,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check balance
    IF (SELECT balance FROM accounts WHERE id = sender_id) < amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Debit sender
    UPDATE accounts SET balance = balance - amount WHERE id = sender_id;

    -- Credit receiver
    UPDATE accounts SET balance = balance + amount WHERE id = receiver_id;

    -- Log transaction
    INSERT INTO transactions (from_id, to_id, amount, created_at)
    VALUES (sender_id, receiver_id, amount, NOW());

    COMMIT;
END;
$$;

-- Call procedure
CALL transfer_money(1, 2, 500.00);
\`\`\`

### Functions

\`\`\`sql
-- Scalar function: Calculate age
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
END;
$$;

-- Use in query
SELECT name, calculate_age(birth_date) as age FROM users;

-- Table-valued function
CREATE OR REPLACE FUNCTION get_top_customers(min_orders INT)
RETURNS TABLE(customer_id INT, name VARCHAR, order_count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, COUNT(o.id) as cnt
    FROM customers c
    JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id, c.name
    HAVING COUNT(o.id) >= min_orders
    ORDER BY cnt DESC;
END;
$$;

SELECT * FROM get_top_customers(10);
\`\`\`

### Triggers

\`\`\`sql
-- Audit trigger: Log all changes to users table
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    operation VARCHAR(10),
    old_data JSONB,
    new_data JSONB,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_data, changed_by)
        VALUES (TG_TABLE_NAME, 'INSERT', to_jsonb(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, changed_by)
        VALUES (TG_TABLE_NAME, 'DELETE', to_jsonb(OLD), current_user);
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER users_audit
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- BEFORE trigger: Validate data
CREATE OR REPLACE FUNCTION validate_email()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER check_email
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION validate_email();
\`\`\`

### Error Handling

\`\`\`sql
CREATE OR REPLACE PROCEDURE safe_insert_user(
    p_name VARCHAR,
    p_email VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO users (name, email) VALUES (p_name, p_email);
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Email % already exists', p_email;
    WHEN check_violation THEN
        RAISE NOTICE 'Check constraint violated for %', p_name;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unknown error: %', SQLERRM;
        RAISE;  -- Re-raise the exception
END;
$$;
\`\`\`

| Trigger Type | Fires | Use Case |
|-------------|-------|----------|
| BEFORE INSERT | Before row insert | Validation, default values |
| AFTER INSERT | After row insert | Audit logging, notifications |
| BEFORE UPDATE | Before row update | Validation, computed columns |
| AFTER UPDATE | After row update | Audit, cascade updates |
| INSTEAD OF | Replaces the action | Updatable views |

> ⚠️ Luu y: Trigger co the tao "hidden logic" kho debug. Han che dung trigger phuc tap - uu tien application-level logic. Stored procedures tot cho atomic operations nhung lam code kho test va version control.
    `
  },
  {
    id: 13,
    title: 'Partitioning & Sharding',
    desc: 'Table partitioning, database sharding strategies, consistent hashing',
    content: `
## Partitioning & Sharding

Khi data vuot qua kha nang cua 1 server hoac 1 table, partitioning va sharding la giai phap de scale horizontally.

### Partitioning vs Sharding

| Aspect | Partitioning | Sharding |
|--------|-------------|----------|
| Scope | Single database | Multiple databases |
| Management | Database engine manages | Application manages |
| Transparency | Transparent to app | App needs shard awareness |
| Scale | Vertical (same server) | Horizontal (multiple servers) |

### Range Partitioning

\`\`\`sql
-- PostgreSQL: Partition by date range
CREATE TABLE orders (
    id BIGSERIAL,
    customer_id INT,
    amount DECIMAL(12,2),
    created_at TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE orders_2024_q1 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE orders_2024_q2 PARTITION OF orders
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

CREATE TABLE orders_2024_q3 PARTITION OF orders
    FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');

CREATE TABLE orders_2024_q4 PARTITION OF orders
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

-- Query automatically uses partition pruning
EXPLAIN SELECT * FROM orders WHERE created_at = '2024-06-15';
-- Only scans orders_2024_q2!
\`\`\`

### List Partitioning

\`\`\`sql
-- Partition by region
CREATE TABLE customers (
    id SERIAL,
    name VARCHAR(100),
    region VARCHAR(20)
) PARTITION BY LIST (region);

CREATE TABLE customers_asia PARTITION OF customers
    FOR VALUES IN ('ASIA', 'SOUTHEAST_ASIA');

CREATE TABLE customers_europe PARTITION OF customers
    FOR VALUES IN ('EUROPE', 'UK');

CREATE TABLE customers_americas PARTITION OF customers
    FOR VALUES IN ('NORTH_AMERICA', 'SOUTH_AMERICA');
\`\`\`

### Hash Partitioning

\`\`\`sql
-- Partition by hash of user_id (even distribution)
CREATE TABLE user_events (
    id BIGSERIAL,
    user_id INT,
    event_type VARCHAR(50),
    created_at TIMESTAMP
) PARTITION BY HASH (user_id);

CREATE TABLE user_events_0 PARTITION OF user_events
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE user_events_1 PARTITION OF user_events
    FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE user_events_2 PARTITION OF user_events
    FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE user_events_3 PARTITION OF user_events
    FOR VALUES WITH (MODULUS 4, REMAINDER 3);
\`\`\`

### Database Sharding Architecture

\`\`\`mermaid
graph TD
    APP[Application] --> R[Shard Router]
    R --> S1[Shard 1<br/>Users A-H]
    R --> S2[Shard 2<br/>Users I-P]
    R --> S3[Shard 3<br/>Users Q-Z]
    S1 --> R1[Replica 1a]
    S2 --> R2[Replica 2a]
    S3 --> R3[Replica 3a]
    style APP fill:#3b82f6,stroke:#2563eb,color:#fff
    style R fill:#f59e0b,stroke:#d97706,color:#fff
    style S1 fill:#22c55e,stroke:#16a34a,color:#fff
    style S2 fill:#22c55e,stroke:#16a34a,color:#fff
    style S3 fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### Sharding Strategies

\`\`\`text
1. Range-based sharding:
   Shard 1: user_id 1 - 1,000,000
   Shard 2: user_id 1,000,001 - 2,000,000
   Pro: Simple, range queries efficient
   Con: Hotspot on latest shard

2. Hash-based sharding:
   shard = hash(user_id) % num_shards
   Pro: Even distribution
   Con: Range queries need all shards

3. Directory-based sharding:
   Lookup table: user_id -> shard_id
   Pro: Flexible placement
   Con: Lookup table = single point of failure

4. Geographic sharding:
   US users -> US datacenter
   EU users -> EU datacenter
   Pro: Low latency, data residency compliance
   Con: Cross-region queries complex
\`\`\`

### Consistent Hashing

\`\`\`text
Hash Ring (0 to 2^32):

        Node A (pos: 100)
       /
  0 ------- 2^32
  |    \\        |
  |   Node C    |
  |  (pos: 700) |
  |             |
   \\ Node B   /
    (pos: 400)

Key "user:123" hash = 250 -> goes to Node B (next node clockwise)
Key "user:456" hash = 650 -> goes to Node C

Add Node D at pos 550:
- Only keys between 400-550 move from C to D
- Other keys unaffected!
\`\`\`

### Cross-Shard Queries

\`\`\`sql
-- Problem: JOIN across shards
-- User on Shard 1, Orders on Shard 2
-- Solution 1: Denormalize - store user_name in orders
-- Solution 2: Application-level join
-- Solution 3: Use distributed query engine (Vitess, Citus)

-- Vitess example (transparent sharding for MySQL)
-- Application sees single database
SELECT u.name, o.total
FROM users u JOIN orders o ON u.id = o.user_id
WHERE u.id = 12345;
-- Vitess routes to correct shard automatically
\`\`\`

> ⚠️ Luu y: Sharding la "nuclear option" - chi dung khi vertical scaling va read replicas khong du. Sharding tang complexity rat nhieu: cross-shard joins, distributed transactions, resharding. Thu partitioning truoc!
    `
  },
  {
    id: 14,
    title: 'Replication & High Availability',
    desc: 'Master-slave, multi-master replication, failover, connection pooling',
    content: `
## Replication & High Availability

Replication dam bao data duoc sao chep sang nhieu servers, tang availability, read performance, va disaster recovery.

### Replication Topologies

\`\`\`mermaid
graph TD
    subgraph "Master-Slave"
        M1[Master<br/>Read + Write] --> S1a[Slave 1<br/>Read Only]
        M1 --> S1b[Slave 2<br/>Read Only]
    end
    subgraph "Multi-Master"
        M2a[Master 1<br/>Read + Write] <--> M2b[Master 2<br/>Read + Write]
    end
    subgraph "Cascading"
        M3[Master] --> C1[Slave 1]
        C1 --> C2[Slave 2]
    end
    style M1 fill:#3b82f6,stroke:#2563eb,color:#fff
    style M2a fill:#3b82f6,stroke:#2563eb,color:#fff
    style M2b fill:#3b82f6,stroke:#2563eb,color:#fff
    style M3 fill:#3b82f6,stroke:#2563eb,color:#fff
\`\`\`

### Synchronous vs Asynchronous Replication

| Aspect | Synchronous | Asynchronous |
|--------|------------|--------------|
| Consistency | Strong | Eventual |
| Latency | Higher (wait for replica) | Lower |
| Data loss risk | None | Possible (replication lag) |
| Availability | Lower (replica must be up) | Higher |
| Use case | Financial, critical data | Most applications |

### PostgreSQL Streaming Replication

\`\`\`sql
-- Master: postgresql.conf
-- wal_level = replica
-- max_wal_senders = 3
-- synchronous_standby_names = 'slave1'

-- Slave: recovery.conf / standby.signal
-- primary_conninfo = 'host=master port=5432 user=replicator'

-- Check replication status
SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn,
       (sent_lsn - replay_lsn) AS replication_lag
FROM pg_stat_replication;

-- Check replication lag in seconds
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;
\`\`\`

### Failover Strategies

\`\`\`text
Manual Failover:
1. Detect master failure
2. Promote slave: SELECT pg_promote();
3. Redirect application to new master
4. Reconfigure other replicas

Automatic Failover (Patroni):
1. Patroni monitors master health via DCS (etcd/ZooKeeper)
2. Master fails health check
3. Leader election among standby nodes
4. Winner promoted to master
5. HAProxy/pgbouncer automatically routes to new master
6. Old master rejoins as replica when recovered
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant App as Application
    participant LB as HAProxy
    participant M as Master
    participant S as Standby
    participant P as Patroni

    M->>M: CRASH!
    P->>P: Health check fails
    P->>S: pg_promote()
    S->>S: Becomes new Master
    P->>LB: Update backend config
    App->>LB: Write query
    LB->>S: Route to new Master
\`\`\`

### Connection Pooling

\`\`\`text
Without pooling:
  App (100 threads) --> DB (100 connections) --> OVERWHELMED!

With PgBouncer:
  App (100 threads) --> PgBouncer (20 connections) --> DB (manageable!)

PgBouncer pooling modes:
1. Session pooling: 1 client = 1 server conn for session lifetime
2. Transaction pooling: conn returned after each transaction (BEST)
3. Statement pooling: conn returned after each statement (limited)
\`\`\`

\`\`\`text
-- pgbouncer.ini
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
\`\`\`

### HikariCP (Java Connection Pool)

\`\`\`java
// HikariCP configuration
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");
config.setUsername("user");
config.setPassword("pass");
config.setMaximumPoolSize(20);        // Max connections
config.setMinimumIdle(5);             // Min idle connections
config.setConnectionTimeout(30000);    // 30s timeout
config.setIdleTimeout(600000);         // 10min idle timeout
config.setMaxLifetime(1800000);        // 30min max lifetime
config.setLeakDetectionThreshold(60000); // Detect connection leaks

HikariDataSource ds = new HikariDataSource(config);
\`\`\`

### Read-Write Splitting

\`\`\`java
// Spring Boot: Read-Write routing
@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource routingDataSource() {
        Map<Object, Object> targets = new HashMap<>();
        targets.put("master", masterDataSource());
        targets.put("slave", slaveDataSource());

        RoutingDataSource routing = new RoutingDataSource();
        routing.setTargetDataSources(targets);
        routing.setDefaultTargetDataSource(masterDataSource());
        return routing;
    }
}

// RoutingDataSource determines key based on transaction type
public class RoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return TransactionSynchronizationManager.isCurrentTransactionReadOnly()
            ? "slave" : "master";
    }
}

// Usage
@Transactional(readOnly = true)  // Routes to slave
public List<User> getUsers() { ... }

@Transactional  // Routes to master
public void createUser(User user) { ... }
\`\`\`

> ⚠️ Luu y: Replication lag co the gay ra "read-after-write" inconsistency. User tao record tren master, roi doc tu slave nhung chua replicate xong. Giai phap: doc tu master cho critical reads, hoac dung synchronous replication.
    `
  },
  {
    id: 15,
    title: 'Advanced SQL & Production Best Practices',
    desc: 'UPSERT, JSON operations, migrations, backup strategies, production checklist',
    content: `
## Advanced SQL & Production Best Practices

Nhung ky thuat advanced va best practices giup he thong chay on dinh, dang tin cay trong production.

### UPSERT (INSERT ON CONFLICT)

\`\`\`sql
-- PostgreSQL: INSERT ON CONFLICT
INSERT INTO products (sku, name, price, stock)
VALUES ('SKU-001', 'Laptop', 999.99, 50)
ON CONFLICT (sku)
DO UPDATE SET
    price = EXCLUDED.price,
    stock = products.stock + EXCLUDED.stock,
    updated_at = NOW();

-- MySQL: INSERT ON DUPLICATE KEY
INSERT INTO products (sku, name, price, stock)
VALUES ('SKU-001', 'Laptop', 999.99, 50)
ON DUPLICATE KEY UPDATE
    price = VALUES(price),
    stock = stock + VALUES(stock);

-- MERGE (SQL Standard / SQL Server)
MERGE INTO products AS target
USING (VALUES ('SKU-001', 'Laptop', 999.99)) AS source (sku, name, price)
ON target.sku = source.sku
WHEN MATCHED THEN UPDATE SET price = source.price
WHEN NOT MATCHED THEN INSERT (sku, name, price) VALUES (source.sku, source.name, source.price);
\`\`\`

### JSON Operations

\`\`\`sql
-- PostgreSQL JSONB
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO events (data) VALUES
('{"type": "click", "page": "/home", "user": {"id": 1, "name": "Alice"}}');

-- Query JSON fields
SELECT data->>'type' as event_type,
       data->'user'->>'name' as user_name
FROM events
WHERE data->>'type' = 'click';

-- JSON path query (PostgreSQL 12+)
SELECT * FROM events
WHERE data @? '$.user ? (@.id == 1)';

-- Update nested JSON
UPDATE events
SET data = jsonb_set(data, '{user,name}', '"Bob"')
WHERE id = 1;

-- Index on JSON field
CREATE INDEX idx_events_type ON events ((data->>'type'));
CREATE INDEX idx_events_data ON events USING GIN (data);

-- Aggregate JSON
SELECT data->>'type' as type, COUNT(*)
FROM events
GROUP BY data->>'type';
\`\`\`

### Database Migration

\`\`\`sql
-- Flyway naming convention: V{version}__{description}.sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- V2__add_phone_to_users.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- V3__create_orders_table.sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    total DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'pending'
);
\`\`\`

\`\`\`text
Migration Best Practices:
1. Always forward-only (no manual rollback scripts in production)
2. Small, incremental changes
3. Separate schema changes from data migrations
4. Test migrations on production-like data
5. Zero-downtime migrations:
   - ADD COLUMN: Safe (NULL default)
   - DROP COLUMN: Deploy code first, then drop
   - RENAME COLUMN: Add new, copy data, update code, drop old
   - ADD NOT NULL: Add nullable first, backfill, then add constraint
\`\`\`

### Backup & Recovery

\`\`\`bash
# PostgreSQL: Logical backup
pg_dump -h localhost -U postgres -d mydb -F custom -f backup.dump

# Restore
pg_restore -h localhost -U postgres -d mydb backup.dump

# Physical backup (base backup + WAL archiving)
pg_basebackup -h localhost -U replicator -D /backup/base -Ft -z -P

# Point-in-time recovery (PITR)
# recovery.conf:
# restore_command = 'cp /archive/%f %p'
# recovery_target_time = '2024-06-15 14:30:00'
\`\`\`

### Monitoring Slow Queries

\`\`\`sql
-- PostgreSQL: Enable slow query log
-- postgresql.conf:
-- log_min_duration_statement = 1000  (log queries > 1s)
-- shared_preload_libraries = 'pg_stat_statements'

-- Find slow queries
SELECT query, calls, total_exec_time, mean_exec_time,
       rows, shared_blks_hit, shared_blks_read
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Find missing indexes
SELECT relname, seq_scan, seq_tup_read,
       idx_scan, idx_tup_fetch
FROM pg_stat_user_tables
WHERE seq_scan > 100
ORDER BY seq_tup_read DESC;

-- Table bloat check
SELECT tablename,
       pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;
\`\`\`

### Production Checklist

| Category | Item | Status |
|----------|------|--------|
| **Performance** | Indexes on all FK columns | Required |
| **Performance** | Connection pooling configured | Required |
| **Performance** | Slow query logging enabled | Required |
| **Performance** | Query plan caching | Recommended |
| **Security** | Least privilege DB users | Required |
| **Security** | SSL/TLS connections | Required |
| **Security** | SQL injection prevention (parameterized queries) | Required |
| **Backup** | Automated daily backups | Required |
| **Backup** | WAL archiving for PITR | Recommended |
| **Backup** | Regular backup restore tests | Required |
| **Monitoring** | Connection count monitoring | Required |
| **Monitoring** | Replication lag monitoring | Required |
| **Monitoring** | Disk space alerts | Required |
| **Schema** | Migration tool (Flyway/Liquibase) | Required |
| **Schema** | Zero-downtime migration plan | Recommended |
| **HA** | Read replicas for read scaling | Recommended |
| **HA** | Automatic failover configured | Recommended |

> ⚠️ Luu y: KHONG BAO GIO chay ALTER TABLE tren production table lon ma khong test truoc. Mot so ALTER operations lock entire table va co the cause downtime. Dung pt-online-schema-change (MySQL) hoac pg_repack (PostgreSQL) cho large tables.
    `
  }
];
