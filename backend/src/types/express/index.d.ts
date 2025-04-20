/*import "express";

declare module "Express" {
  export interface Request {
    user?: {
      userId: number;
      companyId: string;
      role: string;
    };
  }
}*/

import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: number;
      companyId: string;
      role: string;
    };
  }
}
