import * as bcrypt from 'bcrypt';

async function hashPassword(password: string) {
  const saltRounds = 10; // You can adjust this value
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(`Original Password: ${password}`);
  console.log(`Hashed Password: ${hashedPassword}`);
}

// Hash 'admin1234'
hashPassword('admin1234');
