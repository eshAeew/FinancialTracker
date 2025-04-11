import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as fs from 'fs';
import * as path from 'path';

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
  
  // Theme update endpoint
  app.post('/api/update-theme', (req: Request, res: Response) => {
    try {
      const { primary, variant, appearance, radius } = req.body;
      
      // Validate the theme data
      if (!primary || !variant || !appearance || radius === undefined) {
        return res.status(400).json({ error: 'Missing required theme properties' });
      }
      
      // Update the theme.json file
      const themeData = {
        primary,
        variant,
        appearance,
        radius
      };
      
      // Write to theme.json in the project root
      fs.writeFileSync(
        path.join(process.cwd(), 'theme.json'),
        JSON.stringify(themeData, null, 2)
      );
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating theme:', error);
      res.status(500).json({ error: 'Failed to update theme' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
