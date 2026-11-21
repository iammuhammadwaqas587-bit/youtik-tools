import type { BlogPost } from './blogPosts';

const TEAM_AUTHOR = {
  name: 'YouTikTools Team',
  role: 'Editorial & Tool Research Team',
  avatar: '/blog-assets/team-avatar.svg',
};

export const SEO_BLOG_POSTS_BATCH_1: BlogPost[] = [
  // Post 1 (Sample + Batch 1 #1): Zakat Pakistan & Nisab
  {
    slug: 'how-to-calculate-zakat-in-pakistan-nisab-gold-silver-guide',
    title: 'How to Calculate Zakat in Pakistan: Complete Nisab, Gold & Silver Guide',
    seoTitle: 'Calculate Zakat in Pakistan: Nisab & Gold Guide',
    metaDescription: 'Learn how to calculate 2.5% Zakat in Pakistan using Silver (52.5 tola) or Gold (7.5 tola) Nisab, deductible debts, bank savings, and worked PKR examples.',
    excerpt: 'Calculate 2.5% annual Zakat accurately on cash, bank savings, gold, silver, and investments using Pakistan Nisab thresholds.',
    coverImage: '/blog-assets/cover-islamic.jpg',
    imageAlt: 'Minimalist geometric balance scale and Islamic arch representing Zakat Nisab calculation in Pakistan',
    author: TEAM_AUTHOR,
    publishDate: 'Oct 13, 2026',
    isoDate: '2026-10-13',
    updatedDate: 'Nov 20, 2026',
    updatedIsoDate: '2026-11-20',
    readTime: '7 min read',
    category: 'Islamic Finance',
    tags: ['Zakat Pakistan', 'Nisab Guide', 'Silver Nisab', 'Islamic Finance'],
    keywords: ['zakat calculator pakistan', 'nisab gold silver', 'how to calculate zakat', 'zakat rate 2.5 percent'],
    tools: [
      {
        path: '/zakat-calculator',
        name: 'Zakat Calculator (Pakistan & Nisab)',
        description: 'Compute 2.5% Zakat in PKR using Silver (52.5 tola) or Gold (7.5 tola) Nisab, purity-adjusted jewellery, and debts.',
      },
      {
        path: '/gold-calculator',
        name: 'Gold Rate & Jewellery Calculator',
        description: 'Convert Tola, Masha, and Gram gold weights and check 24K to 18K purity value in PKR.',
      },
      {
        path: '/wirasat-calculator',
        name: 'Wirasat Inheritance Calculator',
        description: 'Calculate Sunni Hanafi Islamic inheritance fractions and PKR estate distribution shares.',
      },
    ],
    relatedSlugs: [
      'zakat-on-gold-jewellery-24k-22k-21k-18k-pakistan',
      'fitrana-sadqah-ul-fitr-and-lunar-zakat-anniversary-guide',
      'tola-masha-ratti-and-24k-22k-21k-gold-rate-pakistan',
    ],
    faqs: [
      {
        question: 'Should I use Gold Nisab or Silver Nisab in Pakistan?',
        answer: 'Most Pakistani scholars and Hanafi jurists recommend Silver Nisab (52.5 tola / 612.36 grams) whenever a person holds cash, bank savings, or mixed assets along with gold, because it lowers the threshold and benefits more poor and needy recipients. If someone owns only pure gold and zero cash or silver, some scholars allow checking Gold Nisab.',
      },
      {
        question: 'What is the exact Zakat percentage on eligible wealth?',
        answer: 'Once your net zakatable wealth meets or exceeds the Nisab threshold for one full Islamic lunar year (Hawl), the standard annual rate is 2.5 percent (one-fortieth, or total net zakatable wealth divided by 40).',
      },
      {
        question: 'Do I pay Zakat on my residential house or personal car?',
        answer: 'No. Personal necessities (Hajat-e-Asliyah) such as your primary residence, everyday clothes, household furniture, and family car used for transport are exempt from Zakat. Investment plots held for resale and rental cash savings remaining on your Zakat date are included.',
      },
      {
        question: 'Can I deduct short-term debts and monthly bills from Zakat?',
        answer: 'Yes. Immediately due liabilities such as unpaid utility bills, rent owed, personal loans due within the year, and business supplier payables may be subtracted from your gross zakatable assets before checking whether the remaining net balance reaches Nisab.',
      },
      {
        question: 'When does Zakat become obligatory during the year?',
        answer: 'Zakat becomes obligatory after one full Hijri lunar year (approximately 354 days) passes from the Islamic date your net savings first reached the Nisab threshold. Many families choose a fixed lunar date such as 1st Ramadan or 1st Muharram to audit all accounts consistently.',
      },
    ],
    content: [
      {
        body: [
          'Calculating Zakat (*Zakat*) in Pakistan takes four clear steps: add all cash, bank balances, gold, silver, and trade inventory you own on your annual Zakat date, subtract short-term debts due, compare the net balance against the Silver (52.5 tola) or Gold (7.5 tola) Nisab value (*Nisab*), and multiply by 2.5%. Because market metal prices fluctuate daily, checking exact values prevents both underpaying an obligatory pillar of Islam and miscalculating deductions.',
          'Our free [Zakat Calculator](/zakat-calculator) stores your entered per-tola prices locally in your browser, handles karat adjustments automatically, and calculates your net obligation in seconds without requiring any login or sharing private financial figures.',
        ],
      },
      {
        heading: 'What Makes a Muslim Eligible for Zakat (*Sahib-e-Nisab*)',
        body: [
          'In Islamic jurisprudence (*Fiqh*), Zakat is not charged on every rupee a person touches. Instead, four foundational conditions apply before the obligation (*Farz*) takes effect: you are a free, sane, adult Muslim; you hold full ownership (*Milk-e-Tam*) over productive or surplus wealth; that surplus wealth equals or exceeds the Nisab minimum; and one complete lunar year (*Hawl* / *Saal*) has elapsed on your wealth.',
          'Personal living essentials—known as *Hajat-e-Asliyah*—are never taxed under Zakat. Your family home, daily clothes, kitchen appliances, laptop used for work, and primary vehicle are excluded from calculation. Surplus money saved in a checking or profit-and-loss account, prize bonds, foreign currency held at home, and business goods held for sale (*Maal-e-Tijarat*) all count toward your zakatable pool.',
        ],
        subsections: [
          {
            subheading: 'Understanding Productive vs. Exempt Wealth',
            body: [
              'A helpful way to audit your finances on your annual Zakat date (*Youm-e-Zakat*) is to divide everything into personal-use items versus surplus or appreciating items. If you own a flat where you live, it is exempt; if you own a second plot bought specifically to resell at a profit, its current market resale value on your Zakat day enters the calculation.',
              'Similarly, if you rent out a second property, you do not pay 2.5% Zakat on the building’s market price. Rather, whatever net rental income remains unspent in your bank or wallet on your annual Zakat date gets added to your cash total.',
            ],
          },
        ],
      },
      {
        heading: 'Silver Nisab vs. Gold Nisab in Pakistan',
        body: [
          'Nisab is the minimum threshold established by the Prophet (peace be upon him) separating those who receive Zakat from those who give it. Traditionally, there are two benchmarks measured in classic weights: 7.5 *tola* (87.48 grams) of gold or 52.5 *tola* (612.36 grams) of silver, using the standard South Asian conversion where 1 tola equals exactly 11.664 grams.',
          'In modern markets, silver trades far lower than gold per tola, creating a wide gap between the two Nisab figures in Pakistani Rupees. This difference raises a frequent question across households in Karachi, Lahore, Islamabad, and Peshawar: which benchmark should a typical earner follow?',
        ],
        subsections: [
          {
            subheading: 'Why Pakistani Scholars Recommend the Silver Threshold',
            body: [
              'Under Hanafi rulings widely taught across Pakistani religious institutions (*Dar-ul-Ifta*), whenever a person owns mixed assets—for instance, some cash plus small gold jewellery, or cash and bank savings alone—the Silver Nisab (*Chandi ka Nisab*, 52.5 tola) applies. Choosing the lower threshold aligns with safeguarding the rights of the poor (*Anfa-ul-Fuqara*), ensuring families with modest surplus savings contribute fairly.',
              'You can enter today’s local bullion rates from your city *Sarafa* market inside the [Zakat Calculator](/zakat-calculator) or double-check weights first with the [Gold Rate Calculator](/gold-calculator). Never rely on stale rate tables from previous years, because market rates shift weekly.',
            ],
          },
        ],
      },
      {
        heading: 'Step-by-Step Asset Valuation and Deductible Debts',
        body: [
          'Gather a notepad or open the [Zakat Calculator](/zakat-calculator) and record current values on your chosen Islamic date. Consistency matters: do not estimate rough amounts if exact figures are easy to verify in your banking app or jewellery receipts.',
        ],
        subsections: [
          {
            subheading: '1. Cash, Bank Accounts, and Foreign Currency',
            body: [
              'List cash kept in cupboards, current accounts, savings accounts, digital wallets (Easypaisa, JazzCash, SadaPay, NayaPay), and fixed deposits at their balance on your Zakat anniversary. Convert USD, GBP, SAR, or AED savings into PKR at the prevailing open-market or interbank buying rate on that same day. Salaries received and already spent on rent or groceries before your Zakat day are not counted.',
            ],
          },
          {
            subheading: '2. Gold, Silver, Investments, and Business Stock',
            body: [
              'Weigh all gold and silver items you personally own (learn more in our [gold jewellery Zakat guide](/blog/zakat-on-gold-jewellery-24k-22k-21k-18k-pakistan)). Include prize bonds at face value, mutual funds, National Savings certificates, and publicly traded shares (for long-term dividends vs short-term stock trading, scholars calculate either full market share value or underlying zakatable company assets—verify your approach with a scholar).',
              'For active retail shops, wholesalers, or e-commerce warehouses, count closing saleable inventory (*Maal-e-Tijarat*) at current wholesale or selling valuation on your Zakat anniversary. Permanent business fixtures such as display shelves, shop computers, heavy factory machinery, and delivery vans used as tools of trade remain completely exempt.',
            ],
          },
          {
            subheading: '3. Subtracting Legitimate Liabilities (*Qarz*)',
            body: [
              'Deduct debts you genuinely owe right now: unpaid credit card statements, salary advances, money borrowed from relatives due this year, unpaid utility bills, accrued employee salaries, and supplier invoices. Money lent *to* a reliable friend who intends to repay (*Qarz-e-Hasana*) still belongs to you and remains zakatable when collected or annually if easily recoverable.',
              'For long-term multi-year home or car financing, consult a trusted scholar—many Pakistani scholars advise deducting only the next 12 months of scheduled principal installments rather than the entire 15-year balance so assets are not artificially shielded.',
            ],
            example: 'Suppose on 1st Ramadan your assets are PKR 450,000 in bank savings, PKR 120,000 cash at home, and gold worth PKR 600,000 (gross total PKR 1,170,000). You owe a supplier PKR 150,000 and unpaid electricity/gas bills of PKR 20,000 (total deductions PKR 170,000). Your net zakatable wealth is 1,170,000 - 170,000 = PKR 1,000,000. Assuming current Silver Nisab (52.5 tola × market silver rate) is lower than PKR 1,000,000, your Zakat is 1,000,000 × 2.5% = PKR 25,000.',
          },
        ],
      },
      {
        heading: 'Common Mistakes to Avoid When Paying Zakat',
        body: [
          'Even well-meaning families make avoidable errors during Ramadan rushes. One frequent mistake is giving Zakat on the *purchase price* paid for gold or plots years ago instead of today’s market selling value. Another is deducting non-zakatable expenses like future wedding wishes or next year’s planned tuition fees that are not yet an existing legal debt.',
          'Also remember who is eligible to receive Zakat (*Masarif-e-Zakat*, Surah At-Tawbah 9:60). Zakat cannot be paid to your parents, grandparents, children, grandchildren, or spouse, nor to wealthy institutions without verifying *Tamleek* (direct ownership by eligible needy Muslims). Supporting deserving siblings, cousins, widows, and struggling neighbours—after quietly confirming eligibility—carries tremendous reward. If you are also organizing family affairs, reviewing our [Hanafi Wirasat guide](/blog/hanafi-wirasat-islamic-inheritance-rules-pakistan) alongside annual charity planning keeps household obligations clear.',
        ],
        tips: [
          'Pick a memorable Hijri lunar date (like 1st Ramadan or 10th Muharram) instead of a solar date so your lunar *Hawl* stays accurate—see our [Zakat lunar anniversary guide](/blog/fitrana-sadqah-ul-fitr-and-lunar-zakat-anniversary-guide).',
          'Keep a written log of any advance Zakat installments paid across the year so you can subtract them cleanly on your audit date.',
        ],
      },
      {
        heading: 'Quick Summary and Scholarly Disclaimer',
        body: [
          'Calculating Zakat accurately comes down to summing net liquid wealth, bullion, and business stock on one annual lunar date, subtracting immediate debts, verifying against today’s 52.5 tola Silver Nisab (or 7.5 tola Gold where applicable), and dividing the net figure by 40 (2.5%). Open the [Zakat Calculator](/zakat-calculator) whenever you are ready to run your own household figures privately.',
          'Note: Jurisprudential opinions vary slightly across Hanafi, Shafi, and Ahl-e-Hadith schools regarding long-term installment debts, raw land held without clear intent, and personal worn jewellery. Always consult a qualified local Mufti or Islamic scholar if your portfolio includes complex business partnerships, agricultural *Ushr*, or disputed receivables.',
        ],
      },
    ],
  },

  // Post 2 (Batch 1 #2): Zakat on Gold Jewellery
  {
    slug: 'zakat-on-gold-jewellery-24k-22k-21k-18k-pakistan',
    title: 'Zakat on Gold Jewellery (24K, 22K, 21K, 18K) Explained Clearly',
    seoTitle: 'Zakat on Gold Jewellery: 24K, 22K, 21K & 18K Math',
    metaDescription: 'How to calculate Zakat on 24K, 22K, 21K, and 18K gold jewellery in Pakistan. Learn karat purity math, stone weight deductions, and Hanafi Fiqh rules now.',
    excerpt: 'Calculate accurate Zakat on worn or stored 24K, 22K, 21K, and 18K gold sets without overpaying on alloy metals or gemstones.',
    coverImage: '/blog-assets/cover-islamic.jpg',
    imageAlt: 'Geometric balance scale representing purity valuation for 24K, 22K, 21K, and 18K gold jewellery Zakat',
    author: TEAM_AUTHOR,
    publishDate: 'Oct 15, 2026',
    isoDate: '2026-10-15',
    updatedDate: 'Nov 20, 2026',
    updatedIsoDate: '2026-11-20',
    readTime: '7 min read',
    category: 'Islamic Finance',
    tags: ['Gold Zakat', '22K Gold', 'Jewellery Purity', 'Hanafi Fiqh'],
    keywords: ['zakat on gold jewellery', '22k gold zakat calculation', '21k gold purity pakistan', 'tola gram gold zakat'],
    tools: [
      {
        path: '/zakat-calculator',
        name: 'Zakat Calculator (Pakistan & Nisab)',
        description: 'Enter jewellery weight in tola or grams with karat selection (24K, 22K, 21K, 18K) to get automatic PKR Zakat.',
      },
      {
        path: '/gold-calculator',
        name: 'Gold Rate & Jewellery Calculator',
        description: 'Convert Tola, Masha, and Ratti weights into grams and compare karat values accurately.',
      },
    ],
    relatedSlugs: [
      'how-to-calculate-zakat-in-pakistan-nisab-gold-silver-guide',
      'tola-masha-ratti-and-24k-22k-21k-gold-rate-pakistan',
      'fitrana-sadqah-ul-fitr-and-lunar-zakat-anniversary-guide',
    ],
    faqs: [
      {
        question: 'Is Zakat obligatory on worn gold jewellery in Pakistan?',
        answer: 'According to the Hanafi school of thought—which the vast majority of Pakistani scholars and Dar-ul-Iftas follow—Zakat is obligatory on all gold and silver jewellery, whether worn daily or kept locked in a bank locker, provided total wealth meets Nisab. Some other classical schools exempt modest personal-use jewellery, so check your trusted scholar if you follow a different school.',
      },
      {
        question: 'Do I pay Zakat on the making charges (gharai) I originally paid?',
        answer: 'No. When calculating Zakat, gold jewellery is valued at its actual net resale gold value on your Zakat anniversary, excluding past making charges (mazdoori/gharai) and non-gold gemstones.',
      },
      {
        question: 'How is 22K or 21K gold converted into 24K equivalent for Zakat?',
        answer: 'Multiply gross gold weight by its purity ratio: 22K equals 22/24 (91.67%), 21K equals 21/24 (87.5%), and 18K equals 18/24 (75%). Multiplying pure gold equivalent tolas by today’s 24K per-tola rate gives exact market value.',
      },
      {
        question: 'How should I handle artificial stones, pearls, or kundan sets?',
        answer: 'Gemstones, artificial beads, wax fillings, and lac inside hollow bangles are not gold or silver and are exempt from personal-use Zakat (unless held for business trade). Ask your jeweller for the estimated net gold weight (*khalis wazan*) after stone deductions.',
      },
    ],
    content: [
      {
        body: [
          'Gold jewellery Zakat is based strictly on the net pure gold weight (*khalis sona*) inside your ornaments valued at today’s 24K bullion rate—never on original purchase bills, making charges (*gharai*), or embedded stones. For example, 22K gold is 91.67% pure (22 ÷ 24), 21K is 87.5%, and 18K is 75%.',
          'Rather than multiplying decimals by hand each Ramadan, enter your weight in tolas or grams and pick the karat inside our [Zakat Calculator](/zakat-calculator), which computes pure-gold PKR value and applies 2.5% automatically.',
        ],
      },
      {
        heading: 'Why Bridal and Family Jewellery Causes Confusion',
        body: [
          'Across Pakistan, gold sets gifted during *nikah* or accumulated across decades sit in bank lockers or home safes. Many families carry printed jeweller slips showing a lump-sum bill paid ten years ago—a figure that mixes gold weight, wastage (*kaat*), craftsmanship charges (*gharai*), and older gold rates.',
          'Using that old invoice for Zakat creates two errors at once. First, gold rates change significantly over time, so old rupee receipts no longer reflect current value. Second, Zakat applies only to the actual recoverable gold content you own today, not the jeweller’s labour fee paid at the counter years ago.',
        ],
        subsections: [
          {
            subheading: 'Hanafi Ruling vs. Other Schools on Worn Ornaments',
            body: [
              'Before calculating, recognize the scholarly landscape respectfully. Under the Hanafi *madhhab* followed across Pakistan, all gold and silver—whether worn every day at weddings or stored untouched—counts toward your Nisab and Zakat whenever owned for a full lunar year (*Hawl*). Meanwhile, Shafi, Maliki, and Hanbali scholars often exempt moderate personal ornaments worn regularly, charging Zakat only on stored bullion or excessive collections.',
              'If your household follows Hanafi jurisprudence, every gram of personal gold enters your annual sheet. Read our complete [Pakistan Zakat and Nisab guide](/blog/how-to-calculate-zakat-in-pakistan-nisab-gold-silver-guide) to see how gold combines with cash and savings.',
            ],
          },
        ],
      },
      {
        heading: 'Karat Purity Math: Converting 22K, 21K, and 18K Gold',
        body: [
          'Jewellery cannot easily hold delicate shapes in soft 24K pure gold (*khalis* / 999), so Pakistani *Sarafa* markets craft sets in 22K (*bais carat*), 21K (*ikkis carat*), or 18K (*atharah carat*). Pure gold represents 24 parts out of 24. Each lower karat replaces a fixed share with harder copper or silver alloys:',
        ],
        subsections: [
          {
            subheading: 'Exact Purity Ratios Used by Jewellers',
            body: [
              '24K (Pure Bullion / Biscuit): 24 ÷ 24 = 100% pure gold. 22K (Standard Pakistani Bridal Sets): 22 ÷ 24 = 91.67% pure gold. 21K (Traditional *Tezabi* & Gulf Sets): 21 ÷ 24 = 87.50% pure gold. 18K (Diamond-mounted Rings & Watches): 18 ÷ 24 = 75.00% pure gold.',
              'Also remember how *tola*, *masha*, and *ratti* map into grams in Pakistan: 1 tola = 11.664 grams = 12 masha = 96 ratti. If your scale measures grams, our [Gold Rate Calculator](/gold-calculator) converts tolas, mashas, and grams instantly without rounding errors.',
            ],
            example: 'Suppose a family owns 4 tola of 22K bridal bangles and 2 tola of 21K rings, and today’s hypothetical sample 24K gold rate is PKR 250,000 per tola (enter your live city rate inside the tool). Pure equivalent of 4 tola 22K = 4 × (22 ÷ 24) = 3.667 pure tola = PKR 916,667. Pure equivalent of 2 tola 21K = 2 × (21 ÷ 24) = 1.75 pure tola = PKR 437,500. Combined gold value = PKR 1,354,167. At 2.5% (divide by 40), annual Zakat on this jewellery equals PKR 33,854.',
          },
        ],
      },
      {
        heading: 'Handling Gemstones, Lac, and Mixed-Ownership Jewellery',
        body: [
          'Heavy traditional sets often include pearls, zirconia stones, *polki*, *kundan* backing, or *laakh* (lac resin sealed inside hollow *kangan* bangles). Jewellers typically stamp or note *khalis sona* versus gross weight on official valuation slips.',
        ],
        subsections: [
          {
            subheading: 'Excluding Non-Gold Weight Fairly',
            body: [
              'Personal-use diamonds, emeralds, pearls, and lac have zero Zakat due unless you are a jewellery merchant holding them for trade. If a necklace weighs 50 grams on your kitchen scale but your jeweller estimates 6 grams are stones and resin, calculate Zakat strictly on the remaining 44 grams of gold.',
            ],
          },
          {
            subheading: 'Who Pays Zakat on Mehr or Gifted Jewellery?',
            body: [
              'Ownership determines responsibility. If gold was gifted unconditionally to a wife as *Haq Mahr* or bridal gift from parents, she is the sole owner (*Malik*) and Zakat falls on her—not automatically on her husband—unless he pays it on her behalf with her explicit knowledge and consent. If a wife has no separate income, she can either sell a tiny portion of gold or ask her husband or family to settle the 2.5% amount in cash.',
            ],
          },
        ],
      },
      {
        heading: 'Silver Ornaments, White Gold, and Practical Locker Audits',
        body: [
          'Do not overlook silver utensils, anklets (*payal*), rings, or gifted silverware tucked beside gold sets inside bank lockers. Under Hanafi rules, silver jewellery counts toward Zakat at its pure silver melt valuation just like gold—and even small silver items combine with gold and cash when measuring whether total household savings meet the 52.5 tola Silver Nisab.',
          'What about white gold and platinum? White gold is genuine gold alloyed with palladium, nickel, or silver and rhodium-plated for a silver sheen, so 18K white gold stays zakatable at 75% (`18 ÷ 24`) of its weight using the 24K gold rate. Pure platinum rings, however, are neither gold nor silver—personal-use platinum or standalone diamonds held strictly for personal wear (never for business trade) carry no Zakat.',
          'Before your annual Ramadan review, dedicate twenty calm minutes to pulling out jewellery pouches, matching receipts with exact gram scale weights, and checking current market *Sarafa* rates in Karachi, Lahore, or Islamabad. Keep an eye on small gold coins, nose pins, and gifted children’s *taweez* or baby bangles too: if parents gave items unconditionally to an underage child (*Na-baligh*), Hanafi jurists generally rule that Zakat does not fall upon a minor’s personal property—whereas jewellery kept merely in the mother’s trust or bought for the mother herself stays in her taxable pool. Recording your confirmed *khalis sona* (net pure gold) weights in a private family notebook means next year’s calculation takes less than five minutes inside our [Zakat Calculator](/zakat-calculator) or [Gold Rate Calculator](/gold-calculator).',
        ],
      },
      {
        heading: 'Comparing Jewellery Against the 7.5 Tola vs. 52.5 Tola Rule',
        body: [
          'What if someone owns *only* 3 tola of 22K gold jewellery and zero cash, zero silver, and zero bank savings? Under classical Hanafi texts, when a person possesses exclusively gold—not a single rupee in surplus savings or silver—scholars examine whether their pure gold reaches the 7.5 tola (87.48 g) Gold Nisab. However, the moment they also hold cash, bank balances, or silver items on their Zakat date, scholars apply the combined Silver Nisab (52.5 tola / 612.36 g) because mixing assets triggers the threshold most beneficial to the poor.',
          'Notice too that when you own gold plus cash, you convert both into PKR using today’s market selling value, add them together, deduct short-term debts, and apply 2.5%. You can verify every step side by side in our [Zakat Calculator](/zakat-calculator) or inspect tola-to-gram breakdowns in our [Gold Weight and Purity Guide](/blog/tola-masha-ratti-and-24k-22k-21k-gold-rate-pakistan).',
        ],
        tips: [
          'Once a year before Ramadan, take mixed stone sets to a trusted local jeweller for an accurate net gold weight estimate so you never guess.',
          'Always apply today’s 24K market bullion rate scaled by karat purity rather than outdated purchase invoices.',
        ],
      },
      {
        heading: 'Summary Checklist',
        body: [
          'To compute gold jewellery Zakat cleanly: confirm true ownership, weigh net gold excluding stones and lac, convert 22K/21K/18K weights to pure 24K equivalent, multiply by your local market 24K rate, add cash or investments if any, subtract due debts, and pay 2.5% if total net wealth exceeds Nisab for a lunar year.',
          'If your jewellery includes complex antique pieces, heirloom diamond settings, or ownership disputes within a joint family, seek brief guidance from a qualified local Mufti alongside running your numbers in the [Zakat Calculator](/zakat-calculator).',
        ],
      },
    ],
  },

  // Post 3 (Batch 1 #3): Hanafi Wirasat Rules
  {
    slug: 'hanafi-wirasat-islamic-inheritance-rules-pakistan',
    title: 'Hanafi Wirasat Rules in Pakistan: Fixed Shares, Heirs & Blocking Explained',
    seoTitle: 'Hanafi Wirasat Rules Pakistan: Shares & Blocking',
    metaDescription: 'Understand Sunni Hanafi Wirasat inheritance rules in Pakistan: fixed Quranic shares for spouse, parents, sons and daughters, plus Hijab blocking rules.',
    excerpt: 'Learn how Sunni Hanafi Wirasat allocates fixed shares, 2:1 residuary ratios, and Hijab blocking rules across Pakistani households.',
    coverImage: '/blog-assets/cover-islamic.jpg',
    imageAlt: 'Balanced scale illustration representing Sunni Hanafi Islamic Wirasat inheritance distribution in Pakistan',
    author: TEAM_AUTHOR,
    publishDate: 'Oct 17, 2026',
    isoDate: '2026-10-17',
    updatedDate: 'Nov 20, 2026',
    updatedIsoDate: '2026-11-20',
    readTime: '8 min read',
    category: 'Islamic Finance',
    tags: ['Wirasat Pakistan', 'Hanafi Inheritance', 'Islamic Law', 'Estate Shares'],
    keywords: ['wirasat calculator pakistan', 'hanafi inheritance rules', 'islamic share wife son daughter', 'hijab blocking wirasat'],
    tools: [
      {
        path: '/wirasat-calculator',
        name: 'Wirasat Inheritance Calculator',
        description: 'Calculate Sunni Hanafi Islamic inheritance fractions, Hijab blocking, Awl/Radd, and PKR estate shares.',
      },
      {
        path: '/zakat-calculator',
        name: 'Zakat Calculator (Pakistan & Nisab)',
        description: 'Settle any unpaid annual Zakat obligation before distributing inherited family wealth.',
      },
      {
        path: '/land-area-converter',
        name: 'Land Area Converter (Marla, Kanal, Acre)',
        description: 'Divide inherited Marla, Kanal, and Acre land parcels accurately among eligible heirs.',
      },
    ],
    relatedSlugs: [
      'wirasat-estate-deductions-funeral-debt-wasiyyat-awl-radd',
      'how-to-calculate-zakat-in-pakistan-nisab-gold-silver-guide',
      'marla-kanal-square-feet-pakistan-land-measurement-guide',
    ],
    faqs: [
      {
        question: 'What is a wife’s or husband’s share in Hanafi Wirasat?',
        answer: 'A surviving husband receives 1/2 (50%) of his late wife’s net estate if she has no children or agnatic grandchildren, and 1/4 (25%) if she has descendants. A surviving wife (or all wives collectively up to four) receives 1/4 (25%) if the husband has no descendants, and 1/8 (12.5%) if he leaves children or agnatic grandchildren.',
      },
      {
        question: 'Can a son or daughter be excluded from inheritance by verbal wishes?',
        answer: 'No. Under Islamic Shariah and Pakistani family law, fixed Quranic shares cannot be overridden by verbal favouritism, cultural custom, or pressure on daughters to "forgive" their portion before distribution. Every heir’s exact share transfers automatically at death.',
      },
      {
        question: 'When do brothers and sisters inherit in Hanafi law?',
        answer: 'Under Sunni Hanafi Wirasat, siblings are completely blocked (Hijab) whenever the deceased is survived by a son, an agnatic grandson, or the deceased’s own father. They only inherit when none of those primary male relatives survive.',
      },
      {
        question: 'Why does a son receive twice the share of a daughter in the residue?',
        answer: 'In the Quran (Surah An-Nisa 4:11), sons receive twice the share of daughters from the remaining estate alongside the financial responsibility placed upon men in Islam—providing Haq Mahr, housing, and full household maintenance (Nafaqah), whereas women retain their inheritance purely for themselves.',
      },
    ],
    content: [
      {
        body: [
          'Under Sunni Hanafi *Wirasat* (*Miras*) applied across Pakistan, estate distribution follows a strict three-tier order: first deduct burial expenses, debts, and any valid bequest (*Wasiyyat*) capped at one-third; next award fixed Quranic fractions (*Ashab al-Furud*) to spouses, parents, and daughters where applicable; and finally distribute the remainder (*Asaba*) among residuary heirs such as sons or brothers.',
          'Because missing a single blocking rule (*Hijab*) changes every heir’s fraction, you can model exact scenarios in our [Wirasat Inheritance Calculator](/wirasat-calculator), which computes Hanafi fractions, percentages, and PKR amounts immediately.',
        ],
      },
      {
        heading: 'The Three Classes of Islamic Heirs',
        body: [
          'Classical Hanafi inheritance law divides surviving blood and marital relatives into clear ranks rather than leaving estates to discretionary wills (*Will*). Understanding who sits in which group prevents family disputes over property, bank accounts, and agricultural plots.',
        ],
        subsections: [
          {
            subheading: '1. Fixed-Share Heirs (*Ashab al-Furud*)',
            body: [
              'These are twelve specific relatives—most notably husband, wife, mother, father, daughter, and in certain absence scenarios grandmothers, grandfather, and sisters—whose exact fractions (`1/2`, `1/4`, `1/8`, `2/3`, `1/3`, `1/6`) are defined directly in Surah An-Nisa.',
              'For example, a surviving mother receives `1/6` whenever the deceased left any child, agnatic grandchild, or two or more siblings; otherwise she receives `1/3`. A surviving father receives `1/6` when there is a son or grandson, `1/6` plus residue if only daughters survive, or full residue if no descendants survive.',
            ],
          },
          {
            subheading: '2. Residuary Heirs (*Asaba*)',
            body: [
              'After fixed Quranic shares are assigned, whatever balance remains goes to the nearest *Asaba* (agnatic residuary heirs). When a deceased parent leaves both sons and daughters, the sons convert the daughters into co-residuaries (*Asaba bil-Ghayr*), sharing the entire remaining estate at a strict 2:1 ratio per son to daughter.',
              'If a man leaves only one daughter (no sons), she first takes her fixed `1/2` share, and two or more daughters collectively take `2/3`; any leftover residue then passes to the father or surviving brothers.',
            ],
          },
        ],
      },
      {
        heading: 'How *Hijab* (Blocking and Reduction) Works in Real Families',
        body: [
          'Newcomers to Islamic inheritance are often surprised to see aunts, uncles, brothers, or grandparents listed with `0%` on a calculation sheet. This happens because *Hijab* (blocking) follows two clear rules: partial reduction (*Hijab Nuqsan*) and complete exclusion (*Hijab Hirman*).',
        ],
        subsections: [
          {
            subheading: 'Partial Reduction vs. Full Exclusion',
            body: [
              'In partial reduction, an heir’s presence shrinks another heir’s percentage without removing them: a child reduces a wife from `1/4` (25%) to `1/8` (12.5%), a husband from `1/2` (50%) to `1/4` (25%), and a mother from `1/3` to `1/6`.',
              'In full exclusion, closer heirs completely block more distant ones: a living son blocks grandsons, granddaughters, and all brothers and sisters; a living father blocks the paternal grandfather and all brothers and sisters; a living mother blocks both paternal and maternal grandmothers.',
            ],
            example: 'Consider a Pakistani man who passes away leaving a net estate of PKR 2,400,000, survived by his Wife, Mother, Father, 1 Son, and 1 Daughter (plus 2 full brothers). First, the Son and Father completely block the 2 full brothers (brothers get 0). Fixed shares: Wife gets 1/8 = PKR 300,000; Mother gets 1/6 = PKR 400,000; Father gets 1/6 = PKR 400,000. Total fixed shares = 1/8 + 1/6 + 1/6 = 11/24 (PKR 1,100,000). Remaining residue = 13/24 (PKR 1,300,000), divided 2:1 between Son and Daughter (3 parts total): Son receives 2/3 of 1,300,000 = PKR 866,667; Daughter receives 1/3 = PKR 433,333.',
          },
        ],
      },
      {
        heading: 'How to Handle Joint Accounts, Pensions, and Family Homes in Pakistan',
        body: [
          'Practical inheritance settlement in Pakistan rarely involves a single tidy pile of cash. Families often share joint bank accounts between a father and son, hold plots booked on installment plans, or live in one ancestral house while married siblings live elsewhere. Under Islamic law, only wealth genuinely owned by the deceased on the day of passing forms the distributable estate (*Tarka*).',
          'If a son simply helped deposit his own salary into a joint account for convenience, his verified personal deposits should be separated transparently using bank statements rather than merged blindly into the father’s estate. Conversely, money placed in a spouse’s or child’s name strictly for nominee convenience (*benami* or operational nominee under Pakistani banking practice) remains part of the deceased’s *Wirasat* unless an irrevocable completed gift (*Hiba* with actual possession *Qabza*) occurred during life.',
        ],
        subsections: [
          {
            subheading: 'Special Question: Orphaned Grandchildren Under Pakistani Law vs. Fiqh',
            body: [
              'One sensitive topic across Pakistani families is when a parent’s son or daughter passes away earlier, leaving behind orphaned grandchildren while uncles and aunts survive. Under classical Sunni Hanafi *Hijab* rules, surviving sons block orphaned grandchildren from direct *Asaba* shares. Meanwhile, Section 4 of Pakistan’s Muslim Family Laws Ordinance (1961) addresses legal succession in courts, which has sparked extensive scholarly discussion.',
              'Many Pakistani *Dar-ul-Iftas* advise grandparents in this situation to use the permitted one-third optional *Wasiyyat* (bequest) specifically in favour of orphaned grandchildren during their own lifetime so both Shariah compliance and compassionate family care are honourably fulfilled.',
            ],
          },
        ],
      },
      {
        heading: 'Fair Property & Land Division Without Cultural Pressure',
        body: [
          'In many rural and urban areas of Pakistan, families divide residential plots or farmland verbally while expecting married sisters to sign away (*dastbardari*) their Islamic share in exchange for emotional goodwill or token wedding gifts. Scholars and Pakistani courts consistently emphasize that forcing or pressuring female heirs to surrender unpaid inheritance violates Quranic commands.',
          'When estates consist of houses, commercial shops, or agricultural acreage rather than liquid cash, families should first verify exact area using our [Land Area Converter](/land-area-converter) and [Marla-to-Sq-Ft guide](/blog/marla-kanal-square-feet-pakistan-land-measurement-guide), obtain an impartial market valuation, and either transfer true proportionate fractions on land records (*Fard*) or buy out shares cleanly at fair market PKR rates.',
          'Before computing final shares, also ensure any unpaid debts, *Haq Mahr*, or valid charitable wishes are settled properly—explained step by step in our [Wirasat deductions and Awl/Radd guide](/blog/wirasat-estate-deductions-funeral-debt-wasiyyat-awl-radd). And if unpaid Zakat remained owed by the deceased, verify the estate obligations with a qualified Mufti and our [Zakat Calculator](/zakat-calculator).',
        ],
        tips: [
          'Never exclude daughters, widows, or married sisters—every rightful heir’s fraction becomes their property at the moment of death.',
          'If multiple sons and daughters inherit farmland together, convert total Kanal and Marla into exact square feet first so fractions stay transparent.',
        ],
      },
      {
        heading: 'Protecting Minor Orphans and Transparent Family Settlements',
        body: [
          'A vital ethical duty in Pakistani *Wirasat* settlements arises whenever a deceased father or mother leaves behind minor children (*Na-baligh* orphans under adulthood). Neither uncles, elder brothers, nor even widowed mothers have legal or Shariah authority to sell, gift, or waive a minor child’s fixed share for family convenience, joint business expansion, or lavish *Soyem* meals. Any guardian managing a minor’s inherited property acts strictly as a fiduciary trustee (*Wali*) obligated to preserve or grow that child’s share honestly until maturity.',
          'Similarly, keep inherited property valuations completely transparent: collect two or three written market appraisals for plots or houses, share the exact calculation sheet generated inside our [Wirasat Inheritance Calculator](/wirasat-calculator) with every brother, sister, widow, and parent, and settle agreed payouts with dated bank transfers or registered *Fard* mutations rather than informal promises.',
        ],
      },
      {
        heading: 'Summary and Legal/Scholarly Caution',
        body: [
          'Hanafi Wirasat gives spouses, parents, and children protected, predictable shares while blocking distant relatives when closer heirs survive. Run any combination of surviving heirs cleanly inside the [Wirasat Inheritance Calculator](/wirasat-calculator) to check exact fractions and rupees.',
          'Because real family estates often involve pre-deceased children (Section 4 of Pakistan’s Muslim Family Laws Ordinance vs. classical *Fiqh*), step-relatives, contested *hiba* (lifetime gifts), or *Shia (Fiqh Jafria)* rules, always verify final legal transfers and *Succession Certificates* with a qualified Mufti (*Dar-ul-Ifta*) and licensed lawyer.',
        ],
      },
    ],
  },

  // Post 4 (Batch 1 #4): Estate Deductions, Wasiyyat, Awl & Radd
  {
    slug: 'wirasat-estate-deductions-funeral-debt-wasiyyat-awl-radd',
    title: 'Wirasat Estate Deductions: Funeral, Debts, 1/3 Wasiyyat, Awl & Radd',
    seoTitle: 'Wirasat Deductions: Debts, 1/3 Wasiyyat, Awl & Radd',
    metaDescription: 'Learn the exact order of estate deductions before Islamic Wirasat in Pakistan: burial costs, debts, unpaid Haq Mahr, 1/3 Wasiyyat cap, Awl & Radd rules.',
    excerpt: 'Know what gets deducted before distributing Islamic inheritance—and how Awl, Radd, and Umariyyatayn adjust shares.',
    coverImage: '/blog-assets/cover-islamic.jpg',
    imageAlt: 'Minimalist Islamic finance scales showing pre-distribution estate deductions, Wasiyyat cap, Awl, and Radd',
    author: TEAM_AUTHOR,
    publishDate: 'Oct 19, 2026',
    isoDate: '2026-10-19',
    updatedDate: 'Nov 20, 2026',
    updatedIsoDate: '2026-11-20',
    readTime: '7 min read',
    category: 'Islamic Finance',
    tags: ['Wasiyyat', 'Awl and Radd', 'Hanafi Fiqh', 'Estate Planning'],
    keywords: ['wasiyyat one third rule', 'estate deductions islam', 'awl and radd wirasat', 'unpaid haq mahr debt'],
    tools: [
      {
        path: '/wirasat-calculator',
        name: 'Wirasat Inheritance Calculator',
        description: 'Input gross PKR estate value, funeral bills, debts, and Wasiyyat with automatic 1/3 validation, Awl & Radd.',
      },
      {
        path: '/gold-calculator',
        name: 'Gold Rate & Jewellery Calculator',
        description: 'Calculate current PKR market value of inherited 24K, 22K, or 21K gold jewellery before splitting shares.',
      },
    ],
    relatedSlugs: [
      'hanafi-wirasat-islamic-inheritance-rules-pakistan',
      'how-to-calculate-zakat-in-pakistan-nisab-gold-silver-guide',
      'how-to-verify-plot-dimensions-price-per-marla-pakistan',
    ],
    faqs: [
      {
        question: 'In what exact order are expenses subtracted from an estate?',
        answer: 'Islamic law requires four strict steps in sequence: (1) reasonable funeral and burial expenses (Tajheez-o-Takfeen), (2) settlement of all verified debts including unpaid Haq Mahr, (3) execution of valid Wasiyyat (bequests) up to one-third of the remaining balance, and (4) division of the net remainder among rightful heirs.',
      },
      {
        question: 'Can a parent leave a Wasiyyat (will) giving extra property to one son?',
        answer: 'No. Under Sunni Hanafi jurisprudence, there is no valid Wasiyyat in favour of an existing legal heir ("La wasiyyata li-warith") unless every other adult heir freely consents after the deceased’s death. A Wasiyyat up to 1/3 is normally meant for non-heirs such as charity, neighbours, or orphaned grandchildren.',
      },
      {
        question: 'What happens if a Wasiyyat exceeds one-third of the net estate?',
        answer: 'Any portion of a bequest beyond one-third of the post-debt estate is automatically invalid unless all adult heirs voluntarily agree to honour the excess from their own rightful shares after the funeral.',
      },
      {
        question: 'What do Awl and Radd mean on the Wirasat Calculator?',
        answer: 'Awl occurs when total fixed Quranic fractions add up to more than 1 (such as 13/12), so every share scales down proportionally. Radd occurs when fixed shares total less than 1 and there is no male residuary heir (Asaba), returning the surplus proportionally to non-spouse blood heirs.',
      },
    ],
    content: [
      {
        body: [
          'Before a single rupee of inheritance is distributed in Pakistan, Islamic jurisprudence requires settling three pre-distribution duties in exact order: moderate burial expenses (*Tajheez-o-Takfeen*), all outstanding personal debts (including unpaid *Haq Mahr*), and valid bequests (*Wasiyyat*) to non-heirs capped at one-third of what remains after debts.',
          'Inside our [Wirasat Inheritance Calculator](/wirasat-calculator), you can enter gross estate assets alongside funeral, debt, and bequest figures—the tool automatically warns if *Wasiyyat* breaks the one-third rule and handles advanced mathematical adjustments like *\'Awl*, *Radd*, and *Umariyyatayn*.',
        ],
      },
      {
        heading: 'The Mandatory Four-Step Distribution Order',
        body: [
          'Many family misunderstandings start because relatives jump immediately to splitting a bank balance or house before checking unpaid liabilities. Surah An-Nisa repeats several times that heirs receive their shares only *after* fulfilling any valid bequest (*Wasiyyat*) and paying off debts (*Dayn*).',
        ],
        subsections: [
          {
            subheading: 'Step 1: Burial and Funeral Expenses (*Tajheez-o-Takfeen*)',
            body: [
              'Reasonable costs for bathing (*Ghusl*), shroud (*Kafan*), grave excavation, and basic transport come first from the deceased’s own estate without extravagance. Large *Qul*, *Soyem*, or feast expenses funded by cultural expectation are not compulsory estate deductions—and must never be pulled from minor orphans’ inheritance shares.',
            ],
          },
          {
            subheading: 'Step 2: Verified Debts and Unpaid *Haq Mahr*',
            body: [
              'Next, settle every financial debt owed to individuals, banks, business partners, or tax authorities. Critically in Pakistan, if a husband never paid his wife’s promised *Haq Mahr* (dower written in the *Nikahnama*) during his lifetime, that unpaid *Mahr* becomes a senior debt owed to the widow—paid off *before* her `1/8` or `1/4` Wirasat share is even calculated!',
              'Do not guess asset prices when gold ornaments or plots are part of the estate; weigh jewellery accurately using our [Gold Rate Calculator](/gold-calculator) so debts are cleared cleanly.',
            ],
          },
          {
            subheading: 'Step 3: One-Third Bequest (*Wasiyyat*) Validation',
            body: [
              'After funeral and debts are subtracted, up to one-third (`1/3`) of the *remaining* wealth can go to a valid bequest for non-heirs—such as building a mosque water cooler, donating to an orphanage, or supporting an orphaned grandchild blocked from direct inheritance.',
              'Remember two non-negotiable guardrails: a bequest cannot exceed one-third unless every adult heir voluntarily gives informed consent afterwards, and a bequest cannot favour one statutory heir over others.',
            ],
            example: 'Gross estate = PKR 3,300,000. Funeral expenses = PKR 100,000. Verified debts + unpaid Haq Mahr = PKR 200,000. Remaining balance = PKR 3,000,000. Maximum allowed Wasiyyat = 1/3 of 3,000,000 = PKR 1,000,000. If the deceased wrote a charity Wasiyyat for PKR 600,000, it is valid in full, leaving PKR 2,400,000 net distributable estate for the heirs.',
          },
        ],
      },
      {
        heading: 'How *\'Awl*, *Radd*, and *Umariyyatayn* Adjust Shares',
        body: [
          'Even after fixing the net estate, fractional math sometimes yields sums above 100% or below 100% when specific combinations of relatives survive. Classical Hanafi scholars resolved these with three named doctrines built directly into our calculator.',
        ],
        subsections: [
          {
            subheading: '*\'Awl* (Proportional Reduction When Fractions Exceed 1)',
            body: [
              'Suppose a woman dies leaving her Husband (`1/2`), two Full Sisters (`2/3`), and Mother (`1/6`). Adding `1/2 + 2/3 + 1/6` gives `3/6 + 4/6 + 1/6 = 8/6` (133.3%), which exceeds 100%. Under *\'Awl*, the base denominator raises from 6 to 8—so the Husband gets `3/8`, the two Sisters share `4/8` (`2/8` each), and the Mother gets `1/8`, totaling `8/8 = 100%` without excluding anyone.',
            ],
          },
          {
            subheading: '*Radd* (Returning Surplus When No *Asaba* Exists)',
            body: [
              'Suppose a man dies leaving only his Wife (`1/4`) and one Daughter (`1/2`), with no sons, no father, no grandfather, and no brothers or sisters. Here `1/4 + 1/2 = 3/4`, leaving `1/4` undistributed. Under standard Hanafi *Radd*, spouses do not participate in the surplus return while blood heirs survive—so the entire remaining `1/4` returns to the Daughter, giving the Wife `1/4` (25%) and the Daughter `3/4` (75%).',
            ],
          },
          {
            subheading: '*Umariyyatayn* (Spouse + Both Parents Only)',
            body: [
              'When a married person passes away leaving only their Spouse, Father, and Mother (and zero children or multiple siblings), giving Mother a full `1/3` of the *entire* estate would give her double the Father’s share in an upward generational line. Caliph Umar (RA) ruled—and Hanafi scholars follow—that after giving the Spouse `1/2` (Husband) or `1/4` (Wife), the Mother receives `1/3` of the *remaining* estate (`1/6` total with Husband, or `1/4` total with Wife), and Father takes the remaining `2/3` of the residue.',
            ],
          },
        ],
      },
      {
        heading: 'Lifetime Gifts (*Hiba*) vs. Death-Bed Bequests (*Marz-ul-Maut*)',
        body: [
          'Families in Pakistan frequently dispute whether a house or shop signed over by an aging parent counts as an already-completed lifetime gift (*Hiba*) or remains inside the divisible estate. Under Hanafi law, a valid lifetime *Hiba* requires three essentials while the owner is still healthy: clear verbal or written declaration (*Ijab*), acceptance (*Qubool*), and genuine delivery of full possession (*Qabza*)—meaning the recipient receives real control rather than merely seeing a paper transfer kept in the parent’s own drawer.',
          'If an owner attempts to sign away properties, plots, or large bank balances during terminal illness (*Marz-ul-Maut*, a life-threatening condition resulting in death), Islamic law restricts those transfers identically to a *Wasiyyat*: they cannot favour an existing heir and remain capped at one-third unless all remaining heirs consent unconditionally after death.',
          'Think about how cleanly this prevents bitter family court cases later. Whenever an aging parent truly wishes to support a disabled sibling, widowed daughter-in-law, or loyal caregiver while healthy, registering formal property possession or handing over clear bank funds openly—while keeping all brothers and sisters informed—protects relationships. Conversely, writing secret notebooks locked inside bedside drawers instructing an executor to hand extra plots to the eldest son after death is invalid under *Hanafi Wirasat* and creates lifelong resentment among heirs.',
        ],
      },
      {
        heading: 'Real-Life Examples of Estate Verification Before Mutation',
        body: [
          'Suppose a family wants to transfer an ancestral house and shop after the father’s passing. Before visiting the revenue *Patwari* or housing society transfer desk, sit all adult heirs together in one transparent meeting. List every asset—bank balances, Prize Bonds, gold ornaments weighed in tolas, business inventory, and plots measured via the [Land Area Converter](/land-area-converter)—and offset verified receipts for burial and loans.',
          'When a deceased parent owed several years of missed Zakat and explicitly instructed in a *Wasiyyat* that unpaid Zakat be paid, Hanafi scholars explain that unpaid religious dues fall under the one-third *Wasiyyat* ceiling rather than bypassing heirs automatically. Similarly, lifetime gifts (*Hiba*) count only if formal ownership and physical possession transferred *before* death-bed illness (*Marz-ul-Maut*); gifts promised only on paper during final hospital weeks are treated as restricted *Wasiyyat* subject to the one-third cap.',
        ],
        subsections: [
          {
            subheading: 'Checklist Before Using the Calculator Results',
            body: [
              'Confirm exact living heirs on the minute of death—remember that even a family member who dies an hour *after* the deceased first inherits their share, which then passes to *their* own heirs in a second step (*Munasakha*). Verify whether any *Bequest* exceeds one-third, record every asset valuation at current market price rather than decade-old purchase rates, and avoid rushing property sales before widowed spouses and sisters review the breakdown.',
            ],
          },
        ],
      },
      {
        heading: 'Practical Summary for Pakistani Families',
        body: [
          'Documenting estate value transparently and settling funeral costs, debts, *Haq Mahr*, and *Wasiyyat* before distribution protects orphans, widows, and siblings from bitter property fights. Verify every heir’s share inside our [Wirasat Inheritance Calculator](/wirasat-calculator), and pair it with our [Hanafi Wirasat rules overview](/blog/hanafi-wirasat-islamic-inheritance-rules-pakistan) and [land measurement guide](/blog/how-to-verify-plot-dimensions-price-per-marla-pakistan) if real estate must be partitioned.',
          'Always consult a qualified local Mufti before signing formal *Fard*, mutation deeds, or bank succession releases, especially if unpaid religious vows (*Kaffarah*), joint business assets, or lifetime gifts are involved.',
        ],
      },
    ],
  },

  // Post 5 (Batch 1 #5): Fitrana & Lunar Zakat Year
  {
    slug: 'fitrana-sadqah-ul-fitr-and-lunar-zakat-anniversary-guide',
    title: 'Fitrana (Zakat al-Fitr) & Lunar Zakat Year (Hawl) Explained',
    seoTitle: 'Fitrana (Zakat al-Fitr) & Lunar Zakat Year Guide',
    metaDescription: 'Understand how Fitrana differs from annual 2.5% Zakat, how lunar Hawl shifts 11 days each solar year, and how to track your annual Zakat date cleanly.',
    excerpt: 'Know the difference between annual 2.5% Zakat and Fitrana, plus why your lunar Zakat anniversary shifts ~11 days every Gregorian year.',
    coverImage: '/blog-assets/cover-islamic.jpg',
    imageAlt: 'Islamic finance scales illustration representing annual Zakat lunar Hawl and Zakat al-Fitr obligations',
    author: TEAM_AUTHOR,
    publishDate: 'Oct 21, 2026',
    isoDate: '2026-10-21',
    updatedDate: 'Nov 20, 2026',
    updatedIsoDate: '2026-11-20',
    readTime: '6 min read',
    category: 'Islamic Finance',
    tags: ['Fitrana', 'Zakat al-Fitr', 'Hawl', 'Ramadan Charity'],
    keywords: ['fitrana vs zakat', 'zakat lunar year hawl', 'sadqah ul fitr pakistan', 'when to pay fitrana'],
    tools: [
      {
        path: '/zakat-calculator',
        name: 'Zakat Calculator (Pakistan & Nisab)',
        description: 'Calculate 2.5% annual Zakat and enter per-person Fitrana for your household in one sheet.',
      },
      {
        path: '/hijri-date-converter',
        name: 'Hijri to Gregorian Date Converter',
        description: 'Track your exact Hijri Zakat anniversary across solar years with Pakistan moon-sighting offset.',
      },
      {
        path: '/ramadan-timetable',
        name: 'Ramadan Timetable (Sehri & Iftar)',
        description: 'View complete 30-day Sehri, Iftar, and Eid countdown dates for your Pakistani city.',
      },
    ],
    relatedSlugs: [
      'how-to-calculate-zakat-in-pakistan-nisab-gold-silver-guide',
      'how-to-check-sehri-iftar-ramadan-timetable-pakistan',
      'hijri-gregorian-and-desi-bikrami-calendar-explained',
    ],
    faqs: [
      {
        question: 'What is the main difference between annual Zakat and Fitrana?',
        answer: 'Annual Zakat (2.5%) applies to net wealth held for one full Hijri year at or above Nisab. Fitrana (Zakat al-Fitr / Sadqah-ul-Fitr) is a per-person Eid obligation payable by any Muslim household holding surplus above basic daily needs on Eid morning, regardless of whether their wealth met Nisab for an entire year.',
      },
      {
        question: 'Can I calculate Zakat by following December 31 or July 1 every year?',
        answer: 'Because a solar Gregorian year has 365 days—about 11 days longer than a 354-day Islamic lunar year—paying Zakat by a fixed solar date underpays slightly over time unless you adjust proportionally (around 2.577%) or follow a fixed Hijri lunar date like 1st Ramadan or 1st Muharram.',
      },
      {
        question: 'Who must pay Fitrana on behalf of children and dependents?',
        answer: 'In the Hanafi school, the head of the household pays Fitrana for himself and his minor children, as well as any adult dependents whose Fitrana he covers with their consent. Wives and working adult children with independent assets generally settle their own Fitrana.',
      },
      {
        question: 'When should Fitrana be distributed to needy recipients?',
        answer: 'Preferably during the last days of Ramadan and strictly before the Eid al-Fitr congregational prayer, so deserving families can celebrate Eid with dignity and buy food or clothing in time.',
      },
    ],
    content: [
      {
        body: [
          'Two distinct charities converge every Ramadan in Pakistan: annual *Zakat* (2.5% of net zakatable wealth held for one Islamic lunar year) and *Fitrana* (*Zakat al-Fitr*), a flat per-person obligation paid before Eid prayer. Tracking your Zakat by a Hijri lunar date (*Hawl*) prevents falling behind by 11 days each solar year.',
          'You can compute both obligations together cleanly inside our [Zakat Calculator](/zakat-calculator) and map your exact annual Hijri date across Gregorian calendars with the [Hijri Date Converter](/hijri-date-converter).',
        ],
      },
      {
        heading: 'How Lunar *Hawl* Works vs. the Gregorian Year',
        body: [
          'In Islam, Zakat anniversaries follow the Hijri lunar calendar rather than the solar calendar used on bank statements. A standard Hijri year alternates between 29- and 30-day months, totaling 354 or 355 days—roughly 10 to 11 days shorter than the 365-day solar year.',
          'Suppose your savings first crossed the Nisab threshold on 1st Ramadan 1447 AH. Your one-year anniversary (*Hawl*) completes on 1st Ramadan 1448 AH—not 365 days later on the same English date. If you pay only once every solar anniversary without shifting earlier, roughly every 33 years an entire year of Zakat would be missed!',
        ],
        subsections: [
          {
            subheading: 'Tracking Cash Flow Without Confusion',
            body: [
              'Do you have to track a separate 12-month timer for every single salary deposit received during the year? Under practical Hanafi guidance, the answer is no. Once you hold Nisab on your annual Zakat date (*Youm-e-Zakat*), whatever extra cash and bonuses remain sitting in your account when your *next* Hijri anniversary arrives get combined into one simple snapshot.',
              'Use the [Hijri Date Converter](/hijri-date-converter) with Pakistan’s `-1` moon-sighting setting to mark your chosen Zakat anniversary on your calendar—and explore our [Ramadan Timetable](/ramadan-timetable) when scheduling your annual Ramadan checkup.',
            ],
          },
        ],
      },
      {
        heading: 'Understanding *Fitrana* (*Zakat al-Fitr*) Rules',
        body: [
          'While annual Zakat purifies accumulated surplus wealth, *Fitrana* purifies the fasting person (*Roza-dar*) from minor idle speech or shortcomings during Ramadan and provides joyful sustenance for the poor on Eid day. Every Muslim who holds surplus assets over basic living needs on Eid al-Fitr—equivalent in Hanafi law to holding Nisab value in excess property, even if cash wasn’t saved all year—pays Fitrana for himself and his dependent minor children.',
        ],
        subsections: [
          {
            subheading: 'How Religious Bodies Announce Per-Person *Fitrana* Rates',
            body: [
              'In traditional *Hadith*, *Zakat al-Fitr* is measured as half a *Sa\'* of wheat (roughly 1.6 to 2 kg depending on classical weight conversions) or one full *Sa\'* of barley, dates, or raisins (roughly 3.2 to 3.5 kg). Every Ramadan, the Ruet-e-Hilal Committee and major Pakistani *Dar-ul-Iftas* publish current official per-person PKR minimums based on local market prices for wheat (*gandum*), barley (*jau*), dates (*khajoor*), and raisins (*kishmish*).',
              'Rather than assuming last year’s PKR rate still holds—because grain and food prices change yearly—always check that year’s announcement from a verified religious body in your city and enter the updated rate into the Fitrana counter inside our [Zakat Calculator](/zakat-calculator).',
            ],
            example: 'Suppose a family of 5 in Lahore (parents and 3 minor children) calculates their obligations before Eid using that year’s officially announced per-person Fitrana rate (enter today’s verified rate inside the tool). If each member’s verified Fitrana figure is entered as F, total Fitrana = 5 × F. Meanwhile, if the parents hold PKR 800,000 in net zakatable savings and gold on 1st Ramadan, annual Zakat equals 800,000 × 2.5% = PKR 20,000. Both amounts are distributed separately or combined only toward eligible Zakat recipients.',
          },
        ],
      },
      {
        heading: 'Choosing the Right Annual Zakat Date for Salaried Earners',
        body: [
          'Salaried professionals in Karachi, Lahore, Islamabad, and overseas Pakistani workers often ask how *Hawl* works when income arrives every month rather than sitting untouched in a vault. Recording the exact Hijri date every bonus was earned would turn accounting into an exhausting puzzle. Instead, Islamic jurists endorse setting one fixed lunar date (*Youm-e-Zakat*) once your savings cross Nisab.',
          'Suppose your savings cross Silver Nisab for the first time on 15th Sha\'ban 1447 AH. Your annual Zakat audit date becomes 15th Sha\'ban every single year going forward. Whatever total net cash, gold, silver, and investments exist on 15th Sha\'ban 1448 AH are counted—even deposits received two weeks before that date—while money spent earlier on rent, utilities, or family groceries is naturally excluded. Many households simplify further by choosing 1st Ramadan or 10th Ramadan so spiritual focus and financial discipline happen together.',
        ],
      },
      {
        heading: 'Distinguishing *Fitrana* From *Fidya* and *Kaffarah*',
        body: [
          'During Ramadan, charitable appeals often mention **Fitrana**, **Fidya**, and **Kaffarah** side by side—causing honest readers to confuse their rules. Knowing which applies prevents paying the wrong amount or missing a mandatory duty:',
          '**Fitrana (*Zakat al-Fitr*)** applies once every year to every free Muslim whose household holds surplus beyond daily needs on Eid morning, regardless of age or whether they were able to fast. Even a baby born on the night before Eid has Fitrana due upon the father or guardian.',
          '**Fidya** applies only to chronically ill seniors or patients with permanent conditions who physically cannot fast now and carry no realistic expectation of recovering strength to make up missed fasts (*Qaza*) later. Each missed fast is compensated by feeding one needy person (same basic food standard as half a *Sa\'* wheat / Fitrana value per day). Someone traveling or suffering temporary fever does *not* pay Fidya—they simply keep *Qaza* fasts once healthy.',
          '**Kaffarah** is a far stricter expiation required only when an adult deliberately breaks an obligatory Ramadan fast without any valid Shariah excuse (such as illness or travel): freeing a person, or fasting 60 consecutive days without interruption, or—if genuinely unable—feeding 60 poor people per broken fast.',
        ],
      },
      {
        heading: 'Paying Advance Zakat Monthly Without Losing Track',
        body: [
          'Many Pakistani donors prefer supporting relatives’ monthly groceries, school fees, or medical prescriptions throughout the year rather than dropping one lump sum during the final week of Ramadan. Islamic jurisprudence permits paying **advance Zakat (*Ta\'jeel-uz-Zakat*)** in installments once you already hold Nisab wealth.',
          'The secret to clean recordkeeping is simple: treat your Ramadan or Muharram Zakat date as reconciliation day. Sum your exact 2.5% liability inside the [Zakat Calculator](/zakat-calculator), subtract every documented monthly Zakat installment paid across the preceding twelve lunar months, and pay whatever remaining balance is still due—or carry excess forward voluntarily as *Sadqah* or next year’s advance.',
          'Remember one crucial intention rule (*Niyyah*): you must make the internal intention of Zakat *at or before* handing cash or groceries to an eligible needy person. You cannot spend ordinary *Sadqah* or tip a household helper in January and decide later in Ramadan to retroactively convert those past gifts into mandatory Zakat. Keeping a small dedicated bank sub-account or phone note marked "Annual Zakat Distributed" ensures every rupee you count on audit day meets full Shariah integrity.',
        ],
      },
      {
        heading: 'Timing and Eligible Recipients (*Masarif*)',
        body: [
          'Paying Fitrana *early* during Ramadan helps charities buy rations before last-minute Eid rushes, while delaying past the Eid congregation (*Eidgah*) prayer reduces it to ordinary *Sadqah* rather than fulfilling *Wajib* Fitrana on time. Remember to verify recipients carefully: give to genuinely deserving poor households (*Fuqara* and *Masakeen*), widows, struggling students, or families crushed by debt (*Gharimeen*), never toward masjid construction bills or general utility infrastructure unless strict *Tamleek* rules are followed.',
          'Reviewing your [annual Zakat calculation](/blog/how-to-calculate-zakat-in-pakistan-nisab-gold-silver-guide) alongside Fitrana in the final ten nights of Ramadan ensures nothing is overlooked before the crescent of *Shawwal* appears.',
        ],
        tips: [
          'Always verify the current year’s Fitrana minimum from an authoritative local *Dar-ul-Ifta* rather than reusing figures from past years.',
          'Pay Fitrana before heading to the Eid prayer so struggling families can use it in time for Eid morning.',
        ],
      },
      {
        heading: 'Quick Summary',
        body: [
          'Keep annual 2.5% Zakat anchored to one Hijri lunar date (*Hawl*) and settle household Fitrana per person before Eid prayer. Open the [Zakat Calculator](/zakat-calculator) to check your numbers cleanly, and always consult a local Mufti for unique family cases or corporate balance-sheet questions.',
        ],
      },
    ],
  },
];
