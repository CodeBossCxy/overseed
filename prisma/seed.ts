import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ===========================================
  // CATEGORIES
  // ===========================================
  const categories = [
    { name: 'Food & Beverage', slug: 'food', displayOrder: 1 },
    { name: 'Beauty & Skincare', slug: 'beauty', displayOrder: 2 },
    { name: 'Fashion', slug: 'fashion', displayOrder: 3 },
    { name: 'Lifestyle', slug: 'lifestyle', displayOrder: 4 },
    { name: 'Tech & Gaming', slug: 'tech', displayOrder: 5 },
    { name: 'Health & Fitness', slug: 'fitness', displayOrder: 6 },
    { name: 'Travel', slug: 'travel', displayOrder: 7 },
    { name: 'Parenting & Family', slug: 'family', displayOrder: 8 },
    { name: 'Home & Decor', slug: 'home', displayOrder: 9 },
    { name: 'Finance', slug: 'finance', displayOrder: 10 },
    { name: 'Pets', slug: 'pets', displayOrder: 11 },
    { name: 'Entertainment', slug: 'entertainment', displayOrder: 12 },
  ]

  console.log('Seeding categories...')
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, displayOrder: category.displayOrder },
      create: category,
    })
  }

  // ===========================================
  // PLATFORMS
  // ===========================================
  const platforms = [
    { name: 'Instagram', slug: 'instagram' },
    { name: 'TikTok', slug: 'tiktok' },
    { name: 'YouTube', slug: 'youtube' },
    { name: 'Twitter/X', slug: 'twitter' },
    { name: 'Facebook', slug: 'facebook' },
    { name: 'Pinterest', slug: 'pinterest' },
    { name: 'Snapchat', slug: 'snapchat' },
    { name: 'LinkedIn', slug: 'linkedin' },
    { name: 'Blog', slug: 'blog' },
  ]

  console.log('Seeding platforms...')
  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: { name: platform.name },
      create: platform,
    })
  }

  // Get platform IDs for later use
  const platformMap = await prisma.platform.findMany()
  const getPlatformId = (slug: string) => platformMap.find(p => p.slug === slug)?.id || 1

  // Get category IDs for later use
  const categoryMap = await prisma.category.findMany()
  const getCategoryId = (slug: string) => categoryMap.find(c => c.slug === slug)?.id || 1

  // ===========================================
  // BRAND USERS & PROFILES
  // ===========================================
  const hashedPassword = await hash('password123', 12)

  const brandUsers = [
    {
      email: 'brand@glossybeauty.com',
      name: 'Glossy Beauty Co.',
      userType: 'BRAND' as const,
      profile: {
        companyName: 'Glossy Beauty Co.',
        description: 'Premium skincare and cosmetics brand focused on clean, sustainable beauty. We create products that make you feel confident and beautiful, inside and out.',
        websiteUrl: 'https://glossybeauty.com',
        logoUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
        industry: 'Beauty & Cosmetics',
        companySize: 'medium',
        contactName: 'Sarah Chen',
        contactEmail: 'partnerships@glossybeauty.com',
        contactPhone: '+1 (555) 123-4567',
        isVerified: true,
      },
    },
    {
      email: 'brand@techgear.io',
      name: 'TechGear Pro',
      userType: 'BRAND' as const,
      profile: {
        companyName: 'TechGear Pro',
        description: 'Innovative tech accessories and gadgets for the modern lifestyle. From wireless earbuds to smart home devices, we make technology accessible and stylish.',
        websiteUrl: 'https://techgearpro.io',
        logoUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop',
        industry: 'Technology',
        companySize: 'small',
        contactName: 'Mike Johnson',
        contactEmail: 'influencers@techgearpro.io',
        contactPhone: '+1 (555) 234-5678',
        isVerified: true,
      },
    },
    {
      email: 'brand@fitlifenutrition.com',
      name: 'FitLife Nutrition',
      userType: 'BRAND' as const,
      profile: {
        companyName: 'FitLife Nutrition',
        description: 'Plant-based supplements and protein powders for fitness enthusiasts. Clean ingredients, amazing taste, real results.',
        websiteUrl: 'https://fitlifenutrition.com',
        logoUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop',
        industry: 'Health & Wellness',
        companySize: 'startup',
        contactName: 'Alex Rivera',
        contactEmail: 'collab@fitlifenutrition.com',
        contactPhone: '+1 (555) 345-6789',
        isVerified: false,
      },
    },
    {
      email: 'brand@urbanstyle.co',
      name: 'Urban Style Collective',
      userType: 'BRAND' as const,
      profile: {
        companyName: 'Urban Style Collective',
        description: 'Contemporary streetwear and accessories for the urban explorer. Bold designs that make a statement.',
        websiteUrl: 'https://urbanstyleco.com',
        logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
        industry: 'Fashion & Apparel',
        companySize: 'small',
        contactName: 'Jordan Lee',
        contactEmail: 'creators@urbanstyleco.com',
        contactPhone: '+1 (555) 456-7890',
        isVerified: true,
      },
    },
    {
      email: 'brand@tastybites.com',
      name: 'Tasty Bites Snacks',
      userType: 'BRAND' as const,
      profile: {
        companyName: 'Tasty Bites Snacks',
        description: 'Delicious, healthy snacks made with real ingredients. Perfect for on-the-go lifestyles without compromising on taste.',
        websiteUrl: 'https://tastybites.com',
        logoUrl: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=200&h=200&fit=crop',
        industry: 'Food & Beverage',
        companySize: 'medium',
        contactName: 'Emily Wong',
        contactEmail: 'influencer@tastybites.com',
        contactPhone: '+1 (555) 567-8901',
        isVerified: true,
      },
    },
  ]

  console.log('Seeding brand users and profiles...')
  const createdBrands: any[] = []
  for (const brand of brandUsers) {
    const user = await prisma.user.upsert({
      where: { email: brand.email },
      update: {},
      create: {
        email: brand.email,
        name: brand.name,
        password: hashedPassword,
        userType: brand.userType,
        isVerified: true,
      },
    })

    const profile = await prisma.brandProfile.upsert({
      where: { userId: user.id },
      update: brand.profile,
      create: {
        userId: user.id,
        ...brand.profile,
      },
    })

    createdBrands.push({ user, profile })
  }

  // ===========================================
  // INFLUENCER USERS & PROFILES
  // ===========================================
  const influencerUsers = [
    {
      email: 'influencer@jessicawong.com',
      name: 'Jessica Wong',
      userType: 'INFLUENCER' as const,
      profile: {
        displayName: 'Jessica Wong',
        bio: 'Beauty enthusiast & skincare addict. Sharing honest reviews and tutorials to help you find your perfect routine. LA-based makeup artist with 8 years of experience.',
        locationCity: 'Los Angeles',
        locationState: 'CA',
        locationCountry: 'USA',
        primaryNiche: 'Beauty & Skincare',
        secondaryNiches: ['Fashion', 'Lifestyle'],
        languages: ['English', 'Chinese'],
        isVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      },
      socialAccounts: [
        { platformSlug: 'instagram', username: 'jessicawongbeauty', followerCount: 125000, engagementRate: 4.2 },
        { platformSlug: 'tiktok', username: 'jessicawong', followerCount: 89000, engagementRate: 6.8 },
        { platformSlug: 'youtube', username: 'JessicaWongBeauty', followerCount: 45000, engagementRate: 3.5 },
      ],
    },
    {
      email: 'influencer@mikefitness.com',
      name: 'Mike Thompson',
      userType: 'INFLUENCER' as const,
      profile: {
        displayName: 'Mike Fitness',
        bio: 'Certified personal trainer & nutrition coach. Helping you build strength and confidence. Daily workout tips and meal prep ideas!',
        locationCity: 'Miami',
        locationState: 'FL',
        locationCountry: 'USA',
        primaryNiche: 'Health & Fitness',
        secondaryNiches: ['Food & Beverage', 'Lifestyle'],
        languages: ['English', 'Spanish'],
        isVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      },
      socialAccounts: [
        { platformSlug: 'instagram', username: 'mikefitness', followerCount: 280000, engagementRate: 5.1 },
        { platformSlug: 'youtube', username: 'MikeFitnessOfficial', followerCount: 150000, engagementRate: 4.2 },
        { platformSlug: 'tiktok', username: 'mikefitness', followerCount: 320000, engagementRate: 8.5 },
      ],
    },
    {
      email: 'influencer@emmastyle.com',
      name: 'Emma Rodriguez',
      userType: 'INFLUENCER' as const,
      profile: {
        displayName: 'Emma Style',
        bio: 'Fashion blogger & sustainable style advocate. Curating looks that are both chic and conscious. Based in NYC.',
        locationCity: 'New York',
        locationState: 'NY',
        locationCountry: 'USA',
        primaryNiche: 'Fashion',
        secondaryNiches: ['Lifestyle', 'Beauty & Skincare'],
        languages: ['English'],
        isVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      },
      socialAccounts: [
        { platformSlug: 'instagram', username: 'emmastylenyc', followerCount: 95000, engagementRate: 4.8 },
        { platformSlug: 'pinterest', username: 'emmastyle', followerCount: 45000, engagementRate: 2.1 },
        { platformSlug: 'tiktok', username: 'emmastylenyc', followerCount: 62000, engagementRate: 7.2 },
      ],
    },
    {
      email: 'influencer@techwithtom.com',
      name: 'Tom Chen',
      userType: 'INFLUENCER' as const,
      profile: {
        displayName: 'Tech With Tom',
        bio: 'Tech reviewer & gadget enthusiast. Unboxing the latest tech and giving you honest opinions. Software engineer by day, content creator by night.',
        locationCity: 'San Francisco',
        locationState: 'CA',
        locationCountry: 'USA',
        primaryNiche: 'Tech & Gaming',
        secondaryNiches: ['Lifestyle'],
        languages: ['English', 'Chinese'],
        isVerified: false,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      },
      socialAccounts: [
        { platformSlug: 'youtube', username: 'TechWithTom', followerCount: 520000, engagementRate: 4.5 },
        { platformSlug: 'twitter', username: 'techwithtom', followerCount: 85000, engagementRate: 2.8 },
        { platformSlug: 'instagram', username: 'techwithtom', followerCount: 42000, engagementRate: 3.2 },
      ],
    },
    {
      email: 'influencer@foodiefiona.com',
      name: 'Fiona Park',
      userType: 'INFLUENCER' as const,
      profile: {
        displayName: 'Foodie Fiona',
        bio: 'Home chef & food photographer. Sharing easy recipes and restaurant discoveries. Korean-American fusion is my specialty!',
        locationCity: 'Seattle',
        locationState: 'WA',
        locationCountry: 'USA',
        primaryNiche: 'Food & Beverage',
        secondaryNiches: ['Lifestyle', 'Travel'],
        languages: ['English', 'Korean'],
        isVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      },
      socialAccounts: [
        { platformSlug: 'instagram', username: 'foodiefiona', followerCount: 175000, engagementRate: 5.5 },
        { platformSlug: 'tiktok', username: 'foodiefiona', followerCount: 230000, engagementRate: 9.2 },
        { platformSlug: 'youtube', username: 'FoodieFiona', followerCount: 78000, engagementRate: 4.1 },
      ],
    },
    {
      email: 'influencer@wanderlust.com',
      name: 'David Martinez',
      userType: 'INFLUENCER' as const,
      profile: {
        displayName: 'Wanderlust Dave',
        bio: 'Travel photographer & adventure seeker. 50+ countries and counting. Sharing hidden gems and travel tips for the adventurous soul.',
        locationCity: 'Austin',
        locationState: 'TX',
        locationCountry: 'USA',
        primaryNiche: 'Travel',
        secondaryNiches: ['Lifestyle', 'Tech & Gaming'],
        languages: ['English', 'Spanish', 'Portuguese'],
        isVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      },
      socialAccounts: [
        { platformSlug: 'instagram', username: 'wanderlustdave', followerCount: 340000, engagementRate: 4.9 },
        { platformSlug: 'youtube', username: 'WanderlustDave', followerCount: 180000, engagementRate: 3.8 },
        { platformSlug: 'tiktok', username: 'wanderlustdave', followerCount: 125000, engagementRate: 7.5 },
      ],
    },
  ]

  console.log('Seeding influencer users and profiles...')
  const createdInfluencers: any[] = []
  for (const influencer of influencerUsers) {
    const user = await prisma.user.upsert({
      where: { email: influencer.email },
      update: {},
      create: {
        email: influencer.email,
        name: influencer.name,
        password: hashedPassword,
        userType: influencer.userType,
        isVerified: true,
      },
    })

    const profile = await prisma.influencerProfile.upsert({
      where: { userId: user.id },
      update: influencer.profile,
      create: {
        userId: user.id,
        ...influencer.profile,
      },
    })

    // Create social accounts
    for (const account of influencer.socialAccounts) {
      await prisma.influencerSocialAccount.upsert({
        where: {
          influencerId_platformId: {
            influencerId: profile.id,
            platformId: getPlatformId(account.platformSlug),
          },
        },
        update: {
          username: account.username,
          followerCount: account.followerCount,
          engagementRate: account.engagementRate,
        },
        create: {
          influencerId: profile.id,
          platformId: getPlatformId(account.platformSlug),
          username: account.username,
          followerCount: account.followerCount,
          engagementRate: account.engagementRate,
          profileUrl: `https://${account.platformSlug}.com/${account.username}`,
        },
      })
    }

    createdInfluencers.push({ user, profile })
  }

  // ===========================================
  // CAMPAIGNS
  // ===========================================
  const campaigns = [
    {
      brandIndex: 0, // Glossy Beauty
      title: 'Summer Glow Skincare Launch',
      description: `We're launching our new Summer Glow collection and looking for beauty influencers to showcase our products!

The collection includes:
- Vitamin C Brightening Serum
- Hyaluronic Acid Moisturizer
- SPF 50 Daily Sunscreen

We're looking for authentic content creators who are passionate about skincare and can create engaging tutorials or reviews.`,
      status: 'ACTIVE' as const,
      compensationType: 'PAID_PLUS_GIFT' as const,
      paymentMin: 500,
      paymentMax: 1500,
      giftDescription: 'Full Summer Glow Collection ($250 value)',
      giftValue: 250,
      totalSlots: 10,
      filledSlots: 3,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      campaignStartDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      contentType: 'REEL' as const,
      contentGuidelines: `- Create a Get Ready With Me or skincare routine video
- Highlight at least 2 products from the collection
- Show before/after or application process
- Keep it authentic - share your genuine experience!`,
      hashtagsRequired: '#GlossyBeauty #SummerGlow #SkincareRoutine',
      mentionsRequired: '@glossybeauty',
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
        'https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=800',
      ],
      isFeatured: true,
      categorySlug: 'beauty',
      platformSlugs: ['instagram', 'tiktok'],
      followerRequirements: [
        { platformSlug: 'instagram', minFollowers: 10000, maxFollowers: 500000 },
        { platformSlug: 'tiktok', minFollowers: 5000, maxFollowers: null },
      ],
    },
    {
      brandIndex: 1, // TechGear Pro
      title: 'Wireless Earbuds Review Campaign',
      description: `Looking for tech reviewers to showcase our new AirPods Pro competitor - the TechGear Elite Buds!

Features to highlight:
- Active Noise Cancellation
- 40-hour battery life
- Spatial audio support
- IPX5 water resistance

We want honest, detailed reviews that help consumers make informed decisions.`,
      status: 'ACTIVE' as const,
      compensationType: 'PAID' as const,
      paymentMin: 800,
      paymentMax: 2000,
      giftDescription: null,
      giftValue: null,
      totalSlots: 5,
      filledSlots: 1,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      contentType: 'VIDEO' as const,
      contentGuidelines: `- Create an in-depth review video (8-15 minutes for YouTube, 60-90 seconds for TikTok)
- Cover sound quality, comfort, battery life, and ANC performance
- Compare to competitors if possible
- Be honest about pros AND cons`,
      hashtagsRequired: '#TechGearPro #EliteBuds #TechReview',
      mentionsRequired: '@techgearpro',
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      ],
      isFeatured: true,
      categorySlug: 'tech',
      platformSlugs: ['youtube', 'tiktok'],
      followerRequirements: [
        { platformSlug: 'youtube', minFollowers: 50000, maxFollowers: null },
        { platformSlug: 'tiktok', minFollowers: 20000, maxFollowers: null },
      ],
    },
    {
      brandIndex: 2, // FitLife Nutrition
      title: 'Plant Protein Challenge - 30 Days',
      description: `Join our 30-day plant protein challenge! We're looking for fitness influencers to document their journey using our new Vanilla Dream protein powder.

What we provide:
- 2 bags of Vanilla Dream Plant Protein
- Custom meal plan from our nutritionist
- Exclusive discount code for your followers

Perfect for fitness creators who want to explore plant-based nutrition!`,
      status: 'ACTIVE' as const,
      compensationType: 'GIFTED' as const,
      paymentMin: null,
      paymentMax: null,
      giftDescription: '2 bags of Vanilla Dream Plant Protein + Shaker Bottle ($120 value)',
      giftValue: 120,
      totalSlots: 15,
      filledSlots: 5,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      contentType: 'ANY' as const,
      contentGuidelines: `- Post at least 3 times during the 30-day challenge
- Share your smoothie recipes and workout routines
- Document your experience - energy levels, taste review, etc.
- Use your unique discount code in posts`,
      hashtagsRequired: '#FitLifeNutrition #PlantProtein #30DayChallenge',
      mentionsRequired: '@fitlifenutrition',
      images: [
        'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      ],
      isFeatured: false,
      categorySlug: 'fitness',
      platformSlugs: ['instagram', 'tiktok', 'youtube'],
      followerRequirements: [
        { platformSlug: 'instagram', minFollowers: 5000, maxFollowers: 200000 },
      ],
    },
    {
      brandIndex: 3, // Urban Style Collective
      title: 'Fall Streetwear Lookbook',
      description: `Create your ultimate fall streetwear lookbook featuring our new collection!

Available pieces:
- Oversized hoodies
- Cargo pants
- Graphic tees
- Accessories (caps, bags)

We're looking for fashion-forward creators who can style our pieces in unique ways.`,
      status: 'ACTIVE' as const,
      compensationType: 'PAID_PLUS_GIFT' as const,
      paymentMin: 300,
      paymentMax: 800,
      giftDescription: '$300 store credit to style your looks',
      giftValue: 300,
      totalSlots: 8,
      filledSlots: 2,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      contentType: 'IMAGE_POST' as const,
      contentGuidelines: `- Create 3-5 different outfit looks
- Mix our pieces with your own wardrobe
- Show versatility - day to night, casual to styled up
- High-quality photos preferred`,
      hashtagsRequired: '#UrbanStyleCo #StreetStyle #FallFashion',
      mentionsRequired: '@urbanstyleco',
      images: [
        'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      ],
      isFeatured: false,
      categorySlug: 'fashion',
      platformSlugs: ['instagram', 'pinterest', 'tiktok'],
      followerRequirements: [
        { platformSlug: 'instagram', minFollowers: 8000, maxFollowers: 150000 },
      ],
    },
    {
      brandIndex: 4, // Tasty Bites
      title: 'Healthy Snack Recipe Challenge',
      description: `Show us creative ways to use Tasty Bites in recipes! We're launching our new Protein Crunch Bites and want food creators to make them shine.

Flavors available:
- Peanut Butter Chocolate
- Maple Almond
- Coconut Vanilla

Get creative - smoothie bowls, desserts, snack boards, anything goes!`,
      status: 'ACTIVE' as const,
      compensationType: 'NEGOTIABLE' as const,
      paymentMin: 200,
      paymentMax: 1000,
      giftDescription: 'Full variety pack of all flavors',
      giftValue: 80,
      totalSlots: 12,
      filledSlots: 4,
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      contentType: 'REEL' as const,
      contentGuidelines: `- Create a recipe video featuring our snacks
- Can be sweet or savory - get creative!
- Show the product packaging clearly
- Include the recipe in your caption`,
      hashtagsRequired: '#TastyBites #HealthySnacking #RecipeIdeas',
      mentionsRequired: '@tastybites',
      images: [
        'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800',
      ],
      isFeatured: true,
      categorySlug: 'food',
      platformSlugs: ['instagram', 'tiktok'],
      followerRequirements: [
        { platformSlug: 'instagram', minFollowers: 3000, maxFollowers: null },
        { platformSlug: 'tiktok', minFollowers: 2000, maxFollowers: null },
      ],
    },
    {
      brandIndex: 0, // Glossy Beauty
      title: 'Holiday Gift Guide Feature',
      description: `Be featured in our official Holiday Gift Guide! We're looking for beauty influencers to create gift guide content featuring our bestsellers.

Perfect opportunity for holiday content that performs well!`,
      status: 'ACTIVE' as const,
      compensationType: 'AFFILIATE' as const,
      paymentMin: null,
      paymentMax: null,
      giftDescription: 'Holiday Beauty Bundle ($400 value)',
      giftValue: 400,
      totalSlots: 20,
      filledSlots: 8,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      contentType: 'ANY' as const,
      contentGuidelines: `- Create a gift guide featuring our products
- Can be video, carousel, or blog post
- Include your affiliate link
- 15% commission on all sales`,
      hashtagsRequired: '#GlossyBeauty #GiftGuide #HolidayBeauty',
      mentionsRequired: '@glossybeauty',
      images: [
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
      ],
      isFeatured: false,
      categorySlug: 'beauty',
      platformSlugs: ['instagram', 'youtube', 'blog'],
      followerRequirements: [
        { platformSlug: 'instagram', minFollowers: 5000, maxFollowers: null },
      ],
    },
    {
      brandIndex: 1, // TechGear Pro
      title: 'Smart Home Setup Showcase',
      description: `Show off your smart home setup featuring TechGear Pro devices! We want to see creative home office and entertainment setups.

Products available for review:
- Smart LED Strip Lights
- Wireless Charging Hub
- USB-C Dock Station`,
      status: 'DRAFT' as const,
      compensationType: 'PAID' as const,
      paymentMin: 400,
      paymentMax: 1200,
      giftDescription: null,
      giftValue: null,
      totalSlots: 6,
      filledSlots: 0,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      campaignStartDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      campaignEndDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      contentType: 'VIDEO' as const,
      contentGuidelines: `- Room tour or desk setup video
- Show products in use
- Highlight key features`,
      hashtagsRequired: '#TechGearPro #SmartHome #DeskSetup',
      mentionsRequired: '@techgearpro',
      images: [
        'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800',
      ],
      isFeatured: false,
      categorySlug: 'tech',
      platformSlugs: ['youtube', 'tiktok', 'instagram'],
      followerRequirements: [
        { platformSlug: 'youtube', minFollowers: 25000, maxFollowers: null },
      ],
    },
  ]

  console.log('Seeding campaigns...')
  const createdCampaigns: any[] = []
  for (const campaign of campaigns) {
    const brand = createdBrands[campaign.brandIndex]

    const created = await prisma.campaign.create({
      data: {
        brandId: brand.profile.id,
        title: campaign.title,
        description: campaign.description,
        status: campaign.status,
        compensationType: campaign.compensationType,
        paymentMin: campaign.paymentMin,
        paymentMax: campaign.paymentMax,
        giftDescription: campaign.giftDescription,
        giftValue: campaign.giftValue,
        totalSlots: campaign.totalSlots,
        filledSlots: campaign.filledSlots,
        deadline: campaign.deadline,
        campaignStartDate: campaign.campaignStartDate,
        campaignEndDate: campaign.campaignEndDate,
        contentType: campaign.contentType,
        contentGuidelines: campaign.contentGuidelines,
        hashtagsRequired: campaign.hashtagsRequired,
        mentionsRequired: campaign.mentionsRequired,
        images: campaign.images,
        isFeatured: campaign.isFeatured,
        viewCount: Math.floor(Math.random() * 500) + 50,
        publishedAt: campaign.status === 'ACTIVE' ? new Date() : null,
      },
    })

    // Add categories
    await prisma.campaignCategory.create({
      data: {
        campaignId: created.id,
        categoryId: getCategoryId(campaign.categorySlug),
      },
    })

    // Add platforms
    for (const platformSlug of campaign.platformSlugs) {
      await prisma.campaignPlatform.create({
        data: {
          campaignId: created.id,
          platformId: getPlatformId(platformSlug),
        },
      })
    }

    // Add follower requirements
    for (const req of campaign.followerRequirements) {
      await prisma.campaignFollowerRequirement.create({
        data: {
          campaignId: created.id,
          platformId: getPlatformId(req.platformSlug),
          minFollowers: req.minFollowers,
          maxFollowers: req.maxFollowers,
        },
      })
    }

    createdCampaigns.push(created)
  }

  // ===========================================
  // APPLICATIONS
  // ===========================================
  const applications = [
    {
      campaignIndex: 0, // Summer Glow Skincare
      influencerIndex: 0, // Jessica Wong
      status: 'APPROVED' as const,
      pitchMessage: `Hi! I'm so excited about the Summer Glow collection - I've been a fan of Glossy Beauty for years!

My audience is primarily women aged 25-35 who are passionate about skincare. I'd love to create a detailed review and tutorial showing how I incorporate these products into my morning routine.

I can deliver:
- 1 Instagram Reel (60-90 seconds)
- 1 TikTok video
- 3 Instagram Stories

Looking forward to collaborating!`,
      proposedRate: 1200,
    },
    {
      campaignIndex: 0,
      influencerIndex: 2, // Emma Style
      status: 'PENDING' as const,
      pitchMessage: `Hello Glossy Beauty team!

While fashion is my main niche, skincare is such an important part of my daily routine and content. My audience always asks about my skincare favorites!

I'd love to create content showing how great skin is the foundation of any look. Would propose a "Get Ready With Me" style video.`,
      proposedRate: 800,
    },
    {
      campaignIndex: 1, // Tech Earbuds Review
      influencerIndex: 3, // Tech With Tom
      status: 'APPROVED' as const,
      pitchMessage: `Hey TechGear team!

I've been following your brand's growth and I'm impressed with your product quality. I'd love to do an in-depth review of the Elite Buds.

My review style:
- Detailed audio quality testing
- Comparison with AirPods Pro and Sony WF-1000XM4
- Real-world usage over 2 weeks
- Honest pros and cons

My YouTube reviews consistently get 50K+ views and have helped my audience make informed purchasing decisions.`,
      proposedRate: 1800,
    },
    {
      campaignIndex: 2, // Plant Protein Challenge
      influencerIndex: 1, // Mike Fitness
      status: 'APPROVED' as const,
      pitchMessage: `This is perfect timing! I've been wanting to explore more plant-based options for my audience.

I'll document the full 30 days with:
- Weekly check-in videos
- Recipe content
- Honest feedback on taste and results

My fitness community is always looking for quality protein sources!`,
      proposedRate: null,
    },
    {
      campaignIndex: 2,
      influencerIndex: 4, // Foodie Fiona
      status: 'UNDER_REVIEW' as const,
      pitchMessage: `Hi FitLife team!

I love creating content around healthy eating and this aligns perfectly with my content style. I can create some amazing smoothie bowl and protein ball recipes using your powder.

My food content gets great engagement and I think my audience would love to see plant-based protein options!`,
      proposedRate: null,
    },
    {
      campaignIndex: 3, // Fall Streetwear
      influencerIndex: 2, // Emma Style
      status: 'APPROVED' as const,
      pitchMessage: `Love the new collection! The oversized hoodies and cargo pants are exactly my style.

I'd create a lookbook with 5 different outfits:
1. Casual coffee run
2. Night out
3. Work from home chic
4. Weekend brunch
5. Travel outfit

High-quality photos shot in NYC locations!`,
      proposedRate: 650,
    },
    {
      campaignIndex: 4, // Healthy Snack Recipe
      influencerIndex: 4, // Foodie Fiona
      status: 'APPROVED' as const,
      pitchMessage: `Tasty Bites! I already love your products - have been buying them for months!

Recipe ideas I'm thinking:
- Protein snack balls with your Peanut Butter Chocolate
- Smoothie bowl topped with Maple Almond
- No-bake cheesecake bites with Coconut Vanilla

My recipe videos consistently go viral on TikTok!`,
      proposedRate: 700,
    },
    {
      campaignIndex: 4,
      influencerIndex: 1, // Mike Fitness
      status: 'PENDING' as const,
      pitchMessage: `These look like great pre-workout snacks! I'd love to create content around healthy snacking for fitness enthusiasts.

Could do a "What I Eat in a Day" featuring your products!`,
      proposedRate: 500,
    },
    {
      campaignIndex: 5, // Holiday Gift Guide
      influencerIndex: 0, // Jessica Wong
      status: 'PENDING' as const,
      pitchMessage: `Holiday content is my favorite to create! I'd love to feature Glossy Beauty in my annual gift guide.

I'll create:
- YouTube gift guide video
- Instagram carousel with top picks
- Detailed blog post with affiliate links

My holiday content last year drove over $15K in sales for partner brands!`,
      proposedRate: null,
    },
  ]

  console.log('Seeding applications...')
  for (const app of applications) {
    const campaign = createdCampaigns[app.campaignIndex]
    const influencer = createdInfluencers[app.influencerIndex]

    // Get a social account for this influencer
    const socialAccount = await prisma.influencerSocialAccount.findFirst({
      where: { influencerId: influencer.profile.id },
    })

    await prisma.application.upsert({
      where: {
        campaignId_influencerId: {
          campaignId: campaign.id,
          influencerId: influencer.profile.id,
        },
      },
      update: {},
      create: {
        campaignId: campaign.id,
        influencerId: influencer.profile.id,
        socialAccountId: socialAccount?.id,
        status: app.status,
        pitchMessage: app.pitchMessage,
        proposedRate: app.proposedRate,
        appliedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        reviewedAt: app.status !== 'PENDING' ? new Date() : null,
        approvedAt: app.status === 'APPROVED' ? new Date() : null,
      },
    })
  }

  // ===========================================
  // SAVED CAMPAIGNS
  // ===========================================
  console.log('Seeding saved campaigns...')
  // Jessica saves some campaigns
  await prisma.savedCampaign.upsert({
    where: {
      influencerId_campaignId: {
        influencerId: createdInfluencers[0].profile.id,
        campaignId: createdCampaigns[3].id,
      },
    },
    update: {},
    create: {
      influencerId: createdInfluencers[0].profile.id,
      campaignId: createdCampaigns[3].id,
    },
  })

  // Mike saves some campaigns
  await prisma.savedCampaign.upsert({
    where: {
      influencerId_campaignId: {
        influencerId: createdInfluencers[1].profile.id,
        campaignId: createdCampaigns[0].id,
      },
    },
    update: {},
    create: {
      influencerId: createdInfluencers[1].profile.id,
      campaignId: createdCampaigns[0].id,
    },
  })

  // ===========================================
  // CHINESE TRANSLATIONS FOR CAMPAIGNS
  // ===========================================
  console.log('Seeding Chinese translations...')

  const chineseTranslations = [
    {
      campaignIndex: 0,
      title: '夏日焕肤护肤系列发布',
      description: `我们即将发布全新的夏日焕肤系列，正在寻找美妆博主来展示我们的产品！

该系列包括：
- 维生素C亮肤精华
- 玻尿酸保湿霜
- SPF 50日常防晒霜

我们正在寻找热爱护肤并能创作引人入胜的教程或测评内容的真实创作者。`,
      contentGuidelines: `- 创作一个"和我一起准备"或护肤日常视频
- 至少突出系列中的2款产品
- 展示使用前后效果或涂抹过程
- 保持真实性 - 分享您的真实体验！`,
    },
    {
      campaignIndex: 1,
      title: '无线耳机测评活动',
      description: `我们正在寻找科技测评博主来展示我们的AirPods Pro竞品 - TechGear Elite Buds！

需要突出的特点：
- 主动降噪
- 40小时续航
- 空间音频支持
- IPX5防水

我们希望看到诚实、详细的测评，帮助消费者做出明智的购买决定。`,
      contentGuidelines: `- 创作深度测评视频（YouTube 8-15分钟，TikTok 60-90秒）
- 涵盖音质、佩戴舒适度、续航和降噪性能
- 如果可能，与竞品进行比较
- 诚实地分享优缺点`,
    },
    {
      campaignIndex: 2,
      title: '植物蛋白30天挑战',
      description: `加入我们的30天植物蛋白挑战！我们正在寻找健身博主使用我们的全新香草梦幻蛋白粉来记录他们的旅程。

我们提供：
- 2袋香草梦幻植物蛋白
- 来自我们营养师的定制饮食计划
- 粉丝专属折扣码

非常适合想要探索植物性营养的健身创作者！`,
      contentGuidelines: `- 在30天挑战期间至少发布3次
- 分享您的奶昔食谱和锻炼日常
- 记录您的体验 - 精力水平、口味测评等
- 在帖子中使用您的专属折扣码`,
    },
    {
      campaignIndex: 3,
      title: '秋季街头风穿搭册',
      description: `使用我们的新系列创作您的终极秋季街头风穿搭册！

可用单品：
- 宽松卫衣
- 工装裤
- 印花T恤
- 配饰（帽子、包包）

我们正在寻找能以独特方式搭配我们单品的时尚前卫创作者。`,
      contentGuidelines: `- 创作3-5套不同的穿搭造型
- 将我们的单品与您自己的衣橱混搭
- 展示多样性 - 从日间到夜晚，从休闲到精致
- 首选高质量照片`,
    },
    {
      campaignIndex: 4,
      title: '健康零食食谱挑战',
      description: `向我们展示使用Tasty Bites制作食谱的创意方式！我们即将推出新的蛋白脆脆球，希望美食创作者让它们大放异彩。

可用口味：
- 花生酱巧克力
- 枫糖杏仁
- 椰子香草

发挥创意 - 奶昔碗、甜点、零食拼盘，任何形式都可以！`,
      contentGuidelines: `- 创作一个以我们的零食为特色的食谱视频
- 可以是甜的或咸的 - 发挥创意！
- 清晰展示产品包装
- 在标题中包含食谱`,
    },
    {
      campaignIndex: 5,
      title: '节日礼物指南特辑',
      description: `成为我们官方节日礼物指南的一员！我们正在寻找美妆博主创作以我们畅销产品为特色的礼物指南内容。

这是创作节日内容的绝佳机会，表现一定会很出色！`,
      contentGuidelines: `- 创作以我们产品为特色的礼物指南
- 可以是视频、轮播图或博客文章
- 包含您的联盟链接
- 所有销售额的15%佣金`,
    },
    {
      campaignIndex: 6,
      title: '智能家居设置展示',
      description: `展示您的智能家居设置，展示TechGear Pro设备！我们想看到创意十足的家庭办公室和娱乐设置。

可供测评的产品：
- 智能LED灯带
- 无线充电底座
- USB-C扩展坞`,
      contentGuidelines: `- 房间参观或桌面设置视频
- 展示产品使用场景
- 突出主要功能`,
    },
  ]

  for (const translation of chineseTranslations) {
    const campaign = createdCampaigns[translation.campaignIndex]
    if (!campaign) continue

    // Add title translation
    await prisma.translation.upsert({
      where: {
        entityType_entityId_fieldName_languageCode: {
          entityType: 'Campaign',
          entityId: campaign.id,
          fieldName: 'title',
          languageCode: 'zh',
        },
      },
      update: { content: translation.title },
      create: {
        entityType: 'Campaign',
        entityId: campaign.id,
        fieldName: 'title',
        languageCode: 'zh',
        content: translation.title,
        isAutoTranslated: false,
      },
    })

    // Add description translation
    await prisma.translation.upsert({
      where: {
        entityType_entityId_fieldName_languageCode: {
          entityType: 'Campaign',
          entityId: campaign.id,
          fieldName: 'description',
          languageCode: 'zh',
        },
      },
      update: { content: translation.description },
      create: {
        entityType: 'Campaign',
        entityId: campaign.id,
        fieldName: 'description',
        languageCode: 'zh',
        content: translation.description,
        isAutoTranslated: false,
      },
    })

    // Add content guidelines translation
    await prisma.translation.upsert({
      where: {
        entityType_entityId_fieldName_languageCode: {
          entityType: 'Campaign',
          entityId: campaign.id,
          fieldName: 'contentGuidelines',
          languageCode: 'zh',
        },
      },
      update: { content: translation.contentGuidelines },
      create: {
        entityType: 'Campaign',
        entityId: campaign.id,
        fieldName: 'contentGuidelines',
        languageCode: 'zh',
        content: translation.contentGuidelines,
        isAutoTranslated: false,
      },
    })
  }

  console.log('========================================')
  console.log('Database seeding completed!')
  console.log('========================================')
  console.log('')
  console.log('Test Accounts (password: password123):')
  console.log('')
  console.log('BRANDS:')
  brandUsers.forEach(b => {
    console.log(`  - ${b.email}`)
  })
  console.log('')
  console.log('INFLUENCERS:')
  influencerUsers.forEach(i => {
    console.log(`  - ${i.email}`)
  })
  console.log('')
  console.log('Chinese translations have been added for all campaigns!')
  console.log('Switch language to Chinese (中文) to see translated content.')
  console.log('')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
