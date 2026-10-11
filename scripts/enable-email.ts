import Database from 'better-sqlite3';

const email = process.argv[2];

if (!email) {
	console.error('Usage: pnpm enable-email <user@example.com>');
	process.exit(1);
}

const db = new Database(process.env.DATABASE_URL ?? 'local.db');
const { changes } = db.prepare('UPDATE user SET can_send_email = 1 WHERE email = ?').run(email);

if (changes === 0) {
	console.error(`No user found with email ${email}`);
	process.exit(1);
}

console.log(`Email sending enabled for ${email}`);
