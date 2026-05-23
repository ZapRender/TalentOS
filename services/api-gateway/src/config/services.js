module.exports = {
  auth:     process.env.AUTH_SERVICE_URL     || 'http://auth-service:3001',
  employee: process.env.EMPLOYEE_SERVICE_URL || 'http://employee-service:8080',
  payroll:  process.env.PAYROLL_SERVICE_URL  || 'http://payroll-service:9000',
  training: process.env.TRAINING_SERVICE_URL || 'http://training-service:3002',
};
