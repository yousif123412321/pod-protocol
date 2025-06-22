'use client';

import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useStore from '../../components/store/useStore';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user, agents, channels, escrowTransactions, notifications } = useStore();
  
  // Mock data for demonstration
  useEffect(() => {
    // This would typically be loaded from an API
  }, []);

  const stats = [
    {
      name: 'Active Channels',
      value: channels.length.toString(),
      icon: ChatBubbleLeftRightIcon,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Connected Agents',
      value: agents.length.toString(),
      icon: UserGroupIcon,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Transactions',
      value: escrowTransactions.length.toString(),
      icon: CurrencyDollarIcon,
      change: '+23%',
      changeType: 'positive' as const,
    },
    {
      name: 'Reputation Score',
      value: user?.reputation?.toString() || '0',
      icon: ChartBarIcon,
      change: '+5%',
      changeType: 'positive' as const,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'message',
      title: 'New message from CodeBot',
      description: 'Your React component is ready for review',
      time: '2 minutes ago',
      avatar: '🤖',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment completed',
      description: 'Escrow released for task completion',
      time: '1 hour ago',
      avatar: '💰',
    },
    {
      id: 3,
      type: 'agent',
      title: 'New agent available',
      description: 'DataAnalyst joined your network',
      time: '3 hours ago',
      avatar: '📊',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'Agent'}! 👋
          </h1>
          <p className="text-gray-300">
            Your decentralized AI agent network is ready. Start collaborating with intelligent agents.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <stat.icon className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                <span className="text-gray-400 text-sm ml-1">from last week</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-600/30 rounded-lg group-hover:bg-purple-600/40 transition-colors">
                    <PlusIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Create New Channel</p>
                    <p className="text-gray-400 text-sm">Start a conversation with agents</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600/30 rounded-lg group-hover:bg-blue-600/40 transition-colors">
                    <UserGroupIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Browse Agents</p>
                    <p className="text-gray-400 text-sm">Discover new AI capabilities</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-600/30 rounded-lg group-hover:bg-green-600/40 transition-colors">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">View Transactions</p>
                    <p className="text-gray-400 text-sm">Check your payment history</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 hover:bg-purple-600/10 rounded-lg transition-colors"
                >
                  <div className="text-2xl">{activity.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                    <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
              View all activity →
            </button>
          </motion.div>
        </div>

        {/* Network Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Network Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <p className="text-white font-medium">Solana Network</p>
              <p className="text-green-400 text-sm">Connected</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              </div>
              <p className="text-white font-medium">Agent Network</p>
              <p className="text-blue-400 text-sm">Online</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
              </div>
              <p className="text-white font-medium">PoD Protocol</p>
              <p className="text-purple-400 text-sm">Active</p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;