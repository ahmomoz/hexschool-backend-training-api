const express = require("express");
const cors = require("cors");
const path = require("path");
const pinoHttp = require("pino-http");

const logger = require("@/utils/logger")("App");
const creditPackageRouter = require("@/routes/creditPackage");
const coachRouter = require("@/routes/admin/coaches");
const skillRouter = require("@/routes/admin/coaches/skills");
const userRouter = require("@/routes/users");

const { NotFound } = require("@/errors");
const { globalErrorHandler } = require("@/middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        req.body = req.raw.body;
        return req;
      },
    },
  }),
);
app.use(express.static(path.join(__dirname, "public")));

app.get("/healthcheck", (req, res) => {
  res.status(200);
  res.send("OK");
});

// 業務路由
app.use("/api/credit-package", creditPackageRouter);
app.use("/api/admin/coaches/skill", skillRouter);
app.use("/api/admin/coaches", coachRouter);
app.use("/api/users", userRouter);

// 處理「找不到路徑 (404)」的中間件
app.all("*", (req, res, next) => {
  // 拋出 NotFound 錯誤，會自動進入下方的 globalErrorHandler
  next(NotFound(`找不到路由: ${req.originalUrl}`));
});

// 全域錯誤處理器
app.use(globalErrorHandler);

module.exports = app;
