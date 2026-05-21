import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
//import 'dotenv/config';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerDocs from './_helpers/swagger';

const app = express();

// Parses urlencoded bodies (extended: true allows handling the rich HTML form data safely)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from frontend and with credentials
app.use(cors({ 
  origin: [
    'https://final-project-frontend-eo6a.onrender.com', 
], 
  credentials: true 
}));
// api routes
app.use('/accounts', accountsController);

// swagger docs route
app.use('/api-docs', swaggerDocs);

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));