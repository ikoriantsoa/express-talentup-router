import winston from "winston";
import "winston-daily-rotate-file";

class Logger {
  private logger: winston.Logger;

  constructor() {
   

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.metadata({
          fillExcept: ["message", "level", "timestamp"],
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
          dirname: "logs",
          filename: "%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxFiles: "30d",
          zippedArchive: true,
        }),
      ],
    });
  }

  private log(
    level: "info" | "warn" | "error",
    message: string,
    file?: string,
    httpCode?: number
  ): void {
    this.logger.log({
      level,
      message,
      metadata: { file, httpCode },
    });
  }

  public info(message: string, file?: string, httpCode?: number): void {
    this.log('info', message, file, httpCode);
  }

  public warn(message: string, file?: string, httpCode?: number): void {
    this.log('warn', message, file, httpCode);
  }

  public error(message: string, file?: string, httpCode?: number): void {
    this.log('error', message, file, httpCode);
  }
}

export default Logger;
