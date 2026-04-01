/**
 * Category Icon Enum
 * Centralized icon mapping for categories
 */

export enum CategoryIcon {
  // Food & Dining
  FOOD = '🍔',
  GROCERIES = '🛒',
  RESTAURANT = '🍽️',
  COFFEE = '☕',
  DRINKS = '🥤',
  WATER_BOTTLE = '�',
  CHOCOLATE = '🍫',
  NUTS = '🥜',
  VEGETABLES = '🥬',
  VEGETABLES_CARROT = '🥕',
  VEGETABLES_BROCCOLI = '🥦',
  VEGETABLES_TOMATO = '🍅',
  VEGETABLES_CORN = '🌽',
  VEGETABLES_PEPPER = '🌶️',
  FRUITS = '🍎',
  PROVISIONS = '🍚',
  
  // Transportation
  TRANSPORT = '🚗',
  TRAVEL = '✈️',
  CAR = '🚗',
  FUEL = '⛽',
  PETROL = '⛽',
  PARKING = '🅿️',
  TAXI = '🚕',
  BUS = '🚌',
  TRAIN = '🚆',
  SCOOTY = '🛵',
  REPAIR = '🔧',
  SERVICE = '🔨',
  
  // Entertainment
  ENTERTAINMENT = '🎬',
  MOVIE = '🎬',
  MUSIC = '🎵',
  GAMES = '🎮',
  SPORTS = '⚽',
  
  // Shopping
  SHOPPING = '🛍️',
  CLOTHING = '👕',
  ELECTRONICS = '💻',
  GADGET = '📱',
  
  // Health & Wellness
  HEALTH = '🏥',
  MEDICAL = '💊',
  PHARMACY = '💊',
  GYM = '💪',
  FITNESS = '🏃',
  
  // Home & Utilities
  RENT = '🏠',
  UTILITIES = '💡',
  ELECTRICITY = '⚡',
  WATER = '💧',
  INTERNET = '📡',
  PHONE = '📱',
  HOUSEHOLD = '🧹',
  AC = '❄️',
  SOFA = '🛋️',
  CUPBOARD = '🗄️',
  
  // Education
  EDUCATION = '📚',
  SCHOOL = '🎓',
  BOOKS = '📖',
  COURSES = '📝',
  STATIONARY = '✏️',
  
  // Finance
  SALARY = '💼',
  INCOME = '💰',
  INVESTMENT = '📈',
  SAVINGS = '💰',
  BANK = '🏦',
  GOLD = '🥇',
  SILVER = '🥈',
  GOLD_BAR = '🟨',
  SILVER_BAR = '⬜',
  
  // Personal Care
  PERSONAL = '👤',
  BEAUTY = '💄',
  HYGIENE = '🧴',
  HAIRCUT = '💇',
  
  // Family & Kids
  FAMILY = '👨‍👩‍👧‍👦',
  CHILDREN = '👶',
  BABY = '👶',
  TOYS = '🧸',
  
  // Pets
  PET = '🐾',
  DOG = '🐕',
  CAT = '🐈',
  
  // Social & Gifts
  GIFT = '🎁',
  CHARITY = '🤝',
  PARTY = '🎉',
  GIRLS_GROUP = '👭',
  
  // Insurance
  INSURANCE = '🛡️',
  HEALTH_INSURANCE = '⚕️',
  CAR_INSURANCE = '🚗',
  LIFE_INSURANCE = '❤️',
  
  // Bills
  BILLS = '📄',
  SUBSCRIPTION = '📱',
  
  // Default
  DEFAULT = '📦',
  OTHER = '📦'
}

/**
 * Icon Mapping Service
 * Maps category names to appropriate icons
 */
