import mysql from "mysql2/promise";
import { Pool as PgPool } from "pg";
import { hashPassword } from "../utils/auth";

// Determine whether to use mock DB (default false if full credentials are provided)
const useMockExplicit =
  (process.env.USE_MOCK_DB || "").toLowerCase() === "true";

const DB_HOST = (process.env.DB_HOST || "").trim();
const DB_PORT = parseInt(process.env.DB_PORT || "3306", 10);
const DB_USER = (process.env.DB_USER || "").trim();
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = (process.env.DB_NAME || "").trim();

const hasCreds = DB_HOST && DB_USER && DB_PASSWORD && DB_NAME;
const PG_URL = (
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  ""
).trim();
const USE_PG = !!PG_URL;
const MODE: "postgres" | "mysql" | "mock" = useMockExplicit
  ? "mock"
  : USE_PG
    ? "postgres"
    : hasCreds
      ? "mysql"
      : "mock";
const USE_MOCK = MODE === "mock";

// In-memory fallback store
class InMemoryStore {
  public users: any[] = [
    {
      id: 1,
      email: "student@ydf.org",
      password: "$2a$12$LQv3c1yqBw2YwjVVRRp0Oe6slHh9UNdCHbyBgTcbZ2fP0S5w7/5gS",
      firstName: "Demo",
      lastName: "Student",
      phone: "+91 9876543210",
      userType: "student",
      isActive: true,
      emailVerified: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      profileData: {
        course: "B.Tech Computer Science",
        college: "Demo College",
        year: "3rd Year",
        cgpa: "8.75",
      },
    },
    {
      id: 2,
      email: "admin@ydf.org",
      password: "$2a$12$LQv3c1yqBw2YwjVVRRp0Oe6slHh9UNdCHbyBgTcbZ2fP0S5w7/5gS",
      firstName: "Demo",
      lastName: "Admin",
      phone: "+91 9876543211",
      userType: "admin",
      isActive: true,
      emailVerified: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      profileData: {
        department: "Administration",
        role: "System Administrator",
      },
    },
    {
      id: 3,
      email: "reviewer@ydf.org",
      password: "$2a$12$LQv3c1yqBw2YwjVVRRp0Oe6slHh9UNdCHbyBgTcbZ2fP0S5w7/5gS",
      firstName: "Demo",
      lastName: "Reviewer",
      phone: "+91 9876543212",
      userType: "reviewer",
      isActive: true,
      emailVerified: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      profileData: { specialization: "Academic Review", experience: "5 years" },
    },
    {
      id: 4,
      email: "donor@ydf.org",
      password: "$2a$12$LQv3c1yqBw2YwjVVRRp0Oe6slHh9UNdCHbyBgTcbZ2fP0S5w7/5gS",
      firstName: "Demo",
      lastName: "Donor",
      phone: "+91 9876543213",
      userType: "donor",
      isActive: true,
      emailVerified: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      profileData: { organization: "Demo Foundation", type: "Individual" },
    },
    {
      id: 5,
      email: "surveyor@ydf.org",
      password: "$2a$12$LQv3c1yqBw2YwjVVRRp0Oe6slHh9UNdCHbyBgTcbZ2fP0S5w7/5gS",
      firstName: "Demo",
      lastName: "Surveyor",
      phone: "+91 9876543214",
      userType: "surveyor",
      isActive: true,
      emailVerified: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      profileData: { department: "Field Verification" },
    },
  ];

