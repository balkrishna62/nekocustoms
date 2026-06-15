const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');

async function seedDatabase() {
  const pool = getPool();
  
  try {
    console.log('Starting database seeding...');
    
    // Create uploads directory if missing
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Uploads directory created successfully.');
    }
    
    // 1. Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split and filter queries
    const queries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);
      
    // Execute each query. To support drop and recreate, we can drop existing tables.
    // However, since schema.sql uses 'CREATE TABLE IF NOT EXISTS', let's drop the slideshow table manually
    // to ensure clean database transitions.
    try {
      await pool.query('DROP TABLE IF EXISTS slideshow');
      console.log('Dropped deprecated slideshow table.');
    } catch (e) {
      // Ignored if table does not exist
    }

    // Only seed if the tables don't exist or are empty. We check if 'users' table exists and has records.
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
      if (rows[0].count > 0) {
        console.log('Database already seeded. Skipping initial seeding to prevent data loss.');
        return;
      }
    } catch (e) {
      // Table doesn't exist, proceed with seeding
    }

    for (const query of queries) {
      await pool.query(query);
    }
    console.log('Tables created successfully.');

    // 2. Seed Admin User if none exists
    const defaultUsername = 'admin';
    const defaultPassword = 'admin123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [
      defaultUsername,
      hashedPassword
    ]);
    console.log('----------------------------------------');
    console.log('DEFAULT ADMIN CREATED:');
    console.log(`Username: ${defaultUsername}`);
    console.log(`Password: ${defaultPassword}`);
    console.log('Please change this password after your first login!');
    console.log('----------------------------------------');

    // 3. Seed Site Settings (English and Nepali translations)
    const defaultSettings = {
      site_name: 'Neko Customs Brokerage',
      site_name_np: 'नेको भन्सार',
      site_phone: '+977-9849898185',
      site_email: 'info@nekocustoms.com.np',
      site_whatsapp: '9779849898185',
      site_address: 'Dry Port Road, Biratnagar-18, Morang, Koshi Province, Nepal',
      site_address_np: 'सुख्खा बन्दरगाह मार्ग, विराटनगर-१८, मोरङ, कोशी प्रदेश, नेपाल',
      site_map_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.0!2d87.2688675!3d26.3811267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef9f9a65ec89a9%3A0x4a641d12f84dc11d!2sICP%20Biratnagar!5e0!3m2!1sen!2snp!4v1718378901234!5m2!1sen!2snp',
      hero_tag: 'ICD Biratnagar Dry Port Specialist',
      hero_tag_np: 'विराटनगर सुख्खा बन्दरगाह विशेषज्ञ',
      hero_title: 'Expert Custom Clearance Brokerage at Biratnagar Dry Port',
      hero_title_np: 'विराटनगर सुख्खा बन्दरगाहमा विशेषज्ञ भन्सार क्लियरेन्स एजेन्ट',
      hero_subtitle: 'Streamlining imports and exports with professional custom brokerage, tariff advisory, and hassle-free clearing & forwarding solutions at ICD Biratnagar, Nepal.',
      hero_subtitle_np: 'विराटनगर सुख्खा बन्दरगाह (ICD) मा आयात तथा निर्यात हुने मालसामानको कानुनी तथा झन्झटमुक्त भन्सार जाँचपास र ढुवानी सेवाका लागि हामीलाई सम्झनुहोस्।',
      hero_image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800',
      services_title: 'Core Services at Biratnagar ICD',
      services_title_np: 'विराटनगर सुख्खा बन्दरगाहका मुख्य सेवाहरू',
      services_subtitle: 'Providing custom clearing and forwarding agent broker support for seamless trade.',
      services_subtitle_np: 'व्यवस्थित र झन्झटमुक्त व्यापारका लागि हाम्रो भन्सार एजेन्ट र क्लियरिङ सेवाहरू।',
      srv_import_title: 'Import Custom Clearance',
      srv_import_title_np: 'आयात भन्सार जाँचपास',
      srv_import_desc: 'Full documentation, ASYCUDA World declarations, assessment assistance, duty payment clearing, and cargo release at ICD Biratnagar checkpost.',
      srv_import_desc_np: 'विराटनगर बन्दरगाहमा प्रज्ञापना पत्र भर्ने, आसिकुडा वर्ल्ड दर्ता, महशुल भुक्तानी तथा कार्गो रिलिज सम्बन्धी सम्पूर्ण कार्यहरू।',
      srv_export_title: 'Export Compliance & Brokerage',
      srv_export_title_np: 'निर्यात अनुपालन तथा एजेन्सी',
      srv_export_desc: 'Arranging commercial documentation, Certificate of Origin filings, SAFTA registrations, and fast-track custom approvals for Nepalese exports.',
      srv_export_desc_np: 'उत्पत्तिको प्रमाणपत्र (Certificate of Origin), साफ्टा (SAFTA) दर्ता र निकासीका लागि आवश्यक कागजी प्रक्रिया र स्वीकृति।',
      srv_tariff_title: 'Tariff & Duty Consultation',
      srv_tariff_title_np: 'भन्सार महशुल र दर परामर्श',
      srv_tariff_desc: 'Consulting on Harmonized System (HS) classifications, duties, VAT, agricultural reform fees, and excise requirements under the Finance Act.',
      srv_tariff_desc_np: 'नयाँ आर्थिक ऐन बमोजिम वस्तुको एचएस कोड (HS Code) वर्गीकरण, भन्सार महशुल, अन्तःशुल्क र भ्याट दर परामर्श।',
      about_story: 'Neko Customs Brokerage has been at the forefront of international trade facilitation since 2012. Headquartered at Biratnagar, Morang, we specialize in customs documentation, import/export cargo handling, and regulatory compliance clearance at the Biratnagar Dry Port. Our experienced customs agents bridge the gap between commercial businesses and the Department of Customs, delivering speed and security.',
      about_story_np: 'नेको भन्सार एजेन्ट एजेन्सी सन् २०१२ देखि अन्तर्राष्ट्रिय व्यापार सहजीकरणमा सक्रिय रहँदै आएको छ। विराटनगर, मोरङमा मुख्य कार्यालय रहेको हाम्रो संस्थाले विराटनगर सुख्खा बन्दरगाह (ICD) मा आवश्यक कागजात तयारी, आयात/निर्यात कार्गो व्यवस्थापन र कानुनी प्रक्रिया मिलाउने कार्यमा विशेषज्ञता हासिल गरेको छ। हाम्रा अनुभवी भन्सार एजेन्टहरूले व्यवसायी र भन्सार विभागबीच पुलको रूपमा काम गर्दै द्रुत र सुरक्षित सेवा प्रदान गर्दछन्।',
      about_mission: 'To provide fast, compliant, and cost-efficient custom clearance and logistics solutions through technology, transparency, and expert tariff advisory, enabling growth for local and national businesses.',
      about_mission_np: 'प्रविधि, पारदर्शिता र विज्ञ भन्सार महशुल परामर्श मार्फत स्थानीय तथा राष्ट्रिय व्यवसायको वृद्धिका लागि द्रुत, कानुनी रूपमा सुरक्षित र लागत-प्रभावी भन्सार क्लियरेन्स तथा ढुवानी समाधान प्रदान गर्नु हो।',
      about_vision: 'To be Nepal\'s most trusted, digit-oriented custom clearance agency, known for integrity, compliance, and service speed at major entry checkposts.',
      about_vision_np: 'नेपालका प्रमुख नाकाहरूमा इमान्दारिता, कानुनी पालना र सेवा गतिको लागि चिनिने सबैभन्दा विश्वसनीय र डिजिटल प्रविधि मैत्री भन्सार एजेन्ट बन्नु हो।',
      show_blog: 'true',
      show_notice: 'true',
      show_popup_notice: 'true',
      show_about: 'true',
      show_contact: 'true',
      show_gallery: 'true',
      show_reviews: 'true',
      theme_default: 'light',
      seo_meta_title: 'Custom Clearance Agent at Biratnagar Dry Port | Neko Customs',
      seo_meta_desc: 'Professional Custom Clearing Agent (broker) at Biratnagar ICD Dry Port, Morang. Specializing in import/export clearance, HS code classification, and document compliance in Nepal.',
      seo_meta_keywords: 'custom clearance agent biratnagar, customs broker nepal, icd biratnagar dry port, custom agent morang, import export nepal, customs clearing forwarding agent',
      social_facebook: 'https://facebook.com',
      social_twitter: 'https://twitter.com',
      social_instagram: 'https://instagram.com',
      social_linkedin: 'https://linkedin.com'
    };

    for (const [key, val] of Object.entries(defaultSettings)) {
      await pool.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', [key, val]);
    }
    console.log('Site settings seeded.');

    // 4. Seed Default Blogs (English and Nepali)
    const defaultBlogs = [
      {
        title: 'Complete Import Guidelines via Biratnagar ICD Dry Port',
        slug: 'import-guidelines-biratnagar-dry-port',
        excerpt: 'A comprehensive guide on documentation requirements, custom declarations, and clearances for importing goods into Nepal via Biratnagar.',
        content: `## Importing Goods via ICD Biratnagar: A Step-by-Step Compliance Guide

Biratnagar Dry Port (Integrated Check Post / Inland Container Depot) is one of Nepal's largest trade corridors. Navigating the clearance workflow successfully requires proper documentation and familiarity with Nepalese customs laws.

### Required Documentation Checklist
For clearing imported commercial consignments, you must provide:
1. **Commercial Invoice**: Detailing values, description, and payment terms.
2. **Packing List**: Detailing net/gross weight and package contents.
3. **Bill of Lading / Lorry Receipt**: Showing shipment carriage information.
4. **Certificate of Origin**: Required for SAFTA concessions.
5. **Letter of Credit (L/C)**: Valid banking document.
6. **PAN/VAT Certificate & Exim Code**: Mandatory registration in Nepal.

### Step 1: Pre-Declaration and Classification
Before the cargo arrives, we classify the goods based on the Harmonized System (HS Code).

### Step 2: Custom Declaration Entry (ASYCUDA World)
The declaration (Pragyapan Patra) is filled out digitally, uploading scanned copies of all invoices.

### Step 3: Customs Valuation and Inspection
Customs officers examine the cargo under Green, Yellow, or Red channels, verify values, and duties are paid online.`,
        category: 'Guides',
        cover_image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800',
        status: 'published',
        language: 'en'
      },
      {
        title: 'विराटनगर सुख्खा बन्दरगाहबाट आयात गर्ने पूर्ण प्रक्रिया र आवश्यक कागजातहरू',
        slug: 'import-guidelines-biratnagar-dry-port-nepali',
        excerpt: 'विराटनगर नाकाबाट व्यावसायिक रूपमा सामान आयात गर्दा आवश्यक पर्ने कागजातहरू, प्रभागनपत्र र भन्सार प्रक्रियाको विस्तृत निर्देशिका।',
        content: `## विराटनगर सुख्खा बन्दरगाह (ICD) आयात निर्देशिका: चरण-दर-चरण प्रक्रिया

विराटनगर सुख्खा बन्दरगाह नेपालको दोस्रो ठूलो व्यापारिक नाका हो, जसले भारत तथा तेस्रो मुलुकबाट हुने व्यापारलाई सहजीकरण गर्दछ। यहाँबाट व्यावसायिक आयात सहज बनाउन भन्सार ऐन र प्रक्रियाको ज्ञान आवश्यक हुन्छ।

### आवश्यक कागजातहरूको सूची
भन्सार जाँचपासका लागि निम्न कागजातहरू अनिवार्य रूपमा तयार हुनुपर्छ:
1. **व्यावसायिक बीजक (Commercial Invoice)**: मालसामानको मूल्य र विवरण खुलेको।
2. **प्याकिङ लिस्ट (Packing List)**: सामानको तौल र विवरण।
3. **बिल अफ लेडिङ / गाडी भाडा रसिद (L/R)**।
4. **उत्पत्तिको प्रमाणपत्र (Certificate of Origin)**: साफ्टा (SAFTA) सहुलियतका लागि।
5. **प्रतीतपत्र (Letter of Credit - L/C)** वा बैंकिङ भुक्तानी कागजात।
6. **इम्पोट एक्सपोर्ट कोड (EXIM Code)** र स्थायी लेखा नम्बर (PAN/VAT)।

### चरण १: एचएस कोड (HS Code) वर्गीकरण
मालसामान आउनु अगावै भन्सार महशुल दर निर्धारण गर्न हार्मोनाइज्ड प्रणाली (HS Code) अनुसार वस्तुको सही वर्गीकरण गरिन्छ।

### चरण २: आसिकुडा वर्ल्ड (ASYCUDA World) मा प्रविष्टि
एजेन्टले अनलाइन प्रणाली 'आसिकुडा' मा आयात प्रविष्टि (प्रज्ञापना पत्र) भरी आवश्यक सम्पूर्ण कागजातहरू डिजिटल रूपमा अपलोड गर्दछ।

### चरण ३: मूल्यांकन र भौतिक परीक्षण
भन्सार अधिकारीले कागजात जाँच (पहेंलो च्यानल) वा भौतिक निरीक्षण (रातो च्यानल) गरी महशुल मूल्य निर्धारण गर्दछन्। भन्सार महशुल बैंक मार्फत तिरेपछि सामान छाड्ने अनुमति (गेट पास) जारी हुन्छ।`,
        category: 'निर्देशिका',
        cover_image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800',
        status: 'published',
        language: 'np'
      }
    ];

    for (const blog of defaultBlogs) {
      await pool.query(
        'INSERT INTO blogs (title, slug, excerpt, content, category, cover_image, status, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [blog.title, blog.slug, blog.excerpt, blog.content, blog.category, blog.cover_image, blog.status, blog.language]
      );
    }
    console.log('Blogs seeded.');

    // 5. Seed Default Notices (English and Nepali)
    const defaultNotices = [
      {
        title: 'Welcome to Neko Customs Brokerage Portal',
        content: 'We are pleased to launch our customizable website. Check back for notices, port cargo operation logs, custom tariff amendments, and shipping regulations directly from the Biratnagar Custom Office.',
        type: 'regular',
        is_active: 1,
        language: 'en'
      },
      {
        title: 'नेको भन्सार एजेन्ट अनलाइन पोर्टलमा स्वागत छ',
        content: 'हामीले हाम्रो नयाँ द्विभाषी अनलाइन पोर्टल सुरु गरेका छौं। भन्सार सम्बन्धी नयाँ सूचनाहरू, बिदाका दिनहरू तथा भन्सार महशुल दर संसोधनका जानकारीका लागि यो खण्ड हेर्दै गर्नुहोला।',
        type: 'regular',
        is_active: 1,
        language: 'np'
      },
      {
        title: 'Revision of Custom Duty Rates for Industrial Raw Materials',
        content: 'Important Announcement: In accordance with the latest customs bulletin, customs duties on primary industrial raw materials have been adjusted. Importers must update their clearance documentation declarations. Please contact our main desk for detailed HS code duty lookups.',
        type: 'popup',
        is_active: 1,
        language: 'en'
      },
      {
        title: 'औद्योगिक कच्चा पदार्थको भन्सार दर संसोधन सम्बन्धी सूचना',
        content: 'मुख्य सूचना: भन्सार विभागको नयाँ परिपत्र अनुसार नेपाल आयात गरिने प्राथमिक औद्योगिक कच्चा पदार्थहरूको भन्सार महशुल दरमा परिमार्जन गरिएको छ। सबै आयातकर्ताले प्रज्ञापना पत्र भर्दा नयाँ मूल्यांकन दर लागू गर्नुपर्नेछ। विस्तृत जानकारीका लागि हाम्रो डेस्कमा सम्पर्क गर्नुहोला।',
        type: 'popup',
        is_active: 1,
        language: 'np'
      }
    ];

    for (const notice of defaultNotices) {
      await pool.query(
        'INSERT INTO notices (title, content, type, is_active, language) VALUES (?, ?, ?, ?, ?)',
        [notice.title, notice.content, notice.type, notice.is_active, notice.language]
      );
    }
    console.log('Notices seeded.');

    // 6. Seed Gallery Table (Bilingual titles/descriptions not locked to language filter since visual, but we can set captions)
    const defaultGallery = [
      {
        title: 'ICP Biratnagar Integrated Check Post',
        description: 'Primary terminal infrastructure housing scanning checkpoints and custom declaration chambers.',
        image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Inland Container Depot Warehouses',
        description: 'Safe storage bays and inspection sheds at ICD Biratnagar check gates.',
        image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Freight Clearing Agent Coordination',
        description: 'Our licensed agents auditing documentations for customs valuation verification.',
        image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'
      }
    ];

    for (const item of defaultGallery) {
      await pool.query(
        'INSERT INTO gallery (title, description, image_url) VALUES (?, ?, ?)',
        [item.title, item.description, item.image_url]
      );
    }
    console.log('Gallery seeded.');

    // 7. Seed Reviews Table (English and Nepali testimonials)
    const defaultReviews = [
      {
        name: 'Ramesh Shrestha',
        company: 'Koshi Trading House',
        rating: 5,
        review_text: 'Extremely reliable custom clearance agents! They processed our raw steel imports from India inside 24 hours of container arrival at ICP Biratnagar. Documentation compliance was absolutely transparent.',
        media_type: 'none',
        media_url: '',
        language: 'en'
      },
      {
        name: 'रामेश श्रेष्ठ',
        company: 'कोशी ट्रेडिङ हाउस',
        rating: 5,
        review_text: 'विराटनगर सुख्खा बन्दरगाहमा सामान जाँचपास गराउन यो एजेन्सी निकै भरपर्दो छ। उहाँहरूले हाम्रो कच्चा फलामको ढुवानी भारतबाट नाकामा आइपुगेको २४ घण्टाभित्रै प्रज्ञापना पत्र स्वीकृत गराई जाँचपास गराउनुभयो।',
        media_type: 'none',
        media_url: '',
        language: 'np'
      },
      {
        name: 'Sunita Adhikari',
        company: 'Koshi Agro Industries',
        rating: 5,
        review_text: 'They guided us through the complex agricultural reform fee structures and HS Code audits. The customs clearance was done professionally without hidden fees.',
        media_type: 'photo',
        media_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        language: 'en'
      },
      {
        name: 'सुनिता अधिकारी',
        company: 'कोशी एग्रो इन्डस्ट्रिज',
        rating: 5,
        review_text: 'उहाँहरूले हामीलाई जटिल कृषि सुधार शुल्क गणना र वस्तुको वर्गिकरण (HS Code Audit) मा परामर्श दिनुभयो। भन्सार एजेन्टको सेवा निकै व्यावसायिक र पारदर्शी छ।',
        media_type: 'photo',
        media_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        language: 'np'
      }
    ];

    for (const rev of defaultReviews) {
      await pool.query(
        'INSERT INTO reviews (name, company, rating, review_text, media_type, media_url, language) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [rev.name, rev.company, rev.rating, rev.review_text, rev.media_type, rev.media_url, rev.language]
      );
    }
    console.log('Reviews seeded.');

    console.log('Database seeding completed successfully.');
  } catch (err) {
    console.error('Error during database seeding:', err.message);
    throw err;
  }
}

module.exports = {
  seedDatabase
};
