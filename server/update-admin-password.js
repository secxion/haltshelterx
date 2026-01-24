require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');

const updateAdminPassword = async () => {
  try {
    console.log('🔐 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Find admin user - try by email first
    let admin = await User.findOne({ email: 'admin@haltshelter.org' });
    
    if (!admin) {
      // Try finding any admin user
      admin = await User.findOne({ role: 'admin' });
    }

    if (!admin) {
      console.log('❌ No admin user found. Creating new admin user...');
      // Create new admin user
      const newPassword = 'Taurus$0217';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      admin = new User({
        email: 'admin@haltshelter.org',
        password: hashedPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User'
      });
      
      await admin.save();
      console.log('✅ New admin user created!');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Password: ${newPassword}`);
    } else {
      console.log(`📧 Found admin user: ${admin.email}`);

      // Hash new password
      const newPassword = 'Taurus$0217';
      console.log('🔒 Hashing new password...');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      admin.password = hashedPassword;
      await admin.save();

      console.log('✅ Admin password updated successfully!');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 New Password: ${newPassword}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
    process.exit(1);
  }
};

updateAdminPassword();
