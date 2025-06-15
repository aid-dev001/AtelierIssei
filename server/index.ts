import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import setupRoutes from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { initializeAdmin } from "./admin";

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 静的ファイルのキャッシュ設定
const staticOptions = process.env.NODE_ENV === 'production' 
  ? { maxAge: '1h', etag: true, lastModified: true } // プロダクション: 1時間キャッシュ
  : { maxAge: 0, etag: false, lastModified: false }; // 開発時: キャッシュなし

app.use(express.static('client/public', staticOptions));
app.use('/artworks', express.static('public/artworks', staticOptions));
app.use('/artworks', express.static('.', staticOptions));

const MemoryStoreSession = MemoryStore(session);
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // 24時間でexpire
  }),
  cookie: {
    secure: false, // development環境ではfalse
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24時間
  }
}));

// リクエストロギングミドルウェア
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// グローバルエラーハンドリングミドルウェア
const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error('Server error details:', {
    status,
    message,
    stack: err.stack,
    code: err.code,
    name: err.name
  });

  if (err.code === 'EADDRINUSE') {
    console.error('Port 5000 is already in use. Please make sure no other process is using this port.');
    process.exit(1);
  }

  res.status(status).json({ 
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
};

// サーバーの初期化と起動
async function startServer() {
  try {
    console.log('Starting server initialization...');
    
    // 管理者の初期化
    await initializeAdmin();
    console.log('Admin initialized successfully');
    
    // ルートのセットアップ
    setupRoutes(app);
    console.log('Routes setup completed');
    
    // HTTPサーバーの作成
    const server = createServer(app);
    
    // エラーハンドリングミドルウェアの登録
    app.use(errorHandler);

    // 環境に応じたセットアップ
    console.log('Setting up server environment...');
    try {
      if (process.env.NODE_ENV === "production") {
        console.log('Setting up static serving for production...');
        serveStatic(app);
        console.log('Static serving setup completed');
      } else {
        console.log('Setting up Vite for development...');
        await setupVite(app, server);
        console.log('Vite setup completed');
      }
    } catch (error) {
      console.error('Error during environment setup:', error);
      throw error;
    }

    // サーバーの起動
    const PORT = 5000;
    await new Promise<void>((resolve, reject) => {
      server.listen(PORT, "0.0.0.0", () => {
        log(`Server successfully started and serving on port ${PORT}`);
        resolve();
      });

      server.on('error', (error: any) => {
        console.error('Server failed to start:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Please make sure no other process is using this port.`);
        }
        reject(error);
      });
    });

  } catch (error) {
    console.error('Critical server error:', error);
    process.exit(1);
  }
}

// サーバーの起動
startServer().catch(error => {
  console.error('Unhandled server initialization error:', error);
  process.exit(1);
});
