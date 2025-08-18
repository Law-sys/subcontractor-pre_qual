// Database initialization and verification script
import { DatabaseService } from './DatabaseService';
import { mongoAuth } from '../auth/mongoAuth';

export class DatabaseInit {
  static async initializeDatabase() {
    try {
      console.log('🔄 Initializing database...');
      
      // Connect to database
      await DatabaseService.connect();
      console.log('✅ Database connected successfully');

      // Initialize default admin users
      await mongoAuth.initializeDefaultUsers();
      console.log('✅ Default admin users initialized');

      // Clean up expired invitations
      await DatabaseService.cleanup();
      console.log('✅ Database cleanup completed');

      // Verify collections exist
      const stats = await DatabaseService.getSubmissionStats();
      console.log('✅ Database verification complete:', {
        submissions: stats.total,
        pendingReviews: stats.pending
      });

      return { success: true, message: 'Database initialized successfully' };
      
    } catch (error: any) {
      console.error('❌ Database initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async getHealthCheck() {
    try {
      await DatabaseService.connect();
      const stats = await DatabaseService.getSubmissionStats();
      
      return {
        status: 'healthy',
        database: 'connected',
        collections: {
          users: 'active',
          invitations: 'active', 
          submissions: 'active'
        },
        stats
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}
