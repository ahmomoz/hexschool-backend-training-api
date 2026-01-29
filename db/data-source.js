const { DataSource } = require("typeorm");
const config = require("@/config/index");

const Coach = require("@/entities/Coach");
const CoachLinkSkill = require("@/entities/CoachLinkSkill");
const Course = require("@/entities/Course");
const CreditPackage = require("@/entities/CreditPackages");
const Skill = require("@/entities/Skill");
const User = require("@/entities/User");

const dataSource = new DataSource({
  type: "postgres",
  host: config.get("db.host"),
  port: config.get("db.port"),
  username: config.get("db.username"),
  password: config.get("db.password"),
  database: config.get("db.database"),
  synchronize: config.get("db.synchronize"),
  logging: true,
  poolSize: 10,
  entities: [Coach, CoachLinkSkill, Course, CreditPackage, Skill, User],
  ssl: config.get("db.ssl"),
});

module.exports = { dataSource };
