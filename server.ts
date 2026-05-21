import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerDocs from './_helpers/swagger';

const app = express();

/* =========================
   BODY PARSERS
========================= */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

/* =========================
   CORS CONFIG (FIXED FOR RENDER + ANGULAR)
========================= */
const allowedOrigins = [
  'https://final-project-frontend-eo6a.onrender.com',
  'http://localhost:4200'
];

const corsOptions: cors.CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS blocked'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Single cors() middleware — handles both regular and OPTIONS preflight requests
app.use(cors(corsOptions));

/* =========================
   ROUTES
========================= */
app.use('/accounts', accountsController);
app.use('/api-docs', swaggerDocs);

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   START SERVER
========================= */
const port =
  process.env.NODE_ENV === 'production'
    ? (process.env.PORT || 10000)
    : 4000;

app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);