  public scholarships: any[] = [
    {
      id: 1,
      title: "Merit Excellence Scholarship",
      description: "Supporting academically excellent students",
      amount: "50000",
      currency: "INR",
      eligibilityCriteria: ["CGPA above 8.5", "Income < 5L"],
      requiredDocuments: ["Transcripts", "Income certificate"],
      applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      selectionDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75),
      maxApplications: 1000,
      currentApplications: 156,
      status: "active",
      createdBy: 2,
      tags: ["Academic", "Merit"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: "Rural Girls Education Grant",
      description: "Empowering rural girls through education",
      amount: "35000",
      currency: "INR",
      eligibilityCriteria: ["Female candidates", "Rural residence"],
      requiredDocuments: ["Income certificate", "Residence proof"],
      applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      selectionDeadline: null,
      maxApplications: 800,
      currentApplications: 89,
      status: "active",
      createdBy: 2,
      tags: ["Gender", "Rural"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: "Technical Innovation Fund",
      description: "Funding innovative tech projects",
      amount: "75000",
      currency: "INR",
      eligibilityCriteria: ["Engineering students", "Project proposal"],
      requiredDocuments: ["Proposal", "Transcripts"],
      applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      selectionDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120),
      maxApplications: 500,
      currentApplications: 234,
      status: "active",
      createdBy: 2,
      tags: ["Technology", "Innovation"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      title: "Arts & Culture Scholarship",
      description: "Preserving arts and culture",
      amount: "30000",
      currency: "INR",
      eligibilityCriteria: ["Arts students", "Portfolio"],
      requiredDocuments: ["Portfolio", "Income certificate"],
      applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
      selectionDeadline: null,
      maxApplications: 400,
      currentApplications: 67,
      status: "active",
      createdBy: 2,
      tags: ["Arts", "Culture"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  public applications: any[] = [
    {
      id: 1,
      scholarshipId: 1,
      studentId: 1,
      status: "submitted",
      score: null,
      amountAwarded: null,
      assignedReviewerId: 3,
      formData: {},
      documents: [],
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: 2,
      scholarshipId: 2,
      studentId: 1,
      status: "under_review",
      score: 80,
      amountAwarded: null,
      assignedReviewerId: 3,
      formData: {},
      documents: [],
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
    {
      id: 3,
      scholarshipId: 3,
      studentId: 1,
      status: "approved",
      score: 92,
      amountAwarded: "50000",
      assignedReviewerId: 3,
      formData: {},
      documents: [],
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
  ];
  public announcements: any[] = [
    {
      id: 1,
      title: "Application Deadline Extended",
      content:
        "The deadline for the Merit Excellence Scholarship has been extended by one week.",
      type: "deadline",
      targetAudience: ["student"],
      isActive: true,
      priority: "high",
      validFrom: new Date(),
      validTo: null,
      createdBy: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: "Maintenance Notice",
      content:
        "Scheduled maintenance on Sunday 10 PM - 12 AM. Portal access may be intermittent.",
      type: "maintenance",
      targetAudience: ["student", "reviewer", "admin", "donor"],
      isActive: true,
      priority: "normal",
      validFrom: new Date(),
      validTo: null,
      createdBy: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: "Results Published",
      content:
        "Results for the first round of the Technical Innovation Fund have been published.",
      type: "result",
      targetAudience: ["student"],
      isActive: true,
      priority: "urgent",
      validFrom: new Date(),
      validTo: null,
      createdBy: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  public reviews: any[] = [];
}

const memory = new InMemoryStore();

// MySQL pool
export const pool =
  MODE === "mysql"
    ? (mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 30000,
        ...(String(process.env.DB_SSL || "").toLowerCase() === "true"
          ? { ssl: { rejectUnauthorized: false } }
          : {}),
      }) as any)
    : (null as unknown as mysql.Pool);

export const pgPool =
  MODE === "postgres"
    ? new PgPool(
        (() => {
          try {
            const u = new URL(PG_URL);
            return {
              host: u.hostname,
              port: u.port ? parseInt(u.port, 10) : 5432,
              user: decodeURIComponent(u.username),
              password: decodeURIComponent(u.password),
              database: u.pathname.replace(/^\//, ""),
              ssl: { require: true, rejectUnauthorized: false },
            } as any;
          } catch {
            return {
              connectionString: PG_URL,
              ssl: { require: true, rejectUnauthorized: false },
            } as any;
          }
        })(),
      )
    : (null as unknown as PgPool);

// Provide a compatibility wrapper like previous `mysql.getConnection()` export
export const mysqlCompat = {
  getConnection: async () => {
    // Only provide a real connection in MySQL mode
    if (MODE !== "mysql" || !pool) {
      return {
        execute: async (_q: string, _p?: any[]) => [[]],
        ping: async () => true,
        end: async () => {},
        release: () => {},
      } as any;
    }
    return pool.getConnection();
  },
} as any;

// Helper to ensure tables exist in MySQL
async function ensureUsersTable() {
  if (USE_MOCK) return;
  if (MODE === "postgres" && pgPool) {
    await pgPool.query(`
      DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='user_type') THEN
        CREATE TYPE user_type AS ENUM ('student','admin','reviewer','donor','surveyor');
      END IF; END $$;
    `);
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        phone TEXT,
        "userType" user_type NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        "profileData" JSONB,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    return;
  }
  if (!pool) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      firstName VARCHAR(100) NOT NULL,
      lastName VARCHAR(100) NOT NULL,
      phone VARCHAR(50),
      userType ENUM('student','admin','reviewer','donor','surveyor') NOT NULL,
      isActive TINYINT(1) NOT NULL DEFAULT 1,
      emailVerified TINYINT(1) NOT NULL DEFAULT 0,
      profileData JSON NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  try {
    const [cols]: any = await pool.execute(
      "SHOW COLUMNS FROM users LIKE 'userType'",
    );
    const col = (cols as any[])[0];
    const typeStr = (col && col.Type) || (col && col["Type"]);
    if (typeStr && !String(typeStr).includes("surveyor")) {
      await pool.execute(
        `ALTER TABLE users MODIFY COLUMN userType ENUM('student','admin','reviewer','donor','surveyor') NOT NULL`,
      );
    }
  } catch (e) {
    console.warn(
      "Could not verify/alter users.userType enum:",
      e instanceof Error ? e.message : e,
    );
  }
}

async function ensureScholarshipsTable() {
  if (USE_MOCK) return;
  if (MODE === "postgres" && pgPool) {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS scholarships (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        currency TEXT DEFAULT 'INR',
        "eligibilityCriteria" JSONB NOT NULL,
        "requiredDocuments" JSONB NOT NULL,
        "applicationDeadline" TIMESTAMPTZ NOT NULL,
        "selectionDeadline" TIMESTAMPTZ NULL,
        "maxApplications" INT NULL,
        "currentApplications" INT DEFAULT 0,
        status TEXT DEFAULT 'active',
        "createdBy" BIGINT NULL,
        tags JSONB NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    return;
  }
  if (!pool) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS scholarships (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      eligibilityCriteria JSON NOT NULL,
      requiredDocuments JSON NOT NULL,
      applicationDeadline DATETIME NOT NULL,
      selectionDeadline DATETIME NULL,
      maxApplications INT NULL,
      currentApplications INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      createdBy INT NULL,
      tags JSON NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureApplicationsTable() {
  if (USE_MOCK) return;
  if (MODE === "postgres" && pgPool) {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id BIGSERIAL PRIMARY KEY,
        scholarshipId BIGINT NOT NULL,
        studentId BIGINT NOT NULL,
        status TEXT NOT NULL DEFAULT 'submitted',
        score INT,
        amountAwarded NUMERIC(10,2),
        assignedReviewerId BIGINT,
        reviewNotes TEXT,
        formData JSONB,
        documents JSONB,
        submittedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // Ensure reviewNotes column exists
    try {
      await pgPool.query(
        'ALTER TABLE applications ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT',
      );
    } catch {
      /* ignore */
    }
    return;
  }
  if (!pool) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      scholarshipId INT NOT NULL,
      studentId INT NOT NULL,
      status ENUM('draft','submitted','under_review','approved','rejected','waitlisted') NOT NULL DEFAULT 'submitted',
      score INT NULL,
      amountAwarded DECIMAL(10,2) NULL,
      assignedReviewerId INT NULL,
      reviewNotes TEXT NULL,
      formData JSON NULL,
      documents JSON NULL,
      submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_app_scholarship (scholarshipId),
      INDEX idx_app_student (studentId),
      INDEX idx_app_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  // Ensure columns exist on older DBs
  try {
    const [cols]: any = await pool.execute(
      "SHOW COLUMNS FROM applications LIKE 'reviewNotes'",
    );
    if (!(cols as any[])[0]) {
      await pool.execute(
        "ALTER TABLE applications ADD COLUMN reviewNotes TEXT NULL AFTER assignedReviewerId",
      );
    }
  } catch {
    /* ignore */
  }
}

async function ensureAnnouncementsTable() {
  if (USE_MOCK) return;
  if (MODE === "postgres" && pgPool) {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'general',
        "targetAudience" JSONB,
        "isActive" BOOLEAN DEFAULT TRUE,
        priority TEXT DEFAULT 'normal',
        "validFrom" TIMESTAMPTZ DEFAULT NOW(),
        "validTo" TIMESTAMPTZ,
        "createdBy" BIGINT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    return;
  }
  if (!pool) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(20) DEFAULT 'general',
      targetAudience JSON NULL,
      isActive TINYINT(1) DEFAULT 1,
      priority VARCHAR(10) DEFAULT 'normal',
      validFrom DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      validTo DATETIME NULL,
      createdBy INT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureReviewsTable() {
  if (USE_MOCK) return;
  if (MODE === "postgres" && pgPool) {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS application_reviews (
        id BIGSERIAL PRIMARY KEY,
        "applicationId" BIGINT NOT NULL,
        "reviewerId" BIGINT NOT NULL,
        criteria JSONB,
        "overallScore" INT,
        comments TEXT,
        recommendation TEXT,
        "isComplete" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    return;
  }
  if (!pool) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS application_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      applicationId INT NOT NULL,
      reviewerId INT NOT NULL,
      criteria JSON NULL,
      overallScore INT NULL,
      comments TEXT NULL,
      recommendation ENUM('approve','reject','conditionally_approve') NULL,
      isComplete TINYINT(1) DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_rev_app (applicationId),
      INDEX idx_rev_reviewer (reviewerId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// Adapter to provide the same interface used by routes
class DatabaseAdapter {
  async listUsers(
    params: {
      userType?: string;
      isActive?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { userType, isActive, search, page = 1, limit = 100 } = params;
    const offset = (page - 1) * limit;
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      let list = [...memory.users];
      if (userType)
        list = list.filter((u) => String(u.userType) === String(userType));
      if (typeof isActive === "boolean")
        list = list.filter((u) => !!u.isActive === isActive);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (u) =>
            String(u.email || "")
              .toLowerCase()
              .includes(q) ||
            String(u.firstName || "")
              .toLowerCase()
              .includes(q) ||
            String(u.lastName || "")
              .toLowerCase()
              .includes(q),
        );
      }
      list.sort(
        (a: any, b: any) => (b.createdAt as any) - (a.createdAt as any),
      );
      return list.slice(offset, offset + limit);
    }
    if (MODE === "postgres" && pgPool) {
      const where: string[] = [];
      const vals: any[] = [];
      if (userType) {
        where.push('"userType" = $' + (vals.length + 1));
        vals.push(userType);
      }
      if (typeof isActive === "boolean") {
        where.push('"isActive" = $' + (vals.length + 1));
        vals.push(isActive);
      }
      if (search) {
        where.push(
          "(LOWER(email) LIKE $" +
            (vals.length + 1) +
            ' OR LOWER("firstName") LIKE $' +
            (vals.length + 2) +
            ' OR LOWER("lastName") LIKE $' +
            (vals.length + 3) +
            ")",
        );
        vals.push(
          `%${search.toLowerCase()}%`,
          `%${search.toLowerCase()}%`,
          `%${search.toLowerCase()}%`,
        );
      }
      const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
      const result = await pgPool.query(
        `SELECT id, email, "firstName", "lastName", phone, "userType", "isActive", "emailVerified", "createdAt", "updatedAt" FROM users ${whereSql} ORDER BY "createdAt" DESC OFFSET $${vals.length + 1} LIMIT $${vals.length + 2}`,
        [...vals, offset, limit],
      );
      return result.rows as any[];
    }
    const where: string[] = [];
    const vals: any[] = [];
    if (userType) {
      where.push("userType = ?");
      vals.push(userType);
    }
    if (typeof isActive === "boolean") {
      where.push("isActive = ?");
      vals.push(isActive ? 1 : 0);
    }
    if (search) {
      where.push(
        "(LOWER(email) LIKE ? OR LOWER(firstName) LIKE ? OR LOWER(lastName) LIKE ?)",
      );
      const like = `%${search.toLowerCase()}%`;
      vals.push(like, like, like);
    }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await pool.execute(
      `SELECT id, email, firstName, lastName, phone, userType, isActive, emailVerified, createdAt, updatedAt FROM users ${whereSql} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...vals, limit, offset],
    );
    return rows as any[];
  }

  async findUserByEmail(email: string) {
    const normalized = String(email || "")
      .trim()
      .toLowerCase();
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      return (
        memory.users.find(
          (u) => String(u.email || "").toLowerCase() === normalized,
        ) || null
      );
    }
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query(
        "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
        [normalized],
      );
      return (result.rows as any[])[0] || null;
    }
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
      [normalized],
    );
    return (rows as any[])[0] || null;
  }

  async findUserById(id: number) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      return memory.users.find((u) => u.id === id) || null;
    }
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query(
        "SELECT * FROM users WHERE id = $1 LIMIT 1",
        [id],
      );
      return (result.rows as any[])[0] || null;
    }
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    return (rows as any[])[0] || null;
  }

  async createUser(userData: any) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const newUser = {
        ...userData,
        id: memory.users.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memory.users.push(newUser);
      return newUser;
    }
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query(
        'INSERT INTO users (email, password, "firstName", "lastName", phone, "userType", "isActive", "emailVerified", "profileData") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        [
          userData.email,
          userData.password,
          userData.firstName,
          userData.lastName,
          userData.phone ?? null,
          userData.userType,
          userData.isActive ? true : false,
          userData.emailVerified ? true : false,
          userData.profileData ? JSON.stringify(userData.profileData) : null,
        ],
      );
      return (result.rows as any[])[0];
    }
    const fields = [
      "email",
      "password",
      "firstName",
      "lastName",
      "phone",
      "userType",
      "isActive",
      "emailVerified",
      "profileData",
    ];
    const values = [
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.phone ?? null,
      userData.userType,
      userData.isActive ? 1 : 0,
      userData.emailVerified ? 1 : 0,
      userData.profileData ? JSON.stringify(userData.profileData) : null,
    ];
    const placeholders = fields.map(() => "?").join(",");
    const sql = `INSERT INTO users (${fields.join(",")}) VALUES (${placeholders})`;
    const [result]: any = await pool.execute(sql, values);
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [result.insertId],
    );
    return (rows as any[])[0];
  }

  async updateUser(id: number, userData: any) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const idx = memory.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      memory.users[idx] = {
        ...memory.users[idx],
        ...userData,
        updatedAt: new Date(),
      };
      return memory.users[idx];
    }
    if (MODE === "postgres" && pgPool) {
      const map: Record<string, string> = {
        email: "email",
        password: "password",
        firstName: '"firstName"',
        lastName: '"lastName"',
        phone: "phone",
        userType: '"userType"',
        isActive: '"isActive"',
        emailVerified: '"emailVerified"',
        profileData: '"profileData"',
      };
      const sets: string[] = [];
      const vals: any[] = [];
      let i = 1;
      for (const [k, v] of Object.entries(userData)) {
        if (map[k]) {
          sets.push(`${map[k]} = $${i++}`);
          vals.push(k === "profileData" && v != null ? JSON.stringify(v) : v);
        }
      }
      if (!sets.length) {
        const result = await pgPool.query(
          "SELECT * FROM users WHERE id = $1 LIMIT 1",
          [id],
        );
        return (result.rows as any[])[0] || null;
      }
      const sql = `UPDATE users SET ${sets.join(", ")}, "updatedAt" = NOW() WHERE id = $${i} RETURNING *`;
      vals.push(id);
      const result = await pgPool.query(sql, vals);
      return (result.rows as any[])[0] || null;
    }
    const columns: string[] = [];
    const values: any[] = [];
    for (const [key, val] of Object.entries(userData)) {
      if (
        [
          "email",
          "password",
          "firstName",
          "lastName",
          "phone",
          "userType",
          "isActive",
          "emailVerified",
          "profileData",
        ].includes(key)
      ) {
        columns.push(`${key} = ?`);
        values.push(
          key === "profileData" && val != null ? JSON.stringify(val) : val,
        );
      }
    }
    if (!columns.length) {
      const [rows] = await pool.execute(
        "SELECT * FROM users WHERE id = ? LIMIT 1",
        [id],
      );
      return (rows as any[])[0] || null;
    }
    const sql = `UPDATE users SET ${columns.join(", ")}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    values.push(id);
    await pool.execute(sql, values);
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    return (rows as any[])[0] || null;
  }

  // Scholarships CRUD
  async getAllScholarships() {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      return memory.scholarships.sort(
        (a: any, b: any) => (b.createdAt as any) - (a.createdAt as any),
      );
    }
    await ensureScholarshipsTable();
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query(
        'SELECT * FROM scholarships ORDER BY "createdAt" DESC',
      );
      return result.rows as any[];
    }
    const [rows] = await pool.execute(
      "SELECT * FROM scholarships ORDER BY createdAt DESC",
    );
    return rows as any[];
  }

  async getScholarshipById(id: number) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      return memory.scholarships.find((s: any) => s.id === id) || null;
    }
    await ensureScholarshipsTable();
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query(
        "SELECT * FROM scholarships WHERE id = $1 LIMIT 1",
        [id],
      );
      return (result.rows as any[])[0] || null;
    }
    const [rows] = await pool.execute(
      "SELECT * FROM scholarships WHERE id = ? LIMIT 1",
      [id],
    );
    return (rows as any[])[0] || null;
  }

  async createScholarship(input: any, createdBy?: number) {
    const now = new Date();
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const nextId = memory.scholarships.length
        ? Math.max(...memory.scholarships.map((s: any) => s.id)) + 1
        : 1;
      const rec = {
        id: nextId,
        ...input,
        createdBy: createdBy ?? null,
        currentApplications: 0,
        status: input.status || "active",
        createdAt: now,
        updatedAt: now,
      };
      memory.scholarships.unshift(rec);
      return rec;
    }
    await ensureScholarshipsTable();
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query(
        'INSERT INTO scholarships (title, description, amount, currency, "eligibilityCriteria", "requiredDocuments", "applicationDeadline", "selectionDeadline", "maxApplications", "currentApplications", status, "createdBy", tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',
        [
          input.title,
          input.description,
          input.amount,
          input.currency || "INR",
          JSON.stringify(input.eligibilityCriteria),
          JSON.stringify(input.requiredDocuments),
          input.applicationDeadline,
          input.selectionDeadline ?? null,
          input.maxApplications ?? null,
          0,
          input.status || "active",
          createdBy ?? null,
          input.tags ? JSON.stringify(input.tags) : null,
        ],
      );
      return (result.rows as any[])[0];
    }
    const fields = [
      "title",
      "description",
      "amount",
      "currency",
      "eligibilityCriteria",
      "requiredDocuments",
      "applicationDeadline",
      "selectionDeadline",
      "maxApplications",
      "currentApplications",
      "status",
      "createdBy",
      "tags",
    ];
    const values = [
      input.title,
      input.description,
      input.amount,
      input.currency || "INR",
      JSON.stringify(input.eligibilityCriteria),
      JSON.stringify(input.requiredDocuments),
      input.applicationDeadline,
      input.selectionDeadline ?? null,
      input.maxApplications ?? null,
      0,
      input.status || "active",
      createdBy ?? null,
      input.tags ? JSON.stringify(input.tags) : null,
    ];
    const placeholders = fields.map(() => "?").join(",");
    const [result]: any = await pool.execute(
      `INSERT INTO scholarships (${fields.join(",")}) VALUES (${placeholders})`,
      values,
    );
    const [rows] = await pool.execute(
      "SELECT * FROM scholarships WHERE id = ? LIMIT 1",
      [result.insertId],
    );
    return (rows as any[])[0];
  }

  async updateScholarship(id: number, data: any) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const idx = memory.scholarships.findIndex((s: any) => s.id === id);
      if (idx === -1) return null;
      memory.scholarships[idx] = {
        ...memory.scholarships[idx],
        ...data,
        updatedAt: new Date(),
      };
      return memory.scholarships[idx];
    }
    await ensureScholarshipsTable();
    if (MODE === "postgres" && pgPool) {
      const map: Record<string, string> = {
        title: "title",
        description: "description",
        amount: "amount",
        currency: "currency",
        eligibilityCriteria: '"eligibilityCriteria"',
        requiredDocuments: '"requiredDocuments"',
        applicationDeadline: '"applicationDeadline"',
        selectionDeadline: '"selectionDeadline"',
        maxApplications: '"maxApplications"',
        currentApplications: '"currentApplications"',
        status: "status",
        tags: "tags",
      };
      const sets: string[] = [];
      const vals: any[] = [];
      let i = 1;
      for (const [k, v] of Object.entries(data)) {
        if (map[k]) {
          sets.push(`${map[k]} = $${i++}`);
          vals.push(
            (k === "eligibilityCriteria" ||
              k === "requiredDocuments" ||
              k === "tags") &&
              v != null
              ? JSON.stringify(v)
              : v,
          );
        }
      }
      if (!sets.length) return this.getScholarshipById(id);
      const sql = `UPDATE scholarships SET ${sets.join(", ")}, "updatedAt" = NOW() WHERE id = $${i} RETURNING *`;
      vals.push(id);
      const result = await pgPool.query(sql, vals);
      return (result.rows as any[])[0];
    }
    const cols: string[] = [];
    const vals: any[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (
        [
          "title",
          "description",
          "amount",
          "currency",
          "eligibilityCriteria",
          "requiredDocuments",
          "applicationDeadline",
          "selectionDeadline",
          "maxApplications",
          "currentApplications",
          "status",
          "tags",
        ].includes(k)
      ) {
        cols.push(`${k} = ?`);
        vals.push(
          (k === "eligibilityCriteria" ||
            k === "requiredDocuments" ||
            k === "tags") &&
            v != null
            ? JSON.stringify(v)
            : v,
        );
      }
    }
    if (!cols.length) return this.getScholarshipById(id);
    vals.push(id);
    await pool.execute(
      `UPDATE scholarships SET ${cols.join(", ")}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      vals,
    );
    const [rows] = await pool.execute(
      "SELECT * FROM scholarships WHERE id = ? LIMIT 1",
      [id],
    );
    return (rows as any[])[0];
  }

  async deleteScholarship(id: number) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const idx = memory.scholarships.findIndex((s: any) => s.id === id);
      if (idx === -1) return false;
      memory.scholarships.splice(idx, 1);
      return true;
    }
    await ensureScholarshipsTable();
    if (MODE === "postgres" && pgPool) {
      await pgPool.query("DELETE FROM scholarships WHERE id = $1", [id]);
      return true;
    }
    await pool.execute("DELETE FROM scholarships WHERE id = ?", [id]);
    return true;
  }

  // Announcements
  async getAnnouncements(
    params: { limit?: number; activeOnly?: boolean } = {},
  ) {
    const limit = params.limit ?? 5;
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      let list = [...memory.announcements];
      if (params.activeOnly) list = list.filter((a: any) => a.isActive);
      list.sort(
        (a: any, b: any) => (b.createdAt as any) - (a.createdAt as any),
      );
      return list.slice(0, limit);
    }
    await ensureAnnouncementsTable();
    if (MODE === "postgres" && pgPool) {
      const where = params.activeOnly ? 'WHERE "isActive" = TRUE' : "";
      const result = await pgPool.query(
        `SELECT * FROM announcements ${where} ORDER BY "createdAt" DESC LIMIT $1`,
        [limit],
      );
      return result.rows as any[];
    }
    const where = params.activeOnly ? "WHERE isActive = 1" : "";
    const [rows] = await pool.execute(
      `SELECT * FROM announcements ${where} ORDER BY createdAt DESC LIMIT ?`,
      [limit],
    );
    return rows as any[];
  }

  async getAnnouncementById(id: number) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      return memory.announcements.find((a: any) => a.id === id) || null;
    }
    await ensureAnnouncementsTable();
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query(
        "SELECT * FROM announcements WHERE id = $1 LIMIT 1",
        [id],
      );
      return (result.rows as any[])[0] || null;
    }
    const [rows] = await pool.execute(
      "SELECT * FROM announcements WHERE id = ? LIMIT 1",
      [id],
    );
    return (rows as any[])[0] || null;
  }

  // Applications
  async getApplications(params: {
    page?: number;
    limit?: number;
    status?: string;
    studentId?: number;
    scholarshipId?: number;
    reviewerId?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      let list = [...memory.applications].sort(
        (a, b) => (b.submittedAt as any) - (a.submittedAt as any),
      );
      if (params.status && params.status !== "all")
        list = list.filter(
          (a) =>
            String(a.status).toLowerCase() ===
            String(params.status).toLowerCase(),
        );
      if (params.studentId)
        list = list.filter((a) => a.studentId === params.studentId);
      if (params.reviewerId)
        list = list.filter((a) => a.assignedReviewerId === params.reviewerId);
      if (params.scholarshipId)
        list = list.filter((a) => a.scholarshipId === params.scholarshipId);
      const pageData = list.slice(offset, offset + limit);
      return {
        data: pageData,
        pagination: {
          page,
          limit,
          total: list.length,
          totalPages: Math.ceil(list.length / limit),
        },
      };
    }
    await ensureApplicationsTable();
    if (MODE === "postgres" && pgPool) {
      const where: string[] = [];
      const vals: any[] = [];
      if (params.status && params.status !== "all") {
        where.push("status = $" + (vals.length + 1));
        vals.push(params.status);
      }
      if (params.studentId) {
        where.push('"studentId" = $' + (vals.length + 1));
        vals.push(params.studentId);
      }
      if (params.reviewerId) {
        where.push('"assignedReviewerId" = $' + (vals.length + 1));
        vals.push(params.reviewerId);
      }
      if (params.scholarshipId) {
        where.push('"scholarshipId" = $' + (vals.length + 1));
        vals.push(params.scholarshipId);
      }
      const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
      const dataRes = await pgPool.query(
        `SELECT * FROM applications ${whereSql} ORDER BY "submittedAt" DESC OFFSET $${vals.length + 1} LIMIT $${vals.length + 2}`,
        [...vals, offset, limit],
      );
      const countRes = await pgPool.query(
        `SELECT COUNT(*)::int as cnt FROM applications ${whereSql}`,
        vals,
      );
      const total = (countRes.rows as any[])[0]?.cnt || 0;
      return {
        data: dataRes.rows as any[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    const where: string[] = [];
    const vals: any[] = [];
    if (params.status && params.status !== "all") {
      where.push("status = ?");
      vals.push(params.status);
    }
    if (params.studentId) {
      where.push("studentId = ?");
      vals.push(params.studentId);
    }
    if (params.reviewerId) {
      where.push("assignedReviewerId = ?");
      vals.push(params.reviewerId);
    }
    if (params.scholarshipId) {
      where.push("scholarshipId = ?");
      vals.push(params.scholarshipId);
    }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await pool.execute(
      `SELECT * FROM applications ${whereSql} ORDER BY submittedAt DESC LIMIT ? OFFSET ?`,
      [...vals, limit, offset],
    );
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM applications ${whereSql}`,
      vals,
    );
    const total = (countRows as any[])[0]?.cnt || 0;
    return {
      data: rows as any[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRecentApplications(limit = 5) {
    const res = await this.getApplications({ page: 1, limit });
    return res.data;
  }

  async getApplicationStats() {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const total = memory.applications.length;
      const by = (st: string) =>
        memory.applications.filter((a) => a.status === st).length;
      const totalAppliedAmount = memory.applications.reduce((acc, a) => {
        const s = memory.scholarships.find(
          (x: any) => x.id === a.scholarshipId,
        );
        const amt =
          s && s.amount ? Number(String(s.amount).replace(/[^0-9.]/g, "")) : 0;
        return acc + (isNaN(amt) ? 0 : amt);
      }, 0);
      return {
        total,
        submitted: by("submitted"),
        under_review: by("under_review"),
        approved: by("approved"),
        rejected: by("rejected"),
        waitlisted: by("waitlisted"),
        total_applied_amount: totalAppliedAmount,
      };
    }
    await ensureApplicationsTable();
    if (MODE === "postgres" && pgPool) {
      const totalRes = await pgPool.query(
        "SELECT COUNT(*)::int as cnt FROM applications",
      );
      const groupRes = await pgPool.query(
        "SELECT status, COUNT(*)::int as cnt FROM applications GROUP BY status",
      );
      const total = (totalRes.rows as any[])[0]?.cnt || 0;
      const map: any = {
        total,
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
        total_applied_amount: 0,
      };
      for (const r of groupRes.rows as any[]) map[r.status] = r.cnt;
      try {
        const sumRes = await pgPool.query(
          'SELECT COALESCE(SUM(s.amount)::numeric,0) as total FROM applications a JOIN scholarships s ON s.id = a."scholarshipId"',
        );
        const sumVal = (sumRes.rows as any[])[0]?.total;
        map.total_applied_amount =
          typeof sumVal === "string" ? parseFloat(sumVal) : Number(sumVal || 0);
      } catch {}
      return map;
    }
    const [totalRows] = await pool.execute(
      "SELECT COUNT(*) as cnt FROM applications",
    );
    const [groupRows] = await pool.execute(
      "SELECT status, COUNT(*) as cnt FROM applications GROUP BY status",
    );
    const total = (totalRows as any[])[0]?.cnt || 0;
    const map: any = {
      total,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      waitlisted: 0,
      total_applied_amount: 0,
    };
    for (const r of groupRows as any[]) map[r.status] = Number(r.cnt || 0);
    try {
      const [sumRows] = await pool.execute(
        "SELECT COALESCE(SUM(s.amount),0) as total FROM applications a JOIN scholarships s ON s.id = a.scholarshipId",
      );
      const sumVal = (sumRows as any[])[0]?.total;
      map.total_applied_amount = Number(sumVal || 0);
    } catch {}
    return map;
  }

  async getApplicationStatsForStudent(studentId: number) {
    if (!studentId)
      return {
        total: 0,
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
      };
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const arr = memory.applications.filter((a) => a.studentId === studentId);
      const total = arr.length;
      const by = (st: string) => arr.filter((a) => a.status === st).length;
      return {
        total,
        submitted: by("submitted"),
        under_review: by("under_review"),
        approved: by("approved"),
        rejected: by("rejected"),
        waitlisted: by("waitlisted"),
      };
    }
    await ensureApplicationsTable();
    if (MODE === "postgres" && pgPool) {
      const totalRes = await pgPool.query(
        'SELECT COUNT(*)::int as cnt FROM applications WHERE "studentId" = $1',
        [studentId],
      );
      const groupRes = await pgPool.query(
        'SELECT status, COUNT(*)::int as cnt FROM applications WHERE "studentId" = $1 GROUP BY status',
        [studentId],
      );
      const total = (totalRes.rows as any[])[0]?.cnt || 0;
      const map: any = {
        total,
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
      };
      for (const r of groupRes.rows as any[]) map[r.status] = r.cnt;
      return map;
    }
    const [totalRows] = await pool.execute(
      "SELECT COUNT(*) as cnt FROM applications WHERE studentId = ?",
      [studentId],
    );
    const [groupRows] = await pool.execute(
      "SELECT status, COUNT(*) as cnt FROM applications WHERE studentId = ? GROUP BY status",
      [studentId],
    );
    const total = (totalRows as any[])[0]?.cnt || 0;
    const map: any = {
      total,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      waitlisted: 0,
    };
    for (const r of groupRows as any[]) map[r.status] = Number(r.cnt || 0);
    return map;
  }

  async getApplicationStatsForReviewer(reviewerId: number) {
    if (!reviewerId)
      return {
        total: 0,
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
      };
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const arr = memory.applications.filter(
        (a) => a.assignedReviewerId === reviewerId,
      );
      const total = arr.length;
      const by = (st: string) => arr.filter((a) => a.status === st).length;
      return {
        total,
        submitted: by("submitted"),
        under_review: by("under_review"),
        approved: by("approved"),
        rejected: by("rejected"),
        waitlisted: by("waitlisted"),
      };
    }
    await ensureApplicationsTable();
    if (MODE === "postgres" && pgPool) {
      const totalRes = await pgPool.query(
        'SELECT COUNT(*)::int as cnt FROM applications WHERE "assignedReviewerId" = $1',
        [reviewerId],
      );
      const groupRes = await pgPool.query(
        'SELECT status, COUNT(*)::int as cnt FROM applications WHERE "assignedReviewerId" = $1 GROUP BY status',
        [reviewerId],
      );
      const total = (totalRes.rows as any[])[0]?.cnt || 0;
      const map: any = {
        total,
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
      };
      for (const r of groupRes.rows as any[]) map[r.status] = r.cnt;
      return map;
    }
    const [totalRows] = await pool.execute(
      "SELECT COUNT(*) as cnt FROM applications WHERE assignedReviewerId = ?",
      [reviewerId],
    );
    const [groupRows] = await pool.execute(
      "SELECT status, COUNT(*) as cnt FROM applications WHERE assignedReviewerId = ? GROUP BY status",
      [reviewerId],
    );
    const total = (totalRows as any[])[0]?.cnt || 0;
    const map: any = {
      total,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      waitlisted: 0,
    };
    for (const r of groupRows as any[]) map[r.status] = Number(r.cnt || 0);
    return map;
  }

  async createApplication(
    input: { scholarshipId: number; applicationData?: any; documents?: any },
    studentId?: number,
  ) {
    const now = new Date();
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const nextId = memory.applications.length
        ? Math.max(...memory.applications.map((a) => a.id)) + 1
        : 1;
      const rec: any = {
        id: nextId,
        scholarshipId: input.scholarshipId,
        studentId: studentId || 0,
        status: "submitted",
        score: null,
        amountAwarded: null,
        assignedReviewerId: null,
        formData: input.applicationData || {},
        documents: input.documents || [],
        submittedAt: now,
        updatedAt: now,
      };
      memory.applications.unshift(rec);
      return rec;
    }
    await ensureApplicationsTable();
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query(
        'INSERT INTO applications ("scholarshipId", "studentId", status, score, "amountAwarded", "assignedReviewerId", "formData", documents, "submittedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING *',
        [
          input.scholarshipId,
          studentId || null,
          "submitted",
          null,
          null,
          null,
          input.applicationData ? JSON.stringify(input.applicationData) : null,
          input.documents ? JSON.stringify(input.documents) : null,
        ],
      );
      return (result.rows as any[])[0];
    }
    const [result]: any = await pool.execute(
      "INSERT INTO applications (scholarshipId, studentId, status, score, amountAwarded, assignedReviewerId, formData, documents, submittedAt) VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)",
      [
        input.scholarshipId,
        studentId || null,
        "submitted",
        null,
        null,
        null,
        input.applicationData ? JSON.stringify(input.applicationData) : null,
        input.documents ? JSON.stringify(input.documents) : null,
      ],
    );
    const [rows] = await pool.execute(
      "SELECT * FROM applications WHERE id = ? LIMIT 1",
      [result.insertId],
    );
    return (rows as any[])[0];
  }

  async updateApplication(
    id: number,
    data: {
      status?: string;
      assignedReviewerId?: number | null;
      score?: number | null;
      amountAwarded?: number | null;
      reviewNotes?: string | null;
    },
  ) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const idx = memory.applications.findIndex((a: any) => a.id === id);
      if (idx === -1) return null;
      const next = { ...memory.applications[idx] } as any;
      if (data.status) next.status = data.status;
      if ("assignedReviewerId" in data)
        next.assignedReviewerId = data.assignedReviewerId ?? null;
      if ("score" in data) next.score = data.score ?? null;
      if ("amountAwarded" in data)
        next.amountAwarded = data.amountAwarded ?? null;
      if ("reviewNotes" in data) next.reviewNotes = data.reviewNotes ?? null;
      next.updatedAt = new Date();
      memory.applications[idx] = next;
      return next;
    }
    await ensureApplicationsTable();
    if (MODE === "postgres" && pgPool) {
      const sets: string[] = [];
      const vals: any[] = [];
      let i = 1;
      if (data.status) {
        sets.push(`status = $${i++}`);
        vals.push(data.status);
      }
      if ("assignedReviewerId" in data) {
        sets.push(`"assignedReviewerId" = $${i++}`);
        vals.push(data.assignedReviewerId);
      }
      if ("score" in data) {
        sets.push(`score = $${i++}`);
        vals.push(data.score);
      }
      if ("amountAwarded" in data) {
        sets.push(`"amountAwarded" = $${i++}`);
        vals.push(data.amountAwarded);
      }
      if ("reviewNotes" in data) {
        sets.push(`"reviewNotes" = $${i++}`);
        vals.push(data.reviewNotes);
      }
      if (!sets.length) {
        const res = await pgPool.query(
          "SELECT * FROM applications WHERE id = $1",
          [id],
        );
        return (res.rows as any[])[0] || null;
      }
      const sql = `UPDATE applications SET ${sets.join(", ")}, "updatedAt" = NOW() WHERE id = $${i} RETURNING *`;
      vals.push(id);
      const result = await pgPool.query(sql, vals);
      return (result.rows as any[])[0] || null;
    }
    const cols: string[] = [];
    const vals: any[] = [];
    if (data.status !== undefined) {
      cols.push("status = ?");
      vals.push(data.status);
    }
    if (data.assignedReviewerId !== undefined) {
      cols.push("assignedReviewerId = ?");
      vals.push(data.assignedReviewerId);
    }
    if (data.score !== undefined) {
      cols.push("score = ?");
      vals.push(data.score);
    }
    if (data.amountAwarded !== undefined) {
      cols.push("amountAwarded = ?");
      vals.push(data.amountAwarded);
    }
    if (data.reviewNotes !== undefined) {
      cols.push("reviewNotes = ?");
      vals.push(data.reviewNotes);
    }
    if (!cols.length) {
      const [rows] = await pool.execute(
        "SELECT * FROM applications WHERE id = ?",
        [id],
      );
      return (rows as any[])[0] || null;
    }
    await pool.execute(
      `UPDATE applications SET ${cols.join(", ")}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [...vals, id],
    );
    const [rows] = await pool.execute(
      "SELECT * FROM applications WHERE id = ?",
      [id],
    );
    return (rows as any[])[0] || null;
  }
  async createReview(input: {
    applicationId: number;
    reviewerId: number;
    criteria?: any;
    overallScore?: number | null;
    comments?: string | null;
    recommendation?: string | null;
    isComplete?: boolean | null;
  }) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      const nextId = (
        memory.reviews.length
          ? Math.max(...memory.reviews.map((r: any) => r.id)) + 1
          : 1
      ) as number;
      const rec: any = {
        id: nextId,
        applicationId: input.applicationId,
        reviewerId: input.reviewerId,
        criteria: input.criteria ?? null,
        overallScore:
          input.overallScore == null ? null : Number(input.overallScore),
        comments: input.comments ?? null,
        recommendation: input.recommendation ?? null,
        isComplete: input.isComplete == null ? true : !!input.isComplete,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memory.reviews.unshift(rec);
      return rec;
    }
    await ensureReviewsTable();
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query(
        'INSERT INTO application_reviews ("applicationId","reviewerId", criteria, "overallScore", comments, recommendation, "isComplete") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [
          input.applicationId,
          input.reviewerId,
          input.criteria ? JSON.stringify(input.criteria) : null,
          input.overallScore == null ? null : Number(input.overallScore),
          input.comments ?? null,
          input.recommendation ?? null,
          input.isComplete == null ? true : !!input.isComplete,
        ],
      );
      return (result.rows as any[])[0];
    }
    const [res]: any = await pool.execute(
      "INSERT INTO application_reviews (applicationId, reviewerId, criteria, overallScore, comments, recommendation, isComplete) VALUES (?,?,?,?,?,?,?)",
      [
        input.applicationId,
        input.reviewerId,
        input.criteria ? JSON.stringify(input.criteria) : null,
        input.overallScore == null ? null : Number(input.overallScore),
        input.comments ?? null,
        input.recommendation ?? null,
        input.isComplete == null ? 1 : input.isComplete ? 1 : 0,
      ],
    );
    const insertId = (res && (res.insertId || res[0]?.insertId)) || undefined;
    if (insertId) {
      const [rows]: any = await pool.execute(
        "SELECT * FROM application_reviews WHERE id = ?",
        [insertId],
      );
      return (rows as any[])[0];
    }
    return {
      applicationId: input.applicationId,
      reviewerId: input.reviewerId,
      criteria: input.criteria ?? null,
      overallScore:
        input.overallScore == null ? null : Number(input.overallScore),
      comments: input.comments ?? null,
      recommendation: input.recommendation ?? null,
      isComplete: input.isComplete == null ? 1 : input.isComplete ? 1 : 0,
    } as any;
  }

  async listReviews(params: { applicationId?: number; reviewerId?: number }) {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      let arr = [...memory.reviews];
      if (params.applicationId)
        arr = arr.filter((r) => r.applicationId === params.applicationId);
      if (params.reviewerId)
        arr = arr.filter((r) => r.reviewerId === params.reviewerId);
      arr.sort((a: any, b: any) => (b.createdAt as any) - (a.createdAt as any));
      return arr;
    }
    await ensureReviewsTable();
    if (MODE === "postgres" && pgPool) {
      const where: string[] = [];
      const vals: any[] = [];
      if (params.applicationId) {
        where.push('"applicationId" = $' + (vals.length + 1));
        vals.push(params.applicationId);
      }
      if (params.reviewerId) {
        where.push('"reviewerId" = $' + (vals.length + 1));
        vals.push(params.reviewerId);
      }
      const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
      const result = await pgPool.query(
        `SELECT * FROM application_reviews ${whereSql} ORDER BY "createdAt" DESC`,
        vals,
      );
      return result.rows as any[];
    }
    const where: string[] = [];
    const vals: any[] = [];
    if (params.applicationId) {
      where.push("applicationId = ?");
      vals.push(params.applicationId);
    }
    if (params.reviewerId) {
      where.push("reviewerId = ?");
      vals.push(params.reviewerId);
    }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await pool.execute(
      `SELECT * FROM application_reviews ${whereSql} ORDER BY createdAt DESC`,
      vals,
    );
    return rows as any[];
  }
}

export const mockDatabase = new DatabaseAdapter();

// Public API for server/index.ts and routes/test.ts
export async function testConnection() {
  try {
    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      return {
        success: true,
        data: [
          {
            version: "Mock DB",
            current_time: new Date().toISOString(),
            database_name: PG_URL || DB_NAME || "in-memory",
          },
        ],
        message: "Mock database connection successful",
      };
    }
    if (MODE === "postgres" && pgPool) {
      const result = await pgPool.query("SELECT version() as version");
      return {
        success: true,
        data: [
          {
            version: (result.rows as any[])[0].version,
            current_time: new Date().toISOString(),
            database_name: PG_URL,
          },
        ],
        message: "Database connection successful",
      };
    }
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT VERSION() as version");
    conn.release();
    return {
      success: true,
      data: [
        {
          version: (rows as any[])[0].version,
          current_time: new Date().toISOString(),
          database_name: DB_NAME,
        },
      ],
      message: "Database connection successful",
    };
  } catch (error) {
    console.error("Database connection failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function initializeDatabase() {
  try {
    if (USE_MOCK) {
      return { success: true };
    }
    if (MODE === "postgres" && pgPool) {
      await ensureUsersTable();
      await ensureScholarshipsTable();
      await ensureApplicationsTable();
      await ensureAnnouncementsTable();
      await ensureReviewsTable();
      return { success: true };
    }
    if (!pool) return { success: true };
    await ensureUsersTable();
    await ensureScholarshipsTable();
    await ensureApplicationsTable();
    await ensureAnnouncementsTable();
    await ensureReviewsTable();
    return { success: true };
  } catch (error) {
    console.error("Database initialization failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createDefaultUsers() {
  try {
    const defaults = [
      {
        email: "student@ydf.org",
        password: "Student123!",
        firstName: "Demo",
        lastName: "Student",
        phone: "+91 9876543210",
        userType: "student",
        profileData: {
          course: "B.Tech Computer Science",
          college: "Demo College",
        },
        isActive: true,
        emailVerified: true,
      },
      {
        email: "admin@ydf.org",
        password: "Admin123!",
        firstName: "Demo",
        lastName: "Admin",
        phone: "+91 9876543211",
        userType: "admin",
        profileData: { department: "Administration" },
        isActive: true,
        emailVerified: true,
      },
      {
        email: "reviewer@ydf.org",
        password: "Reviewer123!",
        firstName: "Demo",
        lastName: "Reviewer",
        phone: "+91 9876543212",
        userType: "reviewer",
        profileData: { specialization: "Academic Review" },
        isActive: true,
        emailVerified: true,
      },
      {
        email: "donor@ydf.org",
        password: "Donor123!",
        firstName: "Demo",
        lastName: "Donor",
        phone: "+91 9876543213",
        userType: "donor",
        profileData: { organization: "Demo Foundation" },
        isActive: true,
        emailVerified: true,
      },
      {
        email: "surveyor@ydf.org",
        password: "Surveyor123!",
        firstName: "Demo",
        lastName: "Surveyor",
        phone: "+91 9876543214",
        userType: "surveyor",
        profileData: { department: "Field Verification" },
        isActive: true,
        emailVerified: true,
      },
      // Additional seeded users
      {
        email: "student2@ydf.org",
        password: "Student234!",
        firstName: "Asha",
        lastName: "Verma",
        phone: "+91 9000003030",
        userType: "student",
        profileData: {
          course: "B.Sc Mathematics",
          college: "Arya College",
          year: "2nd Year",
        },
        isActive: true,
        emailVerified: true,
      },
      {
        email: "student3@ydf.org",
        password: "Student345!",
        firstName: "Rahul",
        lastName: "Mehta",
        phone: "+91 9000004040",
        userType: "student",
        profileData: {
          course: "B.Com",
          college: "City Commerce College",
          year: "1st Year",
        },
        isActive: true,
        emailVerified: true,
      },
      {
        email: "reviewer2@ydf.org",
        password: "Reviewer234!",
        firstName: "Priya",
        lastName: "Sharma",
        phone: "+91 9000005050",
        userType: "reviewer",
        profileData: { specialization: "Financial Aid" },
        isActive: true,
        emailVerified: true,
      },
      {
        email: "reviewer3@ydf.org",
        password: "Reviewer345!",
        firstName: "Arjun",
        lastName: "Patel",
        phone: "+91 9000006060",
        userType: "reviewer",
        profileData: { specialization: "STEM Programs" },
        isActive: true,
        emailVerified: true,
      },
    ];

    if (USE_MOCK || (MODE !== "postgres" && !pool)) {
      for (const u of defaults) {
        const existing = memory.users.find((x) => x.email === u.email);
        const hashed = await hashPassword(u.password);
        if (!existing) {
          memory.users.push({
            id: memory.users.length
              ? Math.max(...memory.users.map((m: any) => m.id)) + 1
              : 1,
            email: u.email,
            password: hashed,
            firstName: u.firstName,
            lastName: u.lastName,
            phone: u.phone,
            userType: u.userType,
            isActive: u.isActive,
            emailVerified: u.emailVerified,
            profileData: u.profileData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          existing.password = hashed;
          existing.userType = u.userType;
          existing.isActive = true;
          existing.emailVerified = true;
          existing.updatedAt = new Date();
        }
      }
      return { success: true };
    }

    await ensureUsersTable();

    for (const u of defaults) {
      const existing = await mockDatabase.findUserByEmail(u.email);
      if (!existing) {
        const hashed = await hashPassword(u.password);
        await mockDatabase.createUser({ ...u, password: hashed });
      } else {
        const toUpdate: any = {};
        if (existing.userType !== u.userType) toUpdate.userType = u.userType;
        if (existing.isActive !== u.isActive) toUpdate.isActive = u.isActive;
        if (existing.emailVerified !== u.emailVerified)
          toUpdate.emailVerified = u.emailVerified;
        if (Object.keys(toUpdate).length) {
          await mockDatabase.updateUser(existing.id, toUpdate);
        }
      }
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
