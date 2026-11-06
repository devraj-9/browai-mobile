import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import {
  Bot,
  Activity,
  Zap,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Search,
  PieChart,
  Send,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Lock,
  Mail,
  KeyRound,
  ChevronRight,
  CheckCircle2
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Data Interfaces
interface MarketAsset {
  symbol: string;
  name: string;
  category: 'STOCKS' | 'CRYPTO' | 'FOREX';
  price: string;
  numericPrice: number;
  change: string;
  isPositive: boolean;
  rsi: number;
  volume: string;
  support: string;
  resistance: string;
  signal: 'STRONG BUY' | 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  chartPoints: number[];
}

const INITIAL_MARKETS: Record<string, MarketAsset> = {
  'NIFTY 50': { symbol: 'NIFTY 50', name: 'NSE India Index', category: 'STOCKS', price: '₹25,030.35', numericPrice: 25030.35, change: '+0.64%', isPositive: true, rsi: 65, volume: '₹14.2B', support: '24,850', resistance: '25,200', signal: 'BULLISH', chartPoints: [40, 45, 42, 58, 55, 68, 72, 85, 90] },
  'BANKNIFTY': { symbol: 'BANKNIFTY', name: 'Nifty Bank Index', category: 'STOCKS', price: '₹51,420.10', numericPrice: 51420.10, change: '-0.25%', isPositive: false, rsi: 48, volume: '₹9.8B', support: '50,900', resistance: '51,800', signal: 'NEUTRAL', chartPoints: [75, 70, 68, 62, 55, 58, 50, 45, 42] },
  'BTC/USD': { symbol: 'BTC/USD', name: 'Bitcoin', category: 'CRYPTO', price: '$68,420.00', numericPrice: 68420.00, change: '+4.12%', isPositive: true, rsi: 76, volume: '$32.1B', support: '$66,500', resistance: '$70,000', signal: 'STRONG BUY', chartPoints: [30, 42, 38, 55, 65, 78, 82, 95, 100] },
  'ETH/USD': { symbol: 'ETH/USD', name: 'Ethereum', category: 'CRYPTO', price: '$2,640.50', numericPrice: 2640.50, change: '+2.85%', isPositive: true, rsi: 62, volume: '$12.4B', support: '$2,500', resistance: '$2,750', signal: 'BULLISH', chartPoints: [50, 52, 48, 60, 64, 70, 75, 80, 84] },
  'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corp', category: 'STOCKS', price: '$135.40', numericPrice: 135.40, change: '+3.42%', isPositive: true, rsi: 71, volume: '$18.5B', support: '$130.00', resistance: '$140.00', signal: 'STRONG BUY', chartPoints: [40, 48, 52, 60, 68, 75, 82, 88, 92] },
  'EUR/USD': { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'FOREX', price: '1.0845', numericPrice: 1.0845, change: '+0.15%', isPositive: true, rsi: 52, volume: '$45.2B', support: '1.0810', resistance: '1.0890', signal: 'NEUTRAL', chartPoints: [50, 49, 51, 50, 52, 53, 52, 54, 55] },
};

