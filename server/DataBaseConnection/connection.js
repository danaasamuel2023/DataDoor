const mongoose = require('mongoose');

const ConnectDB = () => {
    const password = '0246783840Sa';
    const uri = `mongodb+srv://dajounimarket:${password}@cluster0.kp8c2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

    const connectWithRetry = () => {
        mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 2,
        }).then(() => {
            console.log('Connected to MongoDB');
        }).catch(err => {
            console.error('Failed to connect to MongoDB, retrying in 5s...', err.message);
            setTimeout(connectWithRetry, 5000);
        });
    };

    connectWithRetry();

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
    });
};

module.exports = ConnectDB;
