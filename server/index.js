const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const ConnectDB = require('./DataBaseConnection/connection.js');

// Either import just the router or destructure it from the object
const authRouter = require('./AuthRoutes/Auth.js').router; 
const dataOrderRoutes = require('./orderRou/order.js');
const Deposit = require('./DepositeRoutes/UserDeposite.js');
const Developer = require('./ResellerApi/resellerApi.js')
const HubnetAt = require('./HubnetInteraction/hubnet.js');
const AdminManagement = require('./admin-management/adminManagemet.js')
const passreset = require('./ResetPasword/reset.js')
const Report = require('./Reporting/reporting.js')
const DepositeMorle = require('./DepositeMoorle/moorle.js')
const approveuser = require('./adim-aprove/approve.js')
const registerFriend = require('./regsterFreinds/register.js')
const bulkUpload = require('./bulkPurchase/bulk.js')
const userStats = require('./userInfo/userInfo.js')
const adminOrder = require('./allOrders/allorders.js')
const waiting_orders_export = require('./waitingorders/waiting.js')
const phoneVerification = require('./PhoneVerifyRoutes/Verification.js')
const paystackbuy = require('./mom_buy/page.js')

// WhatsApp Bot Imports
const { initializeAgentBot } = require('./whatSapp_bot/agentBotManager');
const { AgentStore } = require('./Agent_Store_Schema/page');

dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to Database
ConnectDB();

// Routes
app.use('/api/v1', authRouter); // Use the router property
app.use('/api/v1/data', dataOrderRoutes);
app.use('/api/v1', Deposit);
app.use('/api/developer', Developer)
app.use('/api/v1', HubnetAt);
app.use('/api/admin',AdminManagement)
app.use('/api/v1', passreset);
app.use('/api/reports', Report);
app.use('/api/v1', DepositeMorle);
app.use('/api', approveuser)
app.use('/api', registerFriend);
app.use('/api', bulkUpload);
app.use('/api/v1', userStats);
app.use('/api', adminOrder);
app.use('/api/orders', waiting_orders_export);
app.use('/api/verifications', phoneVerification);
app.use('/api/v1/data', paystackbuy);


// Default Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ===== AUTO-RESTART WHATSAPP BOTS ON SERVER START =====
async function restartConnectedBots() {
  try {
    console.log('\n🔄 ========== AUTO-RESTART WHATSAPP BOTS ==========');
    console.log('🔄 Checking for bots to restart...');
    
    // Find stores that had WhatsApp enabled and were connected
    const stores = await AgentStore.find({
      'whatsapp.enabled': true,
      status: 'active'
    }).select('_id storeName whatsapp.isConnected whatsapp.enabled');
    
    if (stores.length === 0) {
      console.log('📱 No stores with WhatsApp enabled found');
      return;
    }
    
    console.log(`📱 Found ${stores.length} store(s) with WhatsApp enabled`);
    
    // Track results
    let successCount = 0;
    let failCount = 0;
    
    for (const store of stores) {
      console.log(`\n🚀 Restarting bot for: ${store.storeName} (${store._id})`);
      
      try {
        // Small delay between each bot start to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const result = await initializeAgentBot(store._id);
        
        if (result.success) {
          console.log(`✅ Bot started for: ${store.storeName}`);
          successCount++;
        } else {
          console.log(`⚠️ Bot start returned: ${result.message}`);
          failCount++;
        }
      } catch (err) {
        console.error(`❌ Failed to restart bot for ${store.storeName}:`, err.message);
        failCount++;
        
        // Update store with error
        await AgentStore.findByIdAndUpdate(store._id, {
          'whatsapp.lastError': `Auto-restart failed: ${err.message}`,
          'whatsapp.isConnected': false
        });
      }
    }
    
    console.log(`\n📊 ========== BOT RESTART SUMMARY ==========`);
    console.log(`✅ Successfully started: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📱 Total: ${stores.length}`);
    console.log('============================================\n');
    
  } catch (error) {
    console.error('❌ Error in restartConnectedBots:', error.message);
  }
}

// ===== LISTEN FOR MONGODB CONNECTION =====
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connection confirmed for bot restart');
  
  // Wait 10 seconds after DB connection, then restart bots
  // This gives time for all schemas to be properly loaded
  setTimeout(() => {
    restartConnectedBots();
  }, 10000);
});

// Also handle if connection is already open
if (mongoose.connection.readyState === 1) {
  setTimeout(() => {
    restartConnectedBots();
  }, 10000);
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 WhatsApp bots will auto-restart in ~15 seconds...`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  
  try {
    const { activeBots } = require('./whatSapp_bot/agentBotManager');
    
    console.log(`🛑 Stopping ${activeBots.size} active bot(s)...`);
    
    for (const [storeId, botData] of activeBots.entries()) {
      try {
        if (botData.client) {
          await botData.client.destroy();
          console.log(`✅ Bot stopped for store: ${storeId}`);
        }
      } catch (e) {
        console.log(`⚠️ Error stopping bot ${storeId}:`, e.message);
      }
    }
    
    activeBots.clear();
    console.log('✅ All bots stopped');
  } catch (e) {
    console.log('⚠️ Error during shutdown:', e.message);
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  process.exit(0);
});