export class IconMapper {
  private static readonly iconMap: Record<string, CategoryIcon> = {
    // Food & Dining
    'food': CategoryIcon.FOOD,
    'groceries': CategoryIcon.GROCERIES,
    'grocery': CategoryIcon.GROCERIES,
    'restaurant': CategoryIcon.RESTAURANT,
    'dining': CategoryIcon.RESTAURANT,
    'coffee': CategoryIcon.COFFEE,
    'drinks': CategoryIcon.DRINKS,
    'beverage': CategoryIcon.DRINKS,
    'water bottle': CategoryIcon.WATER_BOTTLE,
    'bottle': CategoryIcon.WATER_BOTTLE,
    'mineral water': CategoryIcon.WATER_BOTTLE,
    'chocolate': CategoryIcon.CHOCOLATE,
    'chocolates': CategoryIcon.CHOCOLATE,
    'sweets': CategoryIcon.CHOCOLATE,
    'nuts': CategoryIcon.NUTS,
    'dry fruits': CategoryIcon.NUTS,
    'snacks': CategoryIcon.NUTS,
    'vegetables': CategoryIcon.VEGETABLES,
    'veggie': CategoryIcon.VEGETABLES,
    'veggies': CategoryIcon.VEGETABLES,
    'greens': CategoryIcon.VEGETABLES,
    'carrot': CategoryIcon.VEGETABLES_CARROT,
    'carrots': CategoryIcon.VEGETABLES_CARROT,
    'broccoli': CategoryIcon.VEGETABLES_BROCCOLI,
    'tomato': CategoryIcon.VEGETABLES_TOMATO,
    'tomatoes': CategoryIcon.VEGETABLES_TOMATO,
    'corn': CategoryIcon.VEGETABLES_CORN,
    'maize': CategoryIcon.VEGETABLES_CORN,
    'pepper': CategoryIcon.VEGETABLES_PEPPER,
    'chili': CategoryIcon.VEGETABLES_PEPPER,
    'chilli': CategoryIcon.VEGETABLES_PEPPER,
    'hot pepper': CategoryIcon.VEGETABLES_PEPPER,
    'fruits': CategoryIcon.FRUITS,
    'fruit': CategoryIcon.FRUITS,
    'apple': CategoryIcon.FRUITS,
    'provisions': CategoryIcon.PROVISIONS,
    'rice': CategoryIcon.PROVISIONS,
    'grains': CategoryIcon.PROVISIONS,
    'staples': CategoryIcon.PROVISIONS,
    
    // Transportation
    'transport': CategoryIcon.TRANSPORT,
    'transportation': CategoryIcon.TRANSPORT,
    'travel': CategoryIcon.TRAVEL,
    'car': CategoryIcon.CAR,
    'fuel': CategoryIcon.FUEL,
    'gas': CategoryIcon.FUEL,
    'petrol': CategoryIcon.FUEL,
    'parking': CategoryIcon.PARKING,
    'taxi': CategoryIcon.TAXI,
    'uber': CategoryIcon.TAXI,
    'bus': CategoryIcon.BUS,
    'train': CategoryIcon.TRAIN,
    'scooty': CategoryIcon.SCOOTY,
    'scooter': CategoryIcon.SCOOTY,
    'bike': CategoryIcon.SCOOTY,
    'repair': CategoryIcon.REPAIR,
    'service': CategoryIcon.SERVICE,
    'maintenance': CategoryIcon.SERVICE,
    
    // Entertainment
    'entertainment': CategoryIcon.ENTERTAINMENT,
    'movie': CategoryIcon.MOVIE,
    'cinema': CategoryIcon.MOVIE,
    'music': CategoryIcon.MUSIC,
    'games': CategoryIcon.GAMES,
    'gaming': CategoryIcon.GAMES,
    'sports': CategoryIcon.SPORTS,
    
    // Shopping
    'shopping': CategoryIcon.SHOPPING,
    'clothing': CategoryIcon.CLOTHING,
    'clothes': CategoryIcon.CLOTHING,
    'electronics': CategoryIcon.ELECTRONICS,
    'gadget': CategoryIcon.GADGET,
    
    // Health
    'health': CategoryIcon.HEALTH,
    'medical': CategoryIcon.MEDICAL,
    'medicine': CategoryIcon.MEDICAL,
    'pharmacy': CategoryIcon.PHARMACY,
    'gym': CategoryIcon.GYM,
    'fitness': CategoryIcon.FITNESS,
    
    // Home
    'rent': CategoryIcon.RENT,
    'utilities': CategoryIcon.UTILITIES,
    'electricity': CategoryIcon.ELECTRICITY,
    'water': CategoryIcon.WATER,
    'internet': CategoryIcon.INTERNET,
    'phone': CategoryIcon.PHONE,
    'household': CategoryIcon.HOUSEHOLD,
    'household items': CategoryIcon.HOUSEHOLD,
    'house hold': CategoryIcon.HOUSEHOLD,
    'ac': CategoryIcon.AC,
    'air conditioner': CategoryIcon.AC,
    'cooling': CategoryIcon.AC,
    'sofa': CategoryIcon.SOFA,
    'couch': CategoryIcon.SOFA,
    'furniture': CategoryIcon.SOFA,
    'cupboard': CategoryIcon.CUPBOARD,
    'cabinet': CategoryIcon.CUPBOARD,
    'storage': CategoryIcon.CUPBOARD,
    
    // Education
    'education': CategoryIcon.EDUCATION,
    'school': CategoryIcon.SCHOOL,
    'books': CategoryIcon.BOOKS,
    'courses': CategoryIcon.COURSES,
    'stationary': CategoryIcon.STATIONARY,
    'stationery': CategoryIcon.STATIONARY,
    'office supplies': CategoryIcon.STATIONARY,
    'pens': CategoryIcon.STATIONARY,
    'pencils': CategoryIcon.STATIONARY,
    
    // Finance
    'salary': CategoryIcon.SALARY,
    'income': CategoryIcon.INCOME,
    'investment': CategoryIcon.INVESTMENT,
    'savings': CategoryIcon.SAVINGS,
    'bank': CategoryIcon.BANK,
    'gold': CategoryIcon.GOLD,
    'silver': CategoryIcon.SILVER,
    'precious metals': CategoryIcon.GOLD,
    'gold bar': CategoryIcon.GOLD_BAR,
    'gold bars': CategoryIcon.GOLD_BAR,
    'gold investment': CategoryIcon.GOLD_BAR,
    'silver bar': CategoryIcon.SILVER_BAR,
    'silver bars': CategoryIcon.SILVER_BAR,
    'silver investment': CategoryIcon.SILVER_BAR,
    
    // Personal
    'personal': CategoryIcon.PERSONAL,
    'beauty': CategoryIcon.BEAUTY,
    'hygiene': CategoryIcon.HYGIENE,
    'haircut': CategoryIcon.HAIRCUT,
    
    // Family
    'family': CategoryIcon.FAMILY,
    'children': CategoryIcon.CHILDREN,
    'child': CategoryIcon.CHILDREN,
    'baby': CategoryIcon.BABY,
    'toys': CategoryIcon.TOYS,
    
    // Pets
    'pet': CategoryIcon.PET,
    'dog': CategoryIcon.DOG,
    'cat': CategoryIcon.CAT,
    
    // Social
    'gift': CategoryIcon.GIFT,
    'charity': CategoryIcon.CHARITY,
    'party': CategoryIcon.PARTY,
    'girls group': CategoryIcon.GIRLS_GROUP,
    'girls': CategoryIcon.GIRLS_GROUP,
    'ladies': CategoryIcon.GIRLS_GROUP,
    'women': CategoryIcon.GIRLS_GROUP,
    'friends': CategoryIcon.GIRLS_GROUP,
    
    // Insurance
    'insurance': CategoryIcon.INSURANCE,
    'car insurance': CategoryIcon.CAR_INSURANCE,
    'vehicle insurance': CategoryIcon.CAR_INSURANCE,
    'life insurance': CategoryIcon.LIFE_INSURANCE,
    
    // Bills
    'bills': CategoryIcon.BILLS,
    'subscription': CategoryIcon.SUBSCRIPTION
  };

