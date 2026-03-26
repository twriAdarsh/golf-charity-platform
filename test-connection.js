import axios from 'axios';

// Test MongoDB connection via health endpoint
const testConnection = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Server is running:', response.data);
  } catch (error) {
    console.log('❌ Server error:', error.message);
  }
};

testConnection();