export default function App() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Workspace State
  const [activeTab, setActiveTab] = useState<'terminal' | 'copilot' | 'watchlist' | 'screener' | 'portfolio'>('terminal');
  const [marketList, setMarketList] = useState<Record<string, MarketAsset>>(INITIAL_MARKETS);
  const [selectedAssetKey, setSelectedAssetKey] = useState<string>('NIFTY 50');
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'STOCKS' | 'CRYPTO' | 'FOREX'>('ALL');

  // Trade Modal
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderQuantity, setOrderQuantity] = useState('1');

  // Add Top Market Modal
  const [showAddMarketModal, setShowAddMarketModal] = useState(false);
  const [customMarketName, setCustomMarketName] = useState('');
  const [customMarketPrice, setCustomMarketPrice] = useState('');
  const [customMarketCategory, setCustomMarketCategory] = useState<'STOCKS' | 'CRYPTO' | 'FOREX'>('STOCKS');

  // Watchlist State
  const [watchlist, setWatchlist] = useState([
    { id: '1', symbol: 'BTC/USD', category: 'CRYPTO' as const, price: '$68,420.00', change: '+4.12%', isPositive: true },
    { id: '2', symbol: 'NVDA', category: 'STOCKS' as const, price: '$135.40', change: '+3.42%', isPositive: true },
    { id: '3', symbol: 'NIFTY 50', category: 'STOCKS' as const, price: '₹25,030.35', change: '+0.64%', isPositive: true },
    { id: '4', symbol: 'EUR/USD', category: 'FOREX' as const, price: '1.0845', change: '+0.15%', isPositive: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddWatchModal, setShowAddWatchModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState<'STOCKS' | 'CRYPTO' | 'FOREX'>('STOCKS');

  // AI Copilot Chat
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'ai', text: 'Namaste Dev! Main aapka CURV AI Copilot hoon. Technical breakout setups ya resistance target poochiye.' }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  // Portfolio Positions
  const [portfolio, setPortfolio] = useState([
    { id: '1', symbol: 'BTC/USD', qty: '0.25', avgPrice: '$64,200', pnl: '+$1,055.00', isPositive: true },
    { id: '2', symbol: 'NVDA', qty: '15', avgPrice: '$122.10', pnl: '+$199.50', isPositive: true }
  ]);

  const currentAsset = marketList[selectedAssetKey] || marketList['NIFTY 50'];

  // Handlers
  const handleForgotSubmit = () => {
    if (!resetEmail) {
      Alert.alert('Required', 'Please enter your registered email address.');
      return;
    }
    Alert.alert('Reset Link Sent', `Password reset instructions have been sent to ${resetEmail}`);
    setResetEmail('');
    setShowForgotModal(false);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of CURV AI Terminal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => setIsLoggedIn(false) }
    ]);
  };

  const handleSendQuery = (customText?: string) => {
    const text = customText || inputQuery;
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    setTimeout(() => {
      let aiResponse = `AI Analysis for "${text}": Technical structure indicates healthy momentum above key moving averages.`;
      const lower = text.toLowerCase();
      if (lower.includes('nifty')) {
        aiResponse = `NIFTY 50 Analysis: Currently trading near 25,030. Key support is at 24,850. RSI is at 65 (Bullish Zone). Strategy: Buy on dips near 24,920.`;
      } else if (lower.includes('btc') || lower.includes('bitcoin')) {
        aiResponse = `BTC/USD Radar: Institutional volume accumulation detected above $66,500. Resistance target: $70,000. Stop-loss: $65,800.`;
      }

      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponse }]);
    }, 600);
  };

  const handleExecuteOrder = () => {
    const qty = parseFloat(orderQuantity) || 1;
    const newTrade = {
      id: Date.now().toString(),
      symbol: currentAsset.symbol,
      qty: qty.toString(),
      avgPrice: currentAsset.price,
      pnl: '+$0.00 (Active Order)',
      isPositive: true
    };
    setPortfolio([newTrade, ...portfolio]);
    setOrderModalVisible(false);
    Alert.alert('Order Executed', `${orderType} ${qty} unit(s) of ${currentAsset.symbol} at ${currentAsset.price}.`);
  };

  const handleAddCustomMarket = () => {
    if (!customMarketName || !customMarketPrice) {
      Alert.alert('Required', 'Please enter Market Ticker & Price.');
      return;
    }
    const symbolKey = customMarketName.toUpperCase();
    const newMarketObj: MarketAsset = {
      symbol: symbolKey,
      name: `${symbolKey} Asset`,
      category: customMarketCategory,
      price: customMarketPrice.startsWith('$') || customMarketPrice.startsWith('₹') ? customMarketPrice : `$${customMarketPrice}`,
      numericPrice: parseFloat(customMarketPrice) || 100,
      change: '+1.85%',
      isPositive: true,
      rsi: 64,
      volume: '$3.8B',
      support: 'Key Support',
      resistance: 'Target Resistance',
      signal: 'BULLISH',
      chartPoints: [30, 45, 40, 60, 58, 72, 80, 88, 95]
    };

    setMarketList(prev => ({ [symbolKey]: newMarketObj, ...prev }));
    setSelectedAssetKey(symbolKey);
    setCustomMarketName('');
    setCustomMarketPrice('');
    setShowAddMarketModal(false);
  };

  const handleAddWatchlist = () => {
    if (!newSymbol || !newPrice) {
      Alert.alert('Required', 'Please enter ticker symbol and price.');
      return;
    }
    const item = {
      id: Date.now().toString(),
      symbol: newSymbol.toUpperCase(),
      category: newCategory,
      price: newPrice.startsWith('$') || newPrice.startsWith('₹') ? newPrice : `$${newPrice}`,
      change: '+1.45%',
      isPositive: true
    };
    setWatchlist([item, ...watchlist]);
    setNewSymbol('');
    setNewPrice('');
    setShowAddWatchModal(false);
  };

  const filteredWatchlist = watchlist.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // AUTH SCREEN (LOGIN / SIGNUP / FORGOT PASSWORD)
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', paddingHorizontal: 20 }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0E17" />
        
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={[styles.logoBadge, { width: 56, height: 56, borderRadius: 16, marginBottom: 12 }]}>
            <Bot size={32} color="#2962FF" />
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 }}>CURV AI TERMINAL</Text>
          <Text style={{ color: '#60687B', fontSize: 12, marginTop: 4 }}>Institutional Intelligence & Trading Copilot</Text>
        </View>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', backgroundColor: '#1E222D', borderRadius: 8, padding: 4, marginBottom: 16 }}>
            <TouchableOpacity 
              style={[{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 }, authMode === 'login' && { backgroundColor: '#2962FF' }]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 }, authMode === 'signup' && { backgroundColor: '#2962FF' }]}
              onPress={() => setAuthMode('signup')}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.statLabel}>Email Address</Text>
          <TextInput
            placeholder="devraj@curvai.io"
            placeholderTextColor="#60687B"
            style={[styles.modalInput, { marginBottom: 12 }]}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.statLabel}>Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#60687B"
            secureTextEntry
            style={[styles.modalInput, { marginBottom: 8 }]}
            value={password}
            onChangeText={setPassword}
          />

          {/* Forgot Password Trigger */}
          <TouchableOpacity 
            style={{ alignSelf: 'flex-end', marginBottom: 16 }} 
            onPress={() => setShowForgotModal(true)}
          >
            <Text style={{ color: '#2962FF', fontSize: 11, fontWeight: 'bold' }}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalSubmitBtn, { backgroundColor: '#2962FF' }]} 
            onPress={() => setIsLoggedIn(true)}
          >
            <Text style={styles.btnText}>{authMode === 'login' ? 'Sign In to Terminal' : 'Register Free Account'}</Text>
          </TouchableOpacity>

          {/* Instant Demo Access */}
          <TouchableOpacity 
            style={{ paddingVertical: 10, alignItems: 'center', marginTop: 10 }} 
            onPress={() => { setEmail('devraj@curvai.io'); setIsLoggedIn(true); }}
          >
            <Text style={{ color: '#00E676', fontSize: 12, fontWeight: 'bold' }}>⚡ Instant Demo Access (One-Click)</Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password Modal */}
        <Modal visible={showForgotModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.rowBetween}>
                <Text style={styles.assetTitle}>Reset Account Password</Text>
                <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                  <X size={20} color="#60687B" />
                </TouchableOpacity>
              </View>
              <Text style={{ color: '#60687B', fontSize: 11, marginVertical: 8 }}>
                Enter your registered email address below to receive password recovery instructions.
              </Text>
              <TextInput
                placeholder="name@example.com"
                placeholderTextColor="#60687B"
                style={styles.modalInput}
                value={resetEmail}
                onChangeText={setResetEmail}
              />
              <TouchableOpacity style={[styles.modalSubmitBtn, { backgroundColor: '#2962FF' }]} onPress={handleForgotSubmit}>
                <Text style={styles.btnText}>Send Reset Mail</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // MAIN APP TERMINAL
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E17" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Bot size={20} color="#2962FF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>CURV AI TERMINAL</Text>
            <Text style={styles.brandSub}>Institutional Intelligence v3.0</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.userBadge} onPress={handleLogout}>
          <Text style={styles.userText}>DR</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Market Pills Bar */}
      <View style={styles.pillBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {Object.keys(marketList).map(key => (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              style={[styles.pill, selectedAssetKey === key && styles.pillActive]}
              onPress={() => setSelectedAssetKey(key)}
            >
              <Text style={[styles.pillText, selectedAssetKey === key && styles.pillTextActive]}>{key}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.pill, { backgroundColor: '#2962FF' }]} onPress={() => setShowAddMarketModal(true)}>
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>+ Add Market</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Dynamic Main Workspace */}
      <View style={styles.workspace}>

        {/* TAB 1: LIVE TERMINAL */}
        {activeTab === 'terminal' && (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.assetTitle}>{currentAsset.symbol}</Text>
                  <Text style={styles.assetSub}>{currentAsset.name} • {currentAsset.category}</Text>
                </View>
                <View style={[styles.signalBadge, { backgroundColor: currentAsset.isPositive ? 'rgba(0,230,118,0.12)' : 'rgba(255,82,82,0.12)' }]}>
                  <Text style={[styles.signalText, { color: currentAsset.isPositive ? '#00E676' : '#FF5252' }]}>
                    {currentAsset.signal}
                  </Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceBig}>{currentAsset.price}</Text>
                <View style={[styles.changeBadge, { backgroundColor: currentAsset.isPositive ? 'rgba(0,230,118,0.15)' : 'rgba(255,82,82,0.15)' }]}>
                  {currentAsset.isPositive ? <ArrowUpRight size={14} color="#00E676" /> : <ArrowDownRight size={14} color="#FF5252" />}
                  <Text style={[styles.changeText, { color: currentAsset.isPositive ? '#00E676' : '#FF5252' }]}>
                    {currentAsset.change}
                  </Text>
                </View>
              </View>

              {/* Timeframe Buttons */}
              <View style={styles.tfContainer}>
                {['1D', '1W', '1M', '1Y', 'ALL'].map(tf => (
                  <TouchableOpacity
                    key={tf}
                    style={[styles.tfBtn, timeframe === tf && styles.tfBtnActive]}
                    onPress={() => setTimeframe(tf)}
                  >
                    <Text style={[styles.tfText, timeframe === tf && styles.tfTextActive]}>{tf}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dynamic Line/Area Chart Graphic */}
              <View style={styles.chartContainer}>
                <View style={styles.chartBarRow}>
                  {currentAsset.chartPoints.map((val, idx) => (
                    <View key={idx} style={styles.chartCol}>
                      <View 
                        style={[
                          styles.chartBarFill, 
                          { 
                            height: `${val}%`, 
                            backgroundColor: currentAsset.isPositive ? 'rgba(0,230,118,0.6)' : 'rgba(255,82,82,0.6)' 
                          }
                        ]} 
                      />
                    </View>
                  ))}
                </View>
                <View style={styles.chartMetaRow}>
                  <Text style={styles.chartCaption}>Live Price Action Trend ({timeframe})</Text>
                  <Text style={{ color: currentAsset.isPositive ? '#00E676' : '#FF5252', fontSize: 10, fontWeight: 'bold' }}>
                    ● Realtime Feed
                  </Text>
                </View>
              </View>

              {/* Gauge & Analytics */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>RSI (14)</Text>
                  <Text style={styles.statVal}>{currentAsset.rsi}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Support</Text>
                  <Text style={styles.statVal}>{currentAsset.support}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Resistance</Text>
                  <Text style={styles.statVal}>{currentAsset.resistance}</Text>
                </View>
              </View>

              {/* Trade Buttons */}
              <View style={styles.tradeRow}>
                <TouchableOpacity style={styles.buyBtn} onPress={() => { setOrderType('BUY'); setOrderModalVisible(true); }}>
                  <Text style={styles.btnText}>BUY {currentAsset.symbol.split('/')[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sellBtn} onPress={() => { setOrderType('SELL'); setOrderModalVisible(true); }}>
                  <Text style={styles.btnText}>SELL {currentAsset.symbol.split('/')[0]}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Depth Order Book */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Live Order Depth (DOM)</Text>
              <View style={styles.rowBetween}>
                <Text style={{ color: '#00E676', fontSize: 11, fontWeight: 'bold' }}>BID ORDERS (BUY)</Text>
                <Text style={{ color: '#FF5252', fontSize: 11, fontWeight: 'bold' }}>ASK ORDERS (SELL)</Text>
              </View>
              <View style={styles.orderDepthRow}>
                <Text style={styles.depthText}>14.2 @ {currentAsset.support}</Text>
                <Text style={styles.depthText}>8.5 @ {currentAsset.resistance}</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* TAB 2: AI COPILOT */}
        {activeTab === 'copilot' && (
          <View style={{ flex: 1 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 36, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['Analyze NIFTY 50', 'BTC Target Price', 'Is NVDA Bullish?'].map((chip, idx) => (
                  <TouchableOpacity key={idx} style={styles.chip} onPress={() => handleSendQuery(chip)}>
                    <Sparkles size={12} color="#2962FF" />
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <FlatList
              data={chatMessages}
              keyExtractor={(item) => item.id}
              style={{ flex: 1 }}
              renderItem={({ item }) => (
                <View style={[styles.msgBox, item.sender === 'user' ? styles.msgUser : styles.msgAi]}>
                  {item.sender === 'ai' && (
                    <View style={styles.msgHeader}>
                      <Bot size={14} color="#2962FF" />
                      <Text style={styles.aiLabel}>Copilot Neural Engine</Text>
                    </View>
                  )}
                  <Text style={styles.msgText}>{item.text}</Text>
                </View>
              )}
            />

            <View style={styles.inputBar}>
              <TextInput
                placeholder="Ask AI Copilot for trade setups..."
                placeholderTextColor="#60687B"
                style={styles.chatInput}
                value={inputQuery}
                onChangeText={setInputQuery}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendQuery()}>
                <Send size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 3: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <View style={{ flex: 1 }}>
            <View style={styles.catRow}>
              {(['ALL', 'STOCKS', 'CRYPTO', 'FOREX'] as const).map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, categoryFilter === cat && styles.catBtnActive]}
                  onPress={() => setCategoryFilter(cat)}
                >
                  <Text style={[styles.catText, categoryFilter === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Search size={14} color="#60687B" />
                <TextInput
                  placeholder="Filter watchlist..."
                  placeholderTextColor="#60687B"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddWatchModal(!showAddWatchModal)}>
                <Plus size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Add Asset Modal Form */}
            {showAddWatchModal && (
              <View style={styles.addForm}>
                <View style={styles.rowBetween}>
                  <Text style={styles.formTitle}>Add Custom Ticker</Text>
                  <TouchableOpacity onPress={() => setShowAddWatchModal(false)}>
                    <X size={16} color="#60687B" />
                  </TouchableOpacity>
                </View>

                {/* Category Selection Row */}
                <Text style={[styles.statLabel, { marginTop: 6 }]}>Category Type</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
                  {(['STOCKS', 'CRYPTO', 'FOREX'] as const).map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catBtn, newCategory === c && styles.catBtnActive]}
                      onPress={() => setNewCategory(c)}
                    >
                      <Text style={[styles.catText, newCategory === c && styles.catTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  placeholder="Symbol (e.g. SOL/USD, AAPL)"
                  placeholderTextColor="#60687B"
                  style={styles.formInput}
                  value={newSymbol}
                  onChangeText={setNewSymbol}
                />
                <TextInput
                  placeholder="Price (e.g. $180.50)"
                  placeholderTextColor="#60687B"
                  style={styles.formInput}
                  value={newPrice}
                  onChangeText={setNewPrice}
                />
                <TouchableOpacity style={styles.submitBtn} onPress={handleAddWatchlist}>
                  <Text style={styles.btnText}>Save Ticker</Text>
                </TouchableOpacity>
              </View>
            )}

            <FlatList
              data={filteredWatchlist}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.watchCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.watchSymbol}>{item.symbol}</Text>
                    <Text style={styles.watchSub}>{item.category} • {item.price}</Text>
                  </View>
                  <View style={[styles.changeBadge, { backgroundColor: item.isPositive ? 'rgba(0,230,118,0.15)' : 'rgba(255,82,82,0.15)', marginRight: 10 }]}>
                    <Text style={{ color: item.isPositive ? '#00E676' : '#FF5252', fontSize: 11, fontWeight: 'bold' }}>
                      {item.change}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setWatchlist(prev => prev.filter(w => w.id !== item.id))}>
                    <Trash2 size={16} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* TAB 4: RADAR SCREENER */}
        {activeTab === 'screener' && (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>Real-time AI Market Signals</Text>
            {[
              { ticker: 'BTC/USD', signal: 'Volume Spike Breakout', conf: '96%', rationale: 'Institutional volume spike above $66,500.' },
              { ticker: 'NVDA', signal: 'RSI Bullish Momentum', conf: '91%', rationale: 'Sustained consolidation above $130 resistance.' },
              { ticker: 'RELIANCE', signal: 'Support Test Rebound', conf: '84%', rationale: 'RSI oversold rebound near 2,700 level.' },
            ].map((sig, idx) => (
              <View key={idx} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.assetTitle}>{sig.ticker}</Text>
                  <Text style={{ color: '#2962FF', fontWeight: 'bold', fontSize: 12 }}>{sig.conf} Match</Text>
                </View>
                <Text style={{ color: '#00E676', fontWeight: 'bold', fontSize: 13, marginTop: 4 }}>{sig.signal}</Text>
                <Text style={{ color: '#60687B', fontSize: 11, marginTop: 4 }}>{sig.rationale}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* TAB 5: PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.statLabel}>Total Account Equity</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginVertical: 4 }}>$124,580.40</Text>
              <Text style={{ color: '#00E676', fontSize: 12, fontWeight: '600' }}>+$3,420.00 (+2.82%) Un-realized P&L</Text>
            </View>

            <Text style={styles.sectionHeader}>Active Open Positions ({portfolio.length})</Text>
            {portfolio.map(item => (
              <View key={item.id} style={styles.watchCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.watchSymbol}>{item.symbol}</Text>
                  <Text style={styles.watchSub}>Qty: {item.qty} • Entry: {item.avgPrice}</Text>
                </View>
                <Text style={{ color: '#00E676', fontWeight: 'bold', fontSize: 13 }}>{item.pnl}</Text>
              </View>
            ))}
          </ScrollView>
        )}

      </View>

      {/* MODAL 1: ORDER EXECUTION */}
      <Modal visible={orderModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.rowBetween}>
              <Text style={styles.assetTitle}>Execute {orderType} Order</Text>
              <TouchableOpacity onPress={() => setOrderModalVisible(false)}>
                <X size={20} color="#60687B" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#60687B', fontSize: 12, marginVertical: 8 }}>
              Asset: {currentAsset.symbol} @ {currentAsset.price}
            </Text>
            <Text style={styles.statLabel}>Quantity / Lots</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={orderQuantity}
              onChangeText={setOrderQuantity}
            />
            <TouchableOpacity
              style={[styles.modalSubmitBtn, { backgroundColor: orderType === 'BUY' ? '#00E676' : '#FF5252' }]}
              onPress={handleExecuteOrder}
            >
              <Text style={styles.btnText}>Confirm {orderType} Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ADD TOP MARKET */}
      <Modal visible={showAddMarketModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.rowBetween}>
              <Text style={styles.assetTitle}>Add New Top Market Asset</Text>
              <TouchableOpacity onPress={() => setShowAddMarketModal(false)}>
                <X size={20} color="#60687B" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.statLabel, { marginTop: 8 }]}>Asset Category</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
              {(['STOCKS', 'CRYPTO', 'FOREX'] as const).map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.catBtn, customMarketCategory === c && styles.catBtnActive]}
                  onPress={() => setCustomMarketCategory(c)}
                >
                  <Text style={[styles.catText, customMarketCategory === c && styles.catTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Market Ticker (e.g. SOL/USD, TATAMOTORS)"
              placeholderTextColor="#60687B"
              style={styles.modalInput}
              value={customMarketName}
              onChangeText={setCustomMarketName}
            />
            <TextInput
              placeholder="Current Price (e.g. $180.50)"
              placeholderTextColor="#60687B"
              style={styles.modalInput}
              value={customMarketPrice}
              onChangeText={setCustomMarketPrice}
            />
            <TouchableOpacity style={[styles.modalSubmitBtn, { backgroundColor: '#2962FF' }]} onPress={handleAddCustomMarket}>
              <Text style={styles.btnText}>Add to Top Bar & Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('terminal')}>
          <Activity size={18} color={activeTab === 'terminal' ? '#2962FF' : '#60687B'} />
          <Text style={[styles.tabLabel, activeTab === 'terminal' && styles.tabLabelActive]}>Terminal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('copilot')}>
          <Bot size={18} color={activeTab === 'copilot' ? '#2962FF' : '#60687B'} />
          <Text style={[styles.tabLabel, activeTab === 'copilot' && styles.tabLabelActive]}>Copilot AI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('watchlist')}>
          <Star size={18} color={activeTab === 'watchlist' ? '#2962FF' : '#60687B'} />
          <Text style={[styles.tabLabel, activeTab === 'watchlist' && styles.tabLabelActive]}>Watchlist</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('screener')}>
          <Zap size={18} color={activeTab === 'screener' ? '#2962FF' : '#60687B'} />
          <Text style={[styles.tabLabel, activeTab === 'screener' && styles.tabLabelActive]}>Radar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('portfolio')}>
          <PieChart size={18} color={activeTab === 'portfolio' ? '#2962FF' : '#60687B'} />
          <Text style={[styles.tabLabel, activeTab === 'portfolio' && styles.tabLabelActive]}>Portfolio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E17' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E222D' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#131722', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2962FF' },
  brandTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  brandSub: { color: '#60687B', fontSize: 10 },
  userBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#2962FF', alignItems: 'center', justifyContent: 'center' },
  userText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  pillBar: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E222D' },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: '#131722', borderWidth: 1, borderColor: '#1E222D' },
  pillActive: { backgroundColor: '#1E222D', borderColor: '#2962FF' },
  pillText: { color: '#60687B', fontSize: 11, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  workspace: { flex: 1, paddingHorizontal: 12, paddingTop: 10 },
  scrollArea: { flex: 1 },
  card: { backgroundColor: '#131722', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1E222D' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assetTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  assetSub: { color: '#60687B', fontSize: 11 },
  signalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  signalText: { fontSize: 10, fontWeight: 'bold' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  priceBig: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 2 },
  changeText: { fontSize: 11, fontWeight: 'bold' },
  tfContainer: { flexDirection: 'row', gap: 6, marginVertical: 6 },
  tfBtn: { flex: 1, paddingVertical: 5, alignItems: 'center', backgroundColor: '#1E222D', borderRadius: 6 },
  tfBtnActive: { backgroundColor: '#2962FF' },
  tfText: { color: '#60687B', fontSize: 10, fontWeight: 'bold' },
  tfTextActive: { color: '#FFFFFF' },
  chartContainer: { height: 110, backgroundColor: '#1E222D', borderRadius: 10, padding: 10, marginVertical: 8, justifyContent: 'space-between' },
  chartBarRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', gap: 4 },
  chartCol: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  chartBarFill: { width: '80%', borderRadius: 3 },
  chartMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 },
  chartCaption: { color: '#60687B', fontSize: 10 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1E222D' },
  statBox: { alignItems: 'center' },
  statLabel: { color: '#60687B', fontSize: 10 },
  statVal: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  tradeRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  buyBtn: { flex: 1, backgroundColor: '#00E676', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  sellBtn: { flex: 1, backgroundColor: '#FF5252', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  orderDepthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  depthText: { color: '#9098A9', fontSize: 11 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131722', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#1E222D', gap: 4 },
  chipText: { color: '#FFFFFF', fontSize: 11 },
  msgBox: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '88%' },
  msgUser: { backgroundColor: '#2962FF', alignSelf: 'flex-end' },
  msgAi: { backgroundColor: '#131722', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#1E222D' },
  msgHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  aiLabel: { color: '#2962FF', fontSize: 10, fontWeight: 'bold' },
  msgText: { color: '#FFFFFF', fontSize: 12, lineHeight: 18 },
  inputBar: { flexDirection: 'row', gap: 8, paddingVertical: 8 },
  chatInput: { flex: 1, backgroundColor: '#131722', borderRadius: 10, paddingHorizontal: 12, color: '#FFFFFF', fontSize: 12, borderWidth: 1, borderColor: '#1E222D' },
  sendBtn: { backgroundColor: '#2962FF', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  catBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: '#131722', borderRadius: 8, borderWidth: 1, borderColor: '#1E222D' },
  catBtnActive: { backgroundColor: '#1E222D', borderColor: '#2962FF' },
  catText: { color: '#60687B', fontSize: 10, fontWeight: 'bold' },
  catTextActive: { color: '#FFFFFF' },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#131722', borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#1E222D' },
  searchInput: { flex: 1, color: '#FFFFFF', paddingVertical: 8, marginLeft: 6, fontSize: 12 },
  addBtn: { backgroundColor: '#2962FF', width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addForm: { backgroundColor: '#131722', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2962FF' },
  formTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  formInput: { backgroundColor: '#1E222D', color: '#FFFFFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 6, fontSize: 12 },
  submitBtn: { backgroundColor: '#00E676', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  watchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131722', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1E222D' },
  watchSymbol: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  watchSub: { color: '#60687B', fontSize: 11, marginTop: 2 },
  sectionHeader: { color: '#60687B', fontSize: 12, fontWeight: 'bold', marginVertical: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#131722', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2962FF' },
  modalInput: { backgroundColor: '#1E222D', color: '#FFFFFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 6, fontSize: 14, fontWeight: 'bold' },
  modalSubmitBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  tabBar: { 
    flexDirection: 'row', 
    backgroundColor: '#131722', 
    paddingTop: 10, 
    paddingBottom: 35, // Redmi Note 11 bottom spacing
    borderTopWidth: 1, 
    borderTopColor: '#1E222D' 
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { color: '#60687B', fontSize: 9, marginTop: 3 },
  tabLabelActive: { color: '#2962FF', fontWeight: 'bold' }
}); 