  /**
   * Get icon for category name
   */
  static getIcon(categoryName: string): CategoryIcon {
    if (!categoryName) return CategoryIcon.DEFAULT;
    
    const normalized = categoryName.trim().toLowerCase();
    
    // Direct match
    if (this.iconMap[normalized]) {
      return this.iconMap[normalized];
    }
    
    // Partial match
    for (const [key, icon] of Object.entries(this.iconMap)) {
      if (normalized.includes(key)) {
        return icon;
      }
    }
    
    // Pattern matching
    if (normalized.match(/expense|cost|spend/)) return '💸' as CategoryIcon;
    if (normalized.match(/save|saving/)) return '💰' as CategoryIcon;
    if (normalized.match(/earn|revenue/)) return '💵' as CategoryIcon;
    
    return CategoryIcon.DEFAULT;
  }

  /**
   * Get all available icons with their categories
   */
  static getAllIcons(): Array<{ category: string; icon: string; keywords: string[] }> {
    return [
      // Food & Dining
      { category: 'Food & Dining', icon: '🍔', keywords: ['food', 'burger', 'meal'] },
      { category: 'Food & Dining', icon: '🛒', keywords: ['groceries', 'shopping', 'cart', 'grocery'] },
      { category: 'Food & Dining', icon: '🍽️', keywords: ['restaurant', 'dining', 'plate'] },
      { category: 'Food & Dining', icon: '☕', keywords: ['coffee', 'cafe', 'tea'] },
      { category: 'Food & Dining', icon: '🥤', keywords: ['drinks', 'beverage', 'juice'] },
      { category: 'Food & Dining', icon: '�', keywords: ['water bottle', 'bottle', 'mineral water', 'drinking water', 'glass bottle'] },
      { category: 'Food & Dining', icon: '🍫', keywords: ['chocolate', 'sweets', 'candy', 'dessert'] },
      { category: 'Food & Dining', icon: '🥜', keywords: ['nuts', 'dry fruits', 'snacks', 'almonds'] },
      { category: 'Food & Dining', icon: '🥬', keywords: ['vegetables', 'veggie', 'veggies', 'greens', 'leafy'] },
      { category: 'Food & Dining', icon: '🥕', keywords: ['carrot', 'carrots', 'vegetables', 'orange vegetable'] },
      { category: 'Food & Dining', icon: '🥦', keywords: ['broccoli', 'vegetables', 'green vegetable'] },
      { category: 'Food & Dining', icon: '🍅', keywords: ['tomato', 'tomatoes', 'vegetables', 'red vegetable'] },
      { category: 'Food & Dining', icon: '🌽', keywords: ['corn', 'maize', 'vegetables', 'sweet corn'] },
      { category: 'Food & Dining', icon: '🌶️', keywords: ['pepper', 'chili', 'chilli', 'hot pepper', 'spicy'] },
      { category: 'Food & Dining', icon: '🍎', keywords: ['fruits', 'fruit', 'apple', 'fresh produce'] },
      { category: 'Food & Dining', icon: '🍚', keywords: ['provisions', 'rice', 'grains', 'staples', 'food items'] },
      
      // Transportation
      { category: 'Transportation', icon: '🚗', keywords: ['car', 'transport', 'vehicle'] },
      { category: 'Transportation', icon: '✈️', keywords: ['travel', 'flight', 'airplane'] },
      { category: 'Transportation', icon: '⛽', keywords: ['fuel', 'gas', 'petrol', 'diesel'] },
      { category: 'Transportation', icon: '🅿️', keywords: ['parking', 'park'] },
      { category: 'Transportation', icon: '🚕', keywords: ['taxi', 'cab', 'uber'] },
      { category: 'Transportation', icon: '🚌', keywords: ['bus', 'public transport'] },
      { category: 'Transportation', icon: '🚆', keywords: ['train', 'railway', 'metro'] },
      { category: 'Transportation', icon: '🛵', keywords: ['scooty', 'scooter', 'bike', 'two wheeler'] },
      { category: 'Transportation', icon: '🔧', keywords: ['repair', 'fix', 'mechanic', 'tools'] },
      { category: 'Transportation', icon: '🔨', keywords: ['service', 'maintenance', 'repair work'] },
      
      // Entertainment
      { category: 'Entertainment', icon: '🎬', keywords: ['movie', 'cinema', 'film'] },
      { category: 'Entertainment', icon: '🎵', keywords: ['music', 'song', 'audio'] },
      { category: 'Entertainment', icon: '🎮', keywords: ['games', 'gaming', 'video games'] },
      { category: 'Entertainment', icon: '⚽', keywords: ['sports', 'football', 'soccer'] },
      { category: 'Entertainment', icon: '🎉', keywords: ['party', 'celebration', 'event'] },
      
      // Shopping
      { category: 'Shopping', icon: '🛍️', keywords: ['shopping', 'bags', 'retail'] },
      { category: 'Shopping', icon: '👕', keywords: ['clothing', 'clothes', 'apparel'] },
      { category: 'Shopping', icon: '💻', keywords: ['electronics', 'computer', 'laptop'] },
      { category: 'Shopping', icon: '📱', keywords: ['gadget', 'phone', 'mobile'] },
      
      // Health & Wellness
      { category: 'Health & Wellness', icon: '🏥', keywords: ['health', 'hospital', 'medical'] },
      { category: 'Health & Wellness', icon: '💊', keywords: ['medicine', 'pharmacy', 'pills'] },
      { category: 'Health & Wellness', icon: '💪', keywords: ['gym', 'workout', 'strength'] },
      { category: 'Health & Wellness', icon: '🏃', keywords: ['fitness', 'running', 'exercise'] },
      
      // Home & Utilities
      { category: 'Home & Utilities', icon: '🏠', keywords: ['rent', 'home', 'house'] },
      { category: 'Home & Utilities', icon: '💡', keywords: ['utilities', 'light', 'bulb'] },
      { category: 'Home & Utilities', icon: '⚡', keywords: ['electricity', 'power', 'energy'] },
      { category: 'Home & Utilities', icon: '💧', keywords: ['water', 'liquid'] },
      { category: 'Home & Utilities', icon: '📡', keywords: ['internet', 'wifi', 'network'] },
      { category: 'Home & Utilities', icon: '🧹', keywords: ['household', 'household items', 'cleaning', 'house hold'] },
      { category: 'Home & Utilities', icon: '❄️', keywords: ['ac', 'air conditioner', 'cooling', 'cold'] },
      { category: 'Home & Utilities', icon: '🛋️', keywords: ['sofa', 'couch', 'furniture', 'living room'] },
      { category: 'Home & Utilities', icon: '🗄️', keywords: ['cupboard', 'cabinet', 'storage', 'wardrobe'] },
      
      // Education
      { category: 'Education', icon: '📚', keywords: ['education', 'books', 'learning'] },
      { category: 'Education', icon: '🎓', keywords: ['school', 'graduation', 'university'] },
      { category: 'Education', icon: '📖', keywords: ['book', 'reading', 'study'] },
      { category: 'Education', icon: '📝', keywords: ['courses', 'notes', 'writing'] },
      { category: 'Education', icon: '✏️', keywords: ['stationary', 'stationery', 'pens', 'pencils', 'office supplies'] },
      
      // Finance & Money
      { category: 'Finance & Money', icon: '�', keywords: ['money', 'money bag', 'cash', 'wealth', 'finance'] },
      { category: 'Finance & Money', icon: '💵', keywords: ['cash', 'dollar', 'currency', 'bill', 'banknote', 'rupee', 'money'] },
      { category: 'Finance & Money', icon: '�', keywords: ['yen', 'money', 'currency', 'cash', 'rupee'] },
      { category: 'Finance & Money', icon: '�', keywords: ['euro', 'money', 'currency', 'cash'] },
      { category: 'Finance & Money', icon: '💷', keywords: ['pound', 'money', 'currency', 'cash'] },
      { category: 'Finance & Money', icon: '💸', keywords: ['money wings', 'spending', 'payment', 'expense', 'flying money'] },
      { category: 'Finance & Money', icon: '💲', keywords: ['dollar sign', 'money', 'price', 'cost', 'rupee symbol'] },
      { category: 'Finance & Money', icon: '💳', keywords: ['credit card', 'payment', 'card', 'transaction', 'debit card'] },
      { category: 'Finance & Money', icon: '🪙', keywords: ['coin', 'coins', 'money', 'change', 'currency', 'rupee coin'] },
      { category: 'Finance & Money', icon: '💼', keywords: ['salary', 'work', 'job', 'briefcase', 'income'] },
      { category: 'Finance & Money', icon: '👛', keywords: ['wallet', 'purse', 'money holder'] },
      { category: 'Finance & Money', icon: '🏦', keywords: ['bank', 'banking', 'financial', 'institution', 'atm'] },
      { category: 'Finance & Money', icon: '🐷', keywords: ['piggy bank', 'saving', 'savings', 'money box'] },
      { category: 'Finance & Money', icon: '🔐', keywords: ['safe', 'secure', 'vault', 'locked', 'locker'] },
      
      // Investment & Assets
      { category: 'Investment & Assets', icon: '📈', keywords: ['investment', 'stocks', 'growth', 'profit', 'chart up'] },
      { category: 'Investment & Assets', icon: '📉', keywords: ['loss', 'decline', 'chart down', 'decrease'] },
      { category: 'Investment & Assets', icon: '📊', keywords: ['stocks', 'portfolio', 'analysis', 'chart', 'statistics'] },
      { category: 'Investment & Assets', icon: '💹', keywords: ['mutual funds', 'trading', 'forex', 'market'] },
      { category: 'Investment & Assets', icon: '📜', keywords: ['bonds', 'certificate', 'document', 'scroll'] },
      { category: 'Investment & Assets', icon: '🏘️', keywords: ['real estate', 'property', 'buildings', 'houses'] },
      { category: 'Investment & Assets', icon: '₿', keywords: ['bitcoin', 'crypto', 'cryptocurrency', 'digital currency'] },
      
      // Precious Metals & Valuables
      { category: 'Precious Metals & Valuables', icon: '🥇', keywords: ['gold', 'first', 'medal', 'winner'] },
      { category: 'Precious Metals & Valuables', icon: '🥈', keywords: ['silver', 'second', 'medal'] },
      { category: 'Precious Metals & Valuables', icon: '🟨', keywords: ['gold bar', 'gold bars', 'bullion', 'gold investment'] },
      { category: 'Precious Metals & Valuables', icon: '⬜', keywords: ['silver bar', 'silver bars', 'bullion', 'silver investment'] },
      { category: 'Precious Metals & Valuables', icon: '💎', keywords: ['diamond', 'gem', 'jewelry', 'luxury', 'precious', 'jewellery'] },
      
      // Personal Care
      { category: 'Personal Care', icon: '👤', keywords: ['personal', 'user', 'profile'] },
      { category: 'Personal Care', icon: '💄', keywords: ['beauty', 'makeup', 'cosmetics'] },
      { category: 'Personal Care', icon: '🧴', keywords: ['hygiene', 'toiletries', 'care'] },
      { category: 'Personal Care', icon: '💇', keywords: ['haircut', 'salon', 'hair'] },
      
      // Family & Kids
      { category: 'Family & Kids', icon: '👨‍👩‍👧‍👦', keywords: ['family', 'parents', 'relatives'] },
      { category: 'Family & Kids', icon: '👶', keywords: ['baby', 'infant', 'child'] },
      { category: 'Family & Kids', icon: '🧸', keywords: ['toys', 'play', 'kids'] },
      
      // Pets
      { category: 'Pets', icon: '🐾', keywords: ['pet', 'animal', 'paw'] },
      { category: 'Pets', icon: '🐕', keywords: ['dog', 'puppy', 'canine'] },
      { category: 'Pets', icon: '🐈', keywords: ['cat', 'kitten', 'feline'] },
      
      // Social & Gifts
      { category: 'Social & Gifts', icon: '🎁', keywords: ['gift', 'present', 'surprise'] },
      { category: 'Social & Gifts', icon: '🤝', keywords: ['charity', 'donation', 'help'] },
      { category: 'Social & Gifts', icon: '👭', keywords: ['girls group', 'girls', 'ladies', 'women', 'friends', 'ladies night'] },
      
      // Insurance & Bills
      { category: 'Insurance & Bills', icon: '🛡️', keywords: ['insurance', 'protection', 'coverage'] },
      { category: 'Insurance & Bills', icon: '⚕️', keywords: ['health insurance', 'medical insurance'] },
      { category: 'Insurance & Bills', icon: '�', keywords: ['car insurance', 'vehicle insurance', 'auto'] },
      { category: 'Insurance & Bills', icon: '❤️', keywords: ['life insurance', 'family protection'] },
      { category: 'Insurance & Bills', icon: '�📄', keywords: ['bills', 'invoice', 'payment'] },
      { category: 'Insurance & Bills', icon: '📱', keywords: ['subscription', 'service', 'monthly'] },
      
      // Shopping & Fashion
      { category: 'Shopping & Fashion', icon: '🛍️', keywords: ['shopping', 'bags', 'purchase', 'buy', 'store'] },
      { category: 'Shopping & Fashion', icon: '�', keywords: ['cart', 'shopping cart', 'online shopping', 'ecommerce', 'buy'] },
      { category: 'Shopping & Fashion', icon: '🛵', keywords: ['scooter', 'delivery', 'food delivery', 'zomato', 'swiggy'] },
      { category: 'Shopping & Fashion', icon: '💳', keywords: ['credit card', 'payment', 'card', 'online payment', 'transaction'] },
      { category: 'Shopping & Fashion', icon: '👗', keywords: ['dress', 'clothing', 'fashion', 'womens wear', 'girls'] },
      { category: 'Shopping & Fashion', icon: '👠', keywords: ['heels', 'shoes', 'high heels', 'footwear', 'ladies'] },
      { category: 'Shopping & Fashion', icon: '👜', keywords: ['handbag', 'purse', 'bag', 'accessories', 'ladies bag'] },
      { category: 'Shopping & Fashion', icon: '💄', keywords: ['lipstick', 'makeup', 'cosmetics', 'beauty', 'girls'] },
      { category: 'Shopping & Fashion', icon: '👑', keywords: ['crown', 'jewelry', 'accessories', 'princess', 'luxury'] },
      { category: 'Shopping & Fashion', icon: '💍', keywords: ['ring', 'jewelry', 'engagement', 'wedding', 'accessories'] },
      { category: 'Shopping & Fashion', icon: '💅', keywords: ['nail polish', 'manicure', 'nails', 'beauty', 'salon'] },
      { category: 'Shopping & Fashion', icon: '👚', keywords: ['shirt', 'top', 'blouse', 'clothing', 'womens wear'] },
      { category: 'Shopping & Fashion', icon: '👖', keywords: ['jeans', 'pants', 'trousers', 'clothing', 'denim'] },
      { category: 'Shopping & Fashion', icon: '🧥', keywords: ['coat', 'jacket', 'outerwear', 'clothing', 'winter'] },
      { category: 'Shopping & Fashion', icon: '👒', keywords: ['hat', 'sunhat', 'accessories', 'summer', 'fashion'] },
      { category: 'Shopping & Fashion', icon: '🕶️', keywords: ['sunglasses', 'shades', 'accessories', 'fashion', 'eyewear'] },
      { category: 'Shopping & Fashion', icon: '🎀', keywords: ['ribbon', 'bow', 'gift', 'decoration', 'accessories'] },
      { category: 'Shopping & Fashion', icon: '🎁', keywords: ['gift', 'present', 'box', 'birthday', 'celebration', 'surprise'] },
      { category: 'Shopping & Fashion', icon: '👘', keywords: ['kimono', 'robe', 'clothing', 'traditional', 'fashion'] },
      { category: 'Shopping & Fashion', icon: '💎', keywords: ['diamond', 'gem', 'jewelry', 'luxury', 'precious'] },
      
      // Technology & Internet
      { category: 'Technology & Internet', icon: '📱', keywords: ['mobile', 'phone', 'smartphone', 'device', 'cellular'] },
      { category: 'Technology & Internet', icon: '💻', keywords: ['laptop', 'computer', 'pc', 'work', 'technology'] },
      { category: 'Technology & Internet', icon: '🖥️', keywords: ['desktop', 'computer', 'monitor', 'workstation', 'pc'] },
      { category: 'Technology & Internet', icon: '📡', keywords: ['wifi', 'internet', 'wireless', 'network', 'connectivity'] },
      { category: 'Technology & Internet', icon: '🌐', keywords: ['internet', 'web', 'online', 'network', 'global', 'google'] },
      { category: 'Technology & Internet', icon: '📶', keywords: ['signal', 'wifi', 'network', 'bars', 'connectivity'] },
      { category: 'Technology & Internet', icon: '⚡', keywords: ['electricity', 'power', 'energy', 'electric bill', 'fast'] },
      
      // People & Girls
      { category: 'People & Girls', icon: '👧', keywords: ['girl', 'child', 'daughter', 'young girl', 'kid'] },
      { category: 'People & Girls', icon: '👩', keywords: ['woman', 'lady', 'female', 'adult', 'person'] },
      { category: 'People & Girls', icon: '🙋‍♀️', keywords: ['woman raising hand', 'girl', 'female', 'question', 'help'] },
      { category: 'People & Girls', icon: '💁‍♀️', keywords: ['woman tipping hand', 'information', 'help', 'service', 'assistance'] },
      { category: 'People & Girls', icon: '🙆‍♀️', keywords: ['woman gesturing ok', 'yes', 'approval', 'agree', 'success'] },
      
      // Other - Generic Icons
      { category: 'Other', icon: '📦', keywords: ['other', 'misc', 'default', 'box', 'package'] },
      { category: 'Letters', icon: 'A', keywords: ['letter a', 'alphabet', 'text', 'character', 'a'] },
      { category: 'Letters', icon: 'B', keywords: ['letter b', 'alphabet', 'text', 'character', 'b'] },
      { category: 'Letters', icon: 'C', keywords: ['letter c', 'alphabet', 'text', 'character', 'c'] },
      { category: 'Letters', icon: 'D', keywords: ['letter d', 'alphabet', 'text', 'character', 'd'] },
      { category: 'Letters', icon: 'E', keywords: ['letter e', 'alphabet', 'text', 'character', 'e'] },
      { category: 'Shipping & Delivery', icon: '📦', keywords: ['package', 'box', 'parcel', 'delivery', 'shipping'] },
      { category: 'Shipping & Delivery', icon: '📮', keywords: ['postbox', 'mail', 'postal', 'mailbox'] },
      { category: 'Shipping & Delivery', icon: '📫', keywords: ['mailbox', 'mail', 'letterbox', 'postal'] },
      { category: 'Shipping & Delivery', icon: '🚚', keywords: ['truck', 'delivery', 'shipping', 'transport', 'logistics'] },
      { category: 'Shipping & Delivery', icon: '🚛', keywords: ['lorry', 'truck', 'cargo', 'freight', 'transport'] },
      { category: 'Shipping & Delivery', icon: '📬', keywords: ['mailbox', 'mail', 'letterbox', 'open mailbox'] },
      { category: 'Shipping & Delivery', icon: '📭', keywords: ['mailbox', 'empty', 'no mail', 'letterbox'] },
      { category: 'Shipping & Delivery', icon: '✉️', keywords: ['envelope', 'letter', 'mail', 'message'] },
      { category: 'Other', icon: '⭐', keywords: ['star', 'favorite', 'important', 'featured'] },
      { category: 'Other', icon: '❤️', keywords: ['love', 'heart', 'like', 'favorite'] },
      { category: 'Other', icon: '✅', keywords: ['check', 'done', 'complete', 'success'] },
      { category: 'Other', icon: '🔔', keywords: ['notification', 'bell', 'alert', 'reminder'] },
      { category: 'Other', icon: '📌', keywords: ['pin', 'important', 'mark', 'note'] },
      { category: 'Other', icon: '🔑', keywords: ['key', 'password', 'security', 'access'] },
      { category: 'Other', icon: '⚙️', keywords: ['settings', 'gear', 'config', 'options'] },
      { category: 'Other', icon: '🎯', keywords: ['target', 'goal', 'objective', 'aim'] },
      { category: 'Other', icon: '💡', keywords: ['idea', 'light', 'creative', 'solution'] },
      { category: 'Other', icon: '🔥', keywords: ['fire', 'hot', 'trending', 'important'] },
      { category: 'Other', icon: '⚡', keywords: ['fast', 'quick', 'energy', 'power'] },
      { category: 'Other', icon: '🌟', keywords: ['shine', 'special', 'highlight', 'premium'] },
      { category: 'Other', icon: '📊', keywords: ['chart', 'graph', 'analytics', 'data'] },
      { category: 'Other', icon: '📅', keywords: ['calendar', 'date', 'schedule', 'event'] },
      { category: 'Other', icon: '🔒', keywords: ['lock', 'secure', 'private', 'protected'] },
      { category: 'Other', icon: '🏆', keywords: ['trophy', 'award', 'achievement', 'winner'] },
      { category: 'Other', icon: '🎨', keywords: ['art', 'creative', 'design', 'paint'] },
      { category: 'Other', icon: '📷', keywords: ['camera', 'photo', 'picture', 'image'] },
      { category: 'Other', icon: '🌍', keywords: ['world', 'global', 'earth', 'international'] },
      { category: 'Other', icon: '⏰', keywords: ['time', 'clock', 'alarm', 'schedule'] },
      { category: 'Other', icon: '💬', keywords: ['message', 'chat', 'comment', 'talk'] },
      { category: 'Other', icon: '📧', keywords: ['email', 'mail', 'message', 'contact'] },
      { category: 'Other', icon: '🎵', keywords: ['audio', 'sound', 'music note', 'media'] },
      { category: 'Other', icon: '🔗', keywords: ['link', 'chain', 'connection', 'url'] },
      { category: 'Other', icon: '🧿', keywords: ['evil eye', 'protection', 'nazar', 'amulet', 'charm'] }
    ];
  }

