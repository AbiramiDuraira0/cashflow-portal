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
  
  // Transportation
  TRANSPORT = '🚗',
  TRAVEL = '✈️',
  CAR = '🚗',
  FUEL = '⛽',
  PARKING = '🅿️',
  TAXI = '🚕',
  BUS = '🚌',
  TRAIN = '🚆',
  
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
  
  // Education
  EDUCATION = '📚',
  SCHOOL = '🎓',
  BOOKS = '📖',
  COURSES = '📝',
  
  // Finance
  SALARY = '💼',
  INCOME = '💰',
  INVESTMENT = '📈',
  SAVINGS = '💰',
  BANK = '🏦',
  
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
  
  // Insurance
  INSURANCE = '🛡️',
  HEALTH_INSURANCE = '⚕️',
  
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
    
    // Education
    'education': CategoryIcon.EDUCATION,
    'school': CategoryIcon.SCHOOL,
    'books': CategoryIcon.BOOKS,
    'courses': CategoryIcon.COURSES,
    
    // Finance
    'salary': CategoryIcon.SALARY,
    'income': CategoryIcon.INCOME,
    'investment': CategoryIcon.INVESTMENT,
    'savings': CategoryIcon.SAVINGS,
    'bank': CategoryIcon.BANK,
    
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
    
    // Insurance
    'insurance': CategoryIcon.INSURANCE,
    
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
}
