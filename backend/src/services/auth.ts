import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    agencyId: string;
    role: string;
}

/**
 * Authentication Service
 */
export const authService = {
    /**
     * Hash a password
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    },

    /**
     * Verify a password against hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    },

    /**
     * Generate JWT token
     */
    generateToken(payload: JWTPayload): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    },

    /**
     * Verify JWT token
     */
    verifyToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    },

    /**
     * Register new agency and owner user
     */
    async register(email: string, password: string, agencyName: string) {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Create agency
        const agency = await db.createAgency(agencyName);

        // Create owner user
        const passwordHash = await this.hashPassword(password);
        const user = await db.createUser(email, passwordHash, agency.id, 'owner');

        // Generate token
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            agencyId: user.agency_id,
            role: user.role
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                agencyId: user.agency_id
            },
            token,
            agency: {
                id: agency.id,
                name: agency.name
            }
        };
    },

    /**
     * Login user
     */
    async login(email: string, password: string) {
        const user = await db.getUserByEmail(email);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await this.verifyPassword(password, user.password_hash);

        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            agencyId: user.agency_id,
            role: user.role
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                agencyId: user.agency_id
            },
            token
        };
    }
};