  /**
   * Search icons by keyword
   */
  static searchIcons(query: string): Array<{ category: string; icon: string; keywords: string[] }> {
    if (!query || query.trim() === '') {
      return this.getAllIcons();
    }
    
    const normalized = query.trim().toLowerCase();
    return this.getAllIcons().filter(item => 
      item.keywords.some(keyword => keyword.includes(normalized)) ||
      item.category.toLowerCase().includes(normalized)
    );
  }

  /**
   * Get icons grouped by category for dropdown display
   * Returns array of groups with category name and icons
   */
  static getGroupedIcons(): Array<{ category: string; icons: Array<{ icon: string; keywords: string[] }> }> {
    const allIcons = this.getAllIcons();
    const grouped = new Map<string, Array<{ icon: string; keywords: string[] }>>();

    // Group icons by category
    allIcons.forEach(item => {
      if (!grouped.has(item.category)) {
        grouped.set(item.category, []);
      }
      grouped.get(item.category)!.push({ icon: item.icon, keywords: item.keywords });
    });

    // Convert to array and sort by category priority
    const categoryOrder = [
      'Food & Dining',
      'Transport',
      'Entertainment',
      'Shopping & Fashion',
      'Finance & Money',
      'Investment & Assets',
      'Precious Metals & Valuables',
      'Technology & Internet',
      'Health & Fitness',
      'Bills & Utilities',
      'Education',
      'People & Girls',
      'Shipping & Delivery',
      'Letters',
      'Other'
    ];

    return categoryOrder
      .filter(cat => grouped.has(cat))
      .map(cat => ({
        category: cat,
        icons: grouped.get(cat)!
      }));
  }
}

