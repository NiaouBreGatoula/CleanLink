import dotenv from 'dotenv';
dotenv.config();

export const token = process.env.TOKEN;
export const virustotalAPI = process.env.VT_API;
export const bypassedRole = process.env.BYPASSED_DISCORD_ROLE;
export const maliciousThreshold = parseInt(process.env.VT_MALICIOUS_THRESHOLD || '1');
