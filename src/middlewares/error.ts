import { Request, Response, NextFunction } from 'express';

const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if an error occurred
  if (err) {
    console.error(err);

    // Handle the error and send a response to the client
    res.status(500).json({
      error: 'Internal Server Error',
    });
  } else {
    // If no error occurred, pass control to the next middleware
    next();
  }
};

export default errorHandlerMiddleware;
