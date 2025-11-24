// API Configuration
// For local network access, replace YOUR_LAPTOP_IP with your actual IP address
// Example: const API_BASE_URL = 'http://192.168.1.100:5555';
// To find your IP: On Windows run 'ipconfig' in CMD, look for IPv4 Address
// On Mac/Linux run 'ifconfig' or 'ip addr'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5555';

export default API_BASE_URL;

