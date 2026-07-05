import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export function authenticate(
    req: Request, 
    res: Response, 
    next : NextFunction
): void {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer')){
            res.status(401).json({
                success : false,
                message : 'Access token is missing'
            });
            return ;

        }
        const token = authHeader.split(' ')[1];

        if(!token){
            res.status(401).json({
                success : false,
                message : 'Access token not proviced'
            })
            return ;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;

    next();
    }catch(error){
        if(error instanceof jwt.TokenExpiredError){
            res.status(401).json({
        success: false,
        message: 'Access token has expired',
      });
      return;
        }

        if(error instanceof jwt.JsonWebTokenError){
              res.status(401).json({
        success: false,
        message: 'Invalid access token',
      });
      return;
        }

        next(error );

    